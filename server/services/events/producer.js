const Kafka = require('node-rdkafka')
const config = require('../../config')

function sendEvent (topicName, value) {
  const options = getProducerOptions()

  const producer = new Kafka.Producer(options)
  producer.connect()

  producer.on('ready', function () {
    try {
      producer.produce(topicName, null, Buffer.from(value), null)
    } catch (err) {
      console.error(err)
    }
  })

  producer.on('event.error', function (err) {
    console.error('Error from producer')
    console.error(err)
  })

  producer.on('delivery-report', function (err, report) {
    if (err) console.error(err)
    console.log(`delivery-report: ${JSON.stringify(report)}`)
  })

  producer.setPollInterval(100)
}

function getProducerOptions () {
  return config.isProd ? {
    'metadata.broker.list': config.eventConfig.host,
    dr_cb: true,
    'security.protocol': 'SASL_SSL',
    'sasl.mechanisms': 'PLAIN',
    'sasl.username': '$ConnectionString',
    'sasl.password': config.eventConfig.eventHubConnectionString
  } : {
    'metadata.broker.list': config.eventConfig.host,
    dr_cb: true
  }
}

module.exports = sendEvent
