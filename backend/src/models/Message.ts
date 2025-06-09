import { Schema, model, Types, Document } from 'mongoose';

export interface IMessage extends Document {
  chat: Types.ObjectId;
  sender: Types.ObjectId; // User or 'AI'
  senderType: 'user' | 'ai';
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  senderType: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
}, {
  timestamps: true,
});

export const Message = model<IMessage>('Message', MessageSchema);
export default Message; 