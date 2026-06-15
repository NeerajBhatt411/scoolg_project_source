import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const PORT = process.env.PORT || 5001;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Scoolg API Documentation',
            version: '1.0.0',
            description: 'Full API documentation for Scoolg School Management System (Super Admin, School Admin, Student & Teacher apps)',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
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
        tags: [
            { name: 'Student App', description: 'APIs for Student/Parent Mobile App' },
            { name: 'Auth', description: 'Authentication & Session Management' },
            { name: 'Academic', description: 'Timetable, Attendance, Results' },
            { name: 'Admin', description: 'School Administration & Controls' },
        ],
    },
    // Scan the modular route files (and app) for @swagger JSDoc blocks.
    apis: ['./src/routes/*.js', './src/app.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Standard Swagger UI at /docs (Netlify Compatible with CDN)
const swaggerUiOptions = {
    explorer: true,
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js'
    ]
};

// Mounts /docs and /api-docs on the given app.
export const mountSwagger = (app) => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));
};

export { swaggerDocs, swaggerUiOptions };
