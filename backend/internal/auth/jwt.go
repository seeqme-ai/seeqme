package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Claims defines the structure of the JWT claims.
// It now includes a slice of roles for proper authorization.
type Claims struct {
	UserID string   `json:"userId"`
	Email  string   `json:"email"`
	Roles  []string `json:"roles"`
	jwt.RegisteredClaims
}

// GenerateToken generates a new JWT token.
// It now accepts the secret key as a parameter to avoid direct environment calls.
func GenerateToken(userID, email string, roles []string, secretKey string) (string, error) {
	if secretKey == "" {
		return "", errors.New("JWT secret key is not configured")
	}

	expirationTime := time.Now().Add(24 * time.Hour) // 1 day
	claims := &Claims{
		UserID: userID,
		Email:  email,
		Roles:  roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "seeqmeai",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secretKey))
}

// ValidateToken validates the JWT token.
// It now accepts the secret key as a parameter for security and performance.
func ValidateToken(tokenString string, secretKey string) (*Claims, error) {
	if secretKey == "" {
		return nil, errors.New("JWT secret key is not configured")
	}

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Ensure the signing algorithm is what we expect.
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secretKey), nil
	})

	if err != nil {
		return nil, err // Error could be about expiry, malformed token, etc.
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}
