image: registry.spring26b.secoder.net/tool/deployer

stages:
  - test
  - build
  - deploy

# 合并 Lint 和扫描
sonarqube-check:
  stage: test
  image: node:20
  script:
    - npm install
    # 1. 运行 ESLint 生成报告
    - npx eslint src --format json -o eslint-report.json || true
    # 2. 参照后端做法：下载、解压、运行扫描器
    - curl -sL http://api.spring26b.secoder.net/static/sonar-scanner.tar.gz -o /tmp/sonar.tar.gz
    - tar -xf /tmp/sonar.tar.gz -C /opt
    - /opt/sonar-scanner/bin/sonar-scanner
  allow_failure: true

build:
  stage: build
  script:
    - export BUILD_IMAGE_NAME=$CI_REGISTRY_IMAGE
    - export BUILD_IMAGE_TAG=$CI_COMMIT_REF_SLUG
    - export BUILD_IMAGE_USERNAME=$CI_REGISTRY_USER
    - export BUILD_IMAGE_PASSWORD=$CI_REGISTRY_PASSWORD
    - deployer build

deploy:
  stage: deploy
  script:
    - export API_SERVER=https://deployer.spring26b.secoder.net/api
    - deployer dyno replace $CI_PROJECT_NAME "$CI_REGISTRY_IMAGE:$CI_COMMIT_REF_SLUG" "$REGISTRY_USER" "$REGISTRY_PWD"
  only:
    - main
