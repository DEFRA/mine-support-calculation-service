const MessageSender = require('../../../app/services/messaging/message-sender')
const config = require('../../../app/config')
const { paymentQueueConfig } = require('../../../app/config/mq-config')
const asbHelper = require('../../asb-helper')

describe('message sender', () => {
  let messageSender
  beforeAll(async () => {
    await asbHelper.clearQueue(paymentQueueConfig)
    messageSender = new MessageSender('test-sender', config.paymentQueueConfig)
  }, 10000)

  afterAll(async () => {
    await messageSender.closeConnection()
    await asbHelper.clearQueue(paymentQueueConfig)
  }, 10000)

  test('can send a message', async () => {
    const message = { greeting: 'test message' }

    await messageSender.sendMessage(message)
  })
})
