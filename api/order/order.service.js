const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const logger = require('../../services/logger.service')
const asyncLocalStorage = require('../../services/als.service')

async function add(order) {
    try {
        const collection = await dbService.getCollection('order')
        await collection.insertOne(order)
        return order
    } catch (err) {
        logger.error('cannot insert order', err)
        throw err
    }
}

async function query() {
    try {
        const collection = await dbService.getCollection('order')
        var orders = await collection.find().toArray()
        orders = orders.map(order => {
            order.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
            // order.createdAt = ObjectId(order._id).getTimestamp()
            // Returning fake fresh data
            return order
        })
        return orders
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }
}

async function getById(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        const order = await collection.findOne({ '_id': ObjectId(orderId) })
        return order
    } catch (err) {
        logger.error(`while finding order ${orderId}`, err)
        throw err
    }
}

async function remove(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        await collection.deleteOne({ '_id': ObjectId(orderId) })
    } catch (err) {
        logger.error(`cannot remove order ${toyorderId}`, err)
        throw err
    }
}



// async function update(order) {
//     try {
//         // peek only updatable fields!
//         const orderToSave = {
//             _id: ObjectId(order._id),
//             name: order.name,
//             price: order.price,
//             type: order.type,
//             imgUrl: order.imgUrl,
//             createdAt: order.createdAt,
//             msgs: order.msgs,
//             updatedAt: Date.now(),
//         }
//         const collection = await dbService.getCollection('order')
//         await collection.updateOne({ '_id': orderToSave._id }, { $set: orderToSave })
//         return orderToSave;
//     } catch (err) {
//         // logger.error(`cannot update order ${order._id}`, err)
//         throw err
//     }
// }

module.exports = {
    query,
    getById,
    remove,
    add,
}