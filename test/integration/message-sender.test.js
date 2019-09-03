let MessageSender
const config = require('../../server/config')

const address = 'test-send'
const message = {
  content: 'howdy'
}
let messageSender

describe('message sender', () => {
  beforeAll(() => {
    jest.mock('../../server/services/health-service')
    MessageSender = require('../../server/services/messaging/message-sender')
  })

  afterAll(() => {
    jest.unmock('../../server/services/health-service')
  })

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
