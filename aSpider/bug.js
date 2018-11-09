const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');


let web = 'https://pd.appbank.net/m';
let no = process.argv[2] || 1;


function startReq() {
    console.log('\x1b[36m%s\x1b[0m','/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////', '\x1b[0m');
    request({
        url: createUrl(),
        method: 'GET',
        headers: {
            'User-Agent': `Mozilla/5.0 (Windows NT 6.1; WOW64; rv:53.0) Gecko/20100101 Firefox/53.0`
        },
        followRedirect: false
        }, function (err, resp, data) {
            if (!err) {
                test(data, resp.statusCode);
                // parseCHARACTER(data, resp.statusCode);
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
    let char = {};
    try {
        if (code != 200) {
            char['Number'] = no;
            char['Name'] = '不明';
            char['MainAttribute'] = '';
            char['SubAttribute'] = '';
            char['Rare'] = '';
            char['Cost'] = '';
            char['Assist'] = '';
            char['Type'] = [];
            char['Kakusei'] = [];
            char['SkillName'] = '';
            char['SkillCD'] = '';
            char['SkillContent'] = '';
            char['SkillTag'] = '';
        } else {
            const $ = cheerio.load(html);
            let Monster = $('div.monster');
            let NumberAndName = Monster.find('h2.title-bg').text().replace('No.', '').split(' ');
            char['Number'] = NumberAndName[0];
            char['Name'] = NumberAndName[1];
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
            let AllKakusei = Monster.find('div.spacer').eq(3).find('div.name');
            char['Kakusei'] = [];
            for (let i = 0; i < AllKakusei.length; i++) {
                char['Kakusei'].push(AllKakusei.eq(i).text());
            }
            let ActiveSkill = Monster.find('div.spacer').eq(1).find('p');
            char['SkillName'] = ActiveSkill.eq(0).find('strong').eq(0).text();
            char['SkillCD'] = ActiveSkill.eq(0).find('strong').eq(1).text().replace('ターン数：', '');
            char['SkillContent'] = ActiveSkill.eq(1).text();
            char['SkillTag'] = 'RRRRRRRRRR//TODO-List';
    
        }
        keepData(char);

    } catch (error) {
        console.log(error);
        fs.writeFile('error.txt', web + no + '\n'+ JSON.stringify(char) +'\n\n\n\n\n' + html, function (err) {
            if (err) { console.log(err); }
            else { console.log('Error Report Write complete.'); }
        });
    }
    console.log(char);
}
function test(html, code) {
    let char = {};
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

        /* 主動技能 */
        let ActiveSkill = Monster.find('div.spacer').eq(1).find('p');
        char['SkillName'] = ActiveSkill.eq(0).find('strong').eq(0).text();
        char['SkillCD'] = ActiveSkill.eq(0).find('strong').eq(1).text().replace('ターン数：', '');
        char['SkillContent'] = ActiveSkill.eq(1).text();
        char['SkillTag'] = 'RRRRRRRRRR//TODO-List';

        /* 寵物覺醒 */
        let AllKakusei = Monster.find('div.spacer').eq(3).find('div.name');
        char['Kakusei'] = [];
        for (let i = 0; i < AllKakusei.length; i++) {
            char['Kakusei'].push(AllKakusei.eq(i).text());
        }

        /*
        有主動 沒覺醒 有隊長 1 (新手龍)
        有主動 沒覺醒 沒隊長 21 (防龍)
        沒主動 沒覺醒 沒隊長 36 (波利)
        沒主動 沒覺醒 有隊長 176 (金屬龍)
        有主動 有覺醒 沒隊長 3338 (阿門裝備)

        沒主動 有覺醒 沒隊長 
        沒主動 有覺醒 有隊長 

        有主動 有覺醒 有隊長 正常
        */


        console.log(char);
        
        fs.writeFile('test.txt', web + no + '\n'+ JSON.stringify(char) +'\n\n\n\n\n' + html, function (err) {
            if (err) { console.log(err); }
            else { console.log('Test Report Write complete.'); }
        });
    }
}

function keepData(char) {
    fs.open('char.txt', 'a', function (err, fd) {
        fs.appendFile('char.txt', JSON.stringify(char) + ',\r\n', function (err) {
            if (err) { console.log('Write Char Error.'); }

            console.log('\x1b[36m%s\x1b[0m',`///  No. ${no} is got, count backward to next.  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////`, '\x1b[0m');
            timerRepeat();
        });
    });

}

function timerRepeat() {
    no++;
    setTimeout(() => {
        startReq();
    }, 1000);    
}

startReq();