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
    arn: joi.string().default('calculation'),
    accessKey: joi.string().default('access-key'),
    secretKey: joi.string().default('secret-squirrel')
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
    arn: process.env.SQS_CALCULATION_QUEUE_ARN,
    accessKey: process.env.SQS_CALCULATION_QUEUE_ACCESS_KEY,
    secretKey: process.env.SQS_CALCULATION_QUEUE_SECRET_KEY
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

module.exports = { paymentQueueConfig, calculationQueueConfig, sqsCalculationQueueConfig }
