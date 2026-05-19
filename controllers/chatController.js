const workflowAgent = require('../services/WorkflowAgent');
const AgentTrace = require('../models/AgentTrace');

exports.processChat = async (req, res) => {
    try {
        const { message, city, location } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required." });
        }

        const result = await workflowAgent.processRequest(message, city || "Islamabad", location);
        res.json(result);
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

exports.getTraces = async (req, res) => {
    try {
        const traces = await AgentTrace.find().sort({ timestamp: -1 }).limit(50);
        res.json({ success: true, traces });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
