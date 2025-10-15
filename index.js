// Archivo: index.js (Versión Final con Ruta Absoluta para Swagger)

const express = require('express');
const cors = require('cors');
const path = require('path'); // <-- PASO 1: IMPORTAR PATH

// 1. INICIALIZAR LA APLICACIÓN
const app = express();

// 2. MIDDLEWARES
app.use(express.json());
app.set('trust proxy', 1);

// --- CONFIGURACIÓN DE SEGURIDAD CORS ---
const whitelist = ['45.232.149.130'];
const corsOptions = {
  origin: function (origin, callback) {
    const clientIp = this.req.ip;
    if (whitelist.indexOf(clientIp) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Acceso denegado por políticas de CORS'));
    }
  }
};
app.use(cors(corsOptions));


// 3. RUTAS DE LA API
const authRoutes = require('./routes/auth');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');
const usuariosRoutes = require('./routes/usuarios');

app.use('/', authRoutes);
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
  // PASO 2: USAR LA RUTA ABSOLUTA
  apis: [path.join(__dirname, './routes/*.js')], 
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 5. INICIO DEL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
