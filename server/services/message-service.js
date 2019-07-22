const container = require('rhea')
const config = require('../config')
const calculationService = require('./calculation-service')

module.exports = {
  receiveClaim: function () {
    const calculationQueue = 'calculation'
    const valueQueue = 'value'
    const activeMQOptions = {
      transport: config.messageQueuePort === 5672 ? 'tcp' : 'ssl',
      port: config.messageQueuePort,
      reconnect_limit: 10,
      host: config.messageQueue,
      hostname: config.messageQueue,
      username: config.messageQueueUser,
      password: config.messageQueuePass
    }
    container.on('connection_open', (context) => {
      context.connection.open_receiver(calculationQueue).on('message', (context) => {
        console.log(`claim received for calculation - ${context.message.body}`)
        const claim = JSON.parse(context.message.body)
        const value = calculationService.calculate(claim)
        context.connection.open_sender(valueQueue).on('sendable', (context) => {
          const data = JSON.stringify({ claimId: claim.claimId, value: value })
          context.sender.send({ body: data })
          console.log('calculation queued for payment')
        })
        context.delivery.release({ undeliverable_here: true })
      })
    })
    container.connect(activeMQOptions)
  }
}
