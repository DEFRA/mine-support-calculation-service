const joi = require('@hapi/joi')

const mqSchema = joi.object({
  messageQueue: {
    host: joi.string().default('localhost'),
    usePodIdentity: joi.bool().default(false),
    type: joi.string(),
    appInsights: joi.object()
  },
  calculationQueue: {
    address: joi.string().default('calculation'),
    username: joi.string(),
    password: joi.string()
  },
  paymentTopic: {
    address: joi.string().default('payment'),
    username: joi.string(),
    password: joi.string(),
    type: joi.string().optional()
  }
})

const mqConfig = {
  messageQueue: {
    host: process.env.MESSAGE_QUEUE_HOST,
    usePodIdentity: process.env.NODE_ENV === 'production',
    type: 'queue',
    appInsights: process.env.NODE_ENV === 'production' ? require('applicationinsights') : undefined
  },
  calculationQueue: {
    address: process.env.CALCULATION_QUEUE_ADDRESS,
    password: process.env.MESSAGE_QUEUE_PASSWORD,
    username: process.env.MESSAGE_QUEUE_USER
  },
  paymentTopic: {
    address: process.env.PAYMENT_TOPIC_ADDRESS,
    password: process.env.MESSAGE_QUEUE_PASSWORD,
    username: process.env.MESSAGE_QUEUE_USER,
    type: 'topic'
  }
}

const mqResult = mqSchema.validate(mqConfig, {
  abortEarly: false
})

// Throw if config is invalid
if (mqResult.error) {
  throw new Error(`The message queue config is invalid. ${mqResult.error.message}`)
}

const paymentTopicConfig = { ...mqResult.value.messageQueue, ...mqResult.value.paymentTopic }
const calculationQueueConfig = { ...mqResult.value.messageQueue, ...mqResult.value.calculationQueue }

module.exports = { paymentTopicConfig, calculationQueueConfig }
