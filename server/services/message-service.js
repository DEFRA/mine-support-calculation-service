const { messageAction } = require('./message-action')
const { SqsConsumerFactory } = require('./messaging/sqs-consumer-factory')
const config = require('../config')
let sqsConsumer

async function registerQueues () {
  startPollingSQSCalculationQueue()
}

function startPollingSQSCalculationQueue () {
  const {
    sqsCalculationQueueConfig: {
      url: queueUrl,
      region,
      listenCredentials: { accessKeyId, secretAccessKey }
    }
  } = config

  if ([queueUrl, accessKeyId, region, secretAccessKey].every(param => param !== '')) {
    console.log('setting up sqs calculation queue')
    sqsConsumer = SqsConsumerFactory.create({
      accessKeyId,
      handleMessage: messageAction,
      queueUrl,
      region,
      secretAccessKey
    })
    sqsConsumer.start()
    console.log('sqs calculation queue polling started')
  } else {
    console.log('sqs calculation queue polling skipped as env vars not present')
  }
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
