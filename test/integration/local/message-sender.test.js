const MessageSender = require('../../../server/services/messaging/message-sender')
const config = require('../../../server/config')
const { paymentQueueConfig } = require('../../../server/config/mq-config')
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
