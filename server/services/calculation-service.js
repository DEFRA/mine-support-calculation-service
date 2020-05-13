const calculations = require('./calculations')
const _ = require('lodash')

module.exports = {
  calculate: function (claim) {
    const gross = calculations.gross(claim)
    const net1 = calculations.net1(claim)
    const net2 = calculations.net2(claim)
    const value = _.round(gross - net1 - net2, 2)

    console.log(`calculated ${claim.claimId} as ${value}`)
    return value
  },
  newFunc: (s) => {
    switch (s) {
      case 'a':
        break
      case 'b':
        break
      case 'c':
        break
      case 'd':
        break
      case 'e':
        break
      default:
        break
    }
  }
}
