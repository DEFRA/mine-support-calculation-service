
const MessageBase = require('../../server/services/messaging/message-base')
const config = require('../../server/config')

const consoleErrorOrig = console.consoleError

let mockConsoleError
let messageBase

describe('message base', () => {
  beforeAll(() => {
    mockConsoleError = jest.fn()
    console.error = mockConsoleError
  })
  afterAll(() => {
    console.error = consoleErrorOrig
  })
  beforeEach(() => {
    mockConsoleError.mockClear()
  })
  afterEach(async () => {
    await messageBase.closeConnection()
    messageBase = undefined
  })

  test('open connection error is logged with name then rethrown', async () => {
    const testConfig = { ...config.paymentQueueConfig, password: 'notthepassword' }
    const name = 'test-base'
    messageBase = new MessageBase(name, testConfig)
    let ex
    try {
      await messageBase.openConnection()
    } catch (err) {
      ex = err
    }
    expect(ex.message).toContain('Failed to authenticate')

    expect(mockConsoleError.mock.calls.length).toEqual(1)
    const call1 = mockConsoleError.mock.calls[0]
    expect(call1[0]).toEqual(`error opening ${name} connection`)
    expect(call1[1]).toEqual(ex)
  })
})
