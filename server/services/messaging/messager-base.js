const rheaPromise = require('rhea-promise')

class MessagerBase {
  constructor (name, config) {
    this.name = name
    this.connection = new rheaPromise.Connection(config)
  }

  async openConnection () {
    try {
      await this.connection.open()
      console.log(`${this.name} connection opened`)
    } catch (error) {
      console.error(`error opening ${this.name} connection`)
      throw error
    }
  }

  async closeConnection () {
    await this.connection.close()
    console.log(`${this.name} connection closed`)
  }
}

module.exports = MessagerBase
