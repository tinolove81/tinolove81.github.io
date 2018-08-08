// ==UserScript==
// @name        ptt imgur embed
// @namespace   ptt.cc
// @version     0.2018.8.8
// @author      tino
// @match       https://www.ptt.cc/bbs/*.html
// @run-at document-start
// ==/UserScript==
console.log('ptt imgur embed run!');

var h = function (tag, props) {
  return Object.assign(document.createElement(tag), props);
};
var preventScript = function (test) {
  return function (event) {
    return test(event.target.src) && event.preventDefault();
  };
};
var isImgurScript = function(name) {
  return (/imgur.com/.test(name));
};
document.addEventListener('beforescriptexecute', preventScript(isImgurScript));
try {
  //if no beforescriptexecute
  unsafeWindow.imgurEmbed = { createIframe: function createIframe() {
      return void 8;
    } };
} catch (e) {}

document.addEventListener('DOMContentLoaded', main);

var entry = '.imgur-embed-pub';

var imgurURL = function imgurURL(node) {
  var link = node.parentElement.previousElementSibling;
  return (link.href || link.querySelector('a').href).replace('http:', 'https://');
};

var ensureSuffix = function ensureSuffix(url) {
  return /\.(jpe?g|png)$/.test(url) ? url : url + '.jpg';
};

function repaste(node) {
  var place = node.parentElement;
  var element = h('img', {
    'src': ensureSuffix(imgurURL(node)),
    'class': 'imgurimage',
    'id': 'imgurimage',
    'referrerPolicy': 'no-referrer'
  });
  console.log('ptt imgur repaste ele:', element);
  place.innerHTML = '';
  place.appendChild(element);
}

function main() {
  Array.from(document.querySelectorAll(entry)).forEach(repaste);
}


