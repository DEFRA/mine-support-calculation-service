const configHelper = require('../../../server/services/messaging/config-helper')
const config = require('../../../server/config')
const name = 'test-sender-config'
const address = 'test-send'

const consoleErrorOrig = console.consoleError

let mockConsoleError

describe('config helper error handling', () => {
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

  test('session error handler should log session error for sender', async () => {
    const testConfig = { ...config.calculationQueueConfig, address }

    const senderConfig = configHelper.getSenderConfig(name, testConfig)
    const contextStub = {
      session: {
        error: 'session error!'
      }
    }
    senderConfig.onSessionError(contextStub)
    expect(mockConsoleError.mock.calls.length).toEqual(1)
    const call1 = mockConsoleError.mock.calls[0]
    expect(call1[0]).toEqual(`session error for ${name}`)
    expect(call1[1]).toEqual(contextStub.session.error)
  })

  test('session error handler should log session error for receiver', async () => {
    const testConfig = { ...config.calculationQueueConfig, address }

    const receiverConfig = configHelper.getReceiverConfig(name, testConfig)
    const contextStub = {
      session: {
        error: 'session error!'
      }
    }
    receiverConfig.onSessionError(contextStub)
    expect(mockConsoleError.mock.calls.length).toEqual(1)
    const call1 = mockConsoleError.mock.calls[0]
    expect(call1[0]).toEqual(`session error for ${name}`)
    expect(call1[1]).toEqual(contextStub.session.error)
  })

  test('sender error handler should log sender error', async () => {
    const testConfig = { ...config.calculationQueueConfig, address }

    const senderConfig = configHelper.getSenderConfig(name, testConfig)
    const contextStub = {
      sender: {
        error: 'sender error!'
      }
    }
    senderConfig.onError(contextStub)
    expect(mockConsoleError.mock.calls.length).toEqual(1)
    const call1 = mockConsoleError.mock.calls[0]
    expect(call1[0]).toEqual(`sender error for ${name}`)
    expect(call1[1]).toEqual(contextStub.sender.error)
  })
})
