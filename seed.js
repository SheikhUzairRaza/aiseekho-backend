require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const ProviderProfile = require('./models/ProviderProfile');
const providersData = require('./data/providers.json');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-seekho');
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data
        await User.deleteMany({ role: 'provider' });
        await ProviderProfile.deleteMany({});

        for (const p of providersData) {
            // Create a dummy user for each provider
            const email = `${p.id}@aiseekho.com`;
            const user = await User.create({
                email,
                password: 'password123', // Default password
                role: 'provider'
            });

            await ProviderProfile.create({
                userId: user._id,
                name: p.name,
                service_category: p.service_category,
                skills: p.skills_array,
                base_rate: p.base_price,
                availability: {
                    morning: p.availability.includes('morning'),
                    afternoon: p.availability.includes('afternoon'),
                    evening: p.availability.includes('evening')
                },
                metrics: {
                    rating: p.rating,
                    reliability_score: p.reliability_score,
                    cancellation_rate: p.cancellation_rate
                },
                city: p.city,
                latitude: p.location_coordinates.lat,
                longitude: p.location_coordinates.lng,
                map_url: p.map_url
            });
        }

        console.log(`${providersData.length} providers seeded successfully!`);
        process.exit();
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedDB();
