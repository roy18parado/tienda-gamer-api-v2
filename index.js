// Archivo: index.js (Versión Definitiva con Verificación de Rango de IP)

const express = require('express');
const cors = require('cors');
const path = require('path');
const ipRangeCheck = require('ip-range-check'); // <-- 1. IMPORTAMOS LA NUEVA HERRAMIENTA

// 1. INICIALIZAR LA APLICACIÓN
const app = express();

// 2. MIDDLEWARES BÁSICOS
app.use(express.json());
app.set('trust proxy', 1);

// --- MIDDLEWARE DE SEGURIDAD POR IP (VERSIÓN FINAL) ---
// 2. DEFINIMOS LAS IPs Y LOS RANGOS PERMITIDOS
const whitelist = [
    '45.232.149.130',      // IP del Instituto
    '168.194.102.140',     // Tu IP de casa
    '10.214.0.0/16'        // <-- EL RANGO COMPLETO DE IPs INTERNAS DE RENDER
];

const ipWhitelistMiddleware = (req, res, next) => {
    const clientIp = req.ip;

    console.log(`Petición recibida desde la IP: ${clientIp}`);

    // 3. VERIFICAMOS LA IP CONTRA LA LISTA (INCLUYENDO EL RANGO)
    const isAllowed = ipRangeCheck(clientIp, whitelist);

    if (isAllowed) {
        // Si la IP coincide directamente o está dentro del rango, permitimos el paso.
        next();
    } else {
        // Si no, la bloqueamos.
        res.status(403).json({ error: `Acceso prohibido: Su dirección IP (${clientIp}) no está autorizada.` });
    }
};

// 3. APLICAMOS LA SEGURIDAD
app.use(ipWhitelistMiddleware);
app.use(cors());


// 4. RUTAS DE LA API (No cambian)
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

// 5. CONFIGURACIÓN DE SWAGGER (No cambia)
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
  apis: [path.join(__dirname, './routes/*.js')],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 6. INICIO DEL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
