
## 초기 환경 설정 및 서버 시작

```bash
git clone https://github.com/giirafe/wemixfi-api-server.git

cd wemixfi-api=server

# 라이브러리 install
npm install

# 사전 생성된 데이터베이스 docker 파일을 통해 docker container 및 db 생성
docker-compose -f docker-compose.yml up -d

# 실행 중인 컨테이너 조회를 통해 container 정상 생성 확인
docker ps

# wemixfi_env directory 생성 후 contractInfo_testnet.ts 파일 배치, Wemix Fi 관련 ABI Json 파일 배치
mkdir wemixfi_env

# 서버 시작 
npm run start

# !!! 처음 클론 후 npm run start 시 DB의 테이블들이 한꺼번에 다 생성되지 않아 error 발생하는 경우가 있습니다. npm run start를 몇번 반복하면 정상적으로 생성 후 서버가 시작됩니다. !!!
```
