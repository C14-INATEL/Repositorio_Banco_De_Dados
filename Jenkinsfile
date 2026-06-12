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
                        --network bridge \
                        -e MYSQL_ROOT_PASSWORD=root \
                        -e MYSQL_DATABASE=sistema_entregas \
                        -e MYSQL_ROOT_HOST=% \
                        mysql:8.0 --default-authentication-plugin=mysql_native_password
                    echo "Aguardando MySQL iniciar..."
                    sleep 90
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
                sh 'docker exec -i mysql-test mysql --force -h 127.0.0.1 -uroot -proot sistema_entregas < tests/testes.sql'
                sh 'docker exec -i mysql-test mysql -h 127.0.0.1 -uroot -proot sistema_entregas < tests/test_job_email.sql'
            }
        }

        stage('Validar popular_banco.js') {
            steps {
                sh 'node --check popular_banco.js && echo "popular_banco.js valido"'
            }
        }

        stage('Instalar dependencias') {
            steps {
                sh 'npm install'
            }
        }

        stage('Rodar testes unitarios com Jest') {
            steps {
                sh '''
                    MYSQL_HOST=$(docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" mysql-test)
                    export DB_HOST=$MYSQL_HOST
                    npm test -- --runInBand --forceExit
                '''
            }
        }

        stage('Gerar relatório de testes do BD') {
            steps {
                sh 'npm run report:db'
                archiveArtifacts artifacts: 'reports/db-tests-report.xml', fingerprint: true
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    MYSQL_HOST=$(docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" mysql-test)
                    export DB_HOST=$MYSQL_HOST
                    node popular_banco.js
                '''
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