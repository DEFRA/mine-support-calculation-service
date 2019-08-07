const messageService = require('../../server/services/messaging/message-service')

describe('message service', () => {
  afterEach(async () => {
    await messageService.closeConnection()
  })
  test('message service registers can register receiver', async () => {
    await messageService.receiveClaim()
  })
})
