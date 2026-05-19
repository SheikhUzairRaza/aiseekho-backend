const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'antigravity_secret', {
        expiresIn: '30d',
    });
};

exports.signup = async (req, res) => {
    try {
        const { email, password, role, name } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists." });
        }

        const user = await User.create({ email, password, role, name });
        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            const token = generateToken(user._id, user.role);
            res.json({
                success: true,
                token,
                user: { 
                    id: user._id, 
                    email: user.email, 
                    name: user.name, 
                    role: user.role, 
                    location: user.location,
                    balance: user.balance,
                    rating: user.rating,
                    completedJobs: user.completedJobs
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
