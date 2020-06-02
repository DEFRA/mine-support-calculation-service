const { getSenderConfig } = require('./config-helper')
const MessageBase = require('./message-base')

class MessageSender extends MessageBase {
  constructor (name, config) {
    super(name, config)
    this.senderConfig = getSenderConfig(this.name, config)
  }

  async sendMessage (message) {
    const data = JSON.stringify(message)
    const sender = await this.connection.createAwaitableSender(this.senderConfig)
    try {
      console.log(`${this.name} sending message`, data)
      const delivery = await sender.send({ body: data })
      console.log(`message sent ${this.name}`)
      return delivery
    } catch (error) {
      console.error('failed to send message', error)
      throw error
    } finally {
      await sender.close()
    }
  }
}

module.exports = MessageSender
