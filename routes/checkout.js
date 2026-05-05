const express = require('express');
const dbPromise = require('../database');

const router = express.Router();

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CARD_RULE = /^\d{16}$/;
const TAX_RATE = 0;

function cleanText(value) {
    return String(value || '')
        .trim()
        .replace(/[<>]/g, '');
}

function roundMoney(value) {
    return Math.round(value * 100) / 100;
}

function validateCheckout(body) {
    const billing = body.billing || {};
    const payment = body.payment || {};
    const cartItems = Array.isArray(body.items) ? body.items : [];

    if (cartItems.length === 0) {
        return 'Cart is empty.';
    }

    if (!EMAIL_RULE.test(cleanText(billing.email))) {
        return 'Please enter a valid email address.';
    }

    if (!CARD_RULE.test(String(payment.cardNumber || '').replace(/\D/g, ''))) {
        return 'Credit card number must contain exactly 16 digits.';
    }

    const requiredBillingFields = ['firstName', 'lastName', 'address', 'stateCountry', 'postalZip', 'phone'];
    const missingField = requiredBillingFields.find((field) => !cleanText(billing[field]));

    if (missingField) {
        return `Missing billing field: ${missingField}.`;
    }

    const invalidItem = cartItems.find((item) => {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity);
        return !Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0;
    });

    if (invalidItem) {
        return 'Cart contains an invalid item.';
    }

    return null;
}

router.post('/', async (req, res) => {
    const validationError = validateCheckout(req.body);

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const db = await dbPromise;
    const billing = req.body.billing;
    const payment = req.body.payment;
    const cartItems = req.body.items;
    const createdAt = new Date().toISOString();
    const orderNumber = `ORD-${Date.now()}`;

    try {
        await db.exec('BEGIN TRANSACTION');

        const orderLines = [];

        for (const item of cartItems) {
            const product = await db.get('SELECT id, title, price FROM products WHERE id = ?', [Number(item.productId)]);

            if (!product) {
                throw new Error(`Product ${item.productId} is no longer available.`);
            }

            const quantity = Number(item.quantity);
            const lineTotal = roundMoney(product.price * quantity);
            orderLines.push({
                productId: product.id,
                title: product.title,
                price: product.price,
                quantity,
                lineTotal
            });
        }

        const subtotal = roundMoney(orderLines.reduce((sum, item) => sum + item.lineTotal, 0));
        const tax = roundMoney(subtotal * TAX_RATE);
        const total = roundMoney(subtotal + tax);

        const result = await db.run(
            `INSERT INTO orders (
                orderNumber, email, firstName, lastName, address, stateCountry,
                postalZip, phone, subtotal, tax, total, status, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderNumber,
                cleanText(billing.email).toLowerCase(),
                cleanText(billing.firstName),
                cleanText(billing.lastName),
                cleanText(billing.address),
                cleanText(billing.stateCountry),
                cleanText(billing.postalZip),
                cleanText(billing.phone),
                subtotal,
                tax,
                total,
                'created',
                createdAt
            ]
        );

        for (const item of orderLines) {
            await db.run(
                `INSERT INTO order_items (
                    orderId, productId, title, price, quantity, lineTotal
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [result.lastID, item.productId, item.title, item.price, item.quantity, item.lineTotal]
            );
        }

        await db.exec('COMMIT');

        return res.status(201).json({
            message: 'Order created successfully',
            order: {
                id: result.lastID,
                orderNumber,
                subtotal,
                tax,
                total,
                createdAt,
                paymentLast4: String(payment.cardNumber).replace(/\D/g, '').slice(-4)
            }
        });
    } catch (error) {
        await db.exec('ROLLBACK');
        console.error('Checkout Error:', error);
        return res.status(400).json({ error: error.message || 'Unable to create order.' });
    }
});

module.exports = router;
