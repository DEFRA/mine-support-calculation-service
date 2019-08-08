function onError (context, name) {
  const senderError = context.sender && context.sender.error
  if (senderError) {
    console.error(`session error for ${name} sender`, senderError)
  }
}

function onSessionError (context, name) {
  const senderError = context.sender && context.sender.error
  if (senderError) {
    console.error(`session error for ${name} sender`, senderError)
  }
}

function getSenderConfig (name, config) {
  return {
    name,
    target: { address: config.address },
    onError: (context) => onError(context, name),
    onSessionError: (context) => onSessionError(context, name),
    sendTimeoutInSeconds: config.sendTimeoutInSeconds || 10
  }
}

function getReceiverConfig (name, config) {
  return {
    name,
    source: { address: config.address },
    onSessionError: (context) => onSessionError(context, name)
  }
}

module.exports = {
  getReceiverConfig,
  getSenderConfig
}
