const { start, stop } = require('../../../app/messaging/index')

jest.mock('../../../app/messaging/index', () => {
  return {
    start: jest.fn().mockImplementation(() => 'start receiving message'),
    stop: jest.fn().mockImplementation(() => 'close connection')
  }
})
describe('messaging index', () => {
  test('start should be called', () => {
    start()
    expect(start).toHaveBeenCalled()
    expect(start()).toBe('start receiving message')
  })
  test('stop should be called', () => {
    stop()
    expect(stop).toHaveBeenCalled()
    expect(stop()).toBe('close connection')
  })
})
