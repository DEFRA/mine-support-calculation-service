@Library('defra-library@0.0.2')
import uk.gov.defra.ffc.DefraUtils
def defraUtils = new DefraUtils()

def registry = '562955126301.dkr.ecr.eu-west-2.amazonaws.com'
def regCredsId = 'ecr:eu-west-2:ecr-user'
def kubeCredsId = 'awskubeconfig002'
def imageName = 'ffc-demo-calculation-service'
def repoName = 'ffc-demo-calculation-service'
def pr = ''
def mergedPrNo = ''
def containerTag = ''

def buildTestImage(name, suffix) {
  sh 'docker image prune -f || echo could not prune images'
  // NOTE: the docker-compose file currently makes use of global $BUILD_NUMBER env vars fo image names
  sh "docker-compose -p $name-$suffix -f docker-compose.test.yaml build --no-cache"
}

def runTests(name, suffix) {
  // CAUTION: This project uses a single docker-compose file for tests.
  try {
    sh 'mkdir -p test-output'
    sh 'chmod 777 test-output'
    sh "docker-compose -p $name-$suffix -f docker-compose.test.yaml run ffc-demo-calculation-test"

  } finally {
    sh "docker-compose -p $name-$suffix -f docker-compose.test.yaml down -v"
    junit 'test-output/junit.xml'
    // clean up files created by node/ubuntu user that cannot be deleted by jenkins. Note: uses global environment variable
    sh "docker run --rm -u node --mount type=bind,source='$WORKSPACE/test-output',target=/usr/src/app/test-output $name rm -rf test-output/*"
  }
}

node {
  checkout scm
  try {
    stage('Set branch, PR, and containerTag variables') {
      (pr, containerTag, mergedPrNo) = defraUtils.getVariables(repoName)
      defraUtils.setGithubStatusPending()
    }
    stage('Build test image') {
      buildTestImage(imageName, BUILD_NUMBER)
    }
    stage('Run tests') {
      runTests(imageName, BUILD_NUMBER)
    }
    stage('Push container image') {
      defraUtils.buildAndPushContainerImage(regCredsId, registry, imageName, containerTag)
    }
    if (pr != '') {
      stage('Helm install') {
        withCredentials([
            string(credentialsId: 'messageQueueHostPR', variable: 'messageQueueHost'),
            usernamePassword(credentialsId: 'calculationListenPR', usernameVariable: 'calculationQueueUsername', passwordVariable: 'calculationQueuePassword'),
            usernamePassword(credentialsId: 'paymentSendPR', usernameVariable: 'paymentQueueUsername', passwordVariable: 'paymentQueuePassword')
          ]) {
          def extraCommands = "--values ./helm/ffc-demo-calculation-service/jenkins-aws.yaml --set container.messageQueueHost=\"$messageQueueHost\",container.paymentQueueUser=\"$paymentQueueUsername\",container.paymentQueuePassword=\"$paymentQueuePassword\",container.calculationQueueUser=\"$calculationQueueUsername\",container.calculationQueuePassword=\"$calculationQueuePassword\""
          defraUtils.deployChart(kubeCredsId, registry, imageName, containerTag, extraCommands)
        }
      }
    }
    if (pr == '') {
      stage('Publish chart') {
        defraUtils.publishChart(registry, imageName, containerTag)
      }
      stage('Trigger Deployment') {
        withCredentials([
          string(credentialsId: 'JenkinsDeployUrl', variable: 'jenkinsDeployUrl'),
          string(credentialsId: 'ffc-demo-calculation-service-deploy-token', variable: 'jenkinsToken')
        ]) {
          defraUtils.triggerDeploy(jenkinsDeployUrl, 'ffc-demo-calculation-service-deploy', jenkinsToken, ['chartVersion':'1.0.0'])
        }
      }
    }
    if (mergedPrNo != '') {
      stage('Remove merged PR') {
        defraUtils.undeployChart(kubeCredsId, imageName, mergedPrNo)
      }
    }
    defraUtils.setGithubStatusSuccess()
  } catch(e) {
    defraUtils.setGithubStatusFailure(e.message)
    throw e
  }
}

