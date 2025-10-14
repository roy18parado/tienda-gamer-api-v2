/**
 * @swagger
 * components:
 *   schemas:
 *     Categoria:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         id:
 *           type: integer
 *           description: El ID autogenerado de la categoría.
 *         nombre:
 *           type: string
 *           description: El nombre de la categoría.
 *       example:
 *         id: 1
 *         nombre: "Monitores"
 */

/**
 * @swagger
 * tags:
 *   - name: Categorias
 *     description: API para la gestión de categorías de productos.
 */

/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: Devuelve la lista de todas las categorías.
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: La lista de categorías.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Categoria'
 */
