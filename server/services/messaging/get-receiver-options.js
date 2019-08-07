function getReceiverOptions (address) {
  return {
    name: address,
    source: { address },
    onSessionError: (context) => {
      const sessionError = context.session && context.session.error
      if (sessionError) {
        console.log(`session error for ${address} receiver - ${sessionError}`)
      }
    }
  }
}
exports.getReceiverOptions = getReceiverOptions
