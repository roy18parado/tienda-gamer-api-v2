// Archivo: index.js (Versión Definitiva con CORS y Verificación de IP)

const express = require('express');
const cors = require('cors');
const path = require('path');
const ipRangeCheck = require('ip-range-check');

const app = express();
app.set('trust proxy', 1); // importante para req.ip correcto detrás de proxies

// Lista de IPs permitidas (para middleware personalizado)
const whitelist = [
  '45.232.149.130',      // IP pública permitida}
  '45.232.149.146',
  '10.214.0.0/16'        // rango interno permitido
];

// Middleware para validar IP de cliente
const ipWhitelistMiddleware = (req, res, next) => {
  // Detecta IP real del cliente
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.connection.remoteAddress;
  console.log(`Petición recibida desde la IP: ${clientIp}`);

  if (ipRangeCheck(clientIp, whitelist)) {
    next();
  } else {
    res.status(403).json({ error: `Acceso prohibido: Su dirección IP (${clientIp}) no está autorizada.` });
  }
};

// Middleware CORS configurado para permitir solo el origen desde tu IP pública
const allowedOrigins = ['http://45.232.149.130']; // Cambiar a https:// si usas HTTPS

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      // Bloquea solicitudes sin encabezado Origin (ej: Postman, cURL)
      return callback(new Error('CORS: Sin origen no permitido'));
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🛑 CORS bloqueado: origen no permitido -> ${origin}`);
      callback(new Error('CORS: Origen no permitido'));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true
};

// Asegura que el orden sea: IP whitelist primero, luego CORS
app.use(ipWhitelistMiddleware);
app.use(cors(corsOptions));
app.use(express.json());

// RUTAS DE LA API
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

// CONFIGURACIÓN DE SWAGGER
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Tienda Gamer',
      version: '1.0.0',
      description: 'Documentación técnica completa de la API.',
    },
    servers: [{ url: 'https://tienda-gamer-api.onrender.com' }],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
  },
  apis: [path.join(__dirname, './routes/*.js')],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// INICIO DEL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
