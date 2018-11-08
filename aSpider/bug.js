const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');


request({
    url: url,
    method: 'GET',
    headers: {
        'User-Agent': `Mozilla/5.0 (Windows NT 6.1; WOW64; rv:53.0) Gecko/20100101 Firefox/53.0`
    },
    followRedirect: false
    }, function (err, resp, data) {
        if (!err && resp.statusCode == 200) {
        
        // test(data);
        parseCHARACTER(data);

        } else {
            return err;
        }
});

function parseCHARACTER(h) {
    let char = {};
    try {
        
        const $ = cheerio.load(h);
        let NumberAndName = $('h3').eq(0).text().replace('No.', '').split(' - ');
        char['Number'] = NumberAndName[0];
        char['Name'] = NumberAndName[1];
        char['Rare'] = $('h3').eq(0).parent().contents().eq(4).text().trim();
        let Attribute = $('h3').eq(0).closest('table').parent().parent().find('td').eq(3).contents().find('img');
        char['MainAttribute'] = Attribute.eq(0).attr('src').replace(/.*\//, '').replace(/\.png.*/, '');
        char['SubAttribute'] = (!!Attribute.eq(1).length) ? Attribute.eq(1).attr('src').replace(/.*\//, '').replace(/\.png.*/, ''):'None';
        let AllType = $('h3').eq(0).closest('table').parent().parent().find('td').eq(4).contents().find('img');
        char['Type'] = [];
        for (let i = 0; i < AllType.length; i++) {
            char['Type'].push(AllType.eq(i).attr('src').replace(/.*\//, '').replace(/\.png.*/, ''));
        }

    } catch (error) {
        console.log(error);
        fs.writeFile('html.txt', h, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('Write operation complete.');
            }
        });
    }
    console.log(char);
}
function test(h) {
    const $ = cheerio.load(h);
    let AllType = $('h3').eq(0).closest('table').parent().parent().find('td').eq(4).contents().find('img');
    let char = [];
    for (let i = 0; i < AllType.length; i++) {
        char.push(AllType.eq(i).attr('src').replace(/.*\//, '').replace(/\.png.*/, ''));
    }

    
    console.log(char);
}



console.log('\x1b[36m%s\x1b[0m','/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////', '\x1b[0m');
console.log('\x1b[36m%s\x1b[0m','/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////', '\x1b[0m');
console.log('\x1b[36m%s\x1b[0m','/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////', '\x1b[0m');