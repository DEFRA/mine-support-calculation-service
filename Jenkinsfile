@Library('defra-library@1.0.0')
import uk.gov.defra.ffc.DefraUtils
def defraUtils = new DefraUtils()

def containerSrcFolder = '\\/home\\/node'
def containerTag = ''
def lcovFile = './test-output/lcov.info'
def localSrcFolder = '.'
def mergedPrNo = ''
def pr = ''
def serviceName = 'ffc-demo-calculation-service'
def sonarQubeEnv = 'SonarQube'
def sonarScanner = 'SonarScanner'
def timeoutInMinutes = 5

node {
  checkout scm
  try {
    stage('Set GitHub status as pending'){
      defraUtils.setGithubStatusPending()
    }
    stage('Set branch, PR, and containerTag variables') {
      (pr, containerTag, mergedPrNo) = defraUtils.getVariables(serviceName, defraUtils.getPackageJsonVersion())
    }
    stage('Helm lint') {
      defraUtils.lintHelm(serviceName)
    }
    stage('Build test image') {
      defraUtils.buildTestImage(serviceName, BUILD_NUMBER)
    }
    stage('Run tests') {
      defraUtils.runTests(serviceName, serviceName, BUILD_NUMBER)
    }
     stage('Create Test Report JUnit'){
      defraUtils.createTestReportJUnit()
    }
    stage('Fix absolute paths in lcov file') {
      defraUtils.replaceInFile(containerSrcFolder, localSrcFolder, lcovFile)
    }
    stage('SonarQube analysis') {
      defraUtils.analyseCode(sonarQubeEnv, sonarScanner, ['sonar.projectKey' : serviceName, 'sonar.sources' : '.'])
    }
    stage("Code quality gate") {
      defraUtils.waitForQualityGateResult(timeoutInMinutes)
    }
    stage('Push container image') {
      defraUtils.buildAndPushContainerImage(DOCKER_REGISTRY_CREDENTIALS_ID, DOCKER_REGISTRY, serviceName, containerTag)
    }
    if (pr == '') {
      stage('Publish chart') {
        defraUtils.publishChart(DOCKER_REGISTRY, serviceName, containerTag)
      }
      stage('Trigger GitHub release') {
        withCredentials([
          string(credentialsId: 'github_ffc_platform_repo', variable: 'gitToken') 
        ]) {
          defraUtils.triggerRelease(containerTag, serviceName, containerTag, gitToken)
        }
      }
      stage('Trigger Deployment') {
        withCredentials([
          string(credentialsId: 'JenkinsDeployUrl', variable: 'jenkinsDeployUrl'),
          string(credentialsId: 'ffc-demo-calculation-service-deploy-token', variable: 'jenkinsToken')
        ]) {
          defraUtils.triggerDeploy(jenkinsDeployUrl, 'ffc-demo-calculation-service-deploy', jenkinsToken, ['chartVersion':containerTag])
        }
      }
    } else {
      stage('Verify version incremented') {
        defraUtils.verifyPackageJsonVersionIncremented()
      }
      stage('Helm install') {
        withCredentials([
          string(credentialsId: 'sqsQueueEndpoint', variable: 'sqsQueueEndpoint'),
          string(credentialsId: 'calculationQueueUrlPR', variable: 'calculationQueueUrl'),
          string(credentialsId: 'calculationQueueAccessKeyIdListen', variable: 'calculationQueueAccessKeyId'),
          string(credentialsId: 'calculationQueueSecretAccessKeyListen', variable: 'calculationQueueSecretAccessKey'),
          string(credentialsId: 'paymentQueueUrlPR', variable: 'paymentQueueUrl'),
          string(credentialsId: 'paymentQueueAccessKeyIdSend', variable: 'paymentQueueAccessKeyId'),
          string(credentialsId: 'paymentQueueSecretAccessKeySend', variable: 'paymentQueueSecretAccessKey')
        ]) {
          def helmValues = [
            /container.calculationQueueEndpoint="$sqsQueueEndpoint"/,
            /container.calculationQueueUrl="$calculationQueueUrl"/,
            /container.calculationQueueAccessKeyId="$calculationQueueAccessKeyId"/,
            /container.calculationQueueSecretAccessKey="$calculationQueueSecretAccessKey"/,
            /container.calculationCreateQueue="false"/,
            /container.paymentQueueEndpoint="$sqsQueueEndPoint"/,
            /container.paymentQueueUrl="$paymentQueueUrl"/,
            /container.paymentQueueAccessKeyId="$paymentQueueAccessKeyId"/,
            /container.paymentQueueSecretAccessKey="$paymentQueueSecretAccessKey"/,
            /container.paymentCreateQueue="false"/,
            /container.redeployOnChange="$pr-$BUILD_NUMBER"/
          ].join(',')

          def extraCommands = [
            "--values ./helm/ffc-demo-calculation-service/jenkins-aws.yaml",
            "--set $helmValues"
          ].join(' ')

          defraUtils.deployChart(KUBE_CREDENTIALS_ID, DOCKER_REGISTRY, serviceName, containerTag, extraCommands)
        }
      }
    }
    if (mergedPrNo != '') {
      stage('Remove merged PR') {
        defraUtils.undeployChart(KUBE_CREDENTIALS_ID, serviceName, mergedPrNo)
      }
    }
    stage('Set GitHub status as success'){
      defraUtils.setGithubStatusSuccess()
    } 
  } catch(e) {
    defraUtils.setGithubStatusFailure(e.message)
    defraUtils.notifySlackBuildFailure(e.message, "#generalbuildfailures")
    throw e
  } finally {
    defraUtils.deleteTestOutput(serviceName, containerSrcFolder)
  }
}
