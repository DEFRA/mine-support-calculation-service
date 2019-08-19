const BASE_VALUE = 100

function calculate (claim) {
  switch (claim.propertyType) {
    case 'business': return BASE_VALUE * 2
    default: return BASE_VALUE
  }
}

module.exports = calculate
