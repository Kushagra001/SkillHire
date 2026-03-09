import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJob extends Document {
    title: string;
    company: string;
    location: string;
    apply_link: string;
    tags: string[];
    public_release_at: Date;
    source_hash: string;
    is_active: boolean;
    created_at: Date;
    logo?: string;
    description?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    raw_data?: any;

    // --- Refinery-enriched fields ---
    is_processed?: boolean;
    processed_at?: Date;
    batch?: string[];
    tech_stack?: string[];
    normalized_location?: string;
    work_mode?: 'Remote' | 'Hybrid' | 'On-site';
    job_type?: 'Internship' | 'Full-time';
    salary_status?: string;
    is_premium?: boolean;

    // --- Distribution fields ---
    distributed_channels?: string[];
    distribution_status?: 'pending' | 'distributed';
}

const JobSchema: Schema = new Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    apply_link: { type: String, required: true },
    tags: { type: [String], default: [] },
    public_release_at: { type: Date, required: true, index: true },
    source_hash: { type: String, required: true, unique: true },
    is_active: { type: Boolean, default: true, index: true },
    created_at: { type: Date, default: Date.now },
    logo: { type: String },
    description: { type: String },
    raw_data: { type: Schema.Types.Mixed },

    // --- Refinery-enriched fields ---
    is_processed: { type: Boolean, default: false, index: true },
    processed_at: { type: Date },
    batch: { type: [String], default: [] },
    tech_stack: { type: [String], default: [] },
    normalized_location: { type: String },
    work_mode: { type: String, enum: ['Remote', 'Hybrid', 'On-site'] },
    job_type: { type: String, enum: ['Internship', 'Full-time'] },
    salary_status: { type: String },
    is_premium: { type: Boolean, default: false },

    // --- Distribution fields (used by n8n automation pipeline) ---
    distributed_channels: { type: [String], default: [] },
    distribution_status: { type: String, enum: ['pending', 'distributed'], default: 'pending', index: true },
});

// TTL index: automatically delete jobs after 7 days
// MongoDB's background task checks every ~60s and removes expired documents
JobSchema.index({ created_at: 1 }, { expireAfterSeconds: 604800 });

// Prevent model recompilation error in development
const Job: Model<IJob> = (mongoose.models.Job as Model<IJob>) || mongoose.model<IJob>('Job', JobSchema);

export default Job;

