const createMessage = require('../../../app/messaging/create-message')

describe('createMessage', () => {
  test('should create a message', () => {
    const payment = { claimId: 'claim123', value: 100 }
    expect(createMessage(payment)).toMatchObject({
      body: payment,
      type: 'uk.gov.demo.claim.calculated',
      source: 'ffc-demo-calculation-service'
    })
  })
})
