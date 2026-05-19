const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    initiatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    description: String,
    evidence_urls: [String],
    status: {
        type: String,
        enum: ['open', 'under-review', 'resolved', 'escalated'],
        default: 'open'
    },
    resolution_summary: String,
    refund_amount: { type: Number, default: 0 },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resolvedAt: Date
});

module.exports = mongoose.model('Dispute', disputeSchema);
