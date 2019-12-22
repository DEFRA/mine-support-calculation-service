const MessageSender = require('./messaging/message-sender')
const MessageReceiver = require('./messaging/message-receiver')
const messageAction = require('./message-action')
const config = require('../config')
const { SqsConsumerFactory } = require('./sqs-messaging/sqs-consumer-factory')

const messageSender = new MessageSender('payment-queue-sender', config.paymentQueueConfig)
const messageReceiver = new MessageReceiver('calculation-queue-receiver', config.calculationQueueConfig)
let sqsConsumer

async function registerQueues () {
  await openConnections()
  await messageReceiver.setupReceiver((message) => messageAction(message, messageSender))
  startPollingSQSCalculationQueue()
}

process.on('SIGTERM', async function () {
  await closeConnections()
  process.exit(0)
})

process.on('SIGINT', async function () {
  await closeConnections()
  process.exit(0)
})

function startPollingSQSCalculationQueue () {
  const {
    sqsCalculationQueueConfig: {
      url: queueUrl,
      listenCredentials: { accessKeyId, secretAccessKey }
    }
  } = config

  console.log('setting up sqs calculation queue')
  sqsConsumer = SqsConsumerFactory.create({
    accessKeyId,
    handleMessage: message => {
      console.log('received a message!', message)
    },
    queueUrl,
    secretAccessKey
  })
  sqsConsumer.start()
  console.log('sqs calculation queue polling started')
}

async function closeConnections () {
  await messageSender.closeConnection()
  await messageReceiver.closeConnection()
  sqsConsumer.stop()
}

async function openConnections () {
  await messageSender.openConnection()
  await messageReceiver.openConnection()
}

module.exports = {
  registerQueues,
  closeConnections
}
