const joi = require('@hapi/joi')

const mqSchema = joi.object({
  messageQueue: {
    host: joi.string().default('localhost'),
    hostname: joi.string().default('localhost'),
    port: joi.number().default(5672),
    reconnect_Limit: joi.number().default(10),
    transport: joi.string().default('tcp')
  },
  sqsCalculationQueue: {
    url: joi.string().default(''),
    listenCredentials: {
      accessKeyId: joi.string().default(''),
      secretAccessKey: joi.string().default('')
    }
  },
  sqsPaymentQueue: {
    url: joi.string().default(''),
    publishCredentials: {
      accessKeyId: joi.string().default(''),
      secretAccessKey: joi.string().default('')
    }
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
    host: process.env.MESSAGE_QUEUE_HOST,
    hostname: process.env.MESSAGE_QUEUE_HOST,
    port: process.env.MESSAGE_QUEUE_PORT,
    reconnect_Limit: process.env.MESSAGE_QUEUE_RECONNECT_LIMIT,
    transport: process.env.MESSAGE_QUEUE_TRANSPORT
  },
  sqsCalculationQueue: {
    url: process.env.SQS_CALCULATION_QUEUE_URL,
    listenCredentials: {
      accessKeyId: process.env.SQS_CALCULATION_QUEUE_LISTEN_ACCESS_KEY_ID,
      secretAccessKey: process.env.SQS_CALCULATION_QUEUE_LISTEN_SECRET_ACCESS_KEY
    }
  },
  sqsPaymentQueue: {
    url: process.env.SQS_PAYMENT_QUEUE_URL,
    publishCredentials: {
      accessKeyId: process.env.SQS_PAYMENT_QUEUE_PUBLISH_ACCESS_KEY_ID,
      secretAccessKey: process.env.SQS_PAYMENT_QUEUE_PUBLISH_SECRET_ACCESS_KEY
    }
  },
  calculationQueue: {
    address: process.env.CALCULATION_QUEUE_ADDRESS,
    username: process.env.CALCULATION_QUEUE_USER,
    password: process.env.CALCULATION_QUEUE_PASSWORD
  },
  paymentQueue: {
    address: process.env.PAYMENT_QUEUE_ADDRESS,
    username: process.env.PAYMENT_QUEUE_USER,
    password: process.env.PAYMENT_QUEUE_PASSWORD,
    sendTimeoutInSeconds: process.env.SEND_TIMEOUT_IN_SECONDS
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
const sqsCalculationQueueConfig = { ...mqResult.value.sqsCalculationQueue, ...mqResult.value.sqsCalculationQueue }
const sqsPaymentQueueConfig = { ...mqResult.value.sqsPaymentQueue, ...mqResult.value.sqsPaymentQueue }

module.exports = { paymentQueueConfig, calculationQueueConfig, sqsCalculationQueueConfig, sqsPaymentQueueConfig }
