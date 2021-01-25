const config = require('../config')
const processCalculationMessage = require('./process-calculation-message')
const { MessageReceiver } = require('ffc-messaging')
let calculationReceiver

async function start () {
  const calculationAction = message => processCalculationMessage(message, calculationReceiver)
  calculationReceiver = new MessageReceiver(config.calculationQueueConfig, calculationAction)
  await calculationReceiver.subscribe()
  console.info('Ready to receive claims')
}

async function stop () {
  await calculationReceiver.closeConnection()
}

module.exports = { start, stop }
