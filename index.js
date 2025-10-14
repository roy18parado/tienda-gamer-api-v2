// Archivo: index.js (Versión Completa y Corregida)

const express = require('express');
const cors = require('cors');

// 1. INICIALIZAR LA APLICACIÓN (Esto faltaba y causaba el error 'app is not defined')
const app = express();

// 2. MIDDLEWARES (Configuraciones que se ejecutan en cada petición)
app.use(express.json()); // Para que Express entienda peticiones con cuerpo JSON

// --- CONFIGURACIÓN DE SEGURIDAD CORS ---
app.set('trust proxy', 1); // Necesario para que req.ip funcione correctamente en Render
const whitelist = ['45.232.149.130']; // IP del instituto

const corsOptions = {
    origin: function (origin, callback) {
        // En producción, 'req.ip' contendrá la IP real del visitante.
        // Para pruebas locales, puede que necesites añadir tu IP a la whitelist.
        const clientIp = this.req.ip;
        if (whitelist.indexOf(clientIp) !== -1 || !origin) {
            // Permite la petición si la IP está en la lista o si no tiene origen (ej: Postman)
            callback(null, true);
        } else {
            // Rechaza la petición si la IP no está en la lista
            callback(new Error('Acceso denegado por políticas de CORS'));
        }
    }
};
// Descomenta la siguiente línea para activar la seguridad CORS por IP
// app.use(cors(corsOptions));

// Por ahora, usamos un CORS más abierto para facilitar el desarrollo y pruebas
app.use(cors());

// 3. RUTAS DE LA API (Conectando todos tus archivos de la carpeta /routes)
const authRoutes = require('./routes/auth');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');
const usuariosRoutes = require('./routes/usuarios');

app.use('/', authRoutes); // para /login
app.use('/categorias', categoriasRoutes);
app.use('/productos', productosRoutes);
app.use('/imagenes', imagenesRoutes);
app.use('/usuarios', usuariosRoutes);

// 4. CONFIGURACIÓN DE SWAGGER
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Tienda Gamer',
      version: '1.0.0',
      description: 'Documentación técnica completa de la API para la Tienda Gamer.',
    },
    servers: [{ url: 'https://tienda-gamer-api.onrender.com' }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http', scheme: 'bearer', bearerFormat: 'JWT',
          description: 'Ingresa el token JWT obtenido en el login. Formato: Bearer <token>'
        }
      }
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 5. INICIO DEL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
