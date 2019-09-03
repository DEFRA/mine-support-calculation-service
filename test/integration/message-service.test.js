
let messageService

describe('message service', () => {
  beforeAll(() => {
    jest.mock('../../server/services/health-service')
    messageService = require('../../server/services/message-service')
  })

  afterAll(() => {
    jest.unmock('../../server/services/health-service')
  })

  afterEach(async () => {
    await messageService.closeConnections()
  })
  test('smoke test', async () => {
    await messageService.registerQueues()
    await messageService.closeConnections()
  })
})
