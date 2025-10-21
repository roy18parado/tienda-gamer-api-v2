// Archivo: index.js (Versión Definitiva con Verificación de Rango de IP)

const express = require('express');
const cors = require('cors');
const path = require('path');
const ipRangeCheck = require('ip-range-check'); // <-- 1. IMPORTAMOS LA NUEVA HERRAMIENTA

const app = express();
app.use(express.json());
app.set('trust proxy', 1);

// --- MIDDLEWARE DE SEGURIDAD POR IP (VERSIÓN FINAL) ---
const whitelist = [
    '45.232.149.130',      // IP del Instituto (Pública)
    '10.214.0.0/16'        // EL RANGO COMPLETO DE IPs INTERNAS DE RENDER
];

const ipWhitelistMiddleware = (req, res, next) => {
    const clientIp = req.ip;
    console.log(`Petición recibida desde la IP: ${clientIp}`);

    // Verificamos si la IP está en la lista o dentro del rango
    if (ipRangeCheck(clientIp, whitelist)) {
        next(); // Permitido
    } else {
        res.status(403).json({ error: `Acceso prohibido: Su dirección IP (${clientIp}) no está autorizada.` });
    }
};

app.use(ipWhitelistMiddleware);
app.use(cors());

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
