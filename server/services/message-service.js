const MessageSender = require('./messaging/message-sender')
const MessageReceiver = require('./messaging/message-receiver')
const messageAction = require('./message-action')
const config = require('../config')
const { SqsConsumerFactory } = require('./sqs-messaging/sqs-consumer-factory')

const messageSender = new MessageSender('payment-queue-sender', config.paymentQueueConfig)
const messageReceiver = new MessageReceiver('calculation-queue-receiver', config.calculationQueueConfig)

async function registerQueues () {
  const {
    sqsCalculationQueueConfig: {
      url,
      listenCredentials: { accessKeyId, secretAccessKey }
    }
  } = config
  await openConnections()
  await messageReceiver.setupReceiver((message) => messageAction(message, messageSender))
  console.log('setting up sqs consumer')
  const sqsConsumer = SqsConsumerFactory.create({
    accessKeyId,
    handleMessage: message => {
      console.log('received a message!', message)
    },
    secretAccessKey,
    url
  })
  sqsConsumer.start()
  console.log('consumer polling started')
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
  await messageSender.closeConnection()
  await messageReceiver.closeConnection()
}

async function openConnections () {
  await messageSender.openConnection()
  await messageReceiver.openConnection()
}

module.exports = {
  registerQueues,
  closeConnections
}
