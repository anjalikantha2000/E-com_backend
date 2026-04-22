const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  text: String,
  sender: String,
  time: String
})

const chatSessionSchema = new mongoose.Schema({
  sessionId: String,
  userId: String,
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('ChatSession', chatSessionSchema)