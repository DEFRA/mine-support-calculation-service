const messageAction = require('../../../server/services/message-action')

describe('message action', () => {
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
