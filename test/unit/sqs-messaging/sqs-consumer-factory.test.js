const AWS = require('aws-sdk')
const sqsConsumer = require('sqs-consumer')
const { SqsConsumerFactory } = require('../../../server/services/sqs-messaging/sqs-consumer-factory')
const mockQueueUrls = {
  PAYMENT: 'payment-queue-url',
  CALCULATION: 'calculation-queue-url'
}

jest.mock('aws-sdk')
jest.mock('sqs-consumer')

describe('SqsConsumerFactory tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns created Consumer', () => {
    const sampleConsumer = Symbol('sampleConsumer')
    sqsConsumer.Consumer.create = jest.fn(() => sampleConsumer)
    const consumer = SqsConsumerFactory.create(generateConfig())
    expect(consumer).toBe(sampleConsumer)
  })

  test('Creates consumer with provided url', () => {
    const params = { queueUrl: mockQueueUrls.PAYMENT }
    SqsConsumerFactory.create(params)
    expect(sqsConsumer.Consumer.create).toHaveBeenCalledWith(
      expect.objectContaining(params)
    )
  })

  test('Configures sqs object', () => {
    const config = generateConfig()
    SqsConsumerFactory.create(config)
    expect(AWS.SQS).toHaveBeenCalledWith(
      expect.objectContaining({
        accessKeyId: config.accessKeyId,
        region: config.region,
        secretAccessKey: config.secretAccessKey
      })
    )
  })

  test('sets accessKeyId when configuring sqs object', () => {
    const accessKeyId = 'abcd-1234'
    const config = generateConfig({ accessKeyId })
    SqsConsumerFactory.create(config)
    expect(AWS.SQS).toHaveBeenCalledWith(
      expect.objectContaining({ accessKeyId })
    )
  })

  test('sets secretAccessKey when configuring sqs object', () => {
    const secretAccessKey = 'secret-ninja-99'
    const config = generateConfig({ secretAccessKey })
    SqsConsumerFactory.create(config)
    expect(AWS.SQS).toHaveBeenCalledWith(
      expect.objectContaining({ secretAccessKey })
    )
  })

  test('sets region when configuring sqs object', () => {
    const region = 'seven-kingdoms-8'
    const config = generateConfig({ region })
    SqsConsumerFactory.create(config)
    expect(AWS.SQS).toHaveBeenCalledWith(
      expect.objectContaining({ region })
    )
  })

  const generateConfig = config => ({
    accessKeyId: 'abc-123',
    queueUrl: 'sample-queue-url',
    region: 'eu-west-2',
    secretAccessKey: 'zyx-098',
    ...config
  })
})
