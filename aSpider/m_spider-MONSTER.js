const fs = require('fs');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');

let _MONSTER;
try {
    _MONSTER = require('./MONSTER.json');
} catch (err) {
    _MONSTER = [];
}

let _WEB = 'https://pd.appbank.net/m';
let _NUMBER = '0';
let _INPUT = [];
let char;
let error_n = 0;


(function init() {
    if (!process.argv[2]) {
        console.log(`'find': 尋找新的資料`);
    } else if (process.argv[2] == 'find') {
        for (let i = 0; i < _MONSTER.length; i++) {
            let _M = _MONSTER[i];
            if (_M['Name'] == '不明') {
                _INPUT.push(_M['Number']);
            }
        }
        startRequest();
    } else if (!isNaN(parseInt(process.argv[2]))) {
        for (let i = 0; i < _MONSTER.length; i++) {
            let _M = _MONSTER[i];
            if (_M['Number'] == process.argv[2]) {
                _INPUT.push(_M['Number']);
            }
        }
        startRequest();
    }
})();

function startRequest() {
    if (error_n > 50) {
        console.log('不明 > 50, 即將結束.');
        keepData();
        return false;
    }
    console.log('\x1b[36m%s\x1b[0m','/// StartRequest ///', '\x1b[0m');
    request({
        url: createUrl(),
        method: 'GET',
        // headers: {
        //     'User-Agent': `Mozilla/5.0 (Windows NT 6.1; WOW64; rv:53.0) Gecko/20100101 Firefox/53.0`
        // },
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
    if (_INPUT.length > 0) {
        _NUMBER = _INPUT.shift();
    } else {
        _NUMBER = '' + (parseInt(_NUMBER) + 1);
    }
    if (_NUMBER < 100) {
        for (let i = 3; i > _NUMBER.length; i--) { url += '0'; }
        return url + _NUMBER;
    } else {
        return url + _NUMBER;
    }
}

function parseChar(html, code) {
    console.log('\x1b[36m%s\x1b[0m',`/// ParseChar ${_NUMBER} ///`, '\x1b[0m');
    char = {
        'Number': '',
        'Name': '',
        'MainAttribute': '',
        'SubAttribute': '',
        'Rare': '',
        'Cost': '',
        'Assist': '',
        'Type': [],
        'ActiveSkillName': '',
        'ActiveSkillCD': '',
        'ActiveSkillContent': '',
        'LeaderSkillName': '',
        'LeaderSkillContent': '',
        'Kakusei': [],
    };
    try {
        if (code != 200) {
            error_n += 1;
            char['Number'] = '' + _NUMBER
            char['Name'] = '不明';
        } else {
            error_n  = 0;
            const $ = cheerio.load(html);
            let Monster = $('div.monster');
            let NumberAndName = Monster.find('h2.title-bg').text().replace('No.', '').split(' ');
            char['Number'] = NumberAndName.shift();
            char['Name'] = NumberAndName.join(' ');
            let Attribute = Monster.find('div.spacer').eq(0).find('img + p').contents();
            char['MainAttribute'] = Attribute.eq(0).attr('class').replace('icon-attr-', '');
            char['MainAttribute'] = char['MainAttribute'][0].toUpperCase() + char['MainAttribute'].substring(1);
            char['SubAttribute'] = (Attribute.length == 3) ? Attribute.eq(1).attr('class').replace('icon-attr-', '') : 'none';
            char['SubAttribute'] = char['SubAttribute'][0].toUpperCase() + char['SubAttribute'].substring(1);
            let RareAndAttr = Attribute.eq(-1).text().split(' / ');
            char['Rare'] = RareAndAttr[1];
            char['Cost'] = RareAndAttr[2].replace('コスト:', '');
            char['Assist'] = RareAndAttr[3].replace('アシスト: ', '').replace('◯', '○');
            let AllType = Monster.find('div.spacer').eq(0).find('p.icon-mtype').find('i');
            char['Type'] = [];
            for (let i = 0; i < AllType.length; i++) {
                char['Type'].push(AllType.eq(i).attr('class').replace('icon-mtype-', ''));
            }
            
            Monster.find('div.spacer').find('h3').each(function (i, e) {
                e = $(e);
                if (e.text() == 'スキル') {
                    findActiveSkill(e.parent());
                    return;
                }
                if (e.text() == 'リーダースキル') {
                    findLeaderSkill(e.parent());
                    return;
                }
                if (e.text() == '覚醒スキル') {
                    findKakusei(e.parent());
                    return;
                }
            });
        }
        visualDiff();
    } catch (error) {
        console.log(error);
        fs.writeFile(path.join(__dirname, './error.txt'), _WEB + _NUMBER + '\n'+ JSON.stringify(char) +'\n\n\n\n\n' + html, function (err) {
            if (err) { console.log(err); }
            else { console.log('Error Report Write complete.'); }
        });
    }
}
function test() {
/*
有主動 有隊長 有覺醒 正常

有主動 有隊長 沒覺醒 1 (新手龍)
有主動 沒隊長 沒覺醒 21 (防龍)
有主動 沒隊長 有覺醒 3338 (阿門裝備)

沒主動 沒隊長 沒覺醒 36 (波利)
沒主動 有隊長 沒覺醒 3318 (神殺)
沒主動 有覺醒 沒隊長 ?
沒主動 有覺醒 有隊長 ?
*/
}

function findActiveSkill(mBlock) {
    let ActiveSkill = mBlock.find('p');
    char['ActiveSkillName'] = ActiveSkill.eq(0).find('strong').eq(0).text();
    char['ActiveSkillCD'] = ActiveSkill.eq(0).find('strong').eq(1).text().replace('ターン数：', '');
    char['ActiveSkillContent'] = ActiveSkill.eq(1).text()
        .replace('減少、', '減少。')
        .replace('+', '＋')
        .replace(/生成(?=[^。]?)$/, '生成。')
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
    ～に変換。 => ～に変化。
    ～に変化させ、 => ～に変化。
    ～に変化させる => ～に変化。
    全ドロップ(?=[^を|の]) => 全ドロップを
    */
}

function findLeaderSkill(mBlock) {
    let LeaderSkill = mBlock.find('p');
    char['LeaderSkillName'] = LeaderSkill.eq(0).find('strong').text();
    char['LeaderSkillContent'] = LeaderSkill.eq(1).text();
}

function findKakusei(mBlock) {
/**
    list = [];
    $('a[href*="/kakusei"]').each((i, e)=>{
        key = $(e).find('i.awakenicon').attr('class').split('-')[1];
        list[key] = $(e).find('div.name').html();
    });
    KAKUSEI = {};
    list.forEach((e, i) => {KAKUSEI[e] = i});
*//*
    let KAKUSEI = {
        "HP強化": 1, "攻撃強化": 2, "回復強化": 3, "火ダメージ軽減": 4, "水ダメージ軽減": 5, "木ダメージ軽減": 6, "光ダメージ軽減": 7,
        "闇ダメージ軽減": 8, "自動回復": 9, "バインド耐性": 10, "暗闇耐性": 11, "お邪魔耐性": 12, "毒耐性": 13, "火ドロップ強化": 14,
        "水ドロップ強化": 15, "木ドロップ強化": 16, "光ドロップ強化": 17, "闇ドロップ強化": 18, "操作時間延長": 19, "バインド回復": 20,
        "スキルブースト": 21, "火属性強化": 22, "水属性強化": 23, "木属性強化": 24, "光属性強化": 25, "闇属性強化": 26, "2体攻撃": 27,
        "封印耐性": 28, "回復ドロップ強化": 29, "マルチブースト": 30, "神キラー": 31, "マシンキラー": 32, "悪魔キラー": 33, "ドラゴンキラー": 34,
        "回復キラー": 35, "攻撃キラー": 36, "体力キラー": 37, "バランスキラー": 38, "能力覚醒用キラー": 39, "売却用キラー": 40, "強化合成用キラー": 41,
        "進化用キラー": 42, "コンボ強化": 43, "ガードブレイク": 44, "追加攻撃": 45, "チームHP強化": 46, "チーム回復強化": 47, "ダメージ無効貫通": 48,
        "覚醒アシスト": 49, "超追加攻撃": 50, "スキルチャージ": 51, "バインド耐性+": 52, "操作時間延長+": 53, "雲耐性": 54, "操作不可耐性": 55,
        "スキルブースト+": 56, "HP80％以上強化": 57, "HP50％以下強化": 58, "L字消し軽減": 59, "L字消し攻撃": 60, "超コンボ強化": 61,
        "コンボドロップ": 62, "スキルボイス": 63, "ダンジョンボーナス": 64
    };
*/
    let AllKakusei = mBlock.find('div.name');
    char['Kakusei'] = [];
    for (let i = 0; i < AllKakusei.length; i++) {
        char['Kakusei'].push(AllKakusei.eq(i).text());
    }
}
function visualDiff() {
    console.log('\x1b[36m%s\x1b[0m',`/// VisualDiff ${char['Name']} ///`, '\x1b[0m');
    if (_MONSTER[_NUMBER - 1] != undefined) {
        let M = _MONSTER[_NUMBER - 1];
        if (M['Number'] == char['Number']) {
            M['Name'] = char['Name'];
            M['MainAttribute'] = char['MainAttribute'];
            M['SubAttribute'] = char['SubAttribute'];
            M['Rare'] = char['Rare'];
            M['Cost'] = char['Cost'];
            M['Assist'] = char['Assist'];
            M['Type'] = char['Type'];
            M['ActiveSkillName'] = char['ActiveSkillName'];
            M['ActiveSkillCD'] = char['ActiveSkillCD'];
            M['ActiveSkillContent'] = char['ActiveSkillContent'];
            M['LeaderSkillName'] = char['LeaderSkillName'];
            M['LeaderSkillContent'] = char['LeaderSkillContent'];
            M['Kakusei'] = char['Kakusei'];
            timerRepeat();
        } else {
            console.error('visualDiff Error');
            console.error('_NUMBER: ', _NUMBER);
            console.error('_MONSTER: ');
            console.error(_MONSTER[_NUMBER - 1]);
            console.error('char: ');
            console.error(char);
        }
    } else {
        _MONSTER[_NUMBER - 1] = char;
        timerRepeat();
    }
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
    }, 500);    
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