const processCalculationMessage = require('../../../app/messaging/process-calculation-message')

describe('processing claim message', () => {
  const message = {
    body: {
      claimId: 'MINE1',
      propertyType: 'business',
      accessible: false,
      dateOfSubsidence: '2019-07-26T09:54:19.622Z',
      email: 'joe.bloggs@defra.gov.uk'
    },
    complete: jest.fn(),
    abandon: jest.fn()
  }

  test('should complete valid claim', async () => {
    await processCalculationMessage(message)
    expect(message.complete).toHaveBeenCalled()
  })

  test('should abandon invalid claim', async () => {
    message.body = 'not a claim'
    await processCalculationMessage(message)
    expect(message.abandon).toHaveBeenCalled()
  })
})
