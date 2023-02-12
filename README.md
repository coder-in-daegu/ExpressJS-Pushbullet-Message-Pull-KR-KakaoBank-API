# ExpressJS-Pushbullet-Message-Pull-KR-KakaoBank-API
카카오뱅크의 입금알림을 가져와 ExpressJS를 통해 사용자에게 전송합니다.

## Pushbullet API
PushBullet API가 필요합니다.

발급법은 알아서

## REQUEST JSON
{
  "api_key": "Pushbullet API KEY",
  "userinfo": "입금자명",
  "amount": "금액"
}

## RESPONSE JSON
{
  "result": true or false,
  "content": "실패 사유",
  "count": 금액
}

## NodeJS 모듈 설치
`npm i`

## Special Thanks
[Pushbullet JS](https://github.com/alexwhitman/node-pushbullet-api)
[Express](https://github.com/expressjs/express)

## 안내
2차 판매 금지 호스팅 포함
다양한 은행 추가 원하시면 `먼G#3661` 친추후 DM
