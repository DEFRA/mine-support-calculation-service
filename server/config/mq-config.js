const joi = require('@hapi/joi')

const mqSchema = joi.object({
  messageQueue: {
    host: joi.string().default('localhost')
  },
  calculationQueue: {
    address: joi.string().default('calculation'),
    username: joi.string(),
    password: joi.string()
  },
  paymentQueue: {
    address: joi.string().default('payment'),
    username: joi.string(),
    password: joi.string(),
    sendTimeoutInSeconds: joi.number().default(10)
  }
})

const mqConfig = {
  messageQueue: {
    host: process.env.MESSAGE_QUEUE_HOST
  },
  calculationQueue: {
    address: process.env.CALCULATION_QUEUE_ADDRESS,
    password: process.env.MESSAGE_QUEUE_PASSWORD,
    username: process.env.MESSAGE_QUEUE_USER
  },
  paymentQueue: {
    address: process.env.PAYMENT_QUEUE_ADDRESS,
    password: process.env.MESSAGE_QUEUE_PASSWORD,
    sendTimeoutInSeconds: process.env.SEND_TIMEOUT_IN_SECONDS,
    username: process.env.MESSAGE_QUEUE_USER
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
