import mongoose, { Document, Schema, Types } from 'mongoose';

// Define interfaces for type safety
export interface IGigLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  landmark?: string;
}

export interface IRequiredSkill {
  name: string;
  category: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  isRequired: boolean;
}

export interface IPaymentInfo {
  rate: number;
  currency: string;
  paymentType: 'hourly' | 'fixed' | 'daily' | 'weekly';
  totalBudget?: number;
  advancePayment?: number;
  paymentMethod: 'cash' | 'upi' | 'bank_transfer' | 'razorpay';
}

export interface ITimeline {
  startDate?: Date;
  endDate?: Date;
  duration?: number; // in hours
  deadline?: Date;
  isFlexible: boolean;
  preferredTime?: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
}

export interface IApplication {
  applicantId: Types.ObjectId;
  appliedAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  proposedRate?: number;
  message?: string;
  portfolioLinks?: string[];
  estimatedDuration?: number;
  availability?: Date;
}

export interface IGig extends Document {
  // Basic Information
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  
  // Location Information
  location: IGigLocation;
  isRemote: boolean;
  allowsRemote: boolean;
  serviceRadius?: number; // in kilometers
  
  // Job Details
  skills: IRequiredSkill[];
  experienceLevel: 'entry' | 'intermediate' | 'experienced' | 'expert';
  toolsRequired?: string[];
  materialsProvided: boolean;
  
  // Payment Information
  payment: IPaymentInfo;
  
  // Timeline
  timeline: ITimeline;
  
  // Status and Management
  status: 'draft' | 'posted' | 'active' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  posterId: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  applications: IApplication[];
  
  // Engagement Metrics
  views: number;
  applicationsCount: number;
  completionDate?: Date;
  
  // Additional Information
  images?: string[];
  documents?: string[];
  contactPreference: 'phone' | 'message' | 'both';
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  
  // Quality and Safety
  safetyRequirements?: string[];
  qualityStandards?: string[];
  
  // Timestamps
  postedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Required Skills Schema
const RequiredSkillSchema = new Schema<IRequiredSkill>({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  proficiency: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true
  },
  isRequired: { type: Boolean, default: true }
});

// Payment Information Schema
const PaymentInfoSchema = new Schema<IPaymentInfo>({
  rate: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  paymentType: {
    type: String,
    enum: ['hourly', 'fixed', 'daily', 'weekly'],
    required: true
  },
  totalBudget: { type: Number, min: 0 },
  advancePayment: { type: Number, min: 0, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'razorpay'],
    required: true
  }
});

// Timeline Schema
const TimelineSchema = new Schema<ITimeline>({
  startDate: { type: Date },
  endDate: { type: Date },
  duration: { type: Number, min: 0.5, max: 8760 }, // 0.5 hours to 1 year
  deadline: { type: Date },
  isFlexible: { type: Boolean, default: false },
  preferredTime: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night', 'anytime'],
    default: 'anytime'
  }
});

// Gig Location Schema (GeoJSON Point)
const GigLocationSchema = new Schema<IGigLocation>({
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
  address: { type: String, required: true, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, default: 'India' },
  pincode: { type: String, trim: true },
  landmark: { type: String, trim: true }
});

// Application Schema
const ApplicationSchema = new Schema<IApplication>({
  applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  appliedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  proposedRate: { type: Number, min: 0 },
  message: { type: String, trim: true, maxlength: 1000 },
  portfolioLinks: [{ type: String, trim: true }],
  estimatedDuration: { type: Number, min: 0 },
  availability: { type: Date }
});

// Main Gig Schema
const GigSchema = new Schema<IGig>({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 20,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'home_services', 'repair_maintenance', 'cleaning', 'gardening',
      'tech_services', 'tutoring', 'photography', 'event_services',
      'delivery', 'personal_care', 'pet_services', 'automotive',
      'construction', 'electrical', 'plumbing', 'painting',
      'moving', 'handyman', 'security', 'other'
    ]
  },
  subCategory: { type: String, trim: true },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Location Information
  location: {
    type: GigLocationSchema,
    required: true
  },
  isRemote: { type: Boolean, default: false },
  allowsRemote: { type: Boolean, default: false },
  serviceRadius: { type: Number, min: 1, max: 100 }, // in kilometers

  // Job Details
  skills: [RequiredSkillSchema],
  experienceLevel: {
    type: String,
    enum: ['entry', 'intermediate', 'experienced', 'expert'],
    default: 'intermediate'
  },
  toolsRequired: [{ type: String, trim: true }],
  materialsProvided: { type: Boolean, default: false },

  // Payment Information
  payment: {
    type: PaymentInfoSchema,
    required: true
  },

  // Timeline
  timeline: {
    type: TimelineSchema,
    required: true
  },

  // Status and Management
  status: {
    type: String,
    enum: ['draft', 'posted', 'active', 'assigned', 'in_progress', 'completed', 'cancelled', 'expired'],
    default: 'draft'
  },
  posterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  applications: [ApplicationSchema],

  // Engagement Metrics
  views: { type: Number, default: 0, min: 0 },
  applicationsCount: { type: Number, default: 0, min: 0 },
  completionDate: { type: Date },

  // Additional Information
  images: [{ type: String, trim: true }],
  documents: [{ type: String, trim: true }],
  contactPreference: {
    type: String,
    enum: ['phone', 'message', 'both'],
    default: 'both'
  },
  isRecurring: { type: Boolean, default: false },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly']
  },

  // Quality and Safety
  safetyRequirements: [{ type: String, trim: true }],
  qualityStandards: [{ type: String, trim: true }],

  // Timestamps
  postedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for Performance and Geospatial Queries
