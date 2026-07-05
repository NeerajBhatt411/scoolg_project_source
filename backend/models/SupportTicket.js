import mongoose from 'mongoose';

// One reply in a support thread — either the school (admin/staff) or the
// Scoolg super-admin team. The ticket's opening `message` is the first bubble;
// `replies` holds everything after it.
const ReplySchema = new mongoose.Schema({
    from: { type: String, enum: ['school', 'superadmin'], required: true },
    authorName: { type: String, default: '' },
    text: { type: String, required: true },
}, { timestamps: true });

// Support ticket raised by a school from the admin panel; surfaced to the
// super-admin panel for triage/reply/resolution. Scoped by the School's STRING
// `id` (the tenant key both panels resolve schools by), with a few denormalized
// fields so the super-admin list renders without a join.
const SupportTicketSchema = new mongoose.Schema({
    schoolId: { type: String, required: true, index: true },   // School.id (string tenant key)
    schoolName: { type: String, default: '' },
    schoolEmail: { type: String, default: '' },
    campusCode: { type: String, default: '' },
    raisedByName: { type: String, default: '' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    // category/priority are free-form labels chosen in the admin panel UI (kept
    // as plain strings so new UI options never trip Mongoose enum validation).
    category: { type: String, default: 'General' },
    priority: { type: String, default: 'Normal' },
    status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
    replies: { type: [ReplySchema], default: [] },
    lastActivityAt: { type: Date, default: Date.now },
}, { timestamps: true });

SupportTicketSchema.index({ schoolId: 1, status: 1, createdAt: -1 });

export const SupportTicket = mongoose.models.SupportTicket || mongoose.model('SupportTicket', SupportTicketSchema);
export default SupportTicket;
