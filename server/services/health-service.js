const fs = require('fs')

async function writeLiveness () {
  fs.writeFile('/tmp/calculation-service-healthz.txt', Date.now(), (err) => {
    if (err) throw err
  })
}

module.exports = writeLiveness
