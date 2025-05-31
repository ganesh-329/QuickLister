import axios from 'axios';
import { config } from '../config/env.js';
import VerificationLog from '../models/VerificationLog.js';

class DigiLockerService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly baseUrl: string;

  constructor() {
    this.clientId = config.DIGILOCKER_CLIENT_ID;
    this.clientSecret = config.DIGILOCKER_CLIENT_SECRET;
    this.redirectUri = config.DIGILOCKER_REDIRECT_URI;
    this.baseUrl = 'https://api.digitallocker.gov.in/public/oauth2/1';
  }

  /**
   * Generate OAuth URL for DigiLocker authentication
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: this.generateState(),
      scope: 'read',
    });

    return `${this.baseUrl}/authorize?${params.toString()}`;
  }

  /**
   * Generate a random state parameter for OAuth
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/token`, {
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      });

      return response.data.access_token;
    } catch (error) {
      console.error('Error getting DigiLocker access token:', error);
      throw new Error('Failed to get DigiLocker access token');
    }
  }

  /**
   * Verify Aadhaar using DigiLocker
   */
  async verifyAadhaar(accessToken: string, userId: string): Promise<boolean> {
    try {
      // Get Aadhaar details from DigiLocker
      const response = await axios.get(`${this.baseUrl}/user/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const { name, aadhaar_number } = response.data;

      // Create verification log
      await VerificationLog.create({
        userId,
        type: 'digilocker',
        status: 'completed',
        details: {
          verifiedName: name,
          aadhaarNumber: aadhaar_number,
          ipAddress: '127.0.0.1', // This will be updated by the controller
          userAgent: 'DigiLocker API', // This will be updated by the controller
        },
      });

      return true;
    } catch (error) {
      console.error('Error verifying Aadhaar:', error);
      
      // Log verification failure
      await VerificationLog.create({
        userId,
        type: 'digilocker',
        status: 'failed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          ipAddress: '127.0.0.1', // This will be updated by the controller
          userAgent: 'DigiLocker API', // This will be updated by the controller
        },
      });

      return false;
    }
  }
}

export const digiLockerService = new DigiLockerService(); 