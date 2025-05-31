// Simple exports - just what we need
export { default as User } from './User';
export type { IUser } from './User';

export { default as Gig } from './Gig';

// Re-export mongoose types for convenience
export type { Types, Document } from 'mongoose';
