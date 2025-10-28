// Archivo: index.js (Versión Corregida - CORS ANTES de IP)

const express = require('express');
const cors = require('cors');
const path = require('path');
const ipRangeCheck = require('ip-range-check');

const app = express();
app.use(express.json()); // 1. Parsear JSON
app.set('trust proxy', 1); // 2. Confiar en proxy para req.ip

// --- CONFIGURACIÓN CORS (PRIMERO) ---
// 3. Aplicar CORS ANTES del filtro de IP.
//    Esto asegura que las peticiones OPTIONS (preflight) se manejen correctamente.
app.use(cors({
    origin: '*', // Permitir cualquier origen (ya que filtraremos IP después)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Cabeceras permitidas
}));

// --- SEGURIDAD DE IP (SEGUNDO) ---

// 4. Lista de IPs/Rangos Permitidos
const whitelist = [
  '45.232.149.130',  // Instituto
  '45.232.149.146',  // Otra IP Instituto?
  '168.194.102.140', // Tu Casa
  '34.82.242.193',   // Otra IP Render?
  '201.230.105.234',
  '10.214.0.0/16'    // Rango Interno Render
];

// 5. Middleware para validar IP
const ipWhitelistMiddleware = (req, res, next) => {
  // Las peticiones OPTIONS no siempre tienen IP fiable o no necesitan este chequeo
  if (req.method === 'OPTIONS') {
    return next(); // Saltar chequeo de IP para OPTIONS
  }

  const clientIp = req.ip;
  console.log(`🛡️ IP recibida para ${req.method} ${req.path}: ${clientIp}`);

  if (ipRangeCheck(clientIp, whitelist)) {
    console.log(`✅ IP AUTORIZADA: ${clientIp}`);
    next(); // IP OK, continuar
  } else {
    console.log(`❌ IP NO AUTORIZADA: ${clientIp}`);
    return res.status(403).json({
      error: `Acceso prohibido desde IP no autorizada: ${clientIp}`
    });
  }
};

// 6. Aplicar el Middleware de IP DESPUÉS de CORS
app.use(ipWhitelistMiddleware);


// --- RUTAS ---
// (El resto de tus rutas, Swagger, Error Handler y app.listen no cambian)

// Rutas de Información/Estado
app.get('/', (req, res) => {
  res.json({ /* ... tu mensaje de bienvenida ... */ });
});
// ... (otras rutas /info, /status) ...

// Rutas Principales de la API
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

// --- SWAGGER ---
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { /* ... */ },
    servers: [{ url: 'https://tienda-api-v2.onrender.com' }], // TU URL NUEVA
    components: { /* ... */ },
  },
  apis: [path.join(__dirname, './routes/*.js')],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- MANEJO DE ERRORES (Al final) ---
app.use((err, req, res, next) => {
  console.error('❌ Error interno del servidor:', err.message || err);
  res.status(500).json({ /* ... tu error genérico ... */ });
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 IPs permitidas: ${whitelist.join(', ')}`);
  console.log(`📚 Documentación disponible en: /api-docs`);
});
