@Library('defra-library@0.0.3')
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
def extraCommands = ''

def getExtraHelmCommands() {
  withCredentials([
      string(credentialsId: 'messageQueueHostPR', variable: 'messageQueueHost'),
      usernamePassword(credentialsId: 'calculationListenPR', usernameVariable: 'calculationQueueUsername', passwordVariable: 'calculationQueuePassword'),
      usernamePassword(credentialsId: 'paymentSendPR', usernameVariable: 'paymentQueueUsername', passwordVariable: 'paymentQueuePassword')
    ]) {
    return "--values ./helm/ffc-demo-calculation-service/jenkins-aws.yaml --set container.messageQueueHost=\"$messageQueueHost\",container.paymentQueueUser=\"$paymentQueueUsername\",container.paymentQueuePassword=\"$paymentQueuePassword\",container.calculationQueueUser=\"$calculationQueueUsername\",container.calculationQueuePassword=\"$calculationQueuePassword\""
  }  
}

node {
  checkout scm
  extraCommands = getExtraHelmCommands()
  try {
    stage('Set branch, PR, and containerTag variables') {
      (pr, containerTag, mergedPrNo) = defraUtils.getVariables(repoName)
      defraUtils.setGithubStatusPending()
    }
    stage('Build test image') {
      defraUtils.buildTestImage(imageName, BUILD_NUMBER)
    }
    stage('Run tests') {
      defraUtils.runTests(imageName, BUILD_NUMBER)
    }
    stage('Push container image') {
      defraUtils.buildAndPushContainerImage(regCredsId, registry, imageName, containerTag)
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
    } else {
      stage('Helm install') {
        defraUtils.deployChart(kubeCredsId, registry, imageName, containerTag, extraCommands)
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

