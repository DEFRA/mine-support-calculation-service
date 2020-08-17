const kafka = require('kafka-node')
const { eventConfig } = require('../../config')

function createConsumer (groupName, topicName, action) {
  const options = {
    kafkaHost: eventConfig.host,
    groupId: groupName,
    autoCommit: false,
    sessionTimeout: 15000,
    fetchMaxBytes: 10 * 1024 * 1024,
    protocol: ['roundrobin'],
    fromOffset: 'latest',
    outOfRangeOffset: 'earliest'
  }

  const consumerGroup = new kafka.ConsumerGroup(options, topicName)

  consumerGroup.on('message', async function (message) {
    console.log(`received event ${message.value}`)
    try {
      const value = JSON.parse(message.value)
      await action(value)
      consumerGroup.commit((err, data) => {
        if (err) console.error(err)
        console.log('message committed')
      })
    } catch (err) {
      console.error(`Unable to handle event: ${err}`)
    }
  })

  consumerGroup.on('error', function onError (error) {
    console.error(error)
  })

  console.log(`Started consumer for topic ${topicName} in group ${groupName}`)
}

module.exports = createConsumer
