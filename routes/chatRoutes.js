const express = require('express')
const router = express.Router()

const chatController = require('../controllers/chatController')

// get or create session
router.get('/session', chatController.getOrCreateSession)

// send message
router.post('/message', chatController.sendMessage)

module.exports = router