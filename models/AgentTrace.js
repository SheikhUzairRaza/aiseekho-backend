const mongoose = require('mongoose');

const agentTraceSchema = new mongoose.Schema({
    bookingId: {
        type: String, // Can be temporary ID before booking is saved
        index: true
    },
    agent: {
        type: String,
        required: true,
        enum: ['IntentAgent', 'MatcherAgent', 'PricingAgent', 'WorkflowAgent', 'DisputeAgent']
    },
    input: mongoose.Schema.Types.Mixed,
    output: mongoose.Schema.Types.Mixed,
    rationale: String,
    confidence_score: Number,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AgentTrace', agentTraceSchema);
