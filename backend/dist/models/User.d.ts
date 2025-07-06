import mongoose from 'mongoose';
import { IUser } from '../../../shared/types/index.js';
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}> & IUser & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map