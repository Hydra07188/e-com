const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const dbPromise = require('../database');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_change_this_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const SALT_ROUNDS = 10;
const AUTH_USER_FILE = path.join(__dirname, '..', 'auth_user.json');
const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

function buildUserResponse(user) {
    return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        registrationDate: user.registrationDate
    };
}

function signToken(user) {
    return jwt.sign(
        {
            sub: String(user.id),
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

function readAuthUsers() {
    if (!fs.existsSync(AUTH_USER_FILE)) {
        return [];
    }

    return JSON.parse(fs.readFileSync(AUTH_USER_FILE, 'utf8'));
}

function writeAuthUsers(users) {
    fs.writeFileSync(AUTH_USER_FILE, `${JSON.stringify(users, null, 2)}\n`, 'utf8');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Authentication token is required.' });
    }

    try {
        req.auth = jwt.verify(token, JWT_SECRET);
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}

router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName } = req.body;
        const normalizedEmail = email ? email.trim().toLowerCase() : '';
        const normalizedFirstName = firstName ? firstName.trim() : '';

        if (!normalizedFirstName || !normalizedEmail || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({ error: 'Please enter a valid email address.' });
        }

        if (!PASSWORD_RULE.test(password)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters and include one uppercase letter and one symbol.'
            });
        }

        const db = await dbPromise;
        const authUsers = readAuthUsers();
        const existingJsonUser = authUsers.some((user) => user.username.toLowerCase() === normalizedEmail);
        const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);

        if (existingJsonUser || existingUser) {
            return res.status(409).json({ error: 'Email is already registered.' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const registrationDate = new Date().toISOString();

        authUsers.push({
            username: normalizedEmail,
            password: passwordHash,
            firstName: normalizedFirstName,
            registrationDate
        });
        writeAuthUsers(authUsers);

        const result = await db.run(
            'INSERT INTO users (email, password, firstName, registrationDate) VALUES (?, ?, ?, ?)',
            [normalizedEmail, passwordHash, normalizedFirstName, registrationDate]
        );

        const user = await db.get(
            'SELECT id, email, firstName, registrationDate FROM users WHERE id = ?',
            [result.lastID]
        );
        const token = signToken(user);

        return res.status(201).json({
            message: 'Registration successful',
            token,
            user: buildUserResponse(user)
        });
    } catch (error) {
        console.error('Register Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const db = await dbPromise;
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = signToken(user);

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: buildUserResponse(user)
        });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/me', authenticateToken, async (req, res) => {
    try {
        const db = await dbPromise;
        const user = await db.get(
            'SELECT id, email, firstName, registrationDate FROM users WHERE id = ?',
            [req.auth.sub]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        return res.status(200).json({ user: buildUserResponse(user) });
    } catch (error) {
        console.error('Profile Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
module.exports.authenticateToken = authenticateToken;
