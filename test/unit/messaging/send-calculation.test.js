const { sendCalculation } = require('../../../app/messaging/send-calculation')

jest.mock('../../../app/messaging/send-calculation', () => {
    return {
        sendCalculation: jest.fn().mockImplementation(() => 'sending message to payment queue')
    }
})
describe('send calculation', () => {
    test('send calculation should be called', () => {
        sendCalculation()
        expect(sendCalculation).toHaveBeenCalled()
        expect(sendCalculation()).toBe('sending message to payment queue')
    })
})