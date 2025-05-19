pipeline {
    agent any

    environment {
        BACKEND_IMAGE = 'sengar001/cvss-backend:latest'
        FRONTEND_IMAGE = 'sengar001/cvss-frontend:latest'
        MLSERVICE_IMAGE = 'sengar001/cvss-mlservice:latest'
        GITHUB_REPO_URL = 'https://github.com/Sengar001/CVSS_score_predictor.git'
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    git branch: 'main', url: "${GITHUB_REPO_URL}"
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker build -t $FRONTEND_IMAGE ./frontend'
                    sh 'docker build -t $BACKEND_IMAGE ./backend'
                    sh 'docker build -t $MLSERVICE_IMAGE ./ml_service/app'
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'DockerHubCred', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    script {
                        def loginStatus = sh(script: 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin', returnStatus: true)
                        if (loginStatus != 0) {
                            error("Docker login failed. Check credentials and try again.")
                        }
                        sh "docker push $DOCKER_USER/cvss-backend:latest"
                        sh "docker push $DOCKER_USER/cvss-frontend:latest"
                        sh "docker push $DOCKER_USER/cvss-mlservice:latest"
                    }
                }
            }
        }

        // stage('Run Ansible Playbook') {
        //     steps {
        //         script {
        //             withCredentials([file(credentialsId: 'VaultPasswordFile', variable: 'VAULT_PASS_FILE')]) {
        //                 sh """
        //                     ansible-playbook -vvv -i ansible/inventory/hosts.yml ansible/site.yml --vault-password-file $VAULT_PASS_FILE --tags docker --connection=local
        //                 """
        //             }
        //         }
        //     }
        // }

        stage('Run Ansible Playbook') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'VaultPasswordFile', variable: 'VAULT_PASS_FILE')]) {
                        sh """
                            ansible-playbook -vvv -i ansible/inventory/hosts.yml ansible/site.yml --vault-password-file $VAULT_PASS_FILE --tags k8 --connection=local
                        """
                    }
                }
            }
        }

        // stage('Deploy to Kubernetes') {
        //     steps {
        //         script {
        //             withCredentials([file(credentialsId: 'KubeConfigFile', variable: 'KUBECONFIG_FILE')]) {
        //                 sh '''
        //                     export KUBECONFIG=$KUBECONFIG_FILE
        //                     kubectl apply -f k8s/
        //                 '''
        //             }
        //         }
        //     }
        // }
    }
}
