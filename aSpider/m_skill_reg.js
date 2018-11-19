const fs = require('fs');
const path = require('path');

const CHAR = require('./assist/CHAR.json');

let no = parseInt(process.argv[2]) - 1 || 0;

function startReq() {
    if (CHAR[no] != undefined) {
        console.log('\x1b[36m%s\x1b[0m',`No.${CHAR[no]['Number']} ${CHAR[no]['Name']} ${CHAR[no]['MainAttribute']} / ${CHAR[no]['SubAttribute']} -Skill: ${CHAR[no]['ActiveSkillContent']}`);
    
        CHAR[no]['ActiveSkillContent'] = CHAR[no]['ActiveSkillContent']
            .replace('減少、', '減少。')
            .replace('に変換。', 'に変化。')
            .replace('に変化させ、', 'に変化。')
            .replace('に変化させる', 'に変化。')
            .replace(/全ドロップ[^を|の]/, '全ドロップを');
    
    
        if (isReg(CHAR[no]['ActiveSkillContent'])) {
            let reg1 = /([^"|。]*)(を)([^"|。]*)(に変化)(?:[^"|。]*)/;
            let reg2 = /([^"|。]*)(を)([^"|。]*)(に、)([^"|。]*)/;
    
            let match = CHAR[no]['ActiveSkillContent'].match(reg1);
            let depiction = match.shift();
            if (reg2.test(match[0])) {
                match = match[0].match(reg2).slice(1).concat(match.slice(1));
            }
    
            keepData(CHAR[no]['Number'], match, depiction);
        } else {
            console.log('\x1b[31m%s\x1b[0m', '   ///Is not changed skill. ///////');
            timerRepeat();
        }
    } else {
        let localpath = path.join(__dirname, './assist/CHAR_reg.json');
        fs.writeFile(localpath, JSON.stringify(CHAR), function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('\x1b[33m%s\x1b[0m', '   /// Modify CHAR Write complete. ///////');
            }
        });
    }
}

function isReg(content) {
    /*
    s01 = '闇ドロップを回復に変化';
    s02 = '回復と毒ドロップを木に変化';
    s03 = '光、回復、お邪魔、毒ドロップを木ドロップに変化';
    s04 = '木ドロップを火に、闇ドロップを回復に変化。 お邪魔と毒ドロップを水ドロップに変化。';
    s11 = '全ドロップを火、闇ドロップに変化。';
    s12 = '全ドロップを水、光、回復に変化';
    s13 = 'バインド状態を3ターン回復。全ドロップのロックを解除し、火と闇ドロップに変化。';
    */
    return /([^"|。]*)(を)([^"|。]*)(に変化)(?:[^"|。]*)/.test(content);
}

function keepData(mNumber, mArray, mDepiction) {
    let localpath = path.join(__dirname, './skill_reg_'+now('s')+'.json');
    let tag = [mNumber, mArray, mDepiction];
    fs.open(localpath, 'a', function (err, fd) {
        fs.appendFile(localpath, JSON.stringify(tag) + ',\r\n', function (err) {
            if (err) { console.log('\r\nWrite Char Error.'); }

            console.log('\x1b[32m%s\x1b[0m', '   /// Write down. ///////');
            timerRepeat();
        });
    });
}

function timerRepeat() {
    no++;
    setTimeout(() => {
        startReq();
    }, 10);    
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