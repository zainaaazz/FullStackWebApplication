const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'Your API description here',
        },
        servers: [
            {
                url: 'hmssystem.azurewebsites.nett', //Azure URL
                description: 'Production server', //
            },
            {
                url: 'http://localhost:3000', // local development
                description: 'Local server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter in format Bearer <token>',
                },
            },
        },
        security: [
            {
                bearerAuth: [], // Apply Bearer Auth to all routes by default
            },
        ],
    },
    apis: ['./routes/*.js'], // Adjust this to your routes
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
    swaggerUi,
    swaggerDocs,
};
