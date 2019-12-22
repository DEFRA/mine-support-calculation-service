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
    const consumer = SqsConsumerFactory.create()
    expect(consumer).toBe(sampleConsumer)
  })

  test('Creates consumer with provided url', () => {
    const params = { queueUrl: mockQueueUrls.PAYMENT }
    SqsConsumerFactory.create(params)
    expect(sqsConsumer.Consumer.create).toHaveBeenCalledWith(
      expect.objectContaining(params)
    )
  })

  test('Defaults region to eu-west-2', () => {
    SqsConsumerFactory.create()
    expect(sqsConsumer.Consumer.create).toHaveBeenCalledWith(
      expect.objectContaining({ region: 'eu-west-2' })
    )
  })

  test('Defaults waitTimeSeconds to 10', () => {
    SqsConsumerFactory.create()
    expect(sqsConsumer.Consumer.create).toHaveBeenCalledWith(
      expect.objectContaining({ waitTimeSeconds: 10 })
    )
  })

  test('Configures sqs object if access key id and secret access key are provided', () => {
    const config = { accessKeyId: 'abc-123', secretAccessKey: 'zyx-098' }
    SqsConsumerFactory.create(config)
    expect(AWS.SQS).toHaveBeenCalledWith(
      expect.objectContaining(config)
    )
  })

  test('provides pre-configured sqs object if access key id and secret access key are provided', () => {
    let mockSQSInstance
    AWS.SQS = jest.fn(() => {
      mockSQSInstance = this
    })
    const config = { accessKeyId: 'abc-123', secretAccessKey: 'zyx-098' }
    SqsConsumerFactory.create(config)
    expect(sqsConsumer.Consumer.create).toHaveBeenCalledWith(
      expect.objectContaining({ sqs: mockSQSInstance })
    )
  })

  test('sets region when configuring sqs object', () => {
    const config = { accessKeyId: 'abc-123', secretAccessKey: 'zyx-098' }
    SqsConsumerFactory.create(config)
    expect(AWS.SQS).toHaveBeenCalledWith(
      expect.objectContaining({ region: 'eu-west-2' })
    )
  })
})
