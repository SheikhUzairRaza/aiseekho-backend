const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: String,
    service_category: {
        type: String,
        required: true
    },
    skills: [String],
    experience_years: Number,
    base_rate: Number,
    availability: {
        morning: { type: Boolean, default: true },
        afternoon: { type: Boolean, default: true },
        evening: { type: Boolean, default: true }
    },
    metrics: {
        rating: { type: Number, default: 0 },
        review_count: { type: Number, default: 0 },
        reliability_score: { type: Number, default: 100 },
        cancellation_rate: { type: Number, default: 0 },
        on_time_score: { type: Number, default: 100 }
    },
    city: String,
    latitude: Number,
    longitude: Number,
    map_url: String,
    is_active: { type: Boolean, default: true }
});

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
