import mongoose, { Document } from 'mongoose';
import { IUserData } from '../../../shared/types/index.js';
export interface IUser extends Omit<IUserData, '_id'>, Document {
    _id: mongoose.Types.ObjectId;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map