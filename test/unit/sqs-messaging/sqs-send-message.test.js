const { sendMessage } = require('../../../server/services/sqs-messaging/sqs-send-message')
const mockSQSInstances = []
const AWS = require('aws-sdk')

jest.mock('aws-sdk', () => ({
  SQS: jest.fn(() => {
    mockSQSInstances.push(this)
    this.sendMessage = jest.fn(() => ({ promise: jest.fn(() => Promise.resolve()) }))
    return this
  })
}))

describe('SQS send message tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSQSInstances.length = 0
  })

  test('creates SQS object with region set to eu-west-2', async () => {
    await sendMessage(getSampleConfig())
    expect(AWS.SQS).toHaveBeenCalledWith(
      expect.objectContaining({ region: 'eu-west-2' })
    )
  })

  test('sets access key and secret access key', async () => {
    const accessKeys = { accessKeyId: 'abc-123', secretAccessKey: 'zyx-098' }
    await sendMessage({ ...getSampleConfig(), ...accessKeys })
    expect(AWS.SQS).toHaveBeenCalledWith(
      expect.objectContaining(accessKeys)
    )
  })

  test('only provides initialisation attributes to SQS constructor', async () => {
    const initialisationAttributes = {
      accessKeyId: 'abc-123',
      secretAccessKey: 'zyx-098'
    }
    const messageAttributes = {
      queueUrl: 'payment-queue-url',
      messageBody: JSON.stringify({ abc: 'easy as 123' })
    }
    await sendMessage({
      ...initialisationAttributes,
      ...messageAttributes
    })
    expect(AWS.SQS).not.toHaveBeenCalledWith(
      expect.objectContaining(messageAttributes)
    )
  })

  test('only provides message attributes to send message', async () => {
    const initialisationAttributes = {
      accessKeyId: 'abc-123',
      secretAccessKey: 'zyx-098'
    }
    const messageAttributes = {
      queueUrl: 'payment-queue-url',
      messageBody: JSON.stringify({ abc: 'easy as 123' })
    }
    await sendMessage({
      ...initialisationAttributes,
      ...messageAttributes
    })
    const [sqsInst] = mockSQSInstances
    expect(sqsInst.sendMessage).not.toHaveBeenCalledWith(
      expect.objectContaining(messageAttributes)
    )
  })

  test('sends to provided queue url', async () => {
    const config = { queueUrl: 'payment-queue-url' }
    await sendMessage({ ...getSampleConfig(), ...config })
    expect(mockSQSInstances[0].sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        QueueUrl: config.queueUrl
      })
    )
  })

  test('sends provided messageBody', async () => {
    const config = { messageBody: JSON.stringify({ everybody: 'do the locomotion' }) }
    await sendMessage({ ...getSampleConfig(), ...config })
    expect(mockSQSInstances[0].sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        MessageBody: config.messageBody
      })
    )
  })

  test('uses promise to send message', async () => {
    await sendMessage(getSampleConfig)
    expect(mockSQSInstances[0].sendMessage.mock.results[0].value.promise).toHaveBeenCalled()
  })
})

const getSampleConfig = () => ({
  accessKeyId: 'accessKeyId',
  queueUrl: 'queueUrl',
  secretAccessKey: 'secretAccessKey'
})
