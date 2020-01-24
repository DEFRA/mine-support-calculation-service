const AWS = require('aws-sdk')

class MessageSender {
  constructor (queueConfig, queueUrl) {
    this.sqs = new AWS.SQS(queueConfig)
    this.queueUrl = queueUrl
  }

  async sendMessage (message) {
    const jsonMessage = JSON.stringify(message)
    try {
      return this.sqs.sendMessage({
        QueueUrl: this.queueUrl,
        MessageBody: jsonMessage
      }).promise()
    } catch (ex) {
      console.error(`error sending message '${jsonMessage}' to queue`, ex)
      throw ex
    }
  }
}

module.exports = MessageSender
