import { Schema, model, Types, Document } from 'mongoose';

export interface IChat extends Document {
  participants: Types.ObjectId[]; // User IDs
  gig?: Types.ObjectId; // Optional: Link to a gig
  aiEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  gig: { type: Schema.Types.ObjectId, ref: 'Gig' },
  aiEnabled: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export const Chat = model<IChat>('Chat', ChatSchema);
export default Chat; 