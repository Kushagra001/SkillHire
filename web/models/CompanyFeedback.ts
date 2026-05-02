import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompanyFeedback extends Document {
    company: string;          // Normalized lowercase company name (index key)
    job_id: string;           // MongoDB ObjectId string of the job (for dedup)
    user_id: string;          // Clerk user ID (prevents duplicate voting)
    responded: boolean;       // true = got a response, false = ghosted
    created_at: Date;
}

const CompanyFeedbackSchema: Schema = new Schema({
    company: { type: String, required: true, index: true, lowercase: true, trim: true },
    job_id:  { type: String, required: true },
    user_id: { type: String, required: true },
    responded: { type: Boolean, required: true },
    created_at: { type: Date, default: Date.now },
});

// One vote per user per job — prevents ballot-stuffing
CompanyFeedbackSchema.index({ job_id: 1, user_id: 1 }, { unique: true });

// TTL: auto-delete votes older than 6 months (keeps data fresh / relevant)
CompanyFeedbackSchema.index({ created_at: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });

const CompanyFeedback: Model<ICompanyFeedback> =
    (mongoose.models.CompanyFeedback as Model<ICompanyFeedback>) ||
    mongoose.model<ICompanyFeedback>('CompanyFeedback', CompanyFeedbackSchema);

export default CompanyFeedback;
