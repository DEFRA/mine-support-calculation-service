const { registerEvents } = require('./register-events')

const { getReceiverOptions } = require('./get-receiver-options')

const rheaPromise = require('rhea-promise')
const calculationService = require('../calculation-service')
const config = require('../../config')

module.exports = {
  receiveClaim: async function () {
    const connection = new rheaPromise.Connection(config.calculationQueueConfig)
    try {
      await connection.open()
      await setupReceiver(connection, config.calculationQueueConfig.address)
    } catch (err) {
      console.log(`unable to connect to message queue ${err}`)
    }
  }
}

function eventAction (claim) {
  const value = calculationService.calculate(claim)
  console.log('******VALUE RECEIVED *******', value)
  // publishCalculation({ claimId: claim.claimId, value: value })
}

async function setupReceiver (connection, address) {
  const receiver = await connection.createReceiver(getReceiverOptions(address))
  registerEvents(receiver, address, (claim) => eventAction(claim))
}

// function publishCalculation (calculation) {
//   amqp.connect('amqp://localhost', function (err, conn) {
//     if (err) {
//       console.log(err)
//     }
//     conn.createChannel(function (err, ch) {
//       if (err) {
//         console.log(err)
//       }

//       const data = JSON.stringify(calculation)

//       const valueQueue = 'value'
//       ch.assertQueue(valueQueue, { durable: false })
//       ch.sendToQueue(valueQueue, Buffer.from(data))
//       console.log('calculation queued for payment')
//     })
//   })
// }
