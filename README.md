[![Build Status](https://defradev.visualstudio.com/DEFRA_FutureFarming/_apis/build/status/DEFRA.mine-support-calculation-service?branchName=master)](https://defradev.visualstudio.com/DEFRA_FutureFarming/_build/latest?definitionId=612&branchName=master)

# Mine Support Calculation Service

Digital service mock to claim public money in the event property subsides into mine shaft.  The calculation service subscribes to a message queue for new claims and calculates a value for each claim.  Once calculated it publishes the value to a message queue.

# Environment variables
 | Name                       | Description                 | Required | Default     | Valid                               | Notes |
 |----------------------------|-----------------------------|:--------:|-------------|-------------------------------------|-------|
 | NODE_ENV                   | Node environment            | no       | development | development,test,production         |       |
 | MESSAGE_QUEUE_HOST         | Message queue host          | no       |             | myservicebus.servicebus.windows.net |       |
 | MESSAGE_QUEUE_PORT         | Message queue port          | no       |             | 5671,5672                           |       |
 | MESSAGE_QUEUE_TRANSPORT    | Message queue transport     | yes      | tcp         | tcp,ssl                             | standard port is 5671 for ssl, 5672 for tcp |
 | CALCULATION_QUEUE_ADDRESS  | calculation queue name      | no       |             | calculation                         |       |
 | CALCULATION_QUEUE_USER     | calculation queue user name | no       |             |                                     |       |
 | CALCULATION_QUEUE_PASSWORD | calculation queue password  | no       |             |                                     |       |
 | PAYMENT_QUEUE_ADDRESS      | payment queue name          | no       |             | payment                             |       |
 | PAYMENT_QUEUE_USER         | payment queue user name     | no       |             |                                     |       |
 | PAYMENT_QUEUE_PASSWORD     | payment queue password      | no       |             |                                     |       |

# Prerequisites

- Node v10+
- Access to an AMQP 1.0 compatible message queue service

# How to run tests

A convenience script is provided to run automated tests in a containerised environment:

```
scripts/test
```

This runs tests via a `docker-compose run` command. If tests complete successfully, all containers, networks and volumes are cleaned up before the script exits. If there is an error or any tests fail, the associated Docker resources will be left available for inspection.

Alternatively, the same tests may be run locally via npm:

```
npm run test
```

Running the integration tests locally requires a message bus that supports AMQP 1.0 and the following environment variables setting:
`MESSAGE_QUEUE_HOST`, `MESSAGE_QUEUE_PORT`, `CALCULATION_QUEUE_USER`, `CALCULATION_QUEUE_PASSWORD`, `PAYMENT_QUEUE_ADDRESS`, `PAYMENT_QUEUE_USER`, `PAYMENT_QUEUE_PASSWORD`

# Running the application

The application is designed to run as a container via Docker Compose or Kubernetes (with Helm).

## Using Docker Compose

A set of convenience scripts are provided for local development and running via Docker Compose.

```
# Build service containers
scripts/build

# Start the service and attach to running containers (press `ctrl + c` to quit)
scripts/start

# Stop the service and remove Docker volumes and networks created by the start script
scripts/stop
```

Any arguments provided to the build and start scripts are passed to the Docker Compose `build` and `up` commands, respectively. For example:

```
# Build without using the Docker cache
scripts/build --no-cache

# Start the service without attaching to containers
scripts/start --detach
```

This service depends on an external Docker network named `mine-support` to communicate with other Mine Support services running alongside it. The start script will automatically create the network if it doesn't exist and the stop script will remove the network if no other containers are using it.

The external network is declared in a secondary Docker Compose configuration (referenced by the above scripts) so that this service can be run in isolation without creating an external Docker network.

### Message Queues

This service reacts to messages retrieved from a message queue comformant with the AMQP 1.0 protocol. The [start script](./scripts/start) is designed for full-stack application testing so it expects an Artemis instance to already be running on ports 5672 and 8161 (for AMQP and the Artemis web interface, respectively).

For testing this service in isolation, the default Docker Compose [override file](docker-compose.override.yaml) launches an instance of Artemis as an AMQP 1.0 Service bus with appropriate accounts and queue names.

```
docker-compose up
```

Test messages can be sent via the Artemis console UI hosted at http://localhost:8161/console/login. Sample valid JSON to send to the calculation queue can be found at the end of this README.

Alternatively the script [./scripts/send-test-mesage](./scripts/send-test-message) may be run to send a valid message to the running Artemis instance.

## Using Kubernetes

The service has been developed with the intention of running on Kubernetes in production.  A helm chart is included in the `.\helm` folder.

Running via Helm requires a local Postgres database to be installed and setup with the username and password defined in the [values.yaml](./helm/values.yaml). It is much simpler to develop using Docker Compose locally than to set up a local Kubernetes environment. See above for instructions.

To test Helm deployments locally, a [deploy](./deploy) script is provided.

```
# Build service containers
scripts/build

# Deploy to the current Helm context
scripts/deploy
```

# Sample valid JSON

{
  "claimId": "MINE123",
  "propertyType": "business",
  "accessible": false,
  "dateOfSubsidence": "2019-07-26T09:54:19.622Z",
  "mineType": ["gold"],
  "email": "test@email.com"
}

The [azure-pipelines.yaml](azure-pipelines.yaml) performs the following tasks:
- Runs unit tests
- Publishes test result
- Pushes containers to the registry tagged with the PR number or release version
- Deletes PR deployments, containers, and namepace upon merge

Builds will be deployed into a namespace with the format `mine-support-calculation-service-{identifier}` where `{identifier}` is either the release version, the PR number, or the branch name.

A detailed description on the build pipeline and PR work flow is available in the [Defra Confluence page](https://eaflood.atlassian.net/wiki/spaces/FFCPD/pages/1281359920/Build+Pipeline+and+PR+Workflow)
