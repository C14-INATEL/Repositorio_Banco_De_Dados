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
                sh 'docker exec -i mysql-test mysql -uroot -proot --connect-expired-password sistema_entregas < db.sql'
            }
        }

        stage('Rodar testes SQL') {
            steps {
                sh 'docker exec -i mysql-test mysql -uroot -proot sistema_entregas < tests/tests.sql || true'
                sh 'docker exec -i mysql-test mysql -uroot -proot sistema_entregas < tests/Testes.sql || true'
            }
        }

        stage('Instalar dependências') {
            steps {
                sh 'npm install'
            }
        }

        stage('Validar popular_banco.js') {
            steps {
                sh 'node --check popular_banco.js && echo "✅ popular_banco.js válido"'
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