import { apiService } from './apiService';

export interface LinkedInProfile {
  name: string;
  headline: string;
  location: string;
  about: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  email?: string;
  website?: string;
}

export interface Experience {
  company: string;
  position: string;
  period: string;
  description: string;
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  period: string;
}

export const linkedinService = {
  /**
   * Extract LinkedIn username from URL
   */
  extractUsername: (url: string): string | null => {
    const patterns = [
      /linkedin\.com\/in\/([^\/\?]+)/,
      /linkedin\.com\/profile\/view\?id=([^&]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  },

  /**
   * Validate LinkedIn URL
   */
  validateUrl: (url: string): boolean => {
    const username = this.extractUsername(url);
    return username !== null;
  },

  /**
   * Fetch LinkedIn profile data using backend endpoint
   */
  fetchProfile: async (url: string): Promise<LinkedInProfile> => {
    try {
      if (!this.validateUrl(url)) {
        throw new Error('Invalid LinkedIn URL');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/linkedin/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract LinkedIn profile');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('LinkedIn fetch error:', error);
      throw error;
    }
  },

  /**
   * Generate portfolio prompt from LinkedIn profile using backend
   */
  generatePromptFromProfile: async (profile: LinkedInProfile): Promise<string> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/linkedin/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to generate portfolio prompt');
      }

      const data = await response.json();
      return data.prompt;
    } catch (error: any) {
      console.error('LinkedIn prompt generation error:', error);
      throw error;
    }
  },

  /**
   * Generate comprehensive portfolio from LinkedIn URL alone
   */
  generatePortfolioFromURL: async (url: string, niche?: string, theme?: string): Promise<any> => {
    try {
      if (!this.validateUrl(url)) {
        throw new Error('Invalid LinkedIn URL');
      }

      // First, extract the profile
      const profile = await this.fetchProfile(url);
      
      // Generate portfolio prompt from profile
      const prompt = await this.generatePromptFromProfile(profile);
      
      // Use AI to generate portfolio
      const { generatePortfolio } = await import('./apiService');
      const portfolioData = await generatePortfolio(prompt, undefined, undefined, niche, theme);
      
      return {
        profile,
        portfolio: portfolioData,
      };
    } catch (error: any) {
      console.error('LinkedIn portfolio generation error:', error);
      throw error;
    }
  },
};

export default linkedinService;