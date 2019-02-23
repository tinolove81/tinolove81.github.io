const fs = require('fs');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');

let _WEB = 'https://pd.appbank.net/m';
let _INPUT = 'CMD Input';
let _NUMBER = 0;
let _MONSTER = [];
let _NONAME = [];
let CHAR;
let numTry = 0;


(function init() {
    if (!process.argv[2]) {
        console.log(`arg -> [number] = search`);
        console.log(`arg -> 'find' = find NoName`);
    } else if (!isNaN(parseInt(process.argv[2]))) {
        _INPUT = parseInt(process.argv[2]);
        startRequest();
    }
})();

function startRequest() {
    if (numTry > 50) {
        console.log('不明 > 50, 即將結束.');
        keepData();
        return false;
    }
    console.log('\x1b[36m%s\x1b[0m','/// StartRequest ///', '\x1b[0m');
    request({
        url: createUrl(),
        method: 'GET',
        followRedirect: false
    }, function (err, resp, data) {
        if (!err) {
            parseChar(data, resp.statusCode);
        } else {
            return err;
        }
    });
}
function createUrl() {
    let url = _WEB;
    _NUMBER = (_NONAME.length > 0) ? _NONAME.shift() : ((_NUMBER == _INPUT) ? ++_INPUT : _INPUT);
    if (_NUMBER <= 0) {
        _NUMBER = 1;
        return url + '00' + _NUMBER;
    } else if (_NUMBER < 100) {
        return url + ('00' + _NUMBER).substr(-3);
    } else {
        return url + _NUMBER;
    }
}

function parseChar(html, code) {
    console.log('\x1b[36m%s\x1b[0m',`/// ParseChar ${_NUMBER} ///`, '\x1b[0m');
    CHAR = {
        'Number': '' + _NUMBER,
        'Name': '',
        'MainAttribute': '',
        'SubAttribute': '',
        'Rare': '',
        'Cost': '',
        'Assist': '',
        'Lv': {},
        'Type': [],
        'Kakusei': [],
        'SuperKakusei': [],
        'ActiveSkillName': '',
        'ActiveSkillCD': '',
        'ActiveSkillContent': '',
        'LeaderSkillName': '',
        'LeaderSkillContent': ''
    };
    try {
        if (code != 200) {
            numTry += 1;
            CHAR['Name'] = '不明';
        } else {
            numTry  = 0;
            const $ = cheerio.load(html);
            let Monster = $('div.monster div.spacer').eq(0);
            let Name = $('div.monster h2.title-bg').text().replace('No.', '').split(' ').slice(1).join(' ');
            CHAR['Name'] = Name;
            let Attribute = Monster.find('img + p').contents();
            CHAR['MainAttribute'] = Attribute.eq(0).attr('class').replace('icon-attr-', '');
            CHAR['MainAttribute'] = CHAR['MainAttribute'][0].toUpperCase() + CHAR['MainAttribute'].substring(1);
            CHAR['SubAttribute'] = (Attribute.length == 3) ? Attribute.eq(1).attr('class').replace('icon-attr-', '') : 'none';
            CHAR['SubAttribute'] = CHAR['SubAttribute'][0].toUpperCase() + CHAR['SubAttribute'].substring(1);
            let RareAndAttr = Attribute.eq(-1).text().split(' / ');
            CHAR['Rare'] = RareAndAttr[1];
            CHAR['Cost'] = RareAndAttr[2].replace('コスト:', '');
            CHAR['Assist'] = RareAndAttr[3].replace('アシスト: ', '').replace('◯', '○');
            let Lv1 = Monster.find('.table-monster-status tr').eq(1);
            CHAR['Lv'][$('td', Lv1).eq(0).text()] = [$('td', Lv1).eq(1).text(), $('td', Lv1).eq(2).text(), $('td', Lv1).eq(3).text()];
            let Lv2 = Monster.find('.table-monster-status tr').eq(3);
            if (Lv2.length > 0) {
                CHAR['Lv'][$('td', Lv2).eq(0).text()] = [$('td', Lv2).eq(1).text(), $('td', Lv2).eq(2).text(), $('td', Lv2).eq(3).text()];
            }
            let Type = Monster.find('p.icon-mtype').find('i');
            for (let i = 0; i < Type.length; i++) {
                CHAR['Type'].push(Type.eq(i).attr('class').replace('icon-mtype-', ''));
            }

            let Block = $('div.monster div.spacer h3');
            Block.each((idx, element) => {
                switch ($(element).text()) {
                    case '覚醒スキル':
                        findKakusei($(element).parent());
                        break;
                    case '超覚醒スキル':
                        findSuperKakusei($(element).parent());
                        break;
                    case 'スキル':
                        findActiveSkill($(element).parent());
                        break;
                    case 'リーダースキル':
                        findLeaderSkill($(element).parent());
                        break;
                    default:
                        // console.log($(element).text())
                        break;
                }
            });
        }
        console.log('\x1b[36m%s\x1b[0m',`/// ParseChar ${CHAR['Name']} Complete ///`, '\x1b[0m');
        _MONSTER[_NUMBER - 1] = CHAR;
        timerRepeat();
    } catch (error) {
        console.log(error);
        fs.writeFile(path.join(__dirname, './error.txt'), _WEB + _NUMBER + '\n'+ JSON.stringify(CHAR) +'\n\n\n\n\n' + html, function (err) {
            if (err) { console.log(err); }
            else { console.log('Error Report Write complete.'); }
        });
    }
}
function info() {
/*
有主動 有隊長 有覺醒 正常 5082

有主動 有隊長 沒覺醒 1 (新手龍)
有主動 沒隊長 沒覺醒 21 (防龍)
有主動 沒隊長 有覺醒 3338 (阿門裝備)

沒主動 沒隊長 沒覺醒 36 (波利)
沒主動 有隊長 沒覺醒 3318 (神殺)
沒主動 有覺醒 沒隊長 ?
沒主動 有覺醒 有隊長 ?
*/
}
function findKakusei(mBlock) {
    let AllKakusei = mBlock.find('div.name');
    for (let i = 0; i < AllKakusei.length; i++) {
        CHAR['Kakusei'].push(AllKakusei.eq(i).text());
    }
}
function findSuperKakusei(mBlock) {
    let AllKakusei = mBlock.find('div.name');
    for (let i = 0; i < AllKakusei.length; i++) {
        CHAR['SuperKakusei'].push(AllKakusei.eq(i).text());
    }
}
function findActiveSkill(mBlock) {
    let ActiveSkill = mBlock.find('p');
    CHAR['ActiveSkillName'] = ActiveSkill.eq(0).find('strong').eq(0).text();
    CHAR['ActiveSkillCD'] = ActiveSkill.eq(0).find('strong').eq(1).text().replace('ターン数：', '').replace('（', '/').replace('）', '');
    CHAR['ActiveSkillContent'] = ActiveSkill.eq(1).text()
        .replace('減少、', '減少。')
        .replace('+', '＋')
        .replace(/生成(?=[^。]?)$/, '生成。')
        .replace(/に変化$/, 'に変化。')
        .replace('に変換。', 'に変化。')
        .replace('に変化させ、', 'に変化。')
        .replace('に変化させる', 'に変化。')
        .replace(/全ドロップ(?=[^をの]+)/, '全ドロップを');
    /*
    技能敘述有變更!
    "自分の攻撃力×10倍 => "敵全体に攻撃力×10倍 (有些)
    ～に自分の攻撃力×30倍 => ～に攻撃力×30倍 (有些)
    "敵一体に => 敵1体に

    ～減少、 => ～減少。
    〇+〇 => 〇＋〇
    ～生成 => ～生成。
    ～に変化 => ～に変化。
    ～に変換。 => ～に変化。
    ～に変化させ、 => ～に変化。
    ～に変化させる => ～に変化。
    全ドロップ(?=[^を|の]) => 全ドロップを
    */
}
function findLeaderSkill(mBlock) {
    let LeaderSkill = mBlock.find('p');
    CHAR['LeaderSkillName'] = LeaderSkill.eq(0).find('strong').text();
    CHAR['LeaderSkillContent'] = LeaderSkill.eq(1).text();
}

