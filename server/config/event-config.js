const joi = require('@hapi/joi')

const schema = joi.object({
  host: joi.string().default('localhost:9092'),
  eventHubConnectionString: joi.string().allow(''),
  calculationGroup: joi.string().default('ffc-demo-calculation-service'),
  calculationTopic: joi.string().default('ffc-demo-claim-valid'),
  paymentTopic: joi.string().default('ffc-demo-claim-calculation')

})

const config = {
  host: process.env.EVENT_HUB_HOST,
  eventHubConnectionString: process.env.EVENT_HUB_CONNECTION_STRING,
  calculationGroup: process.env.CALCULATION_GROUP,
  calculationTopic: process.env.CALCULATION_TOPIC,
  paymentTopic: process.env.PAYMENT_TOPIC
}

const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The event config is invalid. ${result.error.message}`)
}

module.exports = result.value
