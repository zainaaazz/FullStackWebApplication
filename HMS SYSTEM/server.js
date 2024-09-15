const express = require('express');
const { swaggerUi, swaggerDocs } = require('./swaggerConfig');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');  // Ensure courseRoutes is registered
const moduleRoutes = require('./routes/moduleRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const videoRoutes = require('./routes/videoRoutes');  // Video routes
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Register routes
app.use('/users', userRoutes);
app.use('/courses', courseRoutes);  // Register the /courses route
app.use('/modules', moduleRoutes);
app.use('/assignments', assignmentRoutes);
app.use('/videos', videoRoutes);  // Register /videos route
app.use('/enrollments', enrollmentRoutes);
app.use('/feedbacks', feedbackRoutes);
app.use('/submissions', submissionRoutes);
app.use('/auth', authRoutes);

// Swagger setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});
