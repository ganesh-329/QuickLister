import mongoose, { Document, Schema, Types } from 'mongoose';

// Define interfaces for type safety
export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface ISkill {
  name: string;
  category: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  isVerified?: boolean;
}

export interface INotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  jobAlerts: boolean;
  messageAlerts: boolean;
  reviewAlerts: boolean;
}

export interface IPrivacySettings {
  showLocation: boolean;
  showPhone: boolean;
  showEmail: boolean;
  allowDirectMessages: boolean;
}

export interface IAvailability {
  isAvailable: boolean;
  weekdays: boolean[];
  startTime?: string;
  endTime?: string;
  timezone?: string;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  // Personal Information
  name: string;
  email: string;
  phone: string;
  password: string;
  profileImage?: string;
  bio?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';

  // Location Data
  location: ILocation;
  searchRadius: number; // in kilometers
  
  // Skills and Experience
  skills: ISkill[];
  totalExperience?: number; // in years
  
  // Verification Status (SECURE - No Aadhar data stored)
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isIdentityVerified: boolean; // DigiLocker verification
  verifiedName?: string; // Name from DigiLocker (for trust)
  verificationDate?: Date;
  
  // Trust and Performance Metrics
  trustScore: number; // 0-100
  completionRate: number; // percentage of completed jobs
  averageRating: number; // 0-5 stars
  totalRatings: number;
  responseTime: number; // average response time in minutes
  
  // Account Settings
  notificationSettings: INotificationSettings;
  privacySettings: IPrivacySettings;
  availability: IAvailability;
  
  // Security and Audit
  lastActiveAt: Date;
  accountStatus: 'active' | 'suspended' | 'deactivated';
  createdAt: Date;
  updatedAt: Date;
  
  // Financial
  totalEarnings: number;
  totalSpent: number;
  pendingPayouts: number;
  
  // Profile Completion
  profileCompletionPercentage: number;
  onboardingCompleted: boolean;
}

// Location Schema (GeoJSON Point)
const LocationSchema = new Schema<ILocation>({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: function(coords: number[]) {
        return Array.isArray(coords) && coords.length === 2 && 
               typeof coords[0] === 'number' && coords[0] >= -180 && coords[0] <= 180 && // longitude
               typeof coords[1] === 'number' && coords[1] >= -90 && coords[1] <= 90;     // latitude
      },
      message: 'Coordinates must be [longitude, latitude] within valid ranges'
    }
  },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, default: 'India' },
  pincode: { type: String, trim: true }
});

// Skills Schema
const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  proficiency: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true
  },
  yearsOfExperience: { type: Number, min: 0, max: 50 },
  isVerified: { type: Boolean, default: false }
});

// Notification Settings Schema
const NotificationSettingsSchema = new Schema<INotificationSettings>({
  email: { type: Boolean, default: true },
  sms: { type: Boolean, default: true },
  push: { type: Boolean, default: true },
  jobAlerts: { type: Boolean, default: true },
  messageAlerts: { type: Boolean, default: true },
  reviewAlerts: { type: Boolean, default: true }
});

// Privacy Settings Schema
const PrivacySettingsSchema = new Schema<IPrivacySettings>({
  showLocation: { type: Boolean, default: true },
  showPhone: { type: Boolean, default: false },
  showEmail: { type: Boolean, default: false },
  allowDirectMessages: { type: Boolean, default: true }
});

// Availability Schema
const AvailabilitySchema = new Schema<IAvailability>({
  isAvailable: { type: Boolean, default: true },
  weekdays: {
    type: [Boolean],
    default: [true, true, true, true, true, true, true], // Mon-Sun
    validate: {
      validator: function(days: boolean[]) {
        return days.length === 7;
      },
      message: 'Weekdays array must have exactly 7 boolean values'
    }
  },
  startTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  endTime: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
  timezone: { type: String, default: 'Asia/Kolkata' }
});

