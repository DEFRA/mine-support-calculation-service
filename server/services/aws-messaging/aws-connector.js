const AWS = require('aws-sdk')
let promisesDependencySet = false
let SQSInstance = false

const QUEUE_ARNS = Object.freeze({
  PAYMENT: 'payment-queue-arn',
  CALCULATION: 'calculation-queue-arn'
})

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
}

const getQueueUrl = async queueArn => {
  const { QueueUrl } = await createSQS().getQueueUrl({ QueueName: queueArn }).promise()
  return QueueUrl
}

const subscribeToQueue = async (queueArn, callback) => {
  if (!queueSubscriptions.includes(queueArn)) {
    const queueUrl = await getQueueUrl(queueArn)
    const sqs = createSQS()
    sqs.receiveMessage({ MaxNumberOfMessages: 1, QueueName: queueUrl }, (err, data) => {
      sqs.deleteMessage({ QueueUrl: queueUrl, ReceiptHandle: data.Messages[0].ReceiptHandle })
      callback(err, data)
    })
    queueSubscriptions.push(queueArn)
  } else {
    throw new Error(`Queue ${queueArn} already has a subscriber`)
  }
}

module.exports = {
  createSQS,
  QUEUE_ARNS,
  resetSQS,
  subscribeToQueue
}
