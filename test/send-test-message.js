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
  const testConfig = { ...config.paymentQueueConfig, address: 'calculation' }
  const messageSender = new MessageSender('test-sender', testConfig)
  try {
    await messageSender.openConnection()
    const delivery = await messageSender.sendMessage(message)
    console.log('delivered', delivery)
  } catch (ex) {
    console.log(ex)
  }
  await messageSender.closeConnection()
}

sendMessage()