function keepData() {
    let localpath = path.join(__dirname, './MONSTER-'+now('s')+'.json');
    fs.open(localpath, 'a', function (err, fd) {
        if (!err) {
            for (let i = 0, j = _MONSTER.length; i < j; i++) {
                let _M = _MONSTER[i];
                let data;
                if (i == 0) {
                    data = '[' + JSON.stringify(_M) + ',\r\n';
                } else if (i == j - 1) {
                    data = JSON.stringify(_M) + ']';
                } else {
                    data = JSON.stringify(_M) + ',\r\n';
                }
                try {
                    fs.appendFileSync(localpath, data);
                } catch (err) {
                    console.log('\nWrite Char Error.');
                    console.log(err);
                }
            }
        } else { console.log(err); }
    });
    console.log('\x1b[36m%s\x1b[0m','/// FinishKeepData ///', '\x1b[0m');
    console.log('\x1b[36m%s\x1b[0m',`Localfile: ${localpath}`, '\x1b[0m');
    console.log('\x1b[36m%s\x1b[0m',`完整轉譯成: MONSTER.json +> 加參數名稱: const MONSTER = MONSTER.js`, '\x1b[0m');
}

function keepTest(mChar) {
    fs.writeFile(path.join(__dirname, './MONSTER-test.txt'), _WEB + _NUMBER + '\n'+ JSON.stringify(mChar) +'\n\n\n\n\n' + html, function (err) {
        if (err) { console.log(err); }
        else { console.log('\nTest Report Write complete.'); }
    });
}

function timerRepeat() {
    setTimeout(() => {
        startRequest();
    }, 100);    
}

function now(argv) {
    if (argv == 'u') {
        return Math.round(new Date().getTime() / 1000.0);
    } else if (argv == 's') {
        return new Date().toLocaleDateString(undefined, {year:'numeric', month:'2-digit', day:'2-digit',hour12: false}).replace(/[\/|\-]/g, '');
    } else if (!isNaN(parseInt(argv))) {
        return new Date( parseInt(argv) * 1000).toLocaleString(undefined, {hour12: false});
    }
    return '' + new Date().toLocaleString(undefined, {hour12: false});
}