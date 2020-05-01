@Library('defra-library@psd-507-use-artifactory') _

node {
    checkout scm
    stage('publish chart') {
        helm.publishHelmChart(DOCKER_REGISTRY, 'ffc-demo-calculation-service', '0.0.1')
    }
}
deployToCluster environment: 'dev', namespace: 'ffc-demo-calculation-service-shunt-test', chartName: 'ffc-demo-calculation-service', chartVersion: '0.0.1'
