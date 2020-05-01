@Library('defra-library@psd-507-use-artifactory') _

node {
    checkout scm
    stage('publish chart') {
        helm.publishChart(DOCKER_REGISTRY, 'ffc-demo-calculation-service', '0.0.1')
    }
    stage('Push container image') {
      build.buildAndPushContainerImage(DOCKER_REGISTRY_CREDENTIALS_ID, DOCKER_REGISTRY, repoName, containerTag)
    }
}
deployToCluster environment: 'dev', namespace: 'ffc-demo-calculation-service-shunt-test', chartName: 'ffc-demo-calculation-service', chartVersion: '0.0.1'
