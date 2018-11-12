const fs = require('fs');

const CHAR = require('./assist/CHAR.json');

let no = parseInt(process.argv[2]) - 1 || 0;

function startReq() {
    console.log('\x1b[36m%s\x1b[0m','/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////', '\x1b[0m');

    console.log(`No.${CHAR[no]['Number']} ${CHAR[no]['Name']} ${CHAR[no]['MainAttribute']} ${CHAR[no]['SubAttribute']}`);
    console.log(`Skill: ${CHAR[no]['ActiveSkillContent']}`);
    if (CHAR[no]['ActiveSkillContent'] == '') {
        console.log('Tag add: 00   (auto)');
        keepData(CHAR[no]['Number'], '00');
    } else {
        waitInput('Tag add: ', function (mData) {
            process.stdin.pause();
            keepData(CHAR[no]['Number'], mData);
        });
    }
}

function waitInput(mOutput, callback) {
    'use strict';
    process.stdin.resume();
    process.stdout.write(mOutput);
    process.stdin.once('data', function (mData) {
        callback(mData.toString().trim().split(' '));
    });
}

function keepData(mNumber, mData) {
    let tag = {"Number": mNumber, "ActiveSkillTag": mData};
    fs.open('tag.txt', 'a', function (err, fd) {
        fs.appendFile('tag.txt', JSON.stringify(tag) + ',\r\n', function (err) {
            if (err) { console.log('\nWrite Char Error.'); }

            console.log('\x1b[36m%s\x1b[0m',`///  No. ${CHAR[no]['Number']} is got, count backward to next.  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////`, '\x1b[0m');
            timerRepeat();
        });
    });
}

function keepTest() {
    fs.writeFile('test.txt', web + no + '\n'+ JSON.stringify(char) +'\n\n\n\n\n' + html, function (err) {
        if (err) { console.log(err); }
        else { console.log('\nTest Report Write complete.'); }
    });
}

function timerRepeat() {
    no++;
    setTimeout(() => {
        startReq();
    }, 300);    
}

startReq();