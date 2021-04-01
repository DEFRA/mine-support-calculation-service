const { PublishEvent } = require('ffc-protective-monitoring')

function sendEvent (message) {
  console.log(process.env.PROTECTIVE_MONITORING_URL)
  // const protectiveMonitoring = new PublishEvent(process.env.PROTECTIVE_MONITORING_URL)
  const protectiveMonitoring = new PublishEvent('https://prod-52.northeurope.logic.azure.com:443/workflows/7b54bcdf13134cfbb63edd95d7fb81f2/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kVFdY0yXQ08l81Y9E2tlsBviD1FriETI1DlznFfhKCI')
  protectiveMonitoring.sendEvent({
    user: 'IDM/8b7c6b0a-4ea2-e911-a971-000d3a28d1a0',
    sessionid: 'e66d78f5-a58d-46f6-a9b4-f8c90e99b6dc',
    datetime: '2020-10-09T12:51:41.381Z',
    environment: 'PRD-Blue',
    version: '1.1',
    application: 'ffc-demo-calculation-service',
    component: '<internal app name>',
    ip: '127.0.0.1',
    pmccode: '0703',
    priority: '0',
    details: {
      transactioncode: '0001',
      message,
      additionalinfo: '<details or obfuscated location of document, etc.>'
    }
  })
}

module.exports = { sendEvent }
