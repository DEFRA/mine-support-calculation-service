const AWS = require('aws-sdk')
let promisesDependencySet = false
let SQSInstance = false

const QUEUE_ARNS = Object.freeze({
  PAYMENT: 'payment-queue-arn',
  CALCULATION: 'calculation-queue-arn'
})

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
}

const getQueueUrl = async queueArn => {
  const { QueueUrl } = await createSQS().getQueueUrl({ QueueName: queueArn }).promise()
  return QueueUrl
}

const subscribeToQueue = async (queueArn, callback) => {
  // var queueURL = "SQS_QUEUE_URL";

  // var params = {
  //  AttributeNames: [
  //     "SentTimestamp"
  //  ],
  //  MaxNumberOfMessages: 10,
  //  MessageAttributeNames: [
  //     "All"
  //  ],
  //  QueueUrl: queueURL,
  //  VisibilityTimeout: 20,
  //  WaitTimeSeconds: 0
  // };

  // sqs.receiveMessage(params, function(err, data) {
  //   if (err) {
  //     console.log("Receive Error", err);
  //   } else if (data.Messages) {
  //     var deleteParams = {
  //       QueueUrl: queueURL,
  //       ReceiptHandle: data.Messages[0].ReceiptHandle
  //     };
  //     sqs.deleteMessage(deleteParams, function(err, data) {
  //       if (err) {
  //         console.log("Delete Error", err);
  //       } else {
  //         console.log("Message Deleted", data);
  //       }
  //     });
  //   }
  // })
  const queueUrl = await getQueueUrl(queueArn)
  const sqs = createSQS()
  sqs.receiveMessage({ MaxNumberOfMessages: 1, QueueName: queueUrl }, (err, data) => {
    sqs.deleteMessage({ QueueUrl: queueUrl, ReceiptHandle: data.Messages[0].ReceiptHandle })
    callback(err, data)
  })
}

module.exports = {
  createSQS,
  resetSQS,
  subscribeToQueue
}
