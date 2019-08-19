const rheaPromise = require('rhea-promise')
const { getSenderConfig } = require('./config-helper')
const MessageBase = require('./message-base')

class MessageSender extends MessageBase {
  constructor (name, config) {
    super(config)
    this.name = name
    this.senderConfig = getSenderConfig(this.name, config)
    this.connection = new rheaPromise.Connection(config)
  }

  async sendMessage (message) {
    const data = JSON.stringify(message)
    const sender = await this.connection.createAwaitableSender(this.senderConfig)
    try {
      console.log(`${this.name} sending message`, data)
      const delivery = await sender.send({ body: data })
      console.log(`message sent ${this.name}`)
      return delivery
    } finally {
      await sender.close()
    }
  }
}

module.exports = MessageSender
