import mongoose, { Schema, Document, Model } from 'mongoose';

export type TrackerStatus = 'Saved' | 'Applied' | 'Responded' | 'Interview' | 'Offer' | 'Rejected';

export interface ITrackedJob extends Document {
    clerk_id: string;
    job_id: string;
    title: string;
    company: string;
    location: string;
    logo?: string;
    apply_link: string;
    status: TrackerStatus;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}

const TrackedJobSchema: Schema = new Schema({
    clerk_id: { type: String, required: true, index: true },
    job_id: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: 'Unknown' },
    logo: { type: String },
    apply_link: { type: String },
    status: { 
        type: String, 
        enum: ['Saved', 'Applied', 'Responded', 'Interview', 'Offer', 'Rejected'], 
        default: 'Saved' 
    },
    notes: { type: String }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Prevent model recompilation error in development
const TrackedJob: Model<ITrackedJob> = (mongoose.models.TrackedJob as Model<ITrackedJob>) || mongoose.model<ITrackedJob>('TrackedJob', TrackedJobSchema);

export default TrackedJob;
