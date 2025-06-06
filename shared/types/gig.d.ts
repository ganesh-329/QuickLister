import { Document } from 'mongoose';
export interface GigLocation {
    type: 'Point';
    coordinates: [number, number];
    address: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    landmark?: string;
}
export interface RequiredSkill {
    name: string;
    category: string;
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    isRequired: boolean;
}
export interface PaymentInfo {
    rate: number;
    currency: string;
    paymentType: 'hourly' | 'fixed' | 'daily' | 'weekly';
    totalBudget?: number;
    advancePayment?: number;
    paymentMethod: 'cash' | 'upi' | 'bank_transfer' | 'razorpay';
}
export interface Timeline {
    startDate?: string;
    endDate?: string;
    duration?: number;
    deadline?: string;
    isFlexible: boolean;
    preferredTime?: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
}
export interface BaseApplication {
    _id: string;
    applicantId: string;
    appliedAt: string;
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
    proposedRate?: number;
    message?: string;
    portfolioLinks?: string[];
    estimatedDuration?: number;
    availability?: string;
}
export interface IApplication extends Omit<BaseApplication, 'applicantId' | 'appliedAt' | '_id'> {
    _id?: any;
    applicantId: any;
    appliedAt: Date;
}
export interface IGigLocation extends GigLocation {
}
export interface IRequiredSkill extends RequiredSkill {
}
export interface IPaymentInfo extends PaymentInfo {
}
export interface ITimeline extends Omit<Timeline, 'startDate' | 'endDate' | 'deadline'> {
    startDate?: Date;
    endDate?: Date;
    deadline?: Date;
}
export interface IGig extends Document {
    title: string;
    description: string;
    category: string;
    subCategory?: string;
    urgency: 'low' | 'medium' | 'high' | 'urgent';
    location: IGigLocation;
    isRemote: boolean;
    allowsRemote: boolean;
    serviceRadius?: number;
    skills: IRequiredSkill[];
    experienceLevel: 'entry' | 'intermediate' | 'experienced' | 'expert';
    toolsRequired?: string[];
    materialsProvided: boolean;
    payment: IPaymentInfo;
    timeline: ITimeline;
    status: 'draft' | 'posted' | 'active' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
    posterId: any;
    assignedTo?: any;
    applications: IApplication[];
    views: number;
    applicationsCount: number;
    completionDate?: Date;
    images?: string[];
    documents?: string[];
    contactPreference: 'phone' | 'message' | 'both';
    isRecurring: boolean;
    recurringPattern?: 'daily' | 'weekly' | 'monthly';
    safetyRequirements?: string[];
    qualityStandards?: string[];
    postedAt: Date;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
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
//# sourceMappingURL=gig.d.ts.map