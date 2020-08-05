const auth = require('@azure/ms-rest-nodeauth')
const MessageSender = require('./messaging/message-sender')
const MessageReceiver = require('./messaging/message-receiver')
const messageAction = require('./message-action')
const config = require('../config')

class MessageService {
  constructor (credentials) {
    this.publishPayment = this.publishPayment.bind(this)
    this.closeConnections = this.closeConnections.bind(this)
    this.paymentSender = new MessageSender('payment-queue-sender', config.paymentQueueConfig, credentials)
    const paymentAction = claim => messageAction(claim, this.paymentSender)
    this.calculationReceiver = new MessageReceiver('calculation-queue-receiver', config.calculationQueueConfig, credentials, paymentAction)
  }

  async closeConnections () {
    await this.paymentSender.closeConnection()
    await this.calculationReceiver.closeConnection()
  }

  async publishPayment (claim) {
    try {
      return await this.paymentSender.sendMessage(claim)
    } catch (err) {
      console.log(err)
      throw err
    }
  }
}

module.exports = async function () {
  const credentials = config.isProd ? await auth.loginWithVmMSI({ resource: 'https://servicebus.azure.net' }) : undefined
  return new MessageService(credentials)
}
