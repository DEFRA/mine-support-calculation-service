const joi = require('@hapi/joi')

const mqSchema = joi.object({
  calculationQueue: {
    name: joi.string().default('calculation'),
    endpoint: joi.string().default('http://localhost:9324'),
    queueUrl: joi.string().default('http://localhost:9324/calculation'),
    region: joi.string().default('eu-west-2'),
    accessKeyId: joi.string(),
    secretAccessKey: joi.string(),
    createQueue: joi.bool().default(true)
  },
  paymentQueue: {
    name: joi.string().default('payment'),
    endpoint: joi.string().default('http://localhost:9324'),
    queueUrl: joi.string().default('http://localhost:9324/payment'),
    region: joi.string().default('eu-west-2'),
    accessKeyId: joi.string(),
    secretAccessKey: joi.string(),
    createQueue: joi.bool().default(true)
  }
})

const mqConfig = {
  calculationQueue: {
    endpoint: process.env.CALCULATION_URL,
    queueUrl: process.env.CALCULATION_QUEUE_URL,
    region: process.env.CALCULATION_QUEUE_REGION,
    accessKeyId: process.env.CALCULATION_QUEUE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CALCULATION_QUEUE_ACCESS_KEY
  },
  paymentQueue: {
    endpoint: process.env.PAYMENT_URL,
    queueUrl: process.env.PAYMENT_QUEUE_URL,
    region: process.env.PAYMENT_QUEUE_REGION,
    accessKeyId: process.env.PAYMENT_QUEUE_ACCESS_KEY_ID,
    secretAccessKey: process.env.PAYMENT_QUEUE_ACCESS_KEY
  }
}

const mqResult = mqSchema.validate(mqConfig, {
  abortEarly: false
})

// Throw if config is invalid
if (mqResult.error) {
  throw new Error(`The message queue config is invalid. ${mqResult.error.message}`)
}

const paymentQueueConfig = { ...mqResult.value.messageQueue, ...mqResult.value.paymentQueue }
const calculationQueueConfig = { ...mqResult.value.messageQueue, ...mqResult.value.calculationQueue }

module.exports = { paymentQueueConfig, calculationQueueConfig }
