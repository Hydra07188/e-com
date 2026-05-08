const orderService = require('../services/orderService');

// Order Controller.
// This layer receives checkout requests and delegates all order decisions to
// OrderService, preserving a clean route-controller-service-repository chain.
async function checkout(req, res, next) {
    try {
        const result = await orderService.createCheckoutOrder(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    checkout
};
