const fs = require('fs');
const path = require('path');

const CHAR = require('./assist/CHAR.json');

let no = parseInt(process.argv[2]) - 1 || 0;

function startReq() {
    if (CHAR[no] != undefined) {
        console.log('\x1b[36m%s\x1b[0m',`No.${CHAR[no]['Number']} ${CHAR[no]['Name']} ${CHAR[no]['MainAttribute']} / ${CHAR[no]['SubAttribute']} -Skill: ${CHAR[no]['ActiveSkillContent']}`);
    
        CHAR[no]['ActiveSkillContent'] = CHAR[no]['ActiveSkillContent']
            .replace('+', '＋')
            .replace(/生成(?=[^。])/, '生成。')
            .replace('減少、', '減少。')
            .replace('に変換。', 'に変化。')
            .replace('に変化させ、', 'に変化。')
            .replace('に変化させる', 'に変化。')
            .replace(/全ドロップ(?=[^を|の])/, '全ドロップを');
    
    
        if (isReg(CHAR[no]['ActiveSkillContent'])) {
            let match = [];
            let reg1 = /([^\sを。]+)(を)([^に。]+)(に([、]|[変化]|[。])+)/g;  //多屬轉先分段
            let reg2 = /([^\s|。]+)(を)([^。]+)(に[、]*[変化]*[。]*)/;
    
            let m1 = CHAR[no]['ActiveSkillContent'].match(reg1);
            for (let i = 0; i < m1.length; i++) {
                let m2 = m1[i].match(reg2).slice(1);
                match = match.concat(m2);
            }
            let chinese = solve(match);
            
            keepData(CHAR[no]['Number'], chinese, match);
        } else {
            console.log('\x1b[31m%s\x1b[0m', '   /// Is not changed skill. //////');
            timerRepeat(10);
        }
    } else {
        let localpath = path.join(__dirname, './assist/CHAR_reg.json');
        let data = '';
        for (let i = 0; i < no; i++) {
            data += JSON.stringify(CHAR[i]);
            if (i != no - 1) data += ',\r\n';
        }
        fs.writeFile(localpath, data, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('\x1b[33m%s\x1b[0m', '/// Data end. Modify CHAR Write complete. //////');
            }
        });
    }
}

function isReg(mContent) {
    /*
    s01 = '水ドロップを回復ドロップに変化。';
    s02 = '闇ドロップを回復に変化。';
    s03 = '闇と回復ドロップを光ドロップに変化。';
    s04 = '回復と毒ドロップを木に変化。';
    s05 = '光、回復、お邪魔、毒ドロップを木ドロップに変化。';
    s06 = '木、光、毒ドロップを回復ドロップに変化。 バインド状態を3ターン回復。';
    s07 = '木ドロップを火に、闇ドロップを回復に変化。 お邪魔と毒ドロップを水ドロップに変化。';
    s11 = '全ドロップを水ドロップに変化。敵全体を超絶毒にする。';
    s12 = '全ドロップを火、闇ドロップに変化。';
    s13 = '全ドロップを水、光、回復に変化。';
    s14 = 'バインド状態を3ターン回復。全ドロップのロックを解除し、火と闇ドロップに変化。';
    s15 = '全ドロップを5属性＋回復ドロップに変化。5属性＋回復ドロップをロック。';
    s15 = '敵のHP20%減少。全ドロップを5属性＋回復＋お邪魔＋毒＋猛毒ドロップに変化。';
    s21 = '最上段横1列を闇ドロップに変化。';
    s22 = '最上段横1列を闇に、最下段横1列をお邪魔ドロップに変化。';
    s23 = '下から2列目横1列を木に、最下段横1列を光ドロップに変化。';
    s24 = '左端縦1列を回復に、右端縦1列を水ドロップに変化。';
    s25 = '最上段横1列と最下段横1列をお邪魔ドロップに変化。';
    s31 = "木以外からランダムで回復ドロップを2個生成。お邪魔と毒ドロップを木ドロップに変化。"
    s32 = "ドロップのロック状態を解除。火以外のドロップから回復ドロップを5個生成。"

    sEX01 = '十字型に光ドロップを生成。';  //1873
    sEX02 = '敵の最大HP5%分のダメージ。十字型に水ドロップを生成。';  //4691

    生成 425
    個生成 284
    個ずつ生成 137
    を生成 4
    */
    let change =  /([^\s。]+)(を)([^。]+)(に変化。)/.test(mContent);
    let random =  /([^\s。]*)(を)([^。]*)(生成。)/.test(mContent);
    return change || random;
}

function solve(mArray) {
    console.log('input:', mArray);
    let ans = [];
    let element = /(5属性)|(全)|(火)|(水)|(木)|(光)|(闇)|(回復)|(お邪魔)|([猛]*毒)|(横)|(縦)/g;
    if (mArray.length == 4) {
        let A = mArray[0].match(element);
        let B = mArray[2].match(element);
        ans = A.concat(['を']).concat(B).concat(['に変化']);
    } else if (mArray.length % 4 == 0) {
        let part = solve(mArray.slice(0, 4));
        for (let i = 0;i < 4; i++) mArray.shift();
        ans = part.concat(solve(mArray));
    } else {
        ans = 'NotFourArgsSkill???';
    }
    console.log('solve:', ans);
    return ans;
}

function keepData(mNumber, mChineseArr, mRegArr) {
    let localpath = path.join(__dirname, './skill_reg_'+now('s')+'.json');
    let tag = {'no': mNumber, 'tag': mChineseArr, 'reg': mRegArr};
    fs.open(localpath, 'a', function (err, fd) {
        fs.appendFile(localpath, JSON.stringify(tag) + ',\r\n', function (err) {
            if (err) { console.log('\r\nWrite Char Error.'); }

            console.log('\x1b[32m%s\x1b[0m', '   /// Write down. //////');
            timerRepeat(20);
        });
    });
}

function timerRepeat(ms) {
    no++;
    setTimeout(() => {
        startReq();
    }, ms);    
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