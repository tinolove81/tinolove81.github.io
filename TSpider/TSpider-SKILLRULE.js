const fs = require('fs');
const path = require('path');

let _MONSTER = require('./MONSTER-20190327.json');
let _INPUT = 'CMD Input';
let _NUMBER = 0;
let _RULE = [];

(function init() {
    if (!process.argv[2]) {
        _NUMBER = 0;
    } else if (!isNaN(parseInt(process.argv[2]))) {
        _INPUT = parseInt(process.argv[2]);
        _NUMBER = _INPUT - 1;
    }
    startRequest();
})();

function startRequest() {
    if (_MONSTER[_NUMBER] != undefined) {
        let M = _MONSTER[_NUMBER];
        console.log('\x1b[36m%s\x1b[0m',`/// StartRequest No.${M['Number']}///`, '\x1b[0m');
        let regArr = isReg(M['ActiveSkillContent']);
        if (regArr) {
            let rule = [];
            if (regArr[0]) { // 變化
                let match = [];
                let reg1 = /([^\sを。]+)(を)([^に。]+)(に(、|変化|。)+)/g;  //多屬轉先分段
                let reg2 = /([^\s。]+)(を)([^。]+)(に[、]*[変化]*[。]*)/;
                let m1 = M['ActiveSkillContent'].match(reg1);
                for (let i = 0; i < m1.length; i++) {
                    let m2 = m1[i].match(reg2).slice(1);
                    match = match.concat(m2);
                }
                rule = rule.concat(solve(match, 'change'));
            }
            if (regArr[1]) { // 生成
                let match = [];
                let reg1 =  /([^\s。]*)(を)([^。]*)(生成。)/g;
                let replace1 = /([^\s。]+)から/;
                let m1 = M['ActiveSkillContent'].match(reg1);
                m1[0] = m1[0].replace(replace1, '');
                match = match.concat(m1);
                rule = rule.concat(solve(match, 'random'));
            }
            _RULE.push({'Number': M['Number'], 'SkillRule': rule});
            // console.log({'Number': M['Number'], 'SkillRule': rule});
            timerRepeat(20);
        } else {
            console.log('\x1b[31m%s\x1b[0m', '   /// Isn\'t drop skill. //////');
            timerRepeat(10);
        }
    } else {
        console.log('\x1b[36m%s\x1b[0m',`_MONSTER[_NUMBER] == undefined, 即將結束.`, '\x1b[0m');
        keepData();
    }
}

function isReg(mContent) {
    let change = /([^\s。]+)(を)([^。]+)(に変化。)/.test(mContent);
    let random = /([^\s。]*)(を)([^。]*)(生成。)/.test(mContent);
    return (change || random) ? [change, random] : false;
}

function solve(mArray, mKey) {
    console.log('\x1b[36m%s\x1b[0m',`/// Solve ${_MONSTER[_NUMBER]['Number']} ///`, '\x1b[0m');
    console.log('   /// mKey:', mKey, ',input:', mArray);
    let ans_c = [];
    if (mKey == 'change') {
        let element = /(全)|(横)|(縦)|(火)|(水)|(木)|(光)|(闇)|(回復)|(邪魔)|([猛]*毒)|(爆弾)|(5属性)|(盤面外周)/g;
        if (mArray.length == 4) {
            let A = mArray[0].match(element);
            let B = mArray[2].match(element);
            if (A[0] == '盤面外周') {
                ans_c = ans_c.concat([`横轉${B[0]}`, `縦轉${B[0]}`]);
            } else {
                for (let i = 0; i < A.length; i++) {
                    for (let j = 0; j < B.length; j++) {
                        if (B[j] == '5属性') {
                            ans_c = ans_c.concat([`${A[i]}轉火`, `${A[i]}轉水`, `${A[i]}轉木`, `${A[i]}轉光`, `${A[i]}轉闇`]);
                        } else {
                            ans_c.push(`${A[i]}轉${B[j]}`);
                        }
                    }
                }
            }
        } else if (mArray.length % 4 == 0) {
            let part = solve(mArray.slice(0, 4), mKey);
            for (let i = 0;i < 4; i++) mArray.shift();
            ans_c = part.concat(solve(mArray, mKey));
        } else {
            ans_c = 'NotFourArgsSkill???';
        }
    } else if (mKey == 'random') {
        let element = /(十字)|(L字)|(火)|(水)|(木)|(光)|(闇)|(回復)|(邪魔)|([猛]*毒)|(爆弾)|(5属性)/g;
        let A = mArray[0].match(element);
        
        if (A[0] == '十字') {
            if (/つ生成/.test(mArray)) {
                for (let i = 1; i < A.length; i++) {
                    ans_c.push(`十字轉${A[i]}`);
                }
            } else {
                ans_c = ans_c.concat([`十字轉${A[1]}`, `横轉${A[1]}`, `縦轉${A[1]}`]);
            }
        } else if (A[0] == 'L字') {
            for (let i = 1; i < A.length; i++) {
                ans_c.push(`L字轉${A[i]}`);
            }
        } else {
            for (let i = 0; i < A.length; i++) {
                if (A[i] == '5属性') {
                    ans_c = ans_c.concat(['隨機轉火', '隨機轉水', '隨機轉木', '隨機轉光', '隨機轉闇']);
                } else {
                    ans_c.push(`隨機轉${A[i]}`);
                }
            }
        }
    }
    console.log('   /// solve_c:', ans_c);
    return ans_c;
}

function keepData() {
    let localpath = path.join(__dirname, './SKILLRULE-'+now('s')+'.json');
    fs.open(localpath, 'a', function (err, fd) {
        if (!err) {
            for (let i = 0, j = _RULE.length; i < j; i++) {
                let _R = _RULE[i];
                let data;
                if (i == 0) {
                    data = '[' + JSON.stringify(_R) + ',\r\n';
                } else if (i == j - 1) {
                    data = JSON.stringify(_R) + ']';
                } else {
                    data = JSON.stringify(_R) + ',\r\n';
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
    console.log('\x1b[36m%s\x1b[0m',`完整轉譯成: SKILLRULE.json +> 加參數名稱: const SKILLRULE = SKILLRULE.js`, '\x1b[0m');
}

function timerRepeat(ms) {
    _NUMBER = '' + (parseInt(_NUMBER) + 1);
    setTimeout(() => {
        startRequest();
    }, ms);    
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