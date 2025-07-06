import mongoose, { Document, Types } from 'mongoose';
import { IGigData, IGigLocationData, IRequiredSkillData, IPaymentInfoData, ITimelineData, IApplicationData } from '../../../shared/types/index.js';
export interface IGig extends Omit<IGigData, '_id'>, Document {
    _id: mongoose.Types.ObjectId;
}
export interface IGigLocation extends IGigLocationData {
}
export interface IRequiredSkill extends IRequiredSkillData {
}
export interface IPaymentInfo extends IPaymentInfoData {
}
export interface ITimeline extends ITimelineData {
}
export interface IApplication extends IApplicationData {
}
declare const Gig: mongoose.Model<IGig, {}, {}, {}, mongoose.Document<unknown, {}, IGig, {}> & IGig & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Gig;
//# sourceMappingURL=Gig.d.ts.map