const configHelper = require('../../../server/services/messaging/config-helper')
const config = require('../../../server/config')
const name = 'test-sender-config'
const address = 'test-send'

describe('config helper', () => {
  describe('configuration', () => {
    test('sender config should set name, address, session error handler, error handler, and default timeout of 10 seconds', async () => {
      const testConfig = { ...config.paymentQueueConfig, address }

      const senderConfig = configHelper.getSenderConfig(name, testConfig)
      expect(senderConfig.target.address).toEqual(address)
      expect(senderConfig.name).toEqual(name)
      expect(senderConfig.onSessionError).toBeDefined()
      expect(senderConfig.onError).toBeDefined()
      expect(senderConfig.sendTimeoutInSeconds).toEqual(10)
    })

    test('receiver config should set name, address, and session error handler', async () => {
      const testConfig = { ...config.calculationQueueConfig, address }

      const receiverConfig = configHelper.getReceiverConfig(name, testConfig)
      expect(receiverConfig.source.address).toEqual(address)
      expect(receiverConfig.name).toEqual(name)
      expect(receiverConfig.onSessionError).toBeDefined()
    })
  })
})
