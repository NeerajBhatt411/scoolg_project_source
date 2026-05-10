import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Scoolg API Documentation',
            version: '1.0.0',
            description: 'API documentation for Scoolg Student and Admin ERP',
        },
        servers: [
            {
                url: 'https://scoolg-backend.onrender.com', // Placeholder for production
                description: 'Production Server',
            },
            {
                url: 'http://localhost:5001',
                description: 'Local Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{
            bearerAuth: []
        }],
    },
    apis: ['./server.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
fs.writeFileSync('./docs/swagger.json', JSON.stringify(swaggerDocs, null, 2));
console.log('Swagger JSON generated in ./docs/swagger.json');
