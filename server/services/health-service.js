const fs = require('fs')
const path = require('path')

async function writeLiveness () {
  fs.writeFile(path.join(__dirname, 'healthy.txt'), Date.now(), (err) => {
    if (err) throw err
  })
}

module.exports = writeLiveness
