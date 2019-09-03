const healthService = require('../../server/services/health-service')
const fs = require('fs')
const path = require('path')
const FILE_NAME = path.join(__dirname, '../../server/healthy.txt')

describe('Health service', () => {
  afterEach(() => {
    try {
      fs.unlinkSync(FILE_NAME)
    } catch (err) {
      console.log(err)
    }
  })

  test('writeHealthy creates file', async () => {
    await healthService.writeHealthy()
    const result = fs.existsSync(FILE_NAME)
    expect(result).toBe(true)
  })

  test('deleteHealthy deletes file', async () => {
    fs.writeFile(FILE_NAME, 'healthy', { encoding: 'utf8', mode: 0o777 }, async (err) => {
      if (err) {
        console.log(err)
        throw err
      }
      await healthService.deleteHealthy()
      const result = fs.existsSync(FILE_NAME)
      expect(result).toBe(false)
    })
  })

  test('deleteHealthy does not error if file does not exits', async () => {
    expect(async () => healthService.deleteHealthy()).not.toThrow()
  })
})
