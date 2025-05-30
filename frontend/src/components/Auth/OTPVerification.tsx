import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerificationComplete?: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ 
  phoneNumber,
  onVerificationComplete 
}) => {
  // OTP input state
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [canResend, setCanResend] = useState(false);
  const { verifyOTP, isLoading, error } = useAuth();

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Format time remaining
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle OTP input
  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setOtp(value);
    }
  };

  // Handle verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    try {
      await verifyOTP(otp);
      onVerificationComplete?.();
    } catch (error) {
      // Error handling is managed by AuthContext
    }
  };

  // Handle resend OTP
  const handleResend = () => {
    setOtp('');
    setTimeLeft(180);
    setCanResend(false);
    // Implement resend OTP logic here
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-2">Verify Your Phone</h2>
      <p className="text-center text-gray-600 mb-6">
        Enter the 6-digit code sent to {phoneNumber}
      </p>

      <form onSubmit={handleVerify} className="space-y-6">
        {/* OTP Input */}
        <div className="space-y-2">
          <label htmlFor="otp" className="sr-only">Enter OTP</label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            value={otp}
            onChange={handleOTPChange}
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            className="w-full text-center text-2xl tracking-widest px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ letterSpacing: '0.5em' }}
          />
          {/* Timer */}
          <p className="text-center text-sm text-gray-500">
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-blue-600 hover:text-blue-500 focus:outline-none"
              >
                Resend OTP
              </button>
            ) : (
              <>Code expires in {formatTime(timeLeft)}</>
            )}
          </p>
        </div>

        {/* Verification Button */}
        <button
          type="submit"
          disabled={otp.length !== 6 || isLoading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
            ${otp.length !== 6 || isLoading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </div>
          ) : (
            'Verify OTP'
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500">
          <p>Didn't receive the code?</p>
          <p>
            Check your SMS inbox or{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className={`${
                canResend
                  ? 'text-blue-600 hover:text-blue-500'
                  : 'text-gray-400 cursor-not-allowed'
              } focus:outline-none`}
            >
              request a new one
            </button>
          </p>
        </div>

        {/* Support Link */}
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-gray-500 focus:outline-none"
          >
            Having trouble? Contact support
          </button>
        </div>
      </form>
    </div>
  );
};

export default OTPVerification;
