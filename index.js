// Archivo: index.js

// --- CONFIGURACIÓN DE SWAGGER PARA TIENDA GAMER ---
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Tienda Gamer',
      version: '1.0.0',
      description: 'Documentación técnica de la API para gestionar productos, categorías, usuarios e imágenes de la Tienda Gamer.',
      contact: {
        name: 'Roy12331', // Puedes poner tu nombre o alias
        url: 'https://github.com/Roy12331/tienda-gamer-api', // Enlace a tu repositorio
      },
    },
    servers: [
      {
        url: 'https://tienda-gamer-api.onrender.com',
        description: 'Servidor de Producción',
      },
    ],
    // Definimos el esquema de seguridad (Bearer Token JWT)
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa el token JWT obtenido en el login. Ejemplo: Bearer eyJhbGci...'
        }
      }
    },
  },
  // Le decimos a Swagger que lea la documentación de TODOS nuestros archivos de rutas
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Servimos la documentación en la ruta /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
