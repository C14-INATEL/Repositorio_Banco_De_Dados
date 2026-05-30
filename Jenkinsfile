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
                sh 'node --check popular_banco.js && echo "popular_banco.js valido"'
            }
        }

        stage('Instalar dependencias') {
            steps {
                sh 'npm ci --only=production'
                sh 'npm ci --save-dev jest@^29.7.0'
            }
        }

        stage('Rodar testes unitarios com Jest') {
            steps {
                sh 'npm test -- --runInBand --forceExit'
            }
        }

        stage('Deploy') {
            steps {
                sh 'node popular_banco.js'
                echo 'Banco de dados populado com sucesso!'
            }
        }
    }

    post {
        always {
            sh 'docker stop mysql-test || true'
            sh 'docker rm mysql-test || true'
        }
        success {
            echo 'Testes e deploy do banco concluidos com sucesso!'
        }
        failure {
            echo 'Algum passo falhou. Verifique os logs acima.'
        }
    }
}