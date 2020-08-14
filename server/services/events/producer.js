const kafka = require('kafka-node')

function createProducer () {
  const options = {
    kafkaHost: 'kafka:9092'
  }

  const HighLevelProducer = kafka.HighLevelProducer
  const client = new kafka.KafkaClient(options)
  const producer = new HighLevelProducer(client)
  const payloads = [
    { topic: 'ffc-demo-claim-calculation', messages: '{"claimId":"MINE123", "value": 100}' }
  ]
  producer.on('ready', function () {
    producer.send(payloads, function (err, data) {
      if (err) console.log(err)
      console.log(data)
    })
  })
}

module.exports = createProducer
