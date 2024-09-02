const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}, http://localhost:3000/api-docs/`);
});


