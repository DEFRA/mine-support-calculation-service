function createMessage (payment) {
  return {
    body: payment,
    type: 'uk.gov.demo.claim.calculated',
    source: 'ffc-demo-calculation-service'
  }
}

module.exports = createMessage
