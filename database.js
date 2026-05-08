const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'store.db');
const AUTH_USER_FILE = path.join(__dirname, 'auth_user.json');
const SALT_ROUNDS = 10;

const legacyMd5PasswordMap = {
    e10adc3949ba59abbe56e057f20f883e: '123456',
    '5f4dcc3b5aa765d61d8327deb882cf99': 'password',
    '21232f297a57a5a743894a0e4a801fc3': 'admin',
    '25d55ad283aa400af464c76d713c07ad': '12345678',
    d8578edf8458ce06fbc5bb76a58c5ca4c: 'qwerty',
    '25f9e794323b453885f5181f1b624d0b': '123456789',
    '81dc9bdb52d04dc20036dbd8313ed055': '1234',
    '96e79218965eb72c92a549dd5a330112': '111111',
    '827ccb0eea8a706c4c34a16891f84e7b': '12345',
    '098f6bcd4621d373cade4e832627b4f6': 'test'
};

async function ensureColumn(db, tableName, columnName, definition) {
    const columns = await db.all(`PRAGMA table_info(${tableName})`);
    const hasColumn = columns.some((column) => column.name === columnName);

    if (!hasColumn) {
        await db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
    }
}

function loadSeedUsers() {
    if (!fs.existsSync(AUTH_USER_FILE)) {
        return [
            {
                username: 'john@example.com',
                password: legacyMd5PasswordMap.e10adc3949ba59abbe56e057f20f883e,
                firstName: 'John',
                registrationDate: '2026-05-01T08:00:00Z'
            },
            {
                username: 'jane@example.com',
                password: legacyMd5PasswordMap['5f4dcc3b5aa765d61d8327deb882cf99'],
                firstName: 'Jane',
                registrationDate: '2026-05-01T09:15:00Z'
            }
        ];
    }

    const rawUsers = JSON.parse(fs.readFileSync(AUTH_USER_FILE, 'utf8'));

    return rawUsers.map((user) => {
        if (user.password?.startsWith('$2')) {
            return {
                username: user.username,
                passwordHash: user.password,
                firstName: user.firstName,
                registrationDate: user.registrationDate
            };
        }

        return {
            username: user.username,
            password: legacyMd5PasswordMap[user.password] || user.password,
            firstName: user.firstName,
            registrationDate: user.registrationDate
        };
    });
}

async function seedProducts(db) {
    const { count } = await db.get('SELECT COUNT(*) as count FROM Products');

    if (count > 0) {
        return;
    }

    await db.run(`INSERT INTO Products (url, image, title, price, category) VALUES 
        ('#', 'images/product-3.png', 'Nordic Chair', 50.00, 'chair'),
        ('#', 'images/product-1.png', 'Kruzo Aero Chair', 78.00, 'chair'),
        ('#', 'images/product-2.png', 'Ergonomic Office Chair', 43.00, 'chair'),
        ('#', 'images/product-3.png', 'Modern Lounge Sofa', 150.00, 'sofa'),
        ('#', 'images/product-1.png', 'Minimalist Dining Table', 200.00, 'table'),
        ('#', 'images/product-2.png', 'Studio Desk Lamp', 35.00, 'lamp')
    `);
}

async function seedUsers(db) {
    const users = loadSeedUsers();

    for (const user of users) {
        const existingUser = await db.get('SELECT id, password FROM Users WHERE email = ?', [user.username]);
        const passwordHash = user.passwordHash
            || (existingUser && await bcrypt.compare(user.password, existingUser.password)
                ? existingUser.password
                : await bcrypt.hash(user.password, SALT_ROUNDS));

        if (existingUser) {
            await db.run(
                `UPDATE Users
                 SET password = ?, firstName = COALESCE(firstName, ?), registrationDate = COALESCE(registrationDate, ?)
                 WHERE id = ?`,
                [passwordHash, user.firstName, user.registrationDate, existingUser.id]
            );
        } else {
            await db.run(
                'INSERT INTO Users (email, password, firstName, registrationDate) VALUES (?, ?, ?, ?)',
                [user.username, passwordHash, user.firstName, user.registrationDate]
            );
        }
    }
}

async function setupDatabase() {
    const db = await open({
        filename: DB_FILE,
        driver: sqlite3.Database
    });

    await db.exec('PRAGMA foreign_keys = ON');

    await db.exec(`
        CREATE TABLE IF NOT EXISTS Products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT,
            image TEXT,
            title TEXT,
            price REAL,
            category TEXT
        );

        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            firstName TEXT,
            registrationDate TEXT
        );

        CREATE TABLE IF NOT EXISTS Orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderNumber TEXT UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            total_price REAL NOT NULL,
            email TEXT NOT NULL,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            address TEXT NOT NULL,
            stateCountry TEXT NOT NULL,
            postalZip TEXT NOT NULL,
            phone TEXT NOT NULL,
            subtotal REAL NOT NULL,
            tax REAL NOT NULL,
            total REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'created',
            createdAt TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(id),
            FOREIGN KEY (product_id) REFERENCES Products(id)
        );

        CREATE TABLE IF NOT EXISTS Order_Items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderId INTEGER NOT NULL,
            productId INTEGER NOT NULL,
            title TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            lineTotal REAL NOT NULL,
            FOREIGN KEY (orderId) REFERENCES Orders(id),
            FOREIGN KEY (productId) REFERENCES Products(id)
        );
    `);

    await ensureColumn(db, 'Users', 'registrationDate', 'TEXT');
    await seedProducts(db);
    await seedUsers(db);

    return db;
}

module.exports = setupDatabase();
