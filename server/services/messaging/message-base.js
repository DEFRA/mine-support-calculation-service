const { ServiceBusClient } = require('@azure/service-bus')

class MessageBase {
  constructor (name, config, credentials) {
    this.name = name
    console.log('In Message Base')
    this.sbClient = credentials ? ServiceBusClient.createFromAadTokenCredentials(config.host, credentials) : ServiceBusClient.createFromConnectionString(`Endpoint=sb://${config.host}/;SharedAccessKeyName=${config.username};SharedAccessKey=${config.password}`)
    console.log('Created sbClient')
    this.queueClient = this.sbClient.createQueueClient(config.address)
    console.log('Created queueClient')
  }

  async closeConnection () {
    await this.sbClient.close()
    console.log(`${this.name} connection closed`)
  }
}

module.exports = MessageBase