// Main User Schema
const UserSchema = new Schema<IUser>({
  // Personal Information
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[6-9]\d{9}$/ // Indian mobile number format
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // Don't include password in queries by default
  },
  profileImage: { type: String, trim: true },
  bio: { type: String, trim: true, maxlength: 500 },
  dateOfBirth: { type: Date },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },

  // Location Data
  location: {
    type: LocationSchema,
    required: true
  },
  searchRadius: {
    type: Number,
    default: 10,
    min: 1,
    max: 100
  },

  // Skills and Experience
  skills: [SkillSchema],
  totalExperience: { type: Number, min: 0, max: 50 },

  // Verification Status (SECURE - No Aadhar data)
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isIdentityVerified: { type: Boolean, default: false },
  verifiedName: { type: String, trim: true }, // From DigiLocker only
  verificationDate: { type: Date },

  // Trust and Performance Metrics
  trustScore: { type: Number, default: 0, min: 0, max: 100 },
  completionRate: { type: Number, default: 0, min: 0, max: 100 },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0, min: 0 },
  responseTime: { type: Number, default: 0, min: 0 }, // in minutes

  // Account Settings
  notificationSettings: {
    type: NotificationSettingsSchema,
    default: () => ({})
  },
  privacySettings: {
    type: PrivacySettingsSchema,
    default: () => ({})
  },
  availability: {
    type: AvailabilitySchema,
    default: () => ({})
  },

  // Security and Audit
  lastActiveAt: { type: Date, default: Date.now },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deactivated'],
    default: 'active'
  },

  // Financial
  totalEarnings: { type: Number, default: 0, min: 0 },
  totalSpent: { type: Number, default: 0, min: 0 },
  pendingPayouts: { type: Number, default: 0, min: 0 },

  // Profile Completion
  profileCompletionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  onboardingCompleted: { type: Boolean, default: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for Performance
UserSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial queries
UserSchema.index({ phone: 1 }); // Fast phone lookup
UserSchema.index({ email: 1 }); // Fast email lookup
UserSchema.index({ trustScore: -1 }); // Sort by trust score
UserSchema.index({ accountStatus: 1, isPhoneVerified: 1 }); // Active users
UserSchema.index({ 'skills.name': 1, 'skills.category': 1 }); // Skill search
UserSchema.index({ lastActiveAt: -1 }); // Recent activity

// Pre-save middleware to calculate profile completion
UserSchema.pre('save', function(next) {
  let completionScore = 0;
  
  // Basic info (40 points)
  if (this.name) completionScore += 10;
  if (this.email) completionScore += 5;
  if (this.phone) completionScore += 10;
  if (this.bio) completionScore += 10;
  if (this.profileImage) completionScore += 5;
  
  // Verification (30 points)
  if (this.isPhoneVerified) completionScore += 15;
  if (this.isIdentityVerified) completionScore += 15;
  
  // Skills and experience (20 points)
  if (this.skills.length > 0) completionScore += 15;
  if (this.totalExperience !== undefined) completionScore += 5;
  
  // Settings (10 points)
  if (this.location) completionScore += 5;
  if (this.availability.isAvailable !== undefined) completionScore += 5;
  
  this.profileCompletionPercentage = Math.min(completionScore, 100);
  next();
});

// Instance method to calculate trust score
UserSchema.methods.calculateTrustScore = function(): number {
  let score = 0;
  
  // Verification bonuses
  if (this.isPhoneVerified) score += 20;
  if (this.isIdentityVerified) score += 30;
  if (this.isEmailVerified) score += 10;
  
  // Performance bonuses
  if (this.completionRate >= 90) score += 20;
  else if (this.completionRate >= 70) score += 15;
  else if (this.completionRate >= 50) score += 10;
  
  // Rating bonuses
  if (this.averageRating >= 4.5 && this.totalRatings >= 5) score += 15;
  else if (this.averageRating >= 4.0 && this.totalRatings >= 3) score += 10;
  else if (this.averageRating >= 3.5 && this.totalRatings >= 1) score += 5;
  
  // Profile completion bonus
  if (this.profileCompletionPercentage >= 80) score += 5;
  
  return Math.min(score, 100);
};

// Static method to find nearby users
UserSchema.statics.findNearby = function(coordinates: [number, number], radiusKm: number = 10) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: radiusKm * 1000 // Convert km to meters
      }
    },
    accountStatus: 'active',
    isPhoneVerified: true
  });
};

// Virtual for full location string
UserSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.location?.address,
    this.location?.city,
    this.location?.state,
    this.location?.pincode
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Create and export the model
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
