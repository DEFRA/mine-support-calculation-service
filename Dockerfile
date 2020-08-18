ARG PARENT_VERSION=1.0.1-node12.16.0

# Development
FROM defradigital/node-development:${PARENT_VERSION} AS development
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node-development:${PARENT_VERSION}
ARG PORT_DEBUG=9229
EXPOSE ${PORT_DEBUG}

# Install node-rdkafka dependencies
USER root
RUN apk --no-cache add \
      lz4-dev \
      musl-dev \
      cyrus-sasl-dev \
      openssl-dev

RUN apk add --no-cache --virtual \
      .build-deps \
      gcc zlib-dev \
      libc-dev \
      bsd-compat-headers \
      py-setuptools
USER node

COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
CMD [ "npm", "run", "start:watch" ]

# Production
FROM defradigital/node:${PARENT_VERSION} AS production
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node:${PARENT_VERSION}
COPY --from=development /home/node/index.js /home/node/package*.json /home/node/
COPY --from=development /home/node/scripts/healthz  /home/node/scripts/healthz
COPY --from=development /home/node/server  /home/node/server

# Install node-rdkafka dependencies
USER root
RUN apk --no-cache add \
      lz4-dev \
      musl-dev \
      cyrus-sasl-dev \
      openssl-dev

RUN apk add --no-cache --virtual \
      .build-deps \
      gcc zlib-dev \
      libc-dev \
      bsd-compat-headers \
      py-setuptools
USER node

RUN npm ci
CMD [ "node", "index" ]
