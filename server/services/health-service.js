const fs = require('fs')
const path = require('path')
const FILE_NAME = path.join(__dirname, '../../healthy.txt')

module.exports = {
  writeHealthy: async function () {
    fs.writeFile(FILE_NAME, 'healthy', 'utf8', (err) => {
      if (err) {
        console.log(err)
        throw err
      }
    })
  },
  deleteHealthy: async function () {
    fs.unlink(FILE_NAME, (err) => {
      if (err) {
        if (err.code !== 'ENOENT') {
          console.log(err)
          throw err
        }
      }
    })
  }
}
