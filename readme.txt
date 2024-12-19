## 파일 구조
/MongoDB: 도서 정보를 수집하고 DB에 저장하는 코드가 위치합니다.
/WebServer: 메인 서버 코드가 포함되어 있습니다.
/WordAI: Word2Vec 모델을 위한 서버가 위치합니다.

## 사전 조건
.env 파일이 /WebServer 디렉토리에 위치해야 함 (압축 파일: env.zip)
*.pem 파일이 /WebServer/static/ssl 디렉토리에 위치해야 함 (압축 파일: key.zip)
GoogleNews-vectors-negative300.bin 파일이 /WordAI 디렉토리에 위치해야 함 (구글 드라이브: https://drive.google.com/file/d/14KFfe1yNaMz_zWSA5QuCpyPIilHNTP-d/view)

## 환경 설정
1. 메인 서버 환경 설정
1-1. /WebServer 위치에서 npm init 명령어 실행
1-2. npm install 명령어 실행

2. Word2Vec 모델 서버 환경 설정
2-1. /WordAI 위치에서 python -m venv <가상환경이름> 실행
2-2. 가상 환경 실행 - 윈도우: <가상환경이름>/Scripts/activate | 리눅스: source <가상환경이름>/bin/activate
2-3. pip install -r ./requirements.txt 로 필수 라이브러리 설치

## 실행 순서
1. 가상환경 선택 후 /WordAI/word2vec.py 실행
2. /WebServer/main.js 실행
3. http://<주소>:8080 또는 https://<주소>:8443 접속


