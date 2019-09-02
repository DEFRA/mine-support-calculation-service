const healthService = require('../health-service')

function onSenderError (context, name) {
  const senderError = context.sender && context.sender.error
  if (senderError) {
    console.error(`sender error for ${name}`, senderError)
  }
}

async function onSessionError (context, name) {
  const sessionError = context.session && context.session.error
  if (sessionError) {
    console.error(`session error for ${name}`, sessionError)
    await healthService.deleteHealthy()
  }
}

function getSenderConfig (name, config) {
  return {
    name,
    target: { address: config.address },
    onError: (context) => onSenderError(context, name),
    onSessionError: (context) => onSessionError(context, name),
    sendTimeoutInSeconds: config.sendTimeoutInSeconds
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
