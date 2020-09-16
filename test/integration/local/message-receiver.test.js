const MessageReceiver = require('../../../server/services/messaging/message-receiver')
const MessageSender = require('../../../server/services/messaging/message-sender')
const config = require('../../../server/config')
const asbHelper = require('../../asb-helper')

describe('message receiver', () => {
  const message = { content: 'hello' }
  const testConfig = { ...config.calculationQueueConfig }
  let messageReceiver
  let messageSender

  beforeEach(async () => {
    await asbHelper.clearQueue(testConfig)
    messageSender = new MessageSender('test-sender', testConfig)
    await messageSender.sendMessage(message)
    await messageSender.closeConnection()
  })

  afterEach(async () => {
    await messageReceiver.closeConnection()
  })

  test('message receiver can receive messages', () => {
    expect.assertions(1)
    let done
    const promise = new Promise((resolve) => { done = resolve })
    const action = (result) => {
      done(result.content === message.content)
    }

    messageReceiver = new MessageReceiver('test-receiver', testConfig, undefined, action)

    return expect(promise).resolves.toEqual(true)
  })
})
