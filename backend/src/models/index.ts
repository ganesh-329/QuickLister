// Central export file for all database models
// This allows clean imports like: import { User, Gig, VerificationLog } from '../models'

export { default as User } from './User';
export type { IUser, ILocation, ISkill, INotificationSettings, IPrivacySettings, IAvailability } from './User';

export { default as Gig } from './Gig';
export type { 
  IGig, 
  IGigLocation, 
  IRequiredSkill, 
  IPaymentInfo, 
  ITimeline, 
  IApplication 
} from './Gig';

export { default as VerificationLog } from './VerificationLog';
export type { IVerificationLog } from './VerificationLog';

// Re-export mongoose types for convenience
export type { Types, Document } from 'mongoose';
