const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'JobStacker API',
            version: '1.0.0',
            description: 'API documentation for the JobStacker job application tracker',
        },
        servers: [
            { url: 'http://localhost:3001', description: 'Development server' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
