const createMessageService = require('../../../server/services/message-service')
const config = require('../../../server/config')

jest.mock('../../../server/services/messaging/message-receiver')
jest.mock('../../../server/services/messaging/message-sender')

describe('Test message service', () => {
  let MessageSender
  let MessageReceiver

  beforeAll(async () => {
    const messageService = await createMessageService()
    await messageService.closeConnections()
    MessageReceiver = require('../../../server/services/messaging/message-receiver')
    MessageSender = require('../../../server/services/messaging/message-sender')
  })

  test('Message service should create one sender and one receiver', async () => {
    expect(MessageSender).toHaveBeenCalledTimes(1)
    expect(MessageReceiver).toHaveBeenCalledTimes(1)
    expect(MessageReceiver).toHaveBeenCalledWith('calculation-queue-receiver', config.calculationQueueConfig, undefined, expect.any(Function))
    expect(MessageSender).toHaveBeenCalledWith('payment-queue-sender', config.paymentQueueConfig, undefined)
  })
})
