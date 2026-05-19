const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['customer', 'provider'],
        default: 'customer'
    },
    location: {
        latitude: Number,
        longitude: Number,
        address: String,
        updatedAt: Date
    },
    profile: {
        firstName: String,
        lastName: String,
        phone: String,
        avatar: String
    },
    reputation_score: {
        type: Number,
        default: 100
    },
    loyalty_points: {
        type: Number,
        default: 0
    },
    name: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
