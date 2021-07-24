const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
const {addStay, getStays, deleteStay, getStay} = require('./stay.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getStays)
router.get('/:stayId', log, getStay)
router.post('/',  requireAuth, addStay)
router.delete('/:stayId',  requireAuth, deleteStay)

module.exports = router