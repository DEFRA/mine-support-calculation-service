const AWS = require('aws-sdk')
let promisesDependencySet = false
let SQSInstance = false
const queueSubscriptions = []
const awsRegion = 'eu-west-2'

const initialiseAWS = () => {
  if (AWS.config.region !== awsRegion) {
    AWS.config.update({ region: awsRegion })
  }
  if (!promisesDependencySet) {
    AWS.config.setPromisesDependency(Promise)
    promisesDependencySet = true
  }
}

const createSQS = () => {
  if (SQSInstance === false) {
    initialiseAWS()
    SQSInstance = new AWS.SQS()
  }
  return SQSInstance
}

const resetSQS = () => {
  SQSInstance = false
  promisesDependencySet = false
  queueSubscriptions.length = 0
  resetPollTimeout()
}

const getQueueUrl = async queueArn => {
  const { QueueUrl } = await createSQS().getQueueUrl({ QueueName: queueArn }).promise()
  return QueueUrl
}

let pollTimeout
const resetPollTimeout = () => {
  pollTimeout = 0
}
const getPollTimeout = () => {
  const timeouts = [0, 500, 1000, 5000, 10000]
  // find the current timeout, then get the next timeout, unless we're on the last (maximum timeout),
  // in which case it stays the same
  const idx = pollTimeout === timeouts[timeouts.length - 1]
    ? timeouts.length - 1 : timeouts.indexOf(pollTimeout) + 1
  pollTimeout = timeouts[idx]
  return pollTimeout
}

const subscribeToQueue = async (queueArn, callback) => {
  if (!queueSubscriptions.includes(queueArn)) {
    const queueUrl = await getQueueUrl(queueArn)
    const sqs = createSQS()
    const receiveMessageParams = { MaxNumberOfMessages: 1, QueueName: queueUrl }
    const receivedMessage = (err, data) => {
      if (data.Messages.length) {
        resetPollTimeout()
        sqs.deleteMessage({ QueueUrl: queueUrl, ReceiptHandle: data.Messages[0].ReceiptHandle })
        callback(err, data)
      }
      const timeout = data.Messages.length ? 0 : getPollTimeout()
      setTimeout(() => sqs.receiveMessage(receiveMessageParams, receivedMessage), timeout)
    }
    sqs.receiveMessage(receiveMessageParams, receivedMessage)
    queueSubscriptions.push(queueArn)
  } else {
    throw new Error(`Queue ${queueArn} already has a subscriber`)
  }
}

module.exports = {
  createSQS,
  resetSQS,
  subscribeToQueue
}
