const healthService = require('../../server/services/health-service')
let fs

describe('Health service', () => {
  test('writeLiveness creates file', async () => {
    jest.mock('fs')
    fs = require('fs')
    fs.writeFile = jest.fn(() => {})
    await healthService()
    expect(fs.writeFile.mock.calls.length).toBe(1)
    jest.unmock('fs')
  })

  test('writeLiveness creates file with correct name and location', async () => {
    jest.mock('fs')
    fs = require('fs')
    fs.writeFile = jest.fn(() => {})
    await healthService()
    expect(fs.writeFile.mock.calls[0][0]).toBe('/tmp/calculation-service-healthz.txt')
    jest.unmock('fs')
  })
})
