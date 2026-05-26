pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        MYSQL_ROOT_PASSWORD = 'root'
        MYSQL_DATABASE = 'sistema_entregas'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Subir MySQL') {
            steps {
                sh '''
                    docker run -d --name mysql-test \
                        -e MYSQL_ROOT_PASSWORD=root \
                        -e MYSQL_DATABASE=sistema_entregas \
                        -e MYSQL_ROOT_HOST=% \
                        -p 3307:3306 \
                        mysql:8.0 --default-authentication-plugin=mysql_native_password
                    echo "Aguardando MySQL iniciar..."
                    sleep 40
                '''
            }
        }

        stage('Criar estrutura do banco') {
            steps {
                sh 'docker exec -i mysql-test mysql -h 127.0.0.1 -uroot -proot sistema_entregas < db.sql'
            }
        }

        stage('Rodar testes SQL') {
            steps {
                sh 'docker exec -i mysql-test mysql -h 127.0.0.1 -uroot -proot sistema_entregas < tests/tests.sql'
                sh 'docker exec -i mysql-test mysql -h 127.0.0.1 -uroot -proot sistema_entregas < tests/testes.sql'
            }
        }

        stage('Validar popular_banco.js') {
            steps {
                sh 'node --check popular_banco.js && echo "✅ popular_banco.js válido"'
            }
        }

        stage('Instalar dependências') {
            steps {
                sh 'npm ci --only=production'
                sh 'npm ci --save-dev jest@^29.7.0'
            }
        }

        stage('Rodar testes unitários com Jest') {
            steps {
                sh 'npm test -- --runInBand --forceExit'
            }
        }
    }

    post {
        always {
            sh 'docker stop mysql-test || true'
            sh 'docker rm mysql-test || true'
        }
        success {
            echo '✅ Testes do banco de dados concluídos com sucesso!'
        }
        failure {
            echo '❌ Algo falhou. Verifique os logs acima.'
        }
    }
}