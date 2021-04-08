const { PublishEvent } = require('ffc-protective-monitoring')

async function sendEvent (claimId, message) {
  const protectiveMonitoring = new PublishEvent(process.env.PROTECTIVE_MONITORING_URL)
  await protectiveMonitoring.sendEvent({
    sessionid: claimId,
    datetime: createEventDate(),
    version: '1.1',
    application: 'ffc-demo-calculation-service',
    component: 'ffc-demo-calculation-service',
    ip: '',
    pmccode: '0001',
    priority: '0',
    details: {
      message
    }
  })
}

function createEventDate () {
  const eventDate = new Date()
  return eventDate.toISOString()
}

module.exports = sendEvent
