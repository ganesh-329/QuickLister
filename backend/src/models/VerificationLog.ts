import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVerificationLog extends Document {
  userId: Types.ObjectId;
  verificationType: 'email' | 'digilocker' | 'manual';
  status: 'pending' | 'verified' | 'failed' | 'expired';
  
  // External reference (NO sensitive data stored)
  verificationId: string; // External session/transaction ID
  externalProvider?: string; // 'digilocker', etc.
  
  // Audit information
  initiatedAt: Date;
  completedAt?: Date;
  ipAddress: string;
  userAgent?: string;
  
  // Verification details (SECURE - no sensitive data)
  verificationMethod?: string; // 'oauth', 'email_link', etc.
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  
  // Result information (SAFE data only)
  verifiedName?: string; // For identity verification (from DigiLocker)
  emailAddress?: string; // Only for email verification logs
  
  // Error tracking
  errorCode?: string;
  errorMessage?: string;
  
  // Additional metadata
  metadata?: Record<string, any>;
}

const VerificationLogSchema = new Schema<IVerificationLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  verificationType: {
    type: String,
    enum: ['email', 'digilocker', 'manual'],
    required: true,
  },
  
  status: {
    type: String,
    enum: ['pending', 'verified', 'failed', 'expired'],
    default: 'pending',
  },
  
  // External reference (NO sensitive data stored)
  verificationId: {
    type: String,
    required: true,
    trim: true,
  },
  
  externalProvider: {
    type: String,
    trim: true,
    enum: ['digilocker', 'sendgrid', 'manual'],
  },
  
  // Audit information
  initiatedAt: {
    type: Date,
    default: Date.now,
  },
  
  completedAt: {
    type: Date,
  },
  
  ipAddress: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(ip: string) {
        // Basic IP validation (IPv4 and IPv6)
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
        return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === 'localhost';
      },
      message: 'Invalid IP address format',
    },
  },
  
  userAgent: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  
  // Verification details
  verificationMethod: {
    type: String,
    enum: ['oauth', 'email_link', 'manual'],
    trim: true,
  },
  
  attempts: {
    type: Number,
    default: 1,
    min: 1,
    max: 10,
  },
  
  maxAttempts: {
    type: Number,
    default: 3,
    min: 1,
    max: 10,
  },
  
  expiresAt: {
    type: Date,
    required: true,
  },
  
  // Safe result information
  verifiedName: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  
  emailAddress: {
    type: String,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  
  // Error tracking
  errorCode: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  
  errorMessage: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  
  // Additional metadata (for debugging, analytics)
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for performance and querying
VerificationLogSchema.index({ userId: 1, verificationType: 1 });
VerificationLogSchema.index({ status: 1, initiatedAt: -1 });
VerificationLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-cleanup expired logs
VerificationLogSchema.index({ verificationId: 1, externalProvider: 1 });
VerificationLogSchema.index({ ipAddress: 1, initiatedAt: -1 }); // For abuse detection

// Pre-save middleware
VerificationLogSchema.pre('save', function(next) {
  // Auto-complete verification if status changes to verified/failed
  if ((this.status === 'verified' || this.status === 'failed') && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Auto-expire if past expiration date
  if (this.expiresAt < new Date() && this.status === 'pending') {
    this.status = 'expired';
    this.completedAt = new Date();
  }
  
  next();
});

// Instance Methods
VerificationLogSchema.methods.markAsVerified = function(verifiedData?: { name?: string }) {
  this.status = 'verified';
  this.completedAt = new Date();
  
  if (verifiedData?.name) {
    this.verifiedName = verifiedData.name;
  }
  
  return this.save();
};

VerificationLogSchema.methods.markAsFailed = function(errorCode?: string, errorMessage?: string) {
  this.status = 'failed';
  this.completedAt = new Date();
  this.attempts += 1;
  
  if (errorCode) this.errorCode = errorCode;
  if (errorMessage) this.errorMessage = errorMessage;
  
  return this.save();
};

VerificationLogSchema.methods.incrementAttempt = function() {
  this.attempts += 1;
  
  if (this.attempts >= this.maxAttempts) {
    this.status = 'failed';
    this.completedAt = new Date();
    this.errorCode = 'MAX_ATTEMPTS_EXCEEDED';
    this.errorMessage = 'Maximum verification attempts exceeded';
  }
  
  return this.save();
};

VerificationLogSchema.methods.isExpired = function(): boolean {
  return this.expiresAt < new Date();
};

VerificationLogSchema.methods.canRetry = function(): boolean {
  return this.status === 'pending' && 
         this.attempts < this.maxAttempts && 
         !this.isExpired();
};

// Static Methods
VerificationLogSchema.statics.createVerificationLog = function(data: {
  userId: Types.ObjectId;
  verificationType: 'email' | 'digilocker' | 'manual';
  verificationId: string;
  externalProvider?: string;
  ipAddress: string;
  userAgent?: string;
  verificationMethod?: string;
  maxAttempts?: number;
  expiresIn?: number; // in minutes
  metadata?: Record<string, any>;
}) {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + (data.expiresIn || 30)); // Default 30 minutes

  return this.create({
    ...data,
    expiresAt,
    maxAttempts: data.maxAttempts || 3,
  });
};

VerificationLogSchema.statics.findActiveVerification = function(
  userId: Types.ObjectId, 
  verificationType: string,
) {
  return this.findOne({
    userId,
    verificationType,
    status: 'pending',
    expiresAt: { $gte: new Date() },
  }).sort({ initiatedAt: -1 });
};

VerificationLogSchema.statics.getUserVerificationHistory = function(
  userId: Types.ObjectId,
  limit: number = 10,
) {
  return this.find({ userId })
    .sort({ initiatedAt: -1 })
    .limit(limit)
    .select('-metadata'); // Exclude metadata for privacy
};

VerificationLogSchema.statics.getVerificationStats = function(
  fromDate: Date,
  toDate: Date = new Date(),
) {
  return this.aggregate([
    {
      $match: {
        initiatedAt: { $gte: fromDate, $lte: toDate },
      },
    },
    {
      $group: {
        _id: {
          type: '$verificationType',
          status: '$status',
        },
        count: { $sum: 1 },
        avgAttempts: { $avg: '$attempts' },
      },
    },
    {
      $group: {
        _id: '$_id.type',
        stats: {
          $push: {
            status: '$_id.status',
            count: '$count',
            avgAttempts: '$avgAttempts',
          },
        },
        totalCount: { $sum: '$count' },
      },
    },
  ]);
};

// Check for suspicious activity (rate limiting helper)
VerificationLogSchema.statics.checkRateLimit = function(
  ipAddress: string,
  verificationType: string,
  timeWindowMinutes: number = 60,
  maxAttempts: number = 10,
) {
  const since = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
  
  return this.countDocuments({
    ipAddress,
    verificationType,
    initiatedAt: { $gte: since },
  }).then((count: number) => ({
    isAllowed: count < maxAttempts,
    currentCount: count,
    maxAllowed: maxAttempts,
    resetTime: new Date(Date.now() + timeWindowMinutes * 60 * 1000),
  }));
};

// Virtual for duration
VerificationLogSchema.virtual('durationMs').get(function() {
  if (!this.completedAt) return null;
  return this.completedAt.getTime() - this.initiatedAt.getTime();
});

// Virtual for time remaining
VerificationLogSchema.virtual('timeRemainingMs').get(function() {
  if (this.status !== 'pending') return 0;
  const remaining = this.expiresAt.getTime() - Date.now();
  return Math.max(0, remaining);
});

// Virtual for success rate (requires aggregation)
VerificationLogSchema.virtual('isSuccessful').get(function() {
  return this.status === 'verified';
});

const VerificationLog = mongoose.model<IVerificationLog>('VerificationLog', VerificationLogSchema);

export default VerificationLog;
