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

const updateCredentials = credentials => {
  const { accessKeyId, secretAccessKey } = credentials
  AWS.config.update({ accessKeyId, secretAccessKey })
}

const createSQS = (config) => {
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

const payloadContainsMessages = (payload) => {
  return payload && payload.Messages && payload.Messages.length > 0 || false
}

const subscribeToQueue = async (QueueUrl, callback) => {
  if (!queueSubscriptions.includes(QueueUrl)) {
    const sqs = createSQS()
    const receiveMessageParams = { MaxNumberOfMessages: 1, QueueUrl, WaitTimeSeconds: 0 }
    const receivedMessage = (err, data) => {
      console.log(`Polling SQS queue ${QueueUrl}`)
      if (payloadContainsMessages(data)) {
        console.log('Message found')
        resetPollTimeout()
        sqs.deleteMessage({ QueueUrl, ReceiptHandle: data.Messages[0].ReceiptHandle })
        callback(err, data)
      }
      const timeout = payloadContainsMessages(data) ? 0 : getPollTimeout()
      console.log(`Polling again in ${timeout}`)
      // something's going wrong here - seems to poll every 10 seconds, no matter what
      setTimeout(() => sqs.receiveMessage(receiveMessageParams, receivedMessage), timeout)
    }
    sqs.receiveMessage(receiveMessageParams, receivedMessage)
    queueSubscriptions.push(QueueUrl)
  } else {
    throw new Error(`Queue ${QueueUrl} already has a subscriber`)
  }
}

module.exports = {
  createSQS,
  resetSQS,
  subscribeToQueue,
  updateCredentials
}
