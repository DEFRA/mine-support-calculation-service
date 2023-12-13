const messageAction = require('../../../app/messaging/process-calculation-message')

jest.mock('../../../app/services/calculation-service')
const calculationService = require('../../../app/services/calculation-service')

jest.mock('../../../app/services/protective-monitoring-service')
const protectiveMonitoringSendEvent = require('../../../app/services/protective-monitoring-service')

jest.mock('../../../app/messaging/send-calculation')
const sendCalculation = require('../../../app/messaging/send-calculation')

jest.mock('adp-messaging')
const { MessageReceiver } = require('adp-messaging')

MessageReceiver.mockImplementation(() => {
  return {
    subscribe: jest.fn(),
    deadLetterMessage: jest.fn(),
    completeMessage: jest.fn(),
    abandonMessage: jest.fn()
  }
})

describe('processCalculationMessage', () => {
  let receiver

  beforeEach(() => {
    jest.clearAllMocks()
    receiver = new MessageReceiver()
    MessageReceiver.mockImplementation(() => receiver)
  })

  test('should process a calculation message if claim id is present', async () => {
    const message = {
      body: {
        claimId: 'claim123'
      }
    }
    await messageAction(message, receiver)
    expect(calculationService.calculate).toHaveBeenCalled()
    expect(sendCalculation).toHaveBeenCalled()
    expect(receiver.completeMessage).toHaveBeenCalled()
    expect(protectiveMonitoringSendEvent).toHaveBeenCalled()
  })

  test('should process a calculation message if claim id is undefined', async () => {
    const message = {
      body: {
        claimId: undefined
      }
    }
    await messageAction(message, receiver)
    expect(receiver.deadLetterMessage).toHaveBeenCalled()
  })

  test('handle error', async () => {
    const message = {
      body: {
        claimId: 'claim123'
      }
    }
    calculationService.calculate.mockImplementation(() => {
      throw new Error('Error')
    })
    await messageAction(message, receiver)
    expect(receiver.abandonMessage).toHaveBeenCalled()
  })
})
