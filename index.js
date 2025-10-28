// Archivo: index.js (Versión Final - CORS Global, IP por Ruta)

const express = require('express');
const cors = require('cors');
const path = require('path');
const ipRangeCheck = require('ip-range-check');

const app = express();
app.use(express.json()); // 1. Parsear JSON
app.set('trust proxy', 1); // 2. Confiar en proxy para req.ip

// --- CONFIGURACIÓN CORS GLOBAL (PRIMERO Y ÚNICO) ---
// 3. Aplicar CORS globalmente ANTES de cualquier ruta o filtro de IP.
app.use(cors({
    origin: '*', // Permitir cualquier origen
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- MIDDLEWARE DE SEGURIDAD DE IP (Definición) ---
// 4. Lista de IPs/Rangos Permitidos
const whitelist = [
  '45.232.149.130',  // Instituto 1
  '45.232.149.146',  // Instituto 2
  '168.194.102.140', // Tu Casa
  '10.214.0.0/16',   // Rango Interno Render 1
  '10.204.0.0/16'    // Rango Interno Render 2
];

// 5. Función Middleware para validar IP (SIN app.use global)
const ipWhitelistMiddleware = (req, res, next) => {
  // Las peticiones OPTIONS ya fueron manejadas por cors(), las saltamos aquí también
  if (req.method === 'OPTIONS') {
    return next();
  }

  const clientIp = req.ip;
  console.log(`🛡️ IP recibida para ${req.method} ${req.path}: ${clientIp}`);

  if (ipRangeCheck(clientIp, whitelist)) {
    console.log(`✅ IP AUTORIZADA: ${clientIp}`);
    next(); // IP OK, continuar a la ruta específica
  } else {
    console.log(`❌ IP NO AUTORIZADA: ${clientIp}`);
    return res.status(403).json({
      error: `Acceso prohibido desde IP no autorizada: ${clientIp}`
    });
  }
};

// --- RUTAS ---

// Rutas Públicas (como /login, no necesitan filtro de IP aquí)
const authRoutes = require('./routes/auth');
app.use('/', authRoutes); // Login no necesita filtro IP (¿o sí? Depende de tu lógica)

// Rutas de Información (pueden ser públicas o necesitar filtro)
app.get('/', (req, res) => { // Ejemplo de ruta pública sin filtro IP
  res.json({ /* ... tu mensaje de bienvenida ... */ });
});

// Rutas Protegidas por IP (Aplicamos el middleware ANTES de las rutas)
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');
const usuariosRoutes = require('./routes/usuarios');

// 6. Aplicar filtro IP SOLO a las rutas que lo necesiten
app.use('/categorias', ipWhitelistMiddleware, categoriasRoutes);
app.use('/productos', ipWhitelistMiddleware, productosRoutes);
app.use('/imagenes', ipWhitelistMiddleware, imagenesRoutes);
app.use('/usuarios', ipWhitelistMiddleware, usuariosRoutes);


// --- SWAGGER ---
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
// (Asegúrate que tu auth.js esté limpio antes de habilitar Swagger)
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { /* ... */ },
    servers: [{ url: 'https://tienda-api-v2.onrender.com' }], // TU URL NUEVA
    components: { /* ... */ },
  },
  apis: [path.join(__dirname, './routes/*.js')],
};
try {
    const swaggerSpec = swaggerJSDoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("📚 Documentación Swagger configurada correctamente.");
} catch (yamlError) {
    console.error("❌ ERROR AL CONFIGURAR SWAGGER:", yamlError.message);
    // Opcional: Montar una ruta que muestre el error
    app.use('/api-docs', (req, res) => {
        res.status(500).json({ error: "Error al generar la documentación Swagger. Revisa auth.js.", detalles: yamlError.message });
    });
}


// --- MANEJO DE ERRORES (Al final) ---
app.use((err, req, res, next) => {
  console.error('❌ Error interno del servidor:', err.message || err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📋 IPs permitidas: ${whitelist.join(', ')}`);
});
