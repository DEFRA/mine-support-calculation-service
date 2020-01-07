const AWS = require('aws-sdk')

const getInitialisationAttributes = config => ({
  accessKeyId: config.accessKeyId,
  region: config.region,
  secretAccessKey: config.secretAccessKey
})
const getMessageAttributes = config => ({
  QueueUrl: config.queueUrl,
  MessageBody: config.messageBody
})

const sendMessage = async (config) => {
  const sqs = new AWS.SQS(getInitialisationAttributes(config))
  await sqs.sendMessage(getMessageAttributes(config)).promise()
}

module.exports = { sendMessage }
