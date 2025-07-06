import { Types, Document } from 'mongoose';
export interface IChat extends Document {
    participants: Types.ObjectId[];
    gig?: Types.ObjectId;
    aiEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Chat: import("mongoose").Model<IChat, {}, {}, {}, Document<unknown, {}, IChat, {}> & IChat & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Chat;
//# sourceMappingURL=Chat.d.ts.map