// Simple exports - just what we need
export { default as User } from './User.js';
export type { IUser } from './User.js';

export { default as Gig } from './Gig.js';
export type { 
  IGig, 
  IGigLocation, 
  IRequiredSkill, 
  IPaymentInfo, 
  ITimeline, 
  IApplication 
} from './Gig.js';

export { default as Chat } from './Chat.js';
export type { IChat } from './Chat.js';

export { default as Message } from './Message.js';
export type { IMessage } from './Message.js';

// Re-export mongoose types for convenience
export type { Types, Document } from 'mongoose';
