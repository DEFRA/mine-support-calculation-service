const MessageSender = require('../server/services/messaging/message-sender')
const config = require('../server/config')

const message = {
  'claimId': 'TEST123',
  'propertyType': 'business',
  'accessible': false,
  'dateOfSubsidence': '2019-07-26T09:54:19.622Z',
  'mineType': ['coal'],
  'email': 'test@email.com'
}

async function sendMessage () {
  const testConfig = {
    ...config.paymentQueueConfig,
    address: 'calculation'
  }

  const messageSender = new MessageSender('test-sender', testConfig)
  await messageSender.openConnection()
  const delivery = await messageSender.sendMessage(message)
  await messageSender.closeConnection()

  return delivery
}

sendMessage()
  .then((delivery) => console.debug('Message sent:', delivery))
  .catch(() => {
    console.error('Failed to send message')
    process.exitCode = 1
  })
  .finally(() => process.exit())
