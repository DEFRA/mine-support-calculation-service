const fs = require('fs')
const path = require('path')
const FILE_NAME = path.join(__dirname, '../healthy.txt')

module.exports = {
  writeHealthy: async function () {
    fs.writeFile(FILE_NAME, 'healthy', { encoding: 'utf8', mode: 0o777 }, function (err) {
      if (err) {
        throw err
      }
    })
  },
  deleteHealthy: async function () {
    fs.unlink(FILE_NAME, function (err) {
      if (err && err.code !== 'ENOENT') {
        throw err
      }
    })
  }
}
