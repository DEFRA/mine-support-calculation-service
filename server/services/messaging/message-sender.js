const rheaPromise = require('rhea-promise')

class MessageSender {
  constructor (config) {
    this.config = config
    this.senderConfig = this.getSenderConfig(config)
    this.connection = new rheaPromise.Connection(config)
  }

  getSenderConfig (config) {
    return {
      name: `sender-payment-service-${config.address}`,
      target: { address: config.address },
      onError: (context) => {
        const senderError = context.sender && context.sender.error
        if (senderError) {
          console.error(`session error for${this.senderConfig.name} sender`, senderError)
        }
      },
      onSessionError: (context) => {
        const sessionError = context.session && context.session.error
        if (sessionError) {
          console.error(`session error for ${this.senderConfig.name} sender`, sessionError)
        }
      },
      sendTimeoutInSeconds: config.sendTimeoutInSeconds || 10
    }
  }

  async openConnection () {
    try {
      await this.connection.open()
      console.log(`${this.senderConfig.name} connection opened`)
    } catch (error) {
      console.error(`error opening ${this.senderConfig.name} connection`)
      throw error
    }
  }

  async closeConnection () {
    if (this.connection) {
      await this.connection.close()
      console.log(`${this.senderConfig.name} connection closed`)
    }
  }

  async sendMessage (message) {
    const data = JSON.stringify(message)
    const sender = await this.connection.createAwaitableSender(this.senderConfig)
    try {
      console.log(`Sending message to ${this.config.address}`, data)
      const delivery = await sender.send({ body: data })
      console.log(`message sent ${this.config.address}`)
      return delivery
    } finally {
      await sender.close()
    }
  }
}

module.exports = MessageSender
