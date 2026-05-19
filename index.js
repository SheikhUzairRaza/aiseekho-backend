require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { setupSwagger } = require('./config/swagger');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Connect to Database
connectDB();

app.get('/', (req,res) => { 
    res.send('You are on get route')
})

app.use(cors());
app.use(express.json());

setupSwagger(app, port);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', bookingRoutes); // Some routes are at root for compatibility

app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
