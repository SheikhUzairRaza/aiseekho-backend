const workflowAgent = require('../services/WorkflowAgent');
const Booking = require('../models/Booking');

exports.confirmBooking = async (req, res) => {
    try {
        const { providerId, serviceType, amount, scheduledWindow, startTime } = req.body;
        
        // Check for double booking
        const overlapping = await Booking.findOne({
            providerId,
            startTime: { $gte: new Date(new Date(startTime).getTime() - 60 * 60 * 1000), $lte: new Date(new Date(startTime).getTime() + 60 * 60 * 1000) },
            status: { $in: ['pending', 'confirmed', 'en-route', 'in-progress'] }
        });

        let finalStartTime = new Date(startTime);
        let finalWindow = scheduledWindow;
        let rescheduled = false;

        if (overlapping) {
            // Push it by 1 hour
            finalStartTime = new Date(new Date(startTime).getTime() + 60 * 60 * 1000);
            const hourStr = finalStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const nextHourStr = new Date(finalStartTime.getTime() + 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            finalWindow = `Today, ${hourStr} - ${nextHourStr}`;
            rescheduled = true;
        }

        const bookingId = `BKG-${Math.floor(100000 + Math.random() * 900000)}`;
        
        const booking = new Booking({
            bookingId,
            customerId: req.user?._id || '000000000000000000000000', // Allow demo mode
            providerId,
            service_type: serviceType,
            status: 'confirmed',
            scheduled_time: finalStartTime,
            startTime: finalStartTime,
            quote: {
                total_amount: amount
            }
        });

        // Don't save if customerId is fake demo id
        if (req.user?._id) {
            await booking.save();
        }

        res.json({
            success: true,
            rescheduled,
            receipt: {
                booking_id: bookingId,
                status: 'CONFIRMED',
                scheduled_window: finalWindow,
                startTime: finalStartTime,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.completeBooking = async (req, res) => {
    try {
        const { bookingId, feedback, rating } = req.body;
        const result = await workflowAgent.completeService(bookingId, feedback, rating);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.fileDispute = async (req, res) => {
    try {
        const { booking, complaint } = req.body;
        const result = await workflowAgent.processDispute(booking, complaint);
        
        if (booking.booking_id) {
            await Booking.findOneAndUpdate(
                { bookingId: booking.booking_id },
                { status: 'disputed' }
            );
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const bookings = await Booking.find({
            $or: [{ customerId: req.user._id }, { providerId: req.user._id }]
        }).sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.simulateCancel = async (req, res) => {
    try {
        const { intent, currentProviderId } = req.body;
        
        // Rematch to find the 2nd best
        const matcherAgent = require('../services/MatcherAgent');
        const topProviders = await matcherAgent.matchProviders(intent);
        const newProvider = topProviders.find(p => p.id !== currentProviderId);

        if (newProvider) {
            const quote = await workflowAgent.generateDynamicQuote(intent, newProvider);
            const receipt = {
                booking_id: `BKG-${Math.floor(Math.random() * 100000)}`,
                provider_name: newProvider.name,
                service: newProvider.service_category,
                total_amount: quote.final_price,
                status: "RE-CONFIRMED",
                timestamp: new Date().toISOString()
            };
            
            res.json({
                success: true,
                message: `Provider cancelled. Successfully rerouted to ${newProvider.name}.`,
                provider: newProvider,
                quote,
                receipt
            });
        } else {
            res.status(404).json({ success: false, message: "No alternative provider found." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProviderAnalytics = async (req, res) => {
    try {
        const result = workflowAgent.getProviderAnalytics(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
