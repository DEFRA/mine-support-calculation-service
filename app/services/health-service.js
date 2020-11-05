const fs = require('fs')

function writeLiveness () {
  fs.writeFileSync('/tmp/calculation-service-healthz.txt', Date.now())
}

module.exports = writeLiveness
