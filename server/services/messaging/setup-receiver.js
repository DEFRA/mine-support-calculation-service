const { registerEvents } = require('./register-events')
const { getReceiverOptions } = require('./get-receiver-options')
async function setupReceiver (connection, address, action) {
  const receiver = await connection.createReceiver(getReceiverOptions(address))
  registerEvents(receiver, address, action)
}
module.exports = setupReceiver
