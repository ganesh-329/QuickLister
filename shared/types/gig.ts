// Base location interface
export interface GigLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  landmark?: string;
}

// Required skill interface
export interface RequiredSkill {
  name: string;
  category: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  isRequired: boolean;
}

// Payment information interface
export interface PaymentInfo {
  rate: number;
  currency: string;
  paymentType: 'hourly' | 'fixed' | 'daily' | 'weekly';
  totalBudget?: number;
  advancePayment?: number;
  paymentMethod: 'cash' | 'upi' | 'bank_transfer' | 'razorpay';
}

// Timeline interface
export interface Timeline {
  startDate?: string; // Use string for consistency between frontend/backend
  endDate?: string;
  duration?: number; // in hours
  deadline?: string;
  isFlexible: boolean;
  preferredTime?: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
}

// Base application interface
export interface BaseApplication {
  _id: string;
  applicantId: string; // String ID for consistency
  appliedAt: string; // String date for consistency
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  proposedRate?: number;
  message?: string;
  portfolioLinks?: string[];
  estimatedDuration?: number;
  availability?: string;
}

// Backend-specific interfaces that use ObjectId and Date
export interface IApplicationData extends Omit<BaseApplication, 'applicantId' | 'appliedAt' | '_id'> {
  _id?: any; // ObjectId in backend (optional for new applications)
  applicantId: any; // ObjectId in backend
  appliedAt: Date; // Date object in backend
  statusChangedAt: Date;
  rejectionReason?: string;
  statusHistory: {
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    changedAt: Date;
    changedBy?: any; // ObjectId
    reason?: string;
  }[];
}

export interface IGigLocationData extends GigLocation {}
export interface IRequiredSkillData extends RequiredSkill {}
export interface IPaymentInfoData extends PaymentInfo {}

export interface ITimelineData extends Omit<Timeline, 'startDate' | 'endDate' | 'deadline'> {
  startDate?: Date;
  endDate?: Date;
  deadline?: Date;
}

// Backend-specific gig data interface (will be extended with Document in backend)
export interface IGigData {
  // Basic Information
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  
  // Location Information
  location: IGigLocationData;
  isRemote: boolean;
  allowsRemote: boolean;
  serviceRadius?: number; // in kilometers
  
  // Job Details
  skills: IRequiredSkillData[];
  experienceLevel: 'entry' | 'intermediate' | 'experienced' | 'expert';
  toolsRequired?: string[];
  materialsProvided: boolean;
  
  // Payment Information
  payment: IPaymentInfoData;
  
  // Timeline
  timeline: ITimelineData;
  
  // Status and Management
  status: 'draft' | 'posted' | 'active' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  posterId: any; // ObjectId
  assignedTo?: any; // ObjectId
  applications: IApplicationData[];
  
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

// Base gig interface for consistency
export interface BaseGig {
  _id: string;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  location: GigLocation;
  isRemote: boolean;
  allowsRemote: boolean;
  serviceRadius?: number;
  skills: RequiredSkill[];
  experienceLevel: 'entry' | 'intermediate' | 'experienced' | 'expert';
  toolsRequired?: string[];
  materialsProvided: boolean;
  payment: PaymentInfo;
  timeline: Timeline;
  status: 'draft' | 'posted' | 'active' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  posterId: string;
  assignedTo?: string;
  views: number;
  applicationsCount: number;
  completionDate?: string;
  images?: string[];
  documents?: string[];
  contactPreference: 'phone' | 'message' | 'both';
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  safetyRequirements?: string[];
  qualityStandards?: string[];
  postedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Frontend-specific interfaces (with populated fields)
export interface PopulatedUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Application extends Omit<BaseApplication, 'applicantId'> {
  applicantId: PopulatedUser;
}

export interface Gig extends Omit<BaseGig, 'posterId' | 'assignedTo'> {
  posterId: PopulatedUser;
  assignedTo?: PopulatedUser;
  applications: Application[];
}

// Create gig data interface
export interface CreateGigData {
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  location: GigLocation;
  isRemote?: boolean;
  allowsRemote?: boolean;
  serviceRadius?: number;
  skills: RequiredSkill[];
  experienceLevel?: 'entry' | 'intermediate' | 'experienced' | 'expert';
  toolsRequired?: string[];
  materialsProvided?: boolean;
  payment: PaymentInfo;
  timeline: Timeline;
  images?: string[];
  documents?: string[];
  contactPreference?: 'phone' | 'message' | 'both';
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  safetyRequirements?: string[];
  qualityStandards?: string[];
}

// API-related interfaces
export interface GetGigsParams {
  page?: number;
  limit?: number;
  category?: string;
  skills?: string | string[];
  minRate?: number;
  maxRate?: number;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  paymentType?: 'hourly' | 'fixed' | 'daily' | 'weekly';
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface GetGigsResponse {
  gigs: Gig[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApplyToGigData {
  message?: string;
  proposedRate?: number;
  portfolioLinks?: string[];
  estimatedDuration?: number;
  availability?: string;
}
