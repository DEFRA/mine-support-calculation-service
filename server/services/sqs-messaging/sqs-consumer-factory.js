const { Consumer } = require('sqs-consumer')
const AWS = require('aws-sdk')

class SqsConsumerFactory {
  static configureSQS (config) {
    return (config && config.accessKeyId && config.secretAccessKey)
  }

  static parseConfig (config) {
    const parsedConfig = {
      waitTimeSeconds: 10,
      ...config
    }
    if (this.configureSQS(config)) {
      const { accessKeyId, region, secretAccessKey } = config
      parsedConfig.sqs = new AWS.SQS({ accessKeyId, region, secretAccessKey })
    }
    return parsedConfig
  }

  static create (config) {
    return Consumer.create(this.parseConfig(config))
  }
}

module.exports = { SqsConsumerFactory }
