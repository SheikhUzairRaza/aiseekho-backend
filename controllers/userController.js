const User = require('../models/User');

exports.updateLocation = async (req, res) => {
    try {
        const { location } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { location: { ...location, updatedAt: new Date() } },
            { new: true }
        );
        res.json({ success: true, location: user.location });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
