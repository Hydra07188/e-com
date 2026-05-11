const userRepository = require('../repositories/userRepository');
const productRepository = require('../repositories/productRepository');
const orderRepository = require('../repositories/orderRepository');
const { cleanText, roundMoney } = require('../models/orderModel');

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CARD_RULE = /^\d{16}$/;
const TAX_RATE = 0;
const MAX_CART_ITEMS = 50;
const MAX_ITEM_QUANTITY = 99;

// Order Service boundary.
// This file owns checkout business logic. It depends on user identity and
// product price data, but it accesses them through ports/adapters so the Order
// module can become a separate microservice later.
function makeServiceError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function validateCheckout(body) {
    const billing = body.billing || {};
    const payment = body.payment || {};
    const cartItems = Array.isArray(body.items) ? body.items : [];

    if (cartItems.length === 0) {
        throw makeServiceError('Cart is empty.');
    }

    if (cartItems.length > MAX_CART_ITEMS) {
        throw makeServiceError(`Cart cannot contain more than ${MAX_CART_ITEMS} line items.`);
    }

    if (!EMAIL_RULE.test(cleanText(billing.email))) {
        throw makeServiceError('Please enter a valid email address.');
    }

    if (!CARD_RULE.test(String(payment.cardNumber || '').replace(/\D/g, ''))) {
        throw makeServiceError('Credit card number must contain exactly 16 digits.');
    }

    const requiredBillingFields = ['firstName', 'lastName', 'address', 'stateCountry', 'postalZip', 'phone'];
    const missingField = requiredBillingFields.find((field) => !cleanText(billing[field]));

    if (missingField) {
        throw makeServiceError(`Missing billing field: ${missingField}.`);
    }

    const invalidItem = cartItems.find((item) => {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity);
        return !Number.isInteger(productId)
            || productId <= 0
            || !Number.isInteger(quantity)
            || quantity <= 0
            || quantity > MAX_ITEM_QUANTITY;
    });

    if (invalidItem) {
        throw makeServiceError('Cart contains an invalid item.');
    }
}

async function verifyUserFromUserService(billing) {
    // Microservice simulation cut line:
    // In a real split, OrderService would call:
    // fetch("http://user-service/api/verify-or-create", { method: "POST", body: ... })
    // This async adapter behaves like that remote API while the app is still a monolith.
    const email = cleanText(billing.email).toLowerCase();
    const firstName = cleanText(billing.firstName);
    const userId = await userRepository.getOrCreateGuestUser({ email, firstName });
    return { userId, email, firstName };
}

async function getProductSnapshotFromCatalogService(item) {
    // Microservice simulation cut line:
    // A future OrderService must not read Product tables directly. It should ask
    // Product Catalog for a price snapshot, e.g.
    // fetch("http://product-service/api/products/" + item.productId)
    const product = await productRepository.findById(Number(item.productId));

    if (!product) {
        throw makeServiceError(`Product ${item.productId} is no longer available.`);
    }

    return product;
}

async function createCheckoutOrder(body) {
    validateCheckout(body);

    const billing = body.billing;
    const payment = body.payment;
    const createdAt = new Date().toISOString();
    const orderNumber = `ORD-${Date.now()}`;

    const verifiedUser = await verifyUserFromUserService(billing);
    const orderLines = [];

    for (const item of body.items) {
        const product = await getProductSnapshotFromCatalogService(item);
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
    const primaryLine = orderLines[0];

    const result = await orderRepository.runInTransaction(async (db) => {
        const orderResult = await orderRepository.createOrder(db, {
            orderNumber,
            userId: verifiedUser.userId,
            productId: primaryLine.productId,
            quantity: orderLines.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice: total,
            email: verifiedUser.email,
            firstName: verifiedUser.firstName,
            lastName: cleanText(billing.lastName),
            address: cleanText(billing.address),
            stateCountry: cleanText(billing.stateCountry),
            postalZip: cleanText(billing.postalZip),
            phone: cleanText(billing.phone),
            subtotal,
            tax,
            total,
            status: 'created',
            createdAt
        });

        for (const item of orderLines) {
            await orderRepository.createOrderItem(db, {
                orderId: orderResult.lastID,
                productId: item.productId,
                title: item.title,
                price: item.price,
                quantity: item.quantity,
                lineTotal: item.lineTotal
            });
        }

        return orderResult;
    });

    return {
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
    };
}

module.exports = {
    createCheckoutOrder,
    verifyUserFromUserService,
    getProductSnapshotFromCatalogService
};
