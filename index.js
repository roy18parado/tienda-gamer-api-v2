// Archivo: index.js (Versión Corregida - Orden y CORS Correctos)

const express = require('express');
const cors = require('cors');
const path = require('path');
const ipRangeCheck = require('ip-range-check');

const app = express();
app.use(express.json()); // 1. Parsear JSON (debe ir antes de las rutas)
app.set('trust proxy', 1); // 2. Confiar en el proxy para req.ip

// --- SEGURIDAD ---

// 3. Lista de IPs/Rangos Permitidos
const whitelist = [
  '45.232.149.130',  // Instituto
  '45.232.149.146',  // Otra IP Instituto?
  '168.194.102.140', // Tu Casa
  '34.82.242.193',   // Otra IP Render?
  '10.214.0.0/16'    // Rango Interno Render
];

// 4. Middleware para validar IP (PRIMERO)
const ipWhitelistMiddleware = (req, res, next) => {
  const clientIp = req.ip; // Usar req.ip es más fiable con 'trust proxy'
  console.log(`🛡️ IP recibida: ${clientIp}`);

  if (ipRangeCheck(clientIp, whitelist)) {
    console.log(`✅ IP AUTORIZADA: ${clientIp}`);
    next(); // IP OK, continuar
  } else {
    console.log(`❌ IP NO AUTORIZADA: ${clientIp}`);
    // ¡IMPORTANTE! Devolver error si la IP no está permitida
    return res.status(403).json({
      error: `Acceso prohibido desde IP no autorizada: ${clientIp}`
    });
  }
};

// 5. Aplicar el Middleware de IP PRIMERO
app.use(ipWhitelistMiddleware);

// 6. Configurar y Aplicar CORS (DESPUÉS de IP)
// Ahora que la IP está validada, podemos ser flexibles con el origen.
// '*' permite cualquier origen (incluyendo 'null' de archivos locales)
app.use(cors({ origin: '*' }));


// --- RUTAS ---

// Rutas de Información/Estado
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API de Tienda Gamer funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: { /* ... tus endpoints ... */ },
    status: 'active'
  });
});
// ... (Tus otras rutas /info, /status si las quieres mantener) ...

// Rutas Principales de la API
const authRoutes = require('./routes/auth');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');
const usuariosRoutes = require('./routes/usuarios');

app.use('/', authRoutes); // Contiene /login
app.use('/categorias', categoriasRoutes);
app.use('/productos', productosRoutes);
app.use('/imagenes', imagenesRoutes);
app.use('/usuarios', usuariosRoutes);

// --- SWAGGER ---
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
    servers: [{ url: 'https://tienda-api-v2.onrender.com' }], // USA TU URL NUEVA
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

// --- MANEJO DE ERRORES (Al final de todo) ---
app.use((err, req, res, next) => {
  console.error('❌ Error interno del servidor:', err.message || err);
  res.status(500).json({
    error: 'Error interno del servidor',
    // Mostrar detalles solo en desarrollo podría ser una opción
    detalles: err.message
  });
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 IPs permitidas: ${whitelist.join(', ')}`);
  console.log(`📚 Documentación disponible en: /api-docs`);
});
