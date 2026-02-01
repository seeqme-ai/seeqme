package github

import (
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/cenkalti/backoff/v4"
	"github.com/google/go-github/v62/github"
	"github.com/sirupsen/logrus"
	"golang.org/x/oauth2"
)

// GitHubClient defines the interface for GitHub operations, allowing for mocking
// and dependency injection in tests.
type GitHubClient interface {
	CreateRepo(ctx context.Context, repoName string, private bool) (string, error)
	RepoExists(ctx context.Context, repoName string) (string, error)
	DeleteRepo(ctx context.Context, repoName string) error // New method
}

// GitHubService manages GitHub API interactions and local Git operations.
type GitHubService struct {
	client *github.Client
	owner  string
	token  string
	log    *logrus.Logger
}

// NewGitHubService creates a new GitHubService instance.
// It uses an OAuth2 token for authentication with the GitHub API.
func NewGitHubService(token, owner string, log *logrus.Logger) *GitHubService {
	ctx := context.Background()
	ts := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: token})
	c := oauth2.NewClient(ctx, ts)
	return &GitHubService{
		client: github.NewClient(c),
		owner:  owner,
		token:  token,
		log:    log,
	}
}

// CreateRepo creates a new GitHub repository for the given repoName.
// If a repository with the same name already exists, its clone URL is returned.
func (s *GitHubService) CreateRepo(ctx context.Context, repoName string, private bool) (string, error) {
	authenticatedURL := fmt.Sprintf("https://%s:%s@github.com/%s/%s.git", s.owner, s.token, s.owner, repoName)
	if _, err := s.RepoExists(ctx, repoName); err == nil {
		s.log.Infof("Repo %s already exists", repoName)
		return authenticatedURL, nil
	}

	repo := &github.Repository{Name: github.String(repoName), Private: github.Bool(private)}
	_, _, err := s.client.Repositories.Create(ctx, s.owner, repo)
	if err != nil {
		// If the error is that the repo already exists, we can ignore it and return the URL.
		// This can happen in a race condition.
		if strings.Contains(err.Error(), "422") { // 422 Unprocessable Entity is returned for existing repo
			s.log.Infof("Repo %s already exists (caught from create)", repoName)
			return authenticatedURL, nil
		}
		return "", fmt.Errorf("create repo: %v", err)
	}
	s.log.Infof("Created repo %s", repoName)
	return authenticatedURL, nil
}

// RepoExists checks if a GitHub repository with the given name exists for the owner.
func (s *GitHubService) RepoExists(ctx context.Context, repoName string) (string, error) {
	repo, _, err := s.client.Repositories.Get(ctx, s.owner, repoName)
	if err != nil {
		return "", err
	}
	return *repo.CloneURL, nil
}

// DeleteRepo deletes a GitHub repository.
func (s *GitHubService) DeleteRepo(ctx context.Context, repoName string) error {
	_, err := s.client.Repositories.Delete(ctx, s.owner, repoName)
	if err != nil {
		return fmt.Errorf("delete repo %s: %v", repoName, err)
	}
	s.log.Infof("Deleted repo %s", repoName)
	return nil
}

