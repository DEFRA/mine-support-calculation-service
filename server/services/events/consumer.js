const Kafka = require('node-rdkafka')
const config = require('../../config')

function createConsumer (groupName, topicName, action) {
  const options = {
    ...getConsumerOptions(),
    'group.id': groupName,
    'enable.auto.commit': false,
    'auto.offset.reset': 'earliest',
    'socket.keepalive.enable': true
  }

  const consumer = new Kafka.KafkaConsumer(options, {})
  consumer.connect()

  consumer.on('ready', function () {
    consumer.subscribe([topicName])
    consumer.consume()
  })

  consumer.on('data', async function (data) {
    try {
      console.log(`received event ${data.value.toString()}`)
      const value = JSON.parse(data.value)
      await action(value)
      consumer.commitMessage(data)
    } catch (err) {
      console.error(`unable to process event: ${err}`)
    }
  })

  consumer.on('event.error', function (err) {
    console.error('error from consumer')
    console.error(err)
  })

  console.log(`started consumer for topic ${topicName} in group ${groupName}`)
}

function getConsumerOptions () {
  return config.isProd ? {
    'metadata.broker.list': config.eventConfig.host,
    'security.protocol': 'SASL_SSL',
    'sasl.mechanisms': 'PLAIN',
    'sasl.username': '$ConnectionString',
    'sasl.password': config.eventConfig.eventHubConnectionString
  } : {
    'metadata.broker.list': config.eventConfig.host
  }
}

module.exports = createConsumer
