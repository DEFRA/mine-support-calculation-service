const joi = require('@hapi/joi')

const mqSchema = joi.object({
  calculationQueue: {
    url: joi.string().allow(''),
    region: joi.string().allow(''),
    listenCredentials: {
      accessKeyId: joi.string().allow(''),
      secretAccessKey: joi.string().allow('')
    }
  },
  paymentQueue: {
    url: joi.string().allow(''),
    region: joi.string().allow(''),
    publishCredentials: {
      accessKeyId: joi.string().allow(''),
      secretAccessKey: joi.string().allow('')
    }
  }
})

const mqConfig = {
  calculationQueue: {
    url: process.env.CALCULATION_QUEUE_URL,
    region: process.env.CALCULATION_QUEUE_REGION,
    publishCredentials: {
      accessKeyId: process.env.CALCULATION_QUEUE_ACCESS_KEY_ID,
      secretAccessKey: process.env.CALCULATION_QUEUE_ACCESS_KEY
    }
  },
  paymentQueue: {
    url: process.env.PAYMENT_QUEUE_URL,
    region: process.env.PAYMENT_QUEUE_REGION,
    publishCredentials: {
      accessKeyId: process.env.PAYMENT_QUEUE_ACCESS_KEY_ID,
      secretAccessKey: process.env.PAYMENT_QUEUE_ACCESS_KEY
    }
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
