const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const socketService = require('../../services/socket.service')
const orderService = require('./order.service')

async function getOrders(req, res) {
    try {
        const orders = await orderService.query()
        res.send(orders)
    } catch (err) {
        logger.error('Cannot get orders', err)
        res.status(500).send({ err: 'Failed to get orders' })
    }
}

async function getOrder(req, res) {
    try {
        const order = await orderService.getById(req.params.orderId)
        res.send(order)
    } catch (err) {
        logger.error('Cannot get order', err)
        res.status(500).send({ err: 'Failed to get order' })
    }
}

async function deleteOrder(req, res) {
    try {
        await orderService.remove(req.params.orderId)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete order', err)
        res.status(500).send({ err: 'Failed to delete order' })
    }
}

async function addOrder(req, res) {
    try {
        var order = req.body
        // stay.byUserId = req.session.user._id
        order = await orderService.add(order)
        res.send(order)
    } catch (err) {
        console.log(err)
        logger.error('Failed to add order', err)
        res.status(500).send({ err: 'Failed to add order' })
    }
}

module.exports = {
    getOrders,
    getOrder,
    deleteOrder,
    addOrder
}