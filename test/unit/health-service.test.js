const healthService = require('../../app/services/health-service')
const fs = require('fs')
jest.mock('fs')

describe('Health service', () => {
  test('writeLiveness creates file with correct name and location', () => {
    healthService()
    expect(fs.writeFileSync).toHaveBeenCalledWith('/tmp/calculation-service-healthz.txt', expect.any(String))
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
})
