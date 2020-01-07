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
const { registerQueues, closeConnections } = require('../../server/services/message-service')
const { SqsConsumerFactory } = require('../../server/services/sqs-messaging/sqs-consumer-factory')
const { sqsCalculationMessageAction } = require('../../server/services/message-action')

jest.mock('../../server/services/messaging/message-sender', () => jest.fn(() => ({
  openConnection: jest.fn(() => Promise.resolve()),
  closeConnection: jest.fn(() => Promise.resolve())
})))
jest.mock('../../server/services/messaging/message-receiver', () => jest.fn(() => ({
  openConnection: jest.fn(() => Promise.resolve()),
  setupReceiver: jest.fn(() => Promise.resolve()),
  closeConnection: jest.fn(() => Promise.resolve())
})))
jest.mock('../../server/services/sqs-messaging/sqs-consumer-factory', () => ({
  SqsConsumerFactory: {
    create: jest.fn(() => ({
      start: jest.fn(),
      stop: jest.fn()
    }))
  }
}))
jest.mock('../../server/config', () => mockConfig)
jest.mock('../../server/services/message-action')

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

  test('omits consumer creation if url isn\'t set', async () => {
    const { sqsCalculationQueueConfig: url } = mockConfig
    mockConfig.sqsCalculationQueueConfig.url = ''
    await registerQueues()
    expect(SqsConsumerFactory.create).not.toHaveBeenCalled()
    mockConfig.sqsCalculationQueueConfig.url = url
  })

  test('omits consumer creation if access key id isn\'t set', async () => {
    const { sqsCalculationQueueConfig: { listenCredentials: { accessKeyId } } } = mockConfig
    mockConfig.sqsCalculationQueueConfig.listenCredentials.accessKeyId = ''
    await registerQueues()
    expect(SqsConsumerFactory.create).not.toHaveBeenCalled()
    mockConfig.sqsCalculationQueueConfig.listenCredentials.accessKeyId = accessKeyId
  })

  test('omits consumer creation if secret access key isn\'t set', async () => {
    const { sqsCalculationQueueConfig: { listenCredentials: { secretAccessKey } } } = mockConfig
    mockConfig.sqsCalculationQueueConfig.listenCredentials.secretAccessKey = ''
    await registerQueues()
    expect(SqsConsumerFactory.create).not.toHaveBeenCalled()
    mockConfig.sqsCalculationQueueConfig.listenCredentials.secretAccessKey = secretAccessKey
  })

  test('starts polling', async () => {
    await registerQueues()
    expect(SqsConsumerFactory.create.mock.results[0].value.start).toHaveBeenCalled()
  })

  test('passes message handler', async () => {
    await registerQueues()
    expect(SqsConsumerFactory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        handleMessage: expect.any(Function)
      })
    )
  })

  test('message handler calls sqsCalculationMessageAction', async () => {
    await registerQueues()
    const { handleMessage } = SqsConsumerFactory.create.mock.calls[0][0]
    handleMessage({})
    expect(sqsCalculationMessageAction).toHaveBeenCalled()
  })

  test('closeConnections stops polling', async () => {
    await registerQueues()
    await closeConnections()
    expect(SqsConsumerFactory.create.mock.results[0].value.stop).toHaveBeenCalled()
  })
})
