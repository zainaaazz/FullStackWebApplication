const express = require('express');
const { swaggerUi, swaggerDocs } = require('./swaggerConfig');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const videoRoutes = require('./routes/videoRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const authRoutes = require('./routes/authRoutes');
const utilityRoutes = require('./routes/utilityRoutes');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// Redirect root to Swagger UI
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

// Register routes
app.use('/users', userRoutes);
app.use('/courses', courseRoutes);
app.use('/modules', moduleRoutes);
app.use('/assignments', assignmentRoutes);
app.use('/videos', videoRoutes);
app.use('/enrollments', enrollmentRoutes);
app.use('/feedbacks', feedbackRoutes);
app.use('/submissions', submissionRoutes);
app.use('/auth', authRoutes);
app.use('/api', utilityRoutes);

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});
