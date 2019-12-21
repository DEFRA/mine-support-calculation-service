const mockConfig = {
  sqsCalculationQueueConfig: {
    url: 'calculation-queue-url',
    listenCredentials: {
      accessKeyId: 'abc-123',
      secretAccessKey: 'zyx-098'
    }
  }
}
require('../../server/config')
require('../../server/services/messaging/message-sender')
require('../../server/services/messaging/message-receiver')
const { registerQueues } = require('../../server/services/message-service')
const { SqsConsumerFactory } = require('../../server/services/sqs-messaging/sqs-consumer-factory')

jest.mock('../../server/services/messaging/message-sender', () => jest.fn(() => ({
  openConnection: jest.fn().mockImplementation(() => Promise.resolve())
})))
jest.mock('../../server/services/messaging/message-receiver', () => jest.fn(() => ({
  openConnection: jest.fn(() => Promise.resolve()),
  setupReceiver: jest.fn(() => Promise.resolve())
})))
jest.mock('../../server/services/sqs-messaging/sqs-consumer-factory', () => ({
  SqsConsumerFactory: {
    create: jest.fn(() => ({
      start: jest.fn()
    }))
  }
}))
jest.mock('../../server/config', () => mockConfig)

describe('message-service tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('creates consumer', async () => {
    await registerQueues()
    const {
      sqsCalculationQueueConfig: {
        url: queueUrl,
        listenCredentials: { accessKeyId, secretAccessKey }
      }
    } = mockConfig
    expect(SqsConsumerFactory.create).toHaveBeenCalledWith(
      expect.objectContaining({ queueUrl, accessKeyId, secretAccessKey })
    )
  })

  test('starts polling', async () => {
    await registerQueues()
    expect(SqsConsumerFactory.create.mock.results[0].value.start).toHaveBeenCalled()
  })

  test('passes message hander', async () => {
    await registerQueues()
    expect(SqsConsumerFactory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        handleMessage: expect.any(Function)
      })
    )
  })
})
