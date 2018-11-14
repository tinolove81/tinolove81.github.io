const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

let CHAR = require('./assist/CHAR.json');

let web = 'https://pd.appbank.net/m';
let no = process.argv[2] || 1;

let char;

function startReq() {
    console.log('\x1b[1;36m%s\x1b[0m',`/// START ///`, '\x1b[0m');
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
    };
    try {
        if (code != 200) {
            char['Number'] = no;
            char['Name'] = '不明';
            console.log('\x1b[1;36m%s\x1b[0m',`///  No. ${no} is 404, count backward to next.  ///`, '\x1b[0m');
        } else {
            const $ = cheerio.load(html);
            let Monster = $('div.monster');
            let NumberAndName = Monster.find('h2.title-bg').text().replace('No.', '').split(' ');
            char['Number'] = NumberAndName.shift();
            char['Name'] = NumberAndName.join(' ');
        }

        // keepData(char);
        findDifferent(char);

    } catch (error) {
        console.log(error);
        fs.writeFile('error.txt', web + no + '\r\n'+ JSON.stringify(char) +'\r\n\r\n\r\n' + html, function (err) {
            if (err) { console.log(err); }
            else { console.log('Error Report Write complete.'); }
        });
    }
}


function findDifferent(mChar) {
    let char_org = CHAR[no -1];
    if (char_org['Name'] != mChar['Name'] && mChar['Name'] != '不明') {
        waitInput('\x1b[1;36m find Different at No.' + no + ' Name\x1b[0m\n Original: ' + char_org['Name'] + ', Newer: ' + mChar['Name'] + '\n Modify it? (Y/n)', function (mData) {
            if (mData == '' || mData == 'y') {
                CHAR[no -1]['Name'] = mChar['Name'];
                keepData2(CHAR);
                console.log('\x1b[1;33m',`///  Name is modify!!`, '\x1b[0m');
            } else {
                console.log('\x1b[1;32m',`///  Name is NOT modify!!`, '\x1b[0m');
            }
            process.stdin.pause();
            timerRepeat();
        });
    } else {
        console.log('\x1b[1;36m',`///  No.${no} is got, ${mChar['Name']} is same ///`, '\x1b[0m');
        timerRepeat();
    }
}

function keepData(mChar) {
    fs.open('char.txt', 'a', function (err, fd) {
        fs.appendFile('char.txt', JSON.stringify(mChar) + ',\r\n', function (err) {
            if (err) { console.log('\r\nWrite Char Error.'); }

            console.log('\x1b[1;36m%s\x1b[0m',`///  No. ${no} is got, count backward to next.  ///`, '\x1b[0m');
            timerRepeat();
        });
    });
}

function keepData2(mChar) {
    fs.writeFile('char.txt', JSON.stringify(mChar), function (err) {
        if (err) { console.log(err); }
        else { console.log('\r\nData2 Write complete.'); }
    });
}

function waitInput(mOutput, callback) {
    'use strict';
    process.stdin.resume();
    process.stdout.write(mOutput);
    process.stdin.once('data', function (mData) {
        callback(mData.toString().trim());
    });
}

function timerRepeat() {
    no++;
    setTimeout(() => {
        startReq();
    }, 400);
}

startReq();