import { Schema, model } from 'mongoose';
const MessageSchema = new Schema({
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    senderType: { type: String, enum: ['user', 'ai'], required: true },
    content: { type: String, required: true },
}, {
    timestamps: true,
});
export const Message = model('Message', MessageSchema);
export default Message;
//# sourceMappingURL=Message.js.map