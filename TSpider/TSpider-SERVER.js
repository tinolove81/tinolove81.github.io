const express = require('express');
const fs = require('fs');
const path = require('path');
const request = require('request');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');

let MONSTER = require('./MONSTER-20190223.json');
let WEB = 'https://pd.appbank.net/m';
let _NUMBER = 0;
let CHAR;
let numTry = 0;

const app = express();
const PORT = 714;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/asset', express.static(__dirname + '/asset'));

app.listen(PORT, () => {
    console.log(`http server running on http://localhost:${PORT}`);
});

app.get('/',  (req, res) => {
    res.setHeader('Content-Type', 'text/html;charset=UTF-8'); 
});
app.get('/Monster/:MonNo', (req, res) => {
    res.setHeader('Content-Type', 'text/html;charset=UTF-8'); 
    startRequest(req.params.MonNo, (mData) => {
        res.send(page_monster
            .replace('{{ MonsterLib }}', JSON.stringify(MONSTER[_NUMBER - 1], null, 4))
            .replace('{{ MonsterWeb }}', JSON.stringify(mData, null, 4))
        );
    });
});
app.get('/100', (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8'); 
    res.send({'who 100': 'Kakayaku!'});
});

function startRequest(mNumber, callback) {
    console.log('\x1b[36m%s\x1b[0m',`/// StartRequest No.${mNumber} ///`, '\x1b[0m');
    request({
        url: createUrl(mNumber),
        method: 'GET',
        followRedirect: false
    }, function (err, resp, data) {
        if (!err) {
            let mon = parseChar(data, resp.statusCode);
            callback && callback(mon);
        } else {
            return err;
        }
    });
}
function createUrl(mNumber) {
    let url = WEB;
    if (mNumber <= 0) {
        mNumber = 1;
        _NUMBER = 1;
        return url + '00' + mNumber;
    } else if (mNumber < 100) {
        _NUMBER = mNumber;
        return url + ('00' + mNumber).substr(-3);
    } else {
        _NUMBER = mNumber;
        return url + mNumber;
    }
}
function parseChar(html, code) {
    console.log('\x1b[36m%s\x1b[0m',`/// ParseChar ///`, '\x1b[0m');
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
        return CHAR;
    } catch (error) {
        console.log(error);
        fs.writeFile(path.join(__dirname, './error.txt'), _WEB + _NUMBER + '\n'+ JSON.stringify(CHAR) +'\n\n\n\n\n' + html, function (err) {
            if (err) { console.log(err); }
            else { console.log('Error Report Write complete.'); }
        });
    }
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
let page_monster = `
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no'>
    <link rel='stylesheet' href='/asset/css/bootstrap.min.css' />
    <link rel='stylesheet' href='/asset/css/theme.css' />
    <script src='/asset/js/jquery-3.2.1.min.js'></script>
    <script src='/asset/js/bootstrap.bundle.min.js'></script>
    <title>【パズドラ】モンスター比對</title>
    <script async src='https://www.googletagmanager.com/gtag/js?id=UA-130029385-1'></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'UA-130029385-1');
    </script>
    <style>
    @import url('https://fonts.googleapis.com/css?family=Imprima');
    @import url('https://fonts.googleapis.com/css?family=Noto Sans JP');
    @media (min-width: 1450px) {
        .container {
            max-width: 1380px;
        }
    }
    body {
        height: 100%;
        font-family: Imprima, 'Noto Sans JP';
        background-color: #343a40 !important;
    }
    .icon-tool {
        display: inline-block;
        width: 24px;
        height: 24px;
        vertical-align: middle;
        background-repeat: no-repeat;
        background-position: top left;
        background-size: 24px 24px;
    }
    .theme-dark pre {
        color: #f8f9fa !important;
        white-space: pre-wrap;
    }
    .theme-light pre {
        color: #343a40 !important;
        white-space: pre-wrap;
    }
    .theme-dark pre div.hover {
        background-color: rgba(255, 255, 255, 0.075);
    }
    .theme-light pre div.hover {
        background-color: rgba(0, 0, 0, 0.075);
    }
    </style>
</head>
<body class='theme-dark'>
    <nav class='navbar navbar-dark shadow'>
        <a class='navbar-brand'>【パズドラ】モンスター比對</a>
        <button type='button' id='nav_btn_Switchtheme' class='btn btn-sm navbar-toggler ml-auto' data-theme='dark'>
            <i class='icon-tool icon-theme-toggler'></i>
        </button>
        <button type='button' class='btn btn-sm navbar-toggler ml-1' data-toggle='collapse' data-target='#collapseNews' >
            <i class='icon-tool icon-navbar-toggler'></i>
        </button>
        <div id='collapseNews' class='collapse shadow'>
            <div class='card p-2 align-items-center text-center'>
                <span class='card-text text-success'>== 最後更新 ==</span>
            </div>
          </div>
    </nav>
    <div id='monster' class='container px-3 pb-2'>
        <div class='row my-1 align-items-center'>
            <div class='col-6 text-success'><strong>モンスター (Library)：</strong></div>
            <div class='col-5 text-info'><strong>モンスター (Website)：</strong></div>
            <div class='col-auto ml-auto'><button type='button' class='btn btn-sm btn-success' data-toggle='modal' data-target='#sortentry'>表示順</button></div>
        </div>
        <div class='row mb-1 align-items-center'>
            <div class='col-6'><pre id='monster_lib' class='p-1 border border-success rounded'>{{ MonsterLib }}</pre></div>
            <div class='col-6'><pre id='monster_web' class='p-1 border border-info rounded'>{{ MonsterWeb }}</pre></div>
        </div>
    </div>

    <div id='footer' class='container px-3 pb-2'>
        <div class='row mt-5 flex-column'>
            <small class='col-auto'>This site is fan-made and not affiliated with GungHo Online Entertainment Inc.</small><br/>
            <small class='col-auto'>All trademarks and copyrights belong to their respective owners, and are used here under the terms of fair use.</small><br/>
            <small class='col-auto'>All images and graphics are the property of GungHo Online Entertainment Inc.</small><br/>
            <div class='col-auto ml-auto align-self-end'>&#64;&#116;&#105;&#110;&#111;&#108;&#111;&#118;&#101;&#56;&#49; <small class='text-info'>v.0.2.23(2030)</small></div>
        </div>
    </div>
    <script>
    $('#nav_btn_Switchtheme').on('click', (e) => {
        let theme = e.currentTarget.dataset.theme;
        if (theme == 'dark') {
            e.currentTarget.dataset.theme = 'light';
            $('body').addClass('theme-light').removeClass('theme-dark');
            $('nav').addClass('navbar-light').removeClass('navbar-dark');
        } else if (theme == 'light') {
            e.currentTarget.dataset.theme = 'dark';
            $('body').addClass('theme-dark').removeClass('theme-light');
            $('nav').addClass('navbar-dark').removeClass('navbar-light');
        }
    });
    $('pre').each((i, e) => {
        let lines = $(e).html().split('\\n');
        let output = '';
        for (let i = 0; i < lines.length; i++) {
            output = output + '<div>' + lines[i] + '</div>';
        }
        $(e).html(output);
    });
    $('pre div').on('mouseenter', (e) => {
        let t = $(e.target);
        let idx = t.index() + 1;
        $('pre').each((i, e) => {
            $('div:nth-child('+idx+')', e).addClass('hover');
        });
    });
    $('pre div').on('mouseleave', (e) => {
        let t = $(e.target);
        let idx = t.index() + 1;
        $('pre').each((i, e) => {
            $('div:nth-child('+idx+')', e).removeClass('hover');
        });
    });
    </script>
</body>
</html>

`;