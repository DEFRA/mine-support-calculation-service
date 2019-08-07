const rheaPromise = require('rhea-promise')

function registerEvents (receiver, address, action) {
  receiver.on(rheaPromise.ReceiverEvents.message, (context) => {
    console.log(`message received - ${address} - ${context.message.body}`)
    try {
      const claim = JSON.parse(context.message.body)
      action(claim)
    } catch (ex) {
      console.error('error with message', ex)
    }
  })

  receiver.on(rheaPromise.ReceiverEvents.receiverError, (context) => {
    const receiverError = context.receiver && context.receiver.error
    if (receiverError) {
      console.log(`receipt error for ${address} receiver - ${receiverError}`)
    }
  })
}
exports.registerEvents = registerEvents
