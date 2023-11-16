const sendCalculation = require('../../../app/messaging/send-calculation')
const config = require('../../../app/config')
const { MessageSender } = require('adp-messaging')
const createMessage = require('../../../app/messaging/create-message')
const protectiveMonitoringSendEvent = require('../../../app/services/protective-monitoring-service')

jest.mock('../../../app/config')
jest.mock('adp-messaging')
jest.mock('../../../app/messaging/create-message')
jest.mock('../../../app/services/protective-monitoring-service')

describe('sendCalculation', () => {
  test('should send a calculation message', async () => {
    // Arrange
    const payment = { claimId: '123', value: 100 }
    const message = {
      body: payment,
      type: 'uk.gov.demo.claim.calculated',
      source: 'ffc-demo-calculation-service'
    }
    createMessage.mockReturnValue(message)
    const sendMessage = jest.fn()
    const closeConnection = jest.fn()
    MessageSender.mockImplementation(() => ({ sendMessage, closeConnection }))

    // Act
    await sendCalculation(payment)

    // Assert
    expect(createMessage).toHaveBeenCalledWith(payment)
    expect(MessageSender).toHaveBeenCalledWith(config.paymentTopicConfig)
    expect(sendMessage).toHaveBeenCalledWith(message)
    expect(closeConnection).toHaveBeenCalledTimes(1)
    expect(protectiveMonitoringSendEvent).toHaveBeenCalled()
  })
})
