// Simple exports - just what we need
export { default as User } from './User.js';
export type { IUser } from './User.js';

export { default as Gig } from './Gig.js';

// Re-export mongoose types for convenience
export type { Types, Document } from 'mongoose';
