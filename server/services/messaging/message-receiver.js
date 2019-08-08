const rheaPromise = require('rhea-promise')

class MessageReceiver {
  constructor (config) {
    this.config = config
    this.receiverConfig = this.getReceiverConfig(config.address)
    this.connection = new rheaPromise.Connection(config)
  }

  getReceiverConfig (address) {
    return {
      name: `reciever-payment-service-${address}`,
      source: { address },
      onSessionError: (context) => {
        const sessionError = context.session && context.session.error
        if (sessionError) {
          console.log(`session error for ${this.receiverConfig.name} receiver`, sessionError)
        }
      }
    }
  }

  registerEvents (receiver, action) {
    receiver.on(rheaPromise.ReceiverEvents.message, async (context) => {
      console.log(`message received: ${this.receiverConfig.name}`, context.message.body)
      try {
        const message = JSON.parse(context.message.body)
        await action(message)
      } catch (ex) {
        console.error(`error with message in ${this.receiverConfig.name}`, ex)
      }
    })

    receiver.on(rheaPromise.ReceiverEvents.receiverError, (context) => {
      const receiverError = context.receiver && context.receiver.error
      if (receiverError) {
        console.error(`receipt error for ${this.receiverConfig.name}`, receiverError)
      }
    })
  }

  async openConnection () {
    try {
      await this.connection.open()
      console.log(`${this.receiverConfig.name} connection opened`)
    } catch (error) {
      console.error(`error opening ${this.receiverConfig.name} connection`)
      throw error
    }
  }

  async closeConnection () {
    if (this.connection) {
      await this.connection.close()
      console.log(`${this.receiverConfig.name} connection closed`)
    }
  }

  async setupReceiver (action) {
    const receiver = await this.connection.createReceiver(this.receiverConfig)
    this.registerEvents(receiver, action)
  }
}

module.exports = MessageReceiver
