[![Build status](https://defradev.visualstudio.com/DEFRA_FutureFarming/_apis/build/status/defra-ff-mine-support-calculation-service)](https://defradev.visualstudio.com/DEFRA_FutureFarming/_build/latest?definitionId=564)

# Mine Support Calculation Service
Digital service mock to claim public money in the event property subsides into mine shaft.  The calculation service subscribes to a message queue for new claims and calculates a value for each claim.  Once calculated it publishes the value to a message queue.

# Environment variables
|Name|Description|Required|Default|Valid|Notes|
|---|---|:---:|---|---|---|
|NODE_ENV|Node environment|no|development|development,test,production||
|MESSAGE_QUEUE_HOST|Message queue host|no||myservicebus.servicebus.windows.net||
|MESSAGE_QUEUE_PORT|Message queue port|no||5671,5672||
|MESSAGE_QUEUE_TRANSPORT|Message queue transport|yes|tcp|tcp,ssl|standard port is 5671 for ssl, 5672 for tcp|
|CALCULATION_QUEUE_ADDRESS|calculation queue name|no||calculation||
|CALCULATION_QUEUE_USER|calculation queue user name|no||||
|CALCULATION_QUEUE_PASSWORD|calculation queue password|no||||
|PAYMENT_QUEUE_ADDRESS|payment queue name|no||payment||
|PAYMENT_QUEUE_USER|payment queue user name|no||||
|PAYMENT_QUEUE_PASSWORD|payment queue password|no||||

# Prerequisites
Node v10+
Message queue - amqp protocol

# Running the application
The application is designed to run as a container via Docker Compose or Kubernetes (with Helm).

A convenience script is provided to run via Docker Compose:

`./scripts/start`

This will create the required `mine-support` network before starting the service so that it can communicate with other Mine Support services running alongside it through docker-compose. The script will then attach to the running service, tailing its logs and allowing the service to be brought down by pressing `Ctrl + C`.

The [docker-compose.local.yaml](docker-compose.local.yaml) override file used by the start script also launches an instance of Artemis as an AMQP 1.0 Service bus with accounts and queue names set up to test the application locally. 

The script [wait-for](./wait-for) is used to ensure Artemis is accepting connections before subscribing to the calculation queue. Further details on `wait-for` are available [here](https://github.com/gesellix/wait-for).

When the `start` script is running test messages can be sent via the Artemis console UI hosted at http://localhost:8161/console/login. Sample valid JSON to send to the calculation queue can be found at the end of this README.

Alternatively the script [./scripts/send-test-mesage](./scripts/send-test-message) may be run to send a valid message to the running Artemis instance.

For the volume mounts to work correct via WSL the application needs to be run from `/c/...` rather than `/mnt/c/..`.

You may need to create a directory at `/c` then mount it via `sudo mount --bind /mnt/c /c` to be able to change to `/c/..`

Alternatively automounting may be set up. Further details available [here](https://nickjanetakis.com/blog/setting-up-docker-for-windows-and-wsl-to-work-flawlessly).

# Kubernetes
The service has been developed with the intention of running in Kubernetes.  A helm chart is included in the `.\helm` folder.

# How to run tests
Tests are written in Jest. The script used by the continuous integration build may be run via the script [./scripts/test](./scripts/test).

Tests can also be run locally but require a message bus that supports AMQP 1.0 for integration tests, and the following environment variables setting:
`MESSAGE_QUEUE_HOST`, `MESSAGE_QUEUE_PORT`, `CALCULATION_QUEUE_USER`, `CALCULATION_QUEUE_PASSWORD`, `PAYMENT_QUEUE_ADDRESS`, `PAYMENT_QUEUE_USER`, `PAYMENT_QUEUE_PASSWORD`

Local tests can be run with the command:

`npm run test`

# Sample valid JSON

{ 
  "claimId": "MINE123",
  "propertyType": "business",
  "accessible": false,
  "dateOfSubsidence": "2019-07-26T09:54:19.622Z",
  "mineType": ["gold"],
  "email": "test@email.com"
}
