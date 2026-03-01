import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    clerk_id: string;
    email: string;
    subscription_tier: 'free' | 'pro';
    subscription_expires_at?: Date;
    resume_text?: string;
    ai_scans_count: number;
    last_scan_date?: Date;
    created_at: Date;
}

const UserSchema: Schema = new Schema({
    clerk_id: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    subscription_tier: { type: String, enum: ['free', 'pro'], default: 'free' },
    subscription_expires_at: { type: Date },
    resume_text: { type: String },
    ai_scans_count: { type: Number, default: 0 },
    last_scan_date: { type: Date },
    created_at: { type: Date, default: Date.now },
});

// Prevent model recompilation error in development
const User: Model<IUser> = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

export default User;
