const ChatSession = require('../models/ChatSession')

// Get or create chat session
exports.getOrCreateSession = async (req, res) => {
  try {
    const { sessionId, userId } = req.query

    let chat = await ChatSession.findOne({ sessionId })

    if (!chat) {
      chat = new ChatSession({
        sessionId,
        userId,
        messages: [
          {
            text: "Hello! How can I help you today?",
            sender: "admin",
            time: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})
          }
        ]
      })

      await chat.save()
    }

    res.json(chat)

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Send message
exports.sendMessage = async (req, res) => {
  try {

    const { sessionId, userId, message } = req.body

    let chat = await ChatSession.findOne({ sessionId })

    if (!chat) {
      chat = new ChatSession({
        sessionId,
        userId,
        messages: []
      })
    }

    const userMessage = {
      text: message,
      sender: "user",
      time: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})
    }

    chat.messages.push(userMessage)

    // Simulated admin reply
    const responses = [
      "I will check that for you.",
      "Thank you for your message.",
      "Our support team will assist you shortly.",
      "Can you provide more details?",
      "We are happy to help you."
    ]

    const adminMessage = {
      text: responses[Math.floor(Math.random() * responses.length)],
      sender: "admin",
      time: new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})
    }

    chat.messages.push(adminMessage)

    await chat.save()

    res.json({
      adminMessage
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}