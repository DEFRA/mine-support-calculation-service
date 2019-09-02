const healthService = require('../../server/services/health-service')
const fs = require('fs')
const path = require('path')
const FILE_NAME = path.join(__dirname, '../../healthy.txt')

describe('Health service', () => {
  afterEach(async () => {
    fs.unlink(FILE_NAME, (err) => {
      if (err) {
        if (err.code !== 'ENOENT') {
          console.log(err)
          throw err
        }
      }
    })
  })

  test('writeHealthy creates file', async () => {
    await healthService.writeHealthy()
    const result = fs.existsSync(FILE_NAME)
    expect(result).toBe(true)
  })

  test('deleteHealthy deletes file', async () => {
    await healthService.writeHealthy()
    await healthService.deleteHealthy()
    const result = fs.existsSync(FILE_NAME)
    expect(result).toBe(false)
  })
})
