webpackJsonp([1],{16:function(t,e,n){function s(t){n(72)}var o=n(7)(n(40),n(77),s,null,null);t.exports=o.exports},17:function(t,e,n){function s(t){n(70)}var o=n(7)(n(41),n(75),s,"data-v-0d062118",null);t.exports=o.exports},18:function(t,e,n){function s(t){n(71)}var o=n(7)(n(42),n(76),s,"data-v-238f7f7e",null);t.exports=o.exports},39:function(t,e,n){"use strict";function s(t,e,n){var s=new Date;s.setDate(s.getDate()+n);var o="expires="+s.toUTCString();document.cookie=t+"="+e+";"+o+";path=/"}function o(t){var e,n=new RegExp("(^| )"+t+"=([^;]*)(;|$)");return(e=document.cookie.match(n))?e[2]:null}function i(t){var e=o(t);null!=e&&s(t,e,-1)}Object.defineProperty(e,"__esModule",{value:!0});var a=n(20),r=n(19),c=n(16),l=n.n(c),u=n(17),p=n.n(u),g=n(18),m=n.n(g);a.a.use(r.a);var d=new r.a({mode:"history",routes:[{path:"/dist/login",name:"Login",component:p.a},{path:"/dist/main",name:"Main",component:m.a},{path:"/*",redirect:"/dist/login"}]});a.a.config.productionTip=!1,a.a.prototype.setCookie=s,a.a.prototype.getCookie=o,a.a.prototype.delCookie=i,new a.a({el:"#app",router:d,template:"<App></App>",components:{App:l.a},created:function(){this.checkLogin()},methods:{checkLogin:function(){this.getCookie("session")?this.$router.push("/dist/main"):this.$router.push("/dist/login")}},watch:{$route:"checkLogin"}})},40:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default={name:"app",data:function(){return{iserr:!0,islogin:!1,message:"Hello Vue.js!!"}}}},41:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var s=n(43),o=n.n(s),i=n(21),a=n.n(i),r={h2:"title",ac:"Account3",pw:"Password3",submit:"Push3",mistake:"mistook",nullin:"something is null"},c={h2:"Loginsystem",ac:"Account",pw:"Password",submit:"Login",mistake:"Mistake"},l={h2:"內容管理系統",ac:"帳號",pw:"密碼",submit:"登入",mistake:"錯誤!"},u={h2:"Jp1",ac:"Jp2",pw:"Jp3",submit:"Jp4",mistake:"Jp5"};e.default={name:"Login",data:function(){return{l:r,account:"",password:"",loginmsg:"",showmsg:!1,loginiserr:!1,selected:"EN",languagelist:[{text:"English",tt:"EN"},{text:"繁體中文 (Traditional Chinese)",tt:"TC"},{text:"Francais (French)",tt:"FRA"},{text:"Deutsch (German)",tt:"GEM"},{text:"日本語 (Japanese)",tt:"JPN"},{text:"български (Bulgarian)",tt:"BG"},{text:"Češka (Czech)",tt:"CZH"},{text:"Danske (Danish)",tt:"DAN"},{text:"Nederlands (Dutch)",tt:"NLD"},{text:"Ελληνικός (Greek)",tt:"EL"},{text:"עברית (Hebrew)",tt:"HEB"},{text:"Magyar (Hungarian)",tt:"HUN"},{text:"Italiano (Italian)",tt:"ITA"},{text:"Bahasa Indonesia (Indonesian)",tt:"ID"},{text:"Norske (Norwegian)",tt:"NO"},{text:"Lietuvos (Lithuanian)",tt:"LT"},{text:"فارسی (Persian)",tt:"PRS"},{text:"Polski (Polish)",tt:"POL"},{text:"Português (Portuguese)",tt:"PYU"},{text:"Limba română (Romanian)",tt:"RO"},{text:"Русский язык (Russian)",tt:"RUS"},{text:"Српски језик (Serbian)",tt:"SRL"},{text:"简体中文 (Simplified Chinese)",tt:"SC"},{text:"Slovenščina (Slovenian)",tt:"Sl"},{text:"Slovenčina (Slovakian)",tt:"SK"},{text:"Español (Spanish)",tt:"SPN"},{text:"ภาษาไทย (Thai)",tt:"TAI"},{text:"Türkçe (Turkish)",tt:"TR"},{text:"Svenska (Swedish)",tt:"SV"},{text:"Suomi (Finnish)",tt:"FI"},{text:"اللغة العربية (Arabic)",tt:"ARB"}]}},methods:{onChange:function(){switch(console.log("onChange"),this.selected){case"EN":for(var t=0;t<o()(r).length;t++)r[o()(r)[t]]=c[o()(r)[t]];break;case"TC":for(var e=0;e<o()(r).length;e++)r[o()(r)[e]]=l[o()(r)[e]];break;case"JPN":for(var n=0;n<o()(r).length;n++)r[o()(r)[n]]=u[o()(r)[n]]}},closebtn:function(){console.log("closebtn"),this.$router.go(-1)},onSubmit:function(){console.log("onSubmit"),""!==this.account&&""!==this.password?this.tologin():(this.showmsg=!0,this.loginiserr=!0,this.loginmsg=this.l.nullin)},tologin:function(){console.log("tologin");var t=this;a.a.post("http://192.168.4.3/verify.php",{vacc:t.account,vpsd:t.password,vlangid:t.selected}).then(function(e){var n="200"===e.data.state;t.showmsg=!0,t.loginiserr=!n,t.loginmsg=e.data.msg,n&&(t.setCookie("session",t.account,10),t.$router.push("/dist/main"))})}},watch:{account:function(t){this.account=t.toString().replace(/[^a-zA-Z0-9]/g,"")},showmsg:function(t){var e=this;t&&setTimeout(function(){e.showmsg=!1},3e3)},selected:function(t){console.log(t)}}}},42:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});e.default={name:"Login",data:function(){return{h2:"YES or NO",msg:"YES or NO",getimg:!1,imgsrc:"",submit:"???"}},created:function(){this.h2+=" - [ "+this.getCookie("session")+" ]"},methods:{onSubmit:function(){this.getimg=!1,this.msg="猜看看",console.log("onSubmit");var t=this,e=new XMLHttpRequest;e.open("GET","https://yesno.wtf/api"),e.onload=function(){var n=JSON.parse(e.responseText);console.log(n),t.imgsrc=n.image},e.send(),document.querySelector("img").addEventListener("load",function(){console.log("addEventListener"),t.getimg=!0})},delcookie:function(){console.log("delcookie"),this.delCookie("session"),this.$router.push("/")}},watch:{account:function(t){this.account=t.toString().replace(/[^a-zA-Z0-9]/g,"")}}}},70:function(t,e){},71:function(t,e){},72:function(t,e){},75:function(t,e){t.exports={render:function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"loginbox",attrs:{id:"loginbox"}},[n("div",{staticClass:"closebtn ps-top ps-right",on:{click:t.closebtn}}),t._v(" "),n("h2",{staticClass:"ml-left"},[t._v(" "+t._s(t.l.h2)+" ")]),t._v(" "),n("input",{directives:[{name:"model",rawName:"v-model",value:t.account,expression:"account"}],staticClass:"form-control",attrs:{placeholder:t.l.ac,maxlength:"12",type:"text"},domProps:{value:t.account},on:{input:function(e){e.target.composing||(t.account=e.target.value)}}}),n("br"),t._v(" "),n("input",{directives:[{name:"model",rawName:"v-model",value:t.password,expression:"password"}],staticClass:"form-control",attrs:{placeholder:t.l.pw,maxlength:"12",type:"password"},domProps:{value:t.password},on:{input:function(e){e.target.composing||(t.password=e.target.value)}}}),n("br"),t._v(" "),n("br"),t._v(" "),n("div",{staticClass:"btn",on:{click:t.onSubmit}},[t._v(" "+t._s(t.l.submit)+" ")]),n("br"),t._v(" "),n("transition",{attrs:{name:"msg-fade"}},[n("p",{directives:[{name:"show",rawName:"v-show",value:t.showmsg,expression:"showmsg"}],class:{pmsg:!0,info:!t.loginiserr,error:t.loginiserr}},[t._v(" "+t._s(t.loginmsg)+" ")])]),t._v(" "),n("select",{directives:[{name:"model",rawName:"v-model",value:t.selected,expression:"selected"}],staticClass:"ps-bottom ps-right",on:{change:[function(e){var n=Array.prototype.filter.call(e.target.options,function(t){return t.selected}).map(function(t){return"_value"in t?t._value:t.value});t.selected=e.target.multiple?n:n[0]},t.onChange]}},t._l(t.languagelist,function(e){return n("option",{domProps:{value:e.tt}},[t._v(" "+t._s(e.text)+" ")])}))],1)},staticRenderFns:[]}},76:function(t,e){t.exports={render:function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"mainpage",attrs:{id:"mainpage"}},[n("div",{staticClass:"closebtn ps-top ps-right",on:{click:t.delcookie}}),t._v(" "),n("h2",{staticClass:"ml-left"},[t._v(" "+t._s(t.h2)+" ")]),t._v(" "),n("div",{staticClass:"content"},[n("transition",{attrs:{name:"fade"}},[n("img",{directives:[{name:"show",rawName:"v-show",value:t.getimg,expression:"getimg"}],staticClass:"image",attrs:{src:t.imgsrc}})]),t._v(" "),n("span",{directives:[{name:"show",rawName:"v-show",value:!t.getimg,expression:"!getimg"}]},[t._v(" "+t._s(t.msg)+" ")])],1),t._v(" "),n("br"),t._v(" "),n("div",{staticClass:"btn",on:{click:t.onSubmit}},[t._v(" "+t._s(t.submit)+" ")]),n("br")])},staticRenderFns:[]}},77:function(t,e){t.exports={render:function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{attrs:{id:"app"}},[n("transition",{attrs:{name:"fade"}},[n("router-view")],1)],1)},staticRenderFns:[]}}},[39]);
//# sourceMappingURL=app.9f1eafb0139e8044fdf6.js.map