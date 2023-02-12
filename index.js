import PushBullet from 'pushbullet';
import express from 'express';
import rateLimit from 'express-rate-limit';
import requestIp from 'request-ip';

const app = express();

app.use(express.json());
app.use(requestIp.mw())
// 1분당 20건의 요청만 보낼 수 있습니다.
app.use(rateLimit({ 
    windowMs: 1*60*1000, 
    max: 10
}));

// 분단위 해당 시간 내, 충전이 승인되지 않은경우 자동으로 취소합니다.
const CANCEL_TIME = 10
// 포트
const PORT = 8080

function sleep() {
    return new Promise((r) => setTimeout(r, CANCEL_TIME*60*1000));
}

app.post('/', function (req, res) {   
    if(!req.body) {
        return res.send({result: false, reason: "JSON 형식 외에는 지원되지 않습니다."});
    };
    if(!req.body.api_key) {
        return res.send({result: false, reason: "Pushbullet API키를 설정 해주세요."});
    };
    if(!req.body.userinfo) {
        return res.send({result: false, reason: "입금자명이 비어있습니다."});
    };
    if(!req.body.amount) {
        return res.send({result: false, reason: "금액을 입력해주세요."});
    };
    const API_KEY = req.body.api_key;
    const SENDER_NAME = req.body.userinfo.toString();
    const AMOUNT = req.body.amount.toString();
    const pusher = new PushBullet(API_KEY);
    const stream = pusher.stream();
    
    stream.on('connect', function() {
        stream.close(); 
        sleep().then(() => res.end(`{"result": false, "reason": "${CANCEL_TIME}분이 지나서, 입금이 취소되었습니다."}`));
    });
    stream.on('message', function(message) {
        
        if (message.type == 'push') {
            try {
                console.log(message.push)
                const APP_NAME = message.push.package_name
                console.log(`[FuckingGodBankAPI] [Requested] ${SENDER_NAME} Requested Bank Charge KRW ${AMOUNT}`);
                console.log(`[FuckingGodBankAPI] [WebSocket] ${APP_NAME} Push Message`);
                // 카카오뱅크
                if (APP_NAME == "com.kakaobank.channel") {
                    if (message.push.body.split(" ")[1] == "→") {
                        // 입금자명 확인
                        if (SENDER_NAME.replace("토스", "")  == message.push.body.split(" ")[0].replace("토스", ""))  {
                            const SENDED_AMOUNT = message.push.title.toString().replace("입금 ", "").replace("원","").replace(",","");
                            if (AMOUNT == SENDED_AMOUNT) {
                                stream.close(); 
                                console.log(`[FuckingGodBankAPI] [Responsed] Requested Charge KRW ${AMOUNT} by ${SENDER_NAME}`);
                                res.end(`{"result": true, "count": ${AMOUNT}}`);
                            }else{
                                stream.close(); 
                                res.end(`{"result": false, "content": "금액이 올바르지 않습니다(${SENDED_AMOUNT}원 입금됨)."}`);
                            };
                        };
                    };  
                };  
            } catch (error) {
                console.error(error)
                res.status(500).end(`{"result": false, "content": "${error}"}`)
            };
        };
    });
    stream.connect();
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send({result: false, reason: err.stack.split("\n")[0]})
})

app.listen(PORT, () => {
    console.log(`[ServerON] Port: ${PORT}`)
})