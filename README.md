[![Known Vulnerabilities](https://snyk.io/test/github/DEFRA/ffc-demo-calculation-service/badge.svg?targetFile=package.json)](https://snyk.io/test/github/DEFRA/ffc-demo-calculation-service?targetFile=package.json)

# FFC Demo Calculation Service

Digital service mock to claim public money in the event property subsides into mine shaft.  The calculation service subscribes to a message queue for new claims and calculates a value for each claim.  Once calculated it publishes the value to a message queue.

## Prerequisites

Access to an instance of an
[Azure Service Bus](https://docs.microsoft.com/en-us/azure/service-bus-messaging/)(ASB).
And either:
- Docker
- Docker Compose

Or:
- Kubernetes
- Helm

Or:
- Node 10+
- Redis

### Azure Service Bus

This service depends on a valid Azure Service Bus connection string for
asynchronous communication.  The following environment variables need to be set
in any non-production (`!config.isProd`) environment before the Docker
container is started. When deployed into an appropriately configured AKS
cluster (where [AAD Pod Identity](https://github.com/Azure/aad-pod-identity) is
configured) the micro-service will use AAD Pod Identity through the manifests
for
[azure-identity](./helm/ffc-demo-claim-service/templates/azure-identity.yaml)
and
[azure-identity-binding](./helm/ffc-demo-claim-service/templates/azure-identity-binding.yaml).

| Name                               | Description                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| MESSAGE_QUEUE_HOST                 | Azure Service Bus hostname, e.g. `myservicebus.servicebus.windows.net`                       |
| MESSAGE_QUEUE_PASSWORD             | Azure Service Bus SAS policy key                                                             |
| MESSAGE_QUEUE_USER                 | Azure Service Bus SAS policy name, e.g. `RootManageSharedAccessKey`                          |

## Environment variables

The following environment variables are required by the application container. Values for development are set in the Docker Compose configuration. Default values for production-like deployments are set in the Helm chart and may be overridden by build and release pipelines.

| Name                            | Description                           | Required   | Default     | Valid                               | Notes                                                                             |
| ----                            | ----------                            | :--------: | -----       | ----                                | ----                                                                              |
| APPINSIGHTS_CLOUDROLE           | Role used for filtering metrics       | no         |             |                                     | Set to `ffc-demo-calculation-service-local` in docker compose files               |
| APPINSIGHTS_INSTRUMENTATIONKEY  | Key for application insight           | no         |             |                                     | App insights only enabled if key is present. Note: Silently fails for invalid key |
| CALCULATION_QUEUE_ADDRESS       | calculation queue name                | no         |             | calculation                         |                                                                                   |
| HEALTHZ_FILE_INTERVAL_IN_MILLIS | Interval for creation of healthz file | no         | 10000       |                                     | Maximum value 30000                                                               |
| NODE_ENV                        | Node environment                      | no         | development | development,test,production         |                                                                                   |
| PAYMENT_QUEUE_ADDRESS           | payment queue name                    | no         |             | payment                             |                                                                                   |

## How to run tests

A convenience script is provided to run automated tests in a containerised
environment. This will rebuild images before running tests via docker-compose,
using a combination of `docker-compose.yaml` and `docker-compose.test.yaml`.
The command given to `docker-compose run` may be customised by passing
arguments to the test script.

Examples:

```
# Run all tests
scripts/test

# Run only unit tests
scripts/test npm run test:unit
```

Alternatively, the same tests may be run locally via npm:

```
# Run tests without Docker
npm run test
```

Running the integration tests locally requires access to ASB, this can be
achieved by setting the following environment variables:

`MESSAGE_QUEUE_HOST`, `MESSAGE_QUEUE_PASSWORD`, `MESSAGE_QUEUE_USER` & `CALCULATION_QUEUE_ADDRESS`
must be set to valid, developer specific queues that are available on ASB, e.g.
for the payment queue that would be `ffc-demo-calculation-<initials>` where
`<initials>` are the initials of the developer.

## Running the application

The application is designed to run in containerised environments, using Docker
Compose in development and Kubernetes in production.

- A Helm chart is provided for production deployments to Kubernetes.

### Build container image

Container images are built using Docker Compose, with the same images used to
run the service with either Docker Compose or Kubernetes.

By default, the start script will build (or rebuild) images so there will
rarely be a need to build images manually. However, this can be achieved
through the Docker Compose
[build](https://docs.docker.com/compose/reference/build/) command:

```
# Build container images
docker-compose build
```

### Start and stop the service

Use Docker Compose to run service locally.

`docker-compose up`

Additional Docker Compose files are provided for scenarios such as linking to
other running services.

Link to other services:
```
docker-compose -f docker-compose.yaml -f docker-compose.link.yaml up
```
### Test the service

This service posts messages to an ASB message queue. Manual testing
involves creating claims using the web UI and inspecting the appropriate
message queue. The service can be started by running
`docker-compose up --build` whilst having the

The messages can be inspected with a tool such as
[Service Bus Explorer](https://github.com/paolosalvatori/ServiceBusExplorer) or
the Service Bus Explorer, available within
[Azure Portal](https://azure.microsoft.com/en-us/updates/sesrvice-bus-explorer/).

An example message:
```
{
  "claimId": "MINE123",
  "propertyType": "business",
  "accessible": false,
  "dateOfSubsidence": "2019-07-26T09:54:19.622Z"
}
```

### Link to sibling services

To test interactions with sibling services in the FFC demo application, it is
necessary to connect each service to an external Docker network, along with
shared dependencies such as message queues. The most convenient approach for
this is to start the entire application stack from the
[`ffc-demo-development`](https://github.com/DEFRA/ffc-demo-development)
repository.

The service has a command based liveness probe.  The probe will write a file
containing a timestamp to the `/tmp` directory.  If the timestamp has not been
updated in the last 30 seconds, the probe will report the service is not
functioning.

## Dependency management

Dependencies should be managed within a container using the development image
for the app. This will ensure that any packages with environment-specific
variants are installed with the correct variant for the contained environment,
rather than the host system which may differ between development and
production.

The [`exec`](./scripts/exec) script is provided to run arbitrary commands, such
as npm, in a running service container. If the service is not running when this
script is called, it will be started for the duration of the command and then
removed.

Since dependencies are installed into the container image, a full build should
always be run immediately after any dependency change.

In development, the `node_modules` folder is mounted to a named volume. This
volume must be removed in order for dependency changes to propagate from the
rebuilt image into future instances of the app container. The
[`start`](./scripts/start) script has a `--clean` (or `-c`) option  which will
achieve this.

The following example will update all npm dependencies, rebuild the container
image and replace running containers and volumes:

```
# Run the NPM update
scripts/exec npm update

# Rebuild and restart the service
scripts/start --clean
```

## Build Pipeline

The details of what is done during CI are best left to reviewing the
[Jenkinsfile](Jenkinsfile) as it changes over time, however, at a high level
the following happens:
- The application is validated
- The application is tested
- The application is built into deployed artifacts
- Those artifacts are deployed

A detailed description on the build pipeline and PR work flow is available in
the [Defra Confluence page](https://eaflood.atlassian.net/wiki/spaces/FFCPD/pages/1281359920/Build+Pipeline+and+PR+Workflow)

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT
LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and
applications when using this information.

> Contains public sector information licensed under the Open Government license
> v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her
Majesty's Stationery Office (HMSO) to enable information providers in the
public sector to license the use and re-use of their information under a common
open licence.

It is designed to encourage use and re-use of information freely and flexibly,
with only a few conditions.
