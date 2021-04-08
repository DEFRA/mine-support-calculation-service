const processCalculationMessage = require('../../../app/messaging/process-calculation-message')

describe('processing claim message', () => {
  const message = {
    body: {
      claimId: 'MINE1',
      propertyType: 'business',
      accessible: false,
      dateOfSubsidence: '2019-07-26T09:54:19.622Z',
      email: 'joe.bloggs@defra.gov.uk'
    }
  }

  const calculationReceiver = {
    completeMessage: jest.fn(),
    abandonMessage: jest.fn(),
    deadLetterMessage: jest.fn()
  }

  test('should complete valid claim', async () => {
    await processCalculationMessage(message, calculationReceiver)
    expect(calculationReceiver.completeMessage).toHaveBeenCalled()
  })

  test('should deadletter invalid claim', async () => {
    message.body = {}
    await processCalculationMessage(message, calculationReceiver)
    expect(calculationReceiver.deadLetterMessage).toHaveBeenCalled()
  })

  test('should abandon no claim', async () => {
    message.body = undefined
    await processCalculationMessage(message, calculationReceiver)
    expect(calculationReceiver.abandonMessage).toHaveBeenCalled()
  })
})
