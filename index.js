// Archivo: index.js (Versión Simplificada sin dependencia ip)
const express = require('express');
const cors = require('cors');
const path = require('path');
const ipRangeCheck = require('ip-range-check');

const app = express();
app.set('trust proxy', 1);

// Lista de IPs permitidas
const whitelist = [
  '45.232.149.130',      // IP pública permitida
  '45.232.149.146',      // IP 146 añadida correctamente
  '10.214.0.0/16'        // rango interno permitido
];

// Middleware CORS MEJORADO - ponerlo PRIMERO
const allowedOrigins = [
  'http://45.232.149.130',
  'http://45.232.149.146' // Añadir la IP 146 aquí también
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin Origin (Postman, etc.)
    if (!origin) return callback(null, true);
    
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

// CORS PRIMERO
app.use(cors(corsOptions));
app.use(express.json());

// Middleware para validar IP de cliente SIMPLIFICADO
const ipWhitelistMiddleware = (req, res, next) => {
  try {
    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : req.ip;

    // Limpiar IP - remover prefijo IPv6 si existe
    const ipClean = clientIp.replace(/::ffff:/, ''); 
    
    console.log(`🛡️ IP recibida: ${clientIp} ➜ Limpia: ${ipClean}`);

    // Verificar si la IP está en whitelist
    if (ipRangeCheck(ipClean, whitelist)) {
      console.log(`✅ IP AUTORIZADA: ${ipClean}`);
      next();
    } else {
      console.log(`❌ IP NO AUTORIZADA: ${ipClean}`);
      return res.status(403).json({
        error: `Acceso prohibido desde IP no autorizada: ${ipClean}`,
        ipRecibida: ipClean,
        ipsPermitidas: whitelist
      });
    }
  } catch (error) {
    console.error('❌ Error en middleware de IP:', error);
    // En caso de error, permitir continuar para debugging
    next();
  }
};

// Aplicar middleware de IP después de CORS
app.use(ipWhitelistMiddleware);

// Middleware de manejo de errores MEJORADO
app.use((err, req, res, next) => {
  console.error('❌ Error interno del servidor:', err.message);
  
  // Si es error de CORS
  if (err.message.includes('CORS')) {
    return res.status(403).json({ 
      error: 'Acceso CORS denegado',
      detalles: err.message 
    });
  }
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    detalles: process.env.NODE_ENV === 'development' ? err.message : 'Contacta al administrador'
  });
});

// RUTAS DE LA API (sin cambios)
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

// CONFIGURACIÓN DE SWAGGER (sin cambios)
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

// Ruta de salud para testing
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    ipCliente: req.ip,
    headers: req.headers
  });
});

// INICIO DEL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 IPs permitidas: ${whitelist.join(', ')}`);
  console.log(`🌐 Orígenes CORS permitidos: ${allowedOrigins.join(', ')}`);
});
