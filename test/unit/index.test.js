jest.mock('../../app/services/health-service', () => {
  return jest.fn()
})
jest.mock('../../app/services/app-insights', () => {
  return {
    setup: jest.fn()
  }
})

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

jest.mock('../../app/config', () => {
  return {
    healthzFileInterval: 1000,
    env: 'development',
    protectiveMonitoringUrl: '',
    paymentTopicConfig: {
      host: 'test',
      useCredentialChain: false,
      managedIdentityClientId: 'process.env.AZURE_CLIENT_ID',
      type: 'topic',
      appInsights: undefined,
      name: 'ffc-demo-calculation-service-payment',
      address: 'payment',
      username: 'process.env.MESSAGE_QUEUE_USER',
      password: '<PASSWORD>'
    },
    calculationQueueConfig: {
      host: 'test',
      useCredentialChain: false,
      managedIdentityClientId: 'process.env.AZURE_CLIENT_ID',
      type: 'topic',
      name: 'ffc-demo-calculation-service-calculation',
      address: 'calculation',
      username: 'process.env.MESSAGE_QUEUE_USER',
      password: '<PASSWORD>'
    }
  }
})
describe('index', () => {
  let exitSpy
  let receiver
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {})
    receiver = new MessageReceiver()
    MessageReceiver.mockImplementation(() => receiver)
  })
  afterEach(() => {
    jest.useRealTimers()
    exitSpy.mockRestore()
  })

  test('should start the message service', async () => {
    require('../../app/index')
    jest.runOnlyPendingTimers()
  })

  test('should stop the message service on SIGTERM', async () => {
    require('../../app/index')
    jest.runOnlyPendingTimers()
    process.emit('SIGTERM')
  })

  test('should stop the service on SIGINT', async () => {
    require('../../app/index')
    jest.runOnlyPendingTimers()
    process.emit('SIGINT')
  })
})
