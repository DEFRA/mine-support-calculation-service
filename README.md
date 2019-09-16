[![Build Status](https://defradev.visualstudio.com/DEFRA_FutureFarming/_apis/build/status/defra-ffc-demo-calculation-service?branchName=master)](https://defradev.visualstudio.com/DEFRA_FutureFarming/_build/latest?definitionId=612&branchName=master)

# FFC Demo Calculation Service

Digital service mock to claim public money in the event property subsides into mine shaft.  The calculation service subscribes to a message queue for new claims and calculates a value for each claim.  Once calculated it publishes the value to a message queue.

# Prerequisites

Either:
- Docker
- Docker Compose

Or:
- Kubernetes
- Helm

Or:
- Node 10
- AMQP 1.0 message queue

# Environment variables

The following environment variables are required by the application container. Values for development are set in the Docker Compose configuration. Default values for production-like deployments are set in the Helm chart and may be overridden by build and release pipelines.

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
 | HEALTHZ_FILE_INTERVAL_IN_MILLIS | Interval for creation of healthz file | no       | 10000            |                                     | Maximum value 30000  |

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

The application is designed to run in containerised environments: Docker Compose for development; Kubernetes for production.

A Helm chart is provided for deployment to Kubernetes and scripts are provided for local development and testing.

## Build container image

Container images are built using Docker Compose and the same image may be run in either Docker Compose or Kubernetes.

The [`build`](./scripts/build) script is essentially a shortcut and will pass any arguments through to the `docker-compose build` command.

```
# Build images using default Docker behaviour
scripts/build

# Build images without using the Docker cache
scripts/build --no-cache
```

## Run as an isolated service

To test this service in isolation, use the provided scripts to start and stop a local instance. This relies on Docker Compose and will run direct dependencies, such as message queues and databases, as additional containers. Arguments given to the [`start`](./scripts/start) script will be passed through to the `docker-compose up` command.

```
# Start the service and attach to running containers (press `ctrl + c` to quit)
scripts/start

# Start the service without attaching to containers
scripts/start --detach

# Send a sample request to the /submit endpoint
curl  -i --header "Content-Type: application/json" \
  --request POST \
  --data '{ "claimId": "MINE123", "propertyType": "business",  "accessible": false,   "dateOfSubsidence": "2019-07-26T09:54:19.622Z",  "mineType": ["gold"] }' \
  http://localhost:3003/submit

# Stop the service and remove Docker volumes and networks created by the start script
scripts/stop
```

## Connect to sibling services

To test this service in combination with other parts of the FFC demo application, it is necessary to connect each service to an external Docker network and shared dependencies, such as message queues. Start the shared dependencies from the [`mine-support-development`](https://github.com/DEFRA/mine-support-development) repository and then use the `connected-` [`scripts`](./scripts/) to start this service. Follow instructions in other repositories to connect each service to the shared dependencies and network.

```
# Start the service
script/connected-start

# Stop the service
script/connected-stop
```

## Deploy to Kubernetes

For production deployments, a helm chart is included in the `.\helm` folder. This service connects to an AMQP 1.0 message broker, using credentials defined in [values.yaml](./helm/values.yaml), which must be made available prior to deployment.

Scripts are provided to test the Helm chart by deploying the service, along with an appropriate message broker, into the current Helm/Kubernetes context.

```
# Deploy to current Kubernetes context
scripts/helm/install

# Remove from current Kubernetes context
scripts/helm/delete
```

# Manual testing

This service reacts to messages retrieved from an AMQP 1.0 message broker.

The [start](./scripts/start) script runs [ActiveMQ Artemis](https://activemq.apache.org/components/artemis) alongside the application to provide the required message bus and broker.

Test messages can be sent via the Artemis console UI hosted at http://localhost:8161/console/login (username: artemis, password: artemis). Messages should match the format of the sample JSON below.

### Probes

The service has a command based liveness probe.  The probe will write a file containing a timestamp to the `/tmp` directory.  If the timestamp has not been updated in the last 30 seconds, the probe will report the service is not functioning.

# Sample valid JSON
__Sample calculation queue message__

```
{
  "claimId": "MINE123",
  "propertyType": "business",
  "accessible": false,
  "dateOfSubsidence": "2019-07-26T09:54:19.622Z",
  "mineType": ["gold"],
  "email": "test@email.com"
}
```

Alternatively, the [send-test-mesage](./scripts/send-test-message) script may be run to send a sample message to the running Artemis instance.

```
# Send a sample message to the Artemis message queue
scripts/send-test-message
```

# Build pipeline

The [azure-pipelines.yaml](azure-pipelines.yaml) performs the following tasks:
- Runs unit tests
- Publishes test result
- Pushes containers to the registry tagged with the PR number or release version
- Deletes PR deployments, containers, and namepace upon merge

Builds will be deployed into a namespace with the format `ffc-demo-calculation-service-{identifier}` where `{identifier}` is either the release version, the PR number, or the branch name.

A detailed description on the build pipeline and PR work flow is available in the [Defra Confluence page](https://eaflood.atlassian.net/wiki/spaces/FFCPD/pages/1281359920/Build+Pipeline+and+PR+Workflow)
