const publishMessage = require('./send-message')
const setupReceiver = require('./setup-receiver')

const rheaPromise = require('rhea-promise')
const calculationService = require('../calculation-service')
const config = require('../../config')

let connection

async function closeConnection () {
  if (connection) {
    await connection.close()
  }
}

process.on('SIGTERM', async function () {
  await closeConnection()
  process.exit(0)
})

async function receiveClaim () {
  connection = connection || new rheaPromise.Connection(config.calculationQueueConfig)
  try {
    await connection.open()
    await setupReceiver(connection, config.calculationQueueConfig.address, eventAction)
  } catch (err) {
    console.log(`unable to connect to message queue ${err}`)
  }
}

function eventAction (claim) {
  const value = calculationService.calculate(claim)
  console.log('******VALUE RECEIVED *******', value)
  publishMessage(config.paymentQueueConfig, { claimId: claim.claimId, value })
}

module.exports = {
  receiveClaim,
  closeConnection
}
