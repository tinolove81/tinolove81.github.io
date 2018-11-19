const fs = require('fs');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');


let web = 'https://pd.appbank.net/m';
let no = process.argv[2] || 1;

let char;
let error_n = 0;

function startReq() {
    if (error_n > 10) return false;
    console.log('\x1b[36m%s\x1b[0m','/// Start ///', '\x1b[0m');
    request({
        url: createUrl(),
        method: 'GET',
        // headers: {
        //     'User-Agent': `Mozilla/5.0 (Windows NT 6.1; WOW64; rv:53.0) Gecko/20100101 Firefox/53.0`
        // },
        followRedirect: false
        }, function (err, resp, data) {
            if (!err) {
                // test(data, resp.statusCode);
                parseCHARACTER(data, resp.statusCode);
            } else {
                return err;
            }
    });
}
function createUrl() {
    let url = web;
    if (no < 100) {
        for (let i = 3; i > (''+no).length; i--) {
            url = url + '0';
        }
        return url + no;
    } else {
        return url + no;
    }
}

function parseCHARACTER(html, code) {
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
        'ActiveSkillTag': '',
        
        'LeaderSkillName': '',
        'LeaderSkillContent': '',
        'LeaderSkillTag': '',
        
        'Kakusei': [],
    };
    try {
        if (code != 200) {
            error_n += 1;
            char['Number'] = no;
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

        keepData(char);

    } catch (error) {
        console.log(error);
        fs.writeFile(path.join(__dirname, './error.txt'), web + no + '\n'+ JSON.stringify(char) +'\n\n\n\n\n' + html, function (err) {
            if (err) { console.log(err); }
            else { console.log('Error Report Write complete.'); }
        });
    }
}
function test(html, code) {
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
        'ActiveSkillTag': '',
        
        'LeaderSkillName': '',
        'LeaderSkillContent': '',
        'LeaderSkillTag': '',
        
        'Kakusei': [],
    };
    if (code != 200) {
    } else {
        const $ = cheerio.load(html);
        let Monster = $('div.monster');

        /* 標題 編號 & 名字 一定有 */
        let NumberAndName = Monster.find('h2.title-bg').text().replace('No.', '').split(' ');
        char['Number'] = NumberAndName[0];
        char['Name'] = NumberAndName[1];

        /* 第一欄 主副屬性 & 稀有度 & Cost & 繼承屬性 & 類型 一定有 */
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
        
        char['ActiveSkillName'] = '';
        char['ActiveSkillCD'] = '';
        char['ActiveSkillContent'] = '';
        char['ActiveSkillTag'] = '';
        
        char['LeaderSkillName'] = '';
        char['LeaderSkillContent'] = '';
        char['LeaderSkillTag'] = '';
        
        char['Kakusei'] = [];

        char['ps'] = '';

        Monster.find('div.spacer').find('h3').each(function (i, e) {
            e = $(e);
            console.log(e.text());
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
        keepTest(char);
        console.log(char);

    }
}

function findActiveSkill(mBlock) {
    let ActiveSkill = mBlock.find('p');
    char['ActiveSkillName'] = ActiveSkill.eq(0).find('strong').eq(0).text();
    char['ActiveSkillCD'] = ActiveSkill.eq(0).find('strong').eq(1).text().replace('ターン数：', '');
    char['ActiveSkillContent'] = ActiveSkill.eq(1).text()
        .replace('減少、', '減少。')
        .replace('に変換。', 'に変化。')
        .replace('に変化させ、', 'に変化。')
        .replace('に変化させる', 'に変化。')
        .replace(/全ドロップ[^を|の]/, '全ドロップを');
    /*
    技能敘述有變更!
    "自分の攻撃力×10倍 => "敵全体に攻撃力×10倍 (有些)
    ～に自分の攻撃力×30倍 => ～に攻撃力×30倍 (有些)
    "敵一体に => 敵1体に
    ～減少、 => ～減少。

    ～に変換。 => ～に変化。
    ～に変化させ、 => ～に変化。
    ～に変化させる => ～に変化。
    全ドロップ[^を|の] => 全ドロップを
    
    */
    char['ActiveSkillTag'] = 'RRRRRRRRRR//TODO-List';
}

function findLeaderSkill(mBlock) {
    let LeaderSkill = mBlock.find('p');
    char['LeaderSkillName'] = LeaderSkill.eq(0).find('strong').text();
    char['LeaderSkillContent'] = LeaderSkill.eq(1).text();
    char['LeaderSkillTag'] = 'RRRRRRRRRR//TODO-List';
}

function findKakusei(mBlock) {
    let AllKakusei = mBlock.find('div.name');
    char['Kakusei'] = [];
    for (let i = 0; i < AllKakusei.length; i++) {
        char['Kakusei'].push(AllKakusei.eq(i).text());
    }
}

function keepData(mChar) {
    let localpath = path.join(__dirname, './spider_'+now('s')+'.json');

    fs.open(localpath, 'a', function (err, fd) {
        fs.appendFile(localpath, JSON.stringify(mChar) + ',\r\n', function (err) {
            if (err) { console.log('\nWrite Char Error.'); }

            console.log('\x1b[36m%s\x1b[0m',`///  No. ${no} ${mChar['Name']} is catched.  ///`, '\x1b[0m');
            timerRepeat();
        });
    });
}

function keepTest(mChar) {
    fs.writeFile(path.join(__dirname, './test.txt'), web + no + '\n'+ JSON.stringify(mChar) +'\n\n\n\n\n' + html, function (err) {
        if (err) { console.log(err); }
        else { console.log('\nTest Report Write complete.'); }
    });
}

function timerRepeat() {
    no++;
    setTimeout(() => {
        startReq();
    }, 1000);    
}

function now(argv) {
    if (argv == 'u') {
        return Math.round(new Date().getTime() / 1000.0);
    } else if (argv == 's') {
        return new Date().toLocaleDateString(undefined, {hour12: false}).replace(/[\/|\-]/g, '');
    } else if (!isNaN(parseInt(argv))) {
        return new Date( parseInt(argv) * 1000).toLocaleString(undefined, {hour12: false});
    }
    return '' + new Date().toLocaleString(undefined, {hour12: false});
}
startReq();