const { createSQS, resetSQS, subscribeToQueue, updateCredentials } = require('../../../server/services/aws-messaging/aws-connector')
const AWS = require('aws-sdk')
const mockSQSInstances = [] // mock prefix on name is important, so Jest will allow it to be used
const mockQueueUrls = {
  PAYMENT: 'payment-queue-url',
  CALCULATION: 'calculation-queue-url'
} // same here...

jest.useFakeTimers()

jest.mock('aws-sdk', () => ({
  config: {
    region: '',
    setPromisesDependency: jest.fn(),
    update: jest.fn()
  },
  SQS: jest.fn(function () {
    mockSQSInstances.push(this)
    this.deleteMessage = jest.fn()
    this.receiveMessage = jest.fn()
  })
}))

describe('aws-connector tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
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

  it('updateCredentials sets the access key and secret access key', () => {
    const creds = { accessKeyId: 'abc-123', secretAccessKey: 'zyx-098' }
    updateCredentials(creds)
    expect(AWS.config.update).toHaveBeenLastCalledWith(
      expect.objectContaining(creds)
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
    const urls = ['url1', 'url2', 'url3', 'url4', 'url5', 'url6', 'url7', 'url8', 'url9', 'url10']
    for (let x = 0; x < 10; x++) {
      subscribeToQueue(urls[x])
    }
    expect(mockSQSInstances.length).toBe(1)
  })

  it('subscribes to queue with correct url', async () => {
    const testCases = [
      { QueueUrl: mockQueueUrls.CALCULATION },
      { QueueUrl: mockQueueUrls.PAYMENT }
    ]
    for (const testCase of testCases) {
      const { QueueUrl } = testCase
      await subscribeToQueue(QueueUrl, () => {})
      const [SQSInst] = mockSQSInstances
      expect(SQSInst.receiveMessage).toHaveBeenCalledWith(
        expect.objectContaining({ QueueUrl }),
        expect.any(Function)
      )
    }
  })

  it('sets max messages to 1 when subscribing to queue', async () => {
    await subscribeToQueue(mockQueueUrls.CALCULATION, () => {})
    const [SQSInst] = mockSQSInstances
    expect(SQSInst.receiveMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        MaxNumberOfMessages: 1
      }),
      expect.any(Function)
    )
  })

  it('sets wait time to 0 when subscribing to queue, enabling short polling', async () => {
    await subscribeToQueue(mockQueueUrls.CALCULATION, () => {})
    const [SQSInst] = mockSQSInstances
    expect(SQSInst.receiveMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        WaitTimeSeconds: 0
      }),
      expect.any(Function)
    )
  })

  it('calls callback when a message is received', async () => {
    const callback = jest.fn()
    await subscribeToQueue(mockQueueUrls.CALCULATION, callback)
    const [SQSInst] = mockSQSInstances
    SQSInst.receiveMessage.mock.calls[0][1](null, getSampleMessagesPayload())
    expect(callback).toHaveBeenCalled()
  })

  it('doesn\'t throw error if messages payload is empty', async () => {
    const possiblePayloads = [null, { ResponseMetadata: { RequestId: 'abc-123' } }]
    await subscribeToQueue(mockQueueUrls.CALCULATION, () => {})
    const [SQSInst] = mockSQSInstances

    for (const payload of possiblePayloads) {
      expect(
        () => SQSInst.receiveMessage.mock.calls[0][1](null, payload)
      ).not.toThrow()
    }
  })

  it('doesn\'t call callback if messages payload is empty', async () => {
    const callback = jest.fn()
    await subscribeToQueue(mockQueueUrls.CALCULATION, callback)
    const [SQSInst] = mockSQSInstances
    SQSInst.receiveMessage.mock.calls[0][1](null, null)
    expect(callback).not.toHaveBeenCalled()
  })

  it('deletes the message', async () => {
    const testCases = [
      { QueueUrl: 'calculation-queue-url', ReceiptHandle: 'abc-123' },
      { QueueUrl: 'payment-queue-url', ReceiptHandle: 'def-456' }
    ]
    for (let x = 0; x < testCases.length; x++) {
      const { QueueUrl, ReceiptHandle } = testCases[x]
      await subscribeToQueue(QueueUrl, () => {})
      const [SQSInst] = mockSQSInstances
      SQSInst.receiveMessage.mock.calls[x][1](null, getSampleMessagesPayload([ReceiptHandle]))
      expect(SQSInst.deleteMessage).toHaveBeenCalledWith(
        expect.objectContaining({ QueueUrl, ReceiptHandle })
      )
    }
  })

  it('only permits one subscriber per queue', async () => {
    const testCases = [mockQueueUrls.CALCULATION, mockQueueUrls.PAYMENT]
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

  it('polls for messages immediately if a message is received', async () => {
    await subscribeToQueue(mockQueueUrls.CALCULATION, () => {})
    const [SQSInst] = mockSQSInstances
    SQSInst.receiveMessage.mock.calls[0][1](null, getSampleMessagesPayload())
    expect(SQSInst.receiveMessage).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(0)
    expect(SQSInst.receiveMessage).toHaveBeenCalledTimes(2)
  })

  it('doesn\'t poll for messages immediately if a message isn\'t received', async () => {
    await subscribeToQueue(mockQueueUrls.CALCULATION, () => {})
    const [SQSInst] = mockSQSInstances
    SQSInst.receiveMessage.mock.calls[0][1](null, getEmptyMessagesPayload())
    jest.advanceTimersByTime(0)
    expect(SQSInst.receiveMessage).toHaveBeenCalledTimes(1)
  })

  it('polls for messages, incrementing up to 10 seconds, if no message is received', async () => {
    const increments = [500, 1000, 5000, 10000, 10000]
    await subscribeToQueue(mockQueueUrls.CALCULATION, () => {})
    const [SQSInst] = mockSQSInstances
    for (let x = 0; x < increments.length; x++) {
      SQSInst.receiveMessage.mock.calls[x][1](null, getEmptyMessagesPayload())
      jest.advanceTimersByTime(increments[x])
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), increments[x])
      expect(SQSInst.receiveMessage).toHaveBeenCalledTimes(x + 2)
    }
  })

  it('polls immediately again after a message received', async () => {
    const increments = [500, 1000, 5000, 10000, 0]
    await subscribeToQueue(mockQueueUrls.CALCULATION, () => {})
    const [SQSInst] = mockSQSInstances
    for (let x = 0; x < increments.length; x++) {
      const messagePayload = increments[x] === 0 ? getSampleMessagesPayload() : getEmptyMessagesPayload()
      SQSInst.receiveMessage.mock.calls[0][1](null, messagePayload)
      jest.advanceTimersByTime(increments[x])
    }
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 0)
  })
})

const getSampleMessagesPayload = (receipts = ['abc-123']) => ({
  Messages: receipts.map(receipt => ({ ReceiptHandle: receipt }))
})
const getEmptyMessagesPayload = () => ({ Messages: [] })
