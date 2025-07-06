import { Schema, model } from 'mongoose';
const ChatSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    gig: { type: Schema.Types.ObjectId, ref: 'Gig' },
    aiEnabled: { type: Boolean, default: true },
}, {
    timestamps: true,
});
export const Chat = model('Chat', ChatSchema);
export default Chat;
//# sourceMappingURL=Chat.js.map