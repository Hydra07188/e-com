const dbPromise = require('../config/database');

// Order Repository.
// This layer owns transaction persistence. Moving SQL here keeps OrderService
// focused on checkout business rules and makes the future Order microservice
// extraction much cleaner.
async function runInTransaction(work) {
    const db = await dbPromise;

    try {
        await db.exec('BEGIN TRANSACTION');
        const result = await work(db);
        await db.exec('COMMIT');
        return result;
    } catch (error) {
        await db.exec('ROLLBACK');
        throw error;
    }
}

async function createOrder(db, order) {
    return db.run(
        `INSERT INTO Orders (
            orderNumber, user_id, product_id, quantity, total_price,
            email, firstName, lastName, address, stateCountry,
            postalZip, phone, subtotal, tax, total, status, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            order.orderNumber,
            order.userId,
            order.productId,
            order.quantity,
            order.totalPrice,
            order.email,
            order.firstName,
            order.lastName,
            order.address,
            order.stateCountry,
            order.postalZip,
            order.phone,
            order.subtotal,
            order.tax,
            order.total,
            order.status,
            order.createdAt
        ]
    );
}

async function createOrderItem(db, item) {
    return db.run(
        `INSERT INTO Order_Items (
            orderId, productId, title, price, quantity, lineTotal
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [item.orderId, item.productId, item.title, item.price, item.quantity, item.lineTotal]
    );
}

module.exports = {
    runInTransaction,
    createOrder,
    createOrderItem
};
