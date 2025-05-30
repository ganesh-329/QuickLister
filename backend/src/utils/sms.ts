import twilio from 'twilio';
import { config } from '../config/env.js';

// Initialize Twilio client
const twilioClient = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

// OTP store - In production, use Redis or database
interface OTPRecord {
  otp: string;
  expires: Date;
  attempts: number;
  phone: string;
}

const otpStore = new Map<string, OTPRecord>();

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP with expiry (5 minutes)
export const storeOTP = (phone: string, otp: string): void => {
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  otpStore.set(phone, {
    otp,
    expires,
    attempts: 0,
    phone,
  });
};

// Verify OTP
export const verifyOTP = (phone: string, providedOTP: string): {
  success: boolean;
  message: string;
  attemptsLeft?: number;
} => {
  const record = otpStore.get(phone);
  
  if (!record) {
    return {
      success: false,
      message: 'OTP not found. Please request a new one.',
    };
  }

  // Check if OTP has expired
  if (new Date() > record.expires) {
    otpStore.delete(phone);
    return {
      success: false,
      message: 'OTP has expired. Please request a new one.',
    };
  }

  // Check attempts limit (max 3 attempts)
  if (record.attempts >= 3) {
    otpStore.delete(phone);
    return {
      success: false,
      message: 'Too many failed attempts. Please request a new OTP.',
    };
  }

  // Verify OTP
  if (record.otp !== providedOTP) {
    record.attempts += 1;
    const attemptsLeft = 3 - record.attempts;
    
    return {
      success: false,
      message: 'Invalid OTP. Please try again.',
      attemptsLeft,
    };
  }

  // OTP is valid, remove from store
  otpStore.delete(phone);
  return {
    success: true,
    message: 'OTP verified successfully.',
  };
};

// Send OTP via SMS
export const sendOTP = async (phone: string, otp: string): Promise<{
  success: boolean;
  message: string;
  messageId?: string;
}> => {
  try {
    // Check if phone number is in test mode
    if (config.NODE_ENV === 'development' && phone === '+919999999999') {
      console.log(`🔐 Development OTP for ${phone}: ${otp}`);
      return {
        success: true,
        message: 'OTP sent successfully (development mode)',
        messageId: 'dev-message-id',
      };
    }

    // Check if Twilio is configured
    if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN || !config.TWILIO_PHONE_NUMBER) {
      console.error('Twilio configuration missing');
      return {
        success: false,
        message: 'SMS service not configured',
      };
    }

    // Send actual SMS via Twilio
    const message = await twilioClient.messages.create({
      body: `Your Quick Lister verification code is: ${otp}. This code expires in 5 minutes. Do not share this code with anyone.`,
      from: config.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    return {
      success: true,
      message: 'OTP sent successfully',
      messageId: message.sid,
    };
  } catch (error: any) {
    console.error('SMS sending error:', error);
    
    // Handle specific Twilio errors
    if (error.code === 21608) {
      return {
        success: false,
        message: 'Invalid phone number format',
      };
    }
    
    if (error.code === 21614) {
      return {
        success: false,
        message: 'Invalid phone number',
      };
    }

    return {
      success: false,
      message: 'Failed to send OTP. Please try again.',
    };
  }
};

// Check if phone number can receive SMS (rate limiting)
const smsRateLimit = new Map<string, { lastSent: Date; count: number }>();

export const canSendSMS = (phone: string): {
  canSend: boolean;
  message?: string;
  retryAfter?: number;
} => {
  const now = new Date();
  const record = smsRateLimit.get(phone);

  if (!record) {
    // First time sending to this number
    smsRateLimit.set(phone, { lastSent: now, count: 1 });
    return { canSend: true };
  }

  const timeSinceLastSMS = now.getTime() - record.lastSent.getTime();
  const oneMinute = 60 * 1000;
  const oneHour = 60 * 60 * 1000;

  // Reset count if it's been more than an hour
  if (timeSinceLastSMS > oneHour) {
    smsRateLimit.set(phone, { lastSent: now, count: 1 });
    return { canSend: true };
  }

  // Check if user has exceeded limits
  if (record.count >= 5) {
    const retryAfter = Math.ceil((oneHour - timeSinceLastSMS) / 1000);
    return {
      canSend: false,
      message: 'Too many OTP requests. Please try again later.',
      retryAfter,
    };
  }

  // Check minimum time between SMS (1 minute)
  if (timeSinceLastSMS < oneMinute) {
    const retryAfter = Math.ceil((oneMinute - timeSinceLastSMS) / 1000);
    return {
      canSend: false,
      message: 'Please wait before requesting another OTP.',
      retryAfter,
    };
  }

  // Update count and allow
  record.count += 1;
  record.lastSent = now;
  return { canSend: true };
};

// Clean up expired OTPs (run periodically)
export const cleanupExpiredOTPs = (): void => {
  const now = new Date();
  for (const [phone, record] of otpStore.entries()) {
    if (now > record.expires) {
      otpStore.delete(phone);
    }
  }
};

// Get OTP statistics for monitoring
export const getOTPStats = () => {
  const now = new Date();
  let activeOTPs = 0;
  let expiredOTPs = 0;

  for (const record of otpStore.values()) {
    if (now > record.expires) {
      expiredOTPs++;
    } else {
      activeOTPs++;
    }
  }

  return {
    activeOTPs,
    expiredOTPs,
    totalStored: otpStore.size,
    rateLimitEntries: smsRateLimit.size,
  };
};