GigSchema.index({ 'location.coordinates': '2dsphere' }); // Primary geospatial index
GigSchema.index({ status: 1, postedAt: -1 }); // Active gigs, newest first
GigSchema.index({ category: 1, status: 1 }); // Category filtering
GigSchema.index({ posterId: 1, status: 1 }); // User's gigs
GigSchema.index({ assignedTo: 1, status: 1 }); // Assigned gigs
GigSchema.index({ 'skills.name': 1, 'skills.category': 1 }); // Skill-based search
GigSchema.index({ urgency: 1, postedAt: -1 }); // Urgent gigs first
GigSchema.index({ 'payment.rate': 1, 'payment.paymentType': 1 }); // Payment filtering
GigSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired gigs
GigSchema.index({ 
  title: 'text', 
  description: 'text',
  'skills.name': 'text',
  category: 'text'
}); // Full-text search

// Pre-save middleware for business logic
GigSchema.pre('save', function(next) {
  // Auto-set expiry date if not provided (default: 30 days)
  if (!this.expiresAt && this.status === 'posted') {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }

  // Auto-set posted date when status changes to posted
  if (this.status === 'posted' && !this.postedAt) {
    this.postedAt = new Date();
  }

  // Update applications count
  this.applicationsCount = this.applications.length;

  // Validate timeline dates
  if (this.timeline.startDate && this.timeline.endDate) {
    if (this.timeline.startDate >= this.timeline.endDate) {
      return next(new Error('Start date must be before end date'));
    }
  }

  // Validate deadline
  if (this.timeline.deadline && this.timeline.deadline < new Date()) {
    return next(new Error('Deadline cannot be in the past'));
  }

  next();
});

// Instance Methods
GigSchema.methods.addApplication = function(applicationData: Partial<IApplication>) {
  // Check if user already applied
  const existingApplication = this.applications.find(
    (app: any) => app.applicantId.toString() === applicationData.applicantId?.toString()
  );

  if (existingApplication) {
    throw new Error('User has already applied to this gig');
  }

  this.applications.push(applicationData);
  this.applicationsCount = this.applications.length;
  return this.save();
};

GigSchema.methods.acceptApplication = function(applicationId: string, applicantId: string) {
  const application = this.applications.id(applicationId);
  if (!application) {
    throw new Error('Application not found');
  }

  // Update application status
  application.status = 'accepted';
  
  // Assign the gig
  this.assignedTo = new Types.ObjectId(applicantId);
  this.status = 'assigned';

  // Reject all other applications
  this.applications.forEach((app: any) => {
    if (app._id.toString() !== applicationId && app.status === 'pending') {
      app.status = 'rejected';
    }
  });

  return this.save();
};

GigSchema.methods.completeGig = function() {
  this.status = 'completed';
  this.completionDate = new Date();
  return this.save();
};

GigSchema.methods.cancelGig = function() {
  this.status = 'cancelled';
  // Reject all pending applications
  this.applications.forEach((app: any) => {
    if (app.status === 'pending') {
      app.status = 'rejected';
    }
  });
  return this.save();
};

// Static Methods
GigSchema.statics.findNearby = function(
  coordinates: [number, number], 
  radiusKm: number = 10, 
  filters: any = {}
) {
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
    status: 'posted',
    expiresAt: { $gte: new Date() },
    ...filters
  }).populate('posterId', 'name trustScore averageRating')
    .sort({ urgency: -1, postedAt: -1 });
};

GigSchema.statics.findBySkills = function(skills: string[], coordinates?: [number, number], radiusKm: number = 50) {
  const query: any = {
    'skills.name': { $in: skills },
    status: 'posted',
    expiresAt: { $gte: new Date() }
  };

  if (coordinates) {
    query['location.coordinates'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: radiusKm * 1000
      }
    };
  }

  return this.find(query)
    .populate('posterId', 'name trustScore averageRating')
    .sort({ urgency: -1, postedAt: -1 });
};

GigSchema.statics.searchGigs = function(searchTerm: string, coordinates?: [number, number], radiusKm: number = 25) {
  const query: any = {
    $text: { $search: searchTerm },
    status: 'posted',
    expiresAt: { $gte: new Date() }
  };

  if (coordinates) {
    query['location.coordinates'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: radiusKm * 1000
      }
    };
  }

  return this.find(query, { score: { $meta: 'textScore' } })
    .populate('posterId', 'name trustScore averageRating')
    .sort({ score: { $meta: 'textScore' }, urgency: -1 });
};

// Virtual for distance calculation (requires coordinates in query context)
GigSchema.virtual('distanceFromUser').get(function() {
  // This would be populated by aggregation pipeline with $geoNear
  return (this as any).distance || 0;
});

// Virtual for application summary
GigSchema.virtual('applicationSummary').get(function() {
  const pending = this.applications.filter(app => app.status === 'pending').length;
  const accepted = this.applications.filter(app => app.status === 'accepted').length;
  const rejected = this.applications.filter(app => app.status === 'rejected').length;
  
  return { pending, accepted, rejected, total: this.applications.length };
});

// Virtual for time remaining until deadline
GigSchema.virtual('timeRemaining').get(function() {
  if (!this.timeline.deadline) return null;
  
  const now = new Date();
  const deadline = new Date(this.timeline.deadline);
  const diffMs = deadline.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Expired';
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} days, ${hours} hours`;
  return `${hours} hours`;
});

// Create and export the model
const Gig = mongoose.model<IGig>('Gig', GigSchema);

export default Gig;
