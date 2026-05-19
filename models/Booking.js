const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProviderProfile',
        required: true
    },
    service_type: String,
    complexity: {
        type: String,
        enum: ['basic', 'intermediate', 'complex'],
        default: 'basic'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'en-route', 'in-progress', 'completed', 'cancelled', 'disputed'],
        default: 'pending'
    },
    scheduled_time: Date,
    startTime: Date,
    actual_start_time: Date,
    actual_end_time: Date,
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    quote: {
        base_price: Number,
        surge_fee: Number,
        distance_fee: Number,
        complexity_fee: Number,
        total_amount: Number,
        currency: { type: String, default: 'PKR' }
    },
    feedback: {
        rating: Number,
        comment: String,
        timestamp: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
