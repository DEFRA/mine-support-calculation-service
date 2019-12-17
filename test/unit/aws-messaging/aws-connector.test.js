const { createSQS, subscribeToQueue, resetSQS } = require('../../../server/services/aws-messaging/aws-connector')
const AWS = require('aws-sdk')
const mockSQSInstances = [] // mock prefix on name is important, so Jest will allow it to be used

jest.mock('aws-sdk', () => ({
  config: {
    region: '',
    setPromisesDependency: jest.fn(),
    update: jest.fn()
  },
  SQS: jest.fn(function () {
    mockSQSInstances.push(this)
    this.deleteMessage = jest.fn()
    this.getQueueUrl = jest.fn(({ QueueName }) => ({
      promise: jest.fn(() => Promise.resolve({
        // these have to be hard-coded due to the way jest mocks things...
        QueueUrl: QueueName === 'calculation-queue-arn'
          ? 'calculation-queue-url' : 'payment-queue-url'
      }))
    }))
    this.receiveMessage = jest.fn()
  })
}))

describe('aws-connector tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSQSInstances.length = 0
    resetSQS()
  })

  it('sets the AWS sdk to use promises', () => {
    createSQS()
    expect(AWS.config.setPromisesDependency).toHaveBeenCalledWith(Promise)
  })

  it('sets the region the first time we create an SQS object', () => {
    createSQS()
    expect(AWS.config.update).toHaveBeenCalledWith(
      expect.objectContaining({ region: 'eu-west-2' })
    )
  })

  it('only updates the region if it isn\'t the expected value', () => {
    createSQS()
    AWS.config.region = 'eu-west-2'
    createSQS()
    expect(AWS.config.update).toHaveBeenCalledTimes(1)
  })

  it('returns expected instance', () => {
    const sqs = createSQS()
    expect(sqs instanceof AWS.SQS).toBeTruthy()
  })

  it('only instantiates one instance of SQS for multiple calls to subscribeToQueue', () => {
    for (let x = 0; x < 10; x++) {
      subscribeToQueue('calculation-queue-arn')
    }
    expect(mockSQSInstances.length).toBe(1)
  })

  it('subscribes to queue with correct url', async () => {
    const testCases = [
      { queueArn: 'calculation-queue-arn', queueUrl: 'calculation-queue-url' },
      { queueArn: 'payment-queue-arn', queueUrl: 'payment-queue-url' }
    ]
    for (const testCase of testCases) {
      const { queueArn, queueUrl } = testCase
      await subscribeToQueue(queueArn, () => {})
      const [SQSInst] = mockSQSInstances
      expect(SQSInst.receiveMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          QueueName: queueUrl
        }),
        expect.any(Function)
      )
    }
  })

  it('sets max messages to 1 when subscribing to queue', async () => {
    await subscribeToQueue('calculation-queue-arn', () => {})
    const [SQSInst] = mockSQSInstances
    expect(SQSInst.receiveMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        MaxNumberOfMessages: 1
      }),
      expect.any(Function)
    )
  })

  it('calls callback when a message is received', async () => {
    const callback = jest.fn()
    await subscribeToQueue('calculation-queue-arn', callback)
    const [SQSInst] = mockSQSInstances
    SQSInst.receiveMessage.mock.calls[0][1](null, getSampleMessagesPayload())
    expect(callback).toHaveBeenCalled()
  })

  it('deletes the message', async () => {
    const testCases = [
      { queueArn: 'calculation-queue-arn', QueueUrl: 'calculation-queue-url', ReceiptHandle: 'abc-123' },
      { queueArn: 'payment-queue-arn', QueueUrl: 'payment-queue-url', ReceiptHandle: 'def-456' }
    ]
    for (let x = 0; x < testCases.length; x++) {
      const { queueArn, QueueUrl, ReceiptHandle } = testCases[x]
      await subscribeToQueue(queueArn, () => {})
      const [SQSInst] = mockSQSInstances
      SQSInst.receiveMessage.mock.calls[x][1](null, { Messages: [{ ReceiptHandle }] })
      console.log(SQSInst.getQueueUrl.mock.calls)
      expect(SQSInst.deleteMessage).toHaveBeenCalledWith(
        expect.objectContaining({ QueueUrl, ReceiptHandle })
      )  
    }
  })

  it('only permits one subscriber per queue', async () => {
    const testCases = ['calculation-queue-arn', 'payment-queue-arn']
    for (const testCase of testCases) {
      let errorMsg
      await subscribeToQueue(testCase, () => {})
      try {
        await subscribeToQueue(testCase, () => {})
      } catch (e) {
        errorMsg = e.message
      }
      expect(errorMsg).toBe(`Queue ${testCase} already has a subscriber`)
    }
  })
})

const getSampleMessagesPayload = (receipts = ['abc-123']) => ({
  Messages: receipts.map(receipt => ({ ReceiptHandle: receipt }))
})
