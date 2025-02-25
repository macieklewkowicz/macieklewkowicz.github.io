pipeline {
  agent none

  stages {
    stage('build') {
      agent {
        kubernetes {
          yaml '''
            spec:
              containers:
              - name: jnlp
                image: 'harbor.k8s.lan/smol/jenkins-inbound-agent'
                args: ['\$(JENKINS_SECRET)', '\$(JENKINS_NAME)']
              - name: kaniko
                image: 'gcr.io/kaniko-project/executor:v1.23.2-debug'
                command:
                - /busybox/sleep
                args:
                - infinity
                volumeMounts:
                - name: jenkins-docker-cfg
                  mountPath: /kaniko/.docker/
              volumes:
              - name: jenkins-docker-cfg
                projected:
                  sources:
                  - secret:
                      name: regcred
                      items:
                        - key: .dockerconfigjson
                          path: config.json
          '''
        }
      }

      environment {
        GIT_REPO_NAME = "${GIT_URL}".replaceFirst(/^.*?(?::\/\/.*?\/|:)(.*?)(\.git)?$/, '$1')
      }

      steps {
        container('kaniko') {
          sh """
            /kaniko/executor \
              -f `pwd`/Dockerfile \
              -c `pwd` \
              --cache=true \
              --destination=harbor.k8s.lan/${GIT_REPO_NAME}:\${GIT_COMMIT:0:7} \
              --skip-tls-verify
          """
        } // container 'kaniko'
      } // steps
    } // stage 'build'
  } // stages

  post {
    success {
      gerritReview \
        labels: [
          'Code-Review': 0,
          'Verified': 1
        ],
        message: "${env.BUILD_URL}"
    }

    unstable {
      gerritReview \
        labels: [
          'Code-Review': -1,
          'Verified': 0
        ],
        message: "${env.BUILD_URL}"
    }

    failure {
      gerritReview \
        labels: [
          'Code-Review': -1,
          'Verified': -1
        ],
        message: "${env.BUILD_URL}"
    }
  }
}

