const MessageSender = require('../../server/services/messaging/message-sender')
const config = require('../../server/config')

const address = 'test-send'
const message = {
  content: 'howdy'
}
let messageSender

describe('message sender', () => {
  afterEach(async () => {
    await messageSender.closeConnection()
  })
  test('can send messages', async () => {
    const testConfig = { ...config.paymentQueueConfig, address }
    messageSender = new MessageSender('test-sender', testConfig)
    await messageSender.openConnection()
    const delivery = await messageSender.sendMessage(message)
    expect(delivery.settled).toBeTruthy()
  })
})
