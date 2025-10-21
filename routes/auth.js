// Archivo: /routes/auth.js (Corregido y Limpio)

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'CLAVE_SECRETA';

/**
 * @swagger
 * tags:
 * name: Autenticación
 * description: Endpoints para el inicio de sesión.
 *
 * components:
 * schemas:
 * LoginCredentials:
 * type: object
 * required: [username, password]
 * properties:
 * username:
 * type: string
 * example: "admin"
 * password:
 * type: string
 * example: "admin123"
 * LoginResponse:
 * type: object
 * properties:
 * token:
 * type: string
 * role:
 * type: string
 * ErrorResponse:
 * type: object
 * properties:
 * error:
 * type: string
 * example: "Usuario no encontrado"
 */

/**
 * @swagger
 * /login:
 * post:
 * summary: Inicia sesión y devuelve un token JWT.
 * tags: [Autenticación]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/LoginCredentials'
 * responses:
 * '200':
 * description: Login exitoso. Devuelve el token y el rol.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/LoginResponse'
 * '401':
 * description: Credenciales no válidas.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 * '400':
 * description: Faltan campos.
 * content:
 * application/json:
 * schema:
 * $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username y password requeridos' });
    try {
        const { rows } = await db.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        if (rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });
        const user = rows[0];
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ error: 'Contraseña incorrecta' });
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
