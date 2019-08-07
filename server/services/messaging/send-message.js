const rheaPromise = require('rhea-promise')

async function publishMessage (config, calculation) {
  try {
    const connection = new rheaPromise.Connection(config)
    console.log(`New calculation to send to message queues : ${JSON.stringify(calculation)}`)
    try {
      await connection.open()

      await sendMessage(calculation, connection, config.address)
      console.log('calculation delivered')
    } catch (error) {
      console.log(error)
      throw error
    }
    await connection.close()
  } catch (err) {
    console.log(err)
    throw err
  }
}

async function sendMessage (claim, connection, queueName) {
  const data = JSON.stringify(claim)
  const sender = await connection.createSender({ target: { address: queueName } })
  try {
    console.log(`Sending claim to ${queueName}`)
    const delivery = await sender.send({ body: data })
    return delivery
  } catch (error) {
    throw error
  } finally {
    await sender.close()
  }
}
module.exports = publishMessage
