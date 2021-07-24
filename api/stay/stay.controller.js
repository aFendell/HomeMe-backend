const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const socketService = require('../../services/socket.service')
const stayService = require('./stay.service')

async function getStays(req, res) {
    // const filterBy = {}
    // const {searchTxt, type, price, sortBy} = req.query
    try {
        // filterBy.searchTxt = searchTxt || ''
        // filterBy.type = type
        // filterBy.price = price
        // filterBy.sortBy = sortBy
        const filterBy = req.query

        const stays = await stayService.query(filterBy)
        res.send(stays)
    } catch (err) {
        logger.error('Cannot get stays', err)
        res.status(500).send({ err: 'Failed to get stays' })
    }
}
async function getStay(req, res) {
    try {
        const stay = await stayService.getById(req.params.stayId)
        // const stays = await stayService.query(req.query)
        res.send(stay)
    } catch (err) {
        // logger.error('Cannot get stay', err)
        res.status(500).send({ err: 'Failed to get stay' })
    }
}

async function deleteStay(req, res) {
    try {
        await stayService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete stay', err)
        res.status(500).send({ err: 'Failed to delete stay' })
    }
}


async function addStay(req, res) {
    try {
        var stay = req.body
        // stay.byUserId = req.session.user._id
        stay = await stayService.add(stay)
        
        // prepare the updated review for sending out
        // stay.byUser = await userService.getById(stay.byUserId)
        // stay.aboutUser = await userService.getById(stay.aboutUserId)

        // console.log('CTRL SessionId:', req.sessionID);
        // socketService.broadcast({type: 'stay-added', data: stay})
        // socketService.emitToAll({type: 'user-updated', data: stay.byUser, room: req.session.user._id})
        res.send(stay)

    } catch (err) {
        console.log(err)
        logger.error('Failed to add stay', err)
        res.status(500).send({ err: 'Failed to add stay' })
    }
}

module.exports = {
    getStays,
    getStay,
    deleteStay,
    addStay
}