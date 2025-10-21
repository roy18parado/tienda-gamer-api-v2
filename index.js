// Archivo: index.js (Versión Definitiva - Solo Instituto)

// --- 1. IMPORTACIONES ---
const express = require('express');
const cors = require('cors');
const path = require('path');
const ipRangeCheck = require('ip-range-check'); // Herramienta para IPs

// --- 2. INICIALIZACIÓN DE LA APP ---
const app = express();
app.use(express.json());

// --- 3. CONFIGURACIÓN DE SEGURIDAD ---

// Habilitamos esto para que Express confíe en la información del proxy de Render
// y nos dé la IP real del visitante en `req.ip`.
app.set('trust proxy', 1);

// Definimos la lista de IPs y RANGOS permitidos
// Solo permitimos la IP pública del instituto Y el rango interno de Render
// por donde sabemos que entran las peticiones.
const whitelist = [
    '45.232.149.130',      // IP pública del Instituto
    '10.214.0.0/16'        // Rango de IPs internas de Render
];

// Creamos nuestro "portero" (Middleware de seguridad de IP)
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

// --- 4. APLICACIÓN DE MIDDLEWARES ---

// 1ro: Aplicamos nuestro portero de IP a TODAS las peticiones
app.use(ipWhitelistMiddleware);

// 2do: Aplicamos CORS. Solo las IPs que pasaron el primer filtro llegarán aquí.
app.use(cors());


// --- 5. RUTAS DE LA API (Tu estructura) ---
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

// --- 6. DOCUMENTACIÓN SWAGGER (Tu estructura) ---
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

// --- 7. INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
