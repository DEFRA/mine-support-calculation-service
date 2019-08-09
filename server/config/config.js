const joi = require('@hapi/joi')
const mqConfig = require('./mq-config')

// Define config schema
const schema = {
  env: joi.string().valid('development', 'test', 'production').default('development')
}

const config = {
  env: process.env.NODE_ENV
}

// Validate config
const result = joi.validate(config, schema, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

// Use the joi validated value
const value = result.value

// Add some helper props
value.isDev = value.env === 'development'
value.isProd = value.env === 'production'

value.paymentQueueConfig = mqConfig.paymentQueueConfig
value.calculationQueueConfig = mqConfig.calculationQueueConfig

module.exports = value
