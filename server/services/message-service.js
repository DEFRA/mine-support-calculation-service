const { messageAction } = require('./message-action')
const { SqsConsumerFactory } = require('./messaging/sqs-consumer-factory')
const config = require('../config')
let sqsConsumer

async function registerQueues () {
  registerCalculationQueue()
}

function registerCalculationQueue () {
  console.log('configuring calculation queue')
  sqsConsumer = SqsConsumerFactory.create({
    queueUrl: config.calculationQueueConfig.queueUrl,
    region: config.calculationQueueConfig.region,
    handleMessage: messageAction,
    accessKeyId: config.calculationQueueConfig.credentials.accessKeyId,
    secretAccessKey: config.calculationQueueConfig.credentials.secretAccessKey
  })
  sqsConsumer.start()
  console.log('calculation queue polling started')
}

process.on('SIGTERM', async function () {
  await closeConnections()
  process.exit(0)
})

process.on('SIGINT', async function () {
  await closeConnections()
  process.exit(0)
})

async function closeConnections () {
  sqsConsumer.stop()
}

module.exports = {
  registerQueues,
  closeConnections
}
