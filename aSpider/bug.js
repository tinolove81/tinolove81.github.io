const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');


let web = 'https://pd.appbank.net/m';
let no = process.argv[2] || 1;


function startReq() {
    request({
        url: web + no,
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

function parseCHARACTER(html, code) {
    let char = {};
    try {
        const $ = cheerio.load(html);

        if (code != 200) {
            char['Number'] = no;
            char['Name'] = '不明';
            char['Rare'] = '';
            char['MainAttribute'] = '';
            char['SubAttribute'] = '';
            char['Type'] = [];
            char['Kakusei'] = [];
        } else {
            const $ = cheerio.load(h);
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
    
        }
        // keepData(char);
        // timerRepeat();

    } catch (error) {
        console.log(error);
        fs.writeFile('error.txt', web + no + '\n'+ JSON.stringify(char) +'\n\n\n\n\n' + h, function (err) {
            if (err) { console.log(err); }
            else { console.log('Error Report Write complete.'); }
        });
    }
    console.log(char);

    // fs.writeFile('test.txt', web + no + '\n'+ JSON.stringify(char) +'\n\n\n\n\n' + h, function (err) {
    //     if (err) { console.log(err); }
    //     else { console.log('Test Report Write complete.'); }
    // });
}
function test(h, code) {
    let char = {};
    if (code != 200) {
    } else {
        const $ = cheerio.load(h);
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





        console.log(char);
    }
}



function keepData(char) {
    fs.open('char.txt', 'a', function (err, fd) {
        fs.appendFile('char.txt', JSON.stringify(char) + ',\n', function (err) {
            if (err) { console.log('Write Char Error.'); }
        });
    });
}
function timerRepeat() {
    console.log('\x1b[36m%s\x1b[0m','/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////', '\x1b[0m');
    console.log('\x1b[36m%s\x1b[0m',`///  No. ${no} is got, count backward to next.///////////////////////////////////////////////////////////////////////////////////////////////////////////////////`, '\x1b[0m');
    console.log('\x1b[36m%s\x1b[0m','/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////', '\x1b[0m');

    no = parseInt(no);
    no++;
    setTimeout(() => {
        startReq();
    }, 8000);    
}

console.log('\x1b[36m%s\x1b[0m','/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////', '\x1b[0m');
startReq();