// PushFiles performs a series of Git operations: clones a repository, copies
// static files into it, adds a Dockerfile, commits changes, and pushes them
// to the remote repository. It includes retry logic with exponential backoff
// and a conflict resolution strategy.
func (s *GitHubService) PushFiles(repoURL, repoName, srcDir, tempDir, userEmail string, onLog func(string)) error {
	logAndStream := func(msg string) {
		s.log.Info(msg)
		if onLog != nil {
			onLog(msg)
		}
	}

	// Ensure the temporary directory for Git operations exists
	if err := os.MkdirAll(tempDir, 0755); err != nil {
		return fmt.Errorf("mkdir temp: %v", err)
	}
	// Clone the repository if it doesn't already exist in the temp directory
	if _, err := os.Stat(filepath.Join(tempDir, ".git")); os.IsNotExist(err) {
		logAndStream("Cloning repository...")
		// Add a delay to mitigate race condition where repo is not yet available for cloning
		time.Sleep(5 * time.Second)
		cmd := exec.Command("git", "clone", repoURL, tempDir)
		if out, err := cmd.CombinedOutput(); err != nil {
			return fmt.Errorf("clone: %v (%s)", err, string(out))
		}
	}

	// Pull the latest changes from the remote to ensure the local clone is up-to-date.
	logAndStream("Syncing with remote...")
	if out, err := exec.Command("git", "-C", tempDir, "pull", "origin", "main").CombinedOutput(); err != nil {
		s.log.Warnf("Pull failed (may be empty): %v", err)
	} else {
		s.log.Infof("Pull output: %s", string(out))
	}

	// Copy the generated static files from srcDir into the cloned repository's tempDir.
	logAndStream("Preparing artifact files...")
	if err := copyFiles(srcDir, tempDir); err != nil {
		return fmt.Errorf("copy files: %v", err)
	}

	// Add a Dockerfile
	if err := os.WriteFile(filepath.Join(tempDir, "Dockerfile"), []byte("FROM nginx:alpine\nCOPY . /usr/share/nginx/html\nEXPOSE 80"), 0644); err != nil {
		return fmt.Errorf("write Dockerfile: %v", err)
	}

	// Add owner email file
	if userEmail != "" {
		if err := os.WriteFile(filepath.Join(tempDir, "OWNER.txt"), []byte(userEmail), 0644); err != nil {
			return fmt.Errorf("write OWNER.txt: %v", err)
		}
	}

	// Stage all changes
	logAndStream("Staging changes...")
	if out, err := exec.Command("git", "-C", tempDir, "add", ".").CombinedOutput(); err != nil {
		return fmt.Errorf("git add: %v (%s)", err, string(out))
	}

	// Check for changes
	cmd := exec.Command("git", "-C", tempDir, "status", "--porcelain")
	output, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("git status: %v", err)
	}
	if len(output) == 0 {
		logAndStream("No changes detected, repository is up to date.")
		return nil
	}

	// Commit
	logAndStream("Committing changes...")
	if out, err := exec.Command("git", "-C", tempDir, "commit", "-m", "Update generated site").CombinedOutput(); err != nil {
		s.log.Warnf("Commit failed: %v (%s)", err, string(out))
	}

	// Push with retry
	logAndStream("Pushing to production network...")
	bo := backoff.NewExponentialBackOff()
	bo.MaxElapsedTime = 5 * time.Minute
	return backoff.Retry(func() error {
		// Increase buffer size for large pushes
		exec.Command("git", "config", "http.postBuffer", "52428800").Run()

		cmd := exec.Command("git", "-C", tempDir, "push", "origin", "main")
		output, err := cmd.CombinedOutput()
		if err == nil {
			logAndStream("Push successful!")
			return nil
		}

		if strings.Contains(string(output), "rejected") || strings.Contains(string(output), "non-fast-forward") {
			logAndStream("Conflicting changes detected, resolving...")
			if err := resolveConflicts(tempDir); err != nil {
				return backoff.Permanent(fmt.Errorf("resolve conflicts: %v", err))
			}
			return fmt.Errorf("retry after conflict resolution")
		}

		// Allow retry for general network errors (like Connection Reset)
		return fmt.Errorf("push error: %s", output)
	}, bo)
}

// resolveConflicts handles Git conflicts by preferring the local changes
// (i.e., the newly generated site files) over remote changes.
// This is suitable for generated content where the latest local version is authoritative.
func resolveConflicts(tempDir string) error {
	// Pull with merge strategy (ours = local files take precedence).
	// This discards remote changes that conflict with local ones.
	cmd := exec.Command("git", "-C", tempDir, "pull", "origin", "main", "--strategy-option=ours")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("pull with merge: %v", err)
	}
	return nil
}

// copyFiles recursively copies files from a source directory to a destination directory.
func copyFiles(srcDir, dstDir string) error {
	return filepath.Walk(srcDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// Skip directories, as we only care about copying files.
		if info.IsDir() {
			return nil
		}
		// Determine the relative path of the file from the source directory.
		relPath, _ := filepath.Rel(srcDir, path)
		// Construct the full destination path for the file.
		dest := filepath.Join(dstDir, relPath)
		// Ensure the destination directory structure exists.
		if err := os.MkdirAll(filepath.Dir(dest), 0755); err != nil {
			return err
		}
		// Open source and create destination files, then copy content.
		srcFile, _ := os.Open(path)
		defer srcFile.Close()
		destFile, _ := os.Create(dest)
		defer destFile.Close()
		_, err = io.Copy(destFile, srcFile)
		return err
	})
}
