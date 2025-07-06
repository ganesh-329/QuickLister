import { Types, Document } from 'mongoose';
export interface IMessage extends Document {
    chat: Types.ObjectId;
    sender: Types.ObjectId;
    senderType: 'user' | 'ai';
    content: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Message: import("mongoose").Model<IMessage, {}, {}, {}, Document<unknown, {}, IMessage, {}> & IMessage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Message;
//# sourceMappingURL=Message.d.ts.map