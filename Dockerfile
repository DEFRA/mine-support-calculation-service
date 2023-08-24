ARG PARENT_VERSION=2.2.0-node18.16.0

# Development
FROM defradigital/node-development:${PARENT_VERSION} AS development
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node-development:${PARENT_VERSION}
ARG PORT_DEBUG=9229
EXPOSE ${PORT_DEBUG}
COPY --chown=node:node package*.json ./
RUN npm install
COPY --chown=node:node . .
CMD [ "npm", "run", "start:watch" ]

# Production
FROM defradigital/node:${PARENT_VERSION} AS production
ARG PARENT_VERSION
LABEL uk.gov.defra.ffc.parent-image=defradigital/node:${PARENT_VERSION}
COPY --from=development /home/node/package*.json /home/node/
COPY --from=development /home/node/scripts/healthz  /home/node/scripts/healthz
COPY --from=development /home/node/app  /home/node/app
RUN npm ci
CMD [ "node", "app" ]
