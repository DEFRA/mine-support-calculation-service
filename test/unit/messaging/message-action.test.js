const mockConfig = {
  sqsPaymentQueueConfig: {
    url: 'payment-queue-url',
    region: 'faerun-3',
    publishCredentials: {
      accessKeyId: 'abc-123',
      secretAccessKey: 'zyx-098'
    }
  }
}
require('../../../server/config')
const { messageAction, sqsCalculationMessageAction } = require('../../../server/services/message-action')
const calculationService = require('../../../server/services/calculation-service')
const { sendMessage } = require('../../../server/services/sqs-messaging/sqs-send-message')

jest.mock('../../../server/services/calculation-service', () => ({
  calculate: jest.fn(() => 190.96)
}))
jest.mock('../../../server/services/sqs-messaging/sqs-send-message', () => ({
  sendMessage: jest.fn()
}))
jest.mock('../../../server/config', () => mockConfig)

describe('message action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should calculate claim and send to queue', async () => {
    const claim =
    {
      claimId: 'MINE123',
      propertyType: 'business',
      accessible: false,
      dateOfSubsidence: '2019-07-26T09:54:19.622Z',
      mineType: ['gold'],
      email: 'test@email.com'
    }

    const messages = []
    const mockSender = {
      sendMessage: function (messagein) {
        messages.push(messagein)
        return Promise.resolve(true)
      }
    }

    await messageAction(claim, mockSender)
    expect(messages.length).toEqual(1)
    expect(messages[0]).toEqual({ claimId: claim.claimId, value: 190.96 })
  })

  test('should gracefully handle errors', async () => {
    const claim =
    {
      claimId: 'MINE123',
      propertyType: 'business',
      accessible: false,
      dateOfSubsidence: '2019-07-26T09:54:19.622Z',
      mineType: ['gold'],
      email: 'test@email.com'
    }

    const mockSender = {
      sendMessage: function (messagein) {
        throw new Error('boom')
      }
    }

    await messageAction(claim, mockSender)
  })
})

describe('sqs calculation message action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('uses calculation service to calculate claim', () => {
    const message = mockMessage()
    sqsCalculationMessageAction(message)
    expect(calculationService.calculate).toHaveBeenCalledWith(
      expect.objectContaining(JSON.parse(message.Body))
    )
  })

  test('sends message with claim id on payment queue', () => {
    const message = mockMessage('SHAFT999')
    const { claimId } = JSON.parse(message.Body)
    sqsCalculationMessageAction(message)
    expect(JSON.parse(sendMessage.mock.calls[0][0].messageBody)).toStrictEqual(
      expect.objectContaining({ claimId })
    )
  })

  test('sends message with calculation value on payment queue', () => {
    const message = mockMessage()
    sqsCalculationMessageAction(message)
    expect(JSON.parse(sendMessage.mock.calls[0][0].messageBody)).toStrictEqual(
      expect.objectContaining({ value: 190.96 })
    )
  })

  test('sends message on given url', () => {
    const { sqsPaymentQueueConfig: { url: queueUrl } } = mockConfig
    sqsCalculationMessageAction(mockMessage())
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ queueUrl })
    )
  })

  test('sends message with given access key id', () => {
    const { sqsPaymentQueueConfig: { publishCredentials: { accessKeyId } } } = mockConfig
    sqsCalculationMessageAction(mockMessage())
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ accessKeyId })
    )
  })

  test('sends message via given region', () => {
    const { sqsPaymentQueueConfig: { region } } = mockConfig
    sqsCalculationMessageAction(mockMessage())
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ region })
    )
  })

  test('sends message with given secret access key', () => {
    const { sqsPaymentQueueConfig: { publishCredentials: { secretAccessKey } } } = mockConfig
    sqsCalculationMessageAction(mockMessage())
    expect(sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ secretAccessKey })
    )
  })

  test('doesn\'t send a message if queue url is empty', () => {
    const url = mockConfig.sqsPaymentQueueConfig.url
    mockConfig.sqsPaymentQueueConfig.url = ''
    sqsCalculationMessageAction(mockMessage())
    expect(sendMessage).not.toHaveBeenCalled()
    mockConfig.sqsPaymentQueueConfig.url = url
  })

  test('doesn\'t send a message if access key id is empty', () => {
    const accessKeyId = mockConfig.sqsPaymentQueueConfig.publishCredentials.accessKeyId
    mockConfig.sqsPaymentQueueConfig.publishCredentials.accessKeyId = ''
    sqsCalculationMessageAction(mockMessage())
    expect(sendMessage).not.toHaveBeenCalled()
    mockConfig.sqsPaymentQueueConfig.publishCredentials.accessKeyId = accessKeyId
  })

  test('doesn\'t send a message if region is empty', () => {
    const region = mockConfig.sqsPaymentQueueConfig.region
    mockConfig.sqsPaymentQueueConfig.region = ''
    sqsCalculationMessageAction(mockMessage())
    expect(sendMessage).not.toHaveBeenCalled()
    mockConfig.sqsPaymentQueueConfig.url = region
  })

  test('doesn\'t send a message if secret access key is empty', () => {
    const secretAccessKey = mockConfig.sqsPaymentQueueConfig.publishCredentials.secretAccessKey
    mockConfig.sqsPaymentQueueConfig.publishCredentials.secretAccessKey = ''
    sqsCalculationMessageAction(mockMessage())
    expect(sendMessage).not.toHaveBeenCalled()
    mockConfig.sqsPaymentQueueConfig.publishCredentials.secretAccessKey = secretAccessKey
  })
})

const mockMessage = (claimId = 'MINE123') => ({
  Body: JSON.stringify({
    claimId,
    propertyType: 'business',
    accessible: false,
    dateOfSubsidence: '2019-07-26T09:54:19.622Z',
    mineType: ['gold'],
    email: 'test@email.com'
  })
})
