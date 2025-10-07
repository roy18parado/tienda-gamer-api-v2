// Archivo: /routes/categorias.js (Versión Documentada con Swagger)

const express = require('express');
const db = require('../db');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

/**
 * @swagger
 * components:
 * schemas:
 * Categoria:
 * type: object
 * required:
 * - nombre
 * properties:
 * id:
 * type: integer
 * description: El ID autogenerado de la categoría.
 * nombre:
 * type: string
 * description: El nombre de la categoría.
 * example:
 * id: 1
 * nombre: "Monitores"
 */

/**
 * @swagger
 * tags:
 * name: Categorias
 * description: API para la gestión de categorías de productos.
 */

/**
 * @swagger
 * /categorias:
 * get:
 * summary: Devuelve la lista de todas las categorías.
 * tags: [Categorias]
 * responses:
 * 200:
 * description: La lista de categorías.
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * $ref: '#/components/schemas/Categoria'
 */
router.get('/', async (req, res) => {
    // ... (tu código de la ruta GET no cambia)
});

/**
 * @swagger
 * /categorias:
 * post:
 * summary: Crea una nueva categoría.
 * tags: [Categorias]
 * security:
 * - BearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * nombre:
 * type: string
 * example:
 * nombre: "Teclados Mecánicos"
 * responses:
 * 201:
 * description: La categoría fue creada exitosamente.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/Categoria'
 * 401:
 * description: No autorizado (token no válido o no proporcionado).
 * 403:
 * description: Permiso denegado (el rol no es admin/super).
 */
router.post('/', requireRole('admin', 'super'), async (req, res) => {
    // ... (tu código de la ruta POST no cambia)
});

// ... (continúa con el resto de tus rutas PUT y DELETE, el código interno no cambia)

module.exports = router;