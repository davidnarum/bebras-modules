// TODO :: move to quickAlgo

/*
pythonCount:
   returns number of Blockly blocks corresponding to some Python code.

Patterns are stored in pythonCountPatterns, tried in the order of the list;
block: false means a pattern doesn't count towards the block number if matched.
*/

var pythonCountPatterns = [
   // Comments
   {pattern: /^#[^\n\r]+/, block: false},

   // Special syntax
   {pattern: /^from\s+\w+\s+import\s+[^\n\r]/, block: false}, // from robot import *
   {pattern: /^import\s+[^\n\r]+/, block: false}, // import x, y, z
   {pattern: /^for\s+\w+\s+in\s+range/, block: false}, // for i in range(5): is only one block; it's a bit tricky

   {pattern: /^\d+\.\d*/, block: true},
   {pattern: /^\w+/, block: true},

   // Strings
   {pattern: /^'''(?:[^\\']|\\.|'[^']|'[^'])+'''/, block: true},
   {pattern: /^'(?:[^\\']|\\.)+'/, block: true},
   {pattern: /^"""(?:[^\\"]|\\.|"[^"]|""[^"])+"""/, block: true},
   {pattern: /^"(?:[^\\"]|\\.)+"/, block: true},

   // Operators
   {pattern: /^[+*\/%=!<>&|^~]+/, block: true},

   // Separators
   {pattern: /^[\s\(\),:]+/, block: false}
   ];

function pythonCount(text) {
   var remainingText = text;
   var nbBlocks = 0;
   while(remainingText != '') {
      var found = false;
      for(var i=0; i<pythonCountPatterns.length; i++) {
         var patternInfo = pythonCountPatterns[i];
         var match = patternInfo.pattern.exec(remainingText);
         if(match) {
            if(patternInfo.block) { nbBlocks += 1; }
            remainingText = remainingText.substring(match[0].length);
            found = true;
            break;
         }
      }
      if(!found) {
         remainingText = remainingText.substring(1);
      }
   }
   return nbBlocks;
}

var pythonForbiddenBlocks = {
    'dicts': {
      'dicts_create_with': ['dict_brackets'],
      'dict_get_literal': ['dict_brackets'],
      'dict_set_literal': ['dict_brackets'],
      'dict_keys': ['dict_brackets']
    },
    'logic': {
      'controls_if': ['if', 'else', 'elif'],
      'controls_if_else': ['if', 'else', 'elif'],
      'logic_negate': ['not'],
      'logic_operation': ['and', 'or']
    },
    'loops': {
      'controls_repeat': ['for'],
      'controls_repeat_ext': ['for'],
      'controls_for': ['for'],
      'controls_forEach': ['for'],
      'controls_whileUntil': ['while'],
      'controls_untilWhile': ['while'],
      'controls_infiniteloop': ['while']
    },
    'lists': {
      'lists_create_with_empty': ['list', 'set', 'list_brackets', '__getitem__', '__setitem__'],
      'lists_create_with': ['list', 'set', 'list_brackets', '__getitem__', '__setitem__'],
      'lists_repeat' : ['list', 'set', 'list_brackets', '__getitem__', '__setitem__'],
      'lists_length' : ['list', 'set', 'list_brackets', '__getitem__', '__setitem__'],
      'lists_isEmpty' : ['list', 'set', 'list_brackets', '__getitem__', '__setitem__'],
      'lists_indexOf' : ['list', 'set', 'list_brackets', '__getitem__', '__setitem__'],
      'lists_getIndex': ['list', 'set', 'list_brackets', '__getitem__', '__setitem__'],
      'lists_setIndex': ['list', 'set', 'list_brackets', '__getitem__', '__setitem__'],
      'lists_getSublist': ['list', 'set', 'list_brackets', '__getitem__', '__setitem__'],
      'lists_sort' : ['list', 'set', 'list_brackets', '__getitem__', '__setitem__'],
      'lists_split' : ['list', 'set', 'list_brackets', '__getitem__', '__setitem__'],
      'lists_append': ['list', 'set', 'list_brackets', '__getitem__', '__setitem__']
    },
    'maths': {
      'math_number': ['math_number']
    },
    'functions': {
      'procedures_defnoreturn': ['def', 'lambda'],
      'procedures_defreturn': ['def', 'lambda']
    },
    'variables': {
      'variables_set': ['var_assign']
    }
};

function pythonForbiddenLists(includeBlocks) {
   // Check for forbidden keywords in code
   var forbidden = ['for', 'while', 'if', 'else', 'elif', 'not', 'and', 'or', 'list', 'set', 'list_brackets', 'dict_brackets', '__getitem__', '__setitem__', 'var_assign', 'def', 'lambda', 'break', 'continue', 'setattr', 'map', 'split'];
   var allowed = []

   if(!includeBlocks) {
     return {forbidden: forbidden, allowed: allowed};
   }

   var forced = includeBlocks.pythonForceForbidden ? includeBlocks.pythonForceForbidden : [];
   for(var k=0; k<forced.length; k++) {
      if(!arrayContains(forbidden, forced[k])) {
         forbidden.push(forced[k]);
      }
   }

   var removeForbidden = function(kwList) {
      for(var k=0; k<kwList.length; k++) {
         if(arrayContains(forced, kwList[k])) { continue; }
         var idx = forbidden.indexOf(kwList[k]);
         if(idx >= 0) {
            forbidden.splice(idx, 1);
            allowed.push(kwList[k]);
         }
      }
   };

   if(includeBlocks && includeBlocks.standardBlocks) {
      if(includeBlocks.standardBlocks.includeAll || includeBlocks.standardBlocks.includeAllPython) {
         // Everything is allowed
         removeForbidden(forbidden.slice());
         return {forbidden: forbidden, allowed: allowed};
      }
      if(includeBlocks.standardBlocks.wholeCategories) {
         for(var c=0; c<includeBlocks.standardBlocks.wholeCategories.length; c++) {
            var categoryName = includeBlocks.standardBlocks.wholeCategories[c];
            if(pythonForbiddenBlocks[categoryName]) {
               for(var blockName in pythonForbiddenBlocks[categoryName]) {
                  removeForbidden(pythonForbiddenBlocks[categoryName][blockName]);
               }
            }
         }
      }
      if(includeBlocks.standardBlocks.singleBlocks) {
         for(var b=0; b<includeBlocks.standardBlocks.singleBlocks.length; b++) {
            var blockName = includeBlocks.standardBlocks.singleBlocks[b];
            for(var categoryName in pythonForbiddenBlocks) {
               if(pythonForbiddenBlocks[categoryName][blockName]) {
                  removeForbidden(pythonForbiddenBlocks[categoryName][blockName]);
               }
            }
         }
      }
   }

   if(includeBlocks && includeBlocks.variables && includeBlocks.variables.length) {
      removeForbidden(['var_assign']);
   }

   return {forbidden: forbidden, allowed: allowed};
}

function removeFromPatterns(code, patterns) {
   // Remove matching patterns from code
   for(var i=0; i<patterns.length; i++) {
      while(patterns[i].exec(code)) {
         code = code.replace(patterns[i], '');
     }
   }
   return code;
}

function pythonForbidden(code, includeBlocks) {
   var forbidden = pythonForbiddenLists(includeBlocks).forbidden;

   // Remove comments and strings before scanning
   var removePatterns = [
      /#[^\n\r]+/
      ];

   code = removeFromPatterns(code, removePatterns);

   var stringPatterns = [
      /'''(?:[^\\']|\\.|'[^']|'[^'])+'''/,
      /'(?:[^\\']|\\.)+'/,
      /"""(?:[^\\"]|\\.|"[^"]|""[^"])+"""/,
      /"(?:[^\\"]|\\.)+"/
      ];

   code2 = removeFromPatterns(code, stringPatterns);
   if(window.arrayContains && arrayContains(forbidden, 'strings') && code != code2) {
      return 'chaînes de caractères';
   }

   code = code2;

   // exec and eval are forbidden anyway
   if(/(^|\W)exec\((\W|$)/.exec(code)) {
      return 'exec';
   }
   if(/(^|\W)eval\((\W|$)/.exec(code)) {
      return 'eval';
   }

   if(forbidden.length <= 0) { return false; }

   // Scan for each forbidden keyword
   for(var i=0; i<forbidden.length; i++) {
      if(forbidden[i] == 'list_brackets') {
         // Special pattern for lists
         var re = /[\[\]]/;
         if(re.exec(code)) {
            // Forbidden keyword found
            return 'crochets [ ]'; // TODO :: i18n ?
         }
      } else if(forbidden[i] == 'dict_brackets') {
         // Special pattern for lists
         var re = /[\{\}]/;
         if(re.exec(code)) {
            // Forbidden keyword found
            return 'accolades { }'; // TODO :: i18n ?
         }
      } else if(forbidden[i] == 'var_assign') {
         // Special pattern for lists
         var re = /[^=!<>]=[^=!<>]/;
         if(re.exec(code)) {
            // Forbidden keyword found
            return '= (assignation de variable)'; // TODO :: i18n ?
         }
      } else if(forbidden[i] != 'strings') {
         var re = new RegExp('(^|\\W)'+forbidden[i]+'(\\W|$)');
         if(re.exec(code)) {
            // Forbidden keyword found
            return forbidden[i];
         }
      }
   }

   // No forbidden keyword found
   return false;
}

function pythonFindLimited(code, limitedUses, blockToCode) {
   if(!code || !limitedUses) { return false; }
   var limitedPointers = {};
   var usesCount = {};
   for(var i=0; i < limitedUses.length; i++) {
      var curLimit = limitedUses[i];
      var pythonKeys = [];
      for(var b=0; b<curLimit.blocks.length; b++) {
         var blockName = curLimit.blocks[b];
         if(blockToCode[blockName]) {
            if(pythonKeys.indexOf(blockToCode[blockName]) >= 0) { continue; }
            pythonKeys.push(blockToCode[blockName]);
         }
         for(var categoryName in pythonForbiddenBlocks) {
            var targetKeys = pythonForbiddenBlocks[categoryName][blockName];
            if(!targetKeys) { continue; }
            for(var j=0; j < targetKeys.length; j++) {
               var pyKey = pythonForbiddenBlocks[categoryName][blockName][j];
               if(pythonKeys.indexOf(pyKey) >= 0) { continue; }
               pythonKeys.push(pyKey);
            }
         }
      }

      for(var j=0; j < pythonKeys.length; j++) {
          var pyKey = pythonKeys[j];
          if(!limitedPointers[pyKey]) {
              limitedPointers[pyKey] = [];
          }
          limitedPointers[pyKey].push(i);
      }
   }

   for(var pyKey in limitedPointers) {
      // Keys to ignore
      if(pyKey == 'else') {
         continue;
      }
      // Special keys
      if(pyKey == 'list_brackets') {
         var re = /[\[\]]/g;
      } else if(pyKey == 'dict_brackets') {
         var re = /[\{\}]/g;
      } else if(pyKey == 'math_number') {
         var re = /\W\d+(\.\d*)?/g;
      } else {
         // Check for assign statements
         var re = new RegExp('=\\W*'+pyKey+'([^(]|$)');
         if(re.exec(code)) {
            return {type: 'assign', name: pyKey};
         }

         var re = new RegExp('(^|\\W)'+pyKey+'(\\W|$)', 'g');
      }
      var count = (code.match(re) || []).length;

      for(var i = 0; i < limitedPointers[pyKey].length; i++) {
         var pointer = limitedPointers[pyKey][i];
         if(!usesCount[pointer]) { usesCount[pointer] = 0; }
         usesCount[pointer] += count;
         if(usesCount[pointer] > limitedUses[pointer].nbUses) {
            // TODO :: i18n ?
            if(pyKey == 'list_brackets') {
               var name = 'crochets [ ]';
            } else if(pyKey == 'dict_brackets') {
               var name = 'accolades { }';
            } else if(pyKey == 'math_number') {
               var name = 'nombres';
            } else {
               var name = pyKey;
            }
            return {type: 'uses', name: name};
         }
      }
   }

   return false;
}

(function(){function o(n){var i=e;n&&(e[n]||(e[n]={}),i=e[n]);if(!i.define||!i.define.packaged)t.original=i.define,i.define=t,i.define.packaged=!0;if(!i.require||!i.require.packaged)r.original=i.require,i.require=r,i.require.packaged=!0}var ACE_NAMESPACE = "ace",e=function(){return this}();!e&&typeof window!="undefined"&&(e=window);if(!ACE_NAMESPACE&&typeof requirejs!="undefined")return;var t=function(e,n,r){if(typeof e!="string"){t.original?t.original.apply(this,arguments):(console.error("dropping module because define wasn't a string."),console.trace());return}arguments.length==2&&(r=n),t.modules[e]||(t.payloads[e]=r,t.modules[e]=null)};t.modules={},t.payloads={};var n=function(e,t,n){if(typeof t=="string"){var i=s(e,t);if(i!=undefined)return n&&n(),i}else if(Object.prototype.toString.call(t)==="[object Array]"){var o=[];for(var u=0,a=t.length;u<a;++u){var f=s(e,t[u]);if(f==undefined&&r.original)return;o.push(f)}return n&&n.apply(null,o)||!0}},r=function(e,t){var i=n("",e,t);return i==undefined&&r.original?r.original.apply(this,arguments):i},i=function(e,t){if(t.indexOf("!")!==-1){var n=t.split("!");return i(e,n[0])+"!"+i(e,n[1])}if(t.charAt(0)=="."){var r=e.split("/").slice(0,-1).join("/");t=r+"/"+t;while(t.indexOf(".")!==-1&&s!=t){var s=t;t=t.replace(/\/\.\//,"/").replace(/[^\/]+\/\.\.\//,"")}}return t},s=function(e,r){r=i(e,r);var s=t.modules[r];if(!s){s=t.payloads[r];if(typeof s=="function"){var o={},u={id:r,uri:"",exports:o,packaged:!0},a=function(e,t){return n(r,e,t)},f=s(a,o,u);o=f||u.exports,t.modules[r]=o,delete t.payloads[r]}s=t.modules[r]=o||s}return s};o(ACE_NAMESPACE)})(),ace.define("ace/lib/regexp",["require","exports","module"],function(e,t,n){"use strict";function o(e){return(e.global?"g":"")+(e.ignoreCase?"i":"")+(e.multiline?"m":"")+(e.extended?"x":"")+(e.sticky?"y":"")}function u(e,t,n){if(Array.prototype.indexOf)return e.indexOf(t,n);for(var r=n||0;r<e.length;r++)if(e[r]===t)return r;return-1}var r={exec:RegExp.prototype.exec,test:RegExp.prototype.test,match:String.prototype.match,replace:String.prototype.replace,split:String.prototype.split},i=r.exec.call(/()??/,"")[1]===undefined,s=function(){var e=/^/g;return r.test.call(e,""),!e.lastIndex}();if(s&&i)return;RegExp.prototype.exec=function(e){var t=r.exec.apply(this,arguments),n,a;if(typeof e=="string"&&t){!i&&t.length>1&&u(t,"")>-1&&(a=RegExp(this.source,r.replace.call(o(this),"g","")),r.replace.call(e.slice(t.index),a,function(){for(var e=1;e<arguments.length-2;e++)arguments[e]===undefined&&(t[e]=undefined)}));if(this._xregexp&&this._xregexp.captureNames)for(var f=1;f<t.length;f++)n=this._xregexp.captureNames[f-1],n&&(t[n]=t[f]);!s&&this.global&&!t[0].length&&this.lastIndex>t.index&&this.lastIndex--}return t},s||(RegExp.prototype.test=function(e){var t=r.exec.call(this,e);return t&&this.global&&!t[0].length&&this.lastIndex>t.index&&this.lastIndex--,!!t})}),ace.define("ace/lib/es5-shim",["require","exports","module"],function(e,t,n){function r(){}function w(e){try{return Object.defineProperty(e,"sentinel",{}),"sentinel"in e}catch(t){}}function H(e){return e=+e,e!==e?e=0:e!==0&&e!==1/0&&e!==-1/0&&(e=(e>0||-1)*Math.floor(Math.abs(e))),e}function B(e){var t=typeof e;return e===null||t==="undefined"||t==="boolean"||t==="number"||t==="string"}function j(e){var t,n,r;if(B(e))return e;n=e.valueOf;if(typeof n=="function"){t=n.call(e);if(B(t))return t}r=e.toString;if(typeof r=="function"){t=r.call(e);if(B(t))return t}throw new TypeError}Function.prototype.bind||(Function.prototype.bind=function(t){var n=this;if(typeof n!="function")throw new TypeError("Function.prototype.bind called on incompatible "+n);var i=u.call(arguments,1),s=function(){if(this instanceof s){var e=n.apply(this,i.concat(u.call(arguments)));return Object(e)===e?e:this}return n.apply(t,i.concat(u.call(arguments)))};return n.prototype&&(r.prototype=n.prototype,s.prototype=new r,r.prototype=null),s});var i=Function.prototype.call,s=Array.prototype,o=Object.prototype,u=s.slice,a=i.bind(o.toString),f=i.bind(o.hasOwnProperty),l,c,h,p,d;if(d=f(o,"__defineGetter__"))l=i.bind(o.__defineGetter__),c=i.bind(o.__defineSetter__),h=i.bind(o.__lookupGetter__),p=i.bind(o.__lookupSetter__);if([1,2].splice(0).length!=2)if(!function(){function e(e){var t=new Array(e+2);return t[0]=t[1]=0,t}var t=[],n;t.splice.apply(t,e(20)),t.splice.apply(t,e(26)),n=t.length,t.splice(5,0,"XXX"),n+1==t.length;if(n+1==t.length)return!0}())Array.prototype.splice=function(e,t){var n=this.length;e>0?e>n&&(e=n):e==void 0?e=0:e<0&&(e=Math.max(n+e,0)),e+t<n||(t=n-e);var r=this.slice(e,e+t),i=u.call(arguments,2),s=i.length;if(e===n)s&&this.push.apply(this,i);else{var o=Math.min(t,n-e),a=e+o,f=a+s-o,l=n-a,c=n-o;if(f<a)for(var h=0;h<l;++h)this[f+h]=this[a+h];else if(f>a)for(h=l;h--;)this[f+h]=this[a+h];if(s&&e===c)this.length=c,this.push.apply(this,i);else{this.length=c+s;for(h=0;h<s;++h)this[e+h]=i[h]}}return r};else{var v=Array.prototype.splice;Array.prototype.splice=function(e,t){return arguments.length?v.apply(this,[e===void 0?0:e,t===void 0?this.length-e:t].concat(u.call(arguments,2))):[]}}Array.isArray||(Array.isArray=function(t){return a(t)=="[object Array]"});var m=Object("a"),g=m[0]!="a"||!(0 in m);Array.prototype.forEach||(Array.prototype.forEach=function(t){var n=F(this),r=g&&a(this)=="[object String]"?this.split(""):n,i=arguments[1],s=-1,o=r.length>>>0;if(a(t)!="[object Function]")throw new TypeError;while(++s<o)s in r&&t.call(i,r[s],s,n)}),Array.prototype.map||(Array.prototype.map=function(t){var n=F(this),r=g&&a(this)=="[object String]"?this.split(""):n,i=r.length>>>0,s=Array(i),o=arguments[1];if(a(t)!="[object Function]")throw new TypeError(t+" is not a function");for(var u=0;u<i;u++)u in r&&(s[u]=t.call(o,r[u],u,n));return s}),Array.prototype.filter||(Array.prototype.filter=function(t){var n=F(this),r=g&&a(this)=="[object String]"?this.split(""):n,i=r.length>>>0,s=[],o,u=arguments[1];if(a(t)!="[object Function]")throw new TypeError(t+" is not a function");for(var f=0;f<i;f++)f in r&&(o=r[f],t.call(u,o,f,n)&&s.push(o));return s}),Array.prototype.every||(Array.prototype.every=function(t){var n=F(this),r=g&&a(this)=="[object String]"?this.split(""):n,i=r.length>>>0,s=arguments[1];if(a(t)!="[object Function]")throw new TypeError(t+" is not a function");for(var o=0;o<i;o++)if(o in r&&!t.call(s,r[o],o,n))return!1;return!0}),Array.prototype.some||(Array.prototype.some=function(t){var n=F(this),r=g&&a(this)=="[object String]"?this.split(""):n,i=r.length>>>0,s=arguments[1];if(a(t)!="[object Function]")throw new TypeError(t+" is not a function");for(var o=0;o<i;o++)if(o in r&&t.call(s,r[o],o,n))return!0;return!1}),Array.prototype.reduce||(Array.prototype.reduce=function(t){var n=F(this),r=g&&a(this)=="[object String]"?this.split(""):n,i=r.length>>>0;if(a(t)!="[object Function]")throw new TypeError(t+" is not a function");if(!i&&arguments.length==1)throw new TypeError("reduce of empty array with no initial value");var s=0,o;if(arguments.length>=2)o=arguments[1];else do{if(s in r){o=r[s++];break}if(++s>=i)throw new TypeError("reduce of empty array with no initial value")}while(!0);for(;s<i;s++)s in r&&(o=t.call(void 0,o,r[s],s,n));return o}),Array.prototype.reduceRight||(Array.prototype.reduceRight=function(t){var n=F(this),r=g&&a(this)=="[object String]"?this.split(""):n,i=r.length>>>0;if(a(t)!="[object Function]")throw new TypeError(t+" is not a function");if(!i&&arguments.length==1)throw new TypeError("reduceRight of empty array with no initial value");var s,o=i-1;if(arguments.length>=2)s=arguments[1];else do{if(o in r){s=r[o--];break}if(--o<0)throw new TypeError("reduceRight of empty array with no initial value")}while(!0);do o in this&&(s=t.call(void 0,s,r[o],o,n));while(o--);return s});if(!Array.prototype.indexOf||[0,1].indexOf(1,2)!=-1)Array.prototype.indexOf=function(t){var n=g&&a(this)=="[object String]"?this.split(""):F(this),r=n.length>>>0;if(!r)return-1;var i=0;arguments.length>1&&(i=H(arguments[1])),i=i>=0?i:Math.max(0,r+i);for(;i<r;i++)if(i in n&&n[i]===t)return i;return-1};if(!Array.prototype.lastIndexOf||[0,1].lastIndexOf(0,-3)!=-1)Array.prototype.lastIndexOf=function(t){var n=g&&a(this)=="[object String]"?this.split(""):F(this),r=n.length>>>0;if(!r)return-1;var i=r-1;arguments.length>1&&(i=Math.min(i,H(arguments[1]))),i=i>=0?i:r-Math.abs(i);for(;i>=0;i--)if(i in n&&t===n[i])return i;return-1};Object.getPrototypeOf||(Object.getPrototypeOf=function(t){return t.__proto__||(t.constructor?t.constructor.prototype:o)});if(!Object.getOwnPropertyDescriptor){var y="Object.getOwnPropertyDescriptor called on a non-object: ";Object.getOwnPropertyDescriptor=function(t,n){if(typeof t!="object"&&typeof t!="function"||t===null)throw new TypeError(y+t);if(!f(t,n))return;var r,i,s;r={enumerable:!0,configurable:!0};if(d){var u=t.__proto__;t.__proto__=o;var i=h(t,n),s=p(t,n);t.__proto__=u;if(i||s)return i&&(r.get=i),s&&(r.set=s),r}return r.value=t[n],r}}Object.getOwnPropertyNames||(Object.getOwnPropertyNames=function(t){return Object.keys(t)});if(!Object.create){var b;Object.prototype.__proto__===null?b=function(){return{__proto__:null}}:b=function(){var e={};for(var t in e)e[t]=null;return e.constructor=e.hasOwnProperty=e.propertyIsEnumerable=e.isPrototypeOf=e.toLocaleString=e.toString=e.valueOf=e.__proto__=null,e},Object.create=function(t,n){var r;if(t===null)r=b();else{if(typeof t!="object")throw new TypeError("typeof prototype["+typeof t+"] != 'object'");var i=function(){};i.prototype=t,r=new i,r.__proto__=t}return n!==void 0&&Object.defineProperties(r,n),r}}if(Object.defineProperty){var E=w({}),S=typeof document=="undefined"||w(document.createElement("div"));if(!E||!S)var x=Object.defineProperty}if(!Object.defineProperty||x){var T="Property description must be an object: ",N="Object.defineProperty called on non-object: ",C="getters & setters can not be defined on this javascript engine";Object.defineProperty=function(t,n,r){if(typeof t!="object"&&typeof t!="function"||t===null)throw new TypeError(N+t);if(typeof r!="object"&&typeof r!="function"||r===null)throw new TypeError(T+r);if(x)try{return x.call(Object,t,n,r)}catch(i){}if(f(r,"value"))if(d&&(h(t,n)||p(t,n))){var s=t.__proto__;t.__proto__=o,delete t[n],t[n]=r.value,t.__proto__=s}else t[n]=r.value;else{if(!d)throw new TypeError(C);f(r,"get")&&l(t,n,r.get),f(r,"set")&&c(t,n,r.set)}return t}}Object.defineProperties||(Object.defineProperties=function(t,n){for(var r in n)f(n,r)&&Object.defineProperty(t,r,n[r]);return t}),Object.seal||(Object.seal=function(t){return t}),Object.freeze||(Object.freeze=function(t){return t});try{Object.freeze(function(){})}catch(k){Object.freeze=function(t){return function(n){return typeof n=="function"?n:t(n)}}(Object.freeze)}Object.preventExtensions||(Object.preventExtensions=function(t){return t}),Object.isSealed||(Object.isSealed=function(t){return!1}),Object.isFrozen||(Object.isFrozen=function(t){return!1}),Object.isExtensible||(Object.isExtensible=function(t){if(Object(t)===t)throw new TypeError;var n="";while(f(t,n))n+="?";t[n]=!0;var r=f(t,n);return delete t[n],r});if(!Object.keys){var L=!0,A=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],O=A.length;for(var M in{toString:null})L=!1;Object.keys=function I(e){if(typeof e!="object"&&typeof e!="function"||e===null)throw new TypeError("Object.keys called on a non-object");var I=[];for(var t in e)f(e,t)&&I.push(t);if(L)for(var n=0,r=O;n<r;n++){var i=A[n];f(e,i)&&I.push(i)}return I}}Date.now||(Date.now=function(){return(new Date).getTime()});var _="	\n\x0b\f\r \u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029\ufeff";if(!String.prototype.trim||_.trim()){_="["+_+"]";var D=new RegExp("^"+_+_+"*"),P=new RegExp(_+_+"*$");String.prototype.trim=function(){return String(this).replace(D,"").replace(P,"")}}var F=function(e){if(e==null)throw new TypeError("can't convert "+e+" to object");return Object(e)}}),ace.define("ace/lib/fixoldbrowsers",["require","exports","module","ace/lib/regexp","ace/lib/es5-shim"],function(e,t,n){"use strict";e("./regexp"),e("./es5-shim"),typeof Element!="undefined"&&!Element.prototype.remove&&Object.defineProperty(Element.prototype,"remove",{enumerable:!1,writable:!0,configurable:!0,value:function(){this.parentNode&&this.parentNode.removeChild(this)}})}),ace.define("ace/lib/useragent",["require","exports","module"],function(e,t,n){"use strict";t.OS={LINUX:"LINUX",MAC:"MAC",WINDOWS:"WINDOWS"},t.getOS=function(){return t.isMac?t.OS.MAC:t.isLinux?t.OS.LINUX:t.OS.WINDOWS};if(typeof navigator!="object")return;var r=(navigator.platform.match(/mac|win|linux/i)||["other"])[0].toLowerCase(),i=navigator.userAgent;t.isWin=r=="win",t.isMac=r=="mac",t.isLinux=r=="linux",t.isIE=navigator.appName=="Microsoft Internet Explorer"||navigator.appName.indexOf("MSAppHost")>=0?parseFloat((i.match(/(?:MSIE |Trident\/[0-9]+[\.0-9]+;.*rv:)([0-9]+[\.0-9]+)/)||[])[1]):parseFloat((i.match(/(?:Trident\/[0-9]+[\.0-9]+;.*rv:)([0-9]+[\.0-9]+)/)||[])[1]),t.isOldIE=t.isIE&&t.isIE<9,t.isGecko=t.isMozilla=i.match(/ Gecko\/\d+/),t.isOpera=window.opera&&Object.prototype.toString.call(window.opera)=="[object Opera]",t.isWebKit=parseFloat(i.split("WebKit/")[1])||undefined,t.isChrome=parseFloat(i.split(" Chrome/")[1])||undefined,t.isEdge=parseFloat(i.split(" Edge/")[1])||undefined,t.isAIR=i.indexOf("AdobeAIR")>=0,t.isIPad=i.indexOf("iPad")>=0,t.isAndroid=i.indexOf("Android")>=0,t.isChromeOS=i.indexOf(" CrOS ")>=0,t.isIOS=/iPad|iPhone|iPod/.test(i)&&!window.MSStream,t.isIOS&&(t.isMac=!0),t.isMobile=t.isIPad||t.isAndroid}),ace.define("ace/lib/dom",["require","exports","module","ace/lib/useragent"],function(e,t,n){"use strict";var r=e("./useragent"),i="http://www.w3.org/1999/xhtml";t.buildDom=function o(e,t,n){if(typeof e=="string"&&e){var r=document.createTextNode(e);return t&&t.appendChild(r),r}if(!Array.isArray(e))return e;if(typeof e[0]!="string"||!e[0]){var i=[];for(var s=0;s<e.length;s++){var u=o(e[s],t,n);u&&i.push(u)}return i}var a=document.createElement(e[0]),f=e[1],l=1;f&&typeof f=="object"&&!Array.isArray(f)&&(l=2);for(var s=l;s<e.length;s++)o(e[s],a,n);return l==2&&Object.keys(f).forEach(function(e){var t=f[e];e==="class"?a.className=Array.isArray(t)?t.join(" "):t:typeof t=="function"||e=="value"?a[e]=t:e==="ref"?n&&(n[t]=a):t!=null&&a.setAttribute(e,t)}),t&&t.appendChild(a),a},t.getDocumentHead=function(e){return e||(e=document),e.head||e.getElementsByTagName("head")[0]||e.documentElement},t.createElement=function(e,t){return document.createElementNS?document.createElementNS(t||i,e):document.createElement(e)},t.removeChildren=function(e){e.innerHTML=""},t.createTextNode=function(e,t){var n=t?t.ownerDocument:document;return n.createTextNode(e)},t.createFragment=function(e){var t=e?e.ownerDocument:document;return t.createDocumentFragment()},t.hasCssClass=function(e,t){var n=(e.className+"").split(/\s+/g);return n.indexOf(t)!==-1},t.addCssClass=function(e,n){t.hasCssClass(e,n)||(e.className+=" "+n)},t.removeCssClass=function(e,t){var n=e.className.split(/\s+/g);for(;;){var r=n.indexOf(t);if(r==-1)break;n.splice(r,1)}e.className=n.join(" ")},t.toggleCssClass=function(e,t){var n=e.className.split(/\s+/g),r=!0;for(;;){var i=n.indexOf(t);if(i==-1)break;r=!1,n.splice(i,1)}return r&&n.push(t),e.className=n.join(" "),r},t.setCssClass=function(e,n,r){r?t.addCssClass(e,n):t.removeCssClass(e,n)},t.hasCssString=function(e,t){var n=0,r;t=t||document;if(r=t.querySelectorAll("style"))while(n<r.length)if(r[n++].id===e)return!0},t.importCssString=function(n,r,i){var s=i;if(!i||!i.getRootNode)s=document;else{s=i.getRootNode();if(!s||s==i)s=document}var o=s.ownerDocument||s;if(r&&t.hasCssString(r,s))return null;r&&(n+="\n/*# sourceURL=ace/css/"+r+" */");var u=t.createElement("style");u.appendChild(o.createTextNode(n)),r&&(u.id=r),s==o&&(s=t.getDocumentHead(o)),s.insertBefore(u,s.firstChild)},t.importCssStylsheet=function(e,n){t.buildDom(["link",{rel:"stylesheet",href:e}],t.getDocumentHead(n))},t.scrollbarWidth=function(e){var n=t.createElement("ace_inner");n.style.width="100%",n.style.minWidth="0px",n.style.height="200px",n.style.display="block";var r=t.createElement("ace_outer"),i=r.style;i.position="absolute",i.left="-10000px",i.overflow="hidden",i.width="200px",i.minWidth="0px",i.height="150px",i.display="block",r.appendChild(n);var s=e.documentElement;s.appendChild(r);var o=n.offsetWidth;i.overflow="scroll";var u=n.offsetWidth;return o==u&&(u=r.clientWidth),s.removeChild(r),o-u},typeof document=="undefined"&&(t.importCssString=function(){}),t.computedStyle=function(e,t){return window.getComputedStyle(e,"")||{}},t.setStyle=function(e,t,n){e[t]!==n&&(e[t]=n)},t.HAS_CSS_ANIMATION=!1,t.HAS_CSS_TRANSFORMS=!1,t.HI_DPI=r.isWin?typeof window!="undefined"&&window.devicePixelRatio>=1.5:!0;if(typeof document!="undefined"){var s=document.createElement("div");t.HI_DPI&&s.style.transform!==undefined&&(t.HAS_CSS_TRANSFORMS=!0),!r.isEdge&&typeof s.style.animationName!="undefined"&&(t.HAS_CSS_ANIMATION=!0),s=null}t.HAS_CSS_TRANSFORMS?t.translate=function(e,t,n){e.style.transform="translate("+Math.round(t)+"px, "+Math.round(n)+"px)"}:t.translate=function(e,t,n){e.style.top=Math.round(n)+"px",e.style.left=Math.round(t)+"px"}}),ace.define("ace/lib/oop",["require","exports","module"],function(e,t,n){"use strict";t.inherits=function(e,t){e.super_=t,e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}})},t.mixin=function(e,t){for(var n in t)e[n]=t[n];return e},t.implement=function(e,n){t.mixin(e,n)}}),ace.define("ace/lib/keys",["require","exports","module","ace/lib/oop"],function(e,t,n){"use strict";var r=e("./oop"),i=function(){var e={MODIFIER_KEYS:{16:"Shift",17:"Ctrl",18:"Alt",224:"Meta"},KEY_MODS:{ctrl:1,alt:2,option:2,shift:4,"super":8,meta:8,command:8,cmd:8},FUNCTION_KEYS:{8:"Backspace",9:"Tab",13:"Return",19:"Pause",27:"Esc",32:"Space",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"Left",38:"Up",39:"Right",40:"Down",44:"Print",45:"Insert",46:"Delete",96:"Numpad0",97:"Numpad1",98:"Numpad2",99:"Numpad3",100:"Numpad4",101:"Numpad5",102:"Numpad6",103:"Numpad7",104:"Numpad8",105:"Numpad9","-13":"NumpadEnter",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"Numlock",145:"Scrolllock"},PRINTABLE_KEYS:{32:" ",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",59:";",61:"=",65:"a",66:"b",67:"c",68:"d",69:"e",70:"f",71:"g",72:"h",73:"i",74:"j",75:"k",76:"l",77:"m",78:"n",79:"o",80:"p",81:"q",82:"r",83:"s",84:"t",85:"u",86:"v",87:"w",88:"x",89:"y",90:"z",107:"+",109:"-",110:".",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'",111:"/",106:"*"}},t,n;for(n in e.FUNCTION_KEYS)t=e.FUNCTION_KEYS[n].toLowerCase(),e[t]=parseInt(n,10);for(n in e.PRINTABLE_KEYS)t=e.PRINTABLE_KEYS[n].toLowerCase(),e[t]=parseInt(n,10);return r.mixin(e,e.MODIFIER_KEYS),r.mixin(e,e.PRINTABLE_KEYS),r.mixin(e,e.FUNCTION_KEYS),e.enter=e["return"],e.escape=e.esc,e.del=e["delete"],e[173]="-",function(){var t=["cmd","ctrl","alt","shift"];for(var n=Math.pow(2,t.length);n--;)e.KEY_MODS[n]=t.filter(function(t){return n&e.KEY_MODS[t]}).join("-")+"-"}(),e.KEY_MODS[0]="",e.KEY_MODS[-1]="input-",e}();r.mixin(t,i),t.keyCodeToString=function(e){var t=i[e];return typeof t!="string"&&(t=String.fromCharCode(e)),t.toLowerCase()}}),ace.define("ace/lib/event",["require","exports","module","ace/lib/keys","ace/lib/useragent"],function(e,t,n){"use strict";function a(e,t,n){var a=u(t);if(!i.isMac&&s){t.getModifierState&&(t.getModifierState("OS")||t.getModifierState("Win"))&&(a|=8);if(s.altGr){if((3&a)==3)return;s.altGr=0}if(n===18||n===17){var f="location"in t?t.location:t.keyLocation;if(n===17&&f===1)s[n]==1&&(o=t.timeStamp);else if(n===18&&a===3&&f===2){var l=t.timeStamp-o;l<50&&(s.altGr=!0)}}}n in r.MODIFIER_KEYS&&(n=-1),a&8&&n>=91&&n<=93&&(n=-1);if(!a&&n===13){var f="location"in t?t.location:t.keyLocation;if(f===3){e(t,a,-n);if(t.defaultPrevented)return}}if(i.isChromeOS&&a&8){e(t,a,n);if(t.defaultPrevented)return;a&=-9}return!!a||n in r.FUNCTION_KEYS||n in r.PRINTABLE_KEYS?e(t,a,n):!1}function f(){s=Object.create(null)}var r=e("./keys"),i=e("./useragent"),s=null,o=0;t.addListener=function(e,t,n){if(e.addEventListener)return e.addEventListener(t,n,!1);if(e.attachEvent){var r=function(){n.call(e,window.event)};n._wrapper=r,e.attachEvent("on"+t,r)}},t.removeListener=function(e,t,n){if(e.removeEventListener)return e.removeEventListener(t,n,!1);e.detachEvent&&e.detachEvent("on"+t,n._wrapper||n)},t.stopEvent=function(e){return t.stopPropagation(e),t.preventDefault(e),!1},t.stopPropagation=function(e){e.stopPropagation?e.stopPropagation():e.cancelBubble=!0},t.preventDefault=function(e){e.preventDefault?e.preventDefault():e.returnValue=!1},t.getButton=function(e){return e.type=="dblclick"?0:e.type=="contextmenu"||i.isMac&&e.ctrlKey&&!e.altKey&&!e.shiftKey?2:e.preventDefault?e.button:{1:0,2:2,4:1}[e.button]},t.capture=function(e,n,r){function i(e){n&&n(e),r&&r(e),t.removeListener(document,"mousemove",n,!0),t.removeListener(document,"mouseup",i,!0),t.removeListener(document,"dragstart",i,!0)}return t.addListener(document,"mousemove",n,!0),t.addListener(document,"mouseup",i,!0),t.addListener(document,"dragstart",i,!0),i},t.addTouchMoveListener=function(e,n){var r,i;t.addListener(e,"touchstart",function(e){var t=e.touches,n=t[0];r=n.clientX,i=n.clientY}),t.addListener(e,"touchmove",function(e){var t=e.touches;if(t.length>1)return;var s=t[0];e.wheelX=r-s.clientX,e.wheelY=i-s.clientY,r=s.clientX,i=s.clientY,n(e)})},t.addMouseWheelListener=function(e,n){"onmousewheel"in e?t.addListener(e,"mousewheel",function(e){var t=8;e.wheelDeltaX!==undefined?(e.wheelX=-e.wheelDeltaX/t,e.wheelY=-e.wheelDeltaY/t):(e.wheelX=0,e.wheelY=-e.wheelDelta/t),n(e)}):"onwheel"in e?t.addListener(e,"wheel",function(e){var t=.35;switch(e.deltaMode){case e.DOM_DELTA_PIXEL:e.wheelX=e.deltaX*t||0,e.wheelY=e.deltaY*t||0;break;case e.DOM_DELTA_LINE:case e.DOM_DELTA_PAGE:e.wheelX=(e.deltaX||0)*5,e.wheelY=(e.deltaY||0)*5}n(e)}):t.addListener(e,"DOMMouseScroll",function(e){e.axis&&e.axis==e.HORIZONTAL_AXIS?(e.wheelX=(e.detail||0)*5,e.wheelY=0):(e.wheelX=0,e.wheelY=(e.detail||0)*5),n(e)})},t.addMultiMouseDownListener=function(e,n,r,s){function c(e){t.getButton(e)!==0?o=0:e.detail>1?(o++,o>4&&(o=1)):o=1;if(i.isIE){var c=Math.abs(e.clientX-u)>5||Math.abs(e.clientY-a)>5;if(!f||c)o=1;f&&clearTimeout(f),f=setTimeout(function(){f=null},n[o-1]||600),o==1&&(u=e.clientX,a=e.clientY)}e._clicks=o,r[s]("mousedown",e);if(o>4)o=0;else if(o>1)return r[s](l[o],e)}function h(e){o=2,f&&clearTimeout(f),f=setTimeout(function(){f=null},n[o-1]||600),r[s]("mousedown",e),r[s](l[o],e)}var o=0,u,a,f,l={2:"dblclick",3:"tripleclick",4:"quadclick"};Array.isArray(e)||(e=[e]),e.forEach(function(e){t.addListener(e,"mousedown",c),i.isOldIE&&t.addListener(e,"dblclick",h)})};var u=!i.isMac||!i.isOpera||"KeyboardEvent"in window?function(e){return 0|(e.ctrlKey?1:0)|(e.altKey?2:0)|(e.shiftKey?4:0)|(e.metaKey?8:0)}:function(e){return 0|(e.metaKey?1:0)|(e.altKey?2:0)|(e.shiftKey?4:0)|(e.ctrlKey?8:0)};t.getModifierString=function(e){return r.KEY_MODS[u(e)]},t.addCommandKeyListener=function(e,n){var r=t.addListener;if(i.isOldGecko||i.isOpera&&!("KeyboardEvent"in window)){var o=null;r(e,"keydown",function(e){o=e.keyCode}),r(e,"keypress",function(e){return a(n,e,o)})}else{var u=null;r(e,"keydown",function(e){s[e.keyCode]=(s[e.keyCode]||0)+1;var t=a(n,e,e.keyCode);return u=e.defaultPrevented,t}),r(e,"keypress",function(e){u&&(e.ctrlKey||e.altKey||e.shiftKey||e.metaKey)&&(t.stopEvent(e),u=null)}),r(e,"keyup",function(e){s[e.keyCode]=null}),s||(f(),r(window,"focus",f))}};if(typeof window=="object"&&window.postMessage&&!i.isOldIE){var l=1;t.nextTick=function(e,n){n=n||window;var r="zero-timeout-message-"+l++,i=function(s){s.data==r&&(t.stopPropagation(s),t.removeListener(n,"message",i),e())};t.addListener(n,"message",i),n.postMessage(r,"*")}}t.$idleBlocked=!1,t.onIdle=function(e,n){return setTimeout(function r(){t.$idleBlocked?setTimeout(r,100):e()},n)},t.$idleBlockId=null,t.blockIdle=function(e){t.$idleBlockId&&clearTimeout(t.$idleBlockId),t.$idleBlocked=!0,t.$idleBlockId=setTimeout(function(){t.$idleBlocked=!1},e||100)},t.nextFrame=typeof window=="object"&&(window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame),t.nextFrame?t.nextFrame=t.nextFrame.bind(window):t.nextFrame=function(e){setTimeout(e,17)}}),ace.define("ace/range",["require","exports","module"],function(e,t,n){"use strict";var r=function(e,t){return e.row-t.row||e.column-t.column},i=function(e,t,n,r){this.start={row:e,column:t},this.end={row:n,column:r}};(function(){this.isEqual=function(e){return this.start.row===e.start.row&&this.end.row===e.end.row&&this.start.column===e.start.column&&this.end.column===e.end.column},this.toString=function(){return"Range: ["+this.start.row+"/"+this.start.column+"] -> ["+this.end.row+"/"+this.end.column+"]"},this.contains=function(e,t){return this.compare(e,t)==0},this.compareRange=function(e){var t,n=e.end,r=e.start;return t=this.compare(n.row,n.column),t==1?(t=this.compare(r.row,r.column),t==1?2:t==0?1:0):t==-1?-2:(t=this.compare(r.row,r.column),t==-1?-1:t==1?42:0)},this.comparePoint=function(e){return this.compare(e.row,e.column)},this.containsRange=function(e){return this.comparePoint(e.start)==0&&this.comparePoint(e.end)==0},this.intersects=function(e){var t=this.compareRange(e);return t==-1||t==0||t==1},this.isEnd=function(e,t){return this.end.row==e&&this.end.column==t},this.isStart=function(e,t){return this.start.row==e&&this.start.column==t},this.setStart=function(e,t){typeof e=="object"?(this.start.column=e.column,this.start.row=e.row):(this.start.row=e,this.start.column=t)},this.setEnd=function(e,t){typeof e=="object"?(this.end.column=e.column,this.end.row=e.row):(this.end.row=e,this.end.column=t)},this.inside=function(e,t){return this.compare(e,t)==0?this.isEnd(e,t)||this.isStart(e,t)?!1:!0:!1},this.insideStart=function(e,t){return this.compare(e,t)==0?this.isEnd(e,t)?!1:!0:!1},this.insideEnd=function(e,t){return this.compare(e,t)==0?this.isStart(e,t)?!1:!0:!1},this.compare=function(e,t){return!this.isMultiLine()&&e===this.start.row?t<this.start.column?-1:t>this.end.column?1:0:e<this.start.row?-1:e>this.end.row?1:this.start.row===e?t>=this.start.column?0:-1:this.end.row===e?t<=this.end.column?0:1:0},this.compareStart=function(e,t){return this.start.row==e&&this.start.column==t?-1:this.compare(e,t)},this.compareEnd=function(e,t){return this.end.row==e&&this.end.column==t?1:this.compare(e,t)},this.compareInside=function(e,t){return this.end.row==e&&this.end.column==t?1:this.start.row==e&&this.start.column==t?-1:this.compare(e,t)},this.clipRows=function(e,t){if(this.end.row>t)var n={row:t+1,column:0};else if(this.end.row<e)var n={row:e,column:0};if(this.start.row>t)var r={row:t+1,column:0};else if(this.start.row<e)var r={row:e,column:0};return i.fromPoints(r||this.start,n||this.end)},this.extend=function(e,t){var n=this.compare(e,t);if(n==0)return this;if(n==-1)var r={row:e,column:t};else var s={row:e,column:t};return i.fromPoints(r||this.start,s||this.end)},this.isEmpty=function(){return this.start.row===this.end.row&&this.start.column===this.end.column},this.isMultiLine=function(){return this.start.row!==this.end.row},this.clone=function(){return i.fromPoints(this.start,this.end)},this.collapseRows=function(){return this.end.column==0?new i(this.start.row,0,Math.max(this.start.row,this.end.row-1),0):new i(this.start.row,0,this.end.row,0)},this.toScreenRange=function(e){var t=e.documentToScreenPosition(this.start),n=e.documentToScreenPosition(this.end);return new i(t.row,t.column,n.row,n.column)},this.moveBy=function(e,t){this.start.row+=e,this.start.column+=t,this.end.row+=e,this.end.column+=t}}).call(i.prototype),i.fromPoints=function(e,t){return new i(e.row,e.column,t.row,t.column)},i.comparePoints=r,i.comparePoints=function(e,t){return e.row-t.row||e.column-t.column},t.Range=i}),ace.define("ace/lib/lang",["require","exports","module"],function(e,t,n){"use strict";t.last=function(e){return e[e.length-1]},t.stringReverse=function(e){return e.split("").reverse().join("")},t.stringRepeat=function(e,t){var n="";while(t>0){t&1&&(n+=e);if(t>>=1)e+=e}return n};var r=/^\s\s*/,i=/\s\s*$/;t.stringTrimLeft=function(e){return e.replace(r,"")},t.stringTrimRight=function(e){return e.replace(i,"")},t.copyObject=function(e){var t={};for(var n in e)t[n]=e[n];return t},t.copyArray=function(e){var t=[];for(var n=0,r=e.length;n<r;n++)e[n]&&typeof e[n]=="object"?t[n]=this.copyObject(e[n]):t[n]=e[n];return t},t.deepCopy=function s(e){if(typeof e!="object"||!e)return e;var t;if(Array.isArray(e)){t=[];for(var n=0;n<e.length;n++)t[n]=s(e[n]);return t}if(Object.prototype.toString.call(e)!=="[object Object]")return e;t={};for(var n in e)t[n]=s(e[n]);return t},t.arrayToMap=function(e){var t={};for(var n=0;n<e.length;n++)t[e[n]]=1;return t},t.createMap=function(e){var t=Object.create(null);for(var n in e)t[n]=e[n];return t},t.arrayRemove=function(e,t){for(var n=0;n<=e.length;n++)t===e[n]&&e.splice(n,1)},t.escapeRegExp=function(e){return e.replace(/([.*+?^${}()|[\]\/\\])/g,"\\$1")},t.escapeHTML=function(e){return(""+e).replace(/&/g,"&#38;").replace(/"/g,"&#34;").replace(/'/g,"&#39;").replace(/</g,"&#60;")},t.getMatchOffsets=function(e,t){var n=[];return e.replace(t,function(e){n.push({offset:arguments[arguments.length-2],length:e.length})}),n},t.deferredCall=function(e){var t=null,n=function(){t=null,e()},r=function(e){return r.cancel(),t=setTimeout(n,e||0),r};return r.schedule=r,r.call=function(){return this.cancel(),e(),r},r.cancel=function(){return clearTimeout(t),t=null,r},r.isPending=function(){return t},r},t.delayedCall=function(e,t){var n=null,r=function(){n=null,e()},i=function(e){n==null&&(n=setTimeout(r,e||t))};return i.delay=function(e){n&&clearTimeout(n),n=setTimeout(r,e||t)},i.schedule=i,i.call=function(){this.cancel(),e()},i.cancel=function(){n&&clearTimeout(n),n=null},i.isPending=function(){return n},i}}),ace.define("ace/keyboard/textinput",["require","exports","module","ace/lib/event","ace/lib/useragent","ace/lib/dom","ace/lib/lang","ace/lib/keys"],function(e,t,n){"use strict";var r=e("../lib/event"),i=e("../lib/useragent"),s=e("../lib/dom"),o=e("../lib/lang"),u=i.isChrome<18,a=i.isIE,f=i.isChrome>63,l=400,c=e("../lib/keys"),h=c.KEY_MODS,p=i.isIOS,d=p?/\s/:/\n/,v=function(e,t){function W(){x=!0,n.blur(),n.focus(),x=!1}function V(e){e.keyCode==27&&n.value.length<n.selectionStart&&(g||(T=n.value),N=C=-1,A()),X()}function J(){clearTimeout($),$=setTimeout(function(){b&&(n.style.cssText=b,b=""),t.renderer.$keepTextAreaAtCursor==null&&(t.renderer.$keepTextAreaAtCursor=!0,t.renderer.$moveTextAreaToCursor())},0)}function Q(e,t,n){var r=null,i=!1;n.addEventListener("keydown",function(e){r&&clearTimeout(r),i=!0},!0),n.addEventListener("keyup",function(e){r=setTimeout(function(){i=!1},100)},!0);var s=function(e){if(document.activeElement!==n)return;if(i||g)return;if(v)return;var r=n.selectionStart,s=n.selectionEnd,o=null,u=0;console.log(r,s);if(r==0)o=c.up;else if(r==1)o=c.home;else if(s>C&&T[s]=="\n")o=c.end;else if(r<N&&T[r-1]==" ")o=c.left,u=h.option;else if(r<N||r==N&&C!=N&&r==s)o=c.left;else if(s>C&&T.slice(0,s).split("\n").length>2)o=c.down;else if(s>C&&T[s-1]==" ")o=c.right,u=h.option;else if(s>C||s==C&&C!=N&&r==s)o=c.right;r!==s&&(u|=h.shift),o&&(t.onCommandKey(null,u,o),N=r,C=s,A(""))};document.addEventListener("selectionchange",s),t.on("destroy",function(){document.removeEventListener("selectionchange",s)})}var n=s.createElement("textarea");n.className="ace_text-input",n.setAttribute("wrap","off"),n.setAttribute("autocorrect","off"),n.setAttribute("autocapitalize","off"),n.setAttribute("spellcheck",!1),n.style.opacity="0",e.insertBefore(n,e.firstChild);var v=!1,m=!1,g=!1,y=!1,b="",w=!0,E=!1;i.isMobile||(n.style.fontSize="1px");var S=!1,x=!1,T="",N=0,C=0;try{var k=document.activeElement===n}catch(L){}r.addListener(n,"blur",function(e){if(x)return;t.onBlur(e),k=!1}),r.addListener(n,"focus",function(e){if(x)return;k=!0;if(i.isEdge)try{if(!document.hasFocus())return}catch(e){}t.onFocus(e),i.isEdge?setTimeout(A):A()}),this.$focusScroll=!1,this.focus=function(){if(b||f||this.$focusScroll=="browser")return n.focus({preventScroll:!0});var e=n.style.top;n.style.position="fixed",n.style.top="0px";try{var t=n.getBoundingClientRect().top!=0}catch(r){return}var i=[];if(t){var s=n.parentElement;while(s&&s.nodeType==1)i.push(s),s.setAttribute("ace_nocontext",!0),!s.parentElement&&s.getRootNode?s=s.getRootNode().host:s=s.parentElement}n.focus({preventScroll:!0}),t&&i.forEach(function(e){e.removeAttribute("ace_nocontext")}),setTimeout(function(){n.style.position="",n.style.top=="0px"&&(n.style.top=e)},0)},this.blur=function(){n.blur()},this.isFocused=function(){return k},t.on("beforeEndOperation",function(){if(t.curOp&&t.curOp.command.name=="insertstring")return;g&&(T=n.value="",z()),A()});var A=p?function(e){if(!k||v&&!e)return;e||(e="");var r="\n ab"+e+"cde fg\n";r!=n.value&&(n.value=T=r);var i=4,s=4+(e.length||(t.selection.isEmpty()?0:1));(N!=i||C!=s)&&n.setSelectionRange(i,s),N=i,C=s}:function(){if(g||y)return;if(!k&&!D)return;g=!0;var e=t.selection,r=e.getRange(),i=e.cursor.row,s=r.start.column,o=r.end.column,u=t.session.getLine(i);if(r.start.row!=i){var a=t.session.getLine(i-1);s=r.start.row<i-1?0:s,o+=a.length+1,u=a+"\n"+u}else if(r.end.row!=i){var f=t.session.getLine(i+1);o=r.end.row>i+1?f.length:o,o+=u.length+1,u=u+"\n"+f}u.length>l&&(s<l&&o<l?u=u.slice(0,l):(u="\n",s=0,o=1));var c=u+"\n\n";c!=T&&(n.value=T=c,N=C=c.length),D&&(N=n.selectionStart,C=n.selectionEnd);if(C!=o||N!=s||n.selectionEnd!=C)try{n.setSelectionRange(s,o),N=s,C=o}catch(h){}g=!1};k&&t.onFocus();var O=function(e){return e.selectionStart===0&&e.selectionEnd>=T.length&&e.value===T&&T&&e.selectionEnd!==C},M=function(e){if(g)return;v?v=!1:O(n)&&(t.selectAll(),A())},_=null;this.setInputHandler=function(e){_=e},this.getInputHandler=function(){return _};var D=!1,P=function(e,r){D&&(D=!1);if(m)return A(),e&&t.onPaste(e),m=!1,"";var i=n.selectionStart,s=n.selectionEnd,o=N,u=T.length-C,a=e,f=e.length-i,l=e.length-s,c=0;while(o>0&&T[c]==e[c])c++,o--;a=a.slice(c),c=1;while(u>0&&T.length-c>N-1&&T[T.length-c]==e[e.length-c])c++,u--;return f-=c-1,l-=c-1,a=a.slice(0,a.length-c+1),!r&&f==a.length&&!o&&!u&&!l?"":(y=!0,a&&!o&&!u&&!f&&!l||S?t.onTextInput(a):t.onTextInput(a,{extendLeft:o,extendRight:u,restoreStart:f,restoreEnd:l}),y=!1,T=e,N=i,C=s,a)},H=function(e){if(g)return U();var t=n.value,r=P(t,!0);(t.length>l+100||d.test(r))&&A()},B=function(e,t,n){var r=e.clipboardData||window.clipboardData;if(!r||u)return;var i=a||n?"Text":"text/plain";try{return t?r.setData(i,t)!==!1:r.getData(i)}catch(e){if(!n)return B(e,t,!0)}},j=function(e,i){var s=t.getCopyText();if(!s)return r.preventDefault(e);B(e,s)?(p&&(A(s),v=s,setTimeout(function(){v=!1},10)),i?t.onCut():t.onCopy(),r.preventDefault(e)):(v=!0,n.value=s,n.select(),setTimeout(function(){v=!1,A(),i?t.onCut():t.onCopy()}))},F=function(e){j(e,!0)},I=function(e){j(e,!1)},q=function(e){var s=B(e);typeof s=="string"?(s&&t.onPaste(s,e),i.isIE&&setTimeout(A),r.preventDefault(e)):(n.value="",m=!0)};r.addCommandKeyListener(n,t.onCommandKey.bind(t)),r.addListener(n,"select",M),r.addListener(n,"input",H),r.addListener(n,"cut",F),r.addListener(n,"copy",I),r.addListener(n,"paste",q),(!("oncut"in n)||!("oncopy"in n)||!("onpaste"in n))&&r.addListener(e,"keydown",function(e){if(i.isMac&&!e.metaKey||!e.ctrlKey)return;switch(e.keyCode){case 67:I(e);break;case 86:q(e);break;case 88:F(e)}});var R=function(e){if(g||!t.onCompositionStart||t.$readOnly)return;g={};if(S)return;setTimeout(U,0),t.on("mousedown",W);var r=t.getSelectionRange();r.end.row=r.start.row,r.end.column=r.start.column,g.markerRange=r,g.selectionStart=N,t.onCompositionStart(g),g.useTextareaForIME?(n.value="",T="",N=0,C=0):(n.msGetInputContext&&(g.context=n.msGetInputContext()),n.getInputContext&&(g.context=n.getInputContext()))},U=function(){if(!g||!t.onCompositionUpdate||t.$readOnly)return;if(S)return W();if(g.useTextareaForIME)t.onCompositionUpdate(n.value);else{var e=n.value;P(e),g.markerRange&&(g.context&&(g.markerRange.start.column=g.selectionStart=g.context.compositionStartOffset),g.markerRange.end.column=g.markerRange.start.column+C-g.selectionStart)}},z=function(e){if(!t.onCompositionEnd||t.$readOnly)return;g=!1,t.onCompositionEnd(),t.off("mousedown",W),e&&H()},X=o.delayedCall(U,50).schedule.bind(null,null);r.addListener(n,"compositionstart",R),r.addListener(n,"compositionupdate",U),r.addListener(n,"keyup",V),r.addListener(n,"keydown",X),r.addListener(n,"compositionend",z),this.getElement=function(){return n},this.setCommandMode=function(e){S=e,n.readOnly=!1},this.setReadOnly=function(e){S||(n.readOnly=e)},this.setCopyWithEmptySelection=function(e){E=e},this.onContextMenu=function(e){D=!0,A(),t._emit("nativecontextmenu",{target:t,domEvent:e}),this.moveToMouse(e,!0)},this.moveToMouse=function(e,o){b||(b=n.style.cssText),n.style.cssText=(o?"z-index:100000;":"")+(i.isIE?"opacity:0.1;":"")+"text-indent: -"+(N+C)*t.renderer.characterWidth*.5+"px;";var u=t.container.getBoundingClientRect(),a=s.computedStyle(t.container),f=u.top+(parseInt(a.borderTopWidth)||0),l=u.left+(parseInt(u.borderLeftWidth)||0),c=u.bottom-f-n.clientHeight-2,h=function(e){n.style.left=e.clientX-l-2+"px",n.style.top=Math.min(e.clientY-f-2,c)+"px"};h(e);if(e.type!="mousedown")return;t.renderer.$keepTextAreaAtCursor&&(t.renderer.$keepTextAreaAtCursor=null),clearTimeout($),i.isWin&&r.capture(t.container,h,J)},this.onContextMenuClose=J;var $,K=function(e){t.textInput.onContextMenu(e),J()};r.addListener(n,"mouseup",K),r.addListener(n,"mousedown",function(e){e.preventDefault(),J()}),r.addListener(t.renderer.scroller,"contextmenu",K),r.addListener(n,"contextmenu",K),p&&Q(e,t,n)};t.TextInput=v}),ace.define("ace/mouse/default_handlers",["require","exports","module","ace/lib/useragent"],function(e,t,n){"use strict";function o(e){e.$clickSelection=null;var t=e.editor;t.setDefaultHandler("mousedown",this.onMouseDown.bind(e)),t.setDefaultHandler("dblclick",this.onDoubleClick.bind(e)),t.setDefaultHandler("tripleclick",this.onTripleClick.bind(e)),t.setDefaultHandler("quadclick",this.onQuadClick.bind(e)),t.setDefaultHandler("mousewheel",this.onMouseWheel.bind(e)),t.setDefaultHandler("touchmove",this.onTouchMove.bind(e));var n=["select","startSelect","selectEnd","selectAllEnd","selectByWordsEnd","selectByLinesEnd","dragWait","dragWaitEnd","focusWait"];n.forEach(function(t){e[t]=this[t]},this),e.selectByLines=this.extendSelectionBy.bind(e,"getLineRange"),e.selectByWords=this.extendSelectionBy.bind(e,"getWordRange")}function u(e,t,n,r){return Math.sqrt(Math.pow(n-e,2)+Math.pow(r-t,2))}function a(e,t){if(e.start.row==e.end.row)var n=2*t.column-e.start.column-e.end.column;else if(e.start.row==e.end.row-1&&!e.start.column&&!e.end.column)var n=t.column-4;else var n=2*t.row-e.start.row-e.end.row;return n<0?{cursor:e.start,anchor:e.end}:{cursor:e.end,anchor:e.start}}var r=e("../lib/useragent"),i=0,s=550;(function(){this.onMouseDown=function(e){var t=e.inSelection(),n=e.getDocumentPosition();this.mousedownEvent=e;var i=this.editor,s=e.getButton();if(s!==0){var o=i.getSelectionRange(),u=o.isEmpty();(u||s==1)&&i.selection.moveToPosition(n),s==2&&(i.textInput.onContextMenu(e.domEvent),r.isMozilla||e.preventDefault());return}this.mousedownEvent.time=Date.now();if(t&&!i.isFocused()){i.focus();if(this.$focusTimeout&&!this.$clickSelection&&!i.inMultiSelectMode){this.setState("focusWait"),this.captureMouse(e);return}}return this.captureMouse(e),this.startSelect(n,e.domEvent._clicks>1),e.preventDefault()},this.startSelect=function(e,t){e=e||this.editor.renderer.screenToTextCoordinates(this.x,this.y);var n=this.editor;if(!this.mousedownEvent)return;this.mousedownEvent.getShiftKey()?n.selection.selectToPosition(e):t||n.selection.moveToPosition(e),t||this.select(),n.renderer.scroller.setCapture&&n.renderer.scroller.setCapture(),n.setStyle("ace_selecting"),this.setState("select")},this.select=function(){var e,t=this.editor,n=t.renderer.screenToTextCoordinates(this.x,this.y);if(this.$clickSelection){var r=this.$clickSelection.comparePoint(n);if(r==-1)e=this.$clickSelection.end;else if(r==1)e=this.$clickSelection.start;else{var i=a(this.$clickSelection,n);n=i.cursor,e=i.anchor}t.selection.setSelectionAnchor(e.row,e.column)}t.selection.selectToPosition(n),t.renderer.scrollCursorIntoView()},this.extendSelectionBy=function(e){var t,n=this.editor,r=n.renderer.screenToTextCoordinates(this.x,this.y),i=n.selection[e](r.row,r.column);if(this.$clickSelection){var s=this.$clickSelection.comparePoint(i.start),o=this.$clickSelection.comparePoint(i.end);if(s==-1&&o<=0){t=this.$clickSelection.end;if(i.end.row!=r.row||i.end.column!=r.column)r=i.start}else if(o==1&&s>=0){t=this.$clickSelection.start;if(i.start.row!=r.row||i.start.column!=r.column)r=i.end}else if(s==-1&&o==1)r=i.end,t=i.start;else{var u=a(this.$clickSelection,r);r=u.cursor,t=u.anchor}n.selection.setSelectionAnchor(t.row,t.column)}n.selection.selectToPosition(r),n.renderer.scrollCursorIntoView()},this.selectEnd=this.selectAllEnd=this.selectByWordsEnd=this.selectByLinesEnd=function(){this.$clickSelection=null,this.editor.unsetStyle("ace_selecting"),this.editor.renderer.scroller.releaseCapture&&this.editor.renderer.scroller.releaseCapture()},this.focusWait=function(){var e=u(this.mousedownEvent.x,this.mousedownEvent.y,this.x,this.y),t=Date.now();(e>i||t-this.mousedownEvent.time>this.$focusTimeout)&&this.startSelect(this.mousedownEvent.getDocumentPosition())},this.onDoubleClick=function(e){var t=e.getDocumentPosition(),n=this.editor,r=n.session,i=r.getBracketRange(t);i?(i.isEmpty()&&(i.start.column--,i.end.column++),this.setState("select")):(i=n.selection.getWordRange(t.row,t.column),this.setState("selectByWords")),this.$clickSelection=i,this.select()},this.onTripleClick=function(e){var t=e.getDocumentPosition(),n=this.editor;this.setState("selectByLines");var r=n.getSelectionRange();r.isMultiLine()&&r.contains(t.row,t.column)?(this.$clickSelection=n.selection.getLineRange(r.start.row),this.$clickSelection.end=n.selection.getLineRange(r.end.row).end):this.$clickSelection=n.selection.getLineRange(t.row),this.select()},this.onQuadClick=function(e){var t=this.editor;t.selectAll(),this.$clickSelection=t.getSelectionRange(),this.setState("selectAll")},this.onMouseWheel=function(e){if(e.getAccelKey())return;e.getShiftKey()&&e.wheelY&&!e.wheelX&&(e.wheelX=e.wheelY,e.wheelY=0);var t=this.editor;this.$lastScroll||(this.$lastScroll={t:0,vx:0,vy:0,allowed:0});var n=this.$lastScroll,r=e.domEvent.timeStamp,i=r-n.t,o=i?e.wheelX/i:n.vx,u=i?e.wheelY/i:n.vy;i<s&&(o=(o+n.vx)/2,u=(u+n.vy)/2);var a=Math.abs(o/u),f=!1;a>=1&&t.renderer.isScrollableBy(e.wheelX*e.speed,0)&&(f=!0),a<=1&&t.renderer.isScrollableBy(0,e.wheelY*e.speed)&&(f=!0);if(f)n.allowed=r;else if(r-n.allowed<s){var l=Math.abs(o)<=1.5*Math.abs(n.vx)&&Math.abs(u)<=1.5*Math.abs(n.vy);l?(f=!0,n.allowed=r):n.allowed=0}n.t=r,n.vx=o,n.vy=u;if(f)return t.renderer.scrollBy(e.wheelX*e.speed,e.wheelY*e.speed),e.stop()},this.onTouchMove=function(e){this.editor._emit("mousewheel",e)}}).call(o.prototype),t.DefaultHandlers=o}),ace.define("ace/tooltip",["require","exports","module","ace/lib/oop","ace/lib/dom"],function(e,t,n){"use strict";function s(e){this.isOpen=!1,this.$element=null,this.$parentNode=e}var r=e("./lib/oop"),i=e("./lib/dom");(function(){this.$init=function(){return this.$element=i.createElement("div"),this.$element.className="ace_tooltip",this.$element.style.display="none",this.$parentNode.appendChild(this.$element),this.$element},this.getElement=function(){return this.$element||this.$init()},this.setText=function(e){this.getElement().textContent=e},this.setHtml=function(e){this.getElement().innerHTML=e},this.setPosition=function(e,t){this.getElement().style.left=e+"px",this.getElement().style.top=t+"px"},this.setClassName=function(e){i.addCssClass(this.getElement(),e)},this.show=function(e,t,n){e!=null&&this.setText(e),t!=null&&n!=null&&this.setPosition(t,n),this.isOpen||(this.getElement().style.display="block",this.isOpen=!0)},this.hide=function(){this.isOpen&&(this.getElement().style.display="none",this.isOpen=!1)},this.getHeight=function(){return this.getElement().offsetHeight},this.getWidth=function(){return this.getElement().offsetWidth},this.destroy=function(){this.isOpen=!1,this.$element&&this.$element.parentNode&&this.$element.parentNode.removeChild(this.$element)}}).call(s.prototype),t.Tooltip=s}),ace.define("ace/mouse/default_gutter_handler",["require","exports","module","ace/lib/dom","ace/lib/oop","ace/lib/event","ace/tooltip"],function(e,t,n){"use strict";function u(e){function l(){var r=u.getDocumentPosition().row,s=n.$annotations[r];if(!s)return c();var o=t.session.getLength();if(r==o){var a=t.renderer.pixelToScreenCoordinates(0,u.y).row,l=u.$pos;if(a>t.session.documentToScreenRow(l.row,l.column))return c()}if(f==s)return;f=s.text.join("<br/>"),i.setHtml(f),i.show(),t._signal("showGutterTooltip",i),t.on("mousewheel",c);if(e.$tooltipFollowsMouse)h(u);else{var p=u.domEvent.target,d=p.getBoundingClientRect(),v=i.getElement().style;v.left=d.right+"px",v.top=d.bottom+"px"}}function c(){o&&(o=clearTimeout(o)),f&&(i.hide(),f=null,t._signal("hideGutterTooltip",i),t.removeEventListener("mousewheel",c))}function h(e){i.setPosition(e.x,e.y)}var t=e.editor,n=t.renderer.$gutterLayer,i=new a(t.container);e.editor.setDefaultHandler("guttermousedown",function(r){if(!t.isFocused()||r.getButton()!=0)return;var i=n.getRegion(r);if(i=="foldWidgets")return;var s=r.getDocumentPosition().row,o=t.session.selection;if(r.getShiftKey())o.selectTo(s,0);else{if(r.domEvent.detail==2)return t.selectAll(),r.preventDefault();e.$clickSelection=t.selection.getLineRange(s)}return e.setState("selectByLines"),e.captureMouse(r),r.preventDefault()});var o,u,f;e.editor.setDefaultHandler("guttermousemove",function(t){var n=t.domEvent.target||t.domEvent.srcElement;if(r.hasCssClass(n,"ace_fold-widget"))return c();f&&e.$tooltipFollowsMouse&&h(t),u=t;if(o)return;o=setTimeout(function(){o=null,u&&!e.isMousePressed?l():c()},50)}),s.addListener(t.renderer.$gutter,"mouseout",function(e){u=null;if(!f||o)return;o=setTimeout(function(){o=null,c()},50)}),t.on("changeSession",c)}function a(e){o.call(this,e)}var r=e("../lib/dom"),i=e("../lib/oop"),s=e("../lib/event"),o=e("../tooltip").Tooltip;i.inherits(a,o),function(){this.setPosition=function(e,t){var n=window.innerWidth||document.documentElement.clientWidth,r=window.innerHeight||document.documentElement.clientHeight,i=this.getWidth(),s=this.getHeight();e+=15,t+=15,e+i>n&&(e-=e+i-n),t+s>r&&(t-=20+s),o.prototype.setPosition.call(this,e,t)}}.call(a.prototype),t.GutterHandler=u}),ace.define("ace/mouse/mouse_event",["require","exports","module","ace/lib/event","ace/lib/useragent"],function(e,t,n){"use strict";var r=e("../lib/event"),i=e("../lib/useragent"),s=t.MouseEvent=function(e,t){this.domEvent=e,this.editor=t,this.x=this.clientX=e.clientX,this.y=this.clientY=e.clientY,this.$pos=null,this.$inSelection=null,this.propagationStopped=!1,this.defaultPrevented=!1};(function(){this.stopPropagation=function(){r.stopPropagation(this.domEvent),this.propagationStopped=!0},this.preventDefault=function(){r.preventDefault(this.domEvent),this.defaultPrevented=!0},this.stop=function(){this.stopPropagation(),this.preventDefault()},this.getDocumentPosition=function(){return this.$pos?this.$pos:(this.$pos=this.editor.renderer.screenToTextCoordinates(this.clientX,this.clientY),this.$pos)},this.inSelection=function(){if(this.$inSelection!==null)return this.$inSelection;var e=this.editor,t=e.getSelectionRange();if(t.isEmpty())this.$inSelection=!1;else{var n=this.getDocumentPosition();this.$inSelection=t.contains(n.row,n.column)}return this.$inSelection},this.getButton=function(){return r.getButton(this.domEvent)},this.getShiftKey=function(){return this.domEvent.shiftKey},this.getAccelKey=i.isMac?function(){return this.domEvent.metaKey}:function(){return this.domEvent.ctrlKey}}).call(s.prototype)}),ace.define("ace/mouse/dragdrop_handler",["require","exports","module","ace/lib/dom","ace/lib/event","ace/lib/useragent"],function(e,t,n){"use strict";function f(e){function T(e,n){var r=Date.now(),i=!n||e.row!=n.row,s=!n||e.column!=n.column;if(!S||i||s)t.moveCursorToPosition(e),S=r,x={x:p,y:d};else{var o=l(x.x,x.y,p,d);o>a?S=null:r-S>=u&&(t.renderer.scrollCursorIntoView(),S=null)}}function N(e,n){var r=Date.now(),i=t.renderer.layerConfig.lineHeight,s=t.renderer.layerConfig.characterWidth,u=t.renderer.scroller.getBoundingClientRect(),a={x:{left:p-u.left,right:u.right-p},y:{top:d-u.top,bottom:u.bottom-d}},f=Math.min(a.x.left,a.x.right),l=Math.min(a.y.top,a.y.bottom),c={row:e.row,column:e.column};f/s<=2&&(c.column+=a.x.left<a.x.right?-3:2),l/i<=1&&(c.row+=a.y.top<a.y.bottom?-1:1);var h=e.row!=c.row,v=e.column!=c.column,m=!n||e.row!=n.row;h||v&&!m?E?r-E>=o&&t.renderer.scrollCursorIntoView(c):E=r:E=null}function C(){var e=g;g=t.renderer.screenToTextCoordinates(p,d),T(g,e),N(g,e)}function k(){m=t.selection.toOrientedRange(),h=t.session.addMarker(m,"ace_selection",t.getSelectionStyle()),t.clearSelection(),t.isFocused()&&t.renderer.$cursorLayer.setBlinking(!1),clearInterval(v),C(),v=setInterval(C,20),y=0,i.addListener(document,"mousemove",O)}function L(){clearInterval(v),t.session.removeMarker(h),h=null,t.selection.fromOrientedRange(m),t.isFocused()&&!w&&t.renderer.$cursorLayer.setBlinking(!t.getReadOnly()),m=null,g=null,y=0,E=null,S=null,i.removeListener(document,"mousemove",O)}function O(){A==null&&(A=setTimeout(function(){A!=null&&h&&L()},20))}function M(e){var t=e.types;return!t||Array.prototype.some.call(t,function(e){return e=="text/plain"||e=="Text"})}function _(e){var t=["copy","copymove","all","uninitialized"],n=["move","copymove","linkmove","all","uninitialized"],r=s.isMac?e.altKey:e.ctrlKey,i="uninitialized";try{i=e.dataTransfer.effectAllowed.toLowerCase()}catch(e){}var o="none";return r&&t.indexOf(i)>=0?o="copy":n.indexOf(i)>=0?o="move":t.indexOf(i)>=0&&(o="copy"),o}var t=e.editor,n=r.createElement("img");n.src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",s.isOpera&&(n.style.cssText="width:1px;height:1px;position:fixed;top:0;left:0;z-index:2147483647;opacity:0;");var f=["dragWait","dragWaitEnd","startDrag","dragReadyEnd","onMouseDrag"];f.forEach(function(t){e[t]=this[t]},this),t.addEventListener("mousedown",this.onMouseDown.bind(e));var c=t.container,h,p,d,v,m,g,y=0,b,w,E,S,x;this.onDragStart=function(e){if(this.cancelDrag||!c.draggable){var r=this;return setTimeout(function(){r.startSelect(),r.captureMouse(e)},0),e.preventDefault()}m=t.getSelectionRange();var i=e.dataTransfer;i.effectAllowed=t.getReadOnly()?"copy":"copyMove",s.isOpera&&(t.container.appendChild(n),n.scrollTop=0),i.setDragImage&&i.setDragImage(n,0,0),s.isOpera&&t.container.removeChild(n),i.clearData(),i.setData("Text",t.session.getTextRange()),w=!0,this.setState("drag")},this.onDragEnd=function(e){c.draggable=!1,w=!1,this.setState(null);if(!t.getReadOnly()){var n=e.dataTransfer.dropEffect;!b&&n=="move"&&t.session.remove(t.getSelectionRange()),t.renderer.$cursorLayer.setBlinking(!0)}this.editor.unsetStyle("ace_dragging"),this.editor.renderer.setCursorStyle("")},this.onDragEnter=function(e){if(t.getReadOnly()||!M(e.dataTransfer))return;return p=e.clientX,d=e.clientY,h||k(),y++,e.dataTransfer.dropEffect=b=_(e),i.preventDefault(e)},this.onDragOver=function(e){if(t.getReadOnly()||!M(e.dataTransfer))return;return p=e.clientX,d=e.clientY,h||(k(),y++),A!==null&&(A=null),e.dataTransfer.dropEffect=b=_(e),i.preventDefault(e)},this.onDragLeave=function(e){y--;if(y<=0&&h)return L(),b=null,i.preventDefault(e)},this.onDrop=function(e){if(!g)return;var n=e.dataTransfer;if(w)switch(b){case"move":m.contains(g.row,g.column)?m={start:g,end:g}:m=t.moveText(m,g);break;case"copy":m=t.moveText(m,g,!0)}else{var r=n.getData("Text");m={start:g,end:t.session.insert(g,r)},t.focus(),b=null}return L(),i.preventDefault(e)},i.addListener(c,"dragstart",this.onDragStart.bind(e)),i.addListener(c,"dragend",this.onDragEnd.bind(e)),i.addListener(c,"dragenter",this.onDragEnter.bind(e)),i.addListener(c,"dragover",this.onDragOver.bind(e)),i.addListener(c,"dragleave",this.onDragLeave.bind(e)),i.addListener(c,"drop",this.onDrop.bind(e));var A=null}function l(e,t,n,r){return Math.sqrt(Math.pow(n-e,2)+Math.pow(r-t,2))}var r=e("../lib/dom"),i=e("../lib/event"),s=e("../lib/useragent"),o=200,u=200,a=5;(function(){this.dragWait=function(){var e=Date.now()-this.mousedownEvent.time;e>this.editor.getDragDelay()&&this.startDrag()},this.dragWaitEnd=function(){var e=this.editor.container;e.draggable=!1,this.startSelect(this.mousedownEvent.getDocumentPosition()),this.selectEnd()},this.dragReadyEnd=function(e){this.editor.renderer.$cursorLayer.setBlinking(!this.editor.getReadOnly()),this.editor.unsetStyle("ace_dragging"),this.editor.renderer.setCursorStyle(""),this.dragWaitEnd()},this.startDrag=function(){this.cancelDrag=!1;var e=this.editor,t=e.container;t.draggable=!0,e.renderer.$cursorLayer.setBlinking(!1),e.setStyle("ace_dragging");var n=s.isWin?"default":"move";e.renderer.setCursorStyle(n),this.setState("dragReady")},this.onMouseDrag=function(e){var t=this.editor.container;if(s.isIE&&this.state=="dragReady"){var n=l(this.mousedownEvent.x,this.mousedownEvent.y,this.x,this.y);n>3&&t.dragDrop()}if(this.state==="dragWait"){var n=l(this.mousedownEvent.x,this.mousedownEvent.y,this.x,this.y);n>0&&(t.draggable=!1,this.startSelect(this.mousedownEvent.getDocumentPosition()))}},this.onMouseDown=function(e){if(!this.$dragEnabled)return;this.mousedownEvent=e;var t=this.editor,n=e.inSelection(),r=e.getButton(),i=e.domEvent.detail||1;if(i===1&&r===0&&n){if(e.editor.inMultiSelectMode&&(e.getAccelKey()||e.getShiftKey()))return;this.mousedownEvent.time=Date.now();var o=e.domEvent.target||e.domEvent.srcElement;"unselectable"in o&&(o.unselectable="on");if(t.getDragDelay()){if(s.isWebKit){this.cancelDrag=!0;var u=t.container;u.draggable=!0}this.setState("dragWait")}else this.startDrag();this.captureMouse(e,this.onMouseDrag.bind(this)),e.defaultPrevented=!0}}}).call(f.prototype),t.DragdropHandler=f}),ace.define("ace/lib/net",["require","exports","module","ace/lib/dom"],function(e,t,n){"use strict";var r=e("./dom");t.get=function(e,t){var n=new XMLHttpRequest;n.open("GET",e,!0),n.onreadystatechange=function(){n.readyState===4&&t(n.responseText)},n.send(null)},t.loadScript=function(e,t){var n=r.getDocumentHead(),i=document.createElement("script");i.src=e,n.appendChild(i),i.onload=i.onreadystatechange=function(e,n){if(n||!i.readyState||i.readyState=="loaded"||i.readyState=="complete")i=i.onload=i.onreadystatechange=null,n||t()}},t.qualifyURL=function(e){var t=document.createElement("a");return t.href=e,t.href}}),ace.define("ace/lib/event_emitter",["require","exports","module"],function(e,t,n){"use strict";var r={},i=function(){this.propagationStopped=!0},s=function(){this.defaultPrevented=!0};r._emit=r._dispatchEvent=function(e,t){this._eventRegistry||(this._eventRegistry={}),this._defaultHandlers||(this._defaultHandlers={});var n=this._eventRegistry[e]||[],r=this._defaultHandlers[e];if(!n.length&&!r)return;if(typeof t!="object"||!t)t={};t.type||(t.type=e),t.stopPropagation||(t.stopPropagation=i),t.preventDefault||(t.preventDefault=s),n=n.slice();for(var o=0;o<n.length;o++){n[o](t,this);if(t.propagationStopped)break}if(r&&!t.defaultPrevented)return r(t,this)},r._signal=function(e,t){var n=(this._eventRegistry||{})[e];if(!n)return;n=n.slice();for(var r=0;r<n.length;r++)n[r](t,this)},r.once=function(e,t){var n=this;this.addEventListener(e,function r(){n.removeEventListener(e,r),t.apply(null,arguments)});if(!t)return new Promise(function(e){t=e})},r.setDefaultHandler=function(e,t){var n=this._defaultHandlers;n||(n=this._defaultHandlers={_disabled_:{}});if(n[e]){var r=n[e],i=n._disabled_[e];i||(n._disabled_[e]=i=[]),i.push(r);var s=i.indexOf(t);s!=-1&&i.splice(s,1)}n[e]=t},r.removeDefaultHandler=function(e,t){var n=this._defaultHandlers;if(!n)return;var r=n._disabled_[e];if(n[e]==t)r&&this.setDefaultHandler(e,r.pop());else if(r){var i=r.indexOf(t);i!=-1&&r.splice(i,1)}},r.on=r.addEventListener=function(e,t,n){this._eventRegistry=this._eventRegistry||{};var r=this._eventRegistry[e];return r||(r=this._eventRegistry[e]=[]),r.indexOf(t)==-1&&r[n?"unshift":"push"](t),t},r.off=r.removeListener=r.removeEventListener=function(e,t){this._eventRegistry=this._eventRegistry||{};var n=this._eventRegistry[e];if(!n)return;var r=n.indexOf(t);r!==-1&&n.splice(r,1)},r.removeAllListeners=function(e){this._eventRegistry&&(this._eventRegistry[e]=[])},t.EventEmitter=r}),ace.define("ace/lib/app_config",["require","exports","module","ace/lib/oop","ace/lib/event_emitter"],function(e,t,n){"no use strict";function o(e){typeof console!="undefined"&&console.warn&&console.warn.apply(console,arguments)}function u(e,t){var n=new Error(e);n.data=t,typeof console=="object"&&console.error&&console.error(n),setTimeout(function(){throw n})}var r=e("./oop"),i=e("./event_emitter").EventEmitter,s={setOptions:function(e){Object.keys(e).forEach(function(t){this.setOption(t,e[t])},this)},getOptions:function(e){var t={};if(!e){var n=this.$options;e=Object.keys(n).filter(function(e){return!n[e].hidden})}else Array.isArray(e)||(t=e,e=Object.keys(t));return e.forEach(function(e){t[e]=this.getOption(e)},this),t},setOption:function(e,t){if(this["$"+e]===t)return;var n=this.$options[e];if(!n)return o('misspelled option "'+e+'"');if(n.forwardTo)return this[n.forwardTo]&&this[n.forwardTo].setOption(e,t);n.handlesSet||(this["$"+e]=t),n&&n.set&&n.set.call(this,t)},getOption:function(e){var t=this.$options[e];return t?t.forwardTo?this[t.forwardTo]&&this[t.forwardTo].getOption(e):t&&t.get?t.get.call(this):this["$"+e]:o('misspelled option "'+e+'"')}},a=function(){this.$defaultOptions={}};(function(){r.implement(this,i),this.defineOptions=function(e,t,n){return e.$options||(this.$defaultOptions[t]=e.$options={}),Object.keys(n).forEach(function(t){var r=n[t];typeof r=="string"&&(r={forwardTo:r}),r.name||(r.name=t),e.$options[r.name]=r,"initialValue"in r&&(e["$"+r.name]=r.initialValue)}),r.implement(e,s),this},this.resetOptions=function(e){Object.keys(e.$options).forEach(function(t){var n=e.$options[t];"value"in n&&e.setOption(t,n.value)})},this.setDefaultValue=function(e,t,n){var r=this.$defaultOptions[e]||(this.$defaultOptions[e]={});r[t]&&(r.forwardTo?this.setDefaultValue(r.forwardTo,t,n):r[t].value=n)},this.setDefaultValues=function(e,t){Object.keys(t).forEach(function(n){this.setDefaultValue(e,n,t[n])},this)},this.warn=o,this.reportError=u}).call(a.prototype),t.AppConfig=a}),ace.define("ace/config",["require","exports","module","ace/lib/lang","ace/lib/oop","ace/lib/net","ace/lib/app_config"],function(e,t,n){"no use strict";function l(r){if(!u||!u.document)return;a.packaged=r||e.packaged||n.packaged||u.define&&define.packaged;var i={},s="",o=document.currentScript||document._currentScript,f=o&&o.ownerDocument||document,l=f.getElementsByTagName("script");for(var h=0;h<l.length;h++){var p=l[h],d=p.src||p.getAttribute("src");if(!d)continue;var v=p.attributes;for(var m=0,g=v.length;m<g;m++){var y=v[m];y.name.indexOf("data-ace-")===0&&(i[c(y.name.replace(/^data-ace-/,""))]=y.value)}var b=d.match(/^(.*)\/ace(\-\w+)?\.js(\?|$)/);b&&(s=b[1])}s&&(i.base=i.base||s,i.packaged=!0),i.basePath=i.base,i.workerPath=i.workerPath||i.base,i.modePath=i.modePath||i.base,i.themePath=i.themePath||i.base,delete i.base;for(var w in i)typeof i[w]!="undefined"&&t.set(w,i[w])}function c(e){return e.replace(/-(.)/g,function(e,t){return t.toUpperCase()})}var r=e("./lib/lang"),i=e("./lib/oop"),s=e("./lib/net"),o=e("./lib/app_config").AppConfig;n.exports=t=new o;var u=function(){return this||typeof window!="undefined"&&window}(),a={packaged:!1,workerPath:null,modePath:null,themePath:null,basePath:"",suffix:".js",$moduleUrls:{},loadWorkerFromBlob:!0};t.get=function(e){if(!a.hasOwnProperty(e))throw new Error("Unknown config key: "+e);return a[e]},t.set=function(e,t){if(!a.hasOwnProperty(e))throw new Error("Unknown config key: "+e);a[e]=t},t.all=function(){return r.copyObject(a)},t.$modes={},t.moduleUrl=function(e,t){if(a.$moduleUrls[e])return a.$moduleUrls[e];var n=e.split("/");t=t||n[n.length-2]||"";var r=t=="snippets"?"/":"-",i=n[n.length-1];if(t=="worker"&&r=="-"){var s=new RegExp("^"+t+"[\\-_]|[\\-_]"+t+"$","g");i=i.replace(s,"")}(!i||i==t)&&n.length>1&&(i=n[n.length-2]);var o=a[t+"Path"];return o==null?o=a.basePath:r=="/"&&(t=r=""),o&&o.slice(-1)!="/"&&(o+="/"),o+t+r+i+this.get("suffix")},t.setModuleUrl=function(e,t){return a.$moduleUrls[e]=t},t.$loading={},t.loadModule=function(n,r){var i,o;Array.isArray(n)&&(o=n[0],n=n[1]);try{i=e(n)}catch(u){}if(i&&!t.$loading[n])return r&&r(i);t.$loading[n]||(t.$loading[n]=[]),t.$loading[n].push(r);if(t.$loading[n].length>1)return;var a=function(){e([n],function(e){t._emit("load.module",{name:n,module:e});var r=t.$loading[n];t.$loading[n]=null,r.forEach(function(t){t&&t(e)})})};if(!t.get("packaged"))return a();s.loadScript(t.moduleUrl(n,o),a),f()};var f=function(){!a.basePath&&!a.workerPath&&!a.modePath&&!a.themePath&&!Object.keys(a.$moduleUrls).length&&(console.error("Unable to infer path to ace from script src,","use ace.config.set('basePath', 'path') to enable dynamic loading of modes and themes","or with webpack use ace/webpack-resolver"),f=function(){})};t.init=l}),ace.define("ace/mouse/mouse_handler",["require","exports","module","ace/lib/event","ace/lib/useragent","ace/mouse/default_handlers","ace/mouse/default_gutter_handler","ace/mouse/mouse_event","ace/mouse/dragdrop_handler","ace/config"],function(e,t,n){"use strict";var r=e("../lib/event"),i=e("../lib/useragent"),s=e("./default_handlers").DefaultHandlers,o=e("./default_gutter_handler").GutterHandler,u=e("./mouse_event").MouseEvent,a=e("./dragdrop_handler").DragdropHandler,f=e("../config"),l=function(e){var t=this;this.editor=e,new s(this),new o(this),new a(this);var n=function(t){var n=!document.hasFocus||!document.hasFocus()||!e.isFocused()&&document.activeElement==(e.textInput&&e.textInput.getElement());n&&window.focus(),e.focus()},u=e.renderer.getMouseEventTarget();r.addListener(u,"click",this.onMouseEvent.bind(this,"click")),r.addListener(u,"mousemove",this.onMouseMove.bind(this,"mousemove")),r.addMultiMouseDownListener([u,e.renderer.scrollBarV&&e.renderer.scrollBarV.inner,e.renderer.scrollBarH&&e.renderer.scrollBarH.inner,e.textInput&&e.textInput.getElement()].filter(Boolean),[400,300,250],this,"onMouseEvent"),r.addMouseWheelListener(e.container,this.onMouseWheel.bind(this,"mousewheel")),r.addTouchMoveListener(e.container,this.onTouchMove.bind(this,"touchmove"));var f=e.renderer.$gutter;r.addListener(f,"mousedown",this.onMouseEvent.bind(this,"guttermousedown")),r.addListener(f,"click",this.onMouseEvent.bind(this,"gutterclick")),r.addListener(f,"dblclick",this.onMouseEvent.bind(this,"gutterdblclick")),r.addListener(f,"mousemove",this.onMouseEvent.bind(this,"guttermousemove")),r.addListener(u,"mousedown",n),r.addListener(f,"mousedown",n),i.isIE&&e.renderer.scrollBarV&&(r.addListener(e.renderer.scrollBarV.element,"mousedown",n),r.addListener(e.renderer.scrollBarH.element,"mousedown",n)),e.on("mousemove",function(n){if(t.state||t.$dragDelay||!t.$dragEnabled)return;var r=e.renderer.screenToTextCoordinates(n.x,n.y),i=e.session.selection.getRange(),s=e.renderer;!i.isEmpty()&&i.insideStart(r.row,r.column)?s.setCursorStyle("default"):s.setCursorStyle("")})};(function(){this.onMouseEvent=function(e,t){this.editor._emit(e,new u(t,this.editor))},this.onMouseMove=function(e,t){var n=this.editor._eventRegistry&&this.editor._eventRegistry.mousemove;if(!n||!n.length)return;this.editor._emit(e,new u(t,this.editor))},this.onMouseWheel=function(e,t){var n=new u(t,this.editor);n.speed=this.$scrollSpeed*2,n.wheelX=t.wheelX,n.wheelY=t.wheelY,this.editor._emit(e,n)},this.onTouchMove=function(e,t){var n=new u(t,this.editor);n.speed=1,n.wheelX=t.wheelX,n.wheelY=t.wheelY,this.editor._emit(e,n)},this.setState=function(e){this.state=e},this.captureMouse=function(e,t){this.x=e.x,this.y=e.y,this.isMousePressed=!0;var n=this.editor,s=this.editor.renderer;s.$keepTextAreaAtCursor&&(s.$keepTextAreaAtCursor=null);var o=this,a=function(e){if(!e)return;if(i.isWebKit&&!e.which&&o.releaseMouse)return o.releaseMouse();o.x=e.clientX,o.y=e.clientY,t&&t(e),o.mouseEvent=new u(e,o.editor),o.$mouseMoved=!0},f=function(e){n.off("beforeEndOperation",c),clearInterval(h),l(),o[o.state+"End"]&&o[o.state+"End"](e),o.state="",s.$keepTextAreaAtCursor==null&&(s.$keepTextAreaAtCursor=!0,s.$moveTextAreaToCursor()),o.isMousePressed=!1,o.$onCaptureMouseMove=o.releaseMouse=null,e&&o.onMouseEvent("mouseup",e),n.endOperation()},l=function(){o[o.state]&&o[o.state](),o.$mouseMoved=!1};if(i.isOldIE&&e.domEvent.type=="dblclick")return setTimeout(function(){f(e)});var c=function(e){if(!o.releaseMouse)return;n.curOp.command.name&&n.curOp.selectionChanged&&(o[o.state+"End"]&&o[o.state+"End"](),o.state="",o.releaseMouse())};n.on("beforeEndOperation",c),n.startOperation({command:{name:"mouse"}}),o.$onCaptureMouseMove=a,o.releaseMouse=r.capture(this.editor.container,a,f);var h=setInterval(l,20)},this.releaseMouse=null,this.cancelContextMenu=function(){var e=function(t){if(t&&t.domEvent&&t.domEvent.type!="contextmenu")return;this.editor.off("nativecontextmenu",e),t&&t.domEvent&&r.stopEvent(t.domEvent)}.bind(this);setTimeout(e,10),this.editor.on("nativecontextmenu",e)}}).call(l.prototype),f.defineOptions(l.prototype,"mouseHandler",{scrollSpeed:{initialValue:2},dragDelay:{initialValue:i.isMac?150:0},dragEnabled:{initialValue:!0},focusTimeout:{initialValue:0},tooltipFollowsMouse:{initialValue:!0}}),t.MouseHandler=l}),ace.define("ace/mouse/fold_handler",["require","exports","module","ace/lib/dom"],function(e,t,n){"use strict";function i(e){e.on("click",function(t){var n=t.getDocumentPosition(),i=e.session,s=i.getFoldAt(n.row,n.column,1);s&&(t.getAccelKey()?i.removeFold(s):i.expandFold(s),t.stop());var o=t.domEvent&&t.domEvent.target;o&&r.hasCssClass(o,"ace_inline_button")&&r.hasCssClass(o,"ace_toggle_wrap")&&(i.setOption("wrap",!0),e.renderer.scrollCursorIntoView())}),e.on("gutterclick",function(t){var n=e.renderer.$gutterLayer.getRegion(t);if(n=="foldWidgets"){var r=t.getDocumentPosition().row,i=e.session;i.foldWidgets&&i.foldWidgets[r]&&e.session.onFoldWidgetClick(r,t),e.isFocused()||e.focus(),t.stop()}}),e.on("gutterdblclick",function(t){var n=e.renderer.$gutterLayer.getRegion(t);if(n=="foldWidgets"){var r=t.getDocumentPosition().row,i=e.session,s=i.getParentFoldRangeData(r,!0),o=s.range||s.firstRange;if(o){r=o.start.row;var u=i.getFoldAt(r,i.getLine(r).length,1);u?i.removeFold(u):(i.addFold("...",o),e.renderer.scrollCursorIntoView({row:o.start.row,column:0}))}t.stop()}})}var r=e("../lib/dom");t.FoldHandler=i}),ace.define("ace/keyboard/keybinding",["require","exports","module","ace/lib/keys","ace/lib/event"],function(e,t,n){"use strict";var r=e("../lib/keys"),i=e("../lib/event"),s=function(e){this.$editor=e,this.$data={editor:e},this.$handlers=[],this.setDefaultHandler(e.commands)};(function(){this.setDefaultHandler=function(e){this.removeKeyboardHandler(this.$defaultHandler),this.$defaultHandler=e,this.addKeyboardHandler(e,0)},this.setKeyboardHandler=function(e){var t=this.$handlers;if(t[t.length-1]==e)return;while(t[t.length-1]&&t[t.length-1]!=this.$defaultHandler)this.removeKeyboardHandler(t[t.length-1]);this.addKeyboardHandler(e,1)},this.addKeyboardHandler=function(e,t){if(!e)return;typeof e=="function"&&!e.handleKeyboard&&(e.handleKeyboard=e);var n=this.$handlers.indexOf(e);n!=-1&&this.$handlers.splice(n,1),t==undefined?this.$handlers.push(e):this.$handlers.splice(t,0,e),n==-1&&e.attach&&e.attach(this.$editor)},this.removeKeyboardHandler=function(e){var t=this.$handlers.indexOf(e);return t==-1?!1:(this.$handlers.splice(t,1),e.detach&&e.detach(this.$editor),!0)},this.getKeyboardHandler=function(){return this.$handlers[this.$handlers.length-1]},this.getStatusText=function(){var e=this.$data,t=e.editor;return this.$handlers.map(function(n){return n.getStatusText&&n.getStatusText(t,e)||""}).filter(Boolean).join(" ")},this.$callKeyboardHandlers=function(e,t,n,r){var s,o=!1,u=this.$editor.commands;for(var a=this.$handlers.length;a--;){s=this.$handlers[a].handleKeyboard(this.$data,e,t,n,r);if(!s||!s.command)continue;s.command=="null"?o=!0:o=u.exec(s.command,this.$editor,s.args,r),o&&r&&e!=-1&&s.passEvent!=1&&s.command.passEvent!=1&&i.stopEvent(r);if(o)break}return!o&&e==-1&&(s={command:"insertstring"},o=u.exec("insertstring",this.$editor,t)),o&&this.$editor._signal&&this.$editor._signal("keyboardActivity",s),o},this.onCommandKey=function(e,t,n){var i=r.keyCodeToString(n);this.$callKeyboardHandlers(t,i,n,e)},this.onTextInput=function(e){this.$callKeyboardHandlers(-1,e)}}).call(s.prototype),t.KeyBinding=s}),ace.define("ace/lib/bidiutil",["require","exports","module"],function(e,t,n){"use strict";function F(e,t,n,r){var i=s?d:p,c=null,h=null,v=null,m=0,g=null,y=null,b=-1,w=null,E=null,T=[];if(!r)for(w=0,r=[];w<n;w++)r[w]=R(e[w]);o=s,u=!1,a=!1,f=!1,l=!1;for(E=0;E<n;E++){c=m,T[E]=h=q(e,r,T,E),m=i[c][h],g=m&240,m&=15,t[E]=v=i[m][5];if(g>0)if(g==16){for(w=b;w<E;w++)t[w]=1;b=-1}else b=-1;y=i[m][6];if(y)b==-1&&(b=E);else if(b>-1){for(w=b;w<E;w++)t[w]=v;b=-1}r[E]==S&&(t[E]=0),o|=v}if(l)for(w=0;w<n;w++)if(r[w]==x){t[w]=s;for(var C=w-1;C>=0;C--){if(r[C]!=N)break;t[C]=s}}}function I(e,t,n){if(o<e)return;if(e==1&&s==m&&!f){n.reverse();return}var r=n.length,i=0,u,a,l,c;while(i<r){if(t[i]>=e){u=i+1;while(u<r&&t[u]>=e)u++;for(a=i,l=u-1;a<l;a++,l--)c=n[a],n[a]=n[l],n[l]=c;i=u}i++}}function q(e,t,n,r){var i=t[r],o,c,h,p;switch(i){case g:case y:u=!1;case E:case w:return i;case b:return u?w:b;case T:return u=!0,a=!0,y;case N:return E;case C:if(r<1||r+1>=t.length||(o=n[r-1])!=b&&o!=w||(c=t[r+1])!=b&&c!=w)return E;return u&&(c=w),c==o?c:E;case k:o=r>0?n[r-1]:S;if(o==b&&r+1<t.length&&t[r+1]==b)return b;return E;case L:if(r>0&&n[r-1]==b)return b;if(u)return E;p=r+1,h=t.length;while(p<h&&t[p]==L)p++;if(p<h&&t[p]==b)return b;return E;case A:h=t.length,p=r+1;while(p<h&&t[p]==A)p++;if(p<h){var d=e[r],v=d>=1425&&d<=2303||d==64286;o=t[p];if(v&&(o==y||o==T))return y}if(r<1||(o=t[r-1])==S)return E;return n[r-1];case S:return u=!1,f=!0,s;case x:return l=!0,E;case O:case M:case D:case P:case _:u=!1;case H:return E}}function R(e){var t=e.charCodeAt(0),n=t>>8;return n==0?t>191?g:B[t]:n==5?/[\u0591-\u05f4]/.test(e)?y:g:n==6?/[\u0610-\u061a\u064b-\u065f\u06d6-\u06e4\u06e7-\u06ed]/.test(e)?A:/[\u0660-\u0669\u066b-\u066c]/.test(e)?w:t==1642?L:/[\u06f0-\u06f9]/.test(e)?b:T:n==32&&t<=8287?j[t&255]:n==254?t>=65136?T:E:E}function U(e){return e>="\u064b"&&e<="\u0655"}var r=["\u0621","\u0641"],i=["\u063a","\u064a"],s=0,o=0,u=!1,a=!1,f=!1,l=!1,c=!1,h=!1,p=[[0,3,0,1,0,0,0],[0,3,0,1,2,2,0],[0,3,0,17,2,0,1],[0,3,5,5,4,1,0],[0,3,21,21,4,0,1],[0,3,5,5,4,2,0]],d=[[2,0,1,1,0,1,0],[2,0,1,1,0,2,0],[2,0,2,1,3,2,0],[2,0,2,33,3,1,1]],v=0,m=1,g=0,y=1,b=2,w=3,E=4,S=5,x=6,T=7,N=8,C=9,k=10,L=11,A=12,O=13,M=14,_=15,D=16,P=17,H=18,B=[H,H,H,H,H,H,H,H,H,x,S,x,N,S,H,H,H,H,H,H,H,H,H,H,H,H,H,H,S,S,S,x,N,E,E,L,L,L,E,E,E,E,E,k,C,k,C,C,b,b,b,b,b,b,b,b,b,b,C,E,E,E,E,E,E,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,E,E,E,E,E,E,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,g,E,E,E,E,H,H,H,H,H,H,S,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,H,C,E,L,L,L,L,E,E,E,E,g,E,E,H,E,E,L,L,b,b,E,g,E,E,E,b,g,E,E,E,E,E],j=[N,N,N,N,N,N,N,N,N,N,N,H,H,H,g,y,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,N,S,O,M,_,D,P,C,L,L,L,L,L,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,C,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,E,N];t.L=g,t.R=y,t.EN=b,t.ON_R=3,t.AN=4,t.R_H=5,t.B=6,t.RLE=7,t.DOT="\u00b7",t.doBidiReorder=function(e,n,r){if(e.length<2)return{};var i=e.split(""),o=new Array(i.length),u=new Array(i.length),a=[];s=r?m:v,F(i,a,i.length,n);for(var f=0;f<o.length;o[f]=f,f++);I(2,a,o),I(1,a,o);for(var f=0;f<o.length-1;f++)n[f]===w?a[f]=t.AN:a[f]===y&&(n[f]>T&&n[f]<O||n[f]===E||n[f]===H)?a[f]=t.ON_R:f>0&&i[f-1]==="\u0644"&&/\u0622|\u0623|\u0625|\u0627/.test(i[f])&&(a[f-1]=a[f]=t.R_H,f++);i[i.length-1]===t.DOT&&(a[i.length-1]=t.B),i[0]==="\u202b"&&(a[0]=t.RLE);for(var f=0;f<o.length;f++)u[f]=a[o[f]];return{logicalFromVisual:o,bidiLevels:u}},t.hasBidiCharacters=function(e,t){var n=!1;for(var r=0;r<e.length;r++)t[r]=R(e.charAt(r)),!n&&(t[r]==y||t[r]==T||t[r]==w)&&(n=!0);return n},t.getVisualFromLogicalIdx=function(e,t){for(var n=0;n<t.logicalFromVisual.length;n++)if(t.logicalFromVisual[n]==e)return n;return 0}}),ace.define("ace/bidihandler",["require","exports","module","ace/lib/bidiutil","ace/lib/lang"],function(e,t,n){"use strict";var r=e("./lib/bidiutil"),i=e("./lib/lang"),s=/[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\u202B]/,o=function(e){this.session=e,this.bidiMap={},this.currentRow=null,this.bidiUtil=r,this.charWidths=[],this.EOL="\u00ac",this.showInvisibles=!0,this.isRtlDir=!1,this.$isRtl=!1,this.line="",this.wrapIndent=0,this.EOF="\u00b6",this.RLE="\u202b",this.contentWidth=0,this.fontMetrics=null,this.rtlLineOffset=0,this.wrapOffset=0,this.isMoveLeftOperation=!1,this.seenBidi=s.test(e.getValue())};(function(){this.isBidiRow=function(e,t,n){return this.seenBidi?(e!==this.currentRow&&(this.currentRow=e,this.updateRowLine(t,n),this.updateBidiMap()),this.bidiMap.bidiLevels):!1},this.onChange=function(e){this.seenBidi?this.currentRow=null:e.action=="insert"&&s.test(e.lines.join("\n"))&&(this.seenBidi=!0,this.currentRow=null)},this.getDocumentRow=function(){var e=0,t=this.session.$screenRowCache;if(t.length){var n=this.session.$getRowCacheIndex(t,this.currentRow);n>=0&&(e=this.session.$docRowCache[n])}return e},this.getSplitIndex=function(){var e=0,t=this.session.$screenRowCache;if(t.length){var n,r=this.session.$getRowCacheIndex(t,this.currentRow);while(this.currentRow-e>0){n=this.session.$getRowCacheIndex(t,this.currentRow-e-1);if(n!==r)break;r=n,e++}}else e=this.currentRow;return e},this.updateRowLine=function(e,t){e===undefined&&(e=this.getDocumentRow());var n=e===this.session.getLength()-1,s=n?this.EOF:this.EOL;this.wrapIndent=0,this.line=this.session.getLine(e),this.isRtlDir=this.$isRtl||this.line.charAt(0)===this.RLE;if(this.session.$useWrapMode){var o=this.session.$wrapData[e];o&&(t===undefined&&(t=this.getSplitIndex()),t>0&&o.length?(this.wrapIndent=o.indent,this.wrapOffset=this.wrapIndent*this.charWidths[r.L],this.line=t<o.length?this.line.substring(o[t-1],o[t]):this.line.substring(o[o.length-1])):this.line=this.line.substring(0,o[t])),t==o.length&&(this.line+=this.showInvisibles?s:r.DOT)}else this.line+=this.showInvisibles?s:r.DOT;var u=this.session,a=0,f;this.line=this.line.replace(/\t|[\u1100-\u2029, \u202F-\uFFE6]/g,function(e,t){return e==="	"||u.isFullWidth(e.charCodeAt(0))?(f=e==="	"?u.getScreenTabSize(t+a):2,a+=f-1,i.stringRepeat(r.DOT,f)):e}),this.isRtlDir&&(this.fontMetrics.$main.textContent=this.line.charAt(this.line.length-1)==r.DOT?this.line.substr(0,this.line.length-1):this.line,this.rtlLineOffset=this.contentWidth-this.fontMetrics.$main.getBoundingClientRect().width)},this.updateBidiMap=function(){var e=[];r.hasBidiCharacters(this.line,e)||this.isRtlDir?this.bidiMap=r.doBidiReorder(this.line,e,this.isRtlDir):this.bidiMap={}},this.markAsDirty=function(){this.currentRow=null},this.updateCharacterWidths=function(e){if(this.characterWidth===e.$characterSize.width)return;this.fontMetrics=e;var t=this.characterWidth=e.$characterSize.width,n=e.$measureCharWidth("\u05d4");this.charWidths[r.L]=this.charWidths[r.EN]=this.charWidths[r.ON_R]=t,this.charWidths[r.R]=this.charWidths[r.AN]=n,this.charWidths[r.R_H]=n*.45,this.charWidths[r.B]=this.charWidths[r.RLE]=0,this.currentRow=null},this.setShowInvisibles=function(e){this.showInvisibles=e,this.currentRow=null},this.setEolChar=function(e){this.EOL=e},this.setContentWidth=function(e){this.contentWidth=e},this.isRtlLine=function(e){return this.$isRtl?!0:e!=undefined?this.session.getLine(e).charAt(0)==this.RLE:this.isRtlDir},this.setRtlDirection=function(e,t){var n=e.getCursorPosition();for(var r=e.selection.getSelectionAnchor().row;r<=n.row;r++)!t&&e.session.getLine(r).charAt(0)===e.session.$bidiHandler.RLE?e.session.doc.removeInLine(r,0,1):t&&e.session.getLine(r).charAt(0)!==e.session.$bidiHandler.RLE&&e.session.doc.insert({column:0,row:r},e.session.$bidiHandler.RLE)},this.getPosLeft=function(e){e-=this.wrapIndent;var t=this.line.charAt(0)===this.RLE?1:0,n=e>t?this.session.getOverwrite()?e:e-1:t,i=r.getVisualFromLogicalIdx(n,this.bidiMap),s=this.bidiMap.bidiLevels,o=0;!this.session.getOverwrite()&&e<=t&&s[i]%2!==0&&i++;for(var u=0;u<i;u++)o+=this.charWidths[s[u]];return!this.session.getOverwrite()&&e>t&&s[i]%2===0&&(o+=this.charWidths[s[i]]),this.wrapIndent&&(o+=this.isRtlDir?-1*this.wrapOffset:this.wrapOffset),this.isRtlDir&&(o+=this.rtlLineOffset),o},this.getSelections=function(e,t){var n=this.bidiMap,r=n.bidiLevels,i,s=[],o=0,u=Math.min(e,t)-this.wrapIndent,a=Math.max(e,t)-this.wrapIndent,f=!1,l=!1,c=0;this.wrapIndent&&(o+=this.isRtlDir?-1*this.wrapOffset:this.wrapOffset);for(var h,p=0;p<r.length;p++)h=n.logicalFromVisual[p],i=r[p],f=h>=u&&h<a,f&&!l?c=o:!f&&l&&s.push({left:c,width:o-c}),o+=this.charWidths[i],l=f;f&&p===r.length&&s.push({left:c,width:o-c});if(this.isRtlDir)for(var d=0;d<s.length;d++)s[d].left+=this.rtlLineOffset;return s},this.offsetToCol=function(e){this.isRtlDir&&(e-=this.rtlLineOffset);var t=0,e=Math.max(e,0),n=0,r=0,i=this.bidiMap.bidiLevels,s=this.charWidths[i[r]];this.wrapIndent&&(e-=this.isRtlDir?-1*this.wrapOffset:this.wrapOffset);while(e>n+s/2){n+=s;if(r===i.length-1){s=0;break}s=this.charWidths[i[++r]]}return r>0&&i[r-1]%2!==0&&i[r]%2===0?(e<n&&r--,t=this.bidiMap.logicalFromVisual[r]):r>0&&i[r-1]%2===0&&i[r]%2!==0?t=1+(e>n?this.bidiMap.logicalFromVisual[r]:this.bidiMap.logicalFromVisual[r-1]):this.isRtlDir&&r===i.length-1&&s===0&&i[r-1]%2===0||!this.isRtlDir&&r===0&&i[r]%2!==0?t=1+this.bidiMap.logicalFromVisual[r]:(r>0&&i[r-1]%2!==0&&s!==0&&r--,t=this.bidiMap.logicalFromVisual[r]),t===0&&this.isRtlDir&&t++,t+this.wrapIndent}}).call(o.prototype),t.BidiHandler=o}),ace.define("ace/selection",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/lib/event_emitter","ace/range"],function(e,t,n){"use strict";var r=e("./lib/oop"),i=e("./lib/lang"),s=e("./lib/event_emitter").EventEmitter,o=e("./range").Range,u=function(e){this.session=e,this.doc=e.getDocument(),this.clearSelection(),this.cursor=this.lead=this.doc.createAnchor(0,0),this.anchor=this.doc.createAnchor(0,0),this.$silent=!1;var t=this;this.cursor.on("change",function(e){t.$cursorChanged=!0,t.$silent||t._emit("changeCursor"),!t.$isEmpty&&!t.$silent&&t._emit("changeSelection"),!t.$keepDesiredColumnOnChange&&e.old.column!=e.value.column&&(t.$desiredColumn=null)}),this.anchor.on("change",function(){t.$anchorChanged=!0,!t.$isEmpty&&!t.$silent&&t._emit("changeSelection")})};(function(){r.implement(this,s),this.isEmpty=function(){return this.$isEmpty||this.anchor.row==this.lead.row&&this.anchor.column==this.lead.column},this.isMultiLine=function(){return!this.$isEmpty&&this.anchor.row!=this.cursor.row},this.getCursor=function(){return this.lead.getPosition()},this.setSelectionAnchor=function(e,t){this.$isEmpty=!1,this.anchor.setPosition(e,t)},this.getAnchor=this.getSelectionAnchor=function(){return this.$isEmpty?this.getSelectionLead():this.anchor.getPosition()},this.getSelectionLead=function(){return this.lead.getPosition()},this.isBackwards=function(){var e=this.anchor,t=this.lead;return e.row>t.row||e.row==t.row&&e.column>t.column},this.getRange=function(){var e=this.anchor,t=this.lead;return this.$isEmpty?o.fromPoints(t,t):this.isBackwards()?o.fromPoints(t,e):o.fromPoints(e,t)},this.clearSelection=function(){this.$isEmpty||(this.$isEmpty=!0,this._emit("changeSelection"))},this.selectAll=function(){this.$setSelection(0,0,Number.MAX_VALUE,Number.MAX_VALUE)},this.setRange=this.setSelectionRange=function(e,t){var n=t?e.end:e.start,r=t?e.start:e.end;this.$setSelection(n.row,n.column,r.row,r.column)},this.$setSelection=function(e,t,n,r){var i=this.$isEmpty,s=this.inMultiSelectMode;this.$silent=!0,this.$cursorChanged=this.$anchorChanged=!1,this.anchor.setPosition(e,t),this.cursor.setPosition(n,r),this.$isEmpty=!o.comparePoints(this.anchor,this.cursor),this.$silent=!1,this.$cursorChanged&&this._emit("changeCursor"),(this.$cursorChanged||this.$anchorChanged||i!=this.$isEmpty||s)&&this._emit("changeSelection")},this.$moveSelection=function(e){var t=this.lead;this.$isEmpty&&this.setSelectionAnchor(t.row,t.column),e.call(this)},this.selectTo=function(e,t){this.$moveSelection(function(){this.moveCursorTo(e,t)})},this.selectToPosition=function(e){this.$moveSelection(function(){this.moveCursorToPosition(e)})},this.moveTo=function(e,t){this.clearSelection(),this.moveCursorTo(e,t)},this.moveToPosition=function(e){this.clearSelection(),this.moveCursorToPosition(e)},this.selectUp=function(){this.$moveSelection(this.moveCursorUp)},this.selectDown=function(){this.$moveSelection(this.moveCursorDown)},this.selectRight=function(){this.$moveSelection(this.moveCursorRight)},this.selectLeft=function(){this.$moveSelection(this.moveCursorLeft)},this.selectLineStart=function(){this.$moveSelection(this.moveCursorLineStart)},this.selectLineEnd=function(){this.$moveSelection(this.moveCursorLineEnd)},this.selectFileEnd=function(){this.$moveSelection(this.moveCursorFileEnd)},this.selectFileStart=function(){this.$moveSelection(this.moveCursorFileStart)},this.selectWordRight=function(){this.$moveSelection(this.moveCursorWordRight)},this.selectWordLeft=function(){this.$moveSelection(this.moveCursorWordLeft)},this.getWordRange=function(e,t){if(typeof t=="undefined"){var n=e||this.lead;e=n.row,t=n.column}return this.session.getWordRange(e,t)},this.selectWord=function(){this.setSelectionRange(this.getWordRange())},this.selectAWord=function(){var e=this.getCursor(),t=this.session.getAWordRange(e.row,e.column);this.setSelectionRange(t)},this.getLineRange=function(e,t){var n=typeof e=="number"?e:this.lead.row,r,i=this.session.getFoldLine(n);return i?(n=i.start.row,r=i.end.row):r=n,t===!0?new o(n,0,r,this.session.getLine(r).length):new o(n,0,r+1,0)},this.selectLine=function(){this.setSelectionRange(this.getLineRange())},this.moveCursorUp=function(){this.moveCursorBy(-1,0)},this.moveCursorDown=function(){this.moveCursorBy(1,0)},this.wouldMoveIntoSoftTab=function(e,t,n){var r=e.column,i=e.column+t;return n<0&&(r=e.column-t,i=e.column),this.session.isTabStop(e)&&this.doc.getLine(e.row).slice(r,i).split(" ").length-1==t},this.moveCursorLeft=function(){var e=this.lead.getPosition(),t;if(t=this.session.getFoldAt(e.row,e.column,-1))this.moveCursorTo(t.start.row,t.start.column);else if(e.column===0)e.row>0&&this.moveCursorTo(e.row-1,this.doc.getLine(e.row-1).length);else{var n=this.session.getTabSize();this.wouldMoveIntoSoftTab(e,n,-1)&&!this.session.getNavigateWithinSoftTabs()?this.moveCursorBy(0,-n):this.moveCursorBy(0,-1)}},this.moveCursorRight=function(){var e=this.lead.getPosition(),t;if(t=this.session.getFoldAt(e.row,e.column,1))this.moveCursorTo(t.end.row,t.end.column);else if(this.lead.column==this.doc.getLine(this.lead.row).length)this.lead.row<this.doc.getLength()-1&&this.moveCursorTo(this.lead.row+1,0);else{var n=this.session.getTabSize(),e=this.lead;this.wouldMoveIntoSoftTab(e,n,1)&&!this.session.getNavigateWithinSoftTabs()?this.moveCursorBy(0,n):this.moveCursorBy(0,1)}},this.moveCursorLineStart=function(){var e=this.lead.row,t=this.lead.column,n=this.session.documentToScreenRow(e,t),r=this.session.screenToDocumentPosition(n,0),i=this.session.getDisplayLine(e,null,r.row,r.column),s=i.match(/^\s*/);s[0].length!=t&&!this.session.$useEmacsStyleLineStart&&(r.column+=s[0].length),this.moveCursorToPosition(r)},this.moveCursorLineEnd=function(){var e=this.lead,t=this.session.getDocumentLastRowColumnPosition(e.row,e.column);if(this.lead.column==t.column){var n=this.session.getLine(t.row);if(t.column==n.length){var r=n.search(/\s+$/);r>0&&(t.column=r)}}this.moveCursorTo(t.row,t.column)},this.moveCursorFileEnd=function(){var e=this.doc.getLength()-1,t=this.doc.getLine(e).length;this.moveCursorTo(e,t)},this.moveCursorFileStart=function(){this.moveCursorTo(0,0)},this.moveCursorLongWordRight=function(){var e=this.lead.row,t=this.lead.column,n=this.doc.getLine(e),r=n.substring(t);this.session.nonTokenRe.lastIndex=0,this.session.tokenRe.lastIndex=0;var i=this.session.getFoldAt(e,t,1);if(i){this.moveCursorTo(i.end.row,i.end.column);return}this.session.nonTokenRe.exec(r)&&(t+=this.session.nonTokenRe.lastIndex,this.session.nonTokenRe.lastIndex=0,r=n.substring(t));if(t>=n.length){this.moveCursorTo(e,n.length),this.moveCursorRight(),e<this.doc.getLength()-1&&this.moveCursorWordRight();return}this.session.tokenRe.exec(r)&&(t+=this.session.tokenRe.lastIndex,this.session.tokenRe.lastIndex=0),this.moveCursorTo(e,t)},this.moveCursorLongWordLeft=function(){var e=this.lead.row,t=this.lead.column,n;if(n=this.session.getFoldAt(e,t,-1)){this.moveCursorTo(n.start.row,n.start.column);return}var r=this.session.getFoldStringAt(e,t,-1);r==null&&(r=this.doc.getLine(e).substring(0,t));var s=i.stringReverse(r);this.session.nonTokenRe.lastIndex=0,this.session.tokenRe.lastIndex=0,this.session.nonTokenRe.exec(s)&&(t-=this.session.nonTokenRe.lastIndex,s=s.slice(this.session.nonTokenRe.lastIndex),this.session.nonTokenRe.lastIndex=0);if(t<=0){this.moveCursorTo(e,0),this.moveCursorLeft(),e>0&&this.moveCursorWordLeft();return}this.session.tokenRe.exec(s)&&(t-=this.session.tokenRe.lastIndex,this.session.tokenRe.lastIndex=0),this.moveCursorTo(e,t)},this.$shortWordEndIndex=function(e){var t=0,n,r=/\s/,i=this.session.tokenRe;i.lastIndex=0;if(this.session.tokenRe.exec(e))t=this.session.tokenRe.lastIndex;else{while((n=e[t])&&r.test(n))t++;if(t<1){i.lastIndex=0;while((n=e[t])&&!i.test(n)){i.lastIndex=0,t++;if(r.test(n)){if(t>2){t--;break}while((n=e[t])&&r.test(n))t++;if(t>2)break}}}}return i.lastIndex=0,t},this.moveCursorShortWordRight=function(){var e=this.lead.row,t=this.lead.column,n=this.doc.getLine(e),r=n.substring(t),i=this.session.getFoldAt(e,t,1);if(i)return this.moveCursorTo(i.end.row,i.end.column);if(t==n.length){var s=this.doc.getLength();do e++,r=this.doc.getLine(e);while(e<s&&/^\s*$/.test(r));/^\s+/.test(r)||(r=""),t=0}var o=this.$shortWordEndIndex(r);this.moveCursorTo(e,t+o)},this.moveCursorShortWordLeft=function(){var e=this.lead.row,t=this.lead.column,n;if(n=this.session.getFoldAt(e,t,-1))return this.moveCursorTo(n.start.row,n.start.column);var r=this.session.getLine(e).substring(0,t);if(t===0){do e--,r=this.doc.getLine(e);while(e>0&&/^\s*$/.test(r));t=r.length,/\s+$/.test(r)||(r="")}var s=i.stringReverse(r),o=this.$shortWordEndIndex(s);return this.moveCursorTo(e,t-o)},this.moveCursorWordRight=function(){this.session.$selectLongWords?this.moveCursorLongWordRight():this.moveCursorShortWordRight()},this.moveCursorWordLeft=function(){this.session.$selectLongWords?this.moveCursorLongWordLeft():this.moveCursorShortWordLeft()},this.moveCursorBy=function(e,t){var n=this.session.documentToScreenPosition(this.lead.row,this.lead.column),r;t===0&&(e!==0&&(this.session.$bidiHandler.isBidiRow(n.row,this.lead.row)?(r=this.session.$bidiHandler.getPosLeft(n.column),n.column=Math.round(r/this.session.$bidiHandler.charWidths[0])):r=n.column*this.session.$bidiHandler.charWidths[0]),this.$desiredColumn?n.column=this.$desiredColumn:this.$desiredColumn=n.column);var i=this.session.screenToDocumentPosition(n.row+e,n.column,r);e!==0&&t===0&&i.row===this.lead.row&&i.column===this.lead.column&&this.session.lineWidgets&&this.session.lineWidgets[i.row]&&(i.row>0||e>0)&&i.row++,this.moveCursorTo(i.row,i.column+t,t===0)},this.moveCursorToPosition=function(e){this.moveCursorTo(e.row,e.column)},this.moveCursorTo=function(e,t,n){var r=this.session.getFoldAt(e,t,1);r&&(e=r.start.row,t=r.start.column),this.$keepDesiredColumnOnChange=!0;var i=this.session.getLine(e);/[\uDC00-\uDFFF]/.test(i.charAt(t))&&i.charAt(t-1)&&(this.lead.row==e&&this.lead.column==t+1?t-=1:t+=1),this.lead.setPosition(e,t),this.$keepDesiredColumnOnChange=!1,n||(this.$desiredColumn=null)},this.moveCursorToScreen=function(e,t,n){var r=this.session.screenToDocumentPosition(e,t);this.moveCursorTo(r.row,r.column,n)},this.detach=function(){this.lead.detach(),this.anchor.detach(),this.session=this.doc=null},this.fromOrientedRange=function(e){this.setSelectionRange(e,e.cursor==e.start),this.$desiredColumn=e.desiredColumn||this.$desiredColumn},this.toOrientedRange=function(e){var t=this.getRange();return e?(e.start.column=t.start.column,e.start.row=t.start.row,e.end.column=t.end.column,e.end.row=t.end.row):e=t,e.cursor=this.isBackwards()?e.start:e.end,e.desiredColumn=this.$desiredColumn,e},this.getRangeOfMovements=function(e){var t=this.getCursor();try{e(this);var n=this.getCursor();return o.fromPoints(t,n)}catch(r){return o.fromPoints(t,t)}finally{this.moveCursorToPosition(t)}},this.toJSON=function(){if(this.rangeCount)var e=this.ranges.map(function(e){var t=e.clone();return t.isBackwards=e.cursor==e.start,t});else{var e=this.getRange();e.isBackwards=this.isBackwards()}return e},this.fromJSON=function(e){if(e.start==undefined){if(this.rangeList){this.toSingleRange(e[0]);for(var t=e.length;t--;){var n=o.fromPoints(e[t].start,e[t].end);e[t].isBackwards&&(n.cursor=n.start),this.addRange(n,!0)}return}e=e[0]}this.rangeList&&this.toSingleRange(e),this.setSelectionRange(e,e.isBackwards)},this.isEqual=function(e){if((e.length||this.rangeCount)&&e.length!=this.rangeCount)return!1;if(!e.length||!this.ranges)return this.getRange().isEqual(e);for(var t=this.ranges.length;t--;)if(!this.ranges[t].isEqual(e[t]))return!1;return!0}}).call(u.prototype),t.Selection=u}),ace.define("ace/tokenizer",["require","exports","module","ace/config"],function(e,t,n){"use strict";var r=e("./config"),i=2e3,s=function(e){this.states=e,this.regExps={},this.matchMappings={};for(var t in this.states){var n=this.states[t],r=[],i=0,s=this.matchMappings[t]={defaultToken:"text"},o="g",u=[];for(var a=0;a<n.length;a++){var f=n[a];f.defaultToken&&(s.defaultToken=f.defaultToken),f.caseInsensitive&&(o="gi");if(f.regex==null)continue;f.regex instanceof RegExp&&(f.regex=f.regex.toString().slice(1,-1));var l=f.regex,c=(new RegExp("(?:("+l+")|(.))")).exec("a").length-2;Array.isArray(f.token)?f.token.length==1||c==1?f.token=f.token[0]:c-1!=f.token.length?(this.reportError("number of classes and regexp groups doesn't match",{rule:f,groupCount:c-1}),f.token=f.token[0]):(f.tokenArray=f.token,f.token=null,f.onMatch=this.$arrayTokens):typeof f.token=="function"&&!f.onMatch&&(c>1?f.onMatch=this.$applyToken:f.onMatch=f.token),c>1&&(/\\\d/.test(f.regex)?l=f.regex.replace(/\\([0-9]+)/g,function(e,t){return"\\"+(parseInt(t,10)+i+1)}):(c=1,l=this.removeCapturingGroups(f.regex)),!f.splitRegex&&typeof f.token!="string"&&u.push(f)),s[i]=a,i+=c,r.push(l),f.onMatch||(f.onMatch=null)}r.length||(s[0]=0,r.push("$")),u.forEach(function(e){e.splitRegex=this.createSplitterRegexp(e.regex,o)},this),this.regExps[t]=new RegExp("("+r.join(")|(")+")|($)",o)}};(function(){this.$setMaxTokenCount=function(e){i=e|0},this.$applyToken=function(e){var t=this.splitRegex.exec(e).slice(1),n=this.token.apply(this,t);if(typeof n=="string")return[{type:n,value:e}];var r=[];for(var i=0,s=n.length;i<s;i++)t[i]&&(r[r.length]={type:n[i],value:t[i]});return r},this.$arrayTokens=function(e){if(!e)return[];var t=this.splitRegex.exec(e);if(!t)return"text";var n=[],r=this.tokenArray;for(var i=0,s=r.length;i<s;i++)t[i+1]&&(n[n.length]={type:r[i],value:t[i+1]});return n},this.removeCapturingGroups=function(e){var t=e.replace(/\\.|\[(?:\\.|[^\\\]])*|\(\?[:=!]|(\()/g,function(e,t){return t?"(?:":e});return t},this.createSplitterRegexp=function(e,t){if(e.indexOf("(?=")!=-1){var n=0,r=!1,i={};e.replace(/(\\.)|(\((?:\?[=!])?)|(\))|([\[\]])/g,function(e,t,s,o,u,a){return r?r=u!="]":u?r=!0:o?(n==i.stack&&(i.end=a+1,i.stack=-1),n--):s&&(n++,s.length!=1&&(i.stack=n,i.start=a)),e}),i.end!=null&&/^\)*$/.test(e.substr(i.end))&&(e=e.substring(0,i.start)+e.substr(i.end))}return e.charAt(0)!="^"&&(e="^"+e),e.charAt(e.length-1)!="$"&&(e+="$"),new RegExp(e,(t||"").replace("g",""))},this.getLineTokens=function(e,t){if(t&&typeof t!="string"){var n=t.slice(0);t=n[0],t==="#tmp"&&(n.shift(),t=n.shift())}else var n=[];var r=t||"start",s=this.states[r];s||(r="start",s=this.states[r]);var o=this.matchMappings[r],u=this.regExps[r];u.lastIndex=0;var a,f=[],l=0,c=0,h={type:null,value:""};while(a=u.exec(e)){var p=o.defaultToken,d=null,v=a[0],m=u.lastIndex;if(m-v.length>l){var g=e.substring(l,m-v.length);h.type==p?h.value+=g:(h.type&&f.push(h),h={type:p,value:g})}for(var y=0;y<a.length-2;y++){if(a[y+1]===undefined)continue;d=s[o[y]],d.onMatch?p=d.onMatch(v,r,n,e):p=d.token,d.next&&(typeof d.next=="string"?r=d.next:r=d.next(r,n),s=this.states[r],s||(this.reportError("state doesn't exist",r),r="start",s=this.states[r]),o=this.matchMappings[r],l=m,u=this.regExps[r],u.lastIndex=m),d.consumeLineEnd&&(l=m);break}if(v)if(typeof p=="string")!!d&&d.merge===!1||h.type!==p?(h.type&&f.push(h),h={type:p,value:v}):h.value+=v;else if(p){h.type&&f.push(h),h={type:null,value:""};for(var y=0;y<p.length;y++)f.push(p[y])}if(l==e.length)break;l=m;if(c++>i){c>2*e.length&&this.reportError("infinite loop with in ace tokenizer",{startState:t,line:e});while(l<e.length)h.type&&f.push(h),h={value:e.substring(l,l+=2e3),type:"overflow"};r="start",n=[];break}}return h.type&&f.push(h),n.length>1&&n[0]!==r&&n.unshift("#tmp",r),{tokens:f,state:n.length?n:r}},this.reportError=r.reportError}).call(s.prototype),t.Tokenizer=s}),ace.define("ace/mode/text_highlight_rules",["require","exports","module","ace/lib/lang"],function(e,t,n){"use strict";var r=e("../lib/lang"),i=function(){this.$rules={start:[{token:"empty_line",regex:"^$"},{defaultToken:"text"}]}};(function(){this.addRules=function(e,t){if(!t){for(var n in e)this.$rules[n]=e[n];return}for(var n in e){var r=e[n];for(var i=0;i<r.length;i++){var s=r[i];if(s.next||s.onMatch)typeof s.next=="string"&&s.next.indexOf(t)!==0&&(s.next=t+s.next),s.nextState&&s.nextState.indexOf(t)!==0&&(s.nextState=t+s.nextState)}this.$rules[t+n]=r}},this.getRules=function(){return this.$rules},this.embedRules=function(e,t,n,i,s){var o=typeof e=="function"?(new e).getRules():e;if(i)for(var u=0;u<i.length;u++)i[u]=t+i[u];else{i=[];for(var a in o)i.push(t+a)}this.addRules(o,t);if(n){var f=Array.prototype[s?"push":"unshift"];for(var u=0;u<i.length;u++)f.apply(this.$rules[i[u]],r.deepCopy(n))}this.$embeds||(this.$embeds=[]),this.$embeds.push(t)},this.getEmbeds=function(){return this.$embeds};var e=function(e,t){return(e!="start"||t.length)&&t.unshift(this.nextState,e),this.nextState},t=function(e,t){return t.shift(),t.shift()||"start"};this.normalizeRules=function(){function i(s){var o=r[s];o.processed=!0;for(var u=0;u<o.length;u++){var a=o[u],f=null;Array.isArray(a)&&(f=a,a={}),!a.regex&&a.start&&(a.regex=a.start,a.next||(a.next=[]),a.next.push({defaultToken:a.token},{token:a.token+".end",regex:a.end||a.start,next:"pop"}),a.token=a.token+".start",a.push=!0);var l=a.next||a.push;if(l&&Array.isArray(l)){var c=a.stateName;c||(c=a.token,typeof c!="string"&&(c=c[0]||""),r[c]&&(c+=n++)),r[c]=l,a.next=c,i(c)}else l=="pop"&&(a.next=t);a.push&&(a.nextState=a.next||a.push,a.next=e,delete a.push);if(a.rules)for(var h in a.rules)r[h]?r[h].push&&r[h].push.apply(r[h],a.rules[h]):r[h]=a.rules[h];var p=typeof a=="string"?a:a.include;p&&(Array.isArray(p)?f=p.map(function(e){return r[e]}):f=r[p]);if(f){var d=[u,1].concat(f);a.noEscape&&(d=d.filter(function(e){return!e.next})),o.splice.apply(o,d),u--}a.keywordMap&&(a.token=this.createKeywordMapper(a.keywordMap,a.defaultToken||"text",a.caseInsensitive),delete a.defaultToken)}}var n=0,r=this.$rules;Object.keys(r).forEach(i,this)},this.createKeywordMapper=function(e,t,n,r){var i=Object.create(null);return Object.keys(e).forEach(function(t){var s=e[t];n&&(s=s.toLowerCase());var o=s.split(r||"|");for(var u=o.length;u--;)i[o[u]]=t}),Object.getPrototypeOf(i)&&(i.__proto__=null),this.$keywordList=Object.keys(i),e=null,n?function(e){return i[e.toLowerCase()]||t}:function(e){return i[e]||t}},this.getKeywords=function(){return this.$keywords}}).call(i.prototype),t.TextHighlightRules=i}),ace.define("ace/mode/behaviour",["require","exports","module"],function(e,t,n){"use strict";var r=function(){this.$behaviours={}};(function(){this.add=function(e,t,n){switch(undefined){case this.$behaviours:this.$behaviours={};case this.$behaviours[e]:this.$behaviours[e]={}}this.$behaviours[e][t]=n},this.addBehaviours=function(e){for(var t in e)for(var n in e[t])this.add(t,n,e[t][n])},this.remove=function(e){this.$behaviours&&this.$behaviours[e]&&delete this.$behaviours[e]},this.inherit=function(e,t){if(typeof e=="function")var n=(new e).getBehaviours(t);else var n=e.getBehaviours(t);this.addBehaviours(n)},this.getBehaviours=function(e){if(!e)return this.$behaviours;var t={};for(var n=0;n<e.length;n++)this.$behaviours[e[n]]&&(t[e[n]]=this.$behaviours[e[n]]);return t}}).call(r.prototype),t.Behaviour=r}),ace.define("ace/token_iterator",["require","exports","module","ace/range"],function(e,t,n){"use strict";var r=e("./range").Range,i=function(e,t,n){this.$session=e,this.$row=t,this.$rowTokens=e.getTokens(t);var r=e.getTokenAt(t,n);this.$tokenIndex=r?r.index:-1};(function(){this.stepBackward=function(){this.$tokenIndex-=1;while(this.$tokenIndex<0){this.$row-=1;if(this.$row<0)return this.$row=0,null;this.$rowTokens=this.$session.getTokens(this.$row),this.$tokenIndex=this.$rowTokens.length-1}return this.$rowTokens[this.$tokenIndex]},this.stepForward=function(){this.$tokenIndex+=1;var e;while(this.$tokenIndex>=this.$rowTokens.length){this.$row+=1,e||(e=this.$session.getLength());if(this.$row>=e)return this.$row=e-1,null;this.$rowTokens=this.$session.getTokens(this.$row),this.$tokenIndex=0}return this.$rowTokens[this.$tokenIndex]},this.getCurrentToken=function(){return this.$rowTokens[this.$tokenIndex]},this.getCurrentTokenRow=function(){return this.$row},this.getCurrentTokenColumn=function(){var e=this.$rowTokens,t=this.$tokenIndex,n=e[t].start;if(n!==undefined)return n;n=0;while(t>0)t-=1,n+=e[t].value.length;return n},this.getCurrentTokenPosition=function(){return{row:this.$row,column:this.getCurrentTokenColumn()}},this.getCurrentTokenRange=function(){var e=this.$rowTokens[this.$tokenIndex],t=this.getCurrentTokenColumn();return new r(this.$row,t,this.$row,t+e.value.length)}}).call(i.prototype),t.TokenIterator=i}),ace.define("ace/mode/behaviour/cstyle",["require","exports","module","ace/lib/oop","ace/mode/behaviour","ace/token_iterator","ace/lib/lang"],function(e,t,n){"use strict";var r=e("../../lib/oop"),i=e("../behaviour").Behaviour,s=e("../../token_iterator").TokenIterator,o=e("../../lib/lang"),u=["text","paren.rparen","punctuation.operator"],a=["text","paren.rparen","punctuation.operator","comment"],f,l={},c={'"':'"',"'":"'"},h=function(e){var t=-1;e.multiSelect&&(t=e.selection.index,l.rangeCount!=e.multiSelect.rangeCount&&(l={rangeCount:e.multiSelect.rangeCount}));if(l[t])return f=l[t];f=l[t]={autoInsertedBrackets:0,autoInsertedRow:-1,autoInsertedLineEnd:"",maybeInsertedBrackets:0,maybeInsertedRow:-1,maybeInsertedLineStart:"",maybeInsertedLineEnd:""}},p=function(e,t,n,r){var i=e.end.row-e.start.row;return{text:n+t+r,selection:[0,e.start.column+1,i,e.end.column+(i?0:1)]}},d=function(e){this.add("braces","insertion",function(t,n,r,i,s){var u=r.getCursorPosition(),a=i.doc.getLine(u.row);if(s=="{"){h(r);var l=r.getSelectionRange(),c=i.doc.getTextRange(l);if(c!==""&&c!=="{"&&r.getWrapBehavioursEnabled())return p(l,c,"{","}");if(d.isSaneInsertion(r,i))return/[\]\}\)]/.test(a[u.column])||r.inMultiSelectMode||e&&e.braces?(d.recordAutoInsert(r,i,"}"),{text:"{}",selection:[1,1]}):(d.recordMaybeInsert(r,i,"{"),{text:"{",selection:[1,1]})}else if(s=="}"){h(r);var v=a.substring(u.column,u.column+1);if(v=="}"){var m=i.$findOpeningBracket("}",{column:u.column+1,row:u.row});if(m!==null&&d.isAutoInsertedClosing(u,a,s))return d.popAutoInsertedClosing(),{text:"",selection:[1,1]}}}else{if(s=="\n"||s=="\r\n"){h(r);var g="";d.isMaybeInsertedClosing(u,a)&&(g=o.stringRepeat("}",f.maybeInsertedBrackets),d.clearMaybeInsertedClosing());var v=a.substring(u.column,u.column+1);if(v==="}"){var y=i.findMatchingBracket({row:u.row,column:u.column+1},"}");if(!y)return null;var b=this.$getIndent(i.getLine(y.row))}else{if(!g){d.clearMaybeInsertedClosing();return}var b=this.$getIndent(a)}var w=b+i.getTabString();return{text:"\n"+w+"\n"+b+g,selection:[1,w.length,1,w.length]}}d.clearMaybeInsertedClosing()}}),this.add("braces","deletion",function(e,t,n,r,i){var s=r.doc.getTextRange(i);if(!i.isMultiLine()&&s=="{"){h(n);var o=r.doc.getLine(i.start.row),u=o.substring(i.end.column,i.end.column+1);if(u=="}")return i.end.column++,i;f.maybeInsertedBrackets--}}),this.add("parens","insertion",function(e,t,n,r,i){if(i=="("){h(n);var s=n.getSelectionRange(),o=r.doc.getTextRange(s);if(o!==""&&n.getWrapBehavioursEnabled())return p(s,o,"(",")");if(d.isSaneInsertion(n,r))return d.recordAutoInsert(n,r,")"),{text:"()",selection:[1,1]}}else if(i==")"){h(n);var u=n.getCursorPosition(),a=r.doc.getLine(u.row),f=a.substring(u.column,u.column+1);if(f==")"){var l=r.$findOpeningBracket(")",{column:u.column+1,row:u.row});if(l!==null&&d.isAutoInsertedClosing(u,a,i))return d.popAutoInsertedClosing(),{text:"",selection:[1,1]}}}}),this.add("parens","deletion",function(e,t,n,r,i){var s=r.doc.getTextRange(i);if(!i.isMultiLine()&&s=="("){h(n);var o=r.doc.getLine(i.start.row),u=o.substring(i.start.column+1,i.start.column+2);if(u==")")return i.end.column++,i}}),this.add("brackets","insertion",function(e,t,n,r,i){if(i=="["){h(n);var s=n.getSelectionRange(),o=r.doc.getTextRange(s);if(o!==""&&n.getWrapBehavioursEnabled())return p(s,o,"[","]");if(d.isSaneInsertion(n,r))return d.recordAutoInsert(n,r,"]"),{text:"[]",selection:[1,1]}}else if(i=="]"){h(n);var u=n.getCursorPosition(),a=r.doc.getLine(u.row),f=a.substring(u.column,u.column+1);if(f=="]"){var l=r.$findOpeningBracket("]",{column:u.column+1,row:u.row});if(l!==null&&d.isAutoInsertedClosing(u,a,i))return d.popAutoInsertedClosing(),{text:"",selection:[1,1]}}}}),this.add("brackets","deletion",function(e,t,n,r,i){var s=r.doc.getTextRange(i);if(!i.isMultiLine()&&s=="["){h(n);var o=r.doc.getLine(i.start.row),u=o.substring(i.start.column+1,i.start.column+2);if(u=="]")return i.end.column++,i}}),this.add("string_dquotes","insertion",function(e,t,n,r,i){var s=r.$mode.$quotes||c;if(i.length==1&&s[i]){if(this.lineCommentStart&&this.lineCommentStart.indexOf(i)!=-1)return;h(n);var o=i,u=n.getSelectionRange(),a=r.doc.getTextRange(u);if(a!==""&&(a.length!=1||!s[a])&&n.getWrapBehavioursEnabled())return p(u,a,o,o);if(!a){var f=n.getCursorPosition(),l=r.doc.getLine(f.row),d=l.substring(f.column-1,f.column),v=l.substring(f.column,f.column+1),m=r.getTokenAt(f.row,f.column),g=r.getTokenAt(f.row,f.column+1);if(d=="\\"&&m&&/escape/.test(m.type))return null;var y=m&&/string|escape/.test(m.type),b=!g||/string|escape/.test(g.type),w;if(v==o)w=y!==b,w&&/string\.end/.test(g.type)&&(w=!1);else{if(y&&!b)return null;if(y&&b)return null;var E=r.$mode.tokenRe;E.lastIndex=0;var S=E.test(d);E.lastIndex=0;var x=E.test(d);if(S||x)return null;if(v&&!/[\s;,.})\]\\]/.test(v))return null;w=!0}return{text:w?o+o:"",selection:[1,1]}}}}),this.add("string_dquotes","deletion",function(e,t,n,r,i){var s=r.$mode.$quotes||c,o=r.doc.getTextRange(i);if(!i.isMultiLine()&&s.hasOwnProperty(o)){h(n);var u=r.doc.getLine(i.start.row),a=u.substring(i.start.column+1,i.start.column+2);if(a==o)return i.end.column++,i}})};d.isSaneInsertion=function(e,t){var n=e.getCursorPosition(),r=new s(t,n.row,n.column);if(!this.$matchTokenType(r.getCurrentToken()||"text",u)){var i=new s(t,n.row,n.column+1);if(!this.$matchTokenType(i.getCurrentToken()||"text",u))return!1}return r.stepForward(),r.getCurrentTokenRow()!==n.row||this.$matchTokenType(r.getCurrentToken()||"text",a)},d.$matchTokenType=function(e,t){return t.indexOf(e.type||e)>-1},d.recordAutoInsert=function(e,t,n){var r=e.getCursorPosition(),i=t.doc.getLine(r.row);this.isAutoInsertedClosing(r,i,f.autoInsertedLineEnd[0])||(f.autoInsertedBrackets=0),f.autoInsertedRow=r.row,f.autoInsertedLineEnd=n+i.substr(r.column),f.autoInsertedBrackets++},d.recordMaybeInsert=function(e,t,n){var r=e.getCursorPosition(),i=t.doc.getLine(r.row);this.isMaybeInsertedClosing(r,i)||(f.maybeInsertedBrackets=0),f.maybeInsertedRow=r.row,f.maybeInsertedLineStart=i.substr(0,r.column)+n,f.maybeInsertedLineEnd=i.substr(r.column),f.maybeInsertedBrackets++},d.isAutoInsertedClosing=function(e,t,n){return f.autoInsertedBrackets>0&&e.row===f.autoInsertedRow&&n===f.autoInsertedLineEnd[0]&&t.substr(e.column)===f.autoInsertedLineEnd},d.isMaybeInsertedClosing=function(e,t){return f.maybeInsertedBrackets>0&&e.row===f.maybeInsertedRow&&t.substr(e.column)===f.maybeInsertedLineEnd&&t.substr(0,e.column)==f.maybeInsertedLineStart},d.popAutoInsertedClosing=function(){f.autoInsertedLineEnd=f.autoInsertedLineEnd.substr(1),f.autoInsertedBrackets--},d.clearMaybeInsertedClosing=function(){f&&(f.maybeInsertedBrackets=0,f.maybeInsertedRow=-1)},r.inherits(d,i),t.CstyleBehaviour=d}),ace.define("ace/unicode",["require","exports","module"],function(e,t,n){"use strict";var r=[48,9,8,25,5,0,2,25,48,0,11,0,5,0,6,22,2,30,2,457,5,11,15,4,8,0,2,0,18,116,2,1,3,3,9,0,2,2,2,0,2,19,2,82,2,138,2,4,3,155,12,37,3,0,8,38,10,44,2,0,2,1,2,1,2,0,9,26,6,2,30,10,7,61,2,9,5,101,2,7,3,9,2,18,3,0,17,58,3,100,15,53,5,0,6,45,211,57,3,18,2,5,3,11,3,9,2,1,7,6,2,2,2,7,3,1,3,21,2,6,2,0,4,3,3,8,3,1,3,3,9,0,5,1,2,4,3,11,16,2,2,5,5,1,3,21,2,6,2,1,2,1,2,1,3,0,2,4,5,1,3,2,4,0,8,3,2,0,8,15,12,2,2,8,2,2,2,21,2,6,2,1,2,4,3,9,2,2,2,2,3,0,16,3,3,9,18,2,2,7,3,1,3,21,2,6,2,1,2,4,3,8,3,1,3,2,9,1,5,1,2,4,3,9,2,0,17,1,2,5,4,2,2,3,4,1,2,0,2,1,4,1,4,2,4,11,5,4,4,2,2,3,3,0,7,0,15,9,18,2,2,7,2,2,2,22,2,9,2,4,4,7,2,2,2,3,8,1,2,1,7,3,3,9,19,1,2,7,2,2,2,22,2,9,2,4,3,8,2,2,2,3,8,1,8,0,2,3,3,9,19,1,2,7,2,2,2,22,2,15,4,7,2,2,2,3,10,0,9,3,3,9,11,5,3,1,2,17,4,23,2,8,2,0,3,6,4,0,5,5,2,0,2,7,19,1,14,57,6,14,2,9,40,1,2,0,3,1,2,0,3,0,7,3,2,6,2,2,2,0,2,0,3,1,2,12,2,2,3,4,2,0,2,5,3,9,3,1,35,0,24,1,7,9,12,0,2,0,2,0,5,9,2,35,5,19,2,5,5,7,2,35,10,0,58,73,7,77,3,37,11,42,2,0,4,328,2,3,3,6,2,0,2,3,3,40,2,3,3,32,2,3,3,6,2,0,2,3,3,14,2,56,2,3,3,66,5,0,33,15,17,84,13,619,3,16,2,25,6,74,22,12,2,6,12,20,12,19,13,12,2,2,2,1,13,51,3,29,4,0,5,1,3,9,34,2,3,9,7,87,9,42,6,69,11,28,4,11,5,11,11,39,3,4,12,43,5,25,7,10,38,27,5,62,2,28,3,10,7,9,14,0,89,75,5,9,18,8,13,42,4,11,71,55,9,9,4,48,83,2,2,30,14,230,23,280,3,5,3,37,3,5,3,7,2,0,2,0,2,0,2,30,3,52,2,6,2,0,4,2,2,6,4,3,3,5,5,12,6,2,2,6,67,1,20,0,29,0,14,0,17,4,60,12,5,0,4,11,18,0,5,0,3,9,2,0,4,4,7,0,2,0,2,0,2,3,2,10,3,3,6,4,5,0,53,1,2684,46,2,46,2,132,7,6,15,37,11,53,10,0,17,22,10,6,2,6,2,6,2,6,2,6,2,6,2,6,2,6,2,31,48,0,470,1,36,5,2,4,6,1,5,85,3,1,3,2,2,89,2,3,6,40,4,93,18,23,57,15,513,6581,75,20939,53,1164,68,45,3,268,4,27,21,31,3,13,13,1,2,24,9,69,11,1,38,8,3,102,3,1,111,44,25,51,13,68,12,9,7,23,4,0,5,45,3,35,13,28,4,64,15,10,39,54,10,13,3,9,7,22,4,1,5,66,25,2,227,42,2,1,3,9,7,11171,13,22,5,48,8453,301,3,61,3,105,39,6,13,4,6,11,2,12,2,4,2,0,2,1,2,1,2,107,34,362,19,63,3,53,41,11,5,15,17,6,13,1,25,2,33,4,2,134,20,9,8,25,5,0,2,25,12,88,4,5,3,5,3,5,3,2],i=0,s=[];for(var o=0;o<r.length;o+=2)s.push(i+=r[o]),r[o+1]&&s.push(45,i+=r[o+1]);t.wordChars=String.fromCharCode.apply(null,s)}),ace.define("ace/mode/text",["require","exports","module","ace/config","ace/tokenizer","ace/mode/text_highlight_rules","ace/mode/behaviour/cstyle","ace/unicode","ace/lib/lang","ace/token_iterator","ace/range"],function(e,t,n){"use strict";var r=e("../config"),i=e("../tokenizer").Tokenizer,s=e("./text_highlight_rules").TextHighlightRules,o=e("./behaviour/cstyle").CstyleBehaviour,u=e("../unicode"),a=e("../lib/lang"),f=e("../token_iterator").TokenIterator,l=e("../range").Range,c=function(){this.HighlightRules=s};(function(){this.$defaultBehaviour=new o,this.tokenRe=new RegExp("^["+u.wordChars+"\\$_]+","g"),this.nonTokenRe=new RegExp("^(?:[^"+u.wordChars+"\\$_]|\\s])+","g"),this.getTokenizer=function(){return this.$tokenizer||(this.$highlightRules=this.$highlightRules||new this.HighlightRules(this.$highlightRuleConfig),this.$tokenizer=new i(this.$highlightRules.getRules())),this.$tokenizer},this.lineCommentStart="",this.blockComment="",this.toggleCommentLines=function(e,t,n,r){function w(e){for(var t=n;t<=r;t++)e(i.getLine(t),t)}var i=t.doc,s=!0,o=!0,u=Infinity,f=t.getTabSize(),l=!1;if(!this.lineCommentStart){if(!this.blockComment)return!1;var c=this.blockComment.start,h=this.blockComment.end,p=new RegExp("^(\\s*)(?:"+a.escapeRegExp(c)+")"),d=new RegExp("(?:"+a.escapeRegExp(h)+")\\s*$"),v=function(e,t){if(g(e,t))return;if(!s||/\S/.test(e))i.insertInLine({row:t,column:e.length},h),i.insertInLine({row:t,column:u},c)},m=function(e,t){var n;(n=e.match(d))&&i.removeInLine(t,e.length-n[0].length,e.length),(n=e.match(p))&&i.removeInLine(t,n[1].length,n[0].length)},g=function(e,n){if(p.test(e))return!0;var r=t.getTokens(n);for(var i=0;i<r.length;i++)if(r[i].type==="comment")return!0}}else{if(Array.isArray(this.lineCommentStart))var p=this.lineCommentStart.map(a.escapeRegExp).join("|"),c=this.lineCommentStart[0];else var p=a.escapeRegExp(this.lineCommentStart),c=this.lineCommentStart;p=new RegExp("^(\\s*)(?:"+p+") ?"),l=t.getUseSoftTabs();var m=function(e,t){var n=e.match(p);if(!n)return;var r=n[1].length,s=n[0].length;!b(e,r,s)&&n[0][s-1]==" "&&s--,i.removeInLine(t,r,s)},y=c+" ",v=function(e,t){if(!s||/\S/.test(e))b(e,u,u)?i.insertInLine({row:t,column:u},y):i.insertInLine({row:t,column:u},c)},g=function(e,t){return p.test(e)},b=function(e,t,n){var r=0;while(t--&&e.charAt(t)==" ")r++;if(r%f!=0)return!1;var r=0;while(e.charAt(n++)==" ")r++;return f>2?r%f!=f-1:r%f==0}}var E=Infinity;w(function(e,t){var n=e.search(/\S/);n!==-1?(n<u&&(u=n),o&&!g(e,t)&&(o=!1)):E>e.length&&(E=e.length)}),u==Infinity&&(u=E,s=!1,o=!1),l&&u%f!=0&&(u=Math.floor(u/f)*f),w(o?m:v)},this.toggleBlockComment=function(e,t,n,r){var i=this.blockComment;if(!i)return;!i.start&&i[0]&&(i=i[0]);var s=new f(t,r.row,r.column),o=s.getCurrentToken(),u=t.selection,a=t.selection.toOrientedRange(),c,h;if(o&&/comment/.test(o.type)){var p,d;while(o&&/comment/.test(o.type)){var v=o.value.indexOf(i.start);if(v!=-1){var m=s.getCurrentTokenRow(),g=s.getCurrentTokenColumn()+v;p=new l(m,g,m,g+i.start.length);break}o=s.stepBackward()}var s=new f(t,r.row,r.column),o=s.getCurrentToken();while(o&&/comment/.test(o.type)){var v=o.value.indexOf(i.end);if(v!=-1){var m=s.getCurrentTokenRow(),g=s.getCurrentTokenColumn()+v;d=new l(m,g,m,g+i.end.length);break}o=s.stepForward()}d&&t.remove(d),p&&(t.remove(p),c=p.start.row,h=-i.start.length)}else h=i.start.length,c=n.start.row,t.insert(n.end,i.end),t.insert(n.start,i.start);a.start.row==c&&(a.start.column+=h),a.end.row==c&&(a.end.column+=h),t.selection.fromOrientedRange(a)},this.getNextLineIndent=function(e,t,n){return this.$getIndent(t)},this.checkOutdent=function(e,t,n){return!1},this.autoOutdent=function(e,t,n){},this.$getIndent=function(e){return e.match(/^\s*/)[0]},this.createWorker=function(e){return null},this.createModeDelegates=function(e){this.$embeds=[],this.$modes={};for(var t in e)if(e[t]){var n=e[t],i=n.prototype.$id,s=r.$modes[i];s||(r.$modes[i]=s=new n),r.$modes[t]||(r.$modes[t]=s),this.$embeds.push(t),this.$modes[t]=s}var o=["toggleBlockComment","toggleCommentLines","getNextLineIndent","checkOutdent","autoOutdent","transformAction","getCompletions"];for(var t=0;t<o.length;t++)(function(e){var n=o[t],r=e[n];e[o[t]]=function(){return this.$delegator(n,arguments,r)}})(this)},this.$delegator=function(e,t,n){var r=t[0]||"start";if(typeof r!="string"){if(Array.isArray(r[2])){var i=r[2][r[2].length-1],s=this.$modes[i];if(s)return s[e].apply(s,[r[1]].concat([].slice.call(t,1)))}r=r[0]||"start"}for(var o=0;o<this.$embeds.length;o++){if(!this.$modes[this.$embeds[o]])continue;var u=r.split(this.$embeds[o]);if(!u[0]&&u[1]){t[0]=u[1];var s=this.$modes[this.$embeds[o]];return s[e].apply(s,t)}}var a=n.apply(this,t);return n?a:undefined},this.transformAction=function(e,t,n,r,i){if(this.$behaviour){var s=this.$behaviour.getBehaviours();for(var o in s)if(s[o][t]){var u=s[o][t].apply(this,arguments);if(u)return u}}},this.getKeywords=function(e){if(!this.completionKeywords){var t=this.$tokenizer.rules,n=[];for(var r in t){var i=t[r];for(var s=0,o=i.length;s<o;s++)if(typeof i[s].token=="string")/keyword|support|storage/.test(i[s].token)&&n.push(i[s].regex);else if(typeof i[s].token=="object")for(var u=0,a=i[s].token.length;u<a;u++)if(/keyword|support|storage/.test(i[s].token[u])){var r=i[s].regex.match(/\(.+?\)/g)[u];n.push(r.substr(1,r.length-2))}}this.completionKeywords=n}return e?n.concat(this.$keywordList||[]):this.$keywordList},this.$createKeywordList=function(){return this.$highlightRules||this.getTokenizer(),this.$keywordList=this.$highlightRules.$keywordList||[]},this.getCompletions=function(e,t,n,r){var i=this.$keywordList||this.$createKeywordList();return i.map(function(e){return{name:e,value:e,score:0,meta:"keyword"}})},this.$id="ace/mode/text"}).call(c.prototype),t.Mode=c}),ace.define("ace/apply_delta",["require","exports","module"],function(e,t,n){"use strict";function r(e,t){throw console.log("Invalid Delta:",e),"Invalid Delta: "+t}function i(e,t){return t.row>=0&&t.row<e.length&&t.column>=0&&t.column<=e[t.row].length}function s(e,t){t.action!="insert"&&t.action!="remove"&&r(t,"delta.action must be 'insert' or 'remove'"),t.lines instanceof Array||r(t,"delta.lines must be an Array"),(!t.start||!t.end)&&r(t,"delta.start/end must be an present");var n=t.start;i(e,t.start)||r(t,"delta.start must be contained in document");var s=t.end;t.action=="remove"&&!i(e,s)&&r(t,"delta.end must contained in document for 'remove' actions");var o=s.row-n.row,u=s.column-(o==0?n.column:0);(o!=t.lines.length-1||t.lines[o].length!=u)&&r(t,"delta.range must match delta lines")}t.applyDelta=function(e,t,n){var r=t.start.row,i=t.start.column,s=e[r]||"";switch(t.action){case"insert":var o=t.lines;if(o.length===1)e[r]=s.substring(0,i)+t.lines[0]+s.substring(i);else{var u=[r,1].concat(t.lines);e.splice.apply(e,u),e[r]=s.substring(0,i)+e[r],e[r+t.lines.length-1]+=s.substring(i)}break;case"remove":var a=t.end.column,f=t.end.row;r===f?e[r]=s.substring(0,i)+s.substring(a):e.splice(r,f-r+1,s.substring(0,i)+e[f].substring(a))}}}),ace.define("ace/anchor",["require","exports","module","ace/lib/oop","ace/lib/event_emitter"],function(e,t,n){"use strict";var r=e("./lib/oop"),i=e("./lib/event_emitter").EventEmitter,s=t.Anchor=function(e,t,n){this.$onChange=this.onChange.bind(this),this.attach(e),typeof n=="undefined"?this.setPosition(t.row,t.column):this.setPosition(t,n)};(function(){function e(e,t,n){var r=n?e.column<=t.column:e.column<t.column;return e.row<t.row||e.row==t.row&&r}function t(t,n,r){var i=t.action=="insert",s=(i?1:-1)*(t.end.row-t.start.row),o=(i?1:-1)*(t.end.column-t.start.column),u=t.start,a=i?u:t.end;return e(n,u,r)?{row:n.row,column:n.column}:e(a,n,!r)?{row:n.row+s,column:n.column+(n.row==a.row?o:0)}:{row:u.row,column:u.column}}r.implement(this,i),this.getPosition=function(){return this.$clipPositionToDocument(this.row,this.column)},this.getDocument=function(){return this.document},this.$insertRight=!1,this.onChange=function(e){if(e.start.row==e.end.row&&e.start.row!=this.row)return;if(e.start.row>this.row)return;var n=t(e,{row:this.row,column:this.column},this.$insertRight);this.setPosition(n.row,n.column,!0)},this.setPosition=function(e,t,n){var r;n?r={row:e,column:t}:r=this.$clipPositionToDocument(e,t);if(this.row==r.row&&this.column==r.column)return;var i={row:this.row,column:this.column};this.row=r.row,this.column=r.column,this._signal("change",{old:i,value:r})},this.detach=function(){this.document.removeEventListener("change",this.$onChange)},this.attach=function(e){this.document=e||this.document,this.document.on("change",this.$onChange)},this.$clipPositionToDocument=function(e,t){var n={};return e>=this.document.getLength()?(n.row=Math.max(0,this.document.getLength()-1),n.column=this.document.getLine(n.row).length):e<0?(n.row=0,n.column=0):(n.row=e,n.column=Math.min(this.document.getLine(n.row).length,Math.max(0,t))),t<0&&(n.column=0),n}}).call(s.prototype)}),ace.define("ace/document",["require","exports","module","ace/lib/oop","ace/apply_delta","ace/lib/event_emitter","ace/range","ace/anchor"],function(e,t,n){"use strict";var r=e("./lib/oop"),i=e("./apply_delta").applyDelta,s=e("./lib/event_emitter").EventEmitter,o=e("./range").Range,u=e("./anchor").Anchor,a=function(e){this.$lines=[""],e.length===0?this.$lines=[""]:Array.isArray(e)?this.insertMergedLines({row:0,column:0},e):this.insert({row:0,column:0},e)};(function(){r.implement(this,s),this.setValue=function(e){var t=this.getLength()-1;this.remove(new o(0,0,t,this.getLine(t).length)),this.insert({row:0,column:0},e)},this.getValue=function(){return this.getAllLines().join(this.getNewLineCharacter())},this.createAnchor=function(e,t){return new u(this,e,t)},"aaa".split(/a/).length===0?this.$split=function(e){return e.replace(/\r\n|\r/g,"\n").split("\n")}:this.$split=function(e){return e.split(/\r\n|\r|\n/)},this.$detectNewLine=function(e){var t=e.match(/^.*?(\r\n|\r|\n)/m);this.$autoNewLine=t?t[1]:"\n",this._signal("changeNewLineMode")},this.getNewLineCharacter=function(){switch(this.$newLineMode){case"windows":return"\r\n";case"unix":return"\n";default:return this.$autoNewLine||"\n"}},this.$autoNewLine="",this.$newLineMode="auto",this.setNewLineMode=function(e){if(this.$newLineMode===e)return;this.$newLineMode=e,this._signal("changeNewLineMode")},this.getNewLineMode=function(){return this.$newLineMode},this.isNewLine=function(e){return e=="\r\n"||e=="\r"||e=="\n"},this.getLine=function(e){return this.$lines[e]||""},this.getLines=function(e,t){return this.$lines.slice(e,t+1)},this.getAllLines=function(){return this.getLines(0,this.getLength())},this.getLength=function(){return this.$lines.length},this.getTextRange=function(e){return this.getLinesForRange(e).join(this.getNewLineCharacter())},this.getLinesForRange=function(e){var t;if(e.start.row===e.end.row)t=[this.getLine(e.start.row).substring(e.start.column,e.end.column)];else{t=this.getLines(e.start.row,e.end.row),t[0]=(t[0]||"").substring(e.start.column);var n=t.length-1;e.end.row-e.start.row==n&&(t[n]=t[n].substring(0,e.end.column))}return t},this.insertLines=function(e,t){return console.warn("Use of document.insertLines is deprecated. Use the insertFullLines method instead."),this.insertFullLines(e,t)},this.removeLines=function(e,t){return console.warn("Use of document.removeLines is deprecated. Use the removeFullLines method instead."),this.removeFullLines(e,t)},this.insertNewLine=function(e){return console.warn("Use of document.insertNewLine is deprecated. Use insertMergedLines(position, ['', '']) instead."),this.insertMergedLines(e,["",""])},this.insert=function(e,t){return this.getLength()<=1&&this.$detectNewLine(t),this.insertMergedLines(e,this.$split(t))},this.insertInLine=function(e,t){var n=this.clippedPos(e.row,e.column),r=this.pos(e.row,e.column+t.length);return this.applyDelta({start:n,end:r,action:"insert",lines:[t]},!0),this.clonePos(r)},this.clippedPos=function(e,t){var n=this.getLength();e===undefined?e=n:e<0?e=0:e>=n&&(e=n-1,t=undefined);var r=this.getLine(e);return t==undefined&&(t=r.length),t=Math.min(Math.max(t,0),r.length),{row:e,column:t}},this.clonePos=function(e){return{row:e.row,column:e.column}},this.pos=function(e,t){return{row:e,column:t}},this.$clipPosition=function(e){var t=this.getLength();return e.row>=t?(e.row=Math.max(0,t-1),e.column=this.getLine(t-1).length):(e.row=Math.max(0,e.row),e.column=Math.min(Math.max(e.column,0),this.getLine(e.row).length)),e},this.insertFullLines=function(e,t){e=Math.min(Math.max(e,0),this.getLength());var n=0;e<this.getLength()?(t=t.concat([""]),n=0):(t=[""].concat(t),e--,n=this.$lines[e].length),this.insertMergedLines({row:e,column:n},t)},this.insertMergedLines=function(e,t){var n=this.clippedPos(e.row,e.column),r={row:n.row+t.length-1,column:(t.length==1?n.column:0)+t[t.length-1].length};return this.applyDelta({start:n,end:r,action:"insert",lines:t}),this.clonePos(r)},this.remove=function(e){var t=this.clippedPos(e.start.row,e.start.column),n=this.clippedPos(e.end.row,e.end.column);return this.applyDelta({start:t,end:n,action:"remove",lines:this.getLinesForRange({start:t,end:n})}),this.clonePos(t)},this.removeInLine=function(e,t,n){var r=this.clippedPos(e,t),i=this.clippedPos(e,n);return this.applyDelta({start:r,end:i,action:"remove",lines:this.getLinesForRange({start:r,end:i})},!0),this.clonePos(r)},this.removeFullLines=function(e,t){e=Math.min(Math.max(0,e),this.getLength()-1),t=Math.min(Math.max(0,t),this.getLength()-1);var n=t==this.getLength()-1&&e>0,r=t<this.getLength()-1,i=n?e-1:e,s=n?this.getLine(i).length:0,u=r?t+1:t,a=r?0:this.getLine(u).length,f=new o(i,s,u,a),l=this.$lines.slice(e,t+1);return this.applyDelta({start:f.start,end:f.end,action:"remove",lines:this.getLinesForRange(f)}),l},this.removeNewLine=function(e){e<this.getLength()-1&&e>=0&&this.applyDelta({start:this.pos(e,this.getLine(e).length),end:this.pos(e+1,0),action:"remove",lines:["",""]})},this.replace=function(e,t){e instanceof o||(e=o.fromPoints(e.start,e.end));if(t.length===0&&e.isEmpty())return e.start;if(t==this.getTextRange(e))return e.end;this.remove(e);var n;return t?n=this.insert(e.start,t):n=e.start,n},this.applyDeltas=function(e){for(var t=0;t<e.length;t++)this.applyDelta(e[t])},this.revertDeltas=function(e){for(var t=e.length-1;t>=0;t--)this.revertDelta(e[t])},this.applyDelta=function(e,t){var n=e.action=="insert";if(n?e.lines.length<=1&&!e.lines[0]:!o.comparePoints(e.start,e.end))return;n&&e.lines.length>2e4?this.$splitAndapplyLargeDelta(e,2e4):(i(this.$lines,e,t),this._signal("change",e))},this.$splitAndapplyLargeDelta=function(e,t){var n=e.lines,r=n.length-t+1,i=e.start.row,s=e.start.column;for(var o=0,u=0;o<r;o=u){u+=t-1;var a=n.slice(o,u);a.push(""),this.applyDelta({start:this.pos(i+o,s),end:this.pos(i+u,s=0),action:e.action,lines:a},!0)}e.lines=n.slice(o),e.start.row=i+o,e.start.column=s,this.applyDelta(e,!0)},this.revertDelta=function(e){this.applyDelta({start:this.clonePos(e.start),end:this.clonePos(e.end),action:e.action=="insert"?"remove":"insert",lines:e.lines.slice()})},this.indexToPosition=function(e,t){var n=this.$lines||this.getAllLines(),r=this.getNewLineCharacter().length;for(var i=t||0,s=n.length;i<s;i++){e-=n[i].length+r;if(e<0)return{row:i,column:e+n[i].length+r}}return{row:s-1,column:e+n[s-1].length+r}},this.positionToIndex=function(e,t){var n=this.$lines||this.getAllLines(),r=this.getNewLineCharacter().length,i=0,s=Math.min(e.row,n.length);for(var o=t||0;o<s;++o)i+=n[o].length+r;return i+e.column}}).call(a.prototype),t.Document=a}),ace.define("ace/background_tokenizer",["require","exports","module","ace/lib/oop","ace/lib/event_emitter"],function(e,t,n){"use strict";var r=e("./lib/oop"),i=e("./lib/event_emitter").EventEmitter,s=function(e,t){this.running=!1,this.lines=[],this.states=[],this.currentLine=0,this.tokenizer=e;var n=this;this.$worker=function(){if(!n.running)return;var e=new Date,t=n.currentLine,r=-1,i=n.doc,s=t;while(n.lines[t])t++;var o=i.getLength(),u=0;n.running=!1;while(t<o){n.$tokenizeRow(t),r=t;do t++;while(n.lines[t]);u++;if(u%5===0&&new Date-e>20){n.running=setTimeout(n.$worker,20);break}}n.currentLine=t,r==-1&&(r=t),s<=r&&n.fireUpdateEvent(s,r)}};(function(){r.implement(this,i),this.setTokenizer=function(e){this.tokenizer=e,this.lines=[],this.states=[],this.start(0)},this.setDocument=function(e){this.doc=e,this.lines=[],this.states=[],this.stop()},this.fireUpdateEvent=function(e,t){var n={first:e,last:t};this._signal("update",{data:n})},this.start=function(e){this.currentLine=Math.min(e||0,this.currentLine,this.doc.getLength()),this.lines.splice(this.currentLine,this.lines.length),this.states.splice(this.currentLine,this.states.length),this.stop(),this.running=setTimeout(this.$worker,700)},this.scheduleStart=function(){this.running||(this.running=setTimeout(this.$worker,700))},this.$updateOnChange=function(e){var t=e.start.row,n=e.end.row-t;if(n===0)this.lines[t]=null;else if(e.action=="remove")this.lines.splice(t,n+1,null),this.states.splice(t,n+1,null);else{var r=Array(n+1);r.unshift(t,1),this.lines.splice.apply(this.lines,r),this.states.splice.apply(this.states,r)}this.currentLine=Math.min(t,this.currentLine,this.doc.getLength()),this.stop()},this.stop=function(){this.running&&clearTimeout(this.running),this.running=!1},this.getTokens=function(e){return this.lines[e]||this.$tokenizeRow(e)},this.getState=function(e){return this.currentLine==e&&this.$tokenizeRow(e),this.states[e]||"start"},this.$tokenizeRow=function(e){var t=this.doc.getLine(e),n=this.states[e-1],r=this.tokenizer.getLineTokens(t,n,e);return this.states[e]+""!=r.state+""?(this.states[e]=r.state,this.lines[e+1]=null,this.currentLine>e+1&&(this.currentLine=e+1)):this.currentLine==e&&(this.currentLine=e+1),this.lines[e]=r.tokens}}).call(s.prototype),t.BackgroundTokenizer=s}),ace.define("ace/search_highlight",["require","exports","module","ace/lib/lang","ace/lib/oop","ace/range"],function(e,t,n){"use strict";var r=e("./lib/lang"),i=e("./lib/oop"),s=e("./range").Range,o=function(e,t,n){this.setRegexp(e),this.clazz=t,this.type=n||"text"};(function(){this.MAX_RANGES=500,this.setRegexp=function(e){if(this.regExp+""==e+"")return;this.regExp=e,this.cache=[]},this.update=function(e,t,n,i){if(!this.regExp)return;var o=i.firstRow,u=i.lastRow;for(var a=o;a<=u;a++){var f=this.cache[a];f==null&&(f=r.getMatchOffsets(n.getLine(a),this.regExp),f.length>this.MAX_RANGES&&(f=f.slice(0,this.MAX_RANGES)),f=f.map(function(e){return new s(a,e.offset,a,e.offset+e.length)}),this.cache[a]=f.length?f:"");for(var l=f.length;l--;)t.drawSingleLineMarker(e,f[l].toScreenRange(n),this.clazz,i)}}}).call(o.prototype),t.SearchHighlight=o}),ace.define("ace/edit_session/fold_line",["require","exports","module","ace/range"],function(e,t,n){"use strict";function i(e,t){this.foldData=e,Array.isArray(t)?this.folds=t:t=this.folds=[t];var n=t[t.length-1];this.range=new r(t[0].start.row,t[0].start.column,n.end.row,n.end.column),this.start=this.range.start,this.end=this.range.end,this.folds.forEach(function(e){e.setFoldLine(this)},this)}var r=e("../range").Range;(function(){this.shiftRow=function(e){this.start.row+=e,this.end.row+=e,this.folds.forEach(function(t){t.start.row+=e,t.end.row+=e})},this.addFold=function(e){if(e.sameRow){if(e.start.row<this.startRow||e.endRow>this.endRow)throw new Error("Can't add a fold to this FoldLine as it has no connection");this.folds.push(e),this.folds.sort(function(e,t){return-e.range.compareEnd(t.start.row,t.start.column)}),this.range.compareEnd(e.start.row,e.start.column)>0?(this.end.row=e.end.row,this.end.column=e.end.column):this.range.compareStart(e.end.row,e.end.column)<0&&(this.start.row=e.start.row,this.start.column=e.start.column)}else if(e.start.row==this.end.row)this.folds.push(e),this.end.row=e.end.row,this.end.column=e.end.column;else{if(e.end.row!=this.start.row)throw new Error("Trying to add fold to FoldRow that doesn't have a matching row");this.folds.unshift(e),this.start.row=e.start.row,this.start.column=e.start.column}e.foldLine=this},this.containsRow=function(e){return e>=this.start.row&&e<=this.end.row},this.walk=function(e,t,n){var r=0,i=this.folds,s,o,u,a=!0;t==null&&(t=this.end.row,n=this.end.column);for(var f=0;f<i.length;f++){s=i[f],o=s.range.compareStart(t,n);if(o==-1){e(null,t,n,r,a);return}u=e(null,s.start.row,s.start.column,r,a),u=!u&&e(s.placeholder,s.start.row,s.start.column,r);if(u||o===0)return;a=!s.sameRow,r=s.end.column}e(null,t,n,r,a)},this.getNextFoldTo=function(e,t){var n,r;for(var i=0;i<this.folds.length;i++){n=this.folds[i],r=n.range.compareEnd(e,t);if(r==-1)return{fold:n,kind:"after"};if(r===0)return{fold:n,kind:"inside"}}return null},this.addRemoveChars=function(e,t,n){var r=this.getNextFoldTo(e,t),i,s;if(r){i=r.fold;if(r.kind=="inside"&&i.start.column!=t&&i.start.row!=e)window.console&&window.console.log(e,t,i);else if(i.start.row==e){s=this.folds;var o=s.indexOf(i);o===0&&(this.start.column+=n);for(o;o<s.length;o++){i=s[o],i.start.column+=n;if(!i.sameRow)return;i.end.column+=n}this.end.column+=n}}},this.split=function(e,t){var n=this.getNextFoldTo(e,t);if(!n||n.kind=="inside")return null;var r=n.fold,s=this.folds,o=this.foldData,u=s.indexOf(r),a=s[u-1];this.end.row=a.end.row,this.end.column=a.end.column,s=s.splice(u,s.length-u);var f=new i(o,s);return o.splice(o.indexOf(this)+1,0,f),f},this.merge=function(e){var t=e.folds;for(var n=0;n<t.length;n++)this.addFold(t[n]);var r=this.foldData;r.splice(r.indexOf(e),1)},this.toString=function(){var e=[this.range.toString()+": ["];return this.folds.forEach(function(t){e.push("  "+t.toString())}),e.push("]"),e.join("\n")},this.idxToPosition=function(e){var t=0;for(var n=0;n<this.folds.length;n++){var r=this.folds[n];e-=r.start.column-t;if(e<0)return{row:r.start.row,column:r.start.column+e};e-=r.placeholder.length;if(e<0)return r.start;t=r.end.column}return{row:this.end.row,column:this.end.column+e}}}).call(i.prototype),t.FoldLine=i}),ace.define("ace/range_list",["require","exports","module","ace/range"],function(e,t,n){"use strict";var r=e("./range").Range,i=r.comparePoints,s=function(){this.ranges=[]};(function(){this.comparePoints=i,this.pointIndex=function(e,t,n){var r=this.ranges;for(var s=n||0;s<r.length;s++){var o=r[s],u=i(e,o.end);if(u>0)continue;var a=i(e,o.start);return u===0?t&&a!==0?-s-2:s:a>0||a===0&&!t?s:-s-1}return-s-1},this.add=function(e){var t=!e.isEmpty(),n=this.pointIndex(e.start,t);n<0&&(n=-n-1);var r=this.pointIndex(e.end,t,n);return r<0?r=-r-1:r++,this.ranges.splice(n,r-n,e)},this.addList=function(e){var t=[];for(var n=e.length;n--;)t.push.apply(t,this.add(e[n]));return t},this.substractPoint=function(e){var t=this.pointIndex(e);if(t>=0)return this.ranges.splice(t,1)},this.merge=function(){var e=[],t=this.ranges;t=t.sort(function(e,t){return i(e.start,t.start)});var n=t[0],r;for(var s=1;s<t.length;s++){r=n,n=t[s];var o=i(r.end,n.start);if(o<0)continue;if(o==0&&!r.isEmpty()&&!n.isEmpty())continue;i(r.end,n.end)<0&&(r.end.row=n.end.row,r.end.column=n.end.column),t.splice(s,1),e.push(n),n=r,s--}return this.ranges=t,e},this.contains=function(e,t){return this.pointIndex({row:e,column:t})>=0},this.containsPoint=function(e){return this.pointIndex(e)>=0},this.rangeAtPoint=function(e){var t=this.pointIndex(e);if(t>=0)return this.ranges[t]},this.clipRows=function(e,t){var n=this.ranges;if(n[0].start.row>t||n[n.length-1].start.row<e)return[];var r=this.pointIndex({row:e,column:0});r<0&&(r=-r-1);var i=this.pointIndex({row:t,column:0},r);i<0&&(i=-i-1);var s=[];for(var o=r;o<i;o++)s.push(n[o]);return s},this.removeAll=function(){return this.ranges.splice(0,this.ranges.length)},this.attach=function(e){this.session&&this.detach(),this.session=e,this.onChange=this.$onChange.bind(this),this.session.on("change",this.onChange)},this.detach=function(){if(!this.session)return;this.session.removeListener("change",this.onChange),this.session=null},this.$onChange=function(e){var t=e.start,n=e.end,r=t.row,i=n.row,s=this.ranges;for(var o=0,u=s.length;o<u;o++){var a=s[o];if(a.end.row>=r)break}if(e.action=="insert"){var f=i-r,l=-t.column+n.column;for(;o<u;o++){var a=s[o];if(a.start.row>r)break;a.start.row==r&&a.start.column>=t.column&&(a.start.column!=t.column||!this.$insertRight)&&(a.start.column+=l,a.start.row+=f);if(a.end.row==r&&a.end.column>=t.column){if(a.end.column==t.column&&this.$insertRight)continue;a.end.column==t.column&&l>0&&o<u-1&&a.end.column>a.start.column&&a.end.column==s[o+1].start.column&&(a.end.column-=l),a.end.column+=l,a.end.row+=f}}}else{var f=r-i,l=t.column-n.column;for(;o<u;o++){var a=s[o];if(a.start.row>i)break;if(a.end.row<i&&(r<a.end.row||r==a.end.row&&t.column<a.end.column))a.end.row=r,a.end.column=t.column;else if(a.end.row==i)if(a.end.column<=n.column){if(f||a.end.column>t.column)a.end.column=t.column,a.end.row=t.row}else a.end.column+=l,a.end.row+=f;else a.end.row>i&&(a.end.row+=f);if(a.start.row<i&&(r<a.start.row||r==a.start.row&&t.column<a.start.column))a.start.row=r,a.start.column=t.column;else if(a.start.row==i)if(a.start.column<=n.column){if(f||a.start.column>t.column)a.start.column=t.column,a.start.row=t.row}else a.start.column+=l,a.start.row+=f;else a.start.row>i&&(a.start.row+=f)}}if(f!=0&&o<u)for(;o<u;o++){var a=s[o];a.start.row+=f,a.end.row+=f}}}).call(s.prototype),t.RangeList=s}),ace.define("ace/edit_session/fold",["require","exports","module","ace/range","ace/range_list","ace/lib/oop"],function(e,t,n){"use strict";function u(e,t){e.row-=t.row,e.row==0&&(e.column-=t.column)}function a(e,t){u(e.start,t),u(e.end,t)}function f(e,t){e.row==0&&(e.column+=t.column),e.row+=t.row}function l(e,t){f(e.start,t),f(e.end,t)}var r=e("../range").Range,i=e("../range_list").RangeList,s=e("../lib/oop"),o=t.Fold=function(e,t){this.foldLine=null,this.placeholder=t,this.range=e,this.start=e.start,this.end=e.end,this.sameRow=e.start.row==e.end.row,this.subFolds=this.ranges=[]};s.inherits(o,i),function(){this.toString=function(){return'"'+this.placeholder+'" '+this.range.toString()},this.setFoldLine=function(e){this.foldLine=e,this.subFolds.forEach(function(t){t.setFoldLine(e)})},this.clone=function(){var e=this.range.clone(),t=new o(e,this.placeholder);return this.subFolds.forEach(function(e){t.subFolds.push(e.clone())}),t.collapseChildren=this.collapseChildren,t},this.addSubFold=function(e){if(this.range.isEqual(e))return;if(!this.range.containsRange(e))throw new Error("A fold can't intersect already existing fold"+e.range+this.range);a(e,this.start);var t=e.start.row,n=e.start.column;for(var r=0,i=-1;r<this.subFolds.length;r++){i=this.subFolds[r].range.compare(t,n);if(i!=1)break}var s=this.subFolds[r];if(i==0)return s.addSubFold(e);var t=e.range.end.row,n=e.range.end.column;for(var o=r,i=-1;o<this.subFolds.length;o++){i=this.subFolds[o].range.compare(t,n);if(i!=1)break}var u=this.subFolds[o];if(i==0)throw new Error("A fold can't intersect already existing fold"+e.range+this.range);var f=this.subFolds.splice(r,o-r,e);return e.setFoldLine(this.foldLine),e},this.restoreRange=function(e){return l(e,this.start)}}.call(o.prototype)}),ace.define("ace/edit_session/folding",["require","exports","module","ace/range","ace/edit_session/fold_line","ace/edit_session/fold","ace/token_iterator"],function(e,t,n){"use strict";function u(){this.getFoldAt=function(e,t,n){var r=this.getFoldLine(e);if(!r)return null;var i=r.folds;for(var s=0;s<i.length;s++){var o=i[s];if(o.range.contains(e,t)){if(n==1&&o.range.isEnd(e,t))continue;if(n==-1&&o.range.isStart(e,t))continue;return o}}},this.getFoldsInRange=function(e){var t=e.start,n=e.end,r=this.$foldData,i=[];t.column+=1,n.column-=1;for(var s=0;s<r.length;s++){var o=r[s].range.compareRange(e);if(o==2)continue;if(o==-2)break;var u=r[s].folds;for(var a=0;a<u.length;a++){var f=u[a];o=f.range.compareRange(e);if(o==-2)break;if(o==2)continue;if(o==42)break;i.push(f)}}return t.column-=1,n.column+=1,i},this.getFoldsInRangeList=function(e){if(Array.isArray(e)){var t=[];e.forEach(function(e){t=t.concat(this.getFoldsInRange(e))},this)}else var t=this.getFoldsInRange(e);return t},this.getAllFolds=function(){var e=[],t=this.$foldData;for(var n=0;n<t.length;n++)for(var r=0;r<t[n].folds.length;r++)e.push(t[n].folds[r]);return e},this.getFoldStringAt=function(e,t,n,r){r=r||this.getFoldLine(e);if(!r)return null;var i={end:{column:0}},s,o;for(var u=0;u<r.folds.length;u++){o=r.folds[u];var a=o.range.compareEnd(e,t);if(a==-1){s=this.getLine(o.start.row).substring(i.end.column,o.start.column);break}if(a===0)return null;i=o}return s||(s=this.getLine(o.start.row).substring(i.end.column)),n==-1?s.substring(0,t-i.end.column):n==1?s.substring(t-i.end.column):s},this.getFoldLine=function(e,t){var n=this.$foldData,r=0;t&&(r=n.indexOf(t)),r==-1&&(r=0);for(r;r<n.length;r++){var i=n[r];if(i.start.row<=e&&i.end.row>=e)return i;if(i.end.row>e)return null}return null},this.getNextFoldLine=function(e,t){var n=this.$foldData,r=0;t&&(r=n.indexOf(t)),r==-1&&(r=0);for(r;r<n.length;r++){var i=n[r];if(i.end.row>=e)return i}return null},this.getFoldedRowCount=function(e,t){var n=this.$foldData,r=t-e+1;for(var i=0;i<n.length;i++){var s=n[i],o=s.end.row,u=s.start.row;if(o>=t){u<t&&(u>=e?r-=t-u:r=0);break}o>=e&&(u>=e?r-=o-u:r-=o-e+1)}return r},this.$addFoldLine=function(e){return this.$foldData.push(e),this.$foldData.sort(function(e,t){return e.start.row-t.start.row}),e},this.addFold=function(e,t){var n=this.$foldData,r=!1,o;e instanceof s?o=e:(o=new s(t,e),o.collapseChildren=t.collapseChildren),this.$clipRangeToDocument(o.range);var u=o.start.row,a=o.start.column,f=o.end.row,l=o.end.column;if(u<f||u==f&&a<=l-2){var c=this.getFoldAt(u,a,1),h=this.getFoldAt(f,l,-1);if(c&&h==c)return c.addSubFold(o);c&&!c.range.isStart(u,a)&&this.removeFold(c),h&&!h.range.isEnd(f,l)&&this.removeFold(h);var p=this.getFoldsInRange(o.range);p.length>0&&(this.removeFolds(p),p.forEach(function(e){o.addSubFold(e)}));for(var d=0;d<n.length;d++){var v=n[d];if(f==v.start.row){v.addFold(o),r=!0;break}if(u==v.end.row){v.addFold(o),r=!0;if(!o.sameRow){var m=n[d+1];if(m&&m.start.row==f){v.merge(m);break}}break}if(f<=v.start.row)break}return r||(v=this.$addFoldLine(new i(this.$foldData,o))),this.$useWrapMode?this.$updateWrapData(v.start.row,v.start.row):this.$updateRowLengthCache(v.start.row,v.start.row),this.$modified=!0,this._signal("changeFold",{data:o,action:"add"}),o}throw new Error("The range has to be at least 2 characters width")},this.addFolds=function(e){e.forEach(function(e){this.addFold(e)},this)},this.removeFold=function(e){var t=e.foldLine,n=t.start.row,r=t.end.row,i=this.$foldData,s=t.folds;if(s.length==1)i.splice(i.indexOf(t),1);else if(t.range.isEnd(e.end.row,e.end.column))s.pop(),t.end.row=s[s.length-1].end.row,t.end.column=s[s.length-1].end.column;else if(t.range.isStart(e.start.row,e.start.column))s.shift(),t.start.row=s[0].start.row,t.start.column=s[0].start.column;else if(e.sameRow)s.splice(s.indexOf(e),1);else{var o=t.split(e.start.row,e.start.column);s=o.folds,s.shift(),o.start.row=s[0].start.row,o.start.column=s[0].start.column}this.$updating||(this.$useWrapMode?this.$updateWrapData(n,r):this.$updateRowLengthCache(n,r)),this.$modified=!0,this._signal("changeFold",{data:e,action:"remove"})},this.removeFolds=function(e){var t=[];for(var n=0;n<e.length;n++)t.push(e[n]);t.forEach(function(e){this.removeFold(e)},this),this.$modified=!0},this.expandFold=function(e){this.removeFold(e),e.subFolds.forEach(function(t){e.restoreRange(t),this.addFold(t)},this),e.collapseChildren>0&&this.foldAll(e.start.row+1,e.end.row,e.collapseChildren-1),e.subFolds=[]},this.expandFolds=function(e){e.forEach(function(e){this.expandFold(e)},this)},this.unfold=function(e,t){var n,i;e==null?(n=new r(0,0,this.getLength(),0),t=!0):typeof e=="number"?n=new r(e,0,e,this.getLine(e).length):"row"in e?n=r.fromPoints(e,e):n=e,i=this.getFoldsInRangeList(n);if(t)this.removeFolds(i);else{var s=i;while(s.length)this.expandFolds(s),s=this.getFoldsInRangeList(n)}if(i.length)return i},this.isRowFolded=function(e,t){return!!this.getFoldLine(e,t)},this.getRowFoldEnd=function(e,t){var n=this.getFoldLine(e,t);return n?n.end.row:e},this.getRowFoldStart=function(e,t){var n=this.getFoldLine(e,t);return n?n.start.row:e},this.getFoldDisplayLine=function(e,t,n,r,i){r==null&&(r=e.start.row),i==null&&(i=0),t==null&&(t=e.end.row),n==null&&(n=this.getLine(t).length);var s=this.doc,o="";return e.walk(function(e,t,n,u){if(t<r)return;if(t==r){if(n<i)return;u=Math.max(i,u)}e!=null?o+=e:o+=s.getLine(t).substring(u,n)},t,n),o},this.getDisplayLine=function(e,t,n,r){var i=this.getFoldLine(e);if(!i){var s;return s=this.doc.getLine(e),s.substring(r||0,t||s.length)}return this.getFoldDisplayLine(i,e,t,n,r)},this.$cloneFoldData=function(){var e=[];return e=this.$foldData.map(function(t){var n=t.folds.map(function(e){return e.clone()});return new i(e,n)}),e},this.toggleFold=function(e){var t=this.selection,n=t.getRange(),r,i;if(n.isEmpty()){var s=n.start;r=this.getFoldAt(s.row,s.column);if(r){this.expandFold(r);return}(i=this.findMatchingBracket(s))?n.comparePoint(i)==1?n.end=i:(n.start=i,n.start.column++,n.end.column--):(i=this.findMatchingBracket({row:s.row,column:s.column+1}))?(n.comparePoint(i)==1?n.end=i:n.start=i,n.start.column++):n=this.getCommentFoldRange(s.row,s.column)||n}else{var o=this.getFoldsInRange(n);if(e&&o.length){this.expandFolds(o);return}o.length==1&&(r=o[0])}r||(r=this.getFoldAt(n.start.row,n.start.column));if(r&&r.range.toString()==n.toString()){this.expandFold(r);return}var u="...";if(!n.isMultiLine()){u=this.getTextRange(n);if(u.length<4)return;u=u.trim().substring(0,2)+".."}this.addFold(u,n)},this.getCommentFoldRange=function(e,t,n){var i=new o(this,e,t),s=i.getCurrentToken(),u=s.type;if(s&&/^comment|string/.test(u)){u=u.match(/comment|string/)[0],u=="comment"&&(u+="|doc-start");var a=new RegExp(u),f=new r;if(n!=1){do s=i.stepBackward();while(s&&a.test(s.type));i.stepForward()}f.start.row=i.getCurrentTokenRow(),f.start.column=i.getCurrentTokenColumn()+2,i=new o(this,e,t);if(n!=-1){var l=-1;do{s=i.stepForward();if(l==-1){var c=this.getState(i.$row);a.test(c)||(l=i.$row)}else if(i.$row>l)break}while(s&&a.test(s.type));s=i.stepBackward()}else s=i.getCurrentToken();return f.end.row=i.getCurrentTokenRow(),f.end.column=i.getCurrentTokenColumn()+s.value.length-2,f}},this.foldAll=function(e,t,n){n==undefined&&(n=1e5);var r=this.foldWidgets;if(!r)return;t=t||this.getLength(),e=e||0;for(var i=e;i<t;i++){r[i]==null&&(r[i]=this.getFoldWidget(i));if(r[i]!="start")continue;var s=this.getFoldWidgetRange(i);if(s&&s.isMultiLine()&&s.end.row<=t&&s.start.row>=e){i=s.end.row;try{var o=this.addFold("...",s);o&&(o.collapseChildren=n)}catch(u){}}}},this.$foldStyles={manual:1,markbegin:1,markbeginend:1},this.$foldStyle="markbegin",this.setFoldStyle=function(e){if(!this.$foldStyles[e])throw new Error("invalid fold style: "+e+"["+Object.keys(this.$foldStyles).join(", ")+"]");if(this.$foldStyle==e)return;this.$foldStyle=e,e=="manual"&&this.unfold();var t=this.$foldMode;this.$setFolding(null),this.$setFolding(t)},this.$setFolding=function(e){if(this.$foldMode==e)return;this.$foldMode=e,this.off("change",this.$updateFoldWidgets),this.off("tokenizerUpdate",this.$tokenizerUpdateFoldWidgets),this._signal("changeAnnotation");if(!e||this.$foldStyle=="manual"){this.foldWidgets=null;return}this.foldWidgets=[],this.getFoldWidget=e.getFoldWidget.bind(e,this,this.$foldStyle),this.getFoldWidgetRange=e.getFoldWidgetRange.bind(e,this,this.$foldStyle),this.$updateFoldWidgets=this.updateFoldWidgets.bind(this),this.$tokenizerUpdateFoldWidgets=this.tokenizerUpdateFoldWidgets.bind(this),this.on("change",this.$updateFoldWidgets),this.on("tokenizerUpdate",this.$tokenizerUpdateFoldWidgets)},this.getParentFoldRangeData=function(e,t){var n=this.foldWidgets;if(!n||t&&n[e])return{};var r=e-1,i;while(r>=0){var s=n[r];s==null&&(s=n[r]=this.getFoldWidget(r));if(s=="start"){var o=this.getFoldWidgetRange(r);i||(i=o);if(o&&o.end.row>=e)break}r--}return{range:r!==-1&&o,firstRange:i}},this.onFoldWidgetClick=function(e,t){t=t.domEvent;var n={children:t.shiftKey,all:t.ctrlKey||t.metaKey,siblings:t.altKey},r=this.$toggleFoldWidget(e,n);if(!r){var i=t.target||t.srcElement;i&&/ace_fold-widget/.test(i.className)&&(i.className+=" ace_invalid")}},this.$toggleFoldWidget=function(e,t){if(!this.getFoldWidget)return;var n=this.getFoldWidget(e),r=this.getLine(e),i=n==="end"?-1:1,s=this.getFoldAt(e,i===-1?0:r.length,i);if(s)return t.children||t.all?this.removeFold(s):this.expandFold(s),s;var o=this.getFoldWidgetRange(e,!0);if(o&&!o.isMultiLine()){s=this.getFoldAt(o.start.row,o.start.column,1);if(s&&o.isEqual(s.range))return this.removeFold(s),s}if(t.siblings){var u=this.getParentFoldRangeData(e);if(u.range)var a=u.range.start.row+1,f=u.range.end.row;this.foldAll(a,f,t.all?1e4:0)}else t.children?(f=o?o.end.row:this.getLength(),this.foldAll(e+1,f,t.all?1e4:0)):o&&(t.all&&(o.collapseChildren=1e4),this.addFold("...",o));return o},this.toggleFoldWidget=function(e){var t=this.selection.getCursor().row;t=this.getRowFoldStart(t);var n=this.$toggleFoldWidget(t,{});if(n)return;var r=this.getParentFoldRangeData(t,!0);n=r.range||r.firstRange;if(n){t=n.start.row;var i=this.getFoldAt(t,this.getLine(t).length,1);i?this.removeFold(i):this.addFold("...",n)}},this.updateFoldWidgets=function(e){var t=e.start.row,n=e.end.row-t;if(n===0)this.foldWidgets[t]=null;else if(e.action=="remove")this.foldWidgets.splice(t,n+1,null);else{var r=Array(n+1);r.unshift(t,1),this.foldWidgets.splice.apply(this.foldWidgets,r)}},this.tokenizerUpdateFoldWidgets=function(e){var t=e.data;t.first!=t.last&&this.foldWidgets.length>t.first&&this.foldWidgets.splice(t.first,this.foldWidgets.length)}}var r=e("../range").Range,i=e("./fold_line").FoldLine,s=e("./fold").Fold,o=e("../token_iterator").TokenIterator;t.Folding=u}),ace.define("ace/edit_session/bracket_match",["require","exports","module","ace/token_iterator","ace/range"],function(e,t,n){"use strict";function s(){this.findMatchingBracket=function(e,t){if(e.column==0)return null;var n=t||this.getLine(e.row).charAt(e.column-1);if(n=="")return null;var r=n.match(/([\(\[\{])|([\)\]\}])/);return r?r[1]?this.$findClosingBracket(r[1],e):this.$findOpeningBracket(r[2],e):null},this.getBracketRange=function(e){var t=this.getLine(e.row),n=!0,r,s=t.charAt(e.column-1),o=s&&s.match(/([\(\[\{])|([\)\]\}])/);o||(s=t.charAt(e.column),e={row:e.row,column:e.column+1},o=s&&s.match(/([\(\[\{])|([\)\]\}])/),n=!1);if(!o)return null;if(o[1]){var u=this.$findClosingBracket(o[1],e);if(!u)return null;r=i.fromPoints(e,u),n||(r.end.column++,r.start.column--),r.cursor=r.end}else{var u=this.$findOpeningBracket(o[2],e);if(!u)return null;r=i.fromPoints(u,e),n||(r.start.column++,r.end.column--),r.cursor=r.start}return r},this.$brackets={")":"(","(":")","]":"[","[":"]","{":"}","}":"{","<":">",">":"<"},this.$findOpeningBracket=function(e,t,n){var i=this.$brackets[e],s=1,o=new r(this,t.row,t.column),u=o.getCurrentToken();u||(u=o.stepForward());if(!u)return;n||(n=new RegExp("(\\.?"+u.type.replace(".","\\.").replace("rparen",".paren").replace(/\b(?:end)\b/,"(?:start|begin|end)")+")+"));var a=t.column-o.getCurrentTokenColumn()-2,f=u.value;for(;;){while(a>=0){var l=f.charAt(a);if(l==i){s-=1;if(s==0)return{row:o.getCurrentTokenRow(),column:a+o.getCurrentTokenColumn()}}else l==e&&(s+=1);a-=1}do u=o.stepBackward();while(u&&!n.test(u.type));if(u==null)break;f=u.value,a=f.length-1}return null},this.$findClosingBracket=function(e,t,n){var i=this.$brackets[e],s=1,o=new r(this,t.row,t.column),u=o.getCurrentToken();u||(u=o.stepForward());if(!u)return;n||(n=new RegExp("(\\.?"+u.type.replace(".","\\.").replace("lparen",".paren").replace(/\b(?:start|begin)\b/,"(?:start|begin|end)")+")+"));var a=t.column-o.getCurrentTokenColumn();for(;;){var f=u.value,l=f.length;while(a<l){var c=f.charAt(a);if(c==i){s-=1;if(s==0)return{row:o.getCurrentTokenRow(),column:a+o.getCurrentTokenColumn()}}else c==e&&(s+=1);a+=1}do u=o.stepForward();while(u&&!n.test(u.type));if(u==null)break;a=0}return null}}var r=e("../token_iterator").TokenIterator,i=e("../range").Range;t.BracketMatch=s}),ace.define("ace/edit_session",["require","exports","module","ace/lib/oop","ace/lib/lang","ace/bidihandler","ace/config","ace/lib/event_emitter","ace/selection","ace/mode/text","ace/range","ace/document","ace/background_tokenizer","ace/search_highlight","ace/edit_session/folding","ace/edit_session/bracket_match"],function(e,t,n){"use strict";var r=e("./lib/oop"),i=e("./lib/lang"),s=e("./bidihandler").BidiHandler,o=e("./config"),u=e("./lib/event_emitter").EventEmitter,a=e("./selection").Selection,f=e("./mode/text").Mode,l=e("./range").Range,c=e("./document").Document,h=e("./background_tokenizer").BackgroundTokenizer,p=e("./search_highlight").SearchHighlight,d=function(e,t){this.$breakpoints=[],this.$decorations=[],this.$frontMarkers={},this.$backMarkers={},this.$markerId=1,this.$undoSelect=!0,this.$foldData=[],this.id="session"+ ++d.$uid,this.$foldData.toString=function(){return this.join("\n")},this.on("changeFold",this.onChangeFold.bind(this)),this.$onChange=this.onChange.bind(this);if(typeof e!="object"||!e.getLine)e=new c(e);this.setDocument(e),this.selection=new a(this),this.$bidiHandler=new s(this),o.resetOptions(this),this.setMode(t),o._signal("session",this)};d.$uid=0,function(){function m(e){return e<4352?!1:e>=4352&&e<=4447||e>=4515&&e<=4519||e>=4602&&e<=4607||e>=9001&&e<=9002||e>=11904&&e<=11929||e>=11931&&e<=12019||e>=12032&&e<=12245||e>=12272&&e<=12283||e>=12288&&e<=12350||e>=12353&&e<=12438||e>=12441&&e<=12543||e>=12549&&e<=12589||e>=12593&&e<=12686||e>=12688&&e<=12730||e>=12736&&e<=12771||e>=12784&&e<=12830||e>=12832&&e<=12871||e>=12880&&e<=13054||e>=13056&&e<=19903||e>=19968&&e<=42124||e>=42128&&e<=42182||e>=43360&&e<=43388||e>=44032&&e<=55203||e>=55216&&e<=55238||e>=55243&&e<=55291||e>=63744&&e<=64255||e>=65040&&e<=65049||e>=65072&&e<=65106||e>=65108&&e<=65126||e>=65128&&e<=65131||e>=65281&&e<=65376||e>=65504&&e<=65510}r.implement(this,u),this.setDocument=function(e){this.doc&&this.doc.removeListener("change",this.$onChange),this.doc=e,e.on("change",this.$onChange),this.bgTokenizer&&this.bgTokenizer.setDocument(this.getDocument()),this.resetCaches()},this.getDocument=function(){return this.doc},this.$resetRowCache=function(e){if(!e){this.$docRowCache=[],this.$screenRowCache=[];return}var t=this.$docRowCache.length,n=this.$getRowCacheIndex(this.$docRowCache,e)+1;t>n&&(this.$docRowCache.splice(n,t),this.$screenRowCache.splice(n,t))},this.$getRowCacheIndex=function(e,t){var n=0,r=e.length-1;while(n<=r){var i=n+r>>1,s=e[i];if(t>s)n=i+1;else{if(!(t<s))return i;r=i-1}}return n-1},this.resetCaches=function(){this.$modified=!0,this.$wrapData=[],this.$rowLengthCache=[],this.$resetRowCache(0),this.bgTokenizer&&this.bgTokenizer.start(0)},this.onChangeFold=function(e){var t=e.data;this.$resetRowCache(t.start.row)},this.onChange=function(e){this.$modified=!0,this.$bidiHandler.onChange(e),this.$resetRowCache(e.start.row);var t=this.$updateInternalDataOnChange(e);!this.$fromUndo&&this.$undoManager&&(t&&t.length&&(this.$undoManager.add({action:"removeFolds",folds:t},this.mergeUndoDeltas),this.mergeUndoDeltas=!0),this.$undoManager.add(e,this.mergeUndoDeltas),this.mergeUndoDeltas=!0,this.$informUndoManager.schedule()),this.bgTokenizer&&this.bgTokenizer.$updateOnChange(e),this._signal("change",e)},this.setValue=function(e){this.doc.setValue(e),this.selection.moveTo(0,0),this.$resetRowCache(0),this.setUndoManager(this.$undoManager),this.getUndoManager().reset()},this.getValue=this.toString=function(){return this.doc.getValue()},this.getSelection=function(){return this.selection},this.getState=function(e){return this.bgTokenizer.getState(e)},this.getTokens=function(e){return this.bgTokenizer.getTokens(e)},this.getTokenAt=function(e,t){var n=this.bgTokenizer.getTokens(e),r,i=0;if(t==null){var s=n.length-1;i=this.getLine(e).length}else for(var s=0;s<n.length;s++){i+=n[s].value.length;if(i>=t)break}return r=n[s],r?(r.index=s,r.start=i-r.value.length,r):null},this.setUndoManager=function(e){this.$undoManager=e,this.$informUndoManager&&this.$informUndoManager.cancel();if(e){var t=this;e.addSession(this),this.$syncInformUndoManager=function(){t.$informUndoManager.cancel(),t.mergeUndoDeltas=!1},this.$informUndoManager=i.delayedCall(this.$syncInformUndoManager)}else this.$syncInformUndoManager=function(){}},this.markUndoGroup=function(){this.$syncInformUndoManager&&this.$syncInformUndoManager()},this.$defaultUndoManager={undo:function(){},redo:function(){},reset:function(){},add:function(){},addSelection:function(){},startNewGroup:function(){},addSession:function(){}},this.getUndoManager=function(){return this.$undoManager||this.$defaultUndoManager},this.getTabString=function(){return this.getUseSoftTabs()?i.stringRepeat(" ",this.getTabSize()):"	"},this.setUseSoftTabs=function(e){this.setOption("useSoftTabs",e)},this.getUseSoftTabs=function(){return this.$useSoftTabs&&!this.$mode.$indentWithTabs},this.setTabSize=function(e){this.setOption("tabSize",e)},this.getTabSize=function(){return this.$tabSize},this.isTabStop=function(e){return this.$useSoftTabs&&e.column%this.$tabSize===0},this.setNavigateWithinSoftTabs=function(e){this.setOption("navigateWithinSoftTabs",e)},this.getNavigateWithinSoftTabs=function(){return this.$navigateWithinSoftTabs},this.$overwrite=!1,this.setOverwrite=function(e){this.setOption("overwrite",e)},this.getOverwrite=function(){return this.$overwrite},this.toggleOverwrite=function(){this.setOverwrite(!this.$overwrite)},this.addGutterDecoration=function(e,t){this.$decorations[e]||(this.$decorations[e]=""),this.$decorations[e]+=" "+t,this._signal("changeBreakpoint",{})},this.removeGutterDecoration=function(e,t){this.$decorations[e]=(this.$decorations[e]||"").replace(" "+t,""),this._signal("changeBreakpoint",{})},this.getBreakpoints=function(){return this.$breakpoints},this.setBreakpoints=function(e){this.$breakpoints=[];for(var t=0;t<e.length;t++)this.$breakpoints[e[t]]="ace_breakpoint";this._signal("changeBreakpoint",{})},this.clearBreakpoints=function(){this.$breakpoints=[],this._signal("changeBreakpoint",{})},this.setBreakpoint=function(e,t){t===undefined&&(t="ace_breakpoint"),t?this.$breakpoints[e]=t:delete this.$breakpoints[e],this._signal("changeBreakpoint",{})},this.clearBreakpoint=function(e){delete this.$breakpoints[e],this._signal("changeBreakpoint",{})},this.addMarker=function(e,t,n,r){var i=this.$markerId++,s={range:e,type:n||"line",renderer:typeof n=="function"?n:null,clazz:t,inFront:!!r,id:i};return r?(this.$frontMarkers[i]=s,this._signal("changeFrontMarker")):(this.$backMarkers[i]=s,this._signal("changeBackMarker")),i},this.addDynamicMarker=function(e,t){if(!e.update)return;var n=this.$markerId++;return e.id=n,e.inFront=!!t,t?(this.$frontMarkers[n]=e,this._signal("changeFrontMarker")):(this.$backMarkers[n]=e,this._signal("changeBackMarker")),e},this.removeMarker=function(e){var t=this.$frontMarkers[e]||this.$backMarkers[e];if(!t)return;var n=t.inFront?this.$frontMarkers:this.$backMarkers;delete n[e],this._signal(t.inFront?"changeFrontMarker":"changeBackMarker")},this.getMarkers=function(e){return e?this.$frontMarkers:this.$backMarkers},this.highlight=function(e){if(!this.$searchHighlight){var t=new p(null,"ace_selected-word","text");this.$searchHighlight=this.addDynamicMarker(t)}this.$searchHighlight.setRegexp(e)},this.highlightLines=function(e,t,n,r){typeof t!="number"&&(n=t,t=e),n||(n="ace_step");var i=new l(e,0,t,Infinity);return i.id=this.addMarker(i,n,"fullLine",r),i},this.setAnnotations=function(e){this.$annotations=e,this._signal("changeAnnotation",{})},this.getAnnotations=function(){return this.$annotations||[]},this.clearAnnotations=function(){this.setAnnotations([])},this.$detectNewLine=function(e){var t=e.match(/^.*?(\r?\n)/m);t?this.$autoNewLine=t[1]:this.$autoNewLine="\n"},this.getWordRange=function(e,t){var n=this.getLine(e),r=!1;t>0&&(r=!!n.charAt(t-1).match(this.tokenRe)),r||(r=!!n.charAt(t).match(this.tokenRe));if(r)var i=this.tokenRe;else if(/^\s+$/.test(n.slice(t-1,t+1)))var i=/\s/;else var i=this.nonTokenRe;var s=t;if(s>0){do s--;while(s>=0&&n.charAt(s).match(i));s++}var o=t;while(o<n.length&&n.charAt(o).match(i))o++;return new l(e,s,e,o)},this.getAWordRange=function(e,t){var n=this.getWordRange(e,t),r=this.getLine(n.end.row);while(r.charAt(n.end.column).match(/[ \t]/))n.end.column+=1;return n},this.setNewLineMode=function(e){this.doc.setNewLineMode(e)},this.getNewLineMode=function(){return this.doc.getNewLineMode()},this.setUseWorker=function(e){this.setOption("useWorker",e)},this.getUseWorker=function(){return this.$useWorker},this.onReloadTokenizer=function(e){var t=e.data;this.bgTokenizer.start(t.first),this._signal("tokenizerUpdate",e)},this.$modes=o.$modes,this.$mode=null,this.$modeId=null,this.setMode=function(e,t){if(e&&typeof e=="object"){if(e.getTokenizer)return this.$onChangeMode(e);var n=e,r=n.path}else r=e||"ace/mode/text";this.$modes["ace/mode/text"]||(this.$modes["ace/mode/text"]=new f);if(this.$modes[r]&&!n){this.$onChangeMode(this.$modes[r]),t&&t();return}this.$modeId=r,o.loadModule(["mode",r],function(e){if(this.$modeId!==r)return t&&t();this.$modes[r]&&!n?this.$onChangeMode(this.$modes[r]):e&&e.Mode&&(e=new e.Mode(n),n||(this.$modes[r]=e,e.$id=r),this.$onChangeMode(e)),t&&t()}.bind(this)),this.$mode||this.$onChangeMode(this.$modes["ace/mode/text"],!0)},this.$onChangeMode=function(e,t){t||(this.$modeId=e.$id);if(this.$mode===e)return;this.$mode=e,this.$stopWorker(),this.$useWorker&&this.$startWorker();var n=e.getTokenizer();if(n.addEventListener!==undefined){var r=this.onReloadTokenizer.bind(this);n.addEventListener("update",r)}if(!this.bgTokenizer){this.bgTokenizer=new h(n);var i=this;this.bgTokenizer.addEventListener("update",function(e){i._signal("tokenizerUpdate",e)})}else this.bgTokenizer.setTokenizer(n);this.bgTokenizer.setDocument(this.getDocument()),this.tokenRe=e.tokenRe,this.nonTokenRe=e.nonTokenRe,t||(e.attachToSession&&e.attachToSession(this),this.$options.wrapMethod.set.call(this,this.$wrapMethod),this.$setFolding(e.foldingRules),this.bgTokenizer.start(0),this._emit("changeMode"))},this.$stopWorker=function(){this.$worker&&(this.$worker.terminate(),this.$worker=null)},this.$startWorker=function(){try{this.$worker=this.$mode.createWorker(this)}catch(e){o.warn("Could not load worker",e),this.$worker=null}},this.getMode=function(){return this.$mode},this.$scrollTop=0,this.setScrollTop=function(e){if(this.$scrollTop===e||isNaN(e))return;this.$scrollTop=e,this._signal("changeScrollTop",e)},this.getScrollTop=function(){return this.$scrollTop},this.$scrollLeft=0,this.setScrollLeft=function(e){if(this.$scrollLeft===e||isNaN(e))return;this.$scrollLeft=e,this._signal("changeScrollLeft",e)},this.getScrollLeft=function(){return this.$scrollLeft},this.getScreenWidth=function(){return this.$computeWidth(),this.lineWidgets?Math.max(this.getLineWidgetMaxWidth(),this.screenWidth):this.screenWidth},this.getLineWidgetMaxWidth=function(){if(this.lineWidgetsWidth!=null)return this.lineWidgetsWidth;var e=0;return this.lineWidgets.forEach(function(t){t&&t.screenWidth>e&&(e=t.screenWidth)}),this.lineWidgetWidth=e},this.$computeWidth=function(e){if(this.$modified||e){this.$modified=!1;if(this.$useWrapMode)return this.screenWidth=this.$wrapLimit;var t=this.doc.getAllLines(),n=this.$rowLengthCache,r=0,i=0,s=this.$foldData[i],o=s?s.start.row:Infinity,u=t.length;for(var a=0;a<u;a++){if(a>o){a=s.end.row+1;if(a>=u)break;s=this.$foldData[i++],o=s?s.start.row:Infinity}n[a]==null&&(n[a]=this.$getStringScreenWidth(t[a])[0]),n[a]>r&&(r=n[a])}this.screenWidth=r}},this.getLine=function(e){return this.doc.getLine(e)},this.getLines=function(e,t){return this.doc.getLines(e,t)},this.getLength=function(){return this.doc.getLength()},this.getTextRange=function(e){return this.doc.getTextRange(e||this.selection.getRange())},this.insert=function(e,t){return this.doc.insert(e,t)},this.remove=function(e){return this.doc.remove(e)},this.removeFullLines=function(e,t){return this.doc.removeFullLines(e,t)},this.undoChanges=function(e,t){if(!e.length)return;this.$fromUndo=!0;for(var n=e.length-1;n!=-1;n--){var r=e[n];r.action=="insert"||r.action=="remove"?this.doc.revertDelta(r):r.folds&&this.addFolds(r.folds)}!t&&this.$undoSelect&&(e.selectionBefore?this.selection.fromJSON(e.selectionBefore):this.selection.setRange(this.$getUndoSelection(e,!0))),this.$fromUndo=!1},this.redoChanges=function(e,t){if(!e.length)return;this.$fromUndo=!0;for(var n=0;n<e.length;n++){var r=e[n];(r.action=="insert"||r.action=="remove")&&this.doc.applyDelta(r)}!t&&this.$undoSelect&&(e.selectionAfter?this.selection.fromJSON(e.selectionAfter):this.selection.setRange(this.$getUndoSelection(e,!1))),this.$fromUndo=!1},this.setUndoSelect=function(e){this.$undoSelect=e},this.$getUndoSelection=function(e,t){function n(e){return t?e.action!=="insert":e.action==="insert"}var r,i,s;for(var o=0;o<e.length;o++){var u=e[o];if(!u.start)continue;if(!r){n(u)?(r=l.fromPoints(u.start,u.end),s=!0):(r=l.fromPoints(u.start,u.start),s=!1);continue}n(u)?(i=u.start,r.compare(i.row,i.column)==-1&&r.setStart(i),i=u.end,r.compare(i.row,i.column)==1&&r.setEnd(i),s=!0):(i=u.start,r.compare(i.row,i.column)==-1&&(r=l.fromPoints(u.start,u.start)),s=!1)}return r},this.replace=function(e,t){return this.doc.replace(e,t)},this.moveText=function(e,t,n){var r=this.getTextRange(e),i=this.getFoldsInRange(e),s=l.fromPoints(t,t);if(!n){this.remove(e);var o=e.start.row-e.end.row,u=o?-e.end.column:e.start.column-e.end.column;u&&(s.start.row==e.end.row&&s.start.column>e.end.column&&(s.start.column+=u),s.end.row==e.end.row&&s.end.column>e.end.column&&(s.end.column+=u)),o&&s.start.row>=e.end.row&&(s.start.row+=o,s.end.row+=o)}s.end=this.insert(s.start,r);if(i.length){var a=e.start,f=s.start,o=f.row-a.row,u=f.column-a.column;this.addFolds(i.map(function(e){return e=e.clone(),e.start.row==a.row&&(e.start.column+=u),e.end.row==a.row&&(e.end.column+=u),e.start.row+=o,e.end.row+=o,e}))}return s},this.indentRows=function(e,t,n){n=n.replace(/\t/g,this.getTabString());for(var r=e;r<=t;r++)this.doc.insertInLine({row:r,column:0},n)},this.outdentRows=function(e){var t=e.collapseRows(),n=new l(0,0,0,0),r=this.getTabSize();for(var i=t.start.row;i<=t.end.row;++i){var s=this.getLine(i);n.start.row=i,n.end.row=i;for(var o=0;o<r;++o)if(s.charAt(o)!=" ")break;o<r&&s.charAt(o)=="	"?(n.start.column=o,n.end.column=o+1):(n.start.column=0,n.end.column=o),this.remove(n)}},this.$moveLines=function(e,t,n){e=this.getRowFoldStart(e),t=this.getRowFoldEnd(t);if(n<0){var r=this.getRowFoldStart(e+n);if(r<0)return 0;var i=r-e}else if(n>0){var r=this.getRowFoldEnd(t+n);if(r>this.doc.getLength()-1)return 0;var i=r-t}else{e=this.$clipRowToDocument(e),t=this.$clipRowToDocument(t);var i=t-e+1}var s=new l(e,0,t,Number.MAX_VALUE),o=this.getFoldsInRange(s).map(function(e){return e=e.clone(),e.start.row+=i,e.end.row+=i,e}),u=n==0?this.doc.getLines(e,t):this.doc.removeFullLines(e,t);return this.doc.insertFullLines(e+i,u),o.length&&this.addFolds(o),i},this.moveLinesUp=function(e,t){return this.$moveLines(e,t,-1)},this.moveLinesDown=function(e,t){return this.$moveLines(e,t,1)},this.duplicateLines=function(e,t){return this.$moveLines(e,t,0)},this.$clipRowToDocument=function(e){return Math.max(0,Math.min(e,this.doc.getLength()-1))},this.$clipColumnToRow=function(e,t){return t<0?0:Math.min(this.doc.getLine(e).length,t)},this.$clipPositionToDocument=function(e,t){t=Math.max(0,t);if(e<0)e=0,t=0;else{var n=this.doc.getLength();e>=n?(e=n-1,t=this.doc.getLine(n-1).length):t=Math.min(this.doc.getLine(e).length,t)}return{row:e,column:t}},this.$clipRangeToDocument=function(e){e.start.row<0?(e.start.row=0,e.start.column=0):e.start.column=this.$clipColumnToRow(e.start.row,e.start.column);var t=this.doc.getLength()-1;return e.end.row>t?(e.end.row=t,e.end.column=this.doc.getLine(t).length):e.end.column=this.$clipColumnToRow(e.end.row,e.end.column),e},this.$wrapLimit=80,this.$useWrapMode=!1,this.$wrapLimitRange={min:null,max:null},this.setUseWrapMode=function(e){if(e!=this.$useWrapMode){this.$useWrapMode=e,this.$modified=!0,this.$resetRowCache(0);if(e){var t=this.getLength();this.$wrapData=Array(t),this.$updateWrapData(0,t-1)}this._signal("changeWrapMode")}},this.getUseWrapMode=function(){return this.$useWrapMode},this.setWrapLimitRange=function(e,t){if(this.$wrapLimitRange.min!==e||this.$wrapLimitRange.max!==t)this.$wrapLimitRange={min:e,max:t},this.$modified=!0,this.$bidiHandler.markAsDirty(),this.$useWrapMode&&this._signal("changeWrapMode")},this.adjustWrapLimit=function(e,t){var n=this.$wrapLimitRange;n.max<0&&(n={min:t,max:t});var r=this.$constrainWrapLimit(e,n.min,n.max);return r!=this.$wrapLimit&&r>1?(this.$wrapLimit=r,this.$modified=!0,this.$useWrapMode&&(this.$updateWrapData(0,this.getLength()-1),this.$resetRowCache(0),this._signal("changeWrapLimit")),!0):!1},this.$constrainWrapLimit=function(e,t,n){return t&&(e=Math.max(t,e)),n&&(e=Math.min(n,e)),e},this.getWrapLimit=function(){return this.$wrapLimit},this.setWrapLimit=function(e){this.setWrapLimitRange(e,e)},this.getWrapLimitRange=function(){return{min:this.$wrapLimitRange.min,max:this.$wrapLimitRange.max}},this.$updateInternalDataOnChange=function(e){var t=this.$useWrapMode,n=e.action,r=e.start,i=e.end,s=r.row,o=i.row,u=o-s,a=null;this.$updating=!0;if(u!=0)if(n==="remove"){this[t?"$wrapData":"$rowLengthCache"].splice(s,u);var f=this.$foldData;a=this.getFoldsInRange(e),this.removeFolds(a);var l=this.getFoldLine(i.row),c=0;if(l){l.addRemoveChars(i.row,i.column,r.column-i.column),l.shiftRow(-u);var h=this.getFoldLine(s);h&&h!==l&&(h.merge(l),l=h),c=f.indexOf(l)+1}for(c;c<f.length;c++){var l=f[c];l.start.row>=i.row&&l.shiftRow(-u)}o=s}else{var p=Array(u);p.unshift(s,0);var d=t?this.$wrapData:this.$rowLengthCache;d.splice.apply(d,p);var f=this.$foldData,l=this.getFoldLine(s),c=0;if(l){var v=l.range.compareInside(r.row,r.column);v==0?(l=l.split(r.row,r.column),l&&(l.shiftRow(u),l.addRemoveChars(o,0,i.column-r.column))):v==-1&&(l.addRemoveChars(s,0,i.column-r.column),l.shiftRow(u)),c=f.indexOf(l)+1}for(c;c<f.length;c++){var l=f[c];l.start.row>=s&&l.shiftRow(u)}}else{u=Math.abs(e.start.column-e.end.column),n==="remove"&&(a=this.getFoldsInRange(e),this.removeFolds(a),u=-u);var l=this.getFoldLine(s);l&&l.addRemoveChars(s,r.column,u)}return t&&this.$wrapData.length!=this.doc.getLength()&&console.error("doc.getLength() and $wrapData.length have to be the same!"),this.$updating=!1,t?this.$updateWrapData(s,o):this.$updateRowLengthCache(s,o),a},this.$updateRowLengthCache=function(e,t,n){this.$rowLengthCache[e]=null,this.$rowLengthCache[t]=null},this.$updateWrapData=function(e,t){var r=this.doc.getAllLines(),i=this.getTabSize(),o=this.$wrapData,u=this.$wrapLimit,a,f,l=e;t=Math.min(t,r.length-1);while(l<=t)f=this.getFoldLine(l,f),f?(a=[],f.walk(function(e,t,i,o){var u;if(e!=null){u=this.$getDisplayTokens(e,a.length),u[0]=n;for(var f=1;f<u.length;f++)u[f]=s}else u=this.$getDisplayTokens(r[t].substring(o,i),a.length);a=a.concat(u)}.bind(this),f.end.row,r[f.end.row].length+1),o[f.start.row]=this.$computeWrapSplits(a,u,i),l=f.end.row+1):(a=this.$getDisplayTokens(r[l]),o[l]=this.$computeWrapSplits(a,u,i),l++)};var e=1,t=2,n=3,s=4,a=9,c=10,d=11,v=12;this.$computeWrapSplits=function(e,r,i){function g(){var t=0;if(m===0)return t;if(p)for(var n=0;n<e.length;n++){var r=e[n];if(r==c)t+=1;else{if(r!=d){if(r==v)continue;break}t+=i}}return h&&p!==!1&&(t+=i),Math.min(t,m)}function y(t){var n=t-f;for(var r=f;r<t;r++){var i=e[r];if(i===12||i===2)n-=1}o.length||(b=g(),o.indent=b),l+=n,o.push(l),f=t}if(e.length==0)return[];var o=[],u=e.length,f=0,l=0,h=this.$wrapAsCode,p=this.$indentedSoftWrap,m=r<=Math.max(2*i,8)||p===!1?0:Math.floor(r/2),b=0;while(u-f>r-b){var w=f+r-b;if(e[w-1]>=c&&e[w]>=c){y(w);continue}if(e[w]==n||e[w]==s){for(w;w!=f-1;w--)if(e[w]==n)break;if(w>f){y(w);continue}w=f+r;for(w;w<e.length;w++)if(e[w]!=s)break;if(w==e.length)break;y(w);continue}var E=Math.max(w-(r-(r>>2)),f-1);while(w>E&&e[w]<n)w--;if(h){while(w>E&&e[w]<n)w--;while(w>E&&e[w]==a)w--}else while(w>E&&e[w]<c)w--;if(w>E){y(++w);continue}w=f+r,e[w]==t&&w--,y(w-b)}return o},this.$getDisplayTokens=function(n,r){var i=[],s;r=r||0;for(var o=0;o<n.length;o++){var u=n.charCodeAt(o);if(u==9){s=this.getScreenTabSize(i.length+r),i.push(d);for(var f=1;f<s;f++)i.push(v)}else u==32?i.push(c):u>39&&u<48||u>57&&u<64?i.push(a):u>=4352&&m(u)?i.push(e,t):i.push(e)}return i},this.$getStringScreenWidth=function(e,t,n){if(t==0)return[0,0];t==null&&(t=Infinity),n=n||0;var r,i;for(i=0;i<e.length;i++){r=e.charCodeAt(i),r==9?n+=this.getScreenTabSize(n):r>=4352&&m(r)?n+=2:n+=1;if(n>t)break}return[n,i]},this.lineWidgets=null,this.getRowLength=function(e){if(this.lineWidgets)var t=this.lineWidgets[e]&&this.lineWidgets[e].rowCount||0;else t=0;return!this.$useWrapMode||!this.$wrapData[e]?1+t:this.$wrapData[e].length+1+t},this.getRowLineCount=function(e){return!this.$useWrapMode||!this.$wrapData[e]?1:this.$wrapData[e].length+1},this.getRowWrapIndent=function(e){if(this.$useWrapMode){var t=this.screenToDocumentPosition(e,Number.MAX_VALUE),n=this.$wrapData[t.row];return n.length&&n[0]<t.column?n.indent:0}return 0},this.getScreenLastRowColumn=function(e){var t=this.screenToDocumentPosition(e,Number.MAX_VALUE);return this.documentToScreenColumn(t.row,t.column)},this.getDocumentLastRowColumn=function(e,t){var n=this.documentToScreenRow(e,t);return this.getScreenLastRowColumn(n)},this.getDocumentLastRowColumnPosition=function(e,t){var n=this.documentToScreenRow(e,t);return this.screenToDocumentPosition(n,Number.MAX_VALUE/10)},this.getRowSplitData=function(e){return this.$useWrapMode?this.$wrapData[e]:undefined},this.getScreenTabSize=function(e){return this.$tabSize-e%this.$tabSize},this.screenToDocumentRow=function(e,t){return this.screenToDocumentPosition(e,t).row},this.screenToDocumentColumn=function(e,t){return this.screenToDocumentPosition(e,t).column},this.screenToDocumentPosition=function(e,t,n){if(e<0)return{row:0,column:0};var r,i=0,s=0,o,u=0,a=0,f=this.$screenRowCache,l=this.$getRowCacheIndex(f,e),c=f.length;if(c&&l>=0)var u=f[l],i=this.$docRowCache[l],h=e>f[c-1];else var h=!c;var p=this.getLength()-1,d=this.getNextFoldLine(i),v=d?d.start.row:Infinity;while(u<=e){a=this.getRowLength(i);if(u+a>e||i>=p)break;u+=a,i++,i>v&&(i=d.end.row+1,d=this.getNextFoldLine(i,d),v=d?d.start.row:Infinity),h&&(this.$docRowCache.push(i),this.$screenRowCache.push(u))}if(d&&d.start.row<=i)r=this.getFoldDisplayLine(d),i=d.start.row;else{if(u+a<=e||i>p)return{row:p,column:this.getLine(p).length};r=this.getLine(i),d=null}var m=0,g=Math.floor(e-u);if(this.$useWrapMode){var y=this.$wrapData[i];y&&(o=y[g],g>0&&y.length&&(m=y.indent,s=y[g-1]||y[y.length-1],r=r.substring(s)))}return n!==undefined&&this.$bidiHandler.isBidiRow(u+g,i,g)&&(t=this.$bidiHandler.offsetToCol(n)),s+=this.$getStringScreenWidth(r,t-m)[1],this.$useWrapMode&&s>=o&&(s=o-1),d?d.idxToPosition(s):{row:i,column:s}},this.documentToScreenPosition=function(e,t){if(typeof t=="undefined")var n=this.$clipPositionToDocument(e.row,e.column);else n=this.$clipPositionToDocument(e,t);e=n.row,t=n.column;var r=0,i=null,s=null;s=this.getFoldAt(e,t,1),s&&(e=s.start.row,t=s.start.column);var o,u=0,a=this.$docRowCache,f=this.$getRowCacheIndex(a,e),l=a.length;if(l&&f>=0)var u=a[f],r=this.$screenRowCache[f],c=e>a[l-1];else var c=!l;var h=this.getNextFoldLine(u),p=h?h.start.row:Infinity;while(u<e){if(u>=p){o=h.end.row+1;if(o>e)break;h=this.getNextFoldLine(o,h),p=h?h.start.row:Infinity}else o=u+1;r+=this.getRowLength(u),u=o,c&&(this.$docRowCache.push(u),this.$screenRowCache.push(r))}var d="";h&&u>=p?(d=this.getFoldDisplayLine(h,e,t),i=h.start.row):(d=this.getLine(e).substring(0,t),i=e);var v=0;if(this.$useWrapMode){var m=this.$wrapData[i];if(m){var g=0;while(d.length>=m[g])r++,g++;d=d.substring(m[g-1]||0,d.length),v=g>0?m.indent:0}}return{row:r,column:v+this.$getStringScreenWidth(d)[0]}},this.documentToScreenColumn=function(e,t){return this.documentToScreenPosition(e,t).column},this.documentToScreenRow=function(e,t){return this.documentToScreenPosition(e,t).row},this.getScreenLength=function(){var e=0,t=null;if(!this.$useWrapMode){e=this.getLength();var n=this.$foldData;for(var r=0;r<n.length;r++)t=n[r],e-=t.end.row-t.start.row}else{var i=this.$wrapData.length,s=0,r=0,t=this.$foldData[r++],o=t?t.start.row:Infinity;while(s<i){var u=this.$wrapData[s];e+=u?u.length+1:1,s++,s>o&&(s=t.end.row+1,t=this.$foldData[r++],o=t?t.start.row:Infinity)}}return this.lineWidgets&&(e+=this.$getWidgetScreenLength()),e},this.$setFontMetrics=function(e){if(!this.$enableVarChar)return;this.$getStringScreenWidth=function(t,n,r){if(n===0)return[0,0];n||(n=Infinity),r=r||0;var i,s;for(s=0;s<t.length;s++){i=t.charAt(s),i==="	"?r+=this.getScreenTabSize(r):r+=e.getCharacterWidth(i);if(r>n)break}return[r,s]}},this.destroy=function(){this.bgTokenizer&&(this.bgTokenizer.setDocument(null),this.bgTokenizer=null),this.$stopWorker()},this.isFullWidth=m}.call(d.prototype),e("./edit_session/folding").Folding.call(d.prototype),e("./edit_session/bracket_match").BracketMatch.call(d.prototype),o.defineOptions(d.prototype,"session",{wrap:{set:function(e){!e||e=="off"?e=!1:e=="free"?e=!0:e=="printMargin"?e=-1:typeof e=="string"&&(e=parseInt(e,10)||!1);if(this.$wrap==e)return;this.$wrap=e;if(!e)this.setUseWrapMode(!1);else{var t=typeof e=="number"?e:null;this.setWrapLimitRange(t,t),this.setUseWrapMode(!0)}},get:function(){return this.getUseWrapMode()?this.$wrap==-1?"printMargin":this.getWrapLimitRange().min?this.$wrap:"free":"off"},handlesSet:!0},wrapMethod:{set:function(e){e=e=="auto"?this.$mode.type!="text":e!="text",e!=this.$wrapAsCode&&(this.$wrapAsCode=e,this.$useWrapMode&&(this.$useWrapMode=!1,this.setUseWrapMode(!0)))},initialValue:"auto"},indentedSoftWrap:{set:function(){this.$useWrapMode&&(this.$useWrapMode=!1,this.setUseWrapMode(!0))},initialValue:!0},firstLineNumber:{set:function(){this._signal("changeBreakpoint")},initialValue:1},useWorker:{set:function(e){this.$useWorker=e,this.$stopWorker(),e&&this.$startWorker()},initialValue:!0},useSoftTabs:{initialValue:!0},tabSize:{set:function(e){e=parseInt(e);if(isNaN(e)||this.$tabSize===e)return;this.$modified=!0,this.$rowLengthCache=[],this.$tabSize=e,this._signal("changeTabSize")},initialValue:4,handlesSet:!0},navigateWithinSoftTabs:{initialValue:!1},foldStyle:{set:function(e){this.setFoldStyle(e)},handlesSet:!0},overwrite:{set:function(e){this._signal("changeOverwrite")},initialValue:!1},newLineMode:{set:function(e){this.doc.setNewLineMode(e)},get:function(){return this.doc.getNewLineMode()},handlesSet:!0},mode:{set:function(e){this.setMode(e)},get:function(){return this.$modeId},handlesSet:!0}}),t.EditSession=d}),ace.define("ace/search",["require","exports","module","ace/lib/lang","ace/lib/oop","ace/range"],function(e,t,n){"use strict";function u(e,t){function n(e){return/\w/.test(e)||t.regExp?"\\b":""}return n(e[0])+e+n(e[e.length-1])}var r=e("./lib/lang"),i=e("./lib/oop"),s=e("./range").Range,o=function(){this.$options={}};(function(){this.set=function(e){return i.mixin(this.$options,e),this},this.getOptions=function(){return r.copyObject(this.$options)},this.setOptions=function(e){this.$options=e},this.find=function(e){var t=this.$options,n=this.$matchIterator(e,t);if(!n)return!1;var r=null;return n.forEach(function(e,n,i,o){return r=new s(e,n,i,o),n==o&&t.start&&t.start.start&&t.skipCurrent!=0&&r.isEqual(t.start)?(r=null,!1):!0}),r},this.findAll=function(e){var t=this.$options;if(!t.needle)return[];this.$assembleRegExp(t);var n=t.range,i=n?e.getLines(n.start.row,n.end.row):e.doc.getAllLines(),o=[],u=t.re;if(t.$isMultiLine){var a=u.length,f=i.length-a,l;e:for(var c=u.offset||0;c<=f;c++){for(var h=0;h<a;h++)if(i[c+h].search(u[h])==-1)continue e;var p=i[c],d=i[c+a-1],v=p.length-p.match(u[0])[0].length,m=d.match(u[a-1])[0].length;if(l&&l.end.row===c&&l.end.column>v)continue;o.push(l=new s(c,v,c+a-1,m)),a>2&&(c=c+a-2)}}else for(var g=0;g<i.length;g++){var y=r.getMatchOffsets(i[g],u);for(var h=0;h<y.length;h++){var b=y[h];o.push(new s(g,b.offset,g,b.offset+b.length))}}if(n){var w=n.start.column,E=n.start.column,g=0,h=o.length-1;while(g<h&&o[g].start.column<w&&o[g].start.row==n.start.row)g++;while(g<h&&o[h].end.column>E&&o[h].end.row==n.end.row)h--;o=o.slice(g,h+1);for(g=0,h=o.length;g<h;g++)o[g].start.row+=n.start.row,o[g].end.row+=n.start.row}return o},this.replace=function(e,t){var n=this.$options,r=this.$assembleRegExp(n);if(n.$isMultiLine)return t;if(!r)return;var i=r.exec(e);if(!i||i[0].length!=e.length)return null;t=e.replace(r,t);if(n.preserveCase){t=t.split("");for(var s=Math.min(e.length,e.length);s--;){var o=e[s];o&&o.toLowerCase()!=o?t[s]=t[s].toUpperCase():t[s]=t[s].toLowerCase()}t=t.join("")}return t},this.$assembleRegExp=function(e,t){if(e.needle instanceof RegExp)return e.re=e.needle;var n=e.needle;if(!e.needle)return e.re=!1;e.regExp||(n=r.escapeRegExp(n)),e.wholeWord&&(n=u(n,e));var i=e.caseSensitive?"gm":"gmi";e.$isMultiLine=!t&&/[\n\r]/.test(n);if(e.$isMultiLine)return e.re=this.$assembleMultilineRegExp(n,i);try{var s=new RegExp(n,i)}catch(o){s=!1}return e.re=s},this.$assembleMultilineRegExp=function(e,t){var n=e.replace(/\r\n|\r|\n/g,"$\n^").split("\n"),r=[];for(var i=0;i<n.length;i++)try{r.push(new RegExp(n[i],t))}catch(s){return!1}return r},this.$matchIterator=function(e,t){var n=this.$assembleRegExp(t);if(!n)return!1;var r=t.backwards==1,i=t.skipCurrent!=0,s=t.range,o=t.start;o||(o=s?s[r?"end":"start"]:e.selection.getRange()),o.start&&(o=o[i!=r?"end":"start"]);var u=s?s.start.row:0,a=s?s.end.row:e.getLength()-1;if(r)var f=function(e){var n=o.row;if(c(n,o.column,e))return;for(n--;n>=u;n--)if(c(n,Number.MAX_VALUE,e))return;if(t.wrap==0)return;for(n=a,u=o.row;n>=u;n--)if(c(n,Number.MAX_VALUE,e))return};else var f=function(e){var n=o.row;if(c(n,o.column,e))return;for(n+=1;n<=a;n++)if(c(n,0,e))return;if(t.wrap==0)return;for(n=u,a=o.row;n<=a;n++)if(c(n,0,e))return};if(t.$isMultiLine)var l=n.length,c=function(t,i,s){var o=r?t-l+1:t;if(o<0)return;var u=e.getLine(o),a=u.search(n[0]);if(!r&&a<i||a===-1)return;for(var f=1;f<l;f++){u=e.getLine(o+f);if(u.search(n[f])==-1)return}var c=u.match(n[l-1])[0].length;if(r&&c>i)return;if(s(o,a,o+l-1,c))return!0};else if(r)var c=function(t,r,i){var s=e.getLine(t),o=[],u,a=0;n.lastIndex=0;while(u=n.exec(s)){var f=u[0].length;a=u.index;if(!f){if(a>=s.length)break;n.lastIndex=a+=1}if(u.index+f>r)break;o.push(u.index,f)}for(var l=o.length-1;l>=0;l-=2){var c=o[l-1],f=o[l];if(i(t,c,t,c+f))return!0}};else var c=function(t,r,i){var s=e.getLine(t),o,u;n.lastIndex=r;while(u=n.exec(s)){var a=u[0].length;o=u.index;if(i(t,o,t,o+a))return!0;if(!a){n.lastIndex=o+=1;if(o>=s.length)return!1}}};return{forEach:f}}}).call(o.prototype),t.Search=o}),ace.define("ace/keyboard/hash_handler",["require","exports","module","ace/lib/keys","ace/lib/useragent"],function(e,t,n){"use strict";function o(e,t){this.platform=t||(i.isMac?"mac":"win"),this.commands={},this.commandKeyBinding={},this.addCommands(e),this.$singleCommand=!0}function u(e,t){o.call(this,e,t),this.$singleCommand=!1}var r=e("../lib/keys"),i=e("../lib/useragent"),s=r.KEY_MODS;u.prototype=o.prototype,function(){function e(e){return typeof e=="object"&&e.bindKey&&e.bindKey.position||(e.isDefault?-100:0)}this.addCommand=function(e){this.commands[e.name]&&this.removeCommand(e),this.commands[e.name]=e,e.bindKey&&this._buildKeyHash(e)},this.removeCommand=function(e,t){var n=e&&(typeof e=="string"?e:e.name);e=this.commands[n],t||delete this.commands[n];var r=this.commandKeyBinding;for(var i in r){var s=r[i];if(s==e)delete r[i];else if(Array.isArray(s)){var o=s.indexOf(e);o!=-1&&(s.splice(o,1),s.length==1&&(r[i]=s[0]))}}},this.bindKey=function(e,t,n){typeof e=="object"&&e&&(n==undefined&&(n=e.position),e=e[this.platform]);if(!e)return;if(typeof t=="function")return this.addCommand({exec:t,bindKey:e,name:t.name||e});e.split("|").forEach(function(e){var r="";if(e.indexOf(" ")!=-1){var i=e.split(/\s+/);e=i.pop(),i.forEach(function(e){var t=this.parseKeys(e),n=s[t.hashId]+t.key;r+=(r?" ":"")+n,this._addCommandToBinding(r,"chainKeys")},this),r+=" "}var o=this.parseKeys(e),u=s[o.hashId]+o.key;this._addCommandToBinding(r+u,t,n)},this)},this._addCommandToBinding=function(t,n,r){var i=this.commandKeyBinding,s;if(!n)delete i[t];else if(!i[t]||this.$singleCommand)i[t]=n;else{Array.isArray(i[t])?(s=i[t].indexOf(n))!=-1&&i[t].splice(s,1):i[t]=[i[t]],typeof r!="number"&&(r=e(n));var o=i[t];for(s=0;s<o.length;s++){var u=o[s],a=e(u);if(a>r)break}o.splice(s,0,n)}},this.addCommands=function(e){e&&Object.keys(e).forEach(function(t){var n=e[t];if(!n)return;if(typeof n=="string")return this.bindKey(n,t);typeof n=="function"&&(n={exec:n});if(typeof n!="object")return;n.name||(n.name=t),this.addCommand(n)},this)},this.removeCommands=function(e){Object.keys(e).forEach(function(t){this.removeCommand(e[t])},this)},this.bindKeys=function(e){Object.keys(e).forEach(function(t){this.bindKey(t,e[t])},this)},this._buildKeyHash=function(e){this.bindKey(e.bindKey,e)},this.parseKeys=function(e){var t=e.toLowerCase().split(/[\-\+]([\-\+])?/).filter(function(e){return e}),n=t.pop(),i=r[n];if(r.FUNCTION_KEYS[i])n=r.FUNCTION_KEYS[i].toLowerCase();else{if(!t.length)return{key:n,hashId:-1};if(t.length==1&&t[0]=="shift")return{key:n.toUpperCase(),hashId:-1}}var s=0;for(var o=t.length;o--;){var u=r.KEY_MODS[t[o]];if(u==null)return typeof console!="undefined"&&console.error("invalid modifier "+t[o]+" in "+e),!1;s|=u}return{key:n,hashId:s}},this.findKeyCommand=function(t,n){var r=s[t]+n;return this.commandKeyBinding[r]},this.handleKeyboard=function(e,t,n,r){if(r<0)return;var i=s[t]+n,o=this.commandKeyBinding[i];e.$keyChain&&(e.$keyChain+=" "+i,o=this.commandKeyBinding[e.$keyChain]||o);if(o)if(o=="chainKeys"||o[o.length-1]=="chainKeys")return e.$keyChain=e.$keyChain||i,{command:"null"};if(e.$keyChain)if(!!t&&t!=4||n.length!=1){if(t==-1||r>0)e.$keyChain=""}else e.$keyChain=e.$keyChain.slice(0,-i.length-1);return{command:o}},this.getStatusText=function(e,t){return t.$keyChain||""}}.call(o.prototype),t.HashHandler=o,t.MultiHashHandler=u}),ace.define("ace/commands/command_manager",["require","exports","module","ace/lib/oop","ace/keyboard/hash_handler","ace/lib/event_emitter"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("../keyboard/hash_handler").MultiHashHandler,s=e("../lib/event_emitter").EventEmitter,o=function(e,t){i.call(this,t,e),this.byName=this.commands,this.setDefaultHandler("exec",function(e){return e.command.exec(e.editor,e.args||{})})};r.inherits(o,i),function(){r.implement(this,s),this.exec=function(e,t,n){if(Array.isArray(e)){for(var r=e.length;r--;)if(this.exec(e[r],t,n))return!0;return!1}typeof e=="string"&&(e=this.commands[e]);if(!e)return!1;if(t&&t.$readOnly&&!e.readOnly)return!1;if(this.$checkCommandState!=0&&e.isAvailable&&!e.isAvailable(t))return!1;var i={editor:t,command:e,args:n};return i.returnValue=this._emit("exec",i),this._signal("afterExec",i),i.returnValue===!1?!1:!0},this.toggleRecording=function(e){if(this.$inReplay)return;return e&&e._emit("changeStatus"),this.recording?(this.macro.pop(),this.removeEventListener("exec",this.$addCommandToMacro),this.macro.length||(this.macro=this.oldMacro),this.recording=!1):(this.$addCommandToMacro||(this.$addCommandToMacro=function(e){this.macro.push([e.command,e.args])}.bind(this)),this.oldMacro=this.macro,this.macro=[],this.on("exec",this.$addCommandToMacro),this.recording=!0)},this.replay=function(e){if(this.$inReplay||!this.macro)return;if(this.recording)return this.toggleRecording(e);try{this.$inReplay=!0,this.macro.forEach(function(t){typeof t=="string"?this.exec(t,e):this.exec(t[0],e,t[1])},this)}finally{this.$inReplay=!1}},this.trimMacro=function(e){return e.map(function(e){return typeof e[0]!="string"&&(e[0]=e[0].name),e[1]||(e=e[0]),e})}}.call(o.prototype),t.CommandManager=o}),ace.define("ace/commands/default_commands",["require","exports","module","ace/lib/lang","ace/config","ace/range"],function(e,t,n){"use strict";function o(e,t){return{win:e,mac:t}}var r=e("../lib/lang"),i=e("../config"),s=e("../range").Range;t.commands=[{name:"showSettingsMenu",bindKey:o("Ctrl-,","Command-,"),exec:function(e){i.loadModule("ace/ext/settings_menu",function(t){t.init(e),e.showSettingsMenu()})},readOnly:!0},{name:"goToNextError",bindKey:o("Alt-E","F4"),exec:function(e){i.loadModule("./ext/error_marker",function(t){t.showErrorMarker(e,1)})},scrollIntoView:"animate",readOnly:!0},{name:"goToPreviousError",bindKey:o("Alt-Shift-E","Shift-F4"),exec:function(e){i.loadModule("./ext/error_marker",function(t){t.showErrorMarker(e,-1)})},scrollIntoView:"animate",readOnly:!0},{name:"selectall",bindKey:o("Ctrl-A","Command-A"),exec:function(e){e.selectAll()},readOnly:!0},{name:"centerselection",bindKey:o(null,"Ctrl-L"),exec:function(e){e.centerSelection()},readOnly:!0},{name:"gotoline",bindKey:o("Ctrl-L","Command-L"),exec:function(e,t){typeof t!="number"&&(t=parseInt(prompt("Enter line number:"),10)),isNaN(t)||e.gotoLine(t)},readOnly:!0},{name:"fold",bindKey:o("Alt-L|Ctrl-F1","Command-Alt-L|Command-F1"),exec:function(e){e.session.toggleFold(!1)},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"unfold",bindKey:o("Alt-Shift-L|Ctrl-Shift-F1","Command-Alt-Shift-L|Command-Shift-F1"),exec:function(e){e.session.toggleFold(!0)},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"toggleFoldWidget",bindKey:o("F2","F2"),exec:function(e){e.session.toggleFoldWidget()},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"toggleParentFoldWidget",bindKey:o("Alt-F2","Alt-F2"),exec:function(e){e.session.toggleFoldWidget(!0)},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"foldall",bindKey:o(null,"Ctrl-Command-Option-0"),exec:function(e){e.session.foldAll()},scrollIntoView:"center",readOnly:!0},{name:"foldOther",bindKey:o("Alt-0","Command-Option-0"),exec:function(e){e.session.foldAll(),e.session.unfold(e.selection.getAllRanges())},scrollIntoView:"center",readOnly:!0},{name:"unfoldall",bindKey:o("Alt-Shift-0","Command-Option-Shift-0"),exec:function(e){e.session.unfold()},scrollIntoView:"center",readOnly:!0},{name:"findnext",bindKey:o("Ctrl-K","Command-G"),exec:function(e){e.findNext()},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"findprevious",bindKey:o("Ctrl-Shift-K","Command-Shift-G"),exec:function(e){e.findPrevious()},multiSelectAction:"forEach",scrollIntoView:"center",readOnly:!0},{name:"selectOrFindNext",bindKey:o("Alt-K","Ctrl-G"),exec:function(e){e.selection.isEmpty()?e.selection.selectWord():e.findNext()},readOnly:!0},{name:"selectOrFindPrevious",bindKey:o("Alt-Shift-K","Ctrl-Shift-G"),exec:function(e){e.selection.isEmpty()?e.selection.selectWord():e.findPrevious()},readOnly:!0},{name:"find",bindKey:o("Ctrl-F","Command-F"),exec:function(e){i.loadModule("ace/ext/searchbox",function(t){t.Search(e)})},readOnly:!0},{name:"overwrite",bindKey:"Insert",exec:function(e){e.toggleOverwrite()},readOnly:!0},{name:"selecttostart",bindKey:o("Ctrl-Shift-Home","Command-Shift-Home|Command-Shift-Up"),exec:function(e){e.getSelection().selectFileStart()},multiSelectAction:"forEach",readOnly:!0,scrollIntoView:"animate",aceCommandGroup:"fileJump"},{name:"gotostart",bindKey:o("Ctrl-Home","Command-Home|Command-Up"),exec:function(e){e.navigateFileStart()},multiSelectAction:"forEach",readOnly:!0,scrollIntoView:"animate",aceCommandGroup:"fileJump"},{name:"selectup",bindKey:o("Shift-Up","Shift-Up|Ctrl-Shift-P"),exec:function(e){e.getSelection().selectUp()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"golineup",bindKey:o("Up","Up|Ctrl-P"),exec:function(e,t){e.navigateUp(t.times)},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selecttoend",bindKey:o("Ctrl-Shift-End","Command-Shift-End|Command-Shift-Down"),exec:function(e){e.getSelection().selectFileEnd()},multiSelectAction:"forEach",readOnly:!0,scrollIntoView:"animate",aceCommandGroup:"fileJump"},{name:"gotoend",bindKey:o("Ctrl-End","Command-End|Command-Down"),exec:function(e){e.navigateFileEnd()},multiSelectAction:"forEach",readOnly:!0,scrollIntoView:"animate",aceCommandGroup:"fileJump"},{name:"selectdown",bindKey:o("Shift-Down","Shift-Down|Ctrl-Shift-N"),exec:function(e){e.getSelection().selectDown()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"golinedown",bindKey:o("Down","Down|Ctrl-N"),exec:function(e,t){e.navigateDown(t.times)},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectwordleft",bindKey:o("Ctrl-Shift-Left","Option-Shift-Left"),exec:function(e){e.getSelection().selectWordLeft()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotowordleft",bindKey:o("Ctrl-Left","Option-Left"),exec:function(e){e.navigateWordLeft()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selecttolinestart",bindKey:o("Alt-Shift-Left","Command-Shift-Left|Ctrl-Shift-A"),exec:function(e){e.getSelection().selectLineStart()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotolinestart",bindKey:o("Alt-Left|Home","Command-Left|Home|Ctrl-A"),exec:function(e){e.navigateLineStart()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectleft",bindKey:o("Shift-Left","Shift-Left|Ctrl-Shift-B"),exec:function(e){e.getSelection().selectLeft()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotoleft",bindKey:o("Left","Left|Ctrl-B"),exec:function(e,t){e.navigateLeft(t.times)},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectwordright",bindKey:o("Ctrl-Shift-Right","Option-Shift-Right"),exec:function(e){e.getSelection().selectWordRight()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotowordright",bindKey:o("Ctrl-Right","Option-Right"),exec:function(e){e.navigateWordRight()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selecttolineend",bindKey:o("Alt-Shift-Right","Command-Shift-Right|Shift-End|Ctrl-Shift-E"),exec:function(e){e.getSelection().selectLineEnd()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotolineend",bindKey:o("Alt-Right|End","Command-Right|End|Ctrl-E"),exec:function(e){e.navigateLineEnd()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectright",bindKey:o("Shift-Right","Shift-Right"),exec:function(e){e.getSelection().selectRight()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"gotoright",bindKey:o("Right","Right|Ctrl-F"),exec:function(e,t){e.navigateRight(t.times)},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectpagedown",bindKey:"Shift-PageDown",exec:function(e){e.selectPageDown()},readOnly:!0},{name:"pagedown",bindKey:o(null,"Option-PageDown"),exec:function(e){e.scrollPageDown()},readOnly:!0},{name:"gotopagedown",bindKey:o("PageDown","PageDown|Ctrl-V"),exec:function(e){e.gotoPageDown()},readOnly:!0},{name:"selectpageup",bindKey:"Shift-PageUp",exec:function(e){e.selectPageUp()},readOnly:!0},{name:"pageup",bindKey:o(null,"Option-PageUp"),exec:function(e){e.scrollPageUp()},readOnly:!0},{name:"gotopageup",bindKey:"PageUp",exec:function(e){e.gotoPageUp()},readOnly:!0},{name:"scrollup",bindKey:o("Ctrl-Up",null),exec:function(e){e.renderer.scrollBy(0,-2*e.renderer.layerConfig.lineHeight)},readOnly:!0},{name:"scrolldown",bindKey:o("Ctrl-Down",null),exec:function(e){e.renderer.scrollBy(0,2*e.renderer.layerConfig.lineHeight)},readOnly:!0},{name:"selectlinestart",bindKey:"Shift-Home",exec:function(e){e.getSelection().selectLineStart()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"selectlineend",bindKey:"Shift-End",exec:function(e){e.getSelection().selectLineEnd()},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"togglerecording",bindKey:o("Ctrl-Alt-E","Command-Option-E"),exec:function(e){e.commands.toggleRecording(e)},readOnly:!0},{name:"replaymacro",bindKey:o("Ctrl-Shift-E","Command-Shift-E"),exec:function(e){e.commands.replay(e)},readOnly:!0},{name:"jumptomatching",bindKey:o("Ctrl-P","Ctrl-P"),exec:function(e){e.jumpToMatching()},multiSelectAction:"forEach",scrollIntoView:"animate",readOnly:!0},{name:"selecttomatching",bindKey:o("Ctrl-Shift-P","Ctrl-Shift-P"),exec:function(e){e.jumpToMatching(!0)},multiSelectAction:"forEach",scrollIntoView:"animate",readOnly:!0},{name:"expandToMatching",bindKey:o("Ctrl-Shift-M","Ctrl-Shift-M"),exec:function(e){e.jumpToMatching(!0,!0)},multiSelectAction:"forEach",scrollIntoView:"animate",readOnly:!0},{name:"passKeysToBrowser",bindKey:o(null,null),exec:function(){},passEvent:!0,readOnly:!0},{name:"copy",exec:function(e){},readOnly:!0},{name:"cut",exec:function(e){var t=e.$copyWithEmptySelection&&e.selection.isEmpty(),n=t?e.selection.getLineRange():e.selection.getRange();e._emit("cut",n),n.isEmpty()||e.session.remove(n),e.clearSelection()},scrollIntoView:"cursor",multiSelectAction:"forEach"},{name:"paste",exec:function(e,t){e.$handlePaste(t)},scrollIntoView:"cursor"},{name:"removeline",bindKey:o("Ctrl-D","Command-D"),exec:function(e){e.removeLines()},scrollIntoView:"cursor",multiSelectAction:"forEachLine"},{name:"duplicateSelection",bindKey:o("Ctrl-Shift-D","Command-Shift-D"),exec:function(e){e.duplicateSelection()},scrollIntoView:"cursor",multiSelectAction:"forEach"},{name:"sortlines",bindKey:o("Ctrl-Alt-S","Command-Alt-S"),exec:function(e){e.sortLines()},scrollIntoView:"selection",multiSelectAction:"forEachLine"},{name:"togglecomment",bindKey:o("Ctrl-/","Command-/"),exec:function(e){e.toggleCommentLines()},multiSelectAction:"forEachLine",scrollIntoView:"selectionPart"},{name:"toggleBlockComment",bindKey:o("Ctrl-Shift-/","Command-Shift-/"),exec:function(e){e.toggleBlockComment()},multiSelectAction:"forEach",scrollIntoView:"selectionPart"},{name:"modifyNumberUp",bindKey:o("Ctrl-Shift-Up","Alt-Shift-Up"),exec:function(e){e.modifyNumber(1)},scrollIntoView:"cursor",multiSelectAction:"forEach"},{name:"modifyNumberDown",bindKey:o("Ctrl-Shift-Down","Alt-Shift-Down"),exec:function(e){e.modifyNumber(-1)},scrollIntoView:"cursor",multiSelectAction:"forEach"},{name:"replace",bindKey:o("Ctrl-H","Command-Option-F"),exec:function(e){i.loadModule("ace/ext/searchbox",function(t){t.Search(e,!0)})}},{name:"undo",bindKey:o("Ctrl-Z","Command-Z"),exec:function(e){e.undo()}},{name:"redo",bindKey:o("Ctrl-Shift-Z|Ctrl-Y","Command-Shift-Z|Command-Y"),exec:function(e){e.redo()}},{name:"copylinesup",bindKey:o("Alt-Shift-Up","Command-Option-Up"),exec:function(e){e.copyLinesUp()},scrollIntoView:"cursor"},{name:"movelinesup",bindKey:o("Alt-Up","Option-Up"),exec:function(e){e.moveLinesUp()},scrollIntoView:"cursor"},{name:"copylinesdown",bindKey:o("Alt-Shift-Down","Command-Option-Down"),exec:function(e){e.copyLinesDown()},scrollIntoView:"cursor"},{name:"movelinesdown",bindKey:o("Alt-Down","Option-Down"),exec:function(e){e.moveLinesDown()},scrollIntoView:"cursor"},{name:"del",bindKey:o("Delete","Delete|Ctrl-D|Shift-Delete"),exec:function(e){e.remove("right")},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"backspace",bindKey:o("Shift-Backspace|Backspace","Ctrl-Backspace|Shift-Backspace|Backspace|Ctrl-H"),exec:function(e){e.remove("left")},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"cut_or_delete",bindKey:o("Shift-Delete",null),exec:function(e){if(!e.selection.isEmpty())return!1;e.remove("left")},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removetolinestart",bindKey:o("Alt-Backspace","Command-Backspace"),exec:function(e){e.removeToLineStart()},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removetolineend",bindKey:o("Alt-Delete","Ctrl-K|Command-Delete"),exec:function(e){e.removeToLineEnd()},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removetolinestarthard",bindKey:o("Ctrl-Shift-Backspace",null),exec:function(e){var t=e.selection.getRange();t.start.column=0,e.session.remove(t)},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removetolineendhard",bindKey:o("Ctrl-Shift-Delete",null),exec:function(e){var t=e.selection.getRange();t.end.column=Number.MAX_VALUE,e.session.remove(t)},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removewordleft",bindKey:o("Ctrl-Backspace","Alt-Backspace|Ctrl-Alt-Backspace"),exec:function(e){e.removeWordLeft()},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"removewordright",bindKey:o("Ctrl-Delete","Alt-Delete"),exec:function(e){e.removeWordRight()},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"outdent",bindKey:o("Shift-Tab","Shift-Tab"),exec:function(e){e.blockOutdent()},multiSelectAction:"forEach",scrollIntoView:"selectionPart"},{name:"indent",bindKey:o("Tab","Tab"),exec:function(e){e.indent()},multiSelectAction:"forEach",scrollIntoView:"selectionPart"},{name:"blockoutdent",bindKey:o("Ctrl-[","Ctrl-["),exec:function(e){e.blockOutdent()},multiSelectAction:"forEachLine",scrollIntoView:"selectionPart"},{name:"blockindent",bindKey:o("Ctrl-]","Ctrl-]"),exec:function(e){e.blockIndent()},multiSelectAction:"forEachLine",scrollIntoView:"selectionPart"},{name:"insertstring",exec:function(e,t){e.insert(t)},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"inserttext",exec:function(e,t){e.insert(r.stringRepeat(t.text||"",t.times||1))},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"splitline",bindKey:o(null,"Ctrl-O"),exec:function(e){e.splitLine()},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"transposeletters",bindKey:o("Alt-Shift-X","Ctrl-T"),exec:function(e){e.transposeLetters()},multiSelectAction:function(e){e.transposeSelections(1)},scrollIntoView:"cursor"},{name:"touppercase",bindKey:o("Ctrl-U","Ctrl-U"),exec:function(e){e.toUpperCase()},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"tolowercase",bindKey:o("Ctrl-Shift-U","Ctrl-Shift-U"),exec:function(e){e.toLowerCase()},multiSelectAction:"forEach",scrollIntoView:"cursor"},{name:"expandtoline",bindKey:o("Ctrl-Shift-L","Command-Shift-L"),exec:function(e){var t=e.selection.getRange();t.start.column=t.end.column=0,t.end.row++,e.selection.setRange(t,!1)},multiSelectAction:"forEach",scrollIntoView:"cursor",readOnly:!0},{name:"joinlines",bindKey:o(null,null),exec:function(e){var t=e.selection.isBackwards(),n=t?e.selection.getSelectionLead():e.selection.getSelectionAnchor(),i=t?e.selection.getSelectionAnchor():e.selection.getSelectionLead(),o=e.session.doc.getLine(n.row).length,u=e.session.doc.getTextRange(e.selection.getRange()),a=u.replace(/\n\s*/," ").length,f=e.session.doc.getLine(n.row);for(var l=n.row+1;l<=i.row+1;l++){var c=r.stringTrimLeft(r.stringTrimRight(e.session.doc.getLine(l)));c.length!==0&&(c=" "+c),f+=c}i.row+1<e.session.doc.getLength()-1&&(f+=e.session.doc.getNewLineCharacter()),e.clearSelection(),e.session.doc.replace(new s(n.row,0,i.row+2,0),f),a>0?(e.selection.moveCursorTo(n.row,n.column),e.selection.selectTo(n.row,n.column+a)):(o=e.session.doc.getLine(n.row).length>o?o+1:o,e.selection.moveCursorTo(n.row,o))},multiSelectAction:"forEach",readOnly:!0},{name:"invertSelection",bindKey:o(null,null),exec:function(e){var t=e.session.doc.getLength()-1,n=e.session.doc.getLine(t).length,r=e.selection.rangeList.ranges,i=[];r.length<1&&(r=[e.selection.getRange()]);for(var o=0;o<r.length;o++)o==r.length-1&&(r[o].end.row!==t||r[o].end.column!==n)&&i.push(new s(r[o].end.row,r[o].end.column,t,n)),o===0?(r[o].start.row!==0||r[o].start.column!==0)&&i.push(new s(0,0,r[o].start.row,r[o].start.column)):i.push(new s(r[o-1].end.row,r[o-1].end.column,r[o].start.row,r[o].start.column));e.exitMultiSelectMode(),e.clearSelection();for(var o=0;o<i.length;o++)e.selection.addRange(i[o],!1)},readOnly:!0,scrollIntoView:"none"}]}),ace.define("ace/clipboard",["require","exports","module"],function(e,t,n){"use strict";n.exports={lineMode:!1}}),ace.define("ace/editor",["require","exports","module","ace/lib/fixoldbrowsers","ace/lib/oop","ace/lib/dom","ace/lib/lang","ace/lib/useragent","ace/keyboard/textinput","ace/mouse/mouse_handler","ace/mouse/fold_handler","ace/keyboard/keybinding","ace/edit_session","ace/search","ace/range","ace/lib/event_emitter","ace/commands/command_manager","ace/commands/default_commands","ace/config","ace/token_iterator","ace/clipboard"],function(e,t,n){"use strict";e("./lib/fixoldbrowsers");var r=e("./lib/oop"),i=e("./lib/dom"),s=e("./lib/lang"),o=e("./lib/useragent"),u=e("./keyboard/textinput").TextInput,a=e("./mouse/mouse_handler").MouseHandler,f=e("./mouse/fold_handler").FoldHandler,l=e("./keyboard/keybinding").KeyBinding,c=e("./edit_session").EditSession,h=e("./search").Search,p=e("./range").Range,d=e("./lib/event_emitter").EventEmitter,v=e("./commands/command_manager").CommandManager,m=e("./commands/default_commands").commands,g=e("./config"),y=e("./token_iterator").TokenIterator,b=e("./clipboard"),w=function(e,t,n){var r=e.getContainerElement();this.container=r,this.renderer=e,this.id="editor"+ ++w.$uid,this.commands=new v(o.isMac?"mac":"win",m),typeof document=="object"&&(this.textInput=new u(e.getTextAreaContainer(),this),this.renderer.textarea=this.textInput.getElement(),this.$mouseHandler=new a(this),new f(this)),this.keyBinding=new l(this),this.$search=(new h).set({wrap:!0}),this.$historyTracker=this.$historyTracker.bind(this),this.commands.on("exec",this.$historyTracker),this.$initOperationListeners(),this._$emitInputEvent=s.delayedCall(function(){this._signal("input",{}),this.session&&this.session.bgTokenizer&&this.session.bgTokenizer.scheduleStart()}.bind(this)),this.on("change",function(e,t){t._$emitInputEvent.schedule(31)}),this.setSession(t||n&&n.session||new c("")),g.resetOptions(this),n&&this.setOptions(n),g._signal("editor",this)};w.$uid=0,function(){r.implement(this,d),this.$initOperationListeners=function(){this.commands.on("exec",this.startOperation.bind(this),!0),this.commands.on("afterExec",this.endOperation.bind(this),!0),this.$opResetTimer=s.delayedCall(this.endOperation.bind(this,!0)),this.on("change",function(){this.curOp||(this.startOperation(),this.curOp.selectionBefore=this.$lastSel),this.curOp.docChanged=!0}.bind(this),!0),this.on("changeSelection",function(){this.curOp||(this.startOperation(),this.curOp.selectionBefore=this.$lastSel),this.curOp.selectionChanged=!0}.bind(this),!0)},this.curOp=null,this.prevOp={},this.startOperation=function(e){if(this.curOp){if(!e||this.curOp.command)return;this.prevOp=this.curOp}e||(this.previousCommand=null,e={}),this.$opResetTimer.schedule(),this.curOp=this.session.curOp={command:e.command||{},args:e.args,scrollTop:this.renderer.scrollTop},this.curOp.selectionBefore=this.selection.toJSON()},this.endOperation=function(e){if(this.curOp){if(e&&e.returnValue===!1)return this.curOp=null;if(e==1&&this.curOp.command&&this.curOp.command.name=="mouse")return;this._signal("beforeEndOperation");if(!this.curOp)return;var t=this.curOp.command,n=t&&t.scrollIntoView;if(n){switch(n){case"center-animate":n="animate";case"center":this.renderer.scrollCursorIntoView(null,.5);break;case"animate":case"cursor":this.renderer.scrollCursorIntoView();break;case"selectionPart":var r=this.selection.getRange(),i=this.renderer.layerConfig;(r.start.row>=i.lastRow||r.end.row<=i.firstRow)&&this.renderer.scrollSelectionIntoView(this.selection.anchor,this.selection.lead);break;default:}n=="animate"&&this.renderer.animateScrolling(this.curOp.scrollTop)}var s=this.selection.toJSON();this.curOp.selectionAfter=s,this.$lastSel=this.selection.toJSON(),this.session.getUndoManager().addSelection(s),this.prevOp=this.curOp,this.curOp=null}},this.$mergeableCommands=["backspace","del","insertstring"],this.$historyTracker=function(e){if(!this.$mergeUndoDeltas)return;var t=this.prevOp,n=this.$mergeableCommands,r=t.command&&e.command.name==t.command.name;if(e.command.name=="insertstring"){var i=e.args;this.mergeNextCommand===undefined&&(this.mergeNextCommand=!0),r=r&&this.mergeNextCommand&&(!/\s/.test(i)||/\s/.test(t.args)),this.mergeNextCommand=!0}else r=r&&n.indexOf(e.command.name)!==-1;this.$mergeUndoDeltas!="always"&&Date.now()-this.sequenceStartTime>2e3&&(r=!1),r?this.session.mergeUndoDeltas=!0:n.indexOf(e.command.name)!==-1&&(this.sequenceStartTime=Date.now())},this.setKeyboardHandler=function(e,t){if(e&&typeof e=="string"&&e!="ace"){this.$keybindingId=e;var n=this;g.loadModule(["keybinding",e],function(r){n.$keybindingId==e&&n.keyBinding.setKeyboardHandler(r&&r.handler),t&&t()})}else this.$keybindingId=null,this.keyBinding.setKeyboardHandler(e),t&&t()},this.getKeyboardHandler=function(){return this.keyBinding.getKeyboardHandler()},this.setSession=function(e){if(this.session==e)return;this.curOp&&this.endOperation(),this.curOp={};var t=this.session;if(t){this.session.off("change",this.$onDocumentChange),this.session.off("changeMode",this.$onChangeMode),this.session.off("tokenizerUpdate",this.$onTokenizerUpdate),this.session.off("changeTabSize",this.$onChangeTabSize),this.session.off("changeWrapLimit",this.$onChangeWrapLimit),this.session.off("changeWrapMode",this.$onChangeWrapMode),this.session.off("changeFold",this.$onChangeFold),this.session.off("changeFrontMarker",this.$onChangeFrontMarker),this.session.off("changeBackMarker",this.$onChangeBackMarker),this.session.off("changeBreakpoint",this.$onChangeBreakpoint),this.session.off("changeAnnotation",this.$onChangeAnnotation),this.session.off("changeOverwrite",this.$onCursorChange),this.session.off("changeScrollTop",this.$onScrollTopChange),this.session.off("changeScrollLeft",this.$onScrollLeftChange);var n=this.session.getSelection();n.off("changeCursor",this.$onCursorChange),n.off("changeSelection",this.$onSelectionChange)}this.session=e,e?(this.$onDocumentChange=this.onDocumentChange.bind(this),e.on("change",this.$onDocumentChange),this.renderer.setSession(e),this.$onChangeMode=this.onChangeMode.bind(this),e.on("changeMode",this.$onChangeMode),this.$onTokenizerUpdate=this.onTokenizerUpdate.bind(this),e.on("tokenizerUpdate",this.$onTokenizerUpdate),this.$onChangeTabSize=this.renderer.onChangeTabSize.bind(this.renderer),e.on("changeTabSize",this.$onChangeTabSize),this.$onChangeWrapLimit=this.onChangeWrapLimit.bind(this),e.on("changeWrapLimit",this.$onChangeWrapLimit),this.$onChangeWrapMode=this.onChangeWrapMode.bind(this),e.on("changeWrapMode",this.$onChangeWrapMode),this.$onChangeFold=this.onChangeFold.bind(this),e.on("changeFold",this.$onChangeFold),this.$onChangeFrontMarker=this.onChangeFrontMarker.bind(this),this.session.on("changeFrontMarker",this.$onChangeFrontMarker),this.$onChangeBackMarker=this.onChangeBackMarker.bind(this),this.session.on("changeBackMarker",this.$onChangeBackMarker),this.$onChangeBreakpoint=this.onChangeBreakpoint.bind(this),this.session.on("changeBreakpoint",this.$onChangeBreakpoint),this.$onChangeAnnotation=this.onChangeAnnotation.bind(this),this.session.on("changeAnnotation",this.$onChangeAnnotation),this.$onCursorChange=this.onCursorChange.bind(this),this.session.on("changeOverwrite",this.$onCursorChange),this.$onScrollTopChange=this.onScrollTopChange.bind(this),this.session.on("changeScrollTop",this.$onScrollTopChange),this.$onScrollLeftChange=this.onScrollLeftChange.bind(this),this.session.on("changeScrollLeft",this.$onScrollLeftChange),this.selection=e.getSelection(),this.selection.on("changeCursor",this.$onCursorChange),this.$onSelectionChange=this.onSelectionChange.bind(this),this.selection.on("changeSelection",this.$onSelectionChange),this.onChangeMode(),this.onCursorChange(),this.onScrollTopChange(),this.onScrollLeftChange(),this.onSelectionChange(),this.onChangeFrontMarker(),this.onChangeBackMarker(),this.onChangeBreakpoint(),this.onChangeAnnotation(),this.session.getUseWrapMode()&&this.renderer.adjustWrapLimit(),this.renderer.updateFull()):(this.selection=null,this.renderer.setSession(e)),this._signal("changeSession",{session:e,oldSession:t}),this.curOp=null,t&&t._signal("changeEditor",{oldEditor:this}),e&&e._signal("changeEditor",{editor:this}),e&&e.bgTokenizer&&e.bgTokenizer.scheduleStart()},this.getSession=function(){return this.session},this.setValue=function(e,t){return this.session.doc.setValue(e),t?t==1?this.navigateFileEnd():t==-1&&this.navigateFileStart():this.selectAll(),e},this.getValue=function(){return this.session.getValue()},this.getSelection=function(){return this.selection},this.resize=function(e){this.renderer.onResize(e)},this.setTheme=function(e,t){this.renderer.setTheme(e,t)},this.getTheme=function(){return this.renderer.getTheme()},this.setStyle=function(e){this.renderer.setStyle(e)},this.unsetStyle=function(e){this.renderer.unsetStyle(e)},this.getFontSize=function(){return this.getOption("fontSize")||i.computedStyle(this.container).fontSize},this.setFontSize=function(e){this.setOption("fontSize",e)},this.$highlightBrackets=function(){this.session.$bracketHighlight&&(this.session.removeMarker(this.session.$bracketHighlight),this.session.$bracketHighlight=null);if(this.$highlightPending)return;var e=this;this.$highlightPending=!0,setTimeout(function(){e.$highlightPending=!1;var t=e.session;if(!t||!t.bgTokenizer)return;var n=t.findMatchingBracket(e.getCursorPosition());if(n)var r=new p(n.row,n.column,n.row,n.column+1);else if(t.$mode.getMatching)var r=t.$mode.getMatching(e.session);r&&(t.$bracketHighlight=t.addMarker(r,"ace_bracket","text"))},50)},this.$highlightTags=function(){if(this.$highlightTagPending)return;var e=this;this.$highlightTagPending=!0,setTimeout(function(){e.$highlightTagPending=!1;var t=e.session;if(!t||!t.bgTokenizer)return;var n=e.getCursorPosition(),r=new y(e.session,n.row,n.column),i=r.getCurrentToken();if(!i||!/\b(?:tag-open|tag-name)/.test(i.type)){t.removeMarker(t.$tagHighlight),t.$tagHighlight=null;return}if(i.type.indexOf("tag-open")!=-1){i=r.stepForward();if(!i)return}var s=i.value,o=0,u=r.stepBackward();if(u.value=="<"){do u=i,i=r.stepForward(),i&&i.value===s&&i.type.indexOf("tag-name")!==-1&&(u.value==="<"?o++:u.value==="</"&&o--);while(i&&o>=0)}else{do i=u,u=r.stepBackward(),i&&i.value===s&&i.type.indexOf("tag-name")!==-1&&(u.value==="<"?o++:u.value==="</"&&o--);while(u&&o<=0);r.stepForward()}if(!i){t.removeMarker(t.$tagHighlight),t.$tagHighlight=null;return}var a=r.getCurrentTokenRow(),f=r.getCurrentTokenColumn(),l=new p(a,f,a,f+i.value.length),c=t.$backMarkers[t.$tagHighlight];t.$tagHighlight&&c!=undefined&&l.compareRange(c.range)!==0&&(t.removeMarker(t.$tagHighlight),t.$tagHighlight=null),t.$tagHighlight||(t.$tagHighlight=t.addMarker(l,"ace_bracket","text"))},50)},this.focus=function(){var e=this;setTimeout(function(){e.isFocused()||e.textInput.focus()}),this.textInput.focus()},this.isFocused=function(){return this.textInput.isFocused()},this.blur=function(){this.textInput.blur()},this.onFocus=function(e){if(this.$isFocused)return;this.$isFocused=!0,this.renderer.showCursor(),this.renderer.visualizeFocus(),this._emit("focus",e)},this.onBlur=function(e){if(!this.$isFocused)return;this.$isFocused=!1,this.renderer.hideCursor(),this.renderer.visualizeBlur(),this._emit("blur",e)},this.$cursorChange=function(){this.renderer.updateCursor()},this.onDocumentChange=function(e){var t=this.session.$useWrapMode,n=e.start.row==e.end.row?e.end.row:Infinity;this.renderer.updateLines(e.start.row,n,t),this._signal("change",e),this.$cursorChange(),this.$updateHighlightActiveLine()},this.onTokenizerUpdate=function(e){var t=e.data;this.renderer.updateLines(t.first,t.last)},this.onScrollTopChange=function(){this.renderer.scrollToY(this.session.getScrollTop())},this.onScrollLeftChange=function(){this.renderer.scrollToX(this.session.getScrollLeft())},this.onCursorChange=function(){this.$cursorChange(),this.$highlightBrackets(),this.$highlightTags(),this.$updateHighlightActiveLine(),this._signal("changeSelection")},this.$updateHighlightActiveLine=function(){var e=this.getSession(),t;if(this.$highlightActiveLine){if(this.$selectionStyle!="line"||!this.selection.isMultiLine())t=this.getCursorPosition();this.renderer.theme&&this.renderer.theme.$selectionColorConflict&&!this.selection.isEmpty()&&(t=!1),this.renderer.$maxLines&&this.session.getLength()===1&&!(this.renderer.$minLines>1)&&(t=!1)}if(e.$highlightLineMarker&&!t)e.removeMarker(e.$highlightLineMarker.id),e.$highlightLineMarker=null;else if(!e.$highlightLineMarker&&t){var n=new p(t.row,t.column,t.row,Infinity);n.id=e.addMarker(n,"ace_active-line","screenLine"),e.$highlightLineMarker=n}else t&&(e.$highlightLineMarker.start.row=t.row,e.$highlightLineMarker.end.row=t.row,e.$highlightLineMarker.start.column=t.column,e._signal("changeBackMarker"))},this.onSelectionChange=function(e){var t=this.session;t.$selectionMarker&&t.removeMarker(t.$selectionMarker),t.$selectionMarker=null;if(!this.selection.isEmpty()){var n=this.selection.getRange(),r=this.getSelectionStyle();t.$selectionMarker=t.addMarker(n,"ace_selection",r)}else this.$updateHighlightActiveLine();var i=this.$highlightSelectedWord&&this.$getSelectionHighLightRegexp();this.session.highlight(i),this._signal("changeSelection")},this.$getSelectionHighLightRegexp=function(){var e=this.session,t=this.getSelectionRange();if(t.isEmpty()||t.isMultiLine())return;var n=t.start.column,r=t.end.column,i=e.getLine(t.start.row),s=i.substring(n,r);if(s.length>5e3||!/[\w\d]/.test(s))return;var o=this.$search.$assembleRegExp({wholeWord:!0,caseSensitive:!0,needle:s}),u=i.substring(n-1,r+1);if(!o.test(u))return;return o},this.onChangeFrontMarker=function(){this.renderer.updateFrontMarkers()},this.onChangeBackMarker=function(){this.renderer.updateBackMarkers()},this.onChangeBreakpoint=function(){this.renderer.updateBreakpoints()},this.onChangeAnnotation=function(){this.renderer.setAnnotations(this.session.getAnnotations())},this.onChangeMode=function(e){this.renderer.updateText(),this._emit("changeMode",e)},this.onChangeWrapLimit=function(){this.renderer.updateFull()},this.onChangeWrapMode=function(){this.renderer.onResize(!0)},this.onChangeFold=function(){this.$updateHighlightActiveLine(),this.renderer.updateFull()},this.getSelectedText=function(){return this.session.getTextRange(this.getSelectionRange())},this.getCopyText=function(){var e=this.getSelectedText(),t=this.session.doc.getNewLineCharacter(),n=!1;if(!e&&this.$copyWithEmptySelection){n=!0;var r=this.selection.getAllRanges();for(var i=0;i<r.length;i++){var s=r[i];if(i&&r[i-1].start.row==s.start.row)continue;e+=this.session.getLine(s.start.row)+t}}var o={text:e};return this._signal("copy",o),b.lineMode=n?o.text:"",o.text},this.onCopy=function(){this.commands.exec("copy",this)},this.onCut=function(){this.commands.exec("cut",this)},this.onPaste=function(e,t){var n={text:e,event:t};this.commands.exec("paste",this,n)},this.$handlePaste=function(e){typeof e=="string"&&(e={text:e}),this._signal("paste",e);var t=e.text,n=t==b.lineMode,r=this.session;if(!this.inMultiSelectMode||this.inVirtualSelectionMode)n?r.insert({row:this.selection.lead.row,column:0},t):this.insert(t);else if(n)this.selection.rangeList.ranges.forEach(function(e){r.insert({row:e.start.row,column:0},t)});else{var i=t.split(/\r\n|\r|\n/),s=this.selection.rangeList.ranges;if(i.length>s.length||i.length<2||!i[1])return this.commands.exec("insertstring",this,t);for(var o=s.length;o--;){var u=s[o];u.isEmpty()||r.remove(u),r.insert(u.start,i[o])}}},this.execCommand=function(e,t){return this.commands.exec(e,this,t)},this.insert=function(e,t){var n=this.session,r=n.getMode(),i=this.getCursorPosition();if(this.getBehavioursEnabled()&&!t){var s=r.transformAction(n.getState(i.row),"insertion",this,n,e);s&&(e!==s.text&&(this.inVirtualSelectionMode||(this.session.mergeUndoDeltas=!1,this.mergeNextCommand=!1)),e=s.text)}e=="	"&&(e=this.session.getTabString());if(!this.selection.isEmpty()){var o=this.getSelectionRange();i=this.session.remove(o),this.clearSelection()}else if(this.session.getOverwrite()&&e.indexOf("\n")==-1){var o=new p.fromPoints(i,i);o.end.column+=e.length,this.session.remove(o)}if(e=="\n"||e=="\r\n"){var u=n.getLine(i.row);if(i.column>u.search(/\S|$/)){var a=u.substr(i.column).search(/\S|$/);n.doc.removeInLine(i.row,i.column,i.column+a)}}this.clearSelection();var f=i.column,l=n.getState(i.row),u=n.getLine(i.row),c=r.checkOutdent(l,u,e),h=n.insert(i,e);s&&s.selection&&(s.selection.length==2?this.selection.setSelectionRange(new p(i.row,f+s.selection[0],i.row,f+s.selection[1])):this.selection.setSelectionRange(new p(i.row+s.selection[0],s.selection[1],i.row+s.selection[2],s.selection[3])));if(n.getDocument().isNewLine(e)){var d=r.getNextLineIndent(l,u.slice(0,i.column),n.getTabString());n.insert({row:i.row+1,column:0},d)}c&&r.autoOutdent(l,n,i.row)},this.onTextInput=function(e,t){if(!t)return this.keyBinding.onTextInput(e);this.startOperation({command:{name:"insertstring"}});var n=this.applyComposition.bind(this,e,t);this.selection.rangeCount?this.forEachSelection(n):n(),this.endOperation()},this.applyComposition=function(e,t){if(t.extendLeft||t.extendRight){var n=this.selection.getRange();n.start.column-=t.extendLeft,n.end.column+=t.extendRight,this.selection.setRange(n),!e&&!n.isEmpty()&&this.remove()}(e||!this.selection.isEmpty())&&this.insert(e,!0);if(t.restoreStart||t.restoreEnd){var n=this.selection.getRange();n.start.column-=t.restoreStart,n.end.column-=t.restoreEnd,this.selection.setRange(n)}},this.onCommandKey=function(e,t,n){this.keyBinding.onCommandKey(e,t,n)},this.setOverwrite=function(e){this.session.setOverwrite(e)},this.getOverwrite=function(){return this.session.getOverwrite()},this.toggleOverwrite=function(){this.session.toggleOverwrite()},this.setScrollSpeed=function(e){this.setOption("scrollSpeed",e)},this.getScrollSpeed=function(){return this.getOption("scrollSpeed")},this.setDragDelay=function(e){this.setOption("dragDelay",e)},this.getDragDelay=function(){return this.getOption("dragDelay")},this.setSelectionStyle=function(e){this.setOption("selectionStyle",e)},this.getSelectionStyle=function(){return this.getOption("selectionStyle")},this.setHighlightActiveLine=function(e){this.setOption("highlightActiveLine",e)},this.getHighlightActiveLine=function(){return this.getOption("highlightActiveLine")},this.setHighlightGutterLine=function(e){this.setOption("highlightGutterLine",e)},this.getHighlightGutterLine=function(){return this.getOption("highlightGutterLine")},this.setHighlightSelectedWord=function(e){this.setOption("highlightSelectedWord",e)},this.getHighlightSelectedWord=function(){return this.$highlightSelectedWord},this.setAnimatedScroll=function(e){this.renderer.setAnimatedScroll(e)},this.getAnimatedScroll=function(){return this.renderer.getAnimatedScroll()},this.setShowInvisibles=function(e){this.renderer.setShowInvisibles(e)},this.getShowInvisibles=function(){return this.renderer.getShowInvisibles()},this.setDisplayIndentGuides=function(e){this.renderer.setDisplayIndentGuides(e)},this.getDisplayIndentGuides=function(){return this.renderer.getDisplayIndentGuides()},this.setShowPrintMargin=function(e){this.renderer.setShowPrintMargin(e)},this.getShowPrintMargin=function(){return this.renderer.getShowPrintMargin()},this.setPrintMarginColumn=function(e){this.renderer.setPrintMarginColumn(e)},this.getPrintMarginColumn=function(){return this.renderer.getPrintMarginColumn()},this.setReadOnly=function(e){this.setOption("readOnly",e)},this.getReadOnly=function(){return this.getOption("readOnly")},this.setBehavioursEnabled=function(e){this.setOption("behavioursEnabled",e)},this.getBehavioursEnabled=function(){return this.getOption("behavioursEnabled")},this.setWrapBehavioursEnabled=function(e){this.setOption("wrapBehavioursEnabled",e)},this.getWrapBehavioursEnabled=function(){return this.getOption("wrapBehavioursEnabled")},this.setShowFoldWidgets=function(e){this.setOption("showFoldWidgets",e)},this.getShowFoldWidgets=function(){return this.getOption("showFoldWidgets")},this.setFadeFoldWidgets=function(e){this.setOption("fadeFoldWidgets",e)},this.getFadeFoldWidgets=function(){return this.getOption("fadeFoldWidgets")},this.remove=function(e){this.selection.isEmpty()&&(e=="left"?this.selection.selectLeft():this.selection.selectRight());var t=this.getSelectionRange();if(this.getBehavioursEnabled()){var n=this.session,r=n.getState(t.start.row),i=n.getMode().transformAction(r,"deletion",this,n,t);if(t.end.column===0){var s=n.getTextRange(t);if(s[s.length-1]=="\n"){var o=n.getLine(t.end.row);/^\s+$/.test(o)&&(t.end.column=o.length)}}i&&(t=i)}this.session.remove(t),this.clearSelection()},this.removeWordRight=function(){this.selection.isEmpty()&&this.selection.selectWordRight(),this.session.remove(this.getSelectionRange()),this.clearSelection()},this.removeWordLeft=function(){this.selection.isEmpty()&&this.selection.selectWordLeft(),this.session.remove(this.getSelectionRange()),this.clearSelection()},this.removeToLineStart=function(){this.selection.isEmpty()&&this.selection.selectLineStart(),this.selection.isEmpty()&&this.selection.selectLeft(),this.session.remove(this.getSelectionRange()),this.clearSelection()},this.removeToLineEnd=function(){this.selection.isEmpty()&&this.selection.selectLineEnd();var e=this.getSelectionRange();e.start.column==e.end.column&&e.start.row==e.end.row&&(e.end.column=0,e.end.row++),this.session.remove(e),this.clearSelection()},this.splitLine=function(){this.selection.isEmpty()||(this.session.remove(this.getSelectionRange()),this.clearSelection());var e=this.getCursorPosition();this.insert("\n"),this.moveCursorToPosition(e)},this.transposeLetters=function(){if(!this.selection.isEmpty())return;var e=this.getCursorPosition(),t=e.column;if(t===0)return;var n=this.session.getLine(e.row),r,i;t<n.length?(r=n.charAt(t)+n.charAt(t-1),i=new p(e.row,t-1,e.row,t+1)):(r=n.charAt(t-1)+n.charAt(t-2),i=new p(e.row,t-2,e.row,t)),this.session.replace(i,r),this.session.selection.moveToPosition(i.end)},this.toLowerCase=function(){var e=this.getSelectionRange();this.selection.isEmpty()&&this.selection.selectWord();var t=this.getSelectionRange(),n=this.session.getTextRange(t);this.session.replace(t,n.toLowerCase()),this.selection.setSelectionRange(e)},this.toUpperCase=function(){var e=this.getSelectionRange();this.selection.isEmpty()&&this.selection.selectWord();var t=this.getSelectionRange(),n=this.session.getTextRange(t);this.session.replace(t,n.toUpperCase()),this.selection.setSelectionRange(e)},this.indent=function(){var e=this.session,t=this.getSelectionRange();if(t.start.row<t.end.row){var n=this.$getSelectedRows();e.indentRows(n.first,n.last,"	");return}if(t.start.column<t.end.column){var r=e.getTextRange(t);if(!/^\s+$/.test(r)){var n=this.$getSelectedRows();e.indentRows(n.first,n.last,"	");return}}var i=e.getLine(t.start.row),o=t.start,u=e.getTabSize(),a=e.documentToScreenColumn(o.row,o.column);if(this.session.getUseSoftTabs())var f=u-a%u,l=s.stringRepeat(" ",f);else{var f=a%u;while(i[t.start.column-1]==" "&&f)t.start.column--,f--;this.selection.setSelectionRange(t),l="	"}return this.insert(l)},this.blockIndent=function(){var e=this.$getSelectedRows();this.session.indentRows(e.first,e.last,"	")},this.blockOutdent=function(){var e=this.session.getSelection();this.session.outdentRows(e.getRange())},this.sortLines=function(){var e=this.$getSelectedRows(),t=this.session,n=[];for(var r=e.first;r<=e.last;r++)n.push(t.getLine(r));n.sort(function(e,t){return e.toLowerCase()<t.toLowerCase()?-1:e.toLowerCase()>t.toLowerCase()?1:0});var i=new p(0,0,0,0);for(var r=e.first;r<=e.last;r++){var s=t.getLine(r);i.start.row=r,i.end.row=r,i.end.column=s.length,t.replace(i,n[r-e.first])}},this.toggleCommentLines=function(){var e=this.session.getState(this.getCursorPosition().row),t=this.$getSelectedRows();this.session.getMode().toggleCommentLines(e,this.session,t.first,t.last)},this.toggleBlockComment=function(){var e=this.getCursorPosition(),t=this.session.getState(e.row),n=this.getSelectionRange();this.session.getMode().toggleBlockComment(t,this.session,n,e)},this.getNumberAt=function(e,t){var n=/[\-]?[0-9]+(?:\.[0-9]+)?/g;n.lastIndex=0;var r=this.session.getLine(e);while(n.lastIndex<t){var i=n.exec(r);if(i.index<=t&&i.index+i[0].length>=t){var s={value:i[0],start:i.index,end:i.index+i[0].length};return s}}return null},this.modifyNumber=function(e){var t=this.selection.getCursor().row,n=this.selection.getCursor().column,r=new p(t,n-1,t,n),i=this.session.getTextRange(r);if(!isNaN(parseFloat(i))&&isFinite(i)){var s=this.getNumberAt(t,n);if(s){var o=s.value.indexOf(".")>=0?s.start+s.value.indexOf(".")+1:s.end,u=s.start+s.value.length-o,a=parseFloat(s.value);a*=Math.pow(10,u),o!==s.end&&n<o?e*=Math.pow(10,s.end-n-1):e*=Math.pow(10,s.end-n),a+=e,a/=Math.pow(10,u);var f=a.toFixed(u),l=new p(t,s.start,t,s.end);this.session.replace(l,f),this.moveCursorTo(t,Math.max(s.start+1,n+f.length-s.value.length))}}else this.toggleWord()},this.$toggleWordPairs=[["first","last"],["true","false"],["yes","no"],["width","height"],["top","bottom"],["right","left"],["on","off"],["x","y"],["get","set"],["max","min"],["horizontal","vertical"],["show","hide"],["add","remove"],["up","down"],["before","after"],["even","odd"],["inside","outside"],["next","previous"],["increase","decrease"],["attach","detach"],["&&","||"],["==","!="]],this.toggleWord=function(){var e=this.selection.getCursor().row,t=this.selection.getCursor().column;this.selection.selectWord();var n=this.getSelectedText(),r=this.selection.getWordRange().start.column,i=n.replace(/([a-z]+|[A-Z]+)(?=[A-Z_]|$)/g,"$1 ").split(/\s/),o=t-r-1;o<0&&(o=0);var u=0,a=0,f=this;n.match(/[A-Za-z0-9_]+/)&&i.forEach(function(t,i){a=u+t.length,o>=u&&o<=a&&(n=t,f.selection.clearSelection(),f.moveCursorTo(e,u+r),f.selection.selectTo(e,a+r)),u=a});var l=this.$toggleWordPairs,c;for(var h=0;h<l.length;h++){var p=l[h];for(var d=0;d<=1;d++){var v=+!d,m=n.match(new RegExp("^\\s?_?("+s.escapeRegExp(p[d])+")\\s?$","i"));if(m){var g=n.match(new RegExp("([_]|^|\\s)("+s.escapeRegExp(m[1])+")($|\\s)","g"));g&&(c=n.replace(new RegExp(s.escapeRegExp(p[d]),"i"),function(e){var t=p[v];return e.toUpperCase()==e?t=t.toUpperCase():e.charAt(0).toUpperCase()==e.charAt(0)&&(t=t.substr(0,0)+p[v].charAt(0).toUpperCase()+t.substr(1)),t}),this.insert(c),c="")}}}},this.removeLines=function(){var e=this.$getSelectedRows();this.session.removeFullLines(e.first,e.last),this.clearSelection()},this.duplicateSelection=function(){var e=this.selection,t=this.session,n=e.getRange(),r=e.isBackwards();if(n.isEmpty()){var i=n.start.row;t.duplicateLines(i,i)}else{var s=r?n.start:n.end,o=t.insert(s,t.getTextRange(n),!1);n.start=s,n.end=o,e.setSelectionRange(n,r)}},this.moveLinesDown=function(){this.$moveLines(1,!1)},this.moveLinesUp=function(){this.$moveLines(-1,!1)},this.moveText=function(e,t,n){return this.session.moveText(e,t,n)},this.copyLinesUp=function(){this.$moveLines(-1,!0)},this.copyLinesDown=function(){this.$moveLines(1,!0)},this.$moveLines=function(e,t){var n,r,i=this.selection;if(!i.inMultiSelectMode||this.inVirtualSelectionMode){var s=i.toOrientedRange();n=this.$getSelectedRows(s),r=this.session.$moveLines(n.first,n.last,t?0:e),t&&e==-1&&(r=0),s.moveBy(r,0),i.fromOrientedRange(s)}else{var o=i.rangeList.ranges;i.rangeList.detach(this.session),this.inVirtualSelectionMode=!0;var u=0,a=0,f=o.length;for(var l=0;l<f;l++){var c=l;o[l].moveBy(u,0),n=this.$getSelectedRows(o[l]);var h=n.first,p=n.last;while(++l<f){a&&o[l].moveBy(a,0);var d=this.$getSelectedRows(o[l]);if(t&&d.first!=p)break;if(!t&&d.first>p+1)break;p=d.last}l--,u=this.session.$moveLines(h,p,t?0:e),t&&e==-1&&(c=l+1);while(c<=l)o[c].moveBy(u,0),c++;t||(u=0),a+=u}i.fromOrientedRange(i.ranges[0]),i.rangeList.attach(this.session),this.inVirtualSelectionMode=!1}},this.$getSelectedRows=function(e){return e=(e||this.getSelectionRange()).collapseRows(),{first:this.session.getRowFoldStart(e.start.row),last:this.session.getRowFoldEnd(e.end.row)}},this.onCompositionStart=function(e){this.renderer.showComposition(e)},this.onCompositionUpdate=function(e){this.renderer.setCompositionText(e)},this.onCompositionEnd=function(){this.renderer.hideComposition()},this.getFirstVisibleRow=function(){return this.renderer.getFirstVisibleRow()},this.getLastVisibleRow=function(){return this.renderer.getLastVisibleRow()},this.isRowVisible=function(e){return e>=this.getFirstVisibleRow()&&e<=this.getLastVisibleRow()},this.isRowFullyVisible=function(e){return e>=this.renderer.getFirstFullyVisibleRow()&&e<=this.renderer.getLastFullyVisibleRow()},this.$getVisibleRowCount=function(){return this.renderer.getScrollBottomRow()-this.renderer.getScrollTopRow()+1},this.$moveByPage=function(e,t){var n=this.renderer,r=this.renderer.layerConfig,i=e*Math.floor(r.height/r.lineHeight);t===!0?this.selection.$moveSelection(function(){this.moveCursorBy(i,0)}):t===!1&&(this.selection.moveCursorBy(i,0),this.selection.clearSelection());var s=n.scrollTop;n.scrollBy(0,i*r.lineHeight),t!=null&&n.scrollCursorIntoView(null,.5),n.animateScrolling(s)},this.selectPageDown=function(){this.$moveByPage(1,!0)},this.selectPageUp=function(){this.$moveByPage(-1,!0)},this.gotoPageDown=function(){this.$moveByPage(1,!1)},this.gotoPageUp=function(){this.$moveByPage(-1,!1)},this.scrollPageDown=function(){this.$moveByPage(1)},this.scrollPageUp=function(){this.$moveByPage(-1)},this.scrollToRow=function(e){this.renderer.scrollToRow(e)},this.scrollToLine=function(e,t,n,r){this.renderer.scrollToLine(e,t,n,r)},this.centerSelection=function(){var e=this.getSelectionRange(),t={row:Math.floor(e.start.row+(e.end.row-e.start.row)/2),column:Math.floor(e.start.column+(e.end.column-e.start.column)/2)};this.renderer.alignCursor(t,.5)},this.getCursorPosition=function(){return this.selection.getCursor()},this.getCursorPositionScreen=function(){return this.session.documentToScreenPosition(this.getCursorPosition())},this.getSelectionRange=function(){return this.selection.getRange()},this.selectAll=function(){this.selection.selectAll()},this.clearSelection=function(){this.selection.clearSelection()},this.moveCursorTo=function(e,t){this.selection.moveCursorTo(e,t)},this.moveCursorToPosition=function(e){this.selection.moveCursorToPosition(e)},this.jumpToMatching=function(e,t){var n=this.getCursorPosition(),r=new y(this.session,n.row,n.column),i=r.getCurrentToken(),s=i||r.stepForward();if(!s)return;var o,u=!1,a={},f=n.column-s.start,l,c={")":"(","(":"(","]":"[","[":"[","{":"{","}":"{"};do{if(s.value.match(/[{}()\[\]]/g))for(;f<s.value.length&&!u;f++){if(!c[s.value[f]])continue;l=c[s.value[f]]+"."+s.type.replace("rparen","lparen"),isNaN(a[l])&&(a[l]=0);switch(s.value[f]){case"(":case"[":case"{":a[l]++;break;case")":case"]":case"}":a[l]--,a[l]===-1&&(o="bracket",u=!0)}}else s.type.indexOf("tag-name")!==-1&&(isNaN(a[s.value])&&(a[s.value]=0),i.value==="<"?a[s.value]++:i.value==="</"&&a[s.value]--,a[s.value]===-1&&(o="tag",u=!0));u||(i=s,s=r.stepForward(),f=0)}while(s&&!u);if(!o)return;var h,d;if(o==="bracket"){h=this.session.getBracketRange(n);if(!h){h=new p(r.getCurrentTokenRow(),r.getCurrentTokenColumn()+f-1,r.getCurrentTokenRow(),r.getCurrentTokenColumn()+f-1),d=h.start;if(t||d.row===n.row&&Math.abs(d.column-n.column)<2)h=this.session.getBracketRange(d)}}else if(o==="tag"){if(!s||s.type.indexOf("tag-name")===-1)return;var v=s.value;h=new p(r.getCurrentTokenRow(),r.getCurrentTokenColumn()-2,r.getCurrentTokenRow(),r.getCurrentTokenColumn()-2);if(h.compare(n.row,n.column)===0){u=!1;do s=i,i=r.stepBackward(),i&&(i.type.indexOf("tag-close")!==-1&&h.setEnd(r.getCurrentTokenRow(),r.getCurrentTokenColumn()+1),s.value===v&&s.type.indexOf("tag-name")!==-1&&(i.value==="<"?a[v]++:i.value==="</"&&a[v]--,a[v]===0&&(u=!0)));while(i&&!u)}s&&s.type.indexOf("tag-name")&&(d=h.start,d.row==n.row&&Math.abs(d.column-n.column)<2&&(d=h.end))}d=h&&h.cursor||d,d&&(e?h&&t?this.selection.setRange(h):h&&h.isEqual(this.getSelectionRange())?this.clearSelection():this.selection.selectTo(d.row,d.column):this.selection.moveTo(d.row,d.column))},this.gotoLine=function(e,t,n){this.selection.clearSelection(),this.session.unfold({row:e-1,column:t||0}),this.exitMultiSelectMode&&this.exitMultiSelectMode(),this.moveCursorTo(e-1,t||0),this.isRowFullyVisible(e-1)||this.scrollToLine(e-1,!0,n)},this.navigateTo=function(e,t){this.selection.moveTo(e,t)},this.navigateUp=function(e){if(this.selection.isMultiLine()&&!this.selection.isBackwards()){var t=this.selection.anchor.getPosition();return this.moveCursorToPosition(t)}this.selection.clearSelection(),this.selection.moveCursorBy(-e||-1,0)},this.navigateDown=function(e){if(this.selection.isMultiLine()&&this.selection.isBackwards()){var t=this.selection.anchor.getPosition();return this.moveCursorToPosition(t)}this.selection.clearSelection(),this.selection.moveCursorBy(e||1,0)},this.navigateLeft=function(e){if(!this.selection.isEmpty()){var t=this.getSelectionRange().start;this.moveCursorToPosition(t)}else{e=e||1;while(e--)this.selection.moveCursorLeft()}this.clearSelection()},this.navigateRight=function(e){if(!this.selection.isEmpty()){var t=this.getSelectionRange().end;this.moveCursorToPosition(t)}else{e=e||1;while(e--)this.selection.moveCursorRight()}this.clearSelection()},this.navigateLineStart=function(){this.selection.moveCursorLineStart(),this.clearSelection()},this.navigateLineEnd=function(){this.selection.moveCursorLineEnd(),this.clearSelection()},this.navigateFileEnd=function(){this.selection.moveCursorFileEnd(),this.clearSelection()},this.navigateFileStart=function(){this.selection.moveCursorFileStart(),this.clearSelection()},this.navigateWordRight=function(){this.selection.moveCursorWordRight(),this.clearSelection()},this.navigateWordLeft=function(){this.selection.moveCursorWordLeft(),this.clearSelection()},this.replace=function(e,t){t&&this.$search.set(t);var n=this.$search.find(this.session),r=0;return n?(this.$tryReplace(n,e)&&(r=1),this.selection.setSelectionRange(n),this.renderer.scrollSelectionIntoView(n.start,n.end),r):r},this.replaceAll=function(e,t){t&&this.$search.set(t);var n=this.$search.findAll(this.session),r=0;if(!n.length)return r;var i=this.getSelectionRange();this.selection.moveTo(0,0);for(var s=n.length-1;s>=0;--s)this.$tryReplace(n[s],e)&&r++;return this.selection.setSelectionRange(i),r},this.$tryReplace=function(e,t){var n=this.session.getTextRange(e);return t=this.$search.replace(n,t),t!==null?(e.end=this.session.replace(e,t),e):null},this.getLastSearchOptions=function(){return this.$search.getOptions()},this.find=function(e,t,n){t||(t={}),typeof e=="string"||e instanceof RegExp?t.needle=e:typeof e=="object"&&r.mixin(t,e);var i=this.selection.getRange();t.needle==null&&(e=this.session.getTextRange(i)||this.$search.$options.needle,e||(i=this.session.getWordRange(i.start.row,i.start.column),e=this.session.getTextRange(i)),this.$search.set({needle:e})),this.$search.set(t),t.start||this.$search.set({start:i});var s=this.$search.find(this.session);if(t.preventScroll)return s;if(s)return this.revealRange(s,n),s;t.backwards?i.start=i.end:i.end=i.start,this.selection.setRange(i)},this.findNext=function(e,t){this.find({skipCurrent:!0,backwards:!1},e,t)},this.findPrevious=function(e,t){this.find(e,{skipCurrent:!0,backwards:!0},t)},this.revealRange=function(e,t){this.session.unfold(e),this.selection.setSelectionRange(e);var n=this.renderer.scrollTop;this.renderer.scrollSelectionIntoView(e.start,e.end,.5),t!==!1&&this.renderer.animateScrolling(n)},this.undo=function(){this.session.getUndoManager().undo(this.session),this.renderer.scrollCursorIntoView(null,.5)},this.redo=function(){this.session.getUndoManager().redo(this.session),this.renderer.scrollCursorIntoView(null,.5)},this.destroy=function(){this.renderer.destroy(),this._signal("destroy",this),this.session&&this.session.destroy()},this.setAutoScrollEditorIntoView=function(e){if(!e)return;var t,n=this,r=!1;this.$scrollAnchor||(this.$scrollAnchor=document.createElement("div"));var i=this.$scrollAnchor;i.style.cssText="position:absolute",this.container.insertBefore(i,this.container.firstChild);var s=this.on("changeSelection",function(){r=!0}),o=this.renderer.on("beforeRender",function(){r&&(t=n.renderer.container.getBoundingClientRect())}),u=this.renderer.on("afterRender",function(){if(r&&t&&(n.isFocused()||n.searchBox&&n.searchBox.isFocused())){var e=n.renderer,s=e.$cursorLayer.$pixelPos,o=e.layerConfig,u=s.top-o.offset;s.top>=0&&u+t.top<0?r=!0:s.top<o.height&&s.top+t.top+o.lineHeight>window.innerHeight?r=!1:r=null,r!=null&&(i.style.top=u+"px",i.style.left=s.left+"px",i.style.height=o.lineHeight+"px",i.scrollIntoView(r)),r=t=null}});this.setAutoScrollEditorIntoView=function(e){if(e)return;delete this.setAutoScrollEditorIntoView,this.off("changeSelection",s),this.renderer.off("afterRender",u),this.renderer.off("beforeRender",o)}},this.$resetCursorStyle=function(){var e=this.$cursorStyle||"ace",t=this.renderer.$cursorLayer;if(!t)return;t.setSmoothBlinking(/smooth/.test(e)),t.isBlinking=!this.$readOnly&&e!="wide",i.setCssClass(t.element,"ace_slim-cursors",/slim/.test(e))}}.call(w.prototype),g.defineOptions(w.prototype,"editor",{selectionStyle:{set:function(e){this.onSelectionChange(),this._signal("changeSelectionStyle",{data:e})},initialValue:"line"},highlightActiveLine:{set:function(){this.$updateHighlightActiveLine()},initialValue:!0},highlightSelectedWord:{set:function(e){this.$onSelectionChange()},initialValue:!0},readOnly:{set:function(e){this.textInput.setReadOnly(e),this.$resetCursorStyle()},initialValue:!1},copyWithEmptySelection:{set:function(e){this.textInput.setCopyWithEmptySelection(e)},initialValue:!1},cursorStyle:{set:function(e){this.$resetCursorStyle()},values:["ace","slim","smooth","wide"],initialValue:"ace"},mergeUndoDeltas:{values:[!1,!0,"always"],initialValue:!0},behavioursEnabled:{initialValue:!0},wrapBehavioursEnabled:{initialValue:!0},autoScrollEditorIntoView:{set:function(e){this.setAutoScrollEditorIntoView(e)}},keyboardHandler:{set:function(e){this.setKeyboardHandler(e)},get:function(){return this.$keybindingId},handlesSet:!0},value:{set:function(e){this.session.setValue(e)},get:function(){return this.getValue()},handlesSet:!0,hidden:!0},session:{set:function(e){this.setSession(e)},get:function(){return this.session},handlesSet:!0,hidden:!0},showLineNumbers:{set:function(e){this.renderer.$gutterLayer.setShowLineNumbers(e),this.renderer.$loop.schedule(this.renderer.CHANGE_GUTTER),e&&this.$relativeLineNumbers?E.attach(this):E.detach(this)},initialValue:!0},relativeLineNumbers:{set:function(e){this.$showLineNumbers&&e?E.attach(this):E.detach(this)}},hScrollBarAlwaysVisible:"renderer",vScrollBarAlwaysVisible:"renderer",highlightGutterLine:"renderer",animatedScroll:"renderer",showInvisibles:"renderer",showPrintMargin:"renderer",printMarginColumn:"renderer",printMargin:"renderer",fadeFoldWidgets:"renderer",showFoldWidgets:"renderer",displayIndentGuides:"renderer",showGutter:"renderer",fontSize:"renderer",fontFamily:"renderer",maxLines:"renderer",minLines:"renderer",scrollPastEnd:"renderer",fixedWidthGutter:"renderer",theme:"renderer",hasCssTransforms:"renderer",maxPixelHeight:"renderer",useTextareaForIME:"renderer",scrollSpeed:"$mouseHandler",dragDelay:"$mouseHandler",dragEnabled:"$mouseHandler",focusTimeout:"$mouseHandler",tooltipFollowsMouse:"$mouseHandler",firstLineNumber:"session",overwrite:"session",newLineMode:"session",useWorker:"session",useSoftTabs:"session",navigateWithinSoftTabs:"session",tabSize:"session",wrap:"session",indentedSoftWrap:"session",foldStyle:"session",mode:"session"});var E={getText:function(e,t){return(Math.abs(e.selection.lead.row-t)||t+1+(t<9?"\u00b7":""))+""},getWidth:function(e,t,n){return Math.max(t.toString().length,(n.lastRow+1).toString().length,2)*n.characterWidth},update:function(e,t){t.renderer.$loop.schedule(t.renderer.CHANGE_GUTTER)},attach:function(e){e.renderer.$gutterLayer.$renderer=this,e.on("changeSelection",this.update),this.update(null,e)},detach:function(e){e.renderer.$gutterLayer.$renderer==this&&(e.renderer.$gutterLayer.$renderer=null),e.off("changeSelection",this.update),this.update(null,e)}};t.Editor=w}),ace.define("ace/undomanager",["require","exports","module","ace/range"],function(e,t,n){"use strict";function i(e,t){for(var n=t;n--;){var r=e[n];if(r&&!r[0].ignore){while(n<t-1){var i=d(e[n],e[n+1]);e[n]=i[0],e[n+1]=i[1],n++}return!0}}}function a(e){var t=e.action=="insert",n=e.start,r=e.end,i=(r.row-n.row)*(t?1:-1),s=(r.column-n.column)*(t?1:-1);t&&(r=n);for(var o in this.marks){var a=this.marks[o],f=u(a,n);if(f<0)continue;if(f===0&&t){if(a.bias!=1){a.bias==-1;continue}f=1}var l=t?f:u(a,r);if(l>0){a.row+=i,a.column+=a.row==r.row?s:0;continue}!t&&l<=0&&(a.row=n.row,a.column=n.column,l===0&&(a.bias=1))}}function f(e){return{row:e.row,column:e.column}}function l(e){return{start:f(e.start),end:f(e.end),action:e.action,lines:e.lines.slice()}}function c(e){e=e||this;if(Array.isArray(e))return e.map(c).join("\n");var t="";e.action?(t=e.action=="insert"?"+":"-",t+="["+e.lines+"]"):e.value&&(Array.isArray(e.value)?t=e.value.map(h).join("\n"):t=h(e.value)),e.start&&(t+=h(e));if(e.id||e.rev)t+="	("+(e.id||e.rev)+")";return t}function h(e){return e.start.row+":"+e.start.column+"=>"+e.end.row+":"+e.end.column}function p(e,t){var n=e.action=="insert",r=t.action=="insert";if(n&&r)if(o(t.start,e.end)>=0)m(t,e,-1);else{if(!(o(t.start,e.start)<=0))return null;m(e,t,1)}else if(n&&!r)if(o(t.start,e.end)>=0)m(t,e,-1);else{if(!(o(t.end,e.start)<=0))return null;m(e,t,-1)}else if(!n&&r)if(o(t.start,e.start)>=0)m(t,e,1);else{if(!(o(t.start,e.start)<=0))return null;m(e,t,1)}else if(!n&&!r)if(o(t.start,e.start)>=0)m(t,e,1);else{if(!(o(t.end,e.start)<=0))return null;m(e,t,-1)}return[t,e]}function d(e,t){for(var n=e.length;n--;)for(var r=0;r<t.length;r++)if(!p(e[n],t[r])){while(n<e.length){while(r--)p(t[r],e[n]);r=t.length,n++}return[e,t]}return e.selectionBefore=t.selectionBefore=e.selectionAfter=t.selectionAfter=null,[t,e]}function v(e,t){var n=e.action=="insert",r=t.action=="insert";if(n&&r)o(e.start,t.start)<0?m(t,e,1):m(e,t,1);else if(n&&!r)o(e.start,t.end)>=0?m(e,t,-1):o(e.start,t.start)<=0?m(t,e,1):(m(e,s.fromPoints(t.start,e.start),-1),m(t,e,1));else if(!n&&r)o(t.start,e.end)>=0?m(t,e,-1):o(t.start,e.start)<=0?m(e,t,1):(m(t,s.fromPoints(e.start,t.start),-1),m(e,t,1));else if(!n&&!r)if(o(t.start,e.end)>=0)m(t,e,-1);else{if(!(o(t.end,e.start)<=0)){var i,u;return o(e.start,t.start)<0&&(i=e,e=y(e,t.start)),o(e.end,t.end)>0&&(u=y(e,t.end)),g(t.end,e.start,e.end,-1),u&&!i&&(e.lines=u.lines,e.start=u.start,e.end=u.end,u=e),[t,i,u].filter(Boolean)}m(e,t,-1)}return[t,e]}function m(e,t,n){g(e.start,t.start,t.end,n),g(e.end,t.start,t.end,n)}function g(e,t,n,r){e.row==(r==1?t:n).row&&(e.column+=r*(n.column-t.column)),e.row+=r*(n.row-t.row)}function y(e,t){var n=e.lines,r=e.end;e.end=f(t);var i=e.end.row-e.start.row,s=n.splice(i,n.length),o=i?t.column:t.column-e.start.column;n.push(s[0].substring(0,o)),s[0]=s[0].substr(o);var u={start:f(t),end:r,lines:s,action:e.action};return u}function b(e,t){t=l(t);for(var n=e.length;n--;){var r=e[n];for(var i=0;i<r.length;i++){var s=r[i],o=v(s,t);t=o[0],o.length!=2&&(o[2]?(r.splice(i+1,1,o[1],o[2]),i++):o[1]||(r.splice(i,1),i--))}r.length||e.splice(n,1)}return e}function w(e,t){for(var n=0;n<t.length;n++){var r=t[n];for(var i=0;i<r.length;i++)b(e,r[i])}}var r=function(){this.$maxRev=0,this.$fromUndo=!1,this.reset()};(function(){this.addSession=function(e){this.$session=e},this.add=function(e,t,n){if(this.$fromUndo)return;if(e==this.$lastDelta)return;if(t===!1||!this.lastDeltas)this.lastDeltas=[],this.$undoStack.push(this.lastDeltas),e.id=this.$rev=++this.$maxRev;if(e.action=="remove"||e.action=="insert")this.$lastDelta=e;this.lastDeltas.push(e)},this.addSelection=function(e,t){this.selections.push({value:e,rev:t||this.$rev})},this.startNewGroup=function(){return this.lastDeltas=null,this.$rev},this.markIgnored=function(e,t){t==null&&(t=this.$rev+1);var n=this.$undoStack;for(var r=n.length;r--;){var i=n[r][0];if(i.id<=e)break;i.id<t&&(i.ignore=!0)}this.lastDeltas=null},this.getSelection=function(e,t){var n=this.selections;for(var r=n.length;r--;){var i=n[r];if(i.rev<e)return t&&(i=n[r+1]),i}},this.getRevision=function(){return this.$rev},this.getDeltas=function(e,t){t==null&&(t=this.$rev+1);var n=this.$undoStack,r=null,i=0;for(var s=n.length;s--;){var o=n[s][0];o.id<t&&!r&&(r=s+1);if(o.id<=e){i=s+1;break}}return n.slice(i,r)},this.getChangedRanges=function(e,t){t==null&&(t=this.$rev+1)},this.getChangedLines=function(e,t){t==null&&(t=this.$rev+1)},this.undo=function(e,t){this.lastDeltas=null;var n=this.$undoStack;if(!i(n,n.length))return;e||(e=this.$session),this.$redoStackBaseRev!==this.$rev&&this.$redoStack.length&&(this.$redoStack=[]),this.$fromUndo=!0;var r=n.pop(),s=null;return r&&r.length&&(s=e.undoChanges(r,t),this.$redoStack.push(r),this.$syncRev()),this.$fromUndo=!1,s},this.redo=function(e,t){this.lastDeltas=null,e||(e=this.$session),this.$fromUndo=!0;if(this.$redoStackBaseRev!=this.$rev){var n=this.getDeltas(this.$redoStackBaseRev,this.$rev+1);w(this.$redoStack,n),this.$redoStackBaseRev=this.$rev,this.$redoStack.forEach(function(e){e[0].id=++this.$maxRev},this)}var r=this.$redoStack.pop(),i=null;return r&&(i=e.redoChanges(r,t),this.$undoStack.push(r),this.$syncRev()),this.$fromUndo=!1,i},this.$syncRev=function(){var e=this.$undoStack,t=e[e.length-1],n=t&&t[0].id||0;this.$redoStackBaseRev=n,this.$rev=n},this.reset=function(){this.lastDeltas=null,this.$lastDelta=null,this.$undoStack=[],this.$redoStack=[],this.$rev=0,this.mark=0,this.$redoStackBaseRev=this.$rev,this.selections=[]},this.canUndo=function(){return this.$undoStack.length>0},this.canRedo=function(){return this.$redoStack.length>0},this.bookmark=function(e){e==undefined&&(e=this.$rev),this.mark=e},this.isAtBookmark=function(){return this.$rev===this.mark},this.toJSON=function(){},this.fromJSON=function(){},this.hasUndo=this.canUndo,this.hasRedo=this.canRedo,this.isClean=this.isAtBookmark,this.markClean=this.bookmark,this.$prettyPrint=function(e){return e?c(e):c(this.$undoStack)+"\n---\n"+c(this.$redoStack)}}).call(r.prototype);var s=e("./range").Range,o=s.comparePoints,u=s.comparePoints;t.UndoManager=r}),ace.define("ace/layer/lines",["require","exports","module","ace/lib/dom"],function(e,t,n){"use strict";var r=e("../lib/dom"),i=function(e,t){this.element=e,this.canvasHeight=t||5e5,this.element.style.height=this.canvasHeight*2+"px",this.cells=[],this.cellCache=[],this.$offsetCoefficient=0};(function(){this.moveContainer=function(e){r.translate(this.element,0,-(e.firstRowScreen*e.lineHeight%this.canvasHeight)-e.offset*this.$offsetCoefficient)},this.pageChanged=function(e,t){return Math.floor(e.firstRowScreen*e.lineHeight/this.canvasHeight)!==Math.floor(t.firstRowScreen*t.lineHeight/this.canvasHeight)},this.computeLineTop=function(e,t,n){var r=t.firstRowScreen*t.lineHeight,i=Math.floor(r/this.canvasHeight),s=n.documentToScreenRow(e,0)*t.lineHeight;return s-i*this.canvasHeight},this.computeLineHeight=function(e,t,n){return t.lineHeight*n.getRowLength(e)},this.getLength=function(){return this.cells.length},this.get=function(e){return this.cells[e]},this.shift=function(){this.$cacheCell(this.cells.shift())},this.pop=function(){this.$cacheCell(this.cells.pop())},this.push=function(e){if(Array.isArray(e)){this.cells.push.apply(this.cells,e);var t=r.createFragment(this.element);for(var n=0;n<e.length;n++)t.appendChild(e[n].element);this.element.appendChild(t)}else this.cells.push(e),this.element.appendChild(e.element)},this.unshift=function(e){if(Array.isArray(e)){this.cells.unshift.apply(this.cells,e);var t=r.createFragment(this.element);for(var n=0;n<e.length;n++)t.appendChild(e[n].element);this.element.firstChild?this.element.insertBefore(t,this.element.firstChild):this.element.appendChild(t)}else this.cells.unshift(e),this.element.insertAdjacentElement("afterbegin",e.element)},this.last=function(){return this.cells.length?this.cells[this.cells.length-1]:null},this.$cacheCell=function(e){if(!e)return;e.element.remove(),this.cellCache.push(e)},this.createCell=function(e,t,n,i){var s=this.cellCache.pop();if(!s){var o=r.createElement("div");i&&i(o),this.element.appendChild(o),s={element:o,text:"",row:e}}return s.row=e,s}}).call(i.prototype),t.Lines=i}),ace.define("ace/layer/gutter",["require","exports","module","ace/lib/dom","ace/lib/oop","ace/lib/lang","ace/lib/event_emitter","ace/layer/lines"],function(e,t,n){"use strict";function f(e){var t=document.createTextNode("");e.appendChild(t);var n=r.createElement("span");return e.appendChild(n),e}var r=e("../lib/dom"),i=e("../lib/oop"),s=e("../lib/lang"),o=e("../lib/event_emitter").EventEmitter,u=e("./lines").Lines,a=function(e){this.element=r.createElement("div"),this.element.className="ace_layer ace_gutter-layer",e.appendChild(this.element),this.setShowFoldWidgets(this.$showFoldWidgets),this.gutterWidth=0,this.$annotations=[],this.$updateAnnotations=this.$updateAnnotations.bind(this),this.$lines=new u(this.element),this.$lines.$offsetCoefficient=1};(function(){i.implement(this,o),this.setSession=function(e){this.session&&this.session.removeEventListener("change",this.$updateAnnotations),this.session=e,e&&e.on("change",this.$updateAnnotations)},this.addGutterDecoration=function(e,t){window.console&&console.warn&&console.warn("deprecated use session.addGutterDecoration"),this.session.addGutterDecoration(e,t)},this.removeGutterDecoration=function(e,t){window.console&&console.warn&&console.warn("deprecated use session.removeGutterDecoration"),this.session.removeGutterDecoration(e,t)},this.setAnnotations=function(e){this.$annotations=[];for(var t=0;t<e.length;t++){var n=e[t],r=n.row,i=this.$annotations[r];i||(i=this.$annotations[r]={text:[]});var o=n.text;o=o?s.escapeHTML(o):n.html||"",i.text.indexOf(o)===-1&&i.text.push(o);var u=n.type;u=="error"?i.className=" ace_error":u=="warning"&&i.className!=" ace_error"?i.className=" ace_warning":u=="info"&&!i.className&&(i.className=" ace_info")}},this.$updateAnnotations=function(e){if(!this.$annotations.length)return;var t=e.start.row,n=e.end.row-t;if(n!==0)if(e.action=="remove")this.$annotations.splice(t,n+1,null);else{var r=new Array(n+1);r.unshift(t,1),this.$annotations.splice.apply(this.$annotations,r)}},this.update=function(e){this.config=e;var t=this.session,n=e.firstRow,r=Math.min(e.lastRow+e.gutterOffset,t.getLength()-1);this.oldLastRow=r,this.config=e,this.$lines.moveContainer(e),this.$updateCursorRow();var i=t.getNextFoldLine(n),s=i?i.start.row:Infinity,o=null,u=-1,a=n;for(;;){a>s&&(a=i.end.row+1,i=t.getNextFoldLine(a,i),s=i?i.start.row:Infinity);if(a>r){while(this.$lines.getLength()>u+1)this.$lines.pop();break}o=this.$lines.get(++u),o?o.row=a:(o=this.$lines.createCell(a,e,this.session,f),this.$lines.push(o)),this.$renderCell(o,e,i,a),a++}this._signal("afterRender"),this.$updateGutterWidth(e)},this.$updateGutterWidth=function(e){var t=this.session,n=t.gutterRenderer||this.$renderer,r=t.$firstLineNumber,i=this.$lines.last()?this.$lines.last().text:"";if(this.$fixedWidth||t.$useWrapMode)i=t.getLength()+r-1;var s=n?n.getWidth(t,i,e):i.toString().length*e.characterWidth,o=this.$padding||this.$computePadding();s+=o.left+o.right,s!==this.gutterWidth&&!isNaN(s)&&(this.gutterWidth=s,this.element.parentNode.style.width=this.element.style.width=Math.ceil(this.gutterWidth)+"px",this._signal("changeGutterWidth",s))},this.$updateCursorRow=function(){if(!this.$highlightGutterLine)return;var e=this.session.selection.getCursor();if(this.$cursorRow===e.row)return;this.$cursorRow=e.row},this.updateLineHighlight=function(){if(!this.$highlightGutterLine)return;var e=this.session.selection.cursor.row;this.$cursorRow=e;if(this.$cursorCell&&this.$cursorCell.row==e)return;this.$cursorCell&&(this.$cursorCell.element.className=this.$cursorCell.element.className.replace("ace_gutter-active-line ",""));var t=this.$lines.cells;this.$cursorCell=null;for(var n=0;n<t.length;n++){var r=t[n];if(r.row>=this.$cursorRow){if(r.row>this.$cursorRow){var i=this.session.getFoldLine(this.$cursorRow);if(!(n>0&&i&&i.start.row==t[n-1].row))break;r=t[n-1]}r.element.className="ace_gutter-active-line "+r.element.className,this.$cursorCell=r;break}}},this.scrollLines=function(e){var t=this.config;this.config=e,this.$updateCursorRow();if(this.$lines.pageChanged(t,e))return this.update(e);this.$lines.moveContainer(e);var n=Math.min(e.lastRow+e.gutterOffset,this.session.getLength()-1),r=this.oldLastRow;this.oldLastRow=n;if(!t||r<e.firstRow)return this.update(e);if(n<t.firstRow)return this.update(e);if(t.firstRow<e.firstRow)for(var i=this.session.getFoldedRowCount(t.firstRow,e.firstRow-1);i>0;i--)this.$lines.shift();if(r>n)for(var i=this.session.getFoldedRowCount(n+1,r);i>0;i--)this.$lines.pop();e.firstRow<t.firstRow&&this.$lines.unshift(this.$renderLines(e,e.firstRow,t.firstRow-1)),n>r&&this.$lines.push(this.$renderLines(e,r+1,n)),this.updateLineHighlight(),this._signal("afterRender"),this.$updateGutterWidth(e)},this.$renderLines=function(e,t,n){var r=[],i=t,s=this.session.getNextFoldLine(i),o=s?s.start.row:Infinity;for(;;){i>o&&(i=s.end.row+1,s=this.session.getNextFoldLine(i,s),o=s?s.start.row:Infinity);if(i>n)break;var u=this.$lines.createCell(i,e,this.session,f);this.$renderCell(u,e,s,i),r.push(u),i++}return r},this.$renderCell=function(e,t,n,i){var s=e.element,o=this.session,u=s.childNodes[0],a=s.childNodes[1],f=o.$firstLineNumber,l=o.$breakpoints,c=o.$decorations,h=o.gutterRenderer||this.$renderer,p=this.$showFoldWidgets&&o.foldWidgets,d=n?n.start.row:Number.MAX_VALUE,v="ace_gutter-cell ";this.$highlightGutterLine&&(i==this.$cursorRow||n&&i<this.$cursorRow&&i>=d&&this.$cursorRow<=n.end.row)&&(v+="ace_gutter-active-line ",this.$cursorCell!=e&&(this.$cursorCell&&(this.$cursorCell.element.className=this.$cursorCell.element.className.replace("ace_gutter-active-line ","")),this.$cursorCell=e)),l[i]&&(v+=l[i]),c[i]&&(v+=c[i]),this.$annotations[i]&&(v+=this.$annotations[i].className),s.className!=v&&(s.className=v);if(p){var m=p[i];m==null&&(m=p[i]=o.getFoldWidget(i))}if(m){var v="ace_fold-widget ace_"+m;m=="start"&&i==d&&i<n.end.row?v+=" ace_closed":v+=" ace_open",a.className!=v&&(a.className=v);var g=t.lineHeight+"px";r.setStyle(a.style,"height",g),r.setStyle(a.style,"display","inline-block")}else a&&r.setStyle(a.style,"display","none");var y=(h?h.getText(o,i):i+f).toString();return y!==u.data&&(u.data=y),r.setStyle(e.element.style,"height",this.$lines.computeLineHeight(i,t,o)+"px"),r.setStyle(e.element.style,"top",this.$lines.computeLineTop(i,t,o)+"px"),e.text=y,e},this.$fixedWidth=!1,this.$highlightGutterLine=!0,this.$renderer="",this.setHighlightGutterLine=function(e){this.$highlightGutterLine=e},this.$showLineNumbers=!0,this.$renderer="",this.setShowLineNumbers=function(e){this.$renderer=!e&&{getWidth:function(){return 0},getText:function(){return""}}},this.getShowLineNumbers=function(){return this.$showLineNumbers},this.$showFoldWidgets=!0,this.setShowFoldWidgets=function(e){e?r.addCssClass(this.element,"ace_folding-enabled"):r.removeCssClass(this.element,"ace_folding-enabled"),this.$showFoldWidgets=e,this.$padding=null},this.getShowFoldWidgets=function(){return this.$showFoldWidgets},this.$computePadding=function(){if(!this.element.firstChild)return{left:0,right:0};var e=r.computedStyle(this.element.firstChild);return this.$padding={},this.$padding.left=(parseInt(e.borderLeftWidth)||0)+(parseInt(e.paddingLeft)||0)+1,this.$padding.right=(parseInt(e.borderRightWidth)||0)+(parseInt(e.paddingRight)||0),this.$padding},this.getRegion=function(e){var t=this.$padding||this.$computePadding(),n=this.element.getBoundingClientRect();if(e.x<t.left+n.left)return"markers";if(this.$showFoldWidgets&&e.x>n.right-t.right)return"foldWidgets"}}).call(a.prototype),t.Gutter=a}),ace.define("ace/layer/marker",["require","exports","module","ace/range","ace/lib/dom"],function(e,t,n){"use strict";var r=e("../range").Range,i=e("../lib/dom"),s=function(e){this.element=i.createElement("div"),this.element.className="ace_layer ace_marker-layer",e.appendChild(this.element)};(function(){function e(e,t,n,r){return(e?1:0)|(t?2:0)|(n?4:0)|(r?8:0)}this.$padding=0,this.setPadding=function(e){this.$padding=e},this.setSession=function(e){this.session=e},this.setMarkers=function(e){this.markers=e},this.elt=function(e,t){var n=this.i!=-1&&this.element.childNodes[this.i];n?this.i++:(n=document.createElement("div"),this.element.appendChild(n),this.i=-1),n.style.cssText=t,n.className=e},this.update=function(e){if(!e)return;this.config=e,this.i=0;var t;for(var n in this.markers){var r=this.markers[n];if(!r.range){r.update(t,this,this.session,e);continue}var i=r.range.clipRows(e.firstRow,e.lastRow);if(i.isEmpty())continue;i=i.toScreenRange(this.session);if(r.renderer){var s=this.$getTop(i.start.row,e),o=this.$padding+i.start.column*e.characterWidth;r.renderer(t,i,o,s,e)}else r.type=="fullLine"?this.drawFullLineMarker(t,i,r.clazz,e):r.type=="screenLine"?this.drawScreenLineMarker(t,i,r.clazz,e):i.isMultiLine()?r.type=="text"?this.drawTextMarker(t,i,r.clazz,e):this.drawMultiLineMarker(t,i,r.clazz,e):this.drawSingleLineMarker(t,i,r.clazz+" ace_start"+" ace_br15",e)}if(this.i!=-1)while(this.i<this.element.childElementCount)this.element.removeChild(this.element.lastChild)},this.$getTop=function(e,t){return(e-t.firstRowScreen)*t.lineHeight},this.drawTextMarker=function(t,n,i,s,o){var u=this.session,a=n.start.row,f=n.end.row,l=a,c=0,h=0,p=u.getScreenLastRowColumn(l),d=new r(l,n.start.column,l,h);for(;l<=f;l++)d.start.row=d.end.row=l,d.start.column=l==a?n.start.column:u.getRowWrapIndent(l),d.end.column=p,c=h,h=p,p=l+1<f?u.getScreenLastRowColumn(l+1):l==f?0:n.end.column,this.drawSingleLineMarker(t,d,i+(l==a?" ace_start":"")+" ace_br"+e(l==a||l==a+1&&n.start.column,c<h,h>p,l==f),s,l==f?0:1,o)},this.drawMultiLineMarker=function(e,t,n,r,i){var s=this.$padding,o=r.lineHeight,u=this.$getTop(t.start.row,r),a=s+t.start.column*r.characterWidth;i=i||"";if(this.session.$bidiHandler.isBidiRow(t.start.row)){var f=t.clone();f.end.row=f.start.row,f.end.column=this.session.getLine(f.start.row).length,this.drawBidiSingleLineMarker(e,f,n+" ace_br1 ace_start",r,null,i)}else this.elt(n+" ace_br1 ace_start","height:"+o+"px;"+"right:0;"+"top:"+u+"px;left:"+a+"px;"+(i||""));if(this.session.$bidiHandler.isBidiRow(t.end.row)){var f=t.clone();f.start.row=f.end.row,f.start.column=0,this.drawBidiSingleLineMarker(e,f,n+" ace_br12",r,null,i)}else{u=this.$getTop(t.end.row,r);var l=t.end.column*r.characterWidth;this.elt(n+" ace_br12","height:"+o+"px;"+"width:"+l+"px;"+"top:"+u+"px;"+"left:"+s+"px;"+(i||""))}o=(t.end.row-t.start.row-1)*r.lineHeight;if(o<=0)return;u=this.$getTop(t.start.row+1,r);var c=(t.start.column?1:0)|(t.end.column?0:8);this.elt(n+(c?" ace_br"+c:""),"height:"+o+"px;"+"right:0;"+"top:"+u+"px;"+"left:"+s+"px;"+(i||""))},this.drawSingleLineMarker=function(e,t,n,r,i,s){if(this.session.$bidiHandler.isBidiRow(t.start.row))return this.drawBidiSingleLineMarker(e,t,n,r,i,s);var o=r.lineHeight,u=(t.end.column+(i||0)-t.start.column)*r.characterWidth,a=this.$getTop(t.start.row,r),f=this.$padding+t.start.column*r.characterWidth;this.elt(n,"height:"+o+"px;"+"width:"+u+"px;"+"top:"+a+"px;"+"left:"+f+"px;"+(s||""))},this.drawBidiSingleLineMarker=function(e,t,n,r,i,s){var o=r.lineHeight,u=this.$getTop(t.start.row,r),a=this.$padding,f=this.session.$bidiHandler.getSelections(t.start.column,t.end.column);f.forEach(function(e){this.elt(n,"height:"+o+"px;"+"width:"+e.width+(i||0)+"px;"+"top:"+u+"px;"+"left:"+(a+e.left)+"px;"+(s||""))},this)},this.drawFullLineMarker=function(e,t,n,r,i){var s=this.$getTop(t.start.row,r),o=r.lineHeight;t.start.row!=t.end.row&&(o+=this.$getTop(t.end.row,r)-s),this.elt(n,"height:"+o+"px;"+"top:"+s+"px;"+"left:0;right:0;"+(i||""))},this.drawScreenLineMarker=function(e,t,n,r,i){var s=this.$getTop(t.start.row,r),o=r.lineHeight;this.elt(n,"height:"+o+"px;"+"top:"+s+"px;"+"left:0;right:0;"+(i||""))}}).call(s.prototype),t.Marker=s}),ace.define("ace/layer/text",["require","exports","module","ace/lib/oop","ace/lib/dom","ace/lib/lang","ace/layer/lines","ace/lib/event_emitter"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("../lib/dom"),s=e("../lib/lang"),o=e("./lines").Lines,u=e("../lib/event_emitter").EventEmitter,a=function(e){this.dom=i,this.element=this.dom.createElement("div"),this.element.className="ace_layer ace_text-layer",e.appendChild(this.element),this.$updateEolChar=this.$updateEolChar.bind(this),this.$lines=new o(this.element)};(function(){r.implement(this,u),this.EOF_CHAR="\u00b6",this.EOL_CHAR_LF="\u00ac",this.EOL_CHAR_CRLF="\u00a4",this.EOL_CHAR=this.EOL_CHAR_LF,this.TAB_CHAR="\u2014",this.SPACE_CHAR="\u00b7",this.$padding=0,this.MAX_LINE_LENGTH=1e4,this.$updateEolChar=function(){var e=this.session.doc,t=e.getNewLineCharacter()=="\n"&&e.getNewLineMode()!="windows",n=t?this.EOL_CHAR_LF:this.EOL_CHAR_CRLF;if(this.EOL_CHAR!=n)return this.EOL_CHAR=n,!0},this.setPadding=function(e){this.$padding=e,this.element.style.margin="0 "+e+"px"},this.getLineHeight=function(){return this.$fontMetrics.$characterSize.height||0},this.getCharacterWidth=function(){return this.$fontMetrics.$characterSize.width||0},this.$setFontMetrics=function(e){this.$fontMetrics=e,this.$fontMetrics.on("changeCharacterSize",function(e){this._signal("changeCharacterSize",e)}.bind(this)),this.$pollSizeChanges()},this.checkForSizeChanges=function(){this.$fontMetrics.checkForSizeChanges()},this.$pollSizeChanges=function(){return this.$pollSizeChangesTimer=this.$fontMetrics.$pollSizeChanges()},this.setSession=function(e){this.session=e,e&&this.$computeTabString()},this.showInvisibles=!1,this.setShowInvisibles=function(e){return this.showInvisibles==e?!1:(this.showInvisibles=e,this.$computeTabString(),!0)},this.displayIndentGuides=!0,this.setDisplayIndentGuides=function(e){return this.displayIndentGuides==e?!1:(this.displayIndentGuides=e,this.$computeTabString(),!0)},this.$tabStrings=[],this.onChangeTabSize=this.$computeTabString=function(){var e=this.session.getTabSize();this.tabSize=e;var t=this.$tabStrings=[0];for(var n=1;n<e+1;n++)if(this.showInvisibles){var r=this.dom.createElement("span");r.className="ace_invisible ace_invisible_tab",r.textContent=s.stringRepeat(this.TAB_CHAR,n),t.push(r)}else t.push(this.dom.createTextNode(s.stringRepeat(" ",n),this.element));if(this.displayIndentGuides){this.$indentGuideRe=/\s\S| \t|\t |\s$/;var i="ace_indent-guide",o="",u="";if(this.showInvisibles){i+=" ace_invisible",o=" ace_invisible_space",u=" ace_invisible_tab";var a=s.stringRepeat(this.SPACE_CHAR,this.tabSize),f=s.stringRepeat(this.TAB_CHAR,this.tabSize)}else var a=s.stringRepeat(" ",this.tabSize),f=a;var r=this.dom.createElement("span");r.className=i+o,r.textContent=a,this.$tabStrings[" "]=r;var r=this.dom.createElement("span");r.className=i+u,r.textContent=f,this.$tabStrings["	"]=r}},this.updateLines=function(e,t,n){if(this.config.lastRow!=e.lastRow||this.config.firstRow!=e.firstRow)return this.update(e);this.config=e;var r=Math.max(t,e.firstRow),i=Math.min(n,e.lastRow),s=this.element.childNodes,o=0;for(var u=e.firstRow;u<r;u++){var a=this.session.getFoldLine(u);if(a){if(a.containsRow(r)){r=a.start.row;break}u=a.end.row}o++}var f=!1,u=r,a=this.session.getNextFoldLine(u),l=a?a.start.row:Infinity;for(;;){u>l&&(u=a.end.row+1,a=this.session.getNextFoldLine(u,a),l=a?a.start.row:Infinity);if(u>i)break;var c=s[o++];if(c){this.dom.removeChildren(c),this.$renderLine(c,u,u==l?a:!1);var h=e.lineHeight*this.session.getRowLength(u)+"px";c.style.height!=h&&(f=!0,c.style.height=h)}u++}if(f)while(o<this.$lines.cells.length){var p=this.$lines.cells[o++];p.element.style.top=this.$lines.computeLineTop(p.row,e,this.session)+"px"}},this.scrollLines=function(e){var t=this.config;this.config=e;if(this.$lines.pageChanged(t,e))return this.update(e);this.$lines.moveContainer(e);var n=e.lastRow,r=t?t.lastRow:-1;if(!t||r<e.firstRow)return this.update(e);if(n<t.firstRow)return this.update(e);if(!t||t.lastRow<e.firstRow)return this.update(e);if(e.lastRow<t.firstRow)return this.update(e);if(t.firstRow<e.firstRow)for(var i=this.session.getFoldedRowCount(t.firstRow,e.firstRow-1);i>0;i--)this.$lines.shift();if(t.lastRow>e.lastRow)for(var i=this.session.getFoldedRowCount(e.lastRow+1,t.lastRow);i>0;i--)this.$lines.pop();e.firstRow<t.firstRow&&this.$lines.unshift(this.$renderLinesFragment(e,e.firstRow,t.firstRow-1)),e.lastRow>t.lastRow&&this.$lines.push(this.$renderLinesFragment(e,t.lastRow+1,e.lastRow))},this.$renderLinesFragment=function(e,t,n){var r=[],s=t,o=this.session.getNextFoldLine(s),u=o?o.start.row:Infinity;for(;;){s>u&&(s=o.end.row+1,o=this.session.getNextFoldLine(s,o),u=o?o.start.row:Infinity);if(s>n)break;var a=this.$lines.createCell(s,e,this.session),f=a.element;this.dom.removeChildren(f),i.setStyle(f.style,"height",this.$lines.computeLineHeight(s,e,this.session)+"px"),i.setStyle(f.style,"top",this.$lines.computeLineTop(s,e,this.session)+"px"),this.$renderLine(f,s,s==u?o:!1),this.$useLineGroups()?f.className="ace_line_group":f.className="ace_line",r.push(a),s++}return r},this.update=function(e){this.$lines.moveContainer(e),this.config=e;var t=e.firstRow,n=e.lastRow,r=this.$lines;while(r.getLength())r.pop();r.push(this.$renderLinesFragment(e,t,n))},this.$textToken={text:!0,rparen:!0,lparen:!0},this.$renderToken=function(e,t,n,r){var o=this,u=/(\t)|( +)|([\x00-\x1f\x80-\xa0\xad\u1680\u180E\u2000-\u200f\u2028\u2029\u202F\u205F\uFEFF\uFFF9-\uFFFC]+)|(\u3000)|([\u1100-\u115F\u11A3-\u11A7\u11FA-\u11FF\u2329-\u232A\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFB\u3001-\u303E\u3041-\u3096\u3099-\u30FF\u3105-\u312D\u3131-\u318E\u3190-\u31BA\u31C0-\u31E3\u31F0-\u321E\u3220-\u3247\u3250-\u32FE\u3300-\u4DBF\u4E00-\uA48C\uA490-\uA4C6\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFAFF\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE66\uFE68-\uFE6B\uFF01-\uFF60\uFFE0-\uFFE6]|[\uD800-\uDBFF][\uDC00-\uDFFF])/g,a=this.dom.createFragment(this.element),f,l=0;while(f=u.exec(r)){var c=f[1],h=f[2],p=f[3],d=f[4],v=f[5];if(!o.showInvisibles&&h)continue;var m=l!=f.index?r.slice(l,f.index):"";l=f.index+f[0].length,m&&a.appendChild(this.dom.createTextNode(m,this.element));if(c){var g=o.session.getScreenTabSize(t+f.index);a.appendChild(o.$tabStrings[g].cloneNode(!0)),t+=g-1}else if(h)if(o.showInvisibles){var y=this.dom.createElement("span");y.className="ace_invisible ace_invisible_space",y.textContent=s.stringRepeat(o.SPACE_CHAR,h.length),a.appendChild(y)}else a.appendChild(this.com.createTextNode(h,this.element));else if(p){var y=this.dom.createElement("span");y.className="ace_invisible ace_invisible_space ace_invalid",y.textContent=s.stringRepeat(o.SPACE_CHAR,p.length),a.appendChild(y)}else if(d){var b=o.showInvisibles?o.SPACE_CHAR:"";t+=1;var y=this.dom.createElement("span");y.style.width=o.config.characterWidth*2+"px",y.className=o.showInvisibles?"ace_cjk ace_invisible ace_invisible_space":"ace_cjk",y.textContent=o.showInvisibles?o.SPACE_CHAR:"",a.appendChild(y)}else if(v){t+=1;var y=i.createElement("span");y.style.width=o.config.characterWidth*2+"px",y.className="ace_cjk",y.textContent=v,a.appendChild(y)}}a.appendChild(this.dom.createTextNode(l?r.slice(l):r,this.element));if(!this.$textToken[n.type]){var w="ace_"+n.type.replace(/\./g," ace_"),y=this.dom.createElement("span");n.type=="fold"&&(y.style.width=n.value.length*this.config.characterWidth+"px"),y.className=w,y.appendChild(a),e.appendChild(y)}else e.appendChild(a);return t+r.length},this.renderIndentGuide=function(e,t,n){var r=t.search(this.$indentGuideRe);if(r<=0||r>=n)return t;if(t[0]==" "){r-=r%this.tabSize;var i=r/this.tabSize;for(var s=0;s<i;s++)e.appendChild(this.$tabStrings[" "].cloneNode(!0));return t.substr(r)}if(t[0]=="	"){for(var s=0;s<r;s++)e.appendChild(this.$tabStrings["	"].cloneNode(!0));return t.substr(r)}return t},this.$createLineElement=function(e){var t=this.dom.createElement("div");return t.className="ace_line",t.style.height=this.config.lineHeight+"px",t},this.$renderWrappedLine=function(e,t,n){var r=0,i=0,o=n[0],u=0,a=this.$createLineElement();e.appendChild(a);for(var f=0;f<t.length;f++){var l=t[f],c=l.value;if(f==0&&this.displayIndentGuides){r=c.length,c=this.renderIndentGuide(a,c,o);if(!c)continue;r-=c.length}if(r+c.length<o)u=this.$renderToken(a,u,l,c),r+=c.length;else{while(r+c.length>=o)u=this.$renderToken(a,u,l,c.substring(0,o-r)),c=c.substring(o-r),r=o,a=this.$createLineElement(),e.appendChild(a),a.appendChild(this.dom.createTextNode(s.stringRepeat("\u00a0",n.indent),this.element)),i++,u=0,o=n[i]||Number.MAX_VALUE;c.length!=0&&(r+=c.length,u=this.$renderToken(a,u,l,c))}}},this.$renderSimpleLine=function(e,t){var n=0,r=t[0],i=r.value;this.displayIndentGuides&&(i=this.renderIndentGuide(e,i)),i&&(n=this.$renderToken(e,n,r,i));for(var s=1;s<t.length;s++){r=t[s],i=r.value;if(n+i.length>this.MAX_LINE_LENGTH)return this.$renderOverflowMessage(e,n,r,i);n=this.$renderToken(e,n,r,i)}},this.$renderOverflowMessage=function(e,t,n,r){this.$renderToken(e,t,n,r.slice(0,this.MAX_LINE_LENGTH-t));var i=this.dom.createElement("span");i.className="ace_inline_button ace_keyword ace_toggle_wrap",i.style.position="absolute",i.style.right="0",i.textContent="<click to see more...>",e.appendChild(i)},this.$renderLine=function(e,t,n){!n&&n!=0&&(n=this.session.getFoldLine(t));if(n)var r=this.$getFoldLineTokens(t,n);else var r=this.session.getTokens(t);var i=e;if(r.length){var s=this.session.getRowSplitData(t);if(s&&s.length){this.$renderWrappedLine(e,r,s);var i=e.lastChild}else{var i=e;this.$useLineGroups()&&(i=this.$createLineElement(),e.appendChild(i)),this.$renderSimpleLine(i,r)}}else this.$useLineGroups()&&(i=this.$createLineElement(),e.appendChild(i));if(this.showInvisibles&&i){n&&(t=n.end.row);var o=this.dom.createElement("span");o.className="ace_invisible ace_invisible_eol",o.textContent=t==this.session.getLength()-1?this.EOF_CHAR:this.EOL_CHAR,i.appendChild(o)}},this.$getFoldLineTokens=function(e,t){function i(e,t,n){var i=0,s=0;while(s+e[i].value.length<t){s+=e[i].value.length,i++;if(i==e.length)return}if(s!=t){var o=e[i].value.substring(t-s);o.length>n-t&&(o=o.substring(0,n-t)),r.push({type:e[i].type,value:o}),s=t+o.length,i+=1}while(s<n&&i<e.length){var o=e[i].value;o.length+s>n?r.push({type:e[i].type,value:o.substring(0,n-s)}):r.push(e[i]),s+=o.length,i+=1}}var n=this.session,r=[],s=n.getTokens(e);return t.walk(function(e,t,o,u,a){e!=null?r.push({type:"fold",value:e}):(a&&(s=n.getTokens(t)),s.length&&i(s,u,o))},t.end.row,this.session.getLine(t.end.row).length),r},this.$useLineGroups=function(){return this.session.getUseWrapMode()},this.destroy=function(){}}).call(a.prototype),t.Text=a}),ace.define("ace/layer/cursor",["require","exports","module","ace/lib/dom"],function(e,t,n){"use strict";var r=e("../lib/dom"),i=function(e){this.element=r.createElement("div"),this.element.className="ace_layer ace_cursor-layer",e.appendChild(this.element),this.isVisible=!1,this.isBlinking=!0,this.blinkInterval=1e3,this.smoothBlinking=!1,this.cursors=[],this.cursor=this.addCursor(),r.addCssClass(this.element,"ace_hidden-cursors"),this.$updateCursors=this.$updateOpacity.bind(this)};(function(){this.$updateOpacity=function(e){var t=this.cursors;for(var n=t.length;n--;)r.setStyle(t[n].style,"opacity",e?"":"0")},this.$startCssAnimation=function(){var e=this.cursors;for(var t=e.length;t--;)e[t].style.animationDuration=this.blinkInterval+"ms";setTimeout(function(){r.addCssClass(this.element,"ace_animate-blinking")}.bind(this))},this.$stopCssAnimation=function(){r.removeCssClass(this.element,"ace_animate-blinking")},this.$padding=0,this.setPadding=function(e){this.$padding=e},this.setSession=function(e){this.session=e},this.setBlinking=function(e){e!=this.isBlinking&&(this.isBlinking=e,this.restartTimer())},this.setBlinkInterval=function(e){e!=this.blinkInterval&&(this.blinkInterval=e,this.restartTimer())},this.setSmoothBlinking=function(e){e!=this.smoothBlinking&&(this.smoothBlinking=e,r.setCssClass(this.element,"ace_smooth-blinking",e),this.$updateCursors(!0),this.restartTimer())},this.addCursor=function(){var e=r.createElement("div");return e.className="ace_cursor",this.element.appendChild(e),this.cursors.push(e),e},this.removeCursor=function(){if(this.cursors.length>1){var e=this.cursors.pop();return e.parentNode.removeChild(e),e}},this.hideCursor=function(){this.isVisible=!1,r.addCssClass(this.element,"ace_hidden-cursors"),this.restartTimer()},this.showCursor=function(){this.isVisible=!0,r.removeCssClass(this.element,"ace_hidden-cursors"),this.restartTimer()},this.restartTimer=function(){var e=this.$updateCursors;clearInterval(this.intervalId),clearTimeout(this.timeoutId),this.$stopCssAnimation(),this.smoothBlinking&&r.removeCssClass(this.element,"ace_smooth-blinking"),e(!0);if(!this.isBlinking||!this.blinkInterval||!this.isVisible){this.$stopCssAnimation();return}this.smoothBlinking&&setTimeout(function(){r.addCssClass(this.element,"ace_smooth-blinking")}.bind(this));if(r.HAS_CSS_ANIMATION)this.$startCssAnimation();else{var t=function(){this.timeoutId=setTimeout(function(){e(!1)},.6*this.blinkInterval)}.bind(this);this.intervalId=setInterval(function(){e(!0),t()},this.blinkInterval),t()}},this.getPixelPosition=function(e,t){if(!this.config||!this.session)return{left:0,top:0};e||(e=this.session.selection.getCursor());var n=this.session.documentToScreenPosition(e),r=this.$padding+(this.session.$bidiHandler.isBidiRow(n.row,e.row)?this.session.$bidiHandler.getPosLeft(n.column):n.column*this.config.characterWidth),i=(n.row-(t?this.config.firstRowScreen:0))*this.config.lineHeight;return{left:r,top:i}},this.isCursorInView=function(e,t){return e.top>=0&&e.top<t.maxHeight},this.update=function(e){this.config=e;var t=this.session.$selectionMarkers,n=0,i=0;if(t===undefined||t.length===0)t=[{cursor:null}];for(var n=0,s=t.length;n<s;n++){var o=this.getPixelPosition(t[n].cursor,!0);if((o.top>e.height+e.offset||o.top<0)&&n>1)continue;var u=this.cursors[i++]||this.addCursor(),a=u.style;this.drawCursor?this.drawCursor(u,o,e,t[n],this.session):this.isCursorInView(o,e)?(r.setStyle(a,"display","block"),r.translate(u,o.left,o.top),r.setStyle(a,"width",Math.round(e.characterWidth)+"px"),r.setStyle(a,"height",e.lineHeight+"px")):r.setStyle(a,"display","none")}while(this.cursors.length>i)this.removeCursor();var f=this.session.getOverwrite();this.$setOverwrite(f),this.$pixelPos=o,this.restartTimer()},this.drawCursor=null,this.$setOverwrite=function(e){e!=this.overwrite&&(this.overwrite=e,e?r.addCssClass(this.element,"ace_overwrite-cursors"):r.removeCssClass(this.element,"ace_overwrite-cursors"))},this.destroy=function(){clearInterval(this.intervalId),clearTimeout(this.timeoutId)}}).call(i.prototype),t.Cursor=i}),ace.define("ace/scrollbar",["require","exports","module","ace/lib/oop","ace/lib/dom","ace/lib/event","ace/lib/event_emitter"],function(e,t,n){"use strict";var r=e("./lib/oop"),i=e("./lib/dom"),s=e("./lib/event"),o=e("./lib/event_emitter").EventEmitter,u=32768,a=function(e){this.element=i.createElement("div"),this.element.className="ace_scrollbar ace_scrollbar"+this.classSuffix,this.inner=i.createElement("div"),this.inner.className="ace_scrollbar-inner",this.element.appendChild(this.inner),e.appendChild(this.element),this.setVisible(!1),this.skipEvent=!1,s.addListener(this.element,"scroll",this.onScroll.bind(this)),s.addListener(this.element,"mousedown",s.preventDefault)};(function(){r.implement(this,o),this.setVisible=function(e){this.element.style.display=e?"":"none",this.isVisible=e,this.coeff=1}}).call(a.prototype);var f=function(e,t){a.call(this,e),this.scrollTop=0,this.scrollHeight=0,t.$scrollbarWidth=this.width=i.scrollbarWidth(e.ownerDocument),this.inner.style.width=this.element.style.width=(this.width||15)+5+"px",this.$minWidth=0};r.inherits(f,a),function(){this.classSuffix="-v",this.onScroll=function(){if(!this.skipEvent){this.scrollTop=this.element.scrollTop;if(this.coeff!=1){var e=this.element.clientHeight/this.scrollHeight;this.scrollTop=this.scrollTop*(1-e)/(this.coeff-e)}this._emit("scroll",{data:this.scrollTop})}this.skipEvent=!1},this.getWidth=function(){return Math.max(this.isVisible?this.width:0,this.$minWidth||0)},this.setHeight=function(e){this.element.style.height=e+"px"},this.setInnerHeight=this.setScrollHeight=function(e){this.scrollHeight=e,e>u?(this.coeff=u/e,e=u):this.coeff!=1&&(this.coeff=1),this.inner.style.height=e+"px"},this.setScrollTop=function(e){this.scrollTop!=e&&(this.skipEvent=!0,this.scrollTop=e,this.element.scrollTop=e*this.coeff)}}.call(f.prototype);var l=function(e,t){a.call(this,e),this.scrollLeft=0,this.height=t.$scrollbarWidth,this.inner.style.height=this.element.style.height=(this.height||15)+5+"px"};r.inherits(l,a),function(){this.classSuffix="-h",this.onScroll=function(){this.skipEvent||(this.scrollLeft=this.element.scrollLeft,this._emit("scroll",{data:this.scrollLeft})),this.skipEvent=!1},this.getHeight=function(){return this.isVisible?this.height:0},this.setWidth=function(e){this.element.style.width=e+"px"},this.setInnerWidth=function(e){this.inner.style.width=e+"px"},this.setScrollWidth=function(e){this.inner.style.width=e+"px"},this.setScrollLeft=function(e){this.scrollLeft!=e&&(this.skipEvent=!0,this.scrollLeft=this.element.scrollLeft=e)}}.call(l.prototype),t.ScrollBar=f,t.ScrollBarV=f,t.ScrollBarH=l,t.VScrollBar=f,t.HScrollBar=l}),ace.define("ace/renderloop",["require","exports","module","ace/lib/event"],function(e,t,n){"use strict";var r=e("./lib/event"),i=function(e,t){this.onRender=e,this.pending=!1,this.changes=0,this.$recursionLimit=2,this.window=t||window;var n=this;this._flush=function(e){n.pending=!1;var t=n.changes;t&&(r.blockIdle(100),n.changes=0,n.onRender(t));if(n.changes){if(n.$recursionLimit--<0)return;n.schedule()}else n.$recursionLimit=2}};(function(){this.schedule=function(e){this.changes=this.changes|e,this.changes&&!this.pending&&(r.nextFrame(this._flush),this.pending=!0)},this.clear=function(e){var t=this.changes;return this.changes=0,t}}).call(i.prototype),t.RenderLoop=i}),ace.define("ace/layer/font_metrics",["require","exports","module","ace/lib/oop","ace/lib/dom","ace/lib/lang","ace/lib/event","ace/lib/useragent","ace/lib/event_emitter"],function(e,t,n){var r=e("../lib/oop"),i=e("../lib/dom"),s=e("../lib/lang"),o=e("../lib/event"),u=e("../lib/useragent"),a=e("../lib/event_emitter").EventEmitter,f=256,l=typeof ResizeObserver=="function",c=200,h=t.FontMetrics=function(e){this.el=i.createElement("div"),this.$setMeasureNodeStyles(this.el.style,!0),this.$main=i.createElement("div"),this.$setMeasureNodeStyles(this.$main.style),this.$measureNode=i.createElement("div"),this.$setMeasureNodeStyles(this.$measureNode.style),this.el.appendChild(this.$main),this.el.appendChild(this.$measureNode),e.appendChild(this.el),this.$measureNode.innerHTML=s.stringRepeat("X",f),this.$characterSize={width:0,height:0},l?this.$addObserver():this.checkForSizeChanges()};(function(){r.implement(this,a),this.$characterSize={width:0,height:0},this.$setMeasureNodeStyles=function(e,t){e.width=e.height="auto",e.left=e.top="0px",e.visibility="hidden",e.position="absolute",e.whiteSpace="pre",u.isIE<8?e["font-family"]="inherit":e.font="inherit",e.overflow=t?"hidden":"visible"},this.checkForSizeChanges=function(e){e===undefined&&(e=this.$measureSizes());if(e&&(this.$characterSize.width!==e.width||this.$characterSize.height!==e.height)){this.$measureNode.style.fontWeight="bold";var t=this.$measureSizes();this.$measureNode.style.fontWeight="",this.$characterSize=e,this.charSizes=Object.create(null),this.allowBoldFonts=t&&t.width===e.width&&t.height===e.height,this._emit("changeCharacterSize",{data:e})}},this.$addObserver=function(){var e=this;this.$observer=new window.ResizeObserver(function(t){var n=t[0].contentRect;e.checkForSizeChanges({height:n.height,width:n.width/f})}),this.$observer.observe(this.$measureNode)},this.$pollSizeChanges=function(){if(this.$pollSizeChangesTimer||this.$observer)return this.$pollSizeChangesTimer;var e=this;return this.$pollSizeChangesTimer=o.onIdle(function t(){e.checkForSizeChanges(),o.onIdle(t,500)},500)},this.setPolling=function(e){e?this.$pollSizeChanges():this.$pollSizeChangesTimer&&(clearInterval(this.$pollSizeChangesTimer),this.$pollSizeChangesTimer=0)},this.$measureSizes=function(e){var t={height:(e||this.$measureNode).clientHeight,width:(e||this.$measureNode).clientWidth/f};return t.width===0||t.height===0?null:t},this.$measureCharWidth=function(e){this.$main.innerHTML=s.stringRepeat(e,f);var t=this.$main.getBoundingClientRect();return t.width/f},this.getCharacterWidth=function(e){var t=this.charSizes[e];return t===undefined&&(t=this.charSizes[e]=this.$measureCharWidth(e)/this.$characterSize.width),t},this.destroy=function(){clearInterval(this.$pollSizeChangesTimer),this.$observer&&this.$observer.disconnect(),this.el&&this.el.parentNode&&this.el.parentNode.removeChild(this.el)},this.$getZoom=function e(t){return t?(window.getComputedStyle(t).zoom||1)*e(t.parentElement):1},this.$initTransformMeasureNodes=function(){var e=function(e,t){return["div",{style:"position: absolute;top:"+e+"px;left:"+t+"px;"}]};this.els=i.buildDom([e(0,0),e(c,0),e(0,c),e(c,c)],this.el)},this.transformCoordinates=function(e,t){function r(e,t,n){var r=e[1]*t[0]-e[0]*t[1];return[(-t[1]*n[0]+t[0]*n[1])/r,(+e[1]*n[0]-e[0]*n[1])/r]}function i(e,t){return[e[0]-t[0],e[1]-t[1]]}function s(e,t){return[e[0]+t[0],e[1]+t[1]]}function o(e,t){return[e*t[0],e*t[1]]}function u(e){var t=e.getBoundingClientRect();return[t.left,t.top]}if(e){var n=this.$getZoom(this.el);e=o(1/n,e)}this.els||this.$initTransformMeasureNodes();var a=u(this.els[0]),f=u(this.els[1]),l=u(this.els[2]),h=u(this.els[3]),p=r(i(h,f),i(h,l),i(s(f,l),s(h,a))),d=o(1+p[0],i(f,a)),v=o(1+p[1],i(l,a));if(t){var m=t,g=p[0]*m[0]/c+p[1]*m[1]/c+1,y=s(o(m[0],d),o(m[1],v));return s(o(1/g/c,y),a)}var b=i(e,a),w=r(i(d,o(p[0],b)),i(v,o(p[1],b)),b);return o(c,w)}}).call(h.prototype)}),ace.define("ace/virtual_renderer",["require","exports","module","ace/lib/oop","ace/lib/dom","ace/config","ace/layer/gutter","ace/layer/marker","ace/layer/text","ace/layer/cursor","ace/scrollbar","ace/scrollbar","ace/renderloop","ace/layer/font_metrics","ace/lib/event_emitter","ace/lib/useragent"],function(e,t,n){"use strict";var r=e("./lib/oop"),i=e("./lib/dom"),s=e("./config"),o=e("./layer/gutter").Gutter,u=e("./layer/marker").Marker,a=e("./layer/text").Text,f=e("./layer/cursor").Cursor,l=e("./scrollbar").HScrollBar,c=e("./scrollbar").VScrollBar,h=e("./renderloop").RenderLoop,p=e("./layer/font_metrics").FontMetrics,d=e("./lib/event_emitter").EventEmitter,v='.ace_br1 {border-top-left-radius    : 3px;}.ace_br2 {border-top-right-radius   : 3px;}.ace_br3 {border-top-left-radius    : 3px; border-top-right-radius:    3px;}.ace_br4 {border-bottom-right-radius: 3px;}.ace_br5 {border-top-left-radius    : 3px; border-bottom-right-radius: 3px;}.ace_br6 {border-top-right-radius   : 3px; border-bottom-right-radius: 3px;}.ace_br7 {border-top-left-radius    : 3px; border-top-right-radius:    3px; border-bottom-right-radius: 3px;}.ace_br8 {border-bottom-left-radius : 3px;}.ace_br9 {border-top-left-radius    : 3px; border-bottom-left-radius:  3px;}.ace_br10{border-top-right-radius   : 3px; border-bottom-left-radius:  3px;}.ace_br11{border-top-left-radius    : 3px; border-top-right-radius:    3px; border-bottom-left-radius:  3px;}.ace_br12{border-bottom-right-radius: 3px; border-bottom-left-radius:  3px;}.ace_br13{border-top-left-radius    : 3px; border-bottom-right-radius: 3px; border-bottom-left-radius:  3px;}.ace_br14{border-top-right-radius   : 3px; border-bottom-right-radius: 3px; border-bottom-left-radius:  3px;}.ace_br15{border-top-left-radius    : 3px; border-top-right-radius:    3px; border-bottom-right-radius: 3px; border-bottom-left-radius: 3px;}.ace_editor {position: relative;overflow: hidden;font: 12px/normal \'Monaco\', \'Menlo\', \'Ubuntu Mono\', \'Consolas\', \'source-code-pro\', monospace;direction: ltr;text-align: left;-webkit-tap-highlight-color: rgba(0, 0, 0, 0);}.ace_scroller {position: absolute;overflow: hidden;top: 0;bottom: 0;background-color: inherit;-ms-user-select: none;-moz-user-select: none;-webkit-user-select: none;user-select: none;cursor: text;}.ace_content {position: absolute;box-sizing: border-box;min-width: 100%;contain: style size layout;}.ace_dragging .ace_scroller:before{position: absolute;top: 0;left: 0;right: 0;bottom: 0;content: \'\';background: rgba(250, 250, 250, 0.01);z-index: 1000;}.ace_dragging.ace_dark .ace_scroller:before{background: rgba(0, 0, 0, 0.01);}.ace_selecting, .ace_selecting * {cursor: text !important;}.ace_gutter {position: absolute;overflow : hidden;width: auto;top: 0;bottom: 0;left: 0;cursor: default;z-index: 4;-ms-user-select: none;-moz-user-select: none;-webkit-user-select: none;user-select: none;contain: style size layout;}.ace_gutter-active-line {position: absolute;left: 0;right: 0;}.ace_scroller.ace_scroll-left {box-shadow: 17px 0 16px -16px rgba(0, 0, 0, 0.4) inset;}.ace_gutter-cell {position: absolute;top: 0;left: 0;right: 0;padding-left: 19px;padding-right: 6px;background-repeat: no-repeat;}.ace_gutter-cell.ace_error {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAABOFBMVEX/////////QRswFAb/Ui4wFAYwFAYwFAaWGAfDRymzOSH/PxswFAb/SiUwFAYwFAbUPRvjQiDllog5HhHdRybsTi3/Tyv9Tir+Syj/UC3////XurebMBIwFAb/RSHbPx/gUzfdwL3kzMivKBAwFAbbvbnhPx66NhowFAYwFAaZJg8wFAaxKBDZurf/RB6mMxb/SCMwFAYwFAbxQB3+RB4wFAb/Qhy4Oh+4QifbNRcwFAYwFAYwFAb/QRzdNhgwFAYwFAbav7v/Uy7oaE68MBK5LxLewr/r2NXewLswFAaxJw4wFAbkPRy2PyYwFAaxKhLm1tMwFAazPiQwFAaUGAb/QBrfOx3bvrv/VC/maE4wFAbRPBq6MRO8Qynew8Dp2tjfwb0wFAbx6eju5+by6uns4uH9/f36+vr/GkHjAAAAYnRSTlMAGt+64rnWu/bo8eAA4InH3+DwoN7j4eLi4xP99Nfg4+b+/u9B/eDs1MD1mO7+4PHg2MXa347g7vDizMLN4eG+Pv7i5evs/v79yu7S3/DV7/498Yv24eH+4ufQ3Ozu/v7+y13sRqwAAADLSURBVHjaZc/XDsFgGIBhtDrshlitmk2IrbHFqL2pvXf/+78DPokj7+Fz9qpU/9UXJIlhmPaTaQ6QPaz0mm+5gwkgovcV6GZzd5JtCQwgsxoHOvJO15kleRLAnMgHFIESUEPmawB9ngmelTtipwwfASilxOLyiV5UVUyVAfbG0cCPHig+GBkzAENHS0AstVF6bacZIOzgLmxsHbt2OecNgJC83JERmePUYq8ARGkJx6XtFsdddBQgZE2nPR6CICZhawjA4Fb/chv+399kfR+MMMDGOQAAAABJRU5ErkJggg==");background-repeat: no-repeat;background-position: 2px center;}.ace_gutter-cell.ace_warning {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAmVBMVEX///8AAAD///8AAAAAAABPSzb/5sAAAAB/blH/73z/ulkAAAAAAAD85pkAAAAAAAACAgP/vGz/rkDerGbGrV7/pkQICAf////e0IsAAAD/oED/qTvhrnUAAAD/yHD/njcAAADuv2r/nz//oTj/p064oGf/zHAAAAA9Nir/tFIAAAD/tlTiuWf/tkIAAACynXEAAAAAAAAtIRW7zBpBAAAAM3RSTlMAABR1m7RXO8Ln31Z36zT+neXe5OzooRDfn+TZ4p3h2hTf4t3k3ucyrN1K5+Xaks52Sfs9CXgrAAAAjklEQVR42o3PbQ+CIBQFYEwboPhSYgoYunIqqLn6/z8uYdH8Vmdnu9vz4WwXgN/xTPRD2+sgOcZjsge/whXZgUaYYvT8QnuJaUrjrHUQreGczuEafQCO/SJTufTbroWsPgsllVhq3wJEk2jUSzX3CUEDJC84707djRc5MTAQxoLgupWRwW6UB5fS++NV8AbOZgnsC7BpEAAAAABJRU5ErkJggg==");background-position: 2px center;}.ace_gutter-cell.ace_info {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAAAAAA6mKC9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAJ0Uk5TAAB2k804AAAAPklEQVQY02NgIB68QuO3tiLznjAwpKTgNyDbMegwisCHZUETUZV0ZqOquBpXj2rtnpSJT1AEnnRmL2OgGgAAIKkRQap2htgAAAAASUVORK5CYII=");background-position: 2px center;}.ace_dark .ace_gutter-cell.ace_info {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAJFBMVEUAAAChoaGAgIAqKiq+vr6tra1ZWVmUlJSbm5s8PDxubm56enrdgzg3AAAAAXRSTlMAQObYZgAAAClJREFUeNpjYMAPdsMYHegyJZFQBlsUlMFVCWUYKkAZMxZAGdxlDMQBAG+TBP4B6RyJAAAAAElFTkSuQmCC");}.ace_scrollbar {contain: strict;position: absolute;right: 0;bottom: 0;z-index: 6;}.ace_scrollbar-inner {position: absolute;cursor: text;left: 0;top: 0;}.ace_scrollbar-v{overflow-x: hidden;overflow-y: scroll;top: 0;}.ace_scrollbar-h {overflow-x: scroll;overflow-y: hidden;left: 0;}.ace_print-margin {position: absolute;height: 100%;}.ace_text-input {position: absolute;z-index: 0;width: 0.5em;height: 1em;opacity: 0;background: transparent;-moz-appearance: none;appearance: none;border: none;resize: none;outline: none;overflow: hidden;font: inherit;padding: 0 1px;margin: 0 -1px;contain: strict;-ms-user-select: text;-moz-user-select: text;-webkit-user-select: text;user-select: text;white-space: pre!important;}.ace_text-input.ace_composition {background: transparent;color: inherit;z-index: 1000;opacity: 1;}.ace_composition_placeholder { color: transparent }.ace_composition_marker { border-bottom: 1px solid;position: absolute;border-radius: 0;margin-top: 1px;}[ace_nocontext=true] {transform: none!important;filter: none!important;perspective: none!important;clip-path: none!important;mask : none!important;contain: none!important;perspective: none!important;mix-blend-mode: initial!important;z-index: auto;}.ace_layer {z-index: 1;position: absolute;overflow: hidden;word-wrap: normal;white-space: pre;height: 100%;width: 100%;box-sizing: border-box;pointer-events: none;}.ace_gutter-layer {position: relative;width: auto;text-align: right;pointer-events: auto;height: 1000000px;contain: style size layout;}.ace_text-layer {font: inherit !important;position: absolute;height: 1000000px;width: 1000000px;contain: style size layout;}.ace_text-layer > .ace_line, .ace_text-layer > .ace_line_group {contain: style size layout;position: absolute;top: 0;left: 0;right: 0;}.ace_hidpi .ace_text-layer,.ace_hidpi .ace_gutter-layer,.ace_hidpi .ace_content,.ace_hidpi .ace_gutter {contain: strict;will-change: transform;}.ace_hidpi .ace_text-layer > .ace_line, .ace_hidpi .ace_text-layer > .ace_line_group {contain: strict;}.ace_cjk {display: inline-block;text-align: center;}.ace_cursor-layer {z-index: 4;}.ace_cursor {z-index: 4;position: absolute;box-sizing: border-box;border-left: 2px solid;transform: translatez(0);}.ace_multiselect .ace_cursor {border-left-width: 1px;}.ace_slim-cursors .ace_cursor {border-left-width: 1px;}.ace_overwrite-cursors .ace_cursor {border-left-width: 0;border-bottom: 1px solid;}.ace_hidden-cursors .ace_cursor {opacity: 0.2;}.ace_smooth-blinking .ace_cursor {transition: opacity 0.18s;}.ace_animate-blinking .ace_cursor {animation-duration: 1000ms;animation-timing-function: step-end;animation-name: blink-ace-animate;animation-iteration-count: infinite;}.ace_animate-blinking.ace_smooth-blinking .ace_cursor {animation-duration: 1000ms;animation-timing-function: ease-in-out;animation-name: blink-ace-animate-smooth;}@keyframes blink-ace-animate {from, to { opacity: 1; }60% { opacity: 0; }}@keyframes blink-ace-animate-smooth {from, to { opacity: 1; }45% { opacity: 1; }60% { opacity: 0; }85% { opacity: 0; }}.ace_marker-layer .ace_step, .ace_marker-layer .ace_stack {position: absolute;z-index: 3;}.ace_marker-layer .ace_selection {position: absolute;z-index: 5;}.ace_marker-layer .ace_bracket {position: absolute;z-index: 6;}.ace_marker-layer .ace_active-line {position: absolute;z-index: 2;}.ace_marker-layer .ace_selected-word {position: absolute;z-index: 4;box-sizing: border-box;}.ace_line .ace_fold {box-sizing: border-box;display: inline-block;height: 11px;margin-top: -2px;vertical-align: middle;background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAJCAYAAADU6McMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJpJREFUeNpi/P//PwOlgAXGYGRklAVSokD8GmjwY1wasKljQpYACtpCFeADcHVQfQyMQAwzwAZI3wJKvCLkfKBaMSClBlR7BOQikCFGQEErIH0VqkabiGCAqwUadAzZJRxQr/0gwiXIal8zQQPnNVTgJ1TdawL0T5gBIP1MUJNhBv2HKoQHHjqNrA4WO4zY0glyNKLT2KIfIMAAQsdgGiXvgnYAAAAASUVORK5CYII="),url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAA3CAYAAADNNiA5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACJJREFUeNpi+P//fxgTAwPDBxDxD078RSX+YeEyDFMCIMAAI3INmXiwf2YAAAAASUVORK5CYII=");background-repeat: no-repeat, repeat-x;background-position: center center, top left;color: transparent;border: 1px solid black;border-radius: 2px;cursor: pointer;pointer-events: auto;}.ace_dark .ace_fold {}.ace_fold:hover{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAJCAYAAADU6McMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJpJREFUeNpi/P//PwOlgAXGYGRklAVSokD8GmjwY1wasKljQpYACtpCFeADcHVQfQyMQAwzwAZI3wJKvCLkfKBaMSClBlR7BOQikCFGQEErIH0VqkabiGCAqwUadAzZJRxQr/0gwiXIal8zQQPnNVTgJ1TdawL0T5gBIP1MUJNhBv2HKoQHHjqNrA4WO4zY0glyNKLT2KIfIMAAQsdgGiXvgnYAAAAASUVORK5CYII="),url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAA3CAYAAADNNiA5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAACBJREFUeNpi+P//fz4TAwPDZxDxD5X4i5fLMEwJgAADAEPVDbjNw87ZAAAAAElFTkSuQmCC");}.ace_tooltip {background-color: #FFF;background-image: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.1));border: 1px solid gray;border-radius: 1px;box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);color: black;max-width: 100%;padding: 3px 4px;position: fixed;z-index: 999999;box-sizing: border-box;cursor: default;white-space: pre;word-wrap: break-word;line-height: normal;font-style: normal;font-weight: normal;letter-spacing: normal;pointer-events: none;}.ace_folding-enabled > .ace_gutter-cell {padding-right: 13px;}.ace_fold-widget {box-sizing: border-box;margin: 0 -12px 0 1px;display: none;width: 11px;vertical-align: top;background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAANElEQVR42mWKsQ0AMAzC8ixLlrzQjzmBiEjp0A6WwBCSPgKAXoLkqSot7nN3yMwR7pZ32NzpKkVoDBUxKAAAAABJRU5ErkJggg==");background-repeat: no-repeat;background-position: center;border-radius: 3px;border: 1px solid transparent;cursor: pointer;}.ace_folding-enabled .ace_fold-widget {display: inline-block;   }.ace_fold-widget.ace_end {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAANElEQVR42m3HwQkAMAhD0YzsRchFKI7sAikeWkrxwScEB0nh5e7KTPWimZki4tYfVbX+MNl4pyZXejUO1QAAAABJRU5ErkJggg==");}.ace_fold-widget.ace_closed {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAGCAYAAAAG5SQMAAAAOUlEQVR42jXKwQkAMAgDwKwqKD4EwQ26sSOkVWjgIIHAzPiCgaqiqnJHZnKICBERHN194O5b9vbLuAVRL+l0YWnZAAAAAElFTkSuQmCCXA==");}.ace_fold-widget:hover {border: 1px solid rgba(0, 0, 0, 0.3);background-color: rgba(255, 255, 255, 0.2);box-shadow: 0 1px 1px rgba(255, 255, 255, 0.7);}.ace_fold-widget:active {border: 1px solid rgba(0, 0, 0, 0.4);background-color: rgba(0, 0, 0, 0.05);box-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);}.ace_dark .ace_fold-widget {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHklEQVQIW2P4//8/AzoGEQ7oGCaLLAhWiSwB146BAQCSTPYocqT0AAAAAElFTkSuQmCC");}.ace_dark .ace_fold-widget.ace_end {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAH0lEQVQIW2P4//8/AxQ7wNjIAjDMgC4AxjCVKBirIAAF0kz2rlhxpAAAAABJRU5ErkJggg==");}.ace_dark .ace_fold-widget.ace_closed {background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAFCAYAAACAcVaiAAAAHElEQVQIW2P4//+/AxAzgDADlOOAznHAKgPWAwARji8UIDTfQQAAAABJRU5ErkJggg==");}.ace_dark .ace_fold-widget:hover {box-shadow: 0 1px 1px rgba(255, 255, 255, 0.2);background-color: rgba(255, 255, 255, 0.1);}.ace_dark .ace_fold-widget:active {box-shadow: 0 1px 1px rgba(255, 255, 255, 0.2);}.ace_inline_button {border: 1px solid lightgray;display: inline-block;margin: -1px 8px;padding: 0 5px;pointer-events: auto;cursor: pointer;}.ace_inline_button:hover {border-color: gray;background: rgba(200,200,200,0.2);display: inline-block;pointer-events: auto;}.ace_fold-widget.ace_invalid {background-color: #FFB4B4;border-color: #DE5555;}.ace_fade-fold-widgets .ace_fold-widget {transition: opacity 0.4s ease 0.05s;opacity: 0;}.ace_fade-fold-widgets:hover .ace_fold-widget {transition: opacity 0.05s ease 0.05s;opacity:1;}.ace_underline {text-decoration: underline;}.ace_bold {font-weight: bold;}.ace_nobold .ace_bold {font-weight: normal;}.ace_italic {font-style: italic;}.ace_error-marker {background-color: rgba(255, 0, 0,0.2);position: absolute;z-index: 9;}.ace_highlight-marker {background-color: rgba(255, 255, 0,0.2);position: absolute;z-index: 8;}',m=e("./lib/useragent"),g=m.isIE;i.importCssString(v,"ace_editor.css");var y=function(e,t){var n=this;this.container=e||i.createElement("div"),i.addCssClass(this.container,"ace_editor"),i.HI_DPI&&i.addCssClass(this.container,"ace_hidpi"),this.setTheme(t),this.$gutter=i.createElement("div"),this.$gutter.className="ace_gutter",this.container.appendChild(this.$gutter),this.$gutter.setAttribute("aria-hidden",!0),this.scroller=i.createElement("div"),this.scroller.className="ace_scroller",this.container.appendChild(this.scroller),this.content=i.createElement("div"),this.content.className="ace_content",this.scroller.appendChild(this.content),this.$gutterLayer=new o(this.$gutter),this.$gutterLayer.on("changeGutterWidth",this.onGutterResize.bind(this)),this.$markerBack=new u(this.content);var r=this.$textLayer=new a(this.content);this.canvas=r.element,this.$markerFront=new u(this.content),this.$cursorLayer=new f(this.content),this.$horizScroll=!1,this.$vScroll=!1,this.scrollBar=this.scrollBarV=new c(this.container,this),this.scrollBarH=new l(this.container,this),this.scrollBarV.addEventListener("scroll",function(e){n.$scrollAnimation||n.session.setScrollTop(e.data-n.scrollMargin.top)}),this.scrollBarH.addEventListener("scroll",function(e){n.$scrollAnimation||n.session.setScrollLeft(e.data-n.scrollMargin.left)}),this.scrollTop=0,this.scrollLeft=0,this.cursorPos={row:0,column:0},this.$fontMetrics=new p(this.container),this.$textLayer.$setFontMetrics(this.$fontMetrics),this.$textLayer.addEventListener("changeCharacterSize",function(e){n.updateCharacterSize(),n.onResize(!0,n.gutterWidth,n.$size.width,n.$size.height),n._signal("changeCharacterSize",e)}),this.$size={width:0,height:0,scrollerHeight:0,scrollerWidth:0,$dirty:!0},this.layerConfig={width:1,padding:0,firstRow:0,firstRowScreen:0,lastRow:0,lineHeight:0,characterWidth:0,minHeight:1,maxHeight:1,offset:0,height:1,gutterOffset:1},this.scrollMargin={left:0,right:0,top:0,bottom:0,v:0,h:0},this.margin={left:0,right:0,top:0,bottom:0,v:0,h:0},this.$keepTextAreaAtCursor=!m.isIOS,this.$loop=new h(this.$renderChanges.bind(this),this.container.ownerDocument.defaultView),this.$loop.schedule(this.CHANGE_FULL),this.updateCharacterSize(),this.setPadding(4),s.resetOptions(this),s._emit("renderer",this)};(function(){this.CHANGE_CURSOR=1,this.CHANGE_MARKER=2,this.CHANGE_GUTTER=4,this.CHANGE_SCROLL=8,this.CHANGE_LINES=16,this.CHANGE_TEXT=32,this.CHANGE_SIZE=64,this.CHANGE_MARKER_BACK=128,this.CHANGE_MARKER_FRONT=256,this.CHANGE_FULL=512,this.CHANGE_H_SCROLL=1024,r.implement(this,d),this.updateCharacterSize=function(){this.$textLayer.allowBoldFonts!=this.$allowBoldFonts&&(this.$allowBoldFonts=this.$textLayer.allowBoldFonts,this.setStyle("ace_nobold",!this.$allowBoldFonts)),this.layerConfig.characterWidth=this.characterWidth=this.$textLayer.getCharacterWidth(),this.layerConfig.lineHeight=this.lineHeight=this.$textLayer.getLineHeight(),this.$updatePrintMargin()},this.setSession=function(e){this.session&&this.session.doc.off("changeNewLineMode",this.onChangeNewLineMode),this.session=e,e&&this.scrollMargin.top&&e.getScrollTop()<=0&&e.setScrollTop(-this.scrollMargin.top),this.$cursorLayer.setSession(e),this.$markerBack.setSession(e),this.$markerFront.setSession(e),this.$gutterLayer.setSession(e),this.$textLayer.setSession(e);if(!e)return;this.$loop.schedule(this.CHANGE_FULL),this.session.$setFontMetrics(this.$fontMetrics),this.scrollBarH.scrollLeft=this.scrollBarV.scrollTop=null,this.onChangeNewLineMode=this.onChangeNewLineMode.bind(this),this.onChangeNewLineMode(),this.session.doc.on("changeNewLineMode",this.onChangeNewLineMode)},this.updateLines=function(e,t,n){t===undefined&&(t=Infinity),this.$changedLines?(this.$changedLines.firstRow>e&&(this.$changedLines.firstRow=e),this.$changedLines.lastRow<t&&(this.$changedLines.lastRow=t)):this.$changedLines={firstRow:e,lastRow:t};if(this.$changedLines.lastRow<this.layerConfig.firstRow){if(!n)return;this.$changedLines.lastRow=this.layerConfig.lastRow}if(this.$changedLines.firstRow>this.layerConfig.lastRow)return;this.$loop.schedule(this.CHANGE_LINES)},this.onChangeNewLineMode=function(){this.$loop.schedule(this.CHANGE_TEXT),this.$textLayer.$updateEolChar(),this.session.$bidiHandler.setEolChar(this.$textLayer.EOL_CHAR)},this.onChangeTabSize=function(){this.$loop.schedule(this.CHANGE_TEXT|this.CHANGE_MARKER),this.$textLayer.onChangeTabSize()},this.updateText=function(){this.$loop.schedule(this.CHANGE_TEXT)},this.updateFull=function(e){e?this.$renderChanges(this.CHANGE_FULL,!0):this.$loop.schedule(this.CHANGE_FULL)},this.updateFontSize=function(){this.$textLayer.checkForSizeChanges()},this.$changes=0,this.$updateSizeAsync=function(){this.$loop.pending?this.$size.$dirty=!0:this.onResize()},this.onResize=function(e,t,n,r){if(this.resizing>2)return;this.resizing>0?this.resizing++:this.resizing=e?1:0;var i=this.container;r||(r=i.clientHeight||i.scrollHeight),n||(n=i.clientWidth||i.scrollWidth);var s=this.$updateCachedSize(e,t,n,r);if(!this.$size.scrollerHeight||!n&&!r)return this.resizing=0;e&&(this.$gutterLayer.$padding=null),e?this.$renderChanges(s|this.$changes,!0):this.$loop.schedule(s|this.$changes),this.resizing&&(this.resizing=0),this.scrollBarV.scrollLeft=this.scrollBarV.scrollTop=null},this.$updateCachedSize=function(e,t,n,r){r-=this.$extraHeight||0;var s=0,o=this.$size,u={width:o.width,height:o.height,scrollerHeight:o.scrollerHeight,scrollerWidth:o.scrollerWidth};r&&(e||o.height!=r)&&(o.height=r,s|=this.CHANGE_SIZE,o.scrollerHeight=o.height,this.$horizScroll&&(o.scrollerHeight-=this.scrollBarH.getHeight()),this.scrollBarV.element.style.bottom=this.scrollBarH.getHeight()+"px",s|=this.CHANGE_SCROLL);if(n&&(e||o.width!=n)){s|=this.CHANGE_SIZE,o.width=n,t==null&&(t=this.$showGutter?this.$gutter.offsetWidth:0),this.gutterWidth=t,i.setStyle(this.scrollBarH.element.style,"left",t+"px"),i.setStyle(this.scroller.style,"left",t+this.margin.left+"px"),o.scrollerWidth=Math.max(0,n-t-this.scrollBarV.getWidth()-this.margin.h),i.setStyle(this.$gutter.style,"left",this.margin.left+"px");var a=this.scrollBarV.getWidth()+"px";i.setStyle(this.scrollBarH.element.style,"right",a),i.setStyle(this.scroller.style,"right",a),i.setStyle(this.scroller.style,"bottom",this.scrollBarH.getHeight());if(this.session&&this.session.getUseWrapMode()&&this.adjustWrapLimit()||e)s|=this.CHANGE_FULL}return o.$dirty=!n||!r,s&&this._signal("resize",u),s},this.onGutterResize=function(e){var t=this.$showGutter?e:0;t!=this.gutterWidth&&(this.$changes|=this.$updateCachedSize(!0,t,this.$size.width,this.$size.height)),this.session.getUseWrapMode()&&this.adjustWrapLimit()?this.$loop.schedule(this.CHANGE_FULL):this.$size.$dirty?this.$loop.schedule(this.CHANGE_FULL):this.$computeLayerConfig()},this.adjustWrapLimit=function(){var e=this.$size.scrollerWidth-this.$padding*2,t=Math.floor(e/this.characterWidth);return this.session.adjustWrapLimit(t,this.$showPrintMargin&&this.$printMarginColumn)},this.setAnimatedScroll=function(e){this.setOption("animatedScroll",e)},this.getAnimatedScroll=function(){return this.$animatedScroll},this.setShowInvisibles=function(e){this.setOption("showInvisibles",e),this.session.$bidiHandler.setShowInvisibles(e)},this.getShowInvisibles=function(){return this.getOption("showInvisibles")},this.getDisplayIndentGuides=function(){return this.getOption("displayIndentGuides")},this.setDisplayIndentGuides=function(e){this.setOption("displayIndentGuides",e)},this.setShowPrintMargin=function(e){this.setOption("showPrintMargin",e)},this.getShowPrintMargin=function(){return this.getOption("showPrintMargin")},this.setPrintMarginColumn=function(e){this.setOption("printMarginColumn",e)},this.getPrintMarginColumn=function(){return this.getOption("printMarginColumn")},this.getShowGutter=function(){return this.getOption("showGutter")},this.setShowGutter=function(e){return this.setOption("showGutter",e)},this.getFadeFoldWidgets=function(){return this.getOption("fadeFoldWidgets")},this.setFadeFoldWidgets=function(e){this.setOption("fadeFoldWidgets",e)},this.setHighlightGutterLine=function(e){this.setOption("highlightGutterLine",e)},this.getHighlightGutterLine=function(){return this.getOption("highlightGutterLine")},this.$updatePrintMargin=function(){if(!this.$showPrintMargin&&!this.$printMarginEl)return;if(!this.$printMarginEl){var e=i.createElement("div");e.className="ace_layer ace_print-margin-layer",this.$printMarginEl=i.createElement("div"),this.$printMarginEl.className="ace_print-margin",e.appendChild(this.$printMarginEl),this.content.insertBefore(e,this.content.firstChild)}var t=this.$printMarginEl.style;t.left=Math.round(this.characterWidth*this.$printMarginColumn+this.$padding)+"px",t.visibility=this.$showPrintMargin?"visible":"hidden",this.session&&this.session.$wrap==-1&&this.adjustWrapLimit()},this.getContainerElement=function(){return this.container},this.getMouseEventTarget=function(){return this.scroller},this.getTextAreaContainer=function(){return this.container},this.$moveTextAreaToCursor=function(){var e=this.textarea.style;if(!this.$keepTextAreaAtCursor){i.translate(this.textarea,-100,0);return}var t=this.$cursorLayer.$pixelPos;if(!t)return;var n=this.$composition;n&&n.markerRange&&(t=this.$cursorLayer.getPixelPosition(n.markerRange.start,!0));var r=this.layerConfig,s=t.top,o=t.left;s-=r.offset;var u=n&&n.useTextareaForIME?this.lineHeight:g?0:1;if(s<0||s>r.height-u){i.translate(this.textarea,0,0);return}var a=1;if(!n)s+=this.lineHeight;else if(n.useTextareaForIME){var f=this.textarea.value;a=this.characterWidth*this.session.$getStringScreenWidth(f)[0],u+=2}else s+=this.lineHeight+2;o-=this.scrollLeft,o>this.$size.scrollerWidth-a&&(o=this.$size.scrollerWidth-a),o+=this.gutterWidth+this.margin.left,i.setStyle(e,"height",u+"px"),i.setStyle(e,"width",a+"px"),i.translate(this.textarea,Math.min(o,this.$size.scrollerWidth-a),Math.min(s,this.$size.height-u))},this.getFirstVisibleRow=function(){return this.layerConfig.firstRow},this.getFirstFullyVisibleRow=function(){return this.layerConfig.firstRow+(this.layerConfig.offset===0?0:1)},this.getLastFullyVisibleRow=function(){var e=this.layerConfig,t=e.lastRow,n=this.session.documentToScreenRow(t,0)*e.lineHeight;return n-this.session.getScrollTop()>e.height-e.lineHeight?t-1:t},this.getLastVisibleRow=function(){return this.layerConfig.lastRow},this.$padding=null,this.setPadding=function(e){this.$padding=e,this.$textLayer.setPadding(e),this.$cursorLayer.setPadding(e),this.$markerFront.setPadding(e),this.$markerBack.setPadding(e),this.$loop.schedule(this.CHANGE_FULL),this.$updatePrintMargin()},this.setScrollMargin=function(e,t,n,r){var i=this.scrollMargin;i.top=e|0,i.bottom=t|0,i.right=r|0,i.left=n|0,i.v=i.top+i.bottom,i.h=i.left+i.right,i.top&&this.scrollTop<=0&&this.session&&this.session.setScrollTop(-i.top),this.updateFull()},this.setMargin=function(e,t,n,r){var i=this.margin;i.top=e|0,i.bottom=t|0,i.right=r|0,i.left=n|0,i.v=i.top+i.bottom,i.h=i.left+i.right,this.$updateCachedSize(!0,this.gutterWidth,this.$size.width,this.$size.height),this.updateFull()},this.getHScrollBarAlwaysVisible=function(){return this.$hScrollBarAlwaysVisible},this.setHScrollBarAlwaysVisible=function(e){this.setOption("hScrollBarAlwaysVisible",e)},this.getVScrollBarAlwaysVisible=function(){return this.$vScrollBarAlwaysVisible},this.setVScrollBarAlwaysVisible=function(e){this.setOption("vScrollBarAlwaysVisible",e)},this.$updateScrollBarV=function(){var e=this.layerConfig.maxHeight,t=this.$size.scrollerHeight;!this.$maxLines&&this.$scrollPastEnd&&(e-=(t-this.lineHeight)*this.$scrollPastEnd,this.scrollTop>e-t&&(e=this.scrollTop+t,this.scrollBarV.scrollTop=null)),this.scrollBarV.setScrollHeight(e+this.scrollMargin.v),this.scrollBarV.setScrollTop(this.scrollTop+this.scrollMargin.top)},this.$updateScrollBarH=function(){this.scrollBarH.setScrollWidth(this.layerConfig.width+2*this.$padding+this.scrollMargin.h),this.scrollBarH.setScrollLeft(this.scrollLeft+this.scrollMargin.left)},this.$frozen=!1,this.freeze=function(){this.$frozen=!0},this.unfreeze=function(){this.$frozen=!1},this.$renderChanges=function(e,t){this.$changes&&(e|=this.$changes,this.$changes=0);if(!this.session||!this.container.offsetWidth||this.$frozen||!e&&!t){this.$changes|=e;return}if(this.$size.$dirty)return this.$changes|=e,this.onResize(!0);this.lineHeight||this.$textLayer.checkForSizeChanges(),this._signal("beforeRender"),this.session&&this.session.$bidiHandler&&this.session.$bidiHandler.updateCharacterWidths(this.$fontMetrics);var n=this.layerConfig;if(e&this.CHANGE_FULL||e&this.CHANGE_SIZE||e&this.CHANGE_TEXT||e&this.CHANGE_LINES||e&this.CHANGE_SCROLL||e&this.CHANGE_H_SCROLL){e|=this.$computeLayerConfig()|this.$loop.clear();if(n.firstRow!=this.layerConfig.firstRow&&n.firstRowScreen==this.layerConfig.firstRowScreen){var r=this.scrollTop+(n.firstRow-this.layerConfig.firstRow)*this.lineHeight;r>0&&(this.scrollTop=r,e|=this.CHANGE_SCROLL,e|=this.$computeLayerConfig()|this.$loop.clear())}n=this.layerConfig,this.$updateScrollBarV(),e&this.CHANGE_H_SCROLL&&this.$updateScrollBarH(),i.translate(this.content,-this.scrollLeft,-n.offset);var s=n.width+2*this.$padding+"px",o=n.minHeight+"px";i.setStyle(this.content.style,"width",s),i.setStyle(this.content.style,"height",o)}e&this.CHANGE_H_SCROLL&&(i.translate(this.content,-this.scrollLeft,-n.offset),this.scroller.className=this.scrollLeft<=0?"ace_scroller":"ace_scroller ace_scroll-left");if(e&this.CHANGE_FULL){this.$textLayer.update(n),this.$showGutter&&this.$gutterLayer.update(n),this.$markerBack.update(n),this.$markerFront.update(n),this.$cursorLayer.update(n),this.$moveTextAreaToCursor(),this._signal("afterRender");return}if(e&this.CHANGE_SCROLL){e&this.CHANGE_TEXT||e&this.CHANGE_LINES?this.$textLayer.update(n):this.$textLayer.scrollLines(n),this.$showGutter&&(e&this.CHANGE_GUTTER||e&this.CHANGE_LINES?this.$gutterLayer.update(n):this.$gutterLayer.scrollLines(n)),this.$markerBack.update(n),this.$markerFront.update(n),this.$cursorLayer.update(n),this.$moveTextAreaToCursor(),this._signal("afterRender");return}e&this.CHANGE_TEXT?(this.$textLayer.update(n),this.$showGutter&&this.$gutterLayer.update(n)):e&this.CHANGE_LINES?(this.$updateLines()||e&this.CHANGE_GUTTER&&this.$showGutter)&&this.$gutterLayer.update(n):e&this.CHANGE_TEXT||e&this.CHANGE_GUTTER?this.$showGutter&&this.$gutterLayer.update(n):e&this.CHANGE_CURSOR&&this.$highlightGutterLine&&this.$gutterLayer.updateLineHighlight(n),e&this.CHANGE_CURSOR&&(this.$cursorLayer.update(n),this.$moveTextAreaToCursor()),e&(this.CHANGE_MARKER|this.CHANGE_MARKER_FRONT)&&this.$markerFront.update(n),e&(this.CHANGE_MARKER|this.CHANGE_MARKER_BACK)&&this.$markerBack.update(n),this._signal("afterRender")},this.$autosize=function(){var e=this.session.getScreenLength()*this.lineHeight,t=this.$maxLines*this.lineHeight,n=Math.min(t,Math.max((this.$minLines||1)*this.lineHeight,e))+this.scrollMargin.v+(this.$extraHeight||0);this.$horizScroll&&(n+=this.scrollBarH.getHeight()),this.$maxPixelHeight&&n>this.$maxPixelHeight&&(n=this.$maxPixelHeight);var r=n<=2*this.lineHeight,i=!r&&e>t;if(n!=this.desiredHeight||this.$size.height!=this.desiredHeight||i!=this.$vScroll){i!=this.$vScroll&&(this.$vScroll=i,this.scrollBarV.setVisible(i));var s=this.container.clientWidth;this.container.style.height=n+"px",this.$updateCachedSize(!0,this.$gutterWidth,s,n),this.desiredHeight=n,this._signal("autosize")}},this.$computeLayerConfig=function(){var e=this.session,t=this.$size,n=t.height<=2*this.lineHeight,r=this.session.getScreenLength(),i=r*this.lineHeight,s=this.$getLongestLine(),o=!n&&(this.$hScrollBarAlwaysVisible||t.scrollerWidth-s-2*this.$padding<0),u=this.$horizScroll!==o;u&&(this.$horizScroll=o,this.scrollBarH.setVisible(o));var a=this.$vScroll;this.$maxLines&&this.lineHeight>1&&this.$autosize();var f=t.scrollerHeight+this.lineHeight,l=!this.$maxLines&&this.$scrollPastEnd?(t.scrollerHeight-this.lineHeight)*this.$scrollPastEnd:0;i+=l;var c=this.scrollMargin;this.session.setScrollTop(Math.max(-c.top,Math.min(this.scrollTop,i-t.scrollerHeight+c.bottom))),this.session.setScrollLeft(Math.max(-c.left,Math.min(this.scrollLeft,s+2*this.$padding-t.scrollerWidth+c.right)));var h=!n&&(this.$vScrollBarAlwaysVisible||t.scrollerHeight-i+l<0||this.scrollTop>c.top),p=a!==h;p&&(this.$vScroll=h,this.scrollBarV.setVisible(h));var d=this.scrollTop%this.lineHeight,v=Math.ceil(f/this.lineHeight)-1,m=Math.max(0,Math.round((this.scrollTop-d)/this.lineHeight)),g=m+v,y,b,w=this.lineHeight;m=e.screenToDocumentRow(m,0);var E=e.getFoldLine(m);E&&(m=E.start.row),y=e.documentToScreenRow(m,0),b=e.getRowLength(m)*w,g=Math.min(e.screenToDocumentRow(g,0),e.getLength()-1),f=t.scrollerHeight+e.getRowLength(g)*w+b,d=this.scrollTop-y*w;var S=0;if(this.layerConfig.width!=s||u)S=this.CHANGE_H_SCROLL;if(u||p)S=this.$updateCachedSize(!0,this.gutterWidth,t.width,t.height),this._signal("scrollbarVisibilityChanged"),p&&(s=this.$getLongestLine());return this.layerConfig={width:s,padding:this.$padding,firstRow:m,firstRowScreen:y,lastRow:g,lineHeight:w,characterWidth:this.characterWidth,minHeight:f,maxHeight:i,offset:d,gutterOffset:w?Math.max(0,Math.ceil((d+t.height-t.scrollerHeight)/w)):0,height:this.$size.scrollerHeight},this.session.$bidiHandler&&this.session.$bidiHandler.setContentWidth(s-this.$padding),S},this.$updateLines=function(){if(!this.$changedLines)return;var e=this.$changedLines.firstRow,t=this.$changedLines.lastRow;this.$changedLines=null;var n=this.layerConfig;if(e>n.lastRow+1)return;if(t<n.firstRow)return;if(t===Infinity){this.$showGutter&&this.$gutterLayer.update(n),this.$textLayer.update(n);return}return this.$textLayer.updateLines(n,e,t),!0},this.$getLongestLine=function(){var e=this.session.getScreenWidth();return this.showInvisibles&&!this.session.$useWrapMode&&(e+=1),this.$textLayer&&e>this.$textLayer.MAX_LINE_LENGTH&&(e=this.$textLayer.MAX_LINE_LENGTH+30),Math.max(this.$size.scrollerWidth-2*this.$padding,Math.round(e*this.characterWidth))},this.updateFrontMarkers=function(){this.$markerFront.setMarkers(this.session.getMarkers(!0)),this.$loop.schedule(this.CHANGE_MARKER_FRONT)},this.updateBackMarkers=function(){this.$markerBack.setMarkers(this.session.getMarkers()),this.$loop.schedule(this.CHANGE_MARKER_BACK)},this.addGutterDecoration=function(e,t){this.$gutterLayer.addGutterDecoration(e,t)},this.removeGutterDecoration=function(e,t){this.$gutterLayer.removeGutterDecoration(e,t)},this.updateBreakpoints=function(e){this.$loop.schedule(this.CHANGE_GUTTER)},this.setAnnotations=function(e){this.$gutterLayer.setAnnotations(e),this.$loop.schedule(this.CHANGE_GUTTER)},this.updateCursor=function(){this.$loop.schedule(this.CHANGE_CURSOR)},this.hideCursor=function(){this.$cursorLayer.hideCursor()},this.showCursor=function(){this.$cursorLayer.showCursor()},this.scrollSelectionIntoView=function(e,t,n){this.scrollCursorIntoView(e,n),this.scrollCursorIntoView(t,n)},this.scrollCursorIntoView=function(e,t,n){if(this.$size.scrollerHeight===0)return;var r=this.$cursorLayer.getPixelPosition(e),i=r.left,s=r.top,o=n&&n.top||0,u=n&&n.bottom||0,a=this.$scrollAnimation?this.session.getScrollTop():this.scrollTop;a+o>s?(t&&a+o>s+this.lineHeight&&(s-=t*this.$size.scrollerHeight),s===0&&(s=-this.scrollMargin.top),this.session.setScrollTop(s)):a+this.$size.scrollerHeight-u<s+this.lineHeight&&(t&&a+this.$size.scrollerHeight-u<s-this.lineHeight&&(s+=t*this.$size.scrollerHeight),this.session.setScrollTop(s+this.lineHeight+u-this.$size.scrollerHeight));var f=this.scrollLeft;f>i?(i<this.$padding+2*this.layerConfig.characterWidth&&(i=-this.scrollMargin.left),this.session.setScrollLeft(i)):f+this.$size.scrollerWidth<i+this.characterWidth?this.session.setScrollLeft(Math.round(i+this.characterWidth-this.$size.scrollerWidth)):f<=this.$padding&&i-f<this.characterWidth&&this.session.setScrollLeft(0)},this.getScrollTop=function(){return this.session.getScrollTop()},this.getScrollLeft=function(){return this.session.getScrollLeft()},this.getScrollTopRow=function(){return this.scrollTop/this.lineHeight},this.getScrollBottomRow=function(){return Math.max(0,Math.floor((this.scrollTop+this.$size.scrollerHeight)/this.lineHeight)-1)},this.scrollToRow=function(e){this.session.setScrollTop(e*this.lineHeight)},this.alignCursor=function(e,t){typeof e=="number"&&(e={row:e,column:0});var n=this.$cursorLayer.getPixelPosition(e),r=this.$size.scrollerHeight-this.lineHeight,i=n.top-r*(t||0);return this.session.setScrollTop(i),i},this.STEPS=8,this.$calcSteps=function(e,t){var n=0,r=this.STEPS,i=[],s=function(e,t,n){return n*(Math.pow(e-1,3)+1)+t};for(n=0;n<r;++n)i.push(s(n/this.STEPS,e,t-e));return i},this.scrollToLine=function(e,t,n,r){var i=this.$cursorLayer.getPixelPosition({row:e,column:0}),s=i.top;t&&(s-=this.$size.scrollerHeight/2);var o=this.scrollTop;this.session.setScrollTop(s),n!==!1&&this.animateScrolling(o,r)},this.animateScrolling=function(e,t){var n=this.scrollTop;if(!this.$animatedScroll)return;var r=this;if(e==n)return;if(this.$scrollAnimation){var i=this.$scrollAnimation.steps;if(i.length){e=i[0];if(e==n)return}}var s=r.$calcSteps(e,n);this.$scrollAnimation={from:e,to:n,steps:s},clearInterval(this.$timer),r.session.setScrollTop(s.shift()),r.session.$scrollTop=n,this.$timer=setInterval(function(){s.length?(r.session.setScrollTop(s.shift()),r.session.$scrollTop=n):n!=null?(r.session.$scrollTop=-1,r.session.setScrollTop(n),n=null):(r.$timer=clearInterval(r.$timer),r.$scrollAnimation=null,t&&t())},10)},this.scrollToY=function(e){this.scrollTop!==e&&(this.$loop.schedule(this.CHANGE_SCROLL),this.scrollTop=e)},this.scrollToX=function(e){this.scrollLeft!==e&&(this.scrollLeft=e),this.$loop.schedule(this.CHANGE_H_SCROLL)},this.scrollTo=function(e,t){this.session.setScrollTop(t),this.session.setScrollLeft(t)},this.scrollBy=function(e,t){t&&this.session.setScrollTop(this.session.getScrollTop()+t),e&&this.session.setScrollLeft(this.session.getScrollLeft()+e)},this.isScrollableBy=function(e,t){if(t<0&&this.session.getScrollTop()>=1-this.scrollMargin.top)return!0;if(t>0&&this.session.getScrollTop()+this.$size.scrollerHeight-this.layerConfig.maxHeight<-1+this.scrollMargin.bottom)return!0;if(e<0&&this.session.getScrollLeft()>=1-this.scrollMargin.left)return!0;if(e>0&&this.session.getScrollLeft()+this.$size.scrollerWidth-this.layerConfig.width<-1+this.scrollMargin.right)return!0},this.pixelToScreenCoordinates=function(e,t){var n;if(this.$hasCssTransforms){n={top:0,left:0};var r=this.$fontMetrics.transformCoordinates([e,t]);e=r[1]-this.gutterWidth-this.margin.left,t=r[0]}else n=this.scroller.getBoundingClientRect();var i=e+this.scrollLeft-n.left-this.$padding,s=i/this.characterWidth,o=Math.floor((t+this.scrollTop-n.top)/this.lineHeight),u=this.$blockCursor?Math.floor(s):Math.round(s);return{row:o,column:u,side:s-u>0?1:-1,offsetX:i}},this.screenToTextCoordinates=function(e,t){var n;if(this.$hasCssTransforms){n={top:0,left:0};var r=this.$fontMetrics.transformCoordinates([e,t]);e=r[1]-this.gutterWidth-this.margin.left,t=r[0]}else n=this.scroller.getBoundingClientRect();var i=e+this.scrollLeft-n.left-this.$padding,s=i/this.characterWidth,o=this.$blockCursor?Math.floor(s):Math.round(s),u=Math.floor((t+this.scrollTop-n.top)/this.lineHeight);return this.session.screenToDocumentPosition(u,Math.max(o,0),i)},this.textToScreenCoordinates=function(e,t){var n=this.scroller.getBoundingClientRect(),r=this.session.documentToScreenPosition(e,t),i=this.$padding+(this.session.$bidiHandler.isBidiRow(r.row,e)?this.session.$bidiHandler.getPosLeft(r.column):Math.round(r.column*this.characterWidth)),s=r.row*this.lineHeight;return{pageX:n.left+i-this.scrollLeft,pageY:n.top+s-this.scrollTop}},this.visualizeFocus=function(){i.addCssClass(this.container,"ace_focus")},this.visualizeBlur=function(){i.removeCssClass(this.container,"ace_focus")},this.showComposition=function(e){this.$composition=e,e.cssText||(e.cssText=this.textarea.style.cssText,e.keepTextAreaAtCursor=this.$keepTextAreaAtCursor),e.useTextareaForIME=this.$useTextareaForIME,this.$useTextareaForIME?(this.$keepTextAreaAtCursor=!0,i.addCssClass(this.textarea,"ace_composition"),this.textarea.style.cssText="",this.$moveTextAreaToCursor(),this.$cursorLayer.element.style.display="none"):e.markerId=this.session.addMarker(e.markerRange,"ace_composition_marker","text")},this.setCompositionText=function(e){var t=this.session.selection.cursor;this.addToken(e,"composition_placeholder",t.row,t.column),this.$moveTextAreaToCursor()},this.hideComposition=function(){if(!this.$composition)return;this.$composition.markerId&&this.session.removeMarker(this.$composition.markerId),i.removeCssClass(this.textarea,"ace_composition"),this.$keepTextAreaAtCursor=this.$composition.keepTextAreaAtCursor,this.textarea.style.cssText=this.$composition.cssText,this.$composition=null,this.$cursorLayer.element.style.display=""},this.addToken=function(e,t,n,r){var i=this.session;i.bgTokenizer.lines[n]=null;var s={type:t,value:e},o=i.getTokens(n);if(r==null)o.push(s);else{var u=0;for(var a=0;a<o.length;a++){var f=o[a];u+=f.value.length;if(r<=u){var l=f.value.length-(u-r),c=f.value.slice(0,l),h=f.value.slice(l);o.splice(a,1,{type:f.type,value:c},s,{type:f.type,value:h});break}}}this.updateLines(n,n)},this.setTheme=function(e,t){function o(r){if(n.$themeId!=e)return t&&t();if(!r||!r.cssClass)throw new Error("couldn't load module "+e+" or it didn't call define");r.$id&&(n.$themeId=r.$id),i.importCssString(r.cssText,r.cssClass,n.container),n.theme&&i.removeCssClass(n.container,n.theme.cssClass);var s="padding"in r?r.padding:"padding"in(n.theme||{})?4:n.$padding;n.$padding&&s!=n.$padding&&n.setPadding(s),n.$theme=r.cssClass,n.theme=r,i.addCssClass(n.container,r.cssClass),i.setCssClass(n.container,"ace_dark",r.isDark),n.$size&&(n.$size.width=0,n.$updateSizeAsync()),n._dispatchEvent("themeLoaded",{theme:r}),t&&t()}var n=this;this.$themeId=e,n._dispatchEvent("themeChange",{theme:e});if(!e||typeof e=="string"){var r=e||this.$options.theme.initialValue;s.loadModule(["theme",r],o)}else o(e)},this.getTheme=function(){return this.$themeId},this.setStyle=function(e,t){i.setCssClass(this.container,e,t!==!1)},this.unsetStyle=function(e){i.removeCssClass(this.container,e)},this.setCursorStyle=function(e){i.setStyle(this.scroller.style,"cursor",e)},this.setMouseCursor=function(e){i.setStyle(this.scroller.style,"cursor",e)},this.attachToShadowRoot=function(){i.importCssString(v,"ace_editor.css",this.container)},this.destroy=function(){this.$fontMetrics.destroy(),this.$cursorLayer.destroy()}}).call(y.prototype),s.defineOptions(y.prototype,"renderer",{animatedScroll:{initialValue:!1},showInvisibles:{set:function(e){this.$textLayer.setShowInvisibles(e)&&this.$loop.schedule(this.CHANGE_TEXT)},initialValue:!1},showPrintMargin:{set:function(){this.$updatePrintMargin()},initialValue:!0},printMarginColumn:{set:function(){this.$updatePrintMargin()},initialValue:80},printMargin:{set:function(e){typeof e=="number"&&(this.$printMarginColumn=e),this.$showPrintMargin=!!e,this.$updatePrintMargin()},get:function(){return this.$showPrintMargin&&this.$printMarginColumn}},showGutter:{set:function(e){this.$gutter.style.display=e?"block":"none",this.$loop.schedule(this.CHANGE_FULL),this.onGutterResize()},initialValue:!0},fadeFoldWidgets:{set:function(e){i.setCssClass(this.$gutter,"ace_fade-fold-widgets",e)},initialValue:!1},showFoldWidgets:{set:function(e){this.$gutterLayer.setShowFoldWidgets(e),this.$loop.schedule(this.CHANGE_GUTTER)},initialValue:!0},displayIndentGuides:{set:function(e){this.$textLayer.setDisplayIndentGuides(e)&&this.$loop.schedule(this.CHANGE_TEXT)},initialValue:!0},highlightGutterLine:{set:function(e){this.$gutterLayer.setHighlightGutterLine(e),this.$loop.schedule(this.CHANGE_GUTTER)},initialValue:!0},hScrollBarAlwaysVisible:{set:function(e){(!this.$hScrollBarAlwaysVisible||!this.$horizScroll)&&this.$loop.schedule(this.CHANGE_SCROLL)},initialValue:!1},vScrollBarAlwaysVisible:{set:function(e){(!this.$vScrollBarAlwaysVisible||!this.$vScroll)&&this.$loop.schedule(this.CHANGE_SCROLL)},initialValue:!1},fontSize:{set:function(e){typeof e=="number"&&(e+="px"),this.container.style.fontSize=e,this.updateFontSize()},initialValue:12},fontFamily:{set:function(e){this.container.style.fontFamily=e,this.updateFontSize()}},maxLines:{set:function(e){this.updateFull()}},minLines:{set:function(e){this.$minLines<562949953421311||(this.$minLines=0),this.updateFull()}},maxPixelHeight:{set:function(e){this.updateFull()},initialValue:0},scrollPastEnd:{set:function(e){e=+e||0;if(this.$scrollPastEnd==e)return;this.$scrollPastEnd=e,this.$loop.schedule(this.CHANGE_SCROLL)},initialValue:0,handlesSet:!0},fixedWidthGutter:{set:function(e){this.$gutterLayer.$fixedWidth=!!e,this.$loop.schedule(this.CHANGE_GUTTER)}},theme:{set:function(e){this.setTheme(e)},get:function(){return this.$themeId||this.theme},initialValue:"./theme/textmate",handlesSet:!0},hasCssTransforms:{},useTextareaForIME:{initialValue:!m.isMobile&&!m.isIE}}),t.VirtualRenderer=y}),ace.define("ace/worker/worker_client",["require","exports","module","ace/lib/oop","ace/lib/net","ace/lib/event_emitter","ace/config"],function(e,t,n){"use strict";function u(e){var t="importScripts('"+i.qualifyURL(e)+"');";try{return new Blob([t],{type:"application/javascript"})}catch(n){var r=window.BlobBuilder||window.WebKitBlobBuilder||window.MozBlobBuilder,s=new r;return s.append(t),s.getBlob("application/javascript")}}function a(e){if(typeof Worker=="undefined")return{postMessage:function(){},terminate:function(){}};if(o.get("loadWorkerFromBlob")){var t=u(e),n=window.URL||window.webkitURL,r=n.createObjectURL(t);return new Worker(r)}return new Worker(e)}var r=e("../lib/oop"),i=e("../lib/net"),s=e("../lib/event_emitter").EventEmitter,o=e("../config"),f=function(e){e.postMessage||(e=this.$createWorkerFromOldConfig.apply(this,arguments)),this.$worker=e,this.$sendDeltaQueue=this.$sendDeltaQueue.bind(this),this.changeListener=this.changeListener.bind(this),this.onMessage=this.onMessage.bind(this),this.callbackId=1,this.callbacks={},this.$worker.onmessage=this.onMessage};(function(){r.implement(this,s),this.$createWorkerFromOldConfig=function(t,n,r,i,s){e.nameToUrl&&!e.toUrl&&(e.toUrl=e.nameToUrl);if(o.get("packaged")||!e.toUrl)i=i||o.moduleUrl(n,"worker");else{var u=this.$normalizePath;i=i||u(e.toUrl("ace/worker/worker.js",null,"_"));var f={};t.forEach(function(t){f[t]=u(e.toUrl(t,null,"_").replace(/(\.js)?(\?.*)?$/,""))})}return this.$worker=a(i),s&&this.send("importScripts",s),this.$worker.postMessage({init:!0,tlns:f,module:n,classname:r}),this.$worker},this.onMessage=function(e){var t=e.data;switch(t.type){case"event":this._signal(t.name,{data:t.data});break;case"call":var n=this.callbacks[t.id];n&&(n(t.data),delete this.callbacks[t.id]);break;case"error":this.reportError(t.data);break;case"log":window.console&&console.log&&console.log.apply(console,t.data)}},this.reportError=function(e){window.console&&console.error&&console.error(e)},this.$normalizePath=function(e){return i.qualifyURL(e)},this.terminate=function(){this._signal("terminate",{}),this.deltaQueue=null,this.$worker.terminate(),this.$worker=null,this.$doc&&this.$doc.off("change",this.changeListener),this.$doc=null},this.send=function(e,t){this.$worker.postMessage({command:e,args:t})},this.call=function(e,t,n){if(n){var r=this.callbackId++;this.callbacks[r]=n,t.push(r)}this.send(e,t)},this.emit=function(e,t){try{t.data&&t.data.err&&(t.data.err={message:t.data.err.message,stack:t.data.err.stack,code:t.data.err.code}),this.$worker.postMessage({event:e,data:{data:t.data}})}catch(n){console.error(n.stack)}},this.attachToDocument=function(e){this.$doc&&this.terminate(),this.$doc=e,this.call("setValue",[e.getValue()]),e.on("change",this.changeListener)},this.changeListener=function(e){this.deltaQueue||(this.deltaQueue=[],setTimeout(this.$sendDeltaQueue,0)),e.action=="insert"?this.deltaQueue.push(e.start,e.lines):this.deltaQueue.push(e.start,e.end)},this.$sendDeltaQueue=function(){var e=this.deltaQueue;if(!e)return;this.deltaQueue=null,e.length>50&&e.length>this.$doc.getLength()>>1?this.call("setValue",[this.$doc.getValue()]):this.emit("change",{data:e})}}).call(f.prototype);var l=function(e,t,n){var r=null,i=!1,u=Object.create(s),a=[],l=new f({messageBuffer:a,terminate:function(){},postMessage:function(e){a.push(e);if(!r)return;i?setTimeout(c):c()}});l.setEmitSync=function(e){i=e};var c=function(){var e=a.shift();e.command?r[e.command].apply(r,e.args):e.event&&u._signal(e.event,e.data)};return u.postMessage=function(e){l.onMessage({data:e})},u.callback=function(e,t){this.postMessage({type:"call",id:t,data:e})},u.emit=function(e,t){this.postMessage({type:"event",name:e,data:t})},o.loadModule(["worker",t],function(e){r=new e[n](u);while(a.length)c()}),l};t.UIWorkerClient=l,t.WorkerClient=f,t.createWorker=a}),ace.define("ace/placeholder",["require","exports","module","ace/range","ace/lib/event_emitter","ace/lib/oop"],function(e,t,n){"use strict";var r=e("./range").Range,i=e("./lib/event_emitter").EventEmitter,s=e("./lib/oop"),o=function(e,t,n,r,i,s){var o=this;this.length=t,this.session=e,this.doc=e.getDocument(),this.mainClass=i,this.othersClass=s,this.$onUpdate=this.onUpdate.bind(this),this.doc.on("change",this.$onUpdate),this.$others=r,this.$onCursorChange=function(){setTimeout(function(){o.onCursorChange()})},this.$pos=n;var u=e.getUndoManager().$undoStack||e.getUndoManager().$undostack||{length:-1};this.$undoStackDepth=u.length,this.setup(),e.selection.on("changeCursor",this.$onCursorChange)};(function(){s.implement(this,i),this.setup=function(){var e=this,t=this.doc,n=this.session;this.selectionBefore=n.selection.toJSON(),n.selection.inMultiSelectMode&&n.selection.toSingleRange(),this.pos=t.createAnchor(this.$pos.row,this.$pos.column);var i=this.pos;i.$insertRight=!0,i.detach(),i.markerId=n.addMarker(new r(i.row,i.column,i.row,i.column+this.length),this.mainClass,null,!1),this.others=[],this.$others.forEach(function(n){var r=t.createAnchor(n.row,n.column);r.$insertRight=!0,r.detach(),e.others.push(r)}),n.setUndoSelect(!1)},this.showOtherMarkers=function(){if(this.othersActive)return;var e=this.session,t=this;this.othersActive=!0,this.others.forEach(function(n){n.markerId=e.addMarker(new r(n.row,n.column,n.row,n.column+t.length),t.othersClass,null,!1)})},this.hideOtherMarkers=function(){if(!this.othersActive)return;this.othersActive=!1;for(var e=0;e<this.others.length;e++)this.session.removeMarker(this.others[e].markerId)},this.onUpdate=function(e){if(this.$updating)return this.updateAnchors(e);var t=e;if(t.start.row!==t.end.row)return;if(t.start.row!==this.pos.row)return;this.$updating=!0;var n=e.action==="insert"?t.end.column-t.start.column:t.start.column-t.end.column,i=t.start.column>=this.pos.column&&t.start.column<=this.pos.column+this.length+1,s=t.start.column-this.pos.column;this.updateAnchors(e),i&&(this.length+=n);if(i&&!this.session.$fromUndo)if(e.action==="insert")for(var o=this.others.length-1;o>=0;o--){var u=this.others[o],a={row:u.row,column:u.column+s};this.doc.insertMergedLines(a,e.lines)}else if(e.action==="remove")for(var o=this.others.length-1;o>=0;o--){var u=this.others[o],a={row:u.row,column:u.column+s};this.doc.remove(new r(a.row,a.column,a.row,a.column-n))}this.$updating=!1,this.updateMarkers()},this.updateAnchors=function(e){this.pos.onChange(e);for(var t=this.others.length;t--;)this.others[t].onChange(e);this.updateMarkers()},this.updateMarkers=function(){if(this.$updating)return;var e=this,t=this.session,n=function(n,i){t.removeMarker(n.markerId),n.markerId=t.addMarker(new r(n.row,n.column,n.row,n.column+e.length),i,null,!1)};n(this.pos,this.mainClass);for(var i=this.others.length;i--;)n(this.others[i],this.othersClass)},this.onCursorChange=function(e){if(this.$updating||!this.session)return;var t=this.session.selection.getCursor();t.row===this.pos.row&&t.column>=this.pos.column&&t.column<=this.pos.column+this.length?(this.showOtherMarkers(),this._emit("cursorEnter",e)):(this.hideOtherMarkers(),this._emit("cursorLeave",e))},this.detach=function(){this.session.removeMarker(this.pos&&this.pos.markerId),this.hideOtherMarkers(),this.doc.removeEventListener("change",this.$onUpdate),this.session.selection.removeEventListener("changeCursor",this.$onCursorChange),this.session.setUndoSelect(!0),this.session=null},this.cancel=function(){if(this.$undoStackDepth===-1)return;var e=this.session.getUndoManager(),t=(e.$undoStack||e.$undostack).length-this.$undoStackDepth;for(var n=0;n<t;n++)e.undo(this.session,!0);this.selectionBefore&&this.session.selection.fromJSON(this.selectionBefore)}}).call(o.prototype),t.PlaceHolder=o}),ace.define("ace/mouse/multi_select_handler",["require","exports","module","ace/lib/event","ace/lib/useragent"],function(e,t,n){function s(e,t){return e.row==t.row&&e.column==t.column}function o(e){var t=e.domEvent,n=t.altKey,o=t.shiftKey,u=t.ctrlKey,a=e.getAccelKey(),f=e.getButton();u&&i.isMac&&(f=t.button);if(e.editor.inMultiSelectMode&&f==2){e.editor.textInput.onContextMenu(e.domEvent);return}if(!u&&!n&&!a){f===0&&e.editor.inMultiSelectMode&&e.editor.exitMultiSelectMode();return}if(f!==0)return;var l=e.editor,c=l.selection,h=l.inMultiSelectMode,p=e.getDocumentPosition(),d=c.getCursor(),v=e.inSelection()||c.isEmpty()&&s(p,d),m=e.x,g=e.y,y=function(e){m=e.clientX,g=e.clientY},b=l.session,w=l.renderer.pixelToScreenCoordinates(m,g),E=w,S;if(l.$mouseHandler.$enableJumpToDef)u&&n||a&&n?S=o?"block":"add":n&&l.$blockSelectEnabled&&(S="block");else if(a&&!n){S="add";if(!h&&o)return}else n&&l.$blockSelectEnabled&&(S="block");S&&i.isMac&&t.ctrlKey&&l.$mouseHandler.cancelContextMenu();if(S=="add"){if(!h&&v)return;if(!h){var x=c.toOrientedRange();l.addSelectionMarker(x)}var T=c.rangeList.rangeAtPoint(p);l.inVirtualSelectionMode=!0,o&&(T=null,x=c.ranges[0]||x,l.removeSelectionMarker(x)),l.once("mouseup",function(){var e=c.toOrientedRange();T&&e.isEmpty()&&s(T.cursor,e.cursor)?c.substractPoint(e.cursor):(o?c.substractPoint(x.cursor):x&&(l.removeSelectionMarker(x),c.addRange(x)),c.addRange(e)),l.inVirtualSelectionMode=!1})}else if(S=="block"){e.stop(),l.inVirtualSelectionMode=!0;var N,C=[],k=function(){var e=l.renderer.pixelToScreenCoordinates(m,g),t=b.screenToDocumentPosition(e.row,e.column,e.offsetX);if(s(E,e)&&s(t,c.lead))return;E=e,l.selection.moveToPosition(t),l.renderer.scrollCursorIntoView(),l.removeSelectionMarkers(C),C=c.rectangularRangeBlock(E,w),l.$mouseHandler.$clickSelection&&C.length==1&&C[0].isEmpty()&&(C[0]=l.$mouseHandler.$clickSelection.clone()),C.forEach(l.addSelectionMarker,l),l.updateSelectionMarkers()};h&&!a?c.toSingleRange():!h&&a&&(N=c.toOrientedRange(),l.addSelectionMarker(N)),o?w=b.documentToScreenPosition(c.lead):c.moveToPosition(p),E={row:-1,column:-1};var L=function(e){k(),clearInterval(O),l.removeSelectionMarkers(C),C.length||(C=[c.toOrientedRange()]),N&&(l.removeSelectionMarker(N),c.toSingleRange(N));for(var t=0;t<C.length;t++)c.addRange(C[t]);l.inVirtualSelectionMode=!1,l.$mouseHandler.$clickSelection=null},A=k;r.capture(l.container,y,L);var O=setInterval(function(){A()},20);return e.preventDefault()}}var r=e("../lib/event"),i=e("../lib/useragent");t.onMouseDown=o}),ace.define("ace/commands/multi_select_commands",["require","exports","module","ace/keyboard/hash_handler"],function(e,t,n){t.defaultCommands=[{name:"addCursorAbove",exec:function(e){e.selectMoreLines(-1)},bindKey:{win:"Ctrl-Alt-Up",mac:"Ctrl-Alt-Up"},scrollIntoView:"cursor",readOnly:!0},{name:"addCursorBelow",exec:function(e){e.selectMoreLines(1)},bindKey:{win:"Ctrl-Alt-Down",mac:"Ctrl-Alt-Down"},scrollIntoView:"cursor",readOnly:!0},{name:"addCursorAboveSkipCurrent",exec:function(e){e.selectMoreLines(-1,!0)},bindKey:{win:"Ctrl-Alt-Shift-Up",mac:"Ctrl-Alt-Shift-Up"},scrollIntoView:"cursor",readOnly:!0},{name:"addCursorBelowSkipCurrent",exec:function(e){e.selectMoreLines(1,!0)},bindKey:{win:"Ctrl-Alt-Shift-Down",mac:"Ctrl-Alt-Shift-Down"},scrollIntoView:"cursor",readOnly:!0},{name:"selectMoreBefore",exec:function(e){e.selectMore(-1)},bindKey:{win:"Ctrl-Alt-Left",mac:"Ctrl-Alt-Left"},scrollIntoView:"cursor",readOnly:!0},{name:"selectMoreAfter",exec:function(e){e.selectMore(1)},bindKey:{win:"Ctrl-Alt-Right",mac:"Ctrl-Alt-Right"},scrollIntoView:"cursor",readOnly:!0},{name:"selectNextBefore",exec:function(e){e.selectMore(-1,!0)},bindKey:{win:"Ctrl-Alt-Shift-Left",mac:"Ctrl-Alt-Shift-Left"},scrollIntoView:"cursor",readOnly:!0},{name:"selectNextAfter",exec:function(e){e.selectMore(1,!0)},bindKey:{win:"Ctrl-Alt-Shift-Right",mac:"Ctrl-Alt-Shift-Right"},scrollIntoView:"cursor",readOnly:!0},{name:"splitIntoLines",exec:function(e){e.multiSelect.splitIntoLines()},bindKey:{win:"Ctrl-Alt-L",mac:"Ctrl-Alt-L"},readOnly:!0},{name:"alignCursors",exec:function(e){e.alignCursors()},bindKey:{win:"Ctrl-Alt-A",mac:"Ctrl-Alt-A"},scrollIntoView:"cursor"},{name:"findAll",exec:function(e){e.findAll()},bindKey:{win:"Ctrl-Alt-K",mac:"Ctrl-Alt-G"},scrollIntoView:"cursor",readOnly:!0}],t.multiSelectCommands=[{name:"singleSelection",bindKey:"esc",exec:function(e){e.exitMultiSelectMode()},scrollIntoView:"cursor",readOnly:!0,isAvailable:function(e){return e&&e.inMultiSelectMode}}];var r=e("../keyboard/hash_handler").HashHandler;t.keyboardHandler=new r(t.multiSelectCommands)}),ace.define("ace/multi_select",["require","exports","module","ace/range_list","ace/range","ace/selection","ace/mouse/multi_select_handler","ace/lib/event","ace/lib/lang","ace/commands/multi_select_commands","ace/search","ace/edit_session","ace/editor","ace/config"],function(e,t,n){function h(e,t,n){return c.$options.wrap=!0,c.$options.needle=t,c.$options.backwards=n==-1,c.find(e)}function v(e,t){return e.row==t.row&&e.column==t.column}function m(e){if(e.$multiselectOnSessionChange)return;e.$onAddRange=e.$onAddRange.bind(e),e.$onRemoveRange=e.$onRemoveRange.bind(e),e.$onMultiSelect=e.$onMultiSelect.bind(e),e.$onSingleSelect=e.$onSingleSelect.bind(e),e.$multiselectOnSessionChange=t.onSessionChange.bind(e),e.$checkMultiselectChange=e.$checkMultiselectChange.bind(e),e.$multiselectOnSessionChange(e),e.on("changeSession",e.$multiselectOnSessionChange),e.on("mousedown",o),e.commands.addCommands(f.defaultCommands),g(e)}function g(e){function r(t){n&&(e.renderer.setMouseCursor(""),n=!1)}var t=e.textInput.getElement(),n=!1;u.addListener(t,"keydown",function(t){var i=t.keyCode==18&&!(t.ctrlKey||t.shiftKey||t.metaKey);e.$blockSelectEnabled&&i?n||(e.renderer.setMouseCursor("crosshair"),n=!0):n&&r()}),u.addListener(t,"keyup",r),u.addListener(t,"blur",r)}var r=e("./range_list").RangeList,i=e("./range").Range,s=e("./selection").Selection,o=e("./mouse/multi_select_handler").onMouseDown,u=e("./lib/event"),a=e("./lib/lang"),f=e("./commands/multi_select_commands");t.commands=f.defaultCommands.concat(f.multiSelectCommands);var l=e("./search").Search,c=new l,p=e("./edit_session").EditSession;(function(){this.getSelectionMarkers=function(){return this.$selectionMarkers}}).call(p.prototype),function(){this.ranges=null,this.rangeList=null,this.addRange=function(e,t){if(!e)return;if(!this.inMultiSelectMode&&this.rangeCount===0){var n=this.toOrientedRange();this.rangeList.add(n),this.rangeList.add(e);if(this.rangeList.ranges.length!=2)return this.rangeList.removeAll(),t||this.fromOrientedRange(e);this.rangeList.removeAll(),this.rangeList.add(n),this.$onAddRange(n)}e.cursor||(e.cursor=e.end);var r=this.rangeList.add(e);return this.$onAddRange(e),r.length&&this.$onRemoveRange(r),this.rangeCount>1&&!this.inMultiSelectMode&&(this._signal("multiSelect"),this.inMultiSelectMode=!0,this.session.$undoSelect=!1,this.rangeList.attach(this.session)),t||this.fromOrientedRange(e)},this.toSingleRange=function(e){e=e||this.ranges[0];var t=this.rangeList.removeAll();t.length&&this.$onRemoveRange(t),e&&this.fromOrientedRange(e)},this.substractPoint=function(e){var t=this.rangeList.substractPoint(e);if(t)return this.$onRemoveRange(t),t[0]},this.mergeOverlappingRanges=function(){var e=this.rangeList.merge();e.length&&this.$onRemoveRange(e)},this.$onAddRange=function(e){this.rangeCount=this.rangeList.ranges.length,this.ranges.unshift(e),this._signal("addRange",{range:e})},this.$onRemoveRange=function(e){this.rangeCount=this.rangeList.ranges.length;if(this.rangeCount==1&&this.inMultiSelectMode){var t=this.rangeList.ranges.pop();e.push(t),this.rangeCount=0}for(var n=e.length;n--;){var r=this.ranges.indexOf(e[n]);this.ranges.splice(r,1)}this._signal("removeRange",{ranges:e}),this.rangeCount===0&&this.inMultiSelectMode&&(this.inMultiSelectMode=!1,this._signal("singleSelect"),this.session.$undoSelect=!0,this.rangeList.detach(this.session)),t=t||this.ranges[0],t&&!t.isEqual(this.getRange())&&this.fromOrientedRange(t)},this.$initRangeList=function(){if(this.rangeList)return;this.rangeList=new r,this.ranges=[],this.rangeCount=0},this.getAllRanges=function(){return this.rangeCount?this.rangeList.ranges.concat():[this.getRange()]},this.splitIntoLines=function(){if(this.rangeCount>1){var e=this.rangeList.ranges,t=e[e.length-1],n=i.fromPoints(e[0].start,t.end);this.toSingleRange(),this.setSelectionRange(n,t.cursor==t.start)}else{var n=this.getRange(),r=this.isBackwards(),s=n.start.row,o=n.end.row;if(s==o){if(r)var u=n.end,a=n.start;else var u=n.start,a=n.end;this.addRange(i.fromPoints(a,a)),this.addRange(i.fromPoints(u,u));return}var f=[],l=this.getLineRange(s,!0);l.start.column=n.start.column,f.push(l);for(var c=s+1;c<o;c++)f.push(this.getLineRange(c,!0));l=this.getLineRange(o,!0),l.end.column=n.end.column,f.push(l),f.forEach(this.addRange,this)}},this.toggleBlockSelection=function(){if(this.rangeCount>1){var e=this.rangeList.ranges,t=e[e.length-1],n=i.fromPoints(e[0].start,t.end);this.toSingleRange(),this.setSelectionRange(n,t.cursor==t.start)}else{var r=this.session.documentToScreenPosition(this.cursor),s=this.session.documentToScreenPosition(this.anchor),o=this.rectangularRangeBlock(r,s);o.forEach(this.addRange,this)}},this.rectangularRangeBlock=function(e,t,n){var r=[],s=e.column<t.column;if(s)var o=e.column,u=t.column,a=e.offsetX,f=t.offsetX;else var o=t.column,u=e.column,a=t.offsetX,f=e.offsetX;var l=e.row<t.row;if(l)var c=e.row,h=t.row;else var c=t.row,h=e.row;o<0&&(o=0),c<0&&(c=0),c==h&&(n=!0);var p;for(var d=c;d<=h;d++){var m=i.fromPoints(this.session.screenToDocumentPosition(d,o,a),this.session.screenToDocumentPosition(d,u,f));if(m.isEmpty()){if(p&&v(m.end,p))break;p=m.end}m.cursor=s?m.start:m.end,r.push(m)}l&&r.reverse();if(!n){var g=r.length-1;while(r[g].isEmpty()&&g>0)g--;if(g>0){var y=0;while(r[y].isEmpty())y++}for(var b=g;b>=y;b--)r[b].isEmpty()&&r.splice(b,1)}return r}}.call(s.prototype);var d=e("./editor").Editor;(function(){this.updateSelectionMarkers=function(){this.renderer.updateCursor(),this.renderer.updateBackMarkers()},this.addSelectionMarker=function(e){e.cursor||(e.cursor=e.end);var t=this.getSelectionStyle();return e.marker=this.session.addMarker(e,"ace_selection",t),this.session.$selectionMarkers.push(e),this.session.selectionMarkerCount=this.session.$selectionMarkers.length,e},this.removeSelectionMarker=function(e){if(!e.marker)return;this.session.removeMarker(e.marker);var t=this.session.$selectionMarkers.indexOf(e);t!=-1&&this.session.$selectionMarkers.splice(t,1),this.session.selectionMarkerCount=this.session.$selectionMarkers.length},this.removeSelectionMarkers=function(e){var t=this.session.$selectionMarkers;for(var n=e.length;n--;){var r=e[n];if(!r.marker)continue;this.session.removeMarker(r.marker);var i=t.indexOf(r);i!=-1&&t.splice(i,1)}this.session.selectionMarkerCount=t.length},this.$onAddRange=function(e){this.addSelectionMarker(e.range),this.renderer.updateCursor(),this.renderer.updateBackMarkers()},this.$onRemoveRange=function(e){this.removeSelectionMarkers(e.ranges),this.renderer.updateCursor(),this.renderer.updateBackMarkers()},this.$onMultiSelect=function(e){if(this.inMultiSelectMode)return;this.inMultiSelectMode=!0,this.setStyle("ace_multiselect"),this.keyBinding.addKeyboardHandler(f.keyboardHandler),this.commands.setDefaultHandler("exec",this.$onMultiSelectExec),this.renderer.updateCursor(),this.renderer.updateBackMarkers()},this.$onSingleSelect=function(e){if(this.session.multiSelect.inVirtualMode)return;this.inMultiSelectMode=!1,this.unsetStyle("ace_multiselect"),this.keyBinding.removeKeyboardHandler(f.keyboardHandler),this.commands.removeDefaultHandler("exec",this.$onMultiSelectExec),this.renderer.updateCursor(),this.renderer.updateBackMarkers(),this._emit("changeSelection")},this.$onMultiSelectExec=function(e){var t=e.command,n=e.editor;if(!n.multiSelect)return;if(!t.multiSelectAction){var r=t.exec(n,e.args||{});n.multiSelect.addRange(n.multiSelect.toOrientedRange()),n.multiSelect.mergeOverlappingRanges()}else t.multiSelectAction=="forEach"?r=n.forEachSelection(t,e.args):t.multiSelectAction=="forEachLine"?r=n.forEachSelection(t,e.args,!0):t.multiSelectAction=="single"?(n.exitMultiSelectMode(),r=t.exec(n,e.args||{})):r=t.multiSelectAction(n,e.args||{});return r},this.forEachSelection=function(e,t,n){if(this.inVirtualSelectionMode)return;var r=n&&n.keepOrder,i=n==1||n&&n.$byLines,o=this.session,u=this.selection,a=u.rangeList,f=(r?u:a).ranges,l;if(!f.length)return e.exec?e.exec(this,t||{}):e(this,t||{});var c=u._eventRegistry;u._eventRegistry={};var h=new s(o);this.inVirtualSelectionMode=!0;for(var p=f.length;p--;){if(i)while(p>0&&f[p].start.row==f[p-1].end.row)p--;h.fromOrientedRange(f[p]),h.index=p,this.selection=o.selection=h;var d=e.exec?e.exec(this,t||{}):e(this,t||{});!l&&d!==undefined&&(l=d),h.toOrientedRange(f[p])}h.detach(),this.selection=o.selection=u,this.inVirtualSelectionMode=!1,u._eventRegistry=c,u.mergeOverlappingRanges(),u.ranges[0]&&u.fromOrientedRange(u.ranges[0]);var v=this.renderer.$scrollAnimation;return this.onCursorChange(),this.onSelectionChange(),v&&v.from==v.to&&this.renderer.animateScrolling(v.from),l},this.exitMultiSelectMode=function(){if(!this.inMultiSelectMode||this.inVirtualSelectionMode)return;this.multiSelect.toSingleRange()},this.getSelectedText=function(){var e="";if(this.inMultiSelectMode&&!this.inVirtualSelectionMode){var t=this.multiSelect.rangeList.ranges,n=[];for(var r=0;r<t.length;r++)n.push(this.session.getTextRange(t[r]));var i=this.session.getDocument().getNewLineCharacter();e=n.join(i),e.length==(n.length-1)*i.length&&(e="")}else this.selection.isEmpty()||(e=this.session.getTextRange(this.getSelectionRange()));return e},this.$checkMultiselectChange=function(e,t){if(this.inMultiSelectMode&&!this.inVirtualSelectionMode){var n=this.multiSelect.ranges[0];if(this.multiSelect.isEmpty()&&t==this.multiSelect.anchor)return;var r=t==this.multiSelect.anchor?n.cursor==n.start?n.end:n.start:n.cursor;r.row!=t.row||this.session.$clipPositionToDocument(r.row,r.column).column!=t.column?this.multiSelect.toSingleRange(this.multiSelect.toOrientedRange()):this.multiSelect.mergeOverlappingRanges()}},this.findAll=function(e,t,n){t=t||{},t.needle=e||t.needle;if(t.needle==undefined){var r=this.selection.isEmpty()?this.selection.getWordRange():this.selection.getRange();t.needle=this.session.getTextRange(r)}this.$search.set(t);var i=this.$search.findAll(this.session);if(!i.length)return 0;var s=this.multiSelect;n||s.toSingleRange(i[0]);for(var o=i.length;o--;)s.addRange(i[o],!0);return r&&s.rangeList.rangeAtPoint(r.start)&&s.addRange(r,!0),i.length},this.selectMoreLines=function(e,t){var n=this.selection.toOrientedRange(),r=n.cursor==n.end,s=this.session.documentToScreenPosition(n.cursor);this.selection.$desiredColumn&&(s.column=this.selection.$desiredColumn);var o=this.session.screenToDocumentPosition(s.row+e,s.column);if(!n.isEmpty())var u=this.session.documentToScreenPosition(r?n.end:n.start),a=this.session.screenToDocumentPosition(u.row+e,u.column);else var a=o;if(r){var f=i.fromPoints(o,a);f.cursor=f.start}else{var f=i.fromPoints(a,o);f.cursor=f.end}f.desiredColumn=s.column;if(!this.selection.inMultiSelectMode)this.selection.addRange(n);else if(t)var l=n.cursor;this.selection.addRange(f),l&&this.selection.substractPoint(l)},this.transposeSelections=function(e){var t=this.session,n=t.multiSelect,r=n.ranges;for(var i=r.length;i--;){var s=r[i];if(s.isEmpty()){var o=t.getWordRange(s.start.row,s.start.column);s.start.row=o.start.row,s.start.column=o.start.column,s.end.row=o.end.row,s.end.column=o.end.column}}n.mergeOverlappingRanges();var u=[];for(var i=r.length;i--;){var s=r[i];u.unshift(t.getTextRange(s))}e<0?u.unshift(u.pop()):u.push(u.shift());for(var i=r.length;i--;){var s=r[i],o=s.clone();t.replace(s,u[i]),s.start.row=o.start.row,s.start.column=o.start.column}n.fromOrientedRange(n.ranges[0])},this.selectMore=function(e,t,n){var r=this.session,i=r.multiSelect,s=i.toOrientedRange();if(s.isEmpty()){s=r.getWordRange(s.start.row,s.start.column),s.cursor=e==-1?s.start:s.end,this.multiSelect.addRange(s);if(n)return}var o=r.getTextRange(s),u=h(r,o,e);u&&(u.cursor=e==-1?u.start:u.end,this.session.unfold(u),this.multiSelect.addRange(u),this.renderer.scrollCursorIntoView(null,.5)),t&&this.multiSelect.substractPoint(s.cursor)},this.alignCursors=function(){var e=this.session,t=e.multiSelect,n=t.ranges,r=-1,s=n.filter(function(e){if(e.cursor.row==r)return!0;r=e.cursor.row});if(!n.length||s.length==n.length-1){var o=this.selection.getRange(),u=o.start.row,f=o.end.row,l=u==f;if(l){var c=this.session.getLength(),h;do h=this.session.getLine(f);while(/[=:]/.test(h)&&++f<c);do h=this.session.getLine(u);while(/[=:]/.test(h)&&--u>0);u<0&&(u=0),f>=c&&(f=c-1)}var p=this.session.removeFullLines(u,f);p=this.$reAlignText(p,l),this.session.insert({row:u,column:0},p.join("\n")+"\n"),l||(o.start.column=0,o.end.column=p[p.length-1].length),this.selection.setRange(o)}else{s.forEach(function(e){t.substractPoint(e.cursor)});var d=0,v=Infinity,m=n.map(function(t){var n=t.cursor,r=e.getLine(n.row),i=r.substr(n.column).search(/\S/g);return i==-1&&(i=0),n.column>d&&(d=n.column),i<v&&(v=i),i});n.forEach(function(t,n){var r=t.cursor,s=d-r.column,o=m[n]-v;s>o?e.insert(r,a.stringRepeat(" ",s-o)):e.remove(new i(r.row,r.column,r.row,r.column-s+o)),t.start.column=t.end.column=d,t.start.row=t.end.row=r.row,t.cursor=t.end}),t.fromOrientedRange(n[0]),this.renderer.updateCursor(),this.renderer.updateBackMarkers()}},this.$reAlignText=function(e,t){function u(e){return a.stringRepeat(" ",e)}function f(e){return e[2]?u(i)+e[2]+u(s-e[2].length+o)+e[4].replace(/^([=:])\s+/,"$1 "):e[0]}function l(e){return e[2]?u(i+s-e[2].length)+e[2]+u(o)+e[4].replace(/^([=:])\s+/,"$1 "):e[0]}function c(e){return e[2]?u(i)+e[2]+u(o)+e[4].replace(/^([=:])\s+/,"$1 "):e[0]}var n=!0,r=!0,i,s,o;return e.map(function(e){var t=e.match(/(\s*)(.*?)(\s*)([=:].*)/);return t?i==null?(i=t[1].length,s=t[2].length,o=t[3].length,t):(i+s+o!=t[1].length+t[2].length+t[3].length&&(r=!1),i!=t[1].length&&(n=!1),i>t[1].length&&(i=t[1].length),s<t[2].length&&(s=t[2].length),o>t[3].length&&(o=t[3].length),t):[e]}).map(t?f:n?r?l:f:c)}}).call(d.prototype),t.onSessionChange=function(e){var t=e.session;t&&!t.multiSelect&&(t.$selectionMarkers=[],t.selection.$initRangeList(),t.multiSelect=t.selection),this.multiSelect=t&&t.multiSelect;var n=e.oldSession;n&&(n.multiSelect.off("addRange",this.$onAddRange),n.multiSelect.off("removeRange",this.$onRemoveRange),n.multiSelect.off("multiSelect",this.$onMultiSelect),n.multiSelect.off("singleSelect",this.$onSingleSelect),n.multiSelect.lead.off("change",this.$checkMultiselectChange),n.multiSelect.anchor.off("change",this.$checkMultiselectChange)),t&&(t.multiSelect.on("addRange",this.$onAddRange),t.multiSelect.on("removeRange",this.$onRemoveRange),t.multiSelect.on("multiSelect",this.$onMultiSelect),t.multiSelect.on("singleSelect",this.$onSingleSelect),t.multiSelect.lead.on("change",this.$checkMultiselectChange),t.multiSelect.anchor.on("change",this.$checkMultiselectChange)),t&&this.inMultiSelectMode!=t.selection.inMultiSelectMode&&(t.selection.inMultiSelectMode?this.$onMultiSelect():this.$onSingleSelect())},t.MultiSelect=m,e("./config").defineOptions(d.prototype,"editor",{enableMultiselect:{set:function(e){m(this),e?(this.on("changeSession",this.$multiselectOnSessionChange),this.on("mousedown",o)):(this.off("changeSession",this.$multiselectOnSessionChange),this.off("mousedown",o))},value:!0},enableBlockSelect:{set:function(e){this.$blockSelectEnabled=e},value:!0}})}),ace.define("ace/mode/folding/fold_mode",["require","exports","module","ace/range"],function(e,t,n){"use strict";var r=e("../../range").Range,i=t.FoldMode=function(){};(function(){this.foldingStartMarker=null,this.foldingStopMarker=null,this.getFoldWidget=function(e,t,n){var r=e.getLine(n);return this.foldingStartMarker.test(r)?"start":t=="markbeginend"&&this.foldingStopMarker&&this.foldingStopMarker.test(r)?"end":""},this.getFoldWidgetRange=function(e,t,n){return null},this.indentationBlock=function(e,t,n){var i=/\S/,s=e.getLine(t),o=s.search(i);if(o==-1)return;var u=n||s.length,a=e.getLength(),f=t,l=t;while(++t<a){var c=e.getLine(t).search(i);if(c==-1)continue;if(c<=o)break;l=t}if(l>f){var h=e.getLine(l).length;return new r(f,u,l,h)}},this.openingBracketBlock=function(e,t,n,i,s){var o={row:n,column:i+1},u=e.$findClosingBracket(t,o,s);if(!u)return;var a=e.foldWidgets[u.row];return a==null&&(a=e.getFoldWidget(u.row)),a=="start"&&u.row>o.row&&(u.row--,u.column=e.getLine(u.row).length),r.fromPoints(o,u)},this.closingBracketBlock=function(e,t,n,i,s){var o={row:n,column:i},u=e.$findOpeningBracket(t,o);if(!u)return;return u.column++,o.column--,r.fromPoints(u,o)}}).call(i.prototype)}),ace.define("ace/theme/textmate",["require","exports","module","ace/lib/dom"],function(e,t,n){"use strict";t.isDark=!1,t.cssClass="ace-tm",t.cssText='.ace-tm .ace_gutter {background: #f0f0f0;color: #333;}.ace-tm .ace_print-margin {width: 1px;background: #e8e8e8;}.ace-tm .ace_fold {background-color: #6B72E6;}.ace-tm {background-color: #FFFFFF;color: black;}.ace-tm .ace_cursor {color: black;}.ace-tm .ace_invisible {color: rgb(191, 191, 191);}.ace-tm .ace_storage,.ace-tm .ace_keyword {color: blue;}.ace-tm .ace_constant {color: rgb(197, 6, 11);}.ace-tm .ace_constant.ace_buildin {color: rgb(88, 72, 246);}.ace-tm .ace_constant.ace_language {color: rgb(88, 92, 246);}.ace-tm .ace_constant.ace_library {color: rgb(6, 150, 14);}.ace-tm .ace_invalid {background-color: rgba(255, 0, 0, 0.1);color: red;}.ace-tm .ace_support.ace_function {color: rgb(60, 76, 114);}.ace-tm .ace_support.ace_constant {color: rgb(6, 150, 14);}.ace-tm .ace_support.ace_type,.ace-tm .ace_support.ace_class {color: rgb(109, 121, 222);}.ace-tm .ace_keyword.ace_operator {color: rgb(104, 118, 135);}.ace-tm .ace_string {color: rgb(3, 106, 7);}.ace-tm .ace_comment {color: rgb(76, 136, 107);}.ace-tm .ace_comment.ace_doc {color: rgb(0, 102, 255);}.ace-tm .ace_comment.ace_doc.ace_tag {color: rgb(128, 159, 191);}.ace-tm .ace_constant.ace_numeric {color: rgb(0, 0, 205);}.ace-tm .ace_variable {color: rgb(49, 132, 149);}.ace-tm .ace_xml-pe {color: rgb(104, 104, 91);}.ace-tm .ace_entity.ace_name.ace_function {color: #0000A2;}.ace-tm .ace_heading {color: rgb(12, 7, 255);}.ace-tm .ace_list {color:rgb(185, 6, 144);}.ace-tm .ace_meta.ace_tag {color:rgb(0, 22, 142);}.ace-tm .ace_string.ace_regex {color: rgb(255, 0, 0)}.ace-tm .ace_marker-layer .ace_selection {background: rgb(181, 213, 255);}.ace-tm.ace_multiselect .ace_selection.ace_start {box-shadow: 0 0 3px 0px white;}.ace-tm .ace_marker-layer .ace_step {background: rgb(252, 255, 0);}.ace-tm .ace_marker-layer .ace_stack {background: rgb(164, 229, 101);}.ace-tm .ace_marker-layer .ace_bracket {margin: -1px 0 0 -1px;border: 1px solid rgb(192, 192, 192);}.ace-tm .ace_marker-layer .ace_active-line {background: rgba(0, 0, 0, 0.07);}.ace-tm .ace_gutter-active-line {background-color : #dcdcdc;}.ace-tm .ace_marker-layer .ace_selected-word {background: rgb(250, 250, 255);border: 1px solid rgb(200, 200, 250);}.ace-tm .ace_indent-guide {background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==") right repeat-y;}',t.$id="ace/theme/textmate";var r=e("../lib/dom");r.importCssString(t.cssText,t.cssClass)}),ace.define("ace/line_widgets",["require","exports","module","ace/lib/oop","ace/lib/dom","ace/range"],function(e,t,n){"use strict";function o(e){this.session=e,this.session.widgetManager=this,this.session.getRowLength=this.getRowLength,this.session.$getWidgetScreenLength=this.$getWidgetScreenLength,this.updateOnChange=this.updateOnChange.bind(this),this.renderWidgets=this.renderWidgets.bind(this),this.measureWidgets=this.measureWidgets.bind(this),this.session._changedWidgets=[],this.$onChangeEditor=this.$onChangeEditor.bind(this),this.session.on("change",this.updateOnChange),this.session.on("changeFold",this.updateOnFold),this.session.on("changeEditor",this.$onChangeEditor)}var r=e("./lib/oop"),i=e("./lib/dom"),s=e("./range").Range;(function(){this.getRowLength=function(e){var t;return this.lineWidgets?t=this.lineWidgets[e]&&this.lineWidgets[e].rowCount||0:t=0,!this.$useWrapMode||!this.$wrapData[e]?1+t:this.$wrapData[e].length+1+t},this.$getWidgetScreenLength=function(){var e=0;return this.lineWidgets.forEach(function(t){t&&t.rowCount&&!t.hidden&&(e+=t.rowCount)}),e},this.$onChangeEditor=function(e){this.attach(e.editor)},this.attach=function(e){e&&e.widgetManager&&e.widgetManager!=this&&e.widgetManager.detach();if(this.editor==e)return;this.detach(),this.editor=e,e&&(e.widgetManager=this,e.renderer.on("beforeRender",this.measureWidgets),e.renderer.on("afterRender",this.renderWidgets))},this.detach=function(e){var t=this.editor;if(!t)return;this.editor=null,t.widgetManager=null,t.renderer.off("beforeRender",this.measureWidgets),t.renderer.off("afterRender",this.renderWidgets);var n=this.session.lineWidgets;n&&n.forEach(function(e){e&&e.el&&e.el.parentNode&&(e._inDocument=!1,e.el.parentNode.removeChild(e.el))})},this.updateOnFold=function(e,t){var n=t.lineWidgets;if(!n||!e.action)return;var r=e.data,i=r.start.row,s=r.end.row,o=e.action=="add";for(var u=i+1;u<s;u++)n[u]&&(n[u].hidden=o);n[s]&&(o?n[i]?n[s].hidden=o:n[i]=n[s]:(n[i]==n[s]&&(n[i]=undefined),n[s].hidden=o))},this.updateOnChange=function(e){var t=this.session.lineWidgets;if(!t)return;var n=e.start.row,r=e.end.row-n;if(r!==0)if(e.action=="remove"){var i=t.splice(n+1,r);i.forEach(function(e){e&&this.removeLineWidget(e)},this),this.$updateRows()}else{var s=new Array(r);s.unshift(n,0),t.splice.apply(t,s),this.$updateRows()}},this.$updateRows=function(){var e=this.session.lineWidgets;if(!e)return;var t=!0;e.forEach(function(e,n){if(e){t=!1,e.row=n;while(e.$oldWidget)e.$oldWidget.row=n,e=e.$oldWidget}}),t&&(this.session.lineWidgets=null)},this.addLineWidget=function(e){this.session.lineWidgets||(this.session.lineWidgets=new Array(this.session.getLength()));var t=this.session.lineWidgets[e.row];t&&(e.$oldWidget=t,t.el&&t.el.parentNode&&(t.el.parentNode.removeChild(t.el),t._inDocument=!1)),this.session.lineWidgets[e.row]=e,e.session=this.session;var n=this.editor.renderer;e.html&&!e.el&&(e.el=i.createElement("div"),e.el.innerHTML=e.html),e.el&&(i.addCssClass(e.el,"ace_lineWidgetContainer"),e.el.style.position="absolute",e.el.style.zIndex=5,n.container.appendChild(e.el),e._inDocument=!0),e.coverGutter||(e.el.style.zIndex=3),e.pixelHeight==null&&(e.pixelHeight=e.el.offsetHeight),e.rowCount==null&&(e.rowCount=e.pixelHeight/n.layerConfig.lineHeight);var r=this.session.getFoldAt(e.row,0);e.$fold=r;if(r){var s=this.session.lineWidgets;e.row==r.end.row&&!s[r.start.row]?s[r.start.row]=e:e.hidden=!0}return this.session._emit("changeFold",{data:{start:{row:e.row}}}),this.$updateRows(),this.renderWidgets(null,n),this.onWidgetChanged(e),e},this.removeLineWidget=function(e){e._inDocument=!1,e.session=null,e.el&&e.el.parentNode&&e.el.parentNode.removeChild(e.el);if(e.editor&&e.editor.destroy)try{e.editor.destroy()}catch(t){}if(this.session.lineWidgets){var n=this.session.lineWidgets[e.row];if(n==e)this.session.lineWidgets[e.row]=e.$oldWidget,e.$oldWidget&&this.onWidgetChanged(e.$oldWidget);else while(n){if(n.$oldWidget==e){n.$oldWidget=e.$oldWidget;break}n=n.$oldWidget}}this.session._emit("changeFold",{data:{start:{row:e.row}}}),this.$updateRows()},this.getWidgetsAtRow=function(e){var t=this.session.lineWidgets,n=t&&t[e],r=[];while(n)r.push(n),n=n.$oldWidget;return r},this.onWidgetChanged=function(e){this.session._changedWidgets.push(e),this.editor&&this.editor.renderer.updateFull()},this.measureWidgets=function(e,t){var n=this.session._changedWidgets,r=t.layerConfig;if(!n||!n.length)return;var i=Infinity;for(var s=0;s<n.length;s++){var o=n[s];if(!o||!o.el)continue;if(o.session!=this.session)continue;if(!o._inDocument){if(this.session.lineWidgets[o.row]!=o)continue;o._inDocument=!0,t.container.appendChild(o.el)}o.h=o.el.offsetHeight,o.fixedWidth||(o.w=o.el.offsetWidth,o.screenWidth=Math.ceil(o.w/r.characterWidth));var u=o.h/r.lineHeight;o.coverLine&&(u-=this.session.getRowLineCount(o.row),u<0&&(u=0)),o.rowCount!=u&&(o.rowCount=u,o.row<i&&(i=o.row))}i!=Infinity&&(this.session._emit("changeFold",{data:{start:{row:i}}}),this.session.lineWidgetWidth=null),this.session._changedWidgets=[]},this.renderWidgets=function(e,t){var n=t.layerConfig,r=this.session.lineWidgets;if(!r)return;var i=Math.min(this.firstRow,n.firstRow),s=Math.max(this.lastRow,n.lastRow,r.length);while(i>0&&!r[i])i--;this.firstRow=n.firstRow,this.lastRow=n.lastRow,t.$cursorLayer.config=n;for(var o=i;o<=s;o++){var u=r[o];if(!u||!u.el)continue;if(u.hidden){u.el.style.top=-100-(u.pixelHeight||0)+"px";continue}u._inDocument||(u._inDocument=!0,t.container.appendChild(u.el));var a=t.$cursorLayer.getPixelPosition({row:o,column:0},!0).top;u.coverLine||(a+=n.lineHeight*this.session.getRowLineCount(u.row)),u.el.style.top=a-n.offset+"px";var f=u.coverGutter?0:t.gutterWidth;u.fixedWidth||(f-=t.scrollLeft),u.el.style.left=f+"px",u.fullWidth&&u.screenWidth&&(u.el.style.minWidth=n.width+2*n.padding+"px"),u.fixedWidth?u.el.style.right=t.scrollBar.getWidth()+"px":u.el.style.right=""}}}).call(o.prototype),t.LineWidgets=o}),ace.define("ace/ext/error_marker",["require","exports","module","ace/line_widgets","ace/lib/dom","ace/range"],function(e,t,n){"use strict";function o(e,t,n){var r=0,i=e.length-1;while(r<=i){var s=r+i>>1,o=n(t,e[s]);if(o>0)r=s+1;else{if(!(o<0))return s;i=s-1}}return-(r+1)}function u(e,t,n){var r=e.getAnnotations().sort(s.comparePoints);if(!r.length)return;var i=o(r,{row:t,column:-1},s.comparePoints);i<0&&(i=-i-1),i>=r.length?i=n>0?0:r.length-1:i===0&&n<0&&(i=r.length-1);var u=r[i];if(!u||!n)return;if(u.row===t){do u=r[i+=n];while(u&&u.row===t);if(!u)return r.slice()}var a=[];t=u.row;do a[n<0?"unshift":"push"](u),u=r[i+=n];while(u&&u.row==t);return a.length&&a}var r=e("../line_widgets").LineWidgets,i=e("../lib/dom"),s=e("../range").Range;t.showErrorMarker=function(e,t){var n=e.session;n.widgetManager||(n.widgetManager=new r(n),n.widgetManager.attach(e));var s=e.getCursorPosition(),o=s.row,a=n.widgetManager.getWidgetsAtRow(o).filter(function(e){return e.type=="errorMarker"})[0];a?a.destroy():o-=t;var f=u(n,o,t),l;if(f){var c=f[0];s.column=(c.pos&&typeof c.column!="number"?c.pos.sc:c.column)||0,s.row=c.row,l=e.renderer.$gutterLayer.$annotations[s.row]}else{if(a)return;l={text:["Looks good!"],className:"ace_ok"}}e.session.unfold(s.row),e.selection.moveToPosition(s);var h={row:s.row,fixedWidth:!0,coverGutter:!0,el:i.createElement("div"),type:"errorMarker"},p=h.el.appendChild(i.createElement("div")),d=h.el.appendChild(i.createElement("div"));d.className="error_widget_arrow "+l.className;var v=e.renderer.$cursorLayer.getPixelPosition(s).left;d.style.left=v+e.renderer.gutterWidth-5+"px",h.el.className="error_widget_wrapper",p.className="error_widget "+l.className,p.innerHTML=l.text.join("<br>"),p.appendChild(i.createElement("div"));var m=function(e,t,n){if(t===0&&(n==="esc"||n==="return"))return h.destroy(),{command:"null"}};h.destroy=function(){if(e.$mouseHandler.isMousePressed)return;e.keyBinding.removeKeyboardHandler(m),n.widgetManager.removeLineWidget(h),e.off("changeSelection",h.destroy),e.off("changeSession",h.destroy),e.off("mouseup",h.destroy),e.off("change",h.destroy)},e.keyBinding.addKeyboardHandler(m),e.on("changeSelection",h.destroy),e.on("changeSession",h.destroy),e.on("mouseup",h.destroy),e.on("change",h.destroy),e.session.widgetManager.addLineWidget(h),h.el.onmousedown=e.focus.bind(e),e.renderer.scrollCursorIntoView(null,.5,{bottom:h.el.offsetHeight})},i.importCssString("    .error_widget_wrapper {        background: inherit;        color: inherit;        border:none    }    .error_widget {        border-top: solid 2px;        border-bottom: solid 2px;        margin: 5px 0;        padding: 10px 40px;        white-space: pre-wrap;    }    .error_widget.ace_error, .error_widget_arrow.ace_error{        border-color: #ff5a5a    }    .error_widget.ace_warning, .error_widget_arrow.ace_warning{        border-color: #F1D817    }    .error_widget.ace_info, .error_widget_arrow.ace_info{        border-color: #5a5a5a    }    .error_widget.ace_ok, .error_widget_arrow.ace_ok{        border-color: #5aaa5a    }    .error_widget_arrow {        position: absolute;        border: solid 5px;        border-top-color: transparent!important;        border-right-color: transparent!important;        border-left-color: transparent!important;        top: -5px;    }","")}),ace.define("ace/ace",["require","exports","module","ace/lib/fixoldbrowsers","ace/lib/dom","ace/lib/event","ace/range","ace/editor","ace/edit_session","ace/undomanager","ace/virtual_renderer","ace/worker/worker_client","ace/keyboard/hash_handler","ace/placeholder","ace/multi_select","ace/mode/folding/fold_mode","ace/theme/textmate","ace/ext/error_marker","ace/config"],function(e,t,n){"use strict";e("./lib/fixoldbrowsers");var r=e("./lib/dom"),i=e("./lib/event"),s=e("./range").Range,o=e("./editor").Editor,u=e("./edit_session").EditSession,a=e("./undomanager").UndoManager,f=e("./virtual_renderer").VirtualRenderer;e("./worker/worker_client"),e("./keyboard/hash_handler"),e("./placeholder"),e("./multi_select"),e("./mode/folding/fold_mode"),e("./theme/textmate"),e("./ext/error_marker"),t.config=e("./config"),t.require=e,typeof define=="function"&&(t.define=define),t.edit=function(e,n){if(typeof e=="string"){var s=e;e=document.getElementById(s);if(!e)throw new Error("ace.edit can't find div #"+s)}if(e&&e.env&&e.env.editor instanceof o)return e.env.editor;var u="";if(e&&/input|textarea/i.test(e.tagName)){var a=e;u=a.value,e=r.createElement("pre"),a.parentNode.replaceChild(e,a)}else e&&(u=e.textContent,e.innerHTML="");var l=t.createEditSession(u),c=new o(new f(e),l,n),h={document:l,editor:c,onResize:c.resize.bind(c,null)};return a&&(h.textarea=a),i.addListener(window,"resize",h.onResize),c.on("destroy",function(){i.removeListener(window,"resize",h.onResize),h.editor.container.env=null}),c.container.env=c.env=h,c},t.createEditSession=function(e,t){var n=new u(e,t);return n.setUndoManager(new a),n},t.Range=s,t.Editor=o,t.EditSession=u,t.UndoManager=a,t.VirtualRenderer=f,t.version="1.4.3"});            (function() {
                ace.require(["ace/ace"], function(a) {
                    if (a) {
                        a.config.init(true);
                        a.define = ace.define;
                    }
                    if (!window.ace)
                        window.ace = a;
                    for (var key in a) if (a.hasOwnProperty(key))
                        window.ace[key] = a[key];
                    window.ace["default"] = window.ace;
                    if (typeof module == "object" && typeof exports == "object" && module) {
                        module.exports = window.ace;
                    }
                });
            })();
        
ace.define("ace/mode/python_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text_highlight_rules").TextHighlightRules,s=function(){var e="and|as|assert|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|not|or|pass|print|raise|return|try|while|with|yield|async|await|nonlocal",t="True|False|None|NotImplemented|Ellipsis|__debug__",n="abs|divmod|input|open|staticmethod|all|enumerate|int|ord|str|any|eval|isinstance|pow|sum|basestring|execfile|issubclass|print|super|binfile|bin|iter|property|tuple|bool|filter|len|range|type|bytearray|float|list|raw_input|unichr|callable|format|locals|reduce|unicode|chr|frozenset|long|reload|vars|classmethod|getattr|map|repr|xrange|cmp|globals|max|reversed|zip|compile|hasattr|memoryview|round|__import__|complex|hash|min|apply|delattr|help|next|setattr|set|buffer|dict|hex|object|slice|coerce|dir|id|oct|sorted|intern|ascii|breakpoint|bytes",r=this.createKeywordMapper({"invalid.deprecated":"debugger","support.function":n,"variable.language":"self|cls","constant.language":t,keyword:e},"identifier"),i="[uU]?",s="[rR]",o="[fF]",u="(?:[rR][fF]|[fF][rR])",a="(?:(?:[1-9]\\d*)|(?:0))",f="(?:0[oO]?[0-7]+)",l="(?:0[xX][\\dA-Fa-f]+)",c="(?:0[bB][01]+)",h="(?:"+a+"|"+f+"|"+l+"|"+c+")",p="(?:[eE][+-]?\\d+)",d="(?:\\.\\d+)",v="(?:\\d+)",m="(?:(?:"+v+"?"+d+")|(?:"+v+"\\.))",g="(?:(?:"+m+"|"+v+")"+p+")",y="(?:"+g+"|"+m+")",b="\\\\(x[0-9A-Fa-f]{2}|[0-7]{3}|[\\\\abfnrtv'\"]|U[0-9A-Fa-f]{8}|u[0-9A-Fa-f]{4})";this.$rules={start:[{token:"comment",regex:"#.*$"},{token:"string",regex:i+'"{3}',next:"qqstring3"},{token:"string",regex:i+'"(?=.)',next:"qqstring"},{token:"string",regex:i+"'{3}",next:"qstring3"},{token:"string",regex:i+"'(?=.)",next:"qstring"},{token:"string",regex:s+'"{3}',next:"rawqqstring3"},{token:"string",regex:s+'"(?=.)',next:"rawqqstring"},{token:"string",regex:s+"'{3}",next:"rawqstring3"},{token:"string",regex:s+"'(?=.)",next:"rawqstring"},{token:"string",regex:o+'"{3}',next:"fqqstring3"},{token:"string",regex:o+'"(?=.)',next:"fqqstring"},{token:"string",regex:o+"'{3}",next:"fqstring3"},{token:"string",regex:o+"'(?=.)",next:"fqstring"},{token:"string",regex:u+'"{3}',next:"rfqqstring3"},{token:"string",regex:u+'"(?=.)',next:"rfqqstring"},{token:"string",regex:u+"'{3}",next:"rfqstring3"},{token:"string",regex:u+"'(?=.)",next:"rfqstring"},{token:"keyword.operator",regex:"\\+|\\-|\\*|\\*\\*|\\/|\\/\\/|%|@|<<|>>|&|\\||\\^|~|<|>|<=|=>|==|!=|<>|="},{token:"punctuation",regex:",|:|;|\\->|\\+=|\\-=|\\*=|\\/=|\\/\\/=|%=|@=|&=|\\|=|^=|>>=|<<=|\\*\\*="},{token:"paren.lparen",regex:"[\\[\\(\\{]"},{token:"paren.rparen",regex:"[\\]\\)\\}]"},{token:"text",regex:"\\s+"},{include:"constants"}],qqstring3:[{token:"constant.language.escape",regex:b},{token:"string",regex:'"{3}',next:"start"},{defaultToken:"string"}],qstring3:[{token:"constant.language.escape",regex:b},{token:"string",regex:"'{3}",next:"start"},{defaultToken:"string"}],qqstring:[{token:"constant.language.escape",regex:b},{token:"string",regex:"\\\\$",next:"qqstring"},{token:"string",regex:'"|$',next:"start"},{defaultToken:"string"}],qstring:[{token:"constant.language.escape",regex:b},{token:"string",regex:"\\\\$",next:"qstring"},{token:"string",regex:"'|$",next:"start"},{defaultToken:"string"}],rawqqstring3:[{token:"string",regex:'"{3}',next:"start"},{defaultToken:"string"}],rawqstring3:[{token:"string",regex:"'{3}",next:"start"},{defaultToken:"string"}],rawqqstring:[{token:"string",regex:"\\\\$",next:"rawqqstring"},{token:"string",regex:'"|$',next:"start"},{defaultToken:"string"}],rawqstring:[{token:"string",regex:"\\\\$",next:"rawqstring"},{token:"string",regex:"'|$",next:"start"},{defaultToken:"string"}],fqqstring3:[{token:"constant.language.escape",regex:b},{token:"string",regex:'"{3}',next:"start"},{token:"paren.lparen",regex:"{",push:"fqstringParRules"},{defaultToken:"string"}],fqstring3:[{token:"constant.language.escape",regex:b},{token:"string",regex:"'{3}",next:"start"},{token:"paren.lparen",regex:"{",push:"fqstringParRules"},{defaultToken:"string"}],fqqstring:[{token:"constant.language.escape",regex:b},{token:"string",regex:"\\\\$",next:"fqqstring"},{token:"string",regex:'"|$',next:"start"},{token:"paren.lparen",regex:"{",push:"fqstringParRules"},{defaultToken:"string"}],fqstring:[{token:"constant.language.escape",regex:b},{token:"string",regex:"'|$",next:"start"},{token:"paren.lparen",regex:"{",push:"fqstringParRules"},{defaultToken:"string"}],rfqqstring3:[{token:"string",regex:'"{3}',next:"start"},{token:"paren.lparen",regex:"{",push:"fqstringParRules"},{defaultToken:"string"}],rfqstring3:[{token:"string",regex:"'{3}",next:"start"},{token:"paren.lparen",regex:"{",push:"fqstringParRules"},{defaultToken:"string"}],rfqqstring:[{token:"string",regex:"\\\\$",next:"rfqqstring"},{token:"string",regex:'"|$',next:"start"},{token:"paren.lparen",regex:"{",push:"fqstringParRules"},{defaultToken:"string"}],rfqstring:[{token:"string",regex:"'|$",next:"start"},{token:"paren.lparen",regex:"{",push:"fqstringParRules"},{defaultToken:"string"}],fqstringParRules:[{token:"paren.lparen",regex:"[\\[\\(]"},{token:"paren.rparen",regex:"[\\]\\)]"},{token:"string",regex:"\\s+"},{token:"string",regex:"'(.)*'"},{token:"string",regex:'"(.)*"'},{token:"function.support",regex:"(!s|!r|!a)"},{include:"constants"},{token:"paren.rparen",regex:"}",next:"pop"},{token:"paren.lparen",regex:"{",push:"fqstringParRules"}],constants:[{token:"constant.numeric",regex:"(?:"+y+"|\\d+)[jJ]\\b"},{token:"constant.numeric",regex:y},{token:"constant.numeric",regex:h+"[lL]\\b"},{token:"constant.numeric",regex:h+"\\b"},{token:["punctuation","function.support"],regex:"(\\.)([a-zA-Z_]+)\\b"},{token:r,regex:"[a-zA-Z_$][a-zA-Z0-9_$]*\\b"}]},this.normalizeRules()};r.inherits(s,i),t.PythonHighlightRules=s}),ace.define("ace/mode/folding/pythonic",["require","exports","module","ace/lib/oop","ace/mode/folding/fold_mode"],function(e,t,n){"use strict";var r=e("../../lib/oop"),i=e("./fold_mode").FoldMode,s=t.FoldMode=function(e){this.foldingStartMarker=new RegExp("([\\[{])(?:\\s*)$|("+e+")(?:\\s*)(?:#.*)?$")};r.inherits(s,i),function(){this.getFoldWidgetRange=function(e,t,n){var r=e.getLine(n),i=r.match(this.foldingStartMarker);if(i)return i[1]?this.openingBracketBlock(e,i[1],n,i.index):i[2]?this.indentationBlock(e,n,i.index+i[2].length):this.indentationBlock(e,n)}}.call(s.prototype)}),ace.define("ace/mode/python",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/python_highlight_rules","ace/mode/folding/pythonic","ace/range"],function(e,t,n){"use strict";var r=e("../lib/oop"),i=e("./text").Mode,s=e("./python_highlight_rules").PythonHighlightRules,o=e("./folding/pythonic").FoldMode,u=e("../range").Range,a=function(){this.HighlightRules=s,this.foldingRules=new o("\\:"),this.$behaviour=this.$defaultBehaviour};r.inherits(a,i),function(){this.lineCommentStart="#",this.getNextLineIndent=function(e,t,n){var r=this.$getIndent(t),i=this.getTokenizer().getLineTokens(t,e),s=i.tokens;if(s.length&&s[s.length-1].type=="comment")return r;if(e=="start"){var o=t.match(/^.*[\{\(\[:]\s*$/);o&&(r+=n)}return r};var e={pass:1,"return":1,raise:1,"break":1,"continue":1};this.checkOutdent=function(t,n,r){if(r!=="\r\n"&&r!=="\r"&&r!=="\n")return!1;var i=this.getTokenizer().getLineTokens(n.trim(),t).tokens;if(!i)return!1;do var s=i.pop();while(s&&(s.type=="comment"||s.type=="text"&&s.value.match(/^\s+$/)));return s?s.type=="keyword"&&e[s.value]:!1},this.autoOutdent=function(e,t,n){n+=1;var r=this.$getIndent(t.getLine(n)),i=t.getTabString();r.slice(-i.length)==i&&t.remove(new u(n,r.length-i.length,n,r.length))},this.$id="ace/mode/python"}.call(a.prototype),t.Mode=a});                (function() {
                    ace.require(["ace/mode/python"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            
(function(){function k(b,a){s[b]||(typeof console!=="undefined"&&typeof console.warn=="function"&&console.warn("[WARNING] "+b+" is deprecated and will be removed in version 1.0. Instead, use `"+a+"`."),s[b]=!0)}function t(b){b.localize=i.localize.bind(i);b.timezone=i.timezone.bind(i);b.utc=i.utc.bind(i)}function r(b,a,e){a&&a.days&&(e=a,a=void 0);e&&k("`"+g+"(format, [date], [locale])`","var s = "+g+".localize(locale); s(format, [date])");return(e?i.localize(e):i)(b,a)}function u(b,a,e){e?k("`"+g+
    ".strftime(format, [date], [locale])`","var s = "+g+".localize(locale); s(format, [date])"):k("`"+g+".strftime(format, [date])`",g+"(format, [date])");return(e?i.localize(e):i)(b,a)}function p(b,a,e){function g(b,c,h,a){for(var d="",f=null,e=!1,i=b.length,j=!1,o=0;o<i;o++){var n=b.charCodeAt(o);if(e===!0)if(n===45)f="";else if(n===95)f=" ";else if(n===48)f="0";else if(n===58)j&&typeof console!=="undefined"&&typeof console.warn=="function"&&console.warn("[WARNING] detected use of unsupported %:: or %::: modifiers to strftime"),
    j=!0;else{switch(n){case 65:d+=h.days[c.getDay()];break;case 66:d+=h.months[c.getMonth()];break;case 67:d+=l(Math.floor(c.getFullYear()/100),f);break;case 68:d+=g(h.formats.D,c,h,a);break;case 70:d+=g(h.formats.F,c,h,a);break;case 72:d+=l(c.getHours(),f);break;case 73:d+=l(v(c.getHours()),f);break;case 76:d+=Math.floor(a%1E3)>99?Math.floor(a%1E3):Math.floor(a%1E3)>9?"0"+Math.floor(a%1E3):"00"+Math.floor(a%1E3);break;case 77:d+=l(c.getMinutes(),f);break;case 80:d+=c.getHours()<12?h.am:h.pm;break;case 82:d+=
    g(h.formats.R,c,h,a);break;case 83:d+=l(c.getSeconds(),f);break;case 84:d+=g(h.formats.T,c,h,a);break;case 85:d+=l(w(c,"sunday"),f);break;case 87:d+=l(w(c,"monday"),f);break;case 88:d+=g(h.formats.X,c,h,a);break;case 89:d+=c.getFullYear();break;case 90:k&&m===0?d+="GMT":(f=c.toString().match(/\(([\w\s]+)\)/),d+=f&&f[1]||"");break;case 97:d+=h.shortDays[c.getDay()];break;case 98:d+=h.shortMonths[c.getMonth()];break;case 99:d+=g(h.formats.c,c,h,a);break;case 100:d+=l(c.getDate(),f);break;case 101:d+=
    l(c.getDate(),f==null?" ":f);break;case 104:d+=h.shortMonths[c.getMonth()];break;case 106:f=new Date(c.getFullYear(),0,1);f=Math.ceil((c.getTime()-f.getTime())/864E5);d+=f>99?f:f>9?"0"+f:"00"+f;break;case 107:d+=l(c.getHours(),f==null?" ":f);break;case 108:d+=l(v(c.getHours()),f==null?" ":f);break;case 109:d+=l(c.getMonth()+1,f);break;case 110:d+="\n";break;case 111:d+=String(c.getDate())+A(c.getDate());break;case 112:d+=c.getHours()<12?h.AM:h.PM;break;case 114:d+=g(h.formats.r,c,h,a);break;case 115:d+=
    Math.floor(a/1E3);break;case 116:d+="\t";break;case 117:f=c.getDay();d+=f===0?7:f;break;case 118:d+=g(h.formats.v,c,h,a);break;case 119:d+=c.getDay();break;case 120:d+=g(h.formats.x,c,h,a);break;case 121:d+=(""+c.getFullYear()).slice(2);break;case 122:k&&m===0?d+=j?"+00:00":"+0000":(f=m!==0?m/6E4:-c.getTimezoneOffset(),e=j?":":"",n=Math.abs(f%60),d+=(f<0?"-":"+")+l(Math.floor(Math.abs(f/60)))+e+l(n));break;default:d+=b[o]}f=null;e=!1}else n===37?e=!0:d+=b[o]}return d}var i=b||x,m=a||0,k=e||!1,j=0,
    q,b=function(b,c){var a;c?(a=c.getTime(),k&&(c=new Date(c.getTime()+(c.getTimezoneOffset()||0)*6E4+m))):(a=Date.now(),a>j?(j=a,q=new Date(j),a=j,k&&(q=new Date(j+(q.getTimezoneOffset()||0)*6E4+m))):a=j,c=q);return g(b,c,i,a)};b.localize=function(a){return new p(a||i,m,k)};b.timezone=function(a){var c=m,b=k,e=typeof a;if(e==="number"||e==="string")b=!0,e==="string"?(c=a[0]==="-"?-1:1,e=parseInt(a.slice(1,3),10),a=parseInt(a.slice(3,5),10),c=c*(60*e+a)*6E4):e==="number"&&(c=a*6E4);return new p(i,c,
    b)};b.utc=function(){return new p(i,m,!0)};return b}function l(b,a){if(a===""||b>9)return b;a==null&&(a="0");return a+b}function v(b){if(b===0)return 12;else if(b>12)return b-12;return b}function w(b,a){var a=a||"sunday",e=b.getDay();a==="monday"&&(e===0?e=6:e--);var g=Date.UTC(b.getFullYear(),0,1),i=Date.UTC(b.getFullYear(),b.getMonth(),b.getDate());return Math.floor((Math.floor((i-g)/864E5)+7-e)/7)}function A(b){var a=b%10;b%=100;if(b>=11&&b<=13||a===0||a>=4)return"th";switch(a){case 1:return"st";
    case 2:return"nd";case 3:return"rd"}}var x={days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],AM:"AM",PM:"PM",am:"am",pm:"pm",formats:{D:"%m/%d/%y",F:"%Y-%m-%d",R:"%H:%M",T:"%H:%M:%S",X:"%T",c:"%a %b %d %X %Y",r:"%I:%M:%S %p",
        v:"%e-%b-%Y",x:"%D"}},i=new p(x,0,!1),y=typeof module!=="undefined",j;y?(j=module.exports=r,j.strftime=u):(j=function(){return this||(0,eval)("this")}(),j.strftime=r);var g=y?"require('strftime')":"strftime",s={};j.strftimeTZ=function(b,a,e,j){if((typeof e=="number"||typeof e=="string")&&j==null)j=e,e=void 0;e?k("`"+g+".strftimeTZ(format, date, locale, tz)`","var s = "+g+".localize(locale).timezone(tz); s(format, [date])` or `var s = "+g+".localize(locale); s.timezone(tz)(format, [date])"):k("`"+
    g+".strftimeTZ(format, date, tz)`","var s = "+g+".timezone(tz); s(format, [date])` or `"+g+".timezone(tz)(format, [date])");return(e?i.localize(e):i).timezone(j)(b,a)};j.strftimeUTC=function(b,a,e){e?k("`"+g+".strftimeUTC(format, date, locale)`","var s = "+g+".localize(locale).utc(); s(format, [date])"):k("`"+g+".strftimeUTC(format, [date])`","var s = "+g+".utc(); s(format, [date])");return(e?z.localize(e):z)(b,a)};j.localizedStrftime=function(b){k("`"+g+".localizedStrftime(locale)`",g+".localize(locale)");
    return i.localize(b)};t(r);t(u);var z=i.utc();if(typeof Date.now!=="function")Date.now=function(){return+new Date}})();
!function(){"use strict";var strptime=function(str,format,local){return strptime.parse(str,format,local)};strptime.version="0.0.1";var namespace;if(typeof module!=="undefined"){namespace=module.exports=strptime}else{namespace=function(){return this||(1,eval)("this")}()}namespace.strptime=strptime;!function(strptime){strptime.locale={a:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],A:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],b:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],B:["January","February","March","April","May","June","July","August","September","October","November","December"],f:["Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."],c:"%Y-%m-%d %H:%M:%S",P:["am","pm"],r:"%I:%M:%S %p",x:"%m/%d/%y",X:"%H:%M:%S",day:["Yesterday","Today","Tomorrow"],bg:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],Bg:["January","February","March","April","May","June","July","August","September","October","November","December"],fg:["Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."],Date_dBY_year_in_HM:"%#B %-d, %Y at %-H:%M",Date_dBY_year:"%#B %-d, %Y",Date_dBY:"%#B %-d, %Y",Date_AdBY:"%A, %#B %-d, %Y",Date_dBA:"%#B %-d, %A",Date_df_in_HM:"%#f, %-d at %-H:%M",Date_dfY:"%-d %#f %Y",Date_dB_in_HM:"%#B %-d at %-H:%M",Date_df:"%-d %#f"}}(strptime);!function(strptime){var inArray=Array.prototype.indexOf||function(el){var l=this.length;var i=0;while(i<l){if(el==this[i]){return i}i++}return-1};var locale=strptime.locale;var strRegNum2="[\\d\\s]?\\d";var strRegStr="\\S+";var specifiers={"%":"\\%",a:strRegStr,A:strRegStr,b:{reg:strRegStr,make:function(date,data,mod,gen){data=inArray.call(gen?locale.bg:locale.b,toLetterCaseReverse(data,mod));if(data===-1){return false}date.setUTCMonth(data);return true}},h:{reg:strRegStr,make:function(date,data,mod,gen){data=inArray.call(gen?locale.bg:locale.b,toLetterCaseReverse(data,mod));if(data===-1){return false}date.setUTCMonth(data);return true}},B:{reg:strRegStr,make:function(date,data,mod,gen){data=inArray.call(gen?locale.Bg:locale.B,toLetterCaseReverse(data,mod));if(data===-1){return false}date.setUTCMonth(data);return true}},f:{reg:strRegStr,make:function(date,data,mod,gen){data=inArray.call(gen?locale.fg:locale.f,toLetterCaseReverse(data,mod));if(data===-1){return false}date.setUTCMonth(data);return true}},g:{reg:strRegNum2,make:function(date,data){data=parseInt(data,10);if(data<0||data>99){return false}data=data+100*parseInt((new Date).getUTCFullYear()/100,10);date.setUTCFullYear(data);return true}},G:{reg:"\\d{4}",make:function(date,data){data=parseInt(data,10);date.setUTCFullYear(data);return true}},d:{reg:strRegNum2,make:function(date,data){data=parseInt(data,10);if(data<1||data>31){return false}date.setUTCDate(data);return true}},e:{reg:strRegNum2,make:function(date,data){data=parseInt(data,10);if(data<1||data>31){return false}date.setUTCDate(data);return true}},H:{reg:strRegNum2,make:function(date,data){data=parseInt(data,10);if(data<0||data>23){return false}date.setUTCHours(data);return true}},I:{reg:strRegNum2,make:function(date,data){data=parseInt(data,10);if(data<1||data>12){return false}date.setUTCHours(date.getUTCHours()+data);return true}},m:{reg:strRegNum2,make:function(date,data){data=parseInt(data,10);if(data<1||data>12){return false}date.setUTCMonth(data-1);return true}},M:{reg:strRegNum2,make:function(date,data){data=parseInt(data,10);if(data<0||data>59){return false}date.setUTCMinutes(data);return true}},n:"\\n",p:{reg:strRegStr,make:function(date,data){data=inArray.call(locale.P,data.toLowerCase());if(data===-1){return false}if(data===1){date.setUTCHours(date.getUTCHours()+12)}return true}},P:{reg:strRegStr,make:function(date,data){data=inArray.call(locale.P,data.toLowerCase());if(data===-1){return false}if(data===1){date.setUTCHours(date.getUTCHours()+12)}return true}},S:{reg:strRegNum2,make:function(date,data){data=parseInt(data,10);if(data<0||data>60){return false}date.setUTCSeconds(data);return true}},t:"\\t",u:"\\d",U:strRegNum2,w:"\\d",W:strRegNum2,y:{reg:strRegNum2,make:function(date,data){data=parseInt(data,10);if(data<0||data>99){return false}data=data+100*parseInt((new Date).getUTCFullYear()/100,10);date.setUTCFullYear(data);return true}},Y:{reg:"\\d{4}",make:function(date,data){data=parseInt(data,10);date.setUTCFullYear(data);return true}},z:{reg:"[+\\-]\\d{4}",make:function(date,data){var m=data.match(/^([+\-])(\d{2})(\d{2})$/);if(!m){return false}var offset=(parseInt(m[2],10)*60+parseInt(m[3],10))*6e4;if(m[1]==="+"){offset=-offset}date.setTime(date.getTime()+offset);return true}},l:{reg:strRegNum2,make:function(date,data){data=parseInt(data,10);if(data<1||data>12){return false}date.setUTCHours(date.getUTCHours()+data);return true}},s:{reg:"\\d+",make:function(date,data){data=parseInt(data,10);date.setTime(data*1e3);return true}},c:locale.c,r:locale.r,R:"%H:%M",T:"%H:%M:%S",x:locale.x,X:locale.X,D:"%m/%d/%y",F:"%Y-%m-%d",Date_iso:"%Y-%m-%dT%H:%M:%S",Date_dBY_year_in_HM:locale.Date_dBY_year_in_HM,Date_dBY_year:locale.Date_dBY_year,Date_dBY:locale.Date_dBY,Date_dBA:locale.Date_dBA,Date_AdBY:locale.Date_AdBY,Date_df_in_HM:locale.Date_df_in_HM,Date_dfY:locale.Date_dfY,Date_dB_in_HM:locale.Date_dB_in_HM,Date_dmY__dot:"%d.%m.%Y",Date_df:locale.Date_df,Date_FT:"%F %T",Date_dmY__minus:"%d-%m-%Y"};strptime.parse=function(str,format,local){str=String(str);format=String(format);var loop=5;while(/%(Date_[a-zA-Z0-9_]+|[cDFrRTxX])/g.test(format)&&loop){format=format.replace(/%(Date_[a-zA-Z0-9_]+|[cDFrRTxX])/,formatTransform);loop--}formatTransform.make=[];var reg=format.replace(/%(([#\^!~]{0,2})[aAbBfh]|([0\-_]?)[degHImMSVWyl]|[GnpPtuUwYzZs%])/g,formatTransform);var match=str.match(new RegExp(reg));if(!match||!formatTransform.make.length){return null}var date=new Date(Date.UTC(0,0));for(var i=0,l=formatTransform.make.length;i<l;i++){var build=formatTransform.make[i];if(!build[0](date,match[i+1],build[1],build[2])){return null}}if(local){date.setTime(date.getTime()+date.getTimezoneOffset()*6e4)}return date};function formatTransform(_,spec,mod,numPad,pos,str){spec=String(spec);mod=String(mod);spec=spec.replace(/^[#_0\^\-!~]+/,"");var s=specifiers[spec];if(!s){return _}var genitive=false;if(mod.indexOf("!")===-1&&spec.length===1&&(mod.indexOf("~")>-1||"bBf".indexOf(spec)>-1&&/%[0\-_]?d[\s]+$/.test(str.substr(0,pos)))){genitive=true}if((spec==="I"||spec==="l")&&!/%[pP]/.test(str)){throw new Error("Undefined AM/PM")}switch(typeof s){case"function":return s();case"string":return s;case"object":formatTransform.make.push([s.make,mod,genitive]);return"("+s.reg+")";default:return _}}function toLetterCaseReverse(str,mode){str=String(str);mode=String(mode);if(mode.indexOf("#")!==-1){return str.substr(0,1).toUpperCase()+str.substr(1)}if(mode.indexOf("^")!==-1){return str.substr(0,1)+str.substr(1).toLowerCase()}return str}}(strptime)}();(function(){var COMPILED=!0,goog=goog||{};goog.global=this;goog.exportPath_=function(a,b,c){a=a.split(".");c=c||goog.global;a[0]in c||!c.execScript||c.execScript("var "+a[0]);for(var d;a.length&&(d=a.shift());)a.length||void 0===b?c=c[d]?c[d]:c[d]={}:c[d]=b};goog.define=function(a,b){var c=b;COMPILED||goog.global.CLOSURE_DEFINES&&Object.prototype.hasOwnProperty.call(goog.global.CLOSURE_DEFINES,a)&&(c=goog.global.CLOSURE_DEFINES[a]);goog.exportPath_(a,c)};goog.DEBUG=!1;goog.LOCALE="en";goog.TRUSTED_SITE=!0;
    goog.provide=function(a){if(!COMPILED){if(goog.isProvided_(a))throw Error('Namespace "'+a+'" already declared.');delete goog.implicitNamespaces_[a];for(var b=a;(b=b.substring(0,b.lastIndexOf(".")))&&!goog.getObjectByName(b);)goog.implicitNamespaces_[b]=!0}goog.exportPath_(a)};goog.setTestOnly=function(a){if(COMPILED&&!goog.DEBUG)throw a=a||"",Error("Importing test-only code into non-debug environment"+a?": "+a:".");};
    COMPILED||(goog.isProvided_=function(a){return!goog.implicitNamespaces_[a]&&!!goog.getObjectByName(a)},goog.implicitNamespaces_={});goog.getObjectByName=function(a,b){for(var c=a.split("."),d=b||goog.global,e;e=c.shift();)if(goog.isDefAndNotNull(d[e]))d=d[e];else return null;return d};goog.globalize=function(a,b){var c=b||goog.global,d;for(d in a)c[d]=a[d]};
    goog.addDependency=function(a,b,c){if(goog.DEPENDENCIES_ENABLED){var d;a=a.replace(/\\/g,"/");for(var e=goog.dependencies_,f=0;d=b[f];f++)e.nameToPath[d]=a,a in e.pathToNames||(e.pathToNames[a]={}),e.pathToNames[a][d]=!0;for(d=0;b=c[d];d++)a in e.requires||(e.requires[a]={}),e.requires[a][b]=!0}};goog.ENABLE_DEBUG_LOADER=!0;
    goog.require=function(a){if(!COMPILED&&!goog.isProvided_(a)){if(goog.ENABLE_DEBUG_LOADER){var b=goog.getPathFromDeps_(a);if(b){goog.included_[b]=!0;goog.writeScripts_();return}}a="goog.require could not find: "+a;goog.global.console&&goog.global.console.error(a);throw Error(a);}};goog.basePath="";goog.nullFunction=function(){};goog.identityFunction=function(a,b){return a};goog.abstractMethod=function(){throw Error("unimplemented abstract method");};
    goog.addSingletonGetter=function(a){a.getInstance=function(){if(a.instance_)return a.instance_;goog.DEBUG&&(goog.instantiatedSingletons_[goog.instantiatedSingletons_.length]=a);return a.instance_=new a}};goog.instantiatedSingletons_=[];goog.DEPENDENCIES_ENABLED=!COMPILED&&goog.ENABLE_DEBUG_LOADER;
    goog.DEPENDENCIES_ENABLED&&(goog.included_={},goog.dependencies_={pathToNames:{},nameToPath:{},requires:{},visited:{},written:{}},goog.inHtmlDocument_=function(){var a=goog.global.document;return"undefined"!=typeof a&&"write"in a},goog.findBasePath_=function(){if(goog.global.CLOSURE_BASE_PATH)goog.basePath=goog.global.CLOSURE_BASE_PATH;else if(goog.inHtmlDocument_())for(var a=goog.global.document.getElementsByTagName("script"),b=a.length-1;0<=b;--b){var c=a[b].src,d=c.lastIndexOf("?"),d=-1==d?c.length:
        d;if("base.js"==c.substr(d-7,7)){goog.basePath=c.substr(0,d-7);break}}},goog.importScript_=function(a){var b=goog.global.CLOSURE_IMPORT_SCRIPT||goog.writeScriptTag_;!goog.dependencies_.written[a]&&b(a)&&(goog.dependencies_.written[a]=!0)},goog.writeScriptTag_=function(a){if(goog.inHtmlDocument_()){var b=goog.global.document;if("complete"==b.readyState){if(/\bdeps.js$/.test(a))return!1;throw Error('Cannot write "'+a+'" after document load');}b.write('<script type="text/javascript" src="'+a+'">\x3c/script>');
        return!0}return!1},goog.writeScripts_=function(){function a(e){if(!(e in d.written)){if(!(e in d.visited)&&(d.visited[e]=!0,e in d.requires))for(var g in d.requires[e])if(!goog.isProvided_(g))if(g in d.nameToPath)a(d.nameToPath[g]);else throw Error("Undefined nameToPath for "+g);e in c||(c[e]=!0,b.push(e))}}var b=[],c={},d=goog.dependencies_,e;for(e in goog.included_)d.written[e]||a(e);for(e=0;e<b.length;e++)if(b[e])goog.importScript_(goog.basePath+b[e]);else throw Error("Undefined script input");
    },goog.getPathFromDeps_=function(a){return a in goog.dependencies_.nameToPath?goog.dependencies_.nameToPath[a]:null},goog.findBasePath_(),goog.global.CLOSURE_NO_DEPS||goog.importScript_(goog.basePath+"deps.js"));
    goog.typeOf=function(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
    else if("function"==b&&"undefined"==typeof a.call)return"object";return b};goog.isDef=function(a){return void 0!==a};goog.isNull=function(a){return null===a};goog.isDefAndNotNull=function(a){return null!=a};goog.isArray=function(a){return"array"==goog.typeOf(a)};goog.isArrayLike=function(a){var b=goog.typeOf(a);return"array"==b||"object"==b&&"number"==typeof a.length};goog.isDateLike=function(a){return goog.isObject(a)&&"function"==typeof a.getFullYear};goog.isString=function(a){return"string"==typeof a};
    goog.isBoolean=function(a){return"boolean"==typeof a};goog.isNumber=function(a){return"number"==typeof a};goog.isFunction=function(a){return"function"==goog.typeOf(a)};goog.isObject=function(a){var b=typeof a;return"object"==b&&null!=a||"function"==b};goog.getUid=function(a){return a[goog.UID_PROPERTY_]||(a[goog.UID_PROPERTY_]=++goog.uidCounter_)};goog.removeUid=function(a){"removeAttribute"in a&&a.removeAttribute(goog.UID_PROPERTY_);try{delete a[goog.UID_PROPERTY_]}catch(b){}};
    goog.UID_PROPERTY_="closure_uid_"+(1E9*Math.random()>>>0);goog.uidCounter_=0;goog.getHashCode=goog.getUid;goog.removeHashCode=goog.removeUid;goog.cloneObject=function(a){var b=goog.typeOf(a);if("object"==b||"array"==b){if(a.clone)return a.clone();var b="array"==b?[]:{},c;for(c in a)b[c]=goog.cloneObject(a[c]);return b}return a};goog.bindNative_=function(a,b,c){return a.call.apply(a.bind,arguments)};
    goog.bindJs_=function(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}};goog.bind=function(a,b,c){Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?goog.bind=goog.bindNative_:goog.bind=goog.bindJs_;return goog.bind.apply(null,arguments)};
    goog.partial=function(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var b=Array.prototype.slice.call(arguments);b.unshift.apply(b,c);return a.apply(this,b)}};goog.mixin=function(a,b){for(var c in b)a[c]=b[c]};goog.now=goog.TRUSTED_SITE&&Date.now||function(){return+new Date};
    goog.globalEval=function(a){if(goog.global.execScript)goog.global.execScript(a,"JavaScript");else if(goog.global.eval)if(null==goog.evalWorksForGlobals_&&(goog.global.eval("var _et_ = 1;"),"undefined"!=typeof goog.global._et_?(delete goog.global._et_,goog.evalWorksForGlobals_=!0):goog.evalWorksForGlobals_=!1),goog.evalWorksForGlobals_)goog.global.eval(a);else{var b=goog.global.document,c=b.createElement("script");c.type="text/javascript";c.defer=!1;c.appendChild(b.createTextNode(a));b.body.appendChild(c);
        b.body.removeChild(c)}else throw Error("goog.globalEval not available");};goog.evalWorksForGlobals_=null;goog.getCssName=function(a,b){var c=function(a){return goog.cssNameMapping_[a]||a},d=function(a){a=a.split("-");for(var b=[],d=0;d<a.length;d++)b.push(c(a[d]));return b.join("-")},d=goog.cssNameMapping_?"BY_WHOLE"==goog.cssNameMappingStyle_?c:d:function(a){return a};return b?a+"-"+d(b):d(a)};goog.setCssNameMapping=function(a,b){goog.cssNameMapping_=a;goog.cssNameMappingStyle_=b};
    !COMPILED&&goog.global.CLOSURE_CSS_NAME_MAPPING&&(goog.cssNameMapping_=goog.global.CLOSURE_CSS_NAME_MAPPING);goog.getMsg=function(a,b){var c=b||{},d;for(d in c){var e=(""+c[d]).replace(/\$/g,"$$$$");a=a.replace(RegExp("\\{\\$"+d+"\\}","gi"),e)}return a};goog.getMsgWithFallback=function(a,b){return a};goog.exportSymbol=function(a,b,c){goog.exportPath_(a,b,c)};goog.exportProperty=function(a,b,c){a[b]=c};
    goog.inherits=function(a,b){function c(){}c.prototype=b.prototype;a.superClass_=b.prototype;a.prototype=new c;a.prototype.constructor=a};
    goog.base=function(a,b,c){var d=arguments.callee.caller;if(goog.DEBUG&&!d)throw Error("arguments.caller not defined.  goog.base() expects not to be running in strict mode. See http://www.ecma-international.org/ecma-262/5.1/#sec-C");if(d.superClass_)return d.superClass_.constructor.apply(a,Array.prototype.slice.call(arguments,1));for(var e=Array.prototype.slice.call(arguments,2),f=!1,g=a.constructor;g;g=g.superClass_&&g.superClass_.constructor)if(g.prototype[b]===d)f=!0;else if(f)return g.prototype[b].apply(a,
        e);if(a[b]===d)return a.constructor.prototype[b].apply(a,e);throw Error("goog.base called from a method of one name to a method of a different name");};goog.scope=function(a){a.call(goog.global)};goog.string={};goog.string.Unicode={NBSP:"\u00a0"};goog.string.startsWith=function(a,b){return 0==a.lastIndexOf(b,0)};goog.string.endsWith=function(a,b){var c=a.length-b.length;return 0<=c&&a.indexOf(b,c)==c};goog.string.caseInsensitiveStartsWith=function(a,b){return 0==goog.string.caseInsensitiveCompare(b,a.substr(0,b.length))};goog.string.caseInsensitiveEndsWith=function(a,b){return 0==goog.string.caseInsensitiveCompare(b,a.substr(a.length-b.length,b.length))};
    goog.string.caseInsensitiveEquals=function(a,b){return a.toLowerCase()==b.toLowerCase()};goog.string.subs=function(a,b){for(var c=a.split("%s"),d="",e=Array.prototype.slice.call(arguments,1);e.length&&1<c.length;)d+=c.shift()+e.shift();return d+c.join("%s")};goog.string.collapseWhitespace=function(a){return a.replace(/[\s\xa0]+/g," ").replace(/^\s+|\s+$/g,"")};goog.string.isEmpty=function(a){return/^[\s\xa0]*$/.test(a)};goog.string.isEmptySafe=function(a){return goog.string.isEmpty(goog.string.makeSafe(a))};
    goog.string.isBreakingWhitespace=function(a){return!/[^\t\n\r ]/.test(a)};goog.string.isAlpha=function(a){return!/[^a-zA-Z]/.test(a)};goog.string.isNumeric=function(a){return!/[^0-9]/.test(a)};goog.string.isAlphaNumeric=function(a){return!/[^a-zA-Z0-9]/.test(a)};goog.string.isSpace=function(a){return" "==a};goog.string.isUnicodeChar=function(a){return 1==a.length&&" "<=a&&"~">=a||"\u0080"<=a&&"\ufffd">=a};goog.string.stripNewlines=function(a){return a.replace(/(\r\n|\r|\n)+/g," ")};
    goog.string.canonicalizeNewlines=function(a){return a.replace(/(\r\n|\r|\n)/g,"\n")};goog.string.normalizeWhitespace=function(a){return a.replace(/\xa0|\s/g," ")};goog.string.normalizeSpaces=function(a){return a.replace(/\xa0|[ \t]+/g," ")};goog.string.collapseBreakingSpaces=function(a){return a.replace(/[\t\r\n ]+/g," ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g,"")};goog.string.trim=function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")};
    goog.string.trimLeft=function(a){return a.replace(/^[\s\xa0]+/,"")};goog.string.trimRight=function(a){return a.replace(/[\s\xa0]+$/,"")};goog.string.caseInsensitiveCompare=function(a,b){var c=String(a).toLowerCase(),d=String(b).toLowerCase();return c<d?-1:c==d?0:1};goog.string.numerateCompareRegExp_=/(\.\d+)|(\d+)|(\D+)/g;
    goog.string.numerateCompare=function(a,b){if(a==b)return 0;if(!a)return-1;if(!b)return 1;for(var c=a.toLowerCase().match(goog.string.numerateCompareRegExp_),d=b.toLowerCase().match(goog.string.numerateCompareRegExp_),e=Math.min(c.length,d.length),f=0;f<e;f++){var g=c[f],h=d[f];if(g!=h)return c=parseInt(g,10),!isNaN(c)&&(d=parseInt(h,10),!isNaN(d)&&c-d)?c-d:g<h?-1:1}return c.length!=d.length?c.length-d.length:a<b?-1:1};goog.string.urlEncode=function(a){return encodeURIComponent(String(a))};
    goog.string.urlDecode=function(a){return decodeURIComponent(a.replace(/\+/g," "))};goog.string.newLineToBr=function(a,b){return a.replace(/(\r\n|\r|\n)/g,b?"<br />":"<br>")};
    goog.string.htmlEscape=function(a,b){if(b)return a.replace(goog.string.amperRe_,"&amp;").replace(goog.string.ltRe_,"&lt;").replace(goog.string.gtRe_,"&gt;").replace(goog.string.quotRe_,"&quot;");if(!goog.string.allRe_.test(a))return a;-1!=a.indexOf("&")&&(a=a.replace(goog.string.amperRe_,"&amp;"));-1!=a.indexOf("<")&&(a=a.replace(goog.string.ltRe_,"&lt;"));-1!=a.indexOf(">")&&(a=a.replace(goog.string.gtRe_,"&gt;"));-1!=a.indexOf('"')&&(a=a.replace(goog.string.quotRe_,"&quot;"));return a};
    goog.string.amperRe_=/&/g;goog.string.ltRe_=/</g;goog.string.gtRe_=/>/g;goog.string.quotRe_=/\"/g;goog.string.allRe_=/[&<>\"]/;goog.string.unescapeEntities=function(a){return goog.string.contains(a,"&")?"document"in goog.global?goog.string.unescapeEntitiesUsingDom_(a):goog.string.unescapePureXmlEntities_(a):a};
    goog.string.unescapeEntitiesUsingDom_=function(a){var b={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"'},c=document.createElement("div");return a.replace(goog.string.HTML_ENTITY_PATTERN_,function(a,e){var f=b[a];if(f)return f;if("#"==e.charAt(0)){var g=Number("0"+e.substr(1));isNaN(g)||(f=String.fromCharCode(g))}f||(c.innerHTML=a+" ",f=c.firstChild.nodeValue.slice(0,-1));return b[a]=f})};
    goog.string.unescapePureXmlEntities_=function(a){return a.replace(/&([^;]+);/g,function(a,c){switch(c){case "amp":return"&";case "lt":return"<";case "gt":return">";case "quot":return'"';default:if("#"==c.charAt(0)){var d=Number("0"+c.substr(1));if(!isNaN(d))return String.fromCharCode(d)}return a}})};goog.string.HTML_ENTITY_PATTERN_=/&([^;\s<&]+);?/g;goog.string.whitespaceEscape=function(a,b){return goog.string.newLineToBr(a.replace(/  /g," &#160;"),b)};
    goog.string.stripQuotes=function(a,b){for(var c=b.length,d=0;d<c;d++){var e=1==c?b:b.charAt(d);if(a.charAt(0)==e&&a.charAt(a.length-1)==e)return a.substring(1,a.length-1)}return a};goog.string.truncate=function(a,b,c){c&&(a=goog.string.unescapeEntities(a));a.length>b&&(a=a.substring(0,b-3)+"...");c&&(a=goog.string.htmlEscape(a));return a};
    goog.string.truncateMiddle=function(a,b,c,d){c&&(a=goog.string.unescapeEntities(a));if(d&&a.length>b){d>b&&(d=b);var e=a.length-d;a=a.substring(0,b-d)+"..."+a.substring(e)}else a.length>b&&(d=Math.floor(b/2),e=a.length-d,a=a.substring(0,d+b%2)+"..."+a.substring(e));c&&(a=goog.string.htmlEscape(a));return a};goog.string.specialEscapeChars_={"\x00":"\\0","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\x0B",'"':'\\"',"\\":"\\\\"};goog.string.jsEscapeCache_={"'":"\\'"};
    goog.string.quote=function(a){a=String(a);if(a.quote)return a.quote();for(var b=['"'],c=0;c<a.length;c++){var d=a.charAt(c),e=d.charCodeAt(0);b[c+1]=goog.string.specialEscapeChars_[d]||(31<e&&127>e?d:goog.string.escapeChar(d))}b.push('"');return b.join("")};goog.string.escapeString=function(a){for(var b=[],c=0;c<a.length;c++)b[c]=goog.string.escapeChar(a.charAt(c));return b.join("")};
    goog.string.escapeChar=function(a){if(a in goog.string.jsEscapeCache_)return goog.string.jsEscapeCache_[a];if(a in goog.string.specialEscapeChars_)return goog.string.jsEscapeCache_[a]=goog.string.specialEscapeChars_[a];var b=a,c=a.charCodeAt(0);if(31<c&&127>c)b=a;else{if(256>c){if(b="\\x",16>c||256<c)b+="0"}else b="\\u",4096>c&&(b+="0");b+=c.toString(16).toUpperCase()}return goog.string.jsEscapeCache_[a]=b};goog.string.toMap=function(a){for(var b={},c=0;c<a.length;c++)b[a.charAt(c)]=!0;return b};
    goog.string.contains=function(a,b){return-1!=a.indexOf(b)};goog.string.countOf=function(a,b){return a&&b?a.split(b).length-1:0};goog.string.removeAt=function(a,b,c){var d=a;0<=b&&(b<a.length&&0<c)&&(d=a.substr(0,b)+a.substr(b+c,a.length-b-c));return d};goog.string.remove=function(a,b){var c=RegExp(goog.string.regExpEscape(b),"");return a.replace(c,"")};goog.string.removeAll=function(a,b){var c=RegExp(goog.string.regExpEscape(b),"g");return a.replace(c,"")};
    goog.string.regExpEscape=function(a){return String(a).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g,"\\$1").replace(/\x08/g,"\\x08")};goog.string.repeat=function(a,b){return Array(b+1).join(a)};goog.string.padNumber=function(a,b,c){a=goog.isDef(c)?a.toFixed(c):String(a);c=a.indexOf(".");-1==c&&(c=a.length);return goog.string.repeat("0",Math.max(0,b-c))+a};goog.string.makeSafe=function(a){return null==a?"":String(a)};goog.string.buildString=function(a){return Array.prototype.join.call(arguments,"")};
    goog.string.getRandomString=function(){return Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^goog.now()).toString(36)};
    goog.string.compareVersions=function(a,b){for(var c=0,d=goog.string.trim(String(a)).split("."),e=goog.string.trim(String(b)).split("."),f=Math.max(d.length,e.length),g=0;0==c&&g<f;g++){var h=d[g]||"",k=e[g]||"",l=RegExp("(\\d*)(\\D*)","g"),m=RegExp("(\\d*)(\\D*)","g");do{var p=l.exec(h)||["","",""],n=m.exec(k)||["","",""];if(0==p[0].length&&0==n[0].length)break;var c=0==p[1].length?0:parseInt(p[1],10),r=0==n[1].length?0:parseInt(n[1],10),c=goog.string.compareElements_(c,r)||goog.string.compareElements_(0==
        p[2].length,0==n[2].length)||goog.string.compareElements_(p[2],n[2])}while(0==c)}return c};goog.string.compareElements_=function(a,b){return a<b?-1:a>b?1:0};goog.string.HASHCODE_MAX_=4294967296;goog.string.hashCode=function(a){for(var b=0,c=0;c<a.length;++c)b=31*b+a.charCodeAt(c),b%=goog.string.HASHCODE_MAX_;return b};goog.string.uniqueStringCounter_=2147483648*Math.random()|0;goog.string.createUniqueString=function(){return"goog_"+goog.string.uniqueStringCounter_++};
    goog.string.toNumber=function(a){var b=Number(a);return 0==b&&goog.string.isEmpty(a)?NaN:b};goog.string.isLowerCamelCase=function(a){return/^[a-z]+([A-Z][a-z]*)*$/.test(a)};goog.string.isUpperCamelCase=function(a){return/^([A-Z][a-z]*)+$/.test(a)};goog.string.toCamelCase=function(a){return String(a).replace(/\-([a-z])/g,function(a,c){return c.toUpperCase()})};goog.string.toSelectorCase=function(a){return String(a).replace(/([A-Z])/g,"-$1").toLowerCase()};
    goog.string.toTitleCase=function(a,b){var c=goog.isString(b)?goog.string.regExpEscape(b):"\\s";return a.replace(RegExp("(^"+(c?"|["+c+"]+":"")+")([a-z])","g"),function(a,b,c){return b+c.toUpperCase()})};goog.string.parseInt=function(a){isFinite(a)&&(a=String(a));return goog.isString(a)?/^\s*-?0x/i.test(a)?parseInt(a,16):parseInt(a,10):NaN};goog.string.splitLimit=function(a,b,c){a=a.split(b);for(var d=[];0<c&&a.length;)d.push(a.shift()),c--;a.length&&d.push(a.join(b));return d};goog.debug={};goog.debug.Error=function(a){Error.captureStackTrace?Error.captureStackTrace(this,goog.debug.Error):this.stack=Error().stack||"";a&&(this.message=String(a))};goog.inherits(goog.debug.Error,Error);goog.debug.Error.prototype.name="CustomError";goog.asserts={};goog.asserts.ENABLE_ASSERTS=goog.DEBUG;goog.asserts.AssertionError=function(a,b){b.unshift(a);goog.debug.Error.call(this,goog.string.subs.apply(null,b));b.shift();this.messagePattern=a};goog.inherits(goog.asserts.AssertionError,goog.debug.Error);goog.asserts.AssertionError.prototype.name="AssertionError";goog.asserts.doAssertFailure_=function(a,b,c,d){var e="Assertion failed";if(c)var e=e+(": "+c),f=d;else a&&(e+=": "+a,f=b);throw new goog.asserts.AssertionError(""+e,f||[]);};
    goog.asserts.assert=function(a,b,c){goog.asserts.ENABLE_ASSERTS&&!a&&goog.asserts.doAssertFailure_("",null,b,Array.prototype.slice.call(arguments,2));return a};goog.asserts.fail=function(a,b){if(goog.asserts.ENABLE_ASSERTS)throw new goog.asserts.AssertionError("Failure"+(a?": "+a:""),Array.prototype.slice.call(arguments,1));};
    goog.asserts.assertNumber=function(a,b,c){goog.asserts.ENABLE_ASSERTS&&!goog.isNumber(a)&&goog.asserts.doAssertFailure_("Expected number but got %s: %s.",[goog.typeOf(a),a],b,Array.prototype.slice.call(arguments,2));return a};goog.asserts.assertString=function(a,b,c){goog.asserts.ENABLE_ASSERTS&&!goog.isString(a)&&goog.asserts.doAssertFailure_("Expected string but got %s: %s.",[goog.typeOf(a),a],b,Array.prototype.slice.call(arguments,2));return a};
    goog.asserts.assertFunction=function(a,b,c){goog.asserts.ENABLE_ASSERTS&&!goog.isFunction(a)&&goog.asserts.doAssertFailure_("Expected function but got %s: %s.",[goog.typeOf(a),a],b,Array.prototype.slice.call(arguments,2));return a};goog.asserts.assertObject=function(a,b,c){goog.asserts.ENABLE_ASSERTS&&!goog.isObject(a)&&goog.asserts.doAssertFailure_("Expected object but got %s: %s.",[goog.typeOf(a),a],b,Array.prototype.slice.call(arguments,2));return a};
    goog.asserts.assertArray=function(a,b,c){goog.asserts.ENABLE_ASSERTS&&!goog.isArray(a)&&goog.asserts.doAssertFailure_("Expected array but got %s: %s.",[goog.typeOf(a),a],b,Array.prototype.slice.call(arguments,2));return a};goog.asserts.assertBoolean=function(a,b,c){goog.asserts.ENABLE_ASSERTS&&!goog.isBoolean(a)&&goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.",[goog.typeOf(a),a],b,Array.prototype.slice.call(arguments,2));return a};
    goog.asserts.assertInstanceof=function(a,b,c,d){!goog.asserts.ENABLE_ASSERTS||a instanceof b||goog.asserts.doAssertFailure_("instanceof check failed.",null,c,Array.prototype.slice.call(arguments,3));return a};goog.asserts.assertObjectPrototypeIsIntact=function(){for(var a in Object.prototype)goog.asserts.fail(a+" should not be enumerable in Object.prototype.")};(function(a){var b,c,d;(function(){var a={},f={};b=function(b,c,d){a[b]={deps:c,callback:d}};d=c=function(b){function h(a){if("."!==a.charAt(0))return a;a=a.split("/");for(var c=b.split("/").slice(0,-1),d=0,e=a.length;d<e;d++){var f=a[d];".."===f?c.pop():"."!==f&&c.push(f)}return c.join("/")}d._eak_seen=a;if(f[b])return f[b];f[b]={};if(!a[b])throw Error("Could not find module "+b);for(var k=a[b],l=k.deps,k=k.callback,m=[],p,n=0,r=l.length;n<r;n++)"exports"===l[n]?m.push(p={}):m.push(c(h(l[n])));l=
        k.apply(this,m);return f[b]=p||l}})();b("promise/all",["./utils","exports"],function(a,b){var c=a.isArray,d=a.isFunction;b.all=function(a){if(!c(a))throw new TypeError("You must pass an array to all.");return new this(function(b,c){function e(a){return function(c){f[a]=c;0===--g&&b(f)}}var f=[],g=a.length,q;0===g&&b([]);for(var t=0;t<a.length;t++)(q=a[t])&&d(q.then)?q.then(e(t),c):(f[t]=q,0===--g&&b(f))})}});b("promise/asap",["exports"],function(a){function b(){return function(){process.nextTick(d)}}
        function c(){return function(){k.setTimeout(d,1)}}function d(){for(var a=0;a<l.length;a++){var b=l[a];(0,b[0])(b[1])}l=[]}var k="undefined"!==typeof global?global:void 0===this?window:this,l=[],m;m="undefined"!==typeof process&&"[object process]"==={}.toString.call(process)?b():c();a.asap=function(a,b){1===l.push([a,b])&&m()}});b("promise/config",["exports"],function(a){var b={instrument:!1};a.config=b;a.configure=function(a,c){if(2===arguments.length)b[a]=c;else return b[a]}});b("promise/polyfill",
        ["./promise","./utils","exports"],function(b,c,d){var h=b.Promise,k=c.isFunction;d.polyfill=function(){var b;b="undefined"!==typeof global?global:"undefined"!==typeof window&&window.document?window:a;"Promise"in b&&"resolve"in b.Promise&&"reject"in b.Promise&&"all"in b.Promise&&"race"in b.Promise&&function(){var a;new b.Promise(function(b){a=b});return k(a)}()||(b.Promise=h)}});b("promise/promise","./config ./utils ./all ./race ./resolve ./reject ./asap exports".split(" "),function(a,b,c,d,k,l,m,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               p){function n(a){if(!C(a))throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");if(!(this instanceof n))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");this._subscribers=[];r(a,this)}function r(a,b){function c(a){z(b,a)}function d(a){w(b,a)}try{a(c,d)}catch(e){d(e)}}function q(a,b,c,d){var e=C(c),f,g,h,k;if(e)try{f=c(d),h=!0}catch(l){k=!0,g=l}else f=d,h=
        !0;v(b,f)||(e&&h?z(b,f):k?w(b,g):a===A?z(b,f):a===B&&w(b,f))}function t(a,b,c,d){a=a._subscribers;var e=a.length;a[e]=b;a[e+A]=c;a[e+B]=d}function y(a,b){for(var c,d,e=a._subscribers,f=a._detail,g=0;g<e.length;g+=3)c=e[g],d=e[g+b],q(b,c,d,f);a._subscribers=null}function v(a,b){var c=null,d;try{if(a===b)throw new TypeError("A promises callback cannot return that same promise.");if(K(b)&&(c=b.then,C(c)))return c.call(b,function(c){if(d)return!0;d=!0;b!==c?z(a,c):F(a,c)},function(b){if(d)return!0;d=
        !0;w(a,b)}),!0}catch(e){if(d)return!0;w(a,e);return!0}return!1}function z(a,b){a===b?F(a,b):v(a,b)||F(a,b)}function F(a,b){a._state===D&&(a._state=u,a._detail=b,s.async(E,a))}function w(a,b){a._state===D&&(a._state=u,a._detail=b,s.async(x,a))}function E(a){y(a,a._state=A)}function x(a){y(a,a._state=B)}var s=a.config,K=b.objectOrFunction,C=b.isFunction;a=c.all;d=d.race;k=k.resolve;l=l.reject;s.async=m.asap;var D=void 0,u=0,A=1,B=2;n.prototype={constructor:n,_state:void 0,_detail:void 0,_subscribers:void 0,
        then:function(a,b){var c=this,d=new this.constructor(function(){});if(this._state){var e=arguments;s.async(function(){q(c._state,d,e[c._state-1],c._detail)})}else t(this,d,a,b);return d},"catch":function(a){return this.then(null,a)}};n.all=a;n.race=d;n.resolve=k;n.reject=l;p.Promise=n});b("promise/race",["./utils","exports"],function(a,b){var c=a.isArray;b.race=function(a){if(!c(a))throw new TypeError("You must pass an array to race.");return new this(function(b,c){for(var d,e=0;e<a.length;e++)(d=
        a[e])&&"function"===typeof d.then?d.then(b,c):b(d)})}});b("promise/reject",["exports"],function(a){a.reject=function(a){return new this(function(b,c){c(a)})}});b("promise/resolve",["exports"],function(a){a.resolve=function(a){return a&&"object"===typeof a&&a.constructor===this?a:new this(function(b){b(a)})}});b("promise/utils",["exports"],function(a){function b(a){return"function"===typeof a}var c=Date.now||function(){return(new Date).getTime()};a.objectOrFunction=function(a){return b(a)||"object"===
        typeof a&&null!==a};a.isFunction=b;a.isArray=function(a){return"[object Array]"===Object.prototype.toString.call(a)};a.now=c});c("promise/polyfill").polyfill()})(this);var Sk=Sk||{};
    Sk.configure=function(a){Sk.output=a.output||Sk.output;goog.asserts.assert("function"===typeof Sk.output);Sk.debugout=a.debugout||Sk.debugout;goog.asserts.assert("function"===typeof Sk.debugout);Sk.uncaughtException=a.uncaughtException||Sk.uncaughtException;goog.asserts.assert("function"===typeof Sk.uncaughtException);Sk.read=a.read||Sk.read;goog.asserts.assert("function"===typeof Sk.read);Sk.timeoutMsg=a.timeoutMsg||Sk.timeoutMsg;goog.asserts.assert("function"===typeof Sk.timeoutMsg);goog.exportSymbol("Sk.timeoutMsg",
        Sk.timeoutMsg);Sk.sysargv=a.sysargv||Sk.sysargv;goog.asserts.assert(goog.isArrayLike(Sk.sysargv));Sk.python3=a.python3||Sk.python3;goog.asserts.assert("boolean"===typeof Sk.python3);Sk.imageProxy=a.imageProxy||"http://localhost:8080/320x";goog.asserts.assert("string"===typeof Sk.imageProxy);Sk.inputfun=a.inputfun||Sk.inputfun;goog.asserts.assert("function"===typeof Sk.inputfun);Sk.retainGlobals=a.retainglobals||!1;goog.asserts.assert("boolean"===typeof Sk.retainGlobals);Sk.debugging=a.debugging||
        !1;goog.asserts.assert("boolean"===typeof Sk.debugging);Sk.breakpoints=a.breakpoints||function(){return!0};goog.asserts.assert("function"===typeof Sk.breakpoints);Sk.setTimeout=a.setTimeout;void 0===Sk.setTimeout&&(Sk.setTimeout="function"===typeof setTimeout?setTimeout:function(a,c){a()});goog.asserts.assert("function"===typeof Sk.setTimeout);"execLimit"in a&&(Sk.execLimit=a.execLimit);"yieldLimit"in a&&(Sk.yieldLimit=a.yieldLimit);a.syspath&&(Sk.syspath=a.syspath,goog.asserts.assert(goog.isArrayLike(Sk.syspath)),
        Sk.realsyspath=void 0,Sk.sysmodules=new Sk.builtin.dict([]));Sk.misceval.softspace_=!1};goog.exportSymbol("Sk.configure",Sk.configure);Sk.uncaughtException=function(a){throw a;};goog.exportSymbol("Sk.uncaughtException",Sk.uncaughtException);Sk.timeoutMsg=function(){return"Program exceeded run time limit."};goog.exportSymbol("Sk.timeoutMsg",Sk.timeoutMsg);Sk.execLimit=Number.POSITIVE_INFINITY;Sk.yieldLimit=Number.POSITIVE_INFINITY;Sk.output=function(a){};
    Sk.read=function(a){throw"Sk.read has not been implemented";};Sk.sysargv=[];Sk.getSysArgv=function(){return Sk.sysargv};goog.exportSymbol("Sk.getSysArgv",Sk.getSysArgv);Sk.syspath=[];Sk.inBrowser=void 0!==goog.global.document;Sk.debugout=function(a){};
    (function(){void 0!==goog.global.write?Sk.output=goog.global.write:void 0!==goog.global.console&&void 0!==goog.global.console.log?Sk.output=function(a){goog.global.console.log(a)}:void 0!==goog.global.print&&(Sk.output=goog.global.print);void 0!==goog.global.print&&(Sk.debugout=goog.global.print)})();Sk.inBrowser||(goog.global.CLOSURE_IMPORT_SCRIPT=function(a){goog.global.eval(goog.global.read("support/closure-library/closure/goog/"+a));return!0});Sk.python3=!1;Sk.inputfun=function(a){return window.prompt(a)};
    goog.exportSymbol("Sk.python3",Sk.python3);goog.exportSymbol("Sk.inputfun",Sk.inputfun);void 0===Sk.builtin&&(Sk.builtin={});
    Sk.dunderToSkulpt={__eq__:"ob$eq",__ne__:"ob$ne",__lt__:"ob$lt",__le__:"ob$le",__gt__:"ob$gt",__ge__:"ob$ge",__hash__:"tp$hash",__abs__:"nb$abs",__neg__:"nb$negative",__pos__:"nb$positive",__int__:"nb$int_",__long__:"nb$lng",__float__:"nb$float_",__add__:"nb$add",__radd__:"nb$reflected_add",__sub__:"nb$subtract",__rsub__:"nb$reflected_subtract",__mul__:"nb$multiply",__rmul__:"nb$reflected_multiply",__div__:"nb$divide",__rdiv__:"nb$reflected_divide",__floordiv__:"nb$floor_divide",__rfloordiv__:"nb$reflected_floor_divide",
        __mod__:"nb$remainder",__rmod__:"nb$reflected_remainder",__divmod__:"nb$divmod",__rdivmod__:"nb$reflected_divmod",__pow__:"nb$power",__rpow__:"nb$reflected_power",__contains__:"sq$contains",__len__:"sq$length"};
    Sk.builtin.type=function(a,b,c){var d,e;if(void 0===b&&void 0===c)return a.ob$type;if("dict"!==c.tp$name)throw new Sk.builtin.TypeError("type() argument 3 must be dict, not "+Sk.abstr.typeName(c));if(!Sk.builtin.checkString(a))throw new Sk.builtin.TypeError("type() argument 1 must be str, not "+Sk.abstr.typeName(a));if("tuple"!==b.tp$name)throw new Sk.builtin.TypeError("type() argument 2 must be tuple, not "+Sk.abstr.typeName(b));d=function(a,b,c,e,f){var g,h=this;if(!(this instanceof d))return new d(a,
        b,c,e,f);e=e||[];h.$d=new Sk.builtin.dict([]);void 0!==d.prototype.tp$base&&(d.prototype.tp$base.sk$klass?d.prototype.tp$base.call(this,a,b,c,e.slice(),f):(g=e.slice(),g.unshift(d,this),Sk.abstr.superConstructor.apply(void 0,g)));g=Sk.builtin.type.typeLookup(h.ob$type,"__init__");return void 0!==g?(e.unshift(h),a=Sk.misceval.applyOrSuspend(g,a,b,c,e),function w(a){return a instanceof Sk.misceval.Suspension?f?new Sk.misceval.Suspension(w,a):Sk.misceval.retryOptionalSuspensionOrThrow(a):h}(a)):h};var f=
        Sk.ffi.remapToJs(a);e=!1;0===b.v.length&&Sk.python3&&(e=!0,Sk.abstr.setUpInheritance(f,d,Sk.builtin.object));var g,h,k,l=[];h=b.tp$iter();for(g=h.tp$iternext();void 0!==g;g=h.tp$iternext())if(void 0===k&&(k=g),g.prototype instanceof Sk.builtin.object||g===Sk.builtin.object){for(;g.sk$klass&&g.prototype.tp$base;)g=g.prototype.tp$base;!g.sk$klass&&0>l.indexOf(g)&&l.push(g);e=!0}if(1<l.length)throw new Sk.builtin.TypeError("Multiple inheritance with more than one builtin type is unsupported");void 0!==
    k&&(goog.inherits(d,k),k.prototype instanceof Sk.builtin.object||k===Sk.builtin.object)&&(d.prototype.tp$base=k);d.prototype.tp$name=f;d.prototype.ob$type=Sk.builtin.type.makeIntoTypeObj(f,d);e||(d.prototype.tp$getattr=Sk.builtin.object.prototype.GenericGetAttr,d.prototype.tp$setattr=Sk.builtin.object.prototype.GenericSetAttr);var m=new Sk.builtin.str("__module__");void 0===c.mp$lookup(m)&&c.mp$ass_subscript(m,Sk.globals.__name__);h=c.tp$iter();for(g=h.tp$iternext();void 0!==g;g=h.tp$iternext())e=
        c.mp$subscript(g),void 0===e&&(e=null),d.prototype[g.v]=e,d[g.v]=e;d.__class__=d;d.__name__=a;d.sk$klass=!0;d.prototype.tp$descr_get=function(){goog.asserts.fail("in type tp$descr_get")};d.prototype.$r=function(){var a,b;a=this.tp$getattr("__repr__");if(void 0!==a&&a.im_func!==Sk.builtin.object.prototype.__repr__)return Sk.misceval.apply(a,void 0,void 0,void 0,[]);if(void 0!==d.prototype.tp$base&&d.prototype.tp$base!==Sk.builtin.object&&void 0!==d.prototype.tp$base.prototype.$r)return d.prototype.tp$base.prototype.$r.call(this);
        b=c.mp$subscript(m);a="";b&&(a=b.v+".");return new Sk.builtin.str("<"+a+f+" object>")};d.prototype.tp$str=function(){var a=this.tp$getattr("__str__");return void 0!==a&&a.im_func!==Sk.builtin.object.prototype.__str__?Sk.misceval.apply(a,void 0,void 0,void 0,[]):void 0!==d.prototype.tp$base&&d.prototype.tp$base!==Sk.builtin.object&&void 0!==d.prototype.tp$base.prototype.tp$str?d.prototype.tp$base.prototype.tp$str.call(this):this.$r()};d.prototype.tp$length=function(){var a;a=this.tp$getattr("__len__");
        if(void 0!==a)return Sk.misceval.apply(a,void 0,void 0,void 0,[]);a=Sk.abstr.typeName(this);throw new Sk.builtin.AttributeError(a+" instance has no attribute '__len__'");};d.prototype.tp$call=function(a,b){var c=this.tp$getattr("__call__");if(c)return Sk.misceval.apply(c,void 0,void 0,b,a);throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(this)+"' object is not callable");};d.prototype.tp$iter=function(){var a;a=this.tp$getattr("__iter__");var b=Sk.abstr.typeName(this);if(a)return a=Sk.misceval.callsim(a);
        throw new Sk.builtin.TypeError("'"+b+"' object is not iterable");};d.prototype.tp$iternext=function(a){var b,c=this.tp$getattr("next");if(c)return b=Sk.misceval.tryCatch(function(){return Sk.misceval.callsimOrSuspend(c)},function(a){if(!(a instanceof Sk.builtin.StopIteration))throw a;}),a?b:Sk.misceval.retryOptionalSuspensionOrThrow(b)};d.prototype.tp$getitem=function(a,b){var c=this.tp$getattr("__getitem__");if(void 0!==c)return c=Sk.misceval.applyOrSuspend(c,void 0,void 0,void 0,[a]),b?c:Sk.misceval.retryOptionalSuspensionOrThrow(c);
        throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(this)+"' object does not support indexing");};d.prototype.tp$setitem=function(a,b,c){var d=this.tp$getattr("__setitem__");if(void 0!==d)return a=Sk.misceval.applyOrSuspend(d,void 0,void 0,void 0,[a,b]),c?a:Sk.misceval.retryOptionalSuspensionOrThrow(a);throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(this)+"' object does not support item assignment");};b&&(d.$d=new Sk.builtin.dict([]),d.$d.mp$ass_subscript(Sk.builtin.type.basesStr_,b),a=Sk.builtin.type.buildMRO(d),
        d.$d.mp$ass_subscript(Sk.builtin.type.mroStr_,a),d.tp$mro=a);d.tp$setattr=Sk.builtin.type.prototype.tp$setattr;a=function(a,b,c){d.prototype[a]=function(){var a=Array.prototype.slice.call(arguments);a.unshift(c,this);return Sk.misceval.callsim.apply(void 0,a)}};for(var p in Sk.dunderToSkulpt)b=Sk.dunderToSkulpt[p],d[p]&&a(b,p,d[p]);return d};Sk.builtin.type.makeTypeObj=function(a,b){Sk.builtin.type.makeIntoTypeObj(a,b);return b};
    Sk.builtin.type.makeIntoTypeObj=function(a,b){goog.asserts.assert(void 0!==a);goog.asserts.assert(void 0!==b);b.ob$type=Sk.builtin.type;b.tp$name=a;b.$r=function(){var a,d=b.__module__,e="";d&&(e=d.v+".");a="class";d||(b.sk$klass||Sk.python3)||(a="type");return new Sk.builtin.str("<"+a+" '"+e+b.tp$name+"'>")};b.tp$str=void 0;b.tp$getattr=Sk.builtin.type.prototype.tp$getattr;b.tp$setattr=Sk.builtin.object.prototype.GenericSetAttr;b.tp$richcompare=Sk.builtin.type.prototype.tp$richcompare;b.sk$type=
        !0;return b};Sk.builtin.type.ob$type=Sk.builtin.type;Sk.builtin.type.tp$name="type";Sk.builtin.type.$r=function(){return Sk.python3?new Sk.builtin.str("<class 'type'>"):new Sk.builtin.str("<type 'type'>")};Sk.builtin.type.prototype.tp$getattr=function(a){var b,c;if(this.$d&&(b=this.$d.mp$lookup(new Sk.builtin.str(a)),void 0!==b))return b;a=Sk.builtin.type.typeLookup(this,a);void 0!==a&&(null!==a&&void 0!==a.ob$type)&&(c=a.ob$type.tp$descr_get);if(c)return c.call(a,null,this);if(void 0!==a)return a};
    Sk.builtin.type.prototype.tp$setattr=function(a,b){this[a]=b};Sk.builtin.type.typeLookup=function(a,b){var c=a.tp$mro,d=new Sk.builtin.str(b),e,f,g;if(c)for(g=0;g<c.v.length;++g){e=c.v[g];if(e.hasOwnProperty(b))return e[b];f=e.$d.mp$lookup(d);if(void 0!==f)return f;if(e.prototype&&void 0!==e.prototype[b])return e.prototype[b]}else if(a.prototype)return a.prototype[b]};
    Sk.builtin.type.mroMerge_=function(a){for(var b,c,d,e,f,g,h=[];;){for(c=0;c<a.length&&(b=a[c],0===b.length);++c);if(c===a.length)return h;d=[];for(c=0;c<a.length;++c)if(b=a[c],0!==b.length){g=b[0];f=0;a:for(;f<a.length;++f)for(e=a[f],b=1;b<e.length;++b)if(e[b]===g)break a;f===a.length&&d.push(g)}if(0===d.length)throw new Sk.builtin.TypeError("Inconsistent precedences in type hierarchy");d=d[0];h.push(d);for(c=0;c<a.length;++c)b=a[c],0<b.length&&b[0]===d&&b.splice(0,1)}};
    Sk.builtin.type.buildMRO_=function(a){var b,c=[[a]],d=a.$d.mp$subscript(Sk.builtin.type.basesStr_);for(a=0;a<d.v.length;++a)c.push(Sk.builtin.type.buildMRO_(d.v[a]));b=[];for(a=0;a<d.v.length;++a)b.push(d.v[a]);c.push(b);return Sk.builtin.type.mroMerge_(c)};Sk.builtin.type.buildMRO=function(a){return new Sk.builtin.tuple(Sk.builtin.type.buildMRO_(a))};
    Sk.builtin.type.prototype.tp$richcompare=function(a,b){var c,d;if(a.ob$type==Sk.builtin.type&&this.$r&&a.$r)return d=this.$r(),c=a.$r(),d.tp$richcompare(c,b)};Sk.abstr={};Sk.abstr.typeName=function(a){return void 0!==a.tp$name?a.tp$name:"<invalid type>"};Sk.abstr.binop_type_error=function(a,b,c){a=Sk.abstr.typeName(a);b=Sk.abstr.typeName(b);throw new Sk.builtin.TypeError("unsupported operand type(s) for "+c+": '"+a+"' and '"+b+"'");};Sk.abstr.unop_type_error=function(a,b){var c=Sk.abstr.typeName(a);throw new Sk.builtin.TypeError("bad operand type for unary "+{UAdd:"+",USub:"-",Invert:"~"}[b]+": '"+c+"'");};
    Sk.abstr.boNameToSlotFuncLhs_=function(a,b){if(null!==a)switch(b){case "Add":return a.nb$add?a.nb$add:a.__add__;case "Sub":return a.nb$subtract?a.nb$subtract:a.__sub__;case "Mult":return a.nb$multiply?a.nb$multiply:a.__mul__;case "Div":return a.nb$divide?a.nb$divide:a.__div__;case "FloorDiv":return a.nb$floor_divide?a.nb$floor_divide:a.__floordiv__;case "Mod":return a.nb$remainder?a.nb$remainder:a.__mod__;case "DivMod":return a.nb$divmod?a.nb$divmod:a.__divmod__;case "Pow":return a.nb$power?a.nb$power:
        a.__pow__;case "LShift":return a.nb$lshift?a.nb$lshift:a.__lshift__;case "RShift":return a.nb$rshift?a.nb$rshift:a.__rshift__;case "BitAnd":return a.nb$and?a.nb$and:a.__and__;case "BitXor":return a.nb$xor?a.nb$xor:a.__xor__;case "BitOr":return a.nb$or?a.nb$or:a.__or__}};
    Sk.abstr.boNameToSlotFuncRhs_=function(a,b){if(null!==a)switch(b){case "Add":return a.nb$reflected_add?a.nb$reflected_add:a.__radd__;case "Sub":return a.nb$reflected_subtract?a.nb$reflected_subtract:a.__rsub__;case "Mult":return a.nb$reflected_multiply?a.nb$reflected_multiply:a.__rmul__;case "Div":return a.nb$reflected_divide?a.nb$reflected_divide:a.__rdiv__;case "FloorDiv":return a.nb$reflected_floor_divide?a.nb$reflected_floor_divide:a.__rfloordiv__;case "Mod":return a.nb$reflected_remainder?a.nb$reflected_remainder:
        a.__rmod__;case "DivMod":return a.nb$reflected_divmod?a.nb$reflected_divmod:a.__rdivmod__;case "Pow":return a.nb$reflected_power?a.nb$reflected_power:a.__rpow__;case "LShift":return a.nb$reflected_lshift?a.nb$reflected_lshift:a.__rlshift__;case "RShift":return a.nb$reflected_rshift?a.nb$reflected_rshift:a.__rrshift__;case "BitAnd":return a.nb$reflected_and?a.nb$reflected_and:a.__rand__;case "BitXor":return a.nb$reflected_xor?a.nb$reflected_xor:a.__rxor__;case "BitOr":return a.nb$reflected_or?a.nb$reflected_or:
        a.__ror__}};
    Sk.abstr.iboNameToSlotFunc_=function(a,b){switch(b){case "Add":return a.nb$inplace_add?a.nb$inplace_add:a.__iadd__;case "Sub":return a.nb$inplace_subtract?a.nb$inplace_subtract:a.__isub__;case "Mult":return a.nb$inplace_multiply?a.nb$inplace_multiply:a.__imul__;case "Div":return a.nb$inplace_divide?a.nb$inplace_divide:a.__idiv__;case "FloorDiv":return a.nb$inplace_floor_divide?a.nb$inplace_floor_divide:a.__ifloordiv__;case "Mod":return a.nb$inplace_remainder;case "Pow":return a.nb$inplace_power;case "LShift":return a.nb$inplace_lshift?
        a.nb$inplace_lshift:a.__ilshift__;case "RShift":return a.nb$inplace_rshift?a.nb$inplace_rshift:a.__irshift__;case "BitAnd":return a.nb$inplace_and;case "BitOr":return a.nb$inplace_or;case "BitXor":return a.nb$inplace_xor?a.nb$inplace_xor:a.__ixor__}};Sk.abstr.uoNameToSlotFunc_=function(a,b){if(null!==a)switch(b){case "USub":return a.nb$negative?a.nb$negative:a.__neg__;case "UAdd":return a.nb$positive?a.nb$positive:a.__pos__;case "Invert":return a.nb$invert?a.nb$invert:a.__invert__}};
    Sk.abstr.binary_op_=function(a,b,c){var d,e=b.constructor.prototype instanceof a.constructor;if(e&&(d=Sk.abstr.boNameToSlotFuncRhs_(b,c),void 0!==d&&(d=d.call?d.call(b,a):Sk.misceval.callsim(d,b,a),void 0!==d&&d!==Sk.builtin.NotImplemented.NotImplemented$)))return d;d=Sk.abstr.boNameToSlotFuncLhs_(a,c);if(void 0!==d&&(d=d.call?d.call(a,b):Sk.misceval.callsim(d,a,b),void 0!==d&&d!==Sk.builtin.NotImplemented.NotImplemented$)||!e&&(d=Sk.abstr.boNameToSlotFuncRhs_(b,c),void 0!==d&&(d=d.call?d.call(b,
        a):Sk.misceval.callsim(d,b,a),void 0!==d&&d!==Sk.builtin.NotImplemented.NotImplemented$)))return d;Sk.abstr.binop_type_error(a,b,c)};
    Sk.abstr.binary_iop_=function(a,b,c){var d;d=Sk.abstr.iboNameToSlotFunc_(a,c);if(void 0!==d&&(d=d.call?d.call(a,b):Sk.misceval.callsim(d,a,b),void 0!==d&&d!==Sk.builtin.NotImplemented.NotImplemented$))return d;d=Sk.abstr.iboNameToSlotFunc_(b,c);if(void 0!==d&&(d=d.call?d.call(b,a):Sk.misceval.callsim(d,b,a),void 0!==d&&d!==Sk.builtin.NotImplemented.NotImplemented$))return d;Sk.abstr.binop_type_error(a,b,c)};
    Sk.abstr.unary_op_=function(a,b){var c;c=Sk.abstr.uoNameToSlotFunc_(a,b);if(void 0!==c&&(c=c.call?c.call(a):Sk.misceval.callsim(c,a),void 0!==c))return c;Sk.abstr.unop_type_error(a,b)};
    Sk.abstr.numOpAndPromote=function(a,b,c){if(null!==a&&null!==b){if("number"===typeof a&&"number"===typeof b)return c=c(a,b),(c>Sk.builtin.int_.threshold$||c<-Sk.builtin.int_.threshold$)&&Math.floor(c)===c?[Sk.builtin.lng.fromInt$(a),Sk.builtin.lng.fromInt$(b)]:c;if(void 0===a||void 0===b)throw new Sk.builtin.NameError("Undefined variable in expression");if(a.constructor===Sk.builtin.lng)return[a,b];if(a.constructor!==Sk.builtin.int_&&a.constructor!==Sk.builtin.float_||b.constructor!==Sk.builtin.complex){if(a.constructor===
        Sk.builtin.int_||a.constructor===Sk.builtin.float_)return[a,b];if("number"===typeof a)return a=Sk.builtin.assk$(a),[a,b]}else return a=new Sk.builtin.complex(a),[a,b]}};
    Sk.abstr.boNumPromote_={Add:function(a,b){return a+b},Sub:function(a,b){return a-b},Mult:function(a,b){return a*b},Mod:function(a,b){var c;if(0===b)throw new Sk.builtin.ZeroDivisionError("division or modulo by zero");c=a%b;return 0>c*b?c+b:c},Div:function(a,b){if(0===b)throw new Sk.builtin.ZeroDivisionError("division or modulo by zero");return a/b},FloorDiv:function(a,b){if(0===b)throw new Sk.builtin.ZeroDivisionError("division or modulo by zero");return Math.floor(a/b)},Pow:Math.pow,BitAnd:function(a,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             b){var c=a&b;0>c&&(c+=4294967296);return c},BitOr:function(a,b){var c=a|b;0>c&&(c+=4294967296);return c},BitXor:function(a,b){var c=a^b;0>c&&(c+=4294967296);return c},LShift:function(a,b){var c;if(0>b)throw new Sk.builtin.ValueError("negative shift count");c=a<<b;return c>a?c:a*Math.pow(2,b)},RShift:function(a,b){var c;if(0>b)throw new Sk.builtin.ValueError("negative shift count");c=a>>b;0<a&&0>c&&(c&=Math.pow(2,32-b)-1);return c}};
    Sk.abstr.numberBinOp=function(a,b,c){var d;d=Sk.abstr.boNumPromote_[c];if(void 0!==d){d=Sk.abstr.numOpAndPromote(a,b,d);if("number"===typeof d)return d;if(void 0!==d&&d.constructor===Sk.builtin.int_||void 0!==d&&d.constructor===Sk.builtin.float_||void 0!==d&&d.constructor===Sk.builtin.lng)return d;void 0!==d&&(a=d[0],b=d[1])}return Sk.abstr.binary_op_(a,b,c)};goog.exportSymbol("Sk.abstr.numberBinOp",Sk.abstr.numberBinOp);
    Sk.abstr.numberInplaceBinOp=function(a,b,c){var d;d=Sk.abstr.boNumPromote_[c];if(void 0!==d){d=Sk.abstr.numOpAndPromote(a,b,d);if("number"===typeof d)return d;if(void 0!==d&&d.constructor===Sk.builtin.int_||void 0!==d&&d.constructor===Sk.builtin.float_||void 0!==d&&d.constructor===Sk.builtin.lng)return d;void 0!==d&&(a=d[0],b=d[1])}return Sk.abstr.binary_iop_(a,b,c)};goog.exportSymbol("Sk.abstr.numberInplaceBinOp",Sk.abstr.numberInplaceBinOp);
    Sk.abstr.numberUnaryOp=function(a,b){var c;if("Not"===b)return Sk.misceval.isTrue(a)?Sk.builtin.bool.false$:Sk.builtin.bool.true$;if(a instanceof Sk.builtin.bool){c=Sk.builtin.asnum$(a);if("USub"===b)return new Sk.builtin.int_(-c);if("UAdd"===b)return new Sk.builtin.int_(c);if("Invert"===b)return new Sk.builtin.int_(~c)}else{if("USub"===b&&a.nb$negative)return a.nb$negative();if("UAdd"===b&&a.nb$positive)return a.nb$positive();if("Invert"===b&&a.nb$invert)return a.nb$invert()}return Sk.abstr.unary_op_(a,
        b)};goog.exportSymbol("Sk.abstr.numberUnaryOp",Sk.abstr.numberUnaryOp);Sk.abstr.fixSeqIndex_=function(a,b){b=Sk.builtin.asnum$(b);0>b&&a.sq$length&&(b+=a.sq$length());return b};
    Sk.abstr.sequenceContains=function(a,b,c){var d;if(a.sq$contains)return a.sq$contains(b);d=Sk.abstr.lookupSpecial(a,"__contains__");if(null!=d)return Sk.misceval.isTrue(Sk.misceval.callsim(d,a,b));if(!Sk.builtin.checkIterable(a))throw c=Sk.abstr.typeName(a),new Sk.builtin.TypeError("argument of type '"+c+"' is not iterable");a=Sk.misceval.iterFor(Sk.abstr.iter(a),function(a){return Sk.misceval.richCompareBool(a,b,"Eq")?new Sk.misceval.Break(!0):!1},!1);return c?a:Sk.misceval.retryOptionalSuspensionOrThrow(a)};
    Sk.abstr.sequenceConcat=function(a,b){var c;if(a.sq$concat)return a.sq$concat(b);c=Sk.abstr.typeName(a);throw new Sk.builtin.TypeError("'"+c+"' object can't be concatenated");};
    Sk.abstr.sequenceGetIndexOf=function(a,b){var c,d,e;if(a.index)return Sk.misceval.callsim(a.index,a,b);if(Sk.builtin.checkIterable(a)){e=0;d=Sk.abstr.iter(a);for(c=d.tp$iternext();void 0!==c;c=d.tp$iternext()){if(Sk.misceval.richCompareBool(b,c,"Eq"))return new Sk.builtin.int_(e);e+=1}throw new Sk.builtin.ValueError("sequence.index(x): x not in sequence");}c=Sk.abstr.typeName(a);throw new Sk.builtin.TypeError("argument of type '"+c+"' is not iterable");};
    Sk.abstr.sequenceGetCountOf=function(a,b){var c,d,e;if(a.count)return Sk.misceval.callsim(a.count,a,b);if(Sk.builtin.checkIterable(a)){e=0;d=Sk.abstr.iter(a);for(c=d.tp$iternext();void 0!==c;c=d.tp$iternext())Sk.misceval.richCompareBool(b,c,"Eq")&&(e+=1);return new Sk.builtin.int_(e)}c=Sk.abstr.typeName(a);throw new Sk.builtin.TypeError("argument of type '"+c+"' is not iterable");};
    Sk.abstr.sequenceGetItem=function(a,b,c){if(a.mp$subscript)return a.mp$subscript(b);a=Sk.abstr.typeName(a);throw new Sk.builtin.TypeError("'"+a+"' object is unsubscriptable");};Sk.abstr.sequenceSetItem=function(a,b,c,d){if(a.mp$ass_subscript)return a.mp$ass_subscript(b,c);a=Sk.abstr.typeName(a);throw new Sk.builtin.TypeError("'"+a+"' object does not support item assignment");};
    Sk.abstr.sequenceDelItem=function(a,b){var c;if(a.sq$del_item)b=Sk.abstr.fixSeqIndex_(a,b),a.sq$del_item(b);else throw c=Sk.abstr.typeName(a),new Sk.builtin.TypeError("'"+c+"' object does not support item deletion");};Sk.abstr.sequenceRepeat=function(a,b,c){c=Sk.builtin.asnum$(c);if(void 0===Sk.misceval.asIndex(c))throw a=Sk.abstr.typeName(c),new Sk.builtin.TypeError("can't multiply sequence by non-int of type '"+a+"'");return a.call(b,c)};
    Sk.abstr.sequenceGetSlice=function(a,b,c){if(a.sq$slice)return b=Sk.abstr.fixSeqIndex_(a,b),c=Sk.abstr.fixSeqIndex_(a,c),a.sq$slice(b,c);if(a.mp$subscript)return a.mp$subscript(new Sk.builtin.slice(b,c));a=Sk.abstr.typeName(a);throw new Sk.builtin.TypeError("'"+a+"' object is unsliceable");};
    Sk.abstr.sequenceDelSlice=function(a,b,c){if(a.sq$del_slice)b=Sk.abstr.fixSeqIndex_(a,b),c=Sk.abstr.fixSeqIndex_(a,c),a.sq$del_slice(b,c);else throw a=Sk.abstr.typeName(a),new Sk.builtin.TypeError("'"+a+"' doesn't support slice deletion");};
    Sk.abstr.sequenceSetSlice=function(a,b,c,d){if(a.sq$ass_slice)b=Sk.abstr.fixSeqIndex_(a,b),c=Sk.abstr.fixSeqIndex_(a,c),a.sq$ass_slice(b,c,d);else if(a.mp$ass_subscript)a.mp$ass_subscript(new Sk.builtin.slice(b,c),d);else throw a=Sk.abstr.typeName(a),new Sk.builtin.TypeError("'"+a+"' object doesn't support slice assignment");};
    Sk.abstr.sequenceUnpack=function(a,b){var c=[],d,e;if(!Sk.builtin.checkIterable(a))throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(a)+"' object is not iterable");d=Sk.abstr.iter(a);for(e=d.tp$iternext();void 0!==e&&c.length<b;e=d.tp$iternext())c.push(e);if(c.length<b)throw new Sk.builtin.ValueError("need more than "+c.length+" values to unpack");if(void 0!==e)throw new Sk.builtin.ValueError("too many values to unpack");return c};
    Sk.abstr.objectFormat=function(a,b){var c;null==b&&(b="");c=Sk.abstr.lookupSpecial(a,"__format__");if(null==c)throw new Sk.builtin.TypeError("Type "+Sk.abstr.typeName(a)+"doesn't define __format__");c=Sk.misceval.callsim(c,a,b);if(!Sk.builtin.checkString(c))throw new Sk.builtin.TypeError("__format__ must return a str, not "+Sk.abstr.typeName(c));return c};
    Sk.abstr.objectAdd=function(a,b){var c,d;if(a.nb$add)return a.nb$add(b);d=Sk.abstr.typeName(a);c=Sk.abstr.typeName(b);throw new Sk.builtin.TypeError("unsupported operand type(s) for +: '"+d+"' and '"+c+"'");};Sk.abstr.objectNegative=function(a){var b=Sk.builtin.asnum$(a);a instanceof Sk.builtin.bool&&(a=new Sk.builtin.int_(b));if(a.nb$negative)return a.nb$negative();a=Sk.abstr.typeName(a);throw new Sk.builtin.TypeError("bad operand type for unary -: '"+a+"'");};
    Sk.abstr.objectPositive=function(a){var b=Sk.abstr.typeName(a),c=Sk.builtin.asnum$(a);a instanceof Sk.builtin.bool&&(a=new Sk.builtin.int_(c));if(a.nb$negative)return a.nb$positive();throw new Sk.builtin.TypeError("bad operand type for unary +: '"+b+"'");};
    Sk.abstr.objectDelItem=function(a,b){var c;if(null!==a){if(a.mp$del_subscript){a.mp$del_subscript(b);return}if(a.sq$ass_item){c=Sk.misceval.asIndex(b);if(void 0===c)throw c=Sk.abstr.typeName(b),new Sk.builtin.TypeError("sequence index must be integer, not '"+c+"'");Sk.abstr.sequenceDelItem(a,c);return}}c=Sk.abstr.typeName(a);throw new Sk.builtin.TypeError("'"+c+"' object does not support item deletion");};goog.exportSymbol("Sk.abstr.objectDelItem",Sk.abstr.objectDelItem);
    Sk.abstr.objectGetItem=function(a,b,c){if(null!==a){if(a.tp$getitem)return a.tp$getitem(b,c);if(a.mp$subscript)return a.mp$subscript(b,c);if(Sk.misceval.isIndex(b)&&a.sq$item)return Sk.abstr.sequenceGetItem(a,Sk.misceval.asIndex(b),c)}a=Sk.abstr.typeName(a);throw new Sk.builtin.TypeError("'"+a+"' does not support indexing");};goog.exportSymbol("Sk.abstr.objectGetItem",Sk.abstr.objectGetItem);
    Sk.abstr.objectSetItem=function(a,b,c,d){if(null!==a){if(a.tp$setitem)return a.tp$setitem(b,c,d);if(a.mp$ass_subscript)return a.mp$ass_subscript(b,c,d);if(Sk.misceval.isIndex(b)&&a.sq$ass_item)return Sk.abstr.sequenceSetItem(a,Sk.misceval.asIndex(b),c,d)}a=Sk.abstr.typeName(a);throw new Sk.builtin.TypeError("'"+a+"' does not support item assignment");};goog.exportSymbol("Sk.abstr.objectSetItem",Sk.abstr.objectSetItem);
    Sk.abstr.gattr=function(a,b,c){var d,e,f=Sk.abstr.typeName(a);if(null===a)throw new Sk.builtin.AttributeError("'"+f+"' object has no attribute '"+b+"'");void 0!==a.tp$getattr&&(e=a.tp$getattr("__getattribute__"));void 0!==e&&(d=Sk.misceval.callsimOrSuspend(e,new Sk.builtin.str(b)));d=Sk.misceval.chain(d,function(c){var d;void 0===c&&void 0!==a.tp$getattr&&(c=a.tp$getattr(b),void 0===c&&(d=a.tp$getattr("__getattr__"),void 0!==d&&(c=Sk.misceval.callsimOrSuspend(d,new Sk.builtin.str(b)))));return c},
        function(a){if(void 0===a)throw new Sk.builtin.AttributeError("'"+f+"' object has no attribute '"+b+"'");return a});return c?d:Sk.misceval.retryOptionalSuspensionOrThrow(d)};goog.exportSymbol("Sk.abstr.gattr",Sk.abstr.gattr);
    Sk.abstr.sattr=function(a,b,c,d){var e=Sk.abstr.typeName(a),f;if(null===a)throw new Sk.builtin.AttributeError("'"+e+"' object has no attribute '"+b+"'");if(void 0!==a.tp$getattr&&(f=a.tp$getattr("__setattr__"),void 0!==f))return a=Sk.misceval.callsimOrSuspend(f,new Sk.builtin.str(b),c),d?a:Sk.misceval.retryOptionalSuspensionOrThrow(a);if(void 0!==a.tp$setattr)a.tp$setattr(b,c);else throw new Sk.builtin.AttributeError("'"+e+"' object has no attribute '"+b+"'");};
    goog.exportSymbol("Sk.abstr.sattr",Sk.abstr.sattr);Sk.abstr.iternext=function(a,b){return a.tp$iternext(b)};goog.exportSymbol("Sk.abstr.iternext",Sk.abstr.iternext);
    Sk.abstr.iter=function(a){var b,c,d=function(a){this.idx=0;this.myobj=a;this.getitem=Sk.abstr.lookupSpecial(a,"__getitem__");this.tp$iternext=function(){var a;try{a=Sk.misceval.callsim(this.getitem,this.myobj,Sk.ffi.remapToPy(this.idx))}catch(b){if(b instanceof Sk.builtin.IndexError||b instanceof Sk.builtin.StopIteration)return;throw b;}this.idx++;return a}};if(a.tp$getattr&&(b=Sk.abstr.lookupSpecial(a,"__iter__"))&&(c=Sk.misceval.callsim(b,a),c.tp$iternext))return c;if(a.tp$iter)try{if(c=a.tp$iter(),
        c.tp$iternext)return c}catch(e){}if(Sk.abstr.lookupSpecial(a,"__getitem__"))return new d(a);throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(a)+"' object is not iterable");};goog.exportSymbol("Sk.abstr.iter",Sk.abstr.iter);Sk.abstr.lookupSpecial=function(a,b){var c;if(a.ob$type)c=a.ob$type;else return null;return Sk.builtin.type.typeLookup(c,b)};goog.exportSymbol("Sk.abstr.lookupSpecial",Sk.abstr.lookupSpecial);
    Sk.abstr.markUnhashable=function(a){a=a.prototype;a.__hash__=Sk.builtin.none.none$;a.tp$hash=Sk.builtin.none.none$};Sk.abstr.setUpInheritance=function(a,b,c){goog.inherits(b,c);b.prototype.tp$base=c;b.prototype.tp$name=a;b.prototype.ob$type=Sk.builtin.type.makeIntoTypeObj(a,b)};Sk.abstr.superConstructor=function(a,b,c){var d=Array.prototype.slice.call(arguments,2);a.prototype.tp$base.apply(b,d)};Sk.builtin.object=function(){return this instanceof Sk.builtin.object?this:new Sk.builtin.object};
    Sk.builtin.object.prototype.GenericGetAttr=function(a){var b,c,d,e,f=new Sk.builtin.str(a);goog.asserts.assert("string"===typeof a);d=this.ob$type;goog.asserts.assert(void 0!==d,"object has no ob$type!");if(e=this.$d||this.constructor.$d){if(e.mp$lookup)b=e.mp$lookup(f);else if(e.mp$subscript)try{b=e.mp$subscript(f)}catch(g){b=void 0}else"object"===typeof e&&(b=e[a]);if(void 0!==b)return b}a=Sk.builtin.type.typeLookup(d,a);void 0!==a&&(null!==a&&void 0!==a.ob$type)&&(c=a.ob$type.tp$descr_get);if(c)return c.call(a,
        this,this.ob$type);if(void 0!==a)return a};goog.exportSymbol("Sk.builtin.object.prototype.GenericGetAttr",Sk.builtin.object.prototype.GenericGetAttr);Sk.builtin.object.prototype.GenericPythonGetAttr=function(a,b){return Sk.builtin.object.prototype.GenericGetAttr.call(a,b.v)};goog.exportSymbol("Sk.builtin.object.prototype.GenericPythonGetAttr",Sk.builtin.object.prototype.GenericPythonGetAttr);
    Sk.builtin.object.prototype.GenericSetAttr=function(a,b){var c=Sk.abstr.typeName(this),d,e;goog.asserts.assert("string"===typeof a);e=this.$d||this.constructor.$d;if(e.mp$ass_subscript){d=new Sk.builtin.str(a);if(this instanceof Sk.builtin.object&&!this.ob$type.sk$klass&&void 0===e.mp$lookup(d))throw new Sk.builtin.AttributeError("'"+c+"' object has no attribute '"+a+"'");e.mp$ass_subscript(new Sk.builtin.str(a),b)}else"object"===typeof e&&(e[a]=b)};
    goog.exportSymbol("Sk.builtin.object.prototype.GenericSetAttr",Sk.builtin.object.prototype.GenericSetAttr);Sk.builtin.object.prototype.GenericPythonSetAttr=function(a,b,c){return Sk.builtin.object.prototype.GenericSetAttr.call(a,b.v,c)};goog.exportSymbol("Sk.builtin.object.prototype.GenericPythonSetAttr",Sk.builtin.object.prototype.GenericPythonSetAttr);Sk.builtin.object.prototype.HashNotImplemented=function(){throw new Sk.builtin.TypeError("unhashable type: '"+Sk.abstr.typeName(this)+"'");};
    Sk.builtin.object.prototype.tp$getattr=Sk.builtin.object.prototype.GenericGetAttr;Sk.builtin.object.prototype.tp$setattr=Sk.builtin.object.prototype.GenericSetAttr;Sk.builtin.object.prototype.__getattr__=Sk.builtin.object.prototype.GenericPythonGetAttr;Sk.builtin.object.prototype.__setattr__=Sk.builtin.object.prototype.GenericPythonSetAttr;Sk.builtin.object.prototype.tp$name="object";Sk.builtin.object.prototype.ob$type=Sk.builtin.type.makeIntoTypeObj("object",Sk.builtin.object);
    Sk.builtin.object.prototype.ob$type.sk$klass=void 0;Sk.builtin.object.prototype.__repr__=function(a){Sk.builtin.pyCheckArgs("__repr__",arguments,0,0,!1,!0);return a.$r()};Sk.builtin.object.prototype.__str__=function(a){Sk.builtin.pyCheckArgs("__str__",arguments,0,0,!1,!0);return a.$r()};Sk.builtin.object.prototype.__hash__=function(a){Sk.builtin.pyCheckArgs("__hash__",arguments,0,0,!1,!0);return a.tp$hash()};
    Sk.builtin.object.prototype.__eq__=function(a,b){Sk.builtin.pyCheckArgs("__eq__",arguments,1,1,!1,!0);return a.ob$eq(b)};Sk.builtin.object.prototype.__ne__=function(a,b){Sk.builtin.pyCheckArgs("__ne__",arguments,1,1,!1,!0);return a.ob$ne(b)};Sk.builtin.object.prototype.__lt__=function(a,b){Sk.builtin.pyCheckArgs("__lt__",arguments,1,1,!1,!0);return a.ob$lt(b)};Sk.builtin.object.prototype.__le__=function(a,b){Sk.builtin.pyCheckArgs("__le__",arguments,1,1,!1,!0);return a.ob$le(b)};
    Sk.builtin.object.prototype.__gt__=function(a,b){Sk.builtin.pyCheckArgs("__gt__",arguments,1,1,!1,!0);return a.ob$gt(b)};Sk.builtin.object.prototype.__ge__=function(a,b){Sk.builtin.pyCheckArgs("__ge__",arguments,1,1,!1,!0);return a.ob$ge(b)};Sk.builtin.object.prototype.$r=function(){return new Sk.builtin.str("<object>")};Sk.builtin.hashCount=1;Sk.builtin.object.prototype.tp$hash=function(){this.$savedHash_||(this.$savedHash_=new Sk.builtin.int_(Sk.builtin.hashCount++));return this.$savedHash_};
    Sk.builtin.object.prototype.ob$eq=function(a){return this===a?Sk.builtin.bool.true$:Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.object.prototype.ob$ne=function(a){return this===a?Sk.builtin.bool.false$:Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.object.prototype.ob$lt=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.object.prototype.ob$le=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.object.prototype.ob$gt=function(a){return Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.object.prototype.ob$ge=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.object.pythonFunctions="__repr__ __str__ __hash__ __eq__ __ne__ __lt__ __le__ __gt__ __ge__ __getattr__ __setattr__".split(" ");Sk.builtin.none=function(){this.v=null};Sk.abstr.setUpInheritance("NoneType",Sk.builtin.none,Sk.builtin.object);Sk.builtin.none.prototype.$r=function(){return new Sk.builtin.str("None")};Sk.builtin.none.prototype.tp$hash=function(){return new Sk.builtin.int_(0)};
    Sk.builtin.none.none$=new Sk.builtin.none;Sk.builtin.NotImplemented=function(){};Sk.abstr.setUpInheritance("NotImplementedType",Sk.builtin.NotImplemented,Sk.builtin.object);Sk.builtin.NotImplemented.prototype.$r=function(){return new Sk.builtin.str("NotImplemented")};Sk.builtin.NotImplemented.NotImplemented$=new Sk.builtin.NotImplemented;goog.exportSymbol("Sk.builtin.none",Sk.builtin.none);goog.exportSymbol("Sk.builtin.NotImplemented",Sk.builtin.NotImplemented);Sk.builtin.pyCheckArgs=function(a,b,c,d,e,f){b=b.length;var g="";void 0===d&&(d=Infinity);e&&(b-=1);f&&(b-=1);if(b<c||b>d)throw g=(c===d?a+"() takes exactly "+c+" arguments":b<c?a+"() takes at least "+c+" arguments":a+"() takes at most "+d+" arguments")+(" ("+b+" given)"),new Sk.builtin.TypeError(g);};goog.exportSymbol("Sk.builtin.pyCheckArgs",Sk.builtin.pyCheckArgs);Sk.builtin.pyCheckType=function(a,b,c){if(!c)throw new Sk.builtin.TypeError(a+" must be a "+b);};
    goog.exportSymbol("Sk.builtin.pyCheckType",Sk.builtin.pyCheckType);Sk.builtin.checkSequence=function(a){return null!==a&&void 0!==a.mp$subscript};goog.exportSymbol("Sk.builtin.checkSequence",Sk.builtin.checkSequence);Sk.builtin.checkIterable=function(a){var b=!1;if(null!==a)try{return(b=Sk.abstr.iter(a))?!0:!1}catch(c){if(c instanceof Sk.builtin.TypeError)return!1;throw c;}return b};goog.exportSymbol("Sk.builtin.checkIterable",Sk.builtin.checkIterable);
    Sk.builtin.checkCallable=function(a){return"function"===typeof a?!(a instanceof Sk.builtin.none)&&void 0!==a.ob$type:void 0!==a.tp$call||void 0!==a.__call__};Sk.builtin.checkNumber=function(a){return null!==a&&("number"===typeof a||a instanceof Sk.builtin.int_||a instanceof Sk.builtin.float_||a instanceof Sk.builtin.lng)};goog.exportSymbol("Sk.builtin.checkNumber",Sk.builtin.checkNumber);Sk.builtin.checkComplex=function(a){return Sk.builtin.complex._complex_check(a)};
    goog.exportSymbol("Sk.builtin.checkComplex",Sk.builtin.checkComplex);Sk.builtin.checkInt=function(a){return null!==a&&("number"===typeof a&&a===(a|0)||a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng)};goog.exportSymbol("Sk.builtin.checkInt",Sk.builtin.checkInt);Sk.builtin.checkFloat=function(a){return null!==a&&a instanceof Sk.builtin.float_};goog.exportSymbol("Sk.builtin.checkFloat",Sk.builtin.checkFloat);Sk.builtin.checkString=function(a){return null!==a&&a.__class__==Sk.builtin.str};
    goog.exportSymbol("Sk.builtin.checkString",Sk.builtin.checkString);Sk.builtin.checkClass=function(a){return null!==a&&a.sk$type};goog.exportSymbol("Sk.builtin.checkClass",Sk.builtin.checkClass);Sk.builtin.checkBool=function(a){return a instanceof Sk.builtin.bool};goog.exportSymbol("Sk.builtin.checkBool",Sk.builtin.checkBool);Sk.builtin.checkNone=function(a){return a instanceof Sk.builtin.none};goog.exportSymbol("Sk.builtin.checkNone",Sk.builtin.checkNone);
    Sk.builtin.checkFunction=function(a){return null!==a&&void 0!==a.tp$call};goog.exportSymbol("Sk.builtin.checkFunction",Sk.builtin.checkFunction);Sk.builtin.func=function(a,b,c,d){var e;this.func_code=a;this.func_globals=b||null;if(void 0!==d)for(e in d)c[e]=d[e];this.func_closure=c;return this};goog.exportSymbol("Sk.builtin.func",Sk.builtin.func);Sk.builtin.func.prototype.tp$name="function";
    Sk.builtin.func.prototype.tp$descr_get=function(a,b){goog.asserts.assert(void 0!==a&&void 0!==b);return null==a?this:new Sk.builtin.method(this,a)};
    Sk.builtin.func.prototype.tp$call=function(a,b){var c,d,e,f,g,h,k;this.func_closure&&a.push(this.func_closure);k=this.func_code.co_kwargs;h=[];if(this.func_code.no_kw&&b)throw c=this.func_code&&this.func_code.co_name&&this.func_code.co_name.v||"<native JS>",new Sk.builtin.TypeError(c+"() takes no keyword arguments");if(b)for(g=b.length,e=(f=this.func_code.co_varnames)&&f.length,d=0;d<g;d+=2){for(c=0;c<e&&b[d]!==f[c];++c);if(f&&c!==e){if(c in a)throw c=this.func_code&&this.func_code.co_name&&this.func_code.co_name.v||
        "<native JS>",new Sk.builtin.TypeError(c+"() got multiple values for keyword argument '"+b[d]+"'");a[c]=b[d+1]}else if(k)h.push(new Sk.builtin.str(b[d])),h.push(b[d+1]);else throw c=this.func_code&&this.func_code.co_name&&this.func_code.co_name.v||"<native JS>",new Sk.builtin.TypeError(c+"() got an unexpected keyword argument '"+b[d]+"'");}k&&a.unshift(h);return this.func_code.apply(this.func_globals,a)};Sk.builtin.func.prototype.tp$getattr=function(a){return this[a]};
    Sk.builtin.func.prototype.tp$setattr=function(a,b){this[a]=b};Sk.builtin.func.prototype.ob$type=Sk.builtin.type.makeTypeObj("function",new Sk.builtin.func(null,null));Sk.builtin.func.prototype.$r=function(){return new Sk.builtin.str("<function "+(this.func_code&&this.func_code.co_name&&this.func_code.co_name.v||"<native JS>")+">")};Sk.builtin.range=function(a,b,c){var d=[],e;Sk.builtin.pyCheckArgs("range",arguments,1,3);Sk.builtin.pyCheckType("start","integer",Sk.builtin.checkInt(a));void 0!==b&&Sk.builtin.pyCheckType("stop","integer",Sk.builtin.checkInt(b));void 0!==c&&Sk.builtin.pyCheckType("step","integer",Sk.builtin.checkInt(c));a=Sk.builtin.asnum$(a);b=Sk.builtin.asnum$(b);c=Sk.builtin.asnum$(c);void 0===b&&void 0===c?(b=a,a=0,c=1):void 0===c&&(c=1);if(0===c)throw new Sk.builtin.ValueError("range() step argument must not be zero");
        if(0<c)for(e=a;e<b;e+=c)d.push(new Sk.builtin.int_(e));else for(e=a;e>b;e+=c)d.push(new Sk.builtin.int_(e));return new Sk.builtin.list(d)};
    Sk.builtin.asnum$=function(a){return void 0===a||null===a?a:a instanceof Sk.builtin.none?null:a instanceof Sk.builtin.bool?a.v?1:0:"number"===typeof a?a:"string"===typeof a?a:a instanceof Sk.builtin.int_?a.v:a instanceof Sk.builtin.float_?a.v:a instanceof Sk.builtin.lng?a.cantBeInt()?a.str$(10,!0):a.toInt$():a.constructor===Sk.builtin.biginteger?0<a.trueCompare(new Sk.builtin.biginteger(Sk.builtin.int_.threshold$))||0>a.trueCompare(new Sk.builtin.biginteger(-Sk.builtin.int_.threshold$))?a.toString():
        a.intValue():a};goog.exportSymbol("Sk.builtin.asnum$",Sk.builtin.asnum$);Sk.builtin.assk$=function(a){return 0===a%1?new Sk.builtin.int_(a):new Sk.builtin.float_(a)};goog.exportSymbol("Sk.builtin.assk$",Sk.builtin.assk$);
    Sk.builtin.asnum$nofloat=function(a){var b,c;if(void 0===a||null===a)return a;if(a.constructor===Sk.builtin.none)return null;if(a.constructor===Sk.builtin.bool)return a.v?1:0;"number"===typeof a&&(a=a.toString());a.constructor===Sk.builtin.int_&&(a=a.v.toString());a.constructor===Sk.builtin.float_&&(a=a.v.toString());a.constructor===Sk.builtin.lng&&(a=a.str$(10,!0));a.constructor===Sk.builtin.biginteger&&(a=a.toString());if(0>a.indexOf(".")&&0>a.indexOf("e")&&0>a.indexOf("E"))return a;c=0;0<=a.indexOf("e")?
        (b=a.substr(0,a.indexOf("e")),c=a.substr(a.indexOf("e")+1)):0<=a.indexOf("E")?(b=a.substr(0,a.indexOf("e")),c=a.substr(a.indexOf("E")+1)):b=a;c=parseInt(c,10);a=b.indexOf(".");if(0>a){if(0<=c){for(;0<c--;)b+="0";return b}return b.length>-c?b.substr(0,b.length+c):0}b=0===a?b.substr(1):a<b.length?b.substr(0,a)+b.substr(a+1):b.substr(0,a);for(a+=c;a>b.length;)b+="0";return b=0>=a?0:b.substr(0,a)};goog.exportSymbol("Sk.builtin.asnum$nofloat",Sk.builtin.asnum$nofloat);
    Sk.builtin.round=function(a,b){var c;Sk.builtin.pyCheckArgs("round",arguments,1,2);if(!Sk.builtin.checkNumber(a))throw new Sk.builtin.TypeError("a float is required");if(void 0!==b&&!Sk.misceval.isIndex(b))throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(b)+"' object cannot be interpreted as an index");void 0===b&&(b=0);if(a.__round__)return a.__round__(a,b);c=Sk.abstr.lookupSpecial(a,"__round__");if(null!=c)return Sk.misceval.callsim(c,a,b)};
    Sk.builtin.len=function(a){Sk.builtin.pyCheckArgs("len",arguments,1,1);if(a.sq$length)return new Sk.builtin.int_(a.sq$length());if(a.mp$length)return new Sk.builtin.int_(a.mp$length());if(a.tp$length)return new Sk.builtin.int_(a.tp$length());throw new Sk.builtin.TypeError("object of type '"+Sk.abstr.typeName(a)+"' has no len()");};
    Sk.builtin.min=function(){var a,b,c;Sk.builtin.pyCheckArgs("min",arguments,1);c=Sk.misceval.arrayFromArguments(arguments);b=c[0];if(void 0===b)throw new Sk.builtin.ValueError("min() arg is an empty sequence");for(a=1;a<c.length;++a)Sk.misceval.richCompareBool(c[a],b,"Lt")&&(b=c[a]);return b};
    Sk.builtin.max=function(){var a,b,c;Sk.builtin.pyCheckArgs("max",arguments,1);c=Sk.misceval.arrayFromArguments(arguments);b=c[0];if(void 0===b)throw new Sk.builtin.ValueError("max() arg is an empty sequence");for(a=1;a<c.length;++a)Sk.misceval.richCompareBool(c[a],b,"Gt")&&(b=c[a]);return b};
    Sk.builtin.any=function(a){var b,c;Sk.builtin.pyCheckArgs("any",arguments,1,1);if(!Sk.builtin.checkIterable(a))throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(a)+"' object is not iterable");b=Sk.abstr.iter(a);for(c=b.tp$iternext();void 0!==c;c=b.tp$iternext())if(Sk.misceval.isTrue(c))return Sk.builtin.bool.true$;return Sk.builtin.bool.false$};
    Sk.builtin.all=function(a){var b,c;Sk.builtin.pyCheckArgs("all",arguments,1,1);if(!Sk.builtin.checkIterable(a))throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(a)+"' object is not iterable");b=Sk.abstr.iter(a);for(c=b.tp$iternext();void 0!==c;c=b.tp$iternext())if(!Sk.misceval.isTrue(c))return Sk.builtin.bool.false$;return Sk.builtin.bool.true$};
    Sk.builtin.sum=function(a,b){var c,d,e,f,g;Sk.builtin.pyCheckArgs("sum",arguments,1,2);Sk.builtin.pyCheckType("iter","iterable",Sk.builtin.checkIterable(a));if(void 0!==b&&Sk.builtin.checkString(b))throw new Sk.builtin.TypeError("sum() can't sum strings [use ''.join(seq) instead]");c=void 0===b?new Sk.builtin.int_(0):b;e=Sk.abstr.iter(a);for(f=e.tp$iternext();void 0!==f;f=e.tp$iternext()){f instanceof Sk.builtin.float_?(g=!0,c instanceof Sk.builtin.float_||(c=new Sk.builtin.float_(Sk.builtin.asnum$(c)))):
        f instanceof Sk.builtin.lng&&(g||c instanceof Sk.builtin.lng||(c=new Sk.builtin.lng(c)));if(void 0!==c.nb$add&&(d=c.nb$add(f),void 0!==d&&d!==Sk.builtin.NotImplemented.NotImplemented$)){c=c.nb$add(f);continue}throw new Sk.builtin.TypeError("unsupported operand type(s) for +: '"+Sk.abstr.typeName(c)+"' and '"+Sk.abstr.typeName(f)+"'");}return c};
    Sk.builtin.zip=function(){var a,b,c,d,e,f;if(0===arguments.length)return new Sk.builtin.list([]);f=[];for(e=0;e<arguments.length;e++)if(Sk.builtin.checkIterable(arguments[e]))f.push(Sk.abstr.iter(arguments[e]));else throw new Sk.builtin.TypeError("argument "+e+" must support iteration");d=[];for(c=!1;!c;){b=[];for(e=0;e<arguments.length;e++){a=f[e].tp$iternext();if(void 0===a){c=!0;break}b.push(a)}c||d.push(new Sk.builtin.tuple(b))}return new Sk.builtin.list(d)};
    Sk.builtin.abs=function(a){Sk.builtin.pyCheckArgs("abs",arguments,1,1);if(a instanceof Sk.builtin.int_)return new Sk.builtin.int_(Math.abs(a.v));if(a instanceof Sk.builtin.float_)return new Sk.builtin.float_(Math.abs(a.v));if(Sk.builtin.checkNumber(a))return Sk.builtin.assk$(Math.abs(Sk.builtin.asnum$(a)));if(Sk.builtin.checkComplex(a))return Sk.misceval.callsim(a.__abs__,a);if(a.tp$getattr){var b=a.tp$getattr("__abs__");return Sk.misceval.callsim(b)}throw new TypeError("bad operand type for abs(): '"+
        Sk.abstr.typeName(a)+"'");};Sk.builtin.ord=function(a){Sk.builtin.pyCheckArgs("ord",arguments,1,1);if(!Sk.builtin.checkString(a))throw new Sk.builtin.TypeError("ord() expected a string of length 1, but "+Sk.abstr.typeName(a)+" found");if(1!==a.v.length)throw new Sk.builtin.TypeError("ord() expected a character, but string of length "+a.v.length+" found");return new Sk.builtin.int_(a.v.charCodeAt(0))};
    Sk.builtin.chr=function(a){Sk.builtin.pyCheckArgs("chr",arguments,1,1);if(!Sk.builtin.checkInt(a))throw new Sk.builtin.TypeError("an integer is required");a=Sk.builtin.asnum$(a);if(0>a||255<a)throw new Sk.builtin.ValueError("chr() arg not in range(256)");return new Sk.builtin.str(String.fromCharCode(a))};
    Sk.builtin.unichr=function(a){Sk.builtin.pyCheckArgs("chr",arguments,1,1);if(!Sk.builtin.checkInt(a))throw new Sk.builtin.TypeError("an integer is required");a=Sk.builtin.asnum$(a);try{return new Sk.builtin.str(String.fromCodePoint(a))}catch(b){if(b instanceof RangeError)throw new Sk.builtin.ValueError(b.message);throw b;}};
    Sk.builtin.int2str_=function(a,b,c){var d,e="";if(a instanceof Sk.builtin.lng)return d="",2!==b&&(d="L"),e=a.str$(b,!1),a.nb$isnegative()?new Sk.builtin.str("-"+c+e+d):new Sk.builtin.str(c+e+d);a=Sk.misceval.asIndex(a);e=a.toString(b);return 0>a?new Sk.builtin.str("-"+c+e.slice(1)):new Sk.builtin.str(c+e)};
    Sk.builtin.hex=function(a){Sk.builtin.pyCheckArgs("hex",arguments,1,1);if(!Sk.misceval.isIndex(a))throw new Sk.builtin.TypeError("hex() argument can't be converted to hex");return Sk.builtin.int2str_(a,16,"0x")};Sk.builtin.oct=function(a){Sk.builtin.pyCheckArgs("oct",arguments,1,1);if(!Sk.misceval.isIndex(a))throw new Sk.builtin.TypeError("oct() argument can't be converted to hex");return Sk.builtin.int2str_(a,8,"0")};
    Sk.builtin.bin=function(a){Sk.builtin.pyCheckArgs("bin",arguments,1,1);if(!Sk.misceval.isIndex(a))throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(a)+"' object can't be interpreted as an index");return Sk.builtin.int2str_(a,2,"0b")};
    Sk.builtin.dir=function(a){var b,c,d,e,f,g,h;Sk.builtin.pyCheckArgs("dir",arguments,1,1);h=function(a){var b=null;if(-1!=="__bases__ __mro__ __class__ __name__ GenericGetAttr GenericSetAttr GenericPythonGetAttr GenericPythonSetAttr pythonFunctions HashNotImplemented constructor".split(" ").indexOf(a))return null;-1!==a.indexOf("$")?b=Sk.builtin.dir.slotNameToRichName(a):"_"!==a.charAt(a.length-1)?b=a:"_"===a.charAt(0)&&(b=a);return b};g=[];b=Sk.abstr.lookupSpecial(a,"__dir__");if(null!=b){c=Sk.misceval.callsim(b,
        a);if(!Sk.builtin.checkSequence(c))throw new Sk.builtin.TypeError("__dir__ must return sequence.");c=Sk.ffi.remapToJs(c);for(e=0;e<c.length;++e)g.push(new Sk.builtin.str(c[e]))}else{for(e in a.constructor.prototype)(f=h(e))&&g.push(new Sk.builtin.str(f));if(a.$d)if(a.$d.tp$iter)for(b=a.$d.tp$iter(),e=b.tp$iternext();void 0!==e;e=b.tp$iternext())f=new Sk.builtin.str(e),(f=h(f.v))&&g.push(new Sk.builtin.str(f));else for(f in a.$d)g.push(new Sk.builtin.str(f));d=a.tp$mro;!d&&a.ob$type&&(d=a.ob$type.tp$mro);
        if(d)for(e=0;e<d.v.length;++e)for(c in b=d.v[e],b)b.hasOwnProperty(c)&&(f=h(c))&&g.push(new Sk.builtin.str(f))}g.sort(function(a,b){return(a.v>b.v)-(a.v<b.v)});return new Sk.builtin.list(g.filter(function(a,b,c){return a!==c[b+1]}))};Sk.builtin.dir.slotNameToRichName=function(a){};Sk.builtin.repr=function(a){Sk.builtin.pyCheckArgs("repr",arguments,1,1);return Sk.misceval.objectRepr(a)};
    Sk.builtin.open=function(a,b,c){Sk.builtin.pyCheckArgs("open",arguments,1,3);void 0===b&&(b=new Sk.builtin.str("r"));return new Sk.builtin.file(a,b,c)};
    Sk.builtin.isinstance=function(a,b){var c,d;Sk.builtin.pyCheckArgs("isinstance",arguments,2,2);if(!(Sk.builtin.checkClass(b)||b instanceof Sk.builtin.tuple))throw new Sk.builtin.TypeError("isinstance() arg 2 must be a class, type, or tuple of classes and types");if(b===Sk.builtin.none.prototype.ob$type)return a instanceof Sk.builtin.none?Sk.builtin.bool.true$:Sk.builtin.bool.false$;if(a.ob$type===b)return Sk.builtin.bool.true$;if(b instanceof Sk.builtin.tuple){for(d=0;d<b.v.length;++d)if(Sk.misceval.isTrue(Sk.builtin.isinstance(a,
        b.v[d])))return Sk.builtin.bool.true$;return Sk.builtin.bool.false$}if(a instanceof b)return Sk.builtin.bool.true$;c=function(a,b){var d,h;if(a===b)return Sk.builtin.bool.true$;if(void 0===a.$d)return Sk.builtin.bool.false$;h=a.$d.mp$subscript(Sk.builtin.type.basesStr_);for(d=0;d<h.v.length;++d)if(Sk.misceval.isTrue(c(h.v[d],b)))return Sk.builtin.bool.true$;return Sk.builtin.bool.false$};return c(a.ob$type,b)};
    Sk.builtin.hash=function(a){Sk.builtin.pyCheckArgs("hash",arguments,1,1);if(a instanceof Object){if(Sk.builtin.checkNone(a.tp$hash))throw new Sk.builtin.TypeError(new Sk.builtin.str("unhashable type: '"+Sk.abstr.typeName(a)+"'"));if(void 0!==a.tp$hash){if(a.$savedHash_)return a.$savedHash_;a.$savedHash_=a.tp$hash();return a.$savedHash_}void 0===a.__id&&(Sk.builtin.hashCount+=1,a.__id=Sk.builtin.hashCount);return new Sk.builtin.int_(a.__id)}if("number"===typeof a||null===a||!0===a||!1===a)throw new Sk.builtin.TypeError("unsupported Javascript type");
        return new Sk.builtin.str(typeof a+" "+String(a))};Sk.builtin.getattr=function(a,b,c){var d;Sk.builtin.pyCheckArgs("getattr",arguments,2,3);if(!Sk.builtin.checkString(b))throw new Sk.builtin.TypeError("attribute name must be string");d=a.tp$getattr(b.v);if(void 0===d){if(void 0!==c)return c;throw new Sk.builtin.AttributeError("'"+Sk.abstr.typeName(a)+"' object has no attribute '"+b.v+"'");}return d};
    Sk.builtin.setattr=function(a,b,c){Sk.builtin.pyCheckArgs("setattr",arguments,3,3);if(!Sk.builtin.checkString(b))throw new Sk.builtin.TypeError("attribute name must be string");if(a.tp$setattr)a.tp$setattr(Sk.ffi.remapToJs(b),c);else throw new Sk.builtin.AttributeError("object has no attribute "+Sk.ffi.remapToJs(b));return Sk.builtin.none.none$};
    Sk.builtin.raw_input=function(a){var b=Sk.importModule("sys");a&&Sk.misceval.callsimOrSuspend(b.$d.stdout.write,b.$d.stdout,new Sk.builtin.str(a));return Sk.misceval.callsimOrSuspend(b.$d.stdin.readline,b.$d.stdin)};Sk.builtin.input=Sk.builtin.raw_input;Sk.builtin.jseval=function(a){goog.global.eval(a)};Sk.builtin.jsmillis=function(){return(new Date).valueOf()};
    Sk.builtin.superbi=function(){throw new Sk.builtin.NotImplementedError("super is not yet implemented, please report your use case as a github issue.");};Sk.builtin.eval_=function(){throw new Sk.builtin.NotImplementedError("eval is not yet implemented");};
    Sk.builtin.map=function(a,b){var c,d,e,f,g,h;Sk.builtin.pyCheckArgs("map",arguments,2);if(2<arguments.length){h=[];g=Array.prototype.slice.apply(arguments).slice(1);for(f in g){if(!Sk.builtin.checkIterable(g[f]))throw c=parseInt(f,10)+2,new Sk.builtin.TypeError("argument "+c+" to map() must support iteration");g[f]=Sk.abstr.iter(g[f])}for(;;){e=[];d=0;for(f in g)c=g[f].tp$iternext(),void 0===c?(e.push(Sk.builtin.none.none$),d++):e.push(c);if(d!==g.length)h.push(e);else break}b=new Sk.builtin.list(h)}if(!Sk.builtin.checkIterable(b))throw new Sk.builtin.TypeError("'"+
        Sk.abstr.typeName(b)+"' object is not iterable");e=[];c=Sk.abstr.iter(b);for(d=c.tp$iternext();void 0!==d;d=c.tp$iternext())a===Sk.builtin.none.none$?(d instanceof Array&&(d=new Sk.builtin.tuple(d)),e.push(d)):(d instanceof Array||(d=[d]),e.push(Sk.misceval.apply(a,void 0,void 0,void 0,d)));return new Sk.builtin.list(e)};
    Sk.builtin.reduce=function(a,b,c){var d,e,f;Sk.builtin.pyCheckArgs("reduce",arguments,2,3);if(!Sk.builtin.checkIterable(b))throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(b)+"' object is not iterable");f=Sk.abstr.iter(b);if(void 0===c&&(c=f.tp$iternext(),void 0===c))throw new Sk.builtin.TypeError("reduce() of empty sequence with no initial value");e=c;for(d=f.tp$iternext();void 0!==d;d=f.tp$iternext())e=Sk.misceval.callsim(a,e,d);return e};
    Sk.builtin.filter=function(a,b){var c,d,e,f,g,h;Sk.builtin.pyCheckArgs("filter",arguments,2,2);if(!Sk.builtin.checkIterable(b))throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(b)+"' object is not iterable");c=function(){return[]};h=function(a,b){a.push(b);return a};g=function(a){return new Sk.builtin.list(a)};b.__class__===Sk.builtin.str?(c=function(){return new Sk.builtin.str("")},h=function(a,b){return a.sq$concat(b)},g=function(a){return a}):b.__class__===Sk.builtin.tuple&&(g=function(a){return new Sk.builtin.tuple(a)});
        f=c();d=Sk.abstr.iter(b);for(e=d.tp$iternext();void 0!==e;e=d.tp$iternext())c=a===Sk.builtin.none.none$?new Sk.builtin.bool(e):Sk.misceval.callsim(a,e),Sk.misceval.isTrue(c)&&(f=h(f,e));return g(f)};
    Sk.builtin.hasattr=function(a,b){Sk.builtin.pyCheckArgs("hasattr",arguments,2,2);if(!Sk.builtin.checkString(b))throw new Sk.builtin.TypeError("hasattr(): attribute name must be string");if(a.tp$getattr)return a.tp$getattr(b.v)?Sk.builtin.bool.true$:Sk.builtin.bool.false$;throw new Sk.builtin.AttributeError("Object has no tp$getattr method");};
    Sk.builtin.pow=function(a,b,c){var d,e;Sk.builtin.pyCheckArgs("pow",arguments,2,3);c instanceof Sk.builtin.none&&(c=void 0);if(Sk.builtin.checkComplex(a))return a.nb$power(b,c);d=Sk.builtin.asnum$(a);e=Sk.builtin.asnum$(b);Sk.builtin.asnum$(c);if(!Sk.builtin.checkNumber(a)||!Sk.builtin.checkNumber(b)){if(void 0===c)throw new Sk.builtin.TypeError("unsupported operand type(s) for pow(): '"+Sk.abstr.typeName(a)+"' and '"+Sk.abstr.typeName(b)+"'");throw new Sk.builtin.TypeError("unsupported operand type(s) for pow(): '"+
        Sk.abstr.typeName(a)+"', '"+Sk.abstr.typeName(b)+"', '"+Sk.abstr.typeName(c)+"'");}if(0>d&&b instanceof Sk.builtin.float_)throw new Sk.builtin.ValueError("negative number cannot be raised to a fractional power");if(void 0===c){if(a instanceof Sk.builtin.float_||b instanceof Sk.builtin.float_||0>e)return new Sk.builtin.float_(Math.pow(d,e));d=new Sk.builtin.int_(d);e=new Sk.builtin.int_(e);d=d.nb$power(e);return a instanceof Sk.builtin.lng||b instanceof Sk.builtin.lng?new Sk.builtin.lng(d):d}if(!Sk.builtin.checkInt(a)||
        !Sk.builtin.checkInt(b)||!Sk.builtin.checkInt(c))throw new Sk.builtin.TypeError("pow() 3rd argument not allowed unless all arguments are integers");if(0>e)throw new Sk.builtin.TypeError("pow() 2nd argument cannot be negative when 3rd argument specified");return a instanceof Sk.builtin.lng||(b instanceof Sk.builtin.lng||c instanceof Sk.builtin.lng)||Infinity===Math.pow(d,e)?(a=new Sk.builtin.lng(a),a.nb$power(b,c)):(new Sk.builtin.int_(Math.pow(d,e))).nb$remainder(c)};
    Sk.builtin.quit=function(a){a=(new Sk.builtin.str(a)).v;throw new Sk.builtin.SystemExit(a);};
    Sk.builtin.issubclass=function(a,b){var c,d;Sk.builtin.pyCheckArgs("issubclass",arguments,2,2);if(!(Sk.builtin.checkClass(b)||b instanceof Sk.builtin.tuple))throw new Sk.builtin.TypeError("issubclass() arg 2 must be a classinfo, type, or tuple of classes and types");d=function(a,b){var c,h;if(a===b)return!0;if(void 0!==a.$d&&a.$d.mp$subscript)h=a.$d.mp$subscript(Sk.builtin.type.basesStr_);else return!1;for(c=0;c<h.v.length;++c)if(d(h.v[c],b))return!0;return!1};if(Sk.builtin.checkClass(b))return a===
    b?!0:d(a,b);if(b instanceof Sk.builtin.tuple){for(c=0;c<b.v.length;++c)if(Sk.builtin.issubclass(a,b.v[c]))return!0;return!1}};Sk.builtin.globals=function(){var a,b=new Sk.builtin.dict([]);for(a in Sk.globals)b.mp$ass_subscript(new Sk.builtin.str(a),Sk.globals[a]);return b};Sk.builtin.divmod=function(a,b){return Sk.abstr.numberBinOp(a,b,"DivMod")};Sk.builtin.format=function(a,b){Sk.builtin.pyCheckArgs("format",arguments,1,2);return Sk.abstr.objectFormat(a,b)};
    Sk.builtin.reversed=function(a){Sk.builtin.pyCheckArgs("reversed",arguments,1,1);var b=Sk.abstr.lookupSpecial(a,"__reversed__");if(null!=b)return Sk.misceval.callsim(b,a);if(!Sk.builtin.checkSequence(a))throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(a)+"' object is not a sequence");return new function(a){this.idx=a.sq$length()-1;this.myobj=a;this.getitem=Sk.abstr.lookupSpecial(a,"__getitem__");this.tp$iter=function(){return this};this.tp$iternext=function(){var a;if(!(0>this.idx)){try{a=Sk.misceval.callsim(this.getitem,
        this.myobj,Sk.ffi.remapToPy(this.idx))}catch(b){if(b instanceof Sk.builtin.IndexError)return;throw b;}this.idx--;return a}}}(a)};Sk.builtin.bytearray=function(){throw new Sk.builtin.NotImplementedError("bytearray is not yet implemented");};Sk.builtin.callable=function(){throw new Sk.builtin.NotImplementedError("callable is not yet implemented");};Sk.builtin.delattr=function(){throw new Sk.builtin.NotImplementedError("delattr is not yet implemented");};
    Sk.builtin.execfile=function(){throw new Sk.builtin.NotImplementedError("execfile is not yet implemented");};Sk.builtin.frozenset=function(){throw new Sk.builtin.NotImplementedError("frozenset is not yet implemented");};Sk.builtin.help=function(){throw new Sk.builtin.NotImplementedError("help is not yet implemented");};Sk.builtin.iter=function(){throw new Sk.builtin.NotImplementedError("iter is not yet implemented");};
    Sk.builtin.locals=function(){throw new Sk.builtin.NotImplementedError("locals is not yet implemented");};Sk.builtin.memoryview=function(){throw new Sk.builtin.NotImplementedError("memoryview is not yet implemented");};Sk.builtin.next_=function(){throw new Sk.builtin.NotImplementedError("next is not yet implemented");};Sk.builtin.property=function(){throw new Sk.builtin.NotImplementedError("property is not yet implemented");};
    Sk.builtin.reload=function(){throw new Sk.builtin.NotImplementedError("reload is not yet implemented");};Sk.builtin.vars=function(){throw new Sk.builtin.NotImplementedError("vars is not yet implemented");};Sk.builtin.xrange=Sk.builtin.range;Sk.builtin.apply_=function(){throw new Sk.builtin.NotImplementedError("apply is not yet implemented");};Sk.builtin.buffer=function(){throw new Sk.builtin.NotImplementedError("buffer is not yet implemented");};
    Sk.builtin.coerce=function(){throw new Sk.builtin.NotImplementedError("coerce is not yet implemented");};Sk.builtin.intern=function(){throw new Sk.builtin.NotImplementedError("intern is not yet implemented");};String.fromCodePoint||function(){var a=function(){var a;try{var b={},c=Object.defineProperty;a=c(b,"foo",b)&&c}catch(d){}return a}(),b=String.fromCharCode,c=Math.floor,d=function(a){var d=[],g,h,k=-1,l=arguments.length;if(!l)return"";for(var m="";++k<l;){h=Number(arguments[k]);if(!isFinite(h)||0>h||1114111<h||c(h)!=h)throw RangeError("Invalid code point: "+h);65535>=h?d.push(h):(h-=65536,g=(h>>10)+55296,h=h%1024+56320,d.push(g,h));if(k+1==l||16384<d.length)m+=b.apply(null,d),d.length=0}return m};
        a?a(String,"fromCodePoint",{value:d,configurable:!0,writable:!0}):String.fromCodePoint=d}();Sk.builtin.BaseException=function(a){var b;if(!(this instanceof Sk.builtin.BaseException))return b=Object.create(Sk.builtin.BaseException.prototype),b.constructor.apply(b,arguments),b;a=Array.prototype.slice.call(arguments);for(b=0;b<a.length;++b)"string"===typeof a[b]&&(a[b]=new Sk.builtin.str(a[b]));this.args=new Sk.builtin.tuple(a);this.traceback=[];3<=this.args.sq$length()&&this.traceback.push({lineno:this.args.v[2],filename:this.args.v[1].v||"<unknown>"})};
    Sk.abstr.setUpInheritance("BaseException",Sk.builtin.BaseException,Sk.builtin.object);Sk.builtin.BaseException.prototype.tp$str=function(){var a,b;b=""+this.tp$name;this.args&&(b+=": "+(0<this.args.v.length?this.args.v[0].v:""));b=0!==this.traceback.length?b+(" on line "+this.traceback[0].lineno):b+" at <unknown>";if(4<this.args.v.length){b+="\n"+this.args.v[4].v+"\n";for(a=0;a<this.args.v[3];++a)b+=" ";b+="^\n"}return new Sk.builtin.str(b)};Sk.builtin.BaseException.prototype.toString=function(){return this.tp$str().v};
    goog.exportSymbol("Sk.builtin.BaseException",Sk.builtin.BaseException);Sk.builtin.Exception=function(a){var b;if(!(this instanceof Sk.builtin.Exception))return b=Object.create(Sk.builtin.Exception.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.BaseException.apply(this,arguments)};Sk.abstr.setUpInheritance("Exception",Sk.builtin.Exception,Sk.builtin.BaseException);goog.exportSymbol("Sk.builtin.Exception",Sk.builtin.Exception);
    Sk.builtin.StandardError=function(a){var b;if(!(this instanceof Sk.builtin.StandardError))return b=Object.create(Sk.builtin.StandardError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.Exception.apply(this,arguments)};Sk.abstr.setUpInheritance("StandardError",Sk.builtin.StandardError,Sk.builtin.Exception);goog.exportSymbol("Sk.builtin.StandardError",Sk.builtin.StandardError);
    Sk.builtin.AssertionError=function(a){var b;if(!(this instanceof Sk.builtin.AssertionError))return b=Object.create(Sk.builtin.AssertionError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("AssertionError",Sk.builtin.AssertionError,Sk.builtin.StandardError);goog.exportSymbol("Sk.builtin.AssertionError",Sk.builtin.AssertionError);
    Sk.builtin.AttributeError=function(a){var b;if(!(this instanceof Sk.builtin.AttributeError))return b=Object.create(Sk.builtin.AttributeError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("AttributeError",Sk.builtin.AttributeError,Sk.builtin.StandardError);
    Sk.builtin.ImportError=function(a){var b;if(!(this instanceof Sk.builtin.ImportError))return b=Object.create(Sk.builtin.ImportError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("ImportError",Sk.builtin.ImportError,Sk.builtin.StandardError);
    Sk.builtin.IndentationError=function(a){var b;if(!(this instanceof Sk.builtin.IndentationError))return b=Object.create(Sk.builtin.IndentationError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("IndentationError",Sk.builtin.IndentationError,Sk.builtin.StandardError);
    Sk.builtin.IndexError=function(a){var b;if(!(this instanceof Sk.builtin.IndexError))return b=Object.create(Sk.builtin.IndexError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("IndexError",Sk.builtin.IndexError,Sk.builtin.StandardError);
    Sk.builtin.KeyError=function(a){var b;if(!(this instanceof Sk.builtin.KeyError))return b=Object.create(Sk.builtin.KeyError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("KeyError",Sk.builtin.KeyError,Sk.builtin.StandardError);
    Sk.builtin.NameError=function(a){var b;if(!(this instanceof Sk.builtin.NameError))return b=Object.create(Sk.builtin.NameError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("NameError",Sk.builtin.NameError,Sk.builtin.StandardError);
    Sk.builtin.UnboundLocalError=function(a){var b;if(!(this instanceof Sk.builtin.UnboundLocalError))return b=Object.create(Sk.builtin.UnboundLocalError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("UnboundLocalError",Sk.builtin.UnboundLocalError,Sk.builtin.StandardError);
    Sk.builtin.OverflowError=function(a){var b;if(!(this instanceof Sk.builtin.OverflowError))return b=Object.create(Sk.builtin.OverflowError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("OverflowError",Sk.builtin.OverflowError,Sk.builtin.StandardError);
    Sk.builtin.ParseError=function(a){var b;if(!(this instanceof Sk.builtin.ParseError))return b=Object.create(Sk.builtin.ParseError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("ParseError",Sk.builtin.ParseError,Sk.builtin.StandardError);
    Sk.builtin.RuntimeError=function(a){var b;if(!(this instanceof Sk.builtin.RuntimeError))return b=Object.create(Sk.builtin.RuntimeError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("RuntimeError",Sk.builtin.RuntimeError,Sk.builtin.StandardError);goog.exportSymbol("Sk.builtin.RuntimeError",Sk.builtin.RuntimeError);
    Sk.builtin.SuspensionError=function(a){var b;if(!(this instanceof Sk.builtin.SuspensionError))return b=Object.create(Sk.builtin.SuspensionError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("SuspensionError",Sk.builtin.SuspensionError,Sk.builtin.StandardError);goog.exportSymbol("Sk.builtin.SuspensionError",Sk.builtin.SuspensionError);
    Sk.builtin.SystemExit=function(a){var b;if(!(this instanceof Sk.builtin.SystemExit))return b=Object.create(Sk.builtin.SystemExit.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.BaseException.apply(this,arguments)};Sk.abstr.setUpInheritance("SystemExit",Sk.builtin.SystemExit,Sk.builtin.BaseException);goog.exportSymbol("Sk.builtin.SystemExit",Sk.builtin.SystemExit);
    Sk.builtin.SyntaxError=function(a){var b;if(!(this instanceof Sk.builtin.SyntaxError))return b=Object.create(Sk.builtin.SyntaxError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("SyntaxError",Sk.builtin.SyntaxError,Sk.builtin.StandardError);
    Sk.builtin.TokenError=function(a){var b;if(!(this instanceof Sk.builtin.TokenError))return b=Object.create(Sk.builtin.TokenError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("TokenError",Sk.builtin.TokenError,Sk.builtin.StandardError);
    Sk.builtin.TypeError=function(a){var b;if(!(this instanceof Sk.builtin.TypeError))return b=Object.create(Sk.builtin.TypeError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("TypeError",Sk.builtin.TypeError,Sk.builtin.StandardError);goog.exportSymbol("Sk.builtin.TypeError",Sk.builtin.TypeError);
    Sk.builtin.ValueError=function(a){var b;if(!(this instanceof Sk.builtin.ValueError))return b=Object.create(Sk.builtin.ValueError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("ValueError",Sk.builtin.ValueError,Sk.builtin.StandardError);goog.exportSymbol("Sk.builtin.ValueError",Sk.builtin.ValueError);
    Sk.builtin.ZeroDivisionError=function(a){var b;if(!(this instanceof Sk.builtin.ZeroDivisionError))return b=Object.create(Sk.builtin.ZeroDivisionError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("ZeroDivisionError",Sk.builtin.ZeroDivisionError,Sk.builtin.StandardError);
    Sk.builtin.TimeLimitError=function(a){var b;if(!(this instanceof Sk.builtin.TimeLimitError))return b=Object.create(Sk.builtin.TimeLimitError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("TimeLimitError",Sk.builtin.TimeLimitError,Sk.builtin.StandardError);goog.exportSymbol("Sk.builtin.TimeLimitError",Sk.builtin.TimeLimitError);
    Sk.builtin.IOError=function(a){var b;if(!(this instanceof Sk.builtin.IOError))return b=Object.create(Sk.builtin.IOError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("IOError",Sk.builtin.IOError,Sk.builtin.StandardError);goog.exportSymbol("Sk.builtin.IOError",Sk.builtin.IOError);
    Sk.builtin.NotImplementedError=function(a){var b;if(!(this instanceof Sk.builtin.NotImplementedError))return b=Object.create(Sk.builtin.NotImplementedError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("NotImplementedError",Sk.builtin.NotImplementedError,Sk.builtin.StandardError);goog.exportSymbol("Sk.builtin.NotImplementedError",Sk.builtin.NotImplementedError);
    Sk.builtin.NegativePowerError=function(a){var b;if(!(this instanceof Sk.builtin.NegativePowerError))return b=Object.create(Sk.builtin.NegativePowerError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("NegativePowerError",Sk.builtin.NegativePowerError,Sk.builtin.StandardError);goog.exportSymbol("Sk.builtin.NegativePowerError",Sk.builtin.NegativePowerError);
    Sk.builtin.ExternalError=function(a,b){var c;if(!(this instanceof Sk.builtin.ExternalError))return c=Object.create(Sk.builtin.ExternalError.prototype),c.constructor.apply(c,arguments),c;b=Array.prototype.slice.call(arguments);this.nativeError=b[0];b[0]instanceof Sk.builtin.str||(b[0]=""+b[0]);Sk.builtin.StandardError.apply(this,b)};Sk.abstr.setUpInheritance("ExternalError",Sk.builtin.ExternalError,Sk.builtin.StandardError);goog.exportSymbol("Sk.builtin.ExternalError",Sk.builtin.ExternalError);
    Sk.builtin.OperationError=function(a){var b;if(!(this instanceof Sk.builtin.OperationError))return b=Object.create(Sk.builtin.OperationError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("OperationError",Sk.builtin.OperationError,Sk.builtin.StandardError);goog.exportSymbol("Sk.builtin.OperationError",Sk.builtin.OperationError);
    Sk.builtin.SystemError=function(a){var b;if(!(this instanceof Sk.builtin.SystemError))return b=Object.create(Sk.builtin.SystemError.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.StandardError.apply(this,arguments)};Sk.abstr.setUpInheritance("SystemError",Sk.builtin.SystemError,Sk.builtin.StandardError);goog.exportSymbol("Sk.builtin.SystemError",Sk.builtin.SystemError);
    Sk.builtin.StopIteration=function(a){var b;if(!(this instanceof Sk.builtin.StopIteration))return b=Object.create(Sk.builtin.StopIteration.prototype),b.constructor.apply(b,arguments),b;Sk.builtin.Exception.apply(this,arguments)};Sk.abstr.setUpInheritance("StopIteration",Sk.builtin.StopIteration,Sk.builtin.Exception);goog.exportSymbol("Sk.builtin.StopIteration",Sk.builtin.StopIteration);goog.exportSymbol("Sk",Sk);Sk.nativejs={FN_ARGS:/^function\s*[^\(]*\(\s*([^\)]*)\)/m,FN_ARG_SPLIT:/,/,FN_ARG:/^\s*(_?)(\S+?)\1\s*$/,STRIP_COMMENTS:/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,formalParameterList:function(a){var b,c,d=[];a=a.toString().replace(this.STRIP_COMMENTS,"").match(this.FN_ARGS)[1].split(this.FN_ARG_SPLIT);for(b in a)c=a[b],c.replace(this.FN_ARG,function(a,b,c){d.push(c)});return d},func:function(a){a.co_name=new Sk.builtin.str(a.name);a.co_varnames=Sk.nativejs.formalParameterList(a);return new Sk.builtin.func(a)},
        func_nokw:function(a){a.co_name=new Sk.builtin.str(a.name);a.co_varnames=Sk.nativejs.formalParameterList(a);a.no_kw=!0;return new Sk.builtin.func(a)}};goog.exportSymbol("Sk.nativejs.func",Sk.nativejs.func);goog.exportSymbol("Sk.nativejs.func_nokw",Sk.nativejs.func_nokw);Sk.builtin.method=function(a,b){this.im_func=a;this.im_self=b};goog.exportSymbol("Sk.builtin.method",Sk.builtin.method);Sk.builtin.method.prototype.tp$call=function(a,b){goog.asserts.assert(this.im_self,"should just be a function, not a method since there's no self?");goog.asserts.assert(this.im_func instanceof Sk.builtin.func);a.unshift(this.im_self);return this.im_func.tp$call(a,b)};
    Sk.builtin.method.prototype.$r=function(){return new Sk.builtin.str("<bound method "+this.im_self.ob$type.tp$name+"."+(this.im_func.func_code&&this.im_func.func_code.co_name&&this.im_func.func_code.co_name.v||"<native JS>")+" of "+this.im_self.$r().v+">")};Sk.misceval={};Sk.misceval.Suspension=function(a,b,c){this.isSuspension=!0;void 0!==a&&void 0!==b&&(this.resume=function(){return a(b.resume())});this.child=b;this.optional=void 0!==b&&b.optional;this.data=void 0===c&&void 0!==b?b.data:c};goog.exportSymbol("Sk.misceval.Suspension",Sk.misceval.Suspension);
    Sk.misceval.retryOptionalSuspensionOrThrow=function(a,b){for(;a instanceof Sk.misceval.Suspension;){if(!a.optional)throw new Sk.builtin.SuspensionError(b||"Cannot call a function that blocks or suspends here");a=a.resume()}return a};goog.exportSymbol("Sk.misceval.retryOptionalSuspensionOrThrow",Sk.misceval.retryOptionalSuspensionOrThrow);Sk.misceval.isIndex=function(a){return Sk.builtin.checkInt(a)||Sk.abstr.lookupSpecial(a,"__index__")?!0:!1};goog.exportSymbol("Sk.misceval.isIndex",Sk.misceval.isIndex);
    Sk.misceval.asIndex=function(a){var b;if(Sk.misceval.isIndex(a)&&null!==a){if(!0===a)return 1;if(!1===a)return 0;if("number"===typeof a)return a;if(a.constructor===Sk.builtin.int_)return a.v;if(a.constructor===Sk.builtin.lng)return a.tp$index();if(a.constructor===Sk.builtin.bool)return Sk.builtin.asnum$(a);if(b=Sk.abstr.lookupSpecial(a,"__index__")){a=Sk.misceval.callsim(b,a);if(!Sk.builtin.checkInt(a))throw new Sk.builtin.TypeError("__index__ returned non-(int,long) (type "+Sk.abstr.typeName(a)+
        ")");return Sk.builtin.asnum$(a)}goog.asserts.fail("todo asIndex;")}};Sk.misceval.applySlice=function(a,b,c,d){return a.sq$slice&&Sk.misceval.isIndex(b)&&Sk.misceval.isIndex(c)?(b=Sk.misceval.asIndex(b),void 0===b&&(b=0),c=Sk.misceval.asIndex(c),void 0===c&&(c=1E100),Sk.abstr.sequenceGetSlice(a,b,c)):Sk.abstr.objectGetItem(a,new Sk.builtin.slice(b,c,null),d)};goog.exportSymbol("Sk.misceval.applySlice",Sk.misceval.applySlice);
    Sk.misceval.assignSlice=function(a,b,c,d,e){if(a.sq$ass_slice&&Sk.misceval.isIndex(b)&&Sk.misceval.isIndex(c))e=Sk.misceval.asIndex(b)||0,c=Sk.misceval.asIndex(c)||1E100,null===d?Sk.abstr.sequenceDelSlice(a,e,c):Sk.abstr.sequenceSetSlice(a,e,c,d);else return c=new Sk.builtin.slice(b,c),null===d?Sk.abstr.objectDelItem(a,c):Sk.abstr.objectSetItem(a,c,d,e)};goog.exportSymbol("Sk.misceval.assignSlice",Sk.misceval.assignSlice);
    Sk.misceval.arrayFromArguments=function(a){var b,c;if(1!=a.length)return a;b=a[0];b instanceof Sk.builtin.set?b=b.tp$iter().$obj:b instanceof Sk.builtin.dict&&(b=Sk.builtin.dict.prototype.keys.func_code(b));if(b instanceof Sk.builtin.list||b instanceof Sk.builtin.tuple)return b.v;if(Sk.builtin.checkIterable(b)){a=[];b=Sk.abstr.iter(b);for(c=b.tp$iternext();void 0!==c;c=b.tp$iternext())a.push(c);return a}throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(b)+"' object is not iterable");};
    goog.exportSymbol("Sk.misceval.arrayFromArguments",Sk.misceval.arrayFromArguments);Sk.misceval.swappedOp_={Eq:"Eq",NotEq:"NotEq",Lt:"GtE",LtE:"Gt",Gt:"LtE",GtE:"Lt",Is:"IsNot",IsNot:"Is",In_:"NotIn",NotIn:"In_"};
    Sk.misceval.richCompareBool=function(a,b,c,d){var e,f,g,h,k,l,m;goog.asserts.assert(null!==a&&void 0!==a,"passed null or undefined parameter to Sk.misceval.richCompareBool");goog.asserts.assert(null!==b&&void 0!==b,"passed null or undefined parameter to Sk.misceval.richCompareBool");m=new Sk.builtin.type(a);h=new Sk.builtin.type(b);if(m!==h&&("GtE"===c||"Gt"===c||"LtE"===c||"Lt"===c)){l=[Sk.builtin.float_.prototype.ob$type,Sk.builtin.int_.prototype.ob$type,Sk.builtin.lng.prototype.ob$type,Sk.builtin.bool.prototype.ob$type];
        k=[Sk.builtin.dict.prototype.ob$type,Sk.builtin.enumerate.prototype.ob$type,Sk.builtin.list.prototype.ob$type,Sk.builtin.str.prototype.ob$type,Sk.builtin.tuple.prototype.ob$type];f=l.indexOf(m);g=k.indexOf(m);l=l.indexOf(h);k=k.indexOf(h);if(m===Sk.builtin.none.prototype.ob$type)switch(c){case "Lt":return!0;case "LtE":return!0;case "Gt":return!1;case "GtE":return!1}if(h===Sk.builtin.none.prototype.ob$type)switch(c){case "Lt":return!1;case "LtE":return!1;case "Gt":return!0;case "GtE":return!0}if(-1!==
            f&&-1!==k)switch(c){case "Lt":return!0;case "LtE":return!0;case "Gt":return!1;case "GtE":return!1}if(-1!==g&&-1!==l)switch(c){case "Lt":return!1;case "LtE":return!1;case "Gt":return!0;case "GtE":return!0}if(-1!==g&&-1!==k)switch(c){case "Lt":return g<k;case "LtE":return g<=k;case "Gt":return g>k;case "GtE":return g>=k}}if("Is"===c)return a instanceof Sk.builtin.int_&&b instanceof Sk.builtin.int_?0===a.numberCompare(b):a instanceof Sk.builtin.float_&&b instanceof Sk.builtin.float_?0===a.numberCompare(b):
        a instanceof Sk.builtin.lng&&b instanceof Sk.builtin.lng?0===a.longCompare(b):a===b;if("IsNot"===c)return a instanceof Sk.builtin.int_&&b instanceof Sk.builtin.int_?0!==a.numberCompare(b):a instanceof Sk.builtin.float_&&b instanceof Sk.builtin.float_?0!==a.numberCompare(b):a instanceof Sk.builtin.lng&&b instanceof Sk.builtin.lng?0!==a.longCompare(b):a!==b;if("In"===c)return Sk.misceval.chain(Sk.abstr.sequenceContains(b,a,d),Sk.misceval.isTrue);if("NotIn"===c)return Sk.misceval.chain(Sk.abstr.sequenceContains(b,
        a,d),function(a){return!Sk.misceval.isTrue(a)});f={Eq:"ob$eq",NotEq:"ob$ne",Gt:"ob$gt",GtE:"ob$ge",Lt:"ob$lt",LtE:"ob$le"};g=f[c];if((d=a.constructor.prototype.hasOwnProperty(g))&&(e=a[g](b))!==Sk.builtin.NotImplemented.NotImplemented$)return Sk.misceval.isTrue(e);f=f[Sk.misceval.swappedOp_[c]];if((g=b.constructor.prototype.hasOwnProperty(f))&&(e=b[f](a))!==Sk.builtin.NotImplemented.NotImplemented$)return Sk.misceval.isTrue(e);if(a.tp$richcompare&&void 0!==(e=a.tp$richcompare(b,c))&&e!=Sk.builtin.NotImplemented.NotImplemented$||
        b.tp$richcompare&&void 0!==(e=b.tp$richcompare(a,Sk.misceval.swappedOp_[c]))&&e!=Sk.builtin.NotImplemented.NotImplemented$)return Sk.misceval.isTrue(e);h={Eq:"__eq__",NotEq:"__ne__",Gt:"__gt__",GtE:"__ge__",Lt:"__lt__",LtE:"__le__"};if((f=Sk.abstr.lookupSpecial(a,h[c]))&&!d&&(e=Sk.misceval.callsim(f,a,b),e!=Sk.builtin.NotImplemented.NotImplemented$)||(d=Sk.abstr.lookupSpecial(b,h[Sk.misceval.swappedOp_[c]]))&&!g&&(e=Sk.misceval.callsim(d,b,a),e!=Sk.builtin.NotImplemented.NotImplemented$))return Sk.misceval.isTrue(e);
        if(d=Sk.abstr.lookupSpecial(a,"__cmp__"))try{e=Sk.misceval.callsim(d,a,b);if(Sk.builtin.checkNumber(e)){e=Sk.builtin.asnum$(e);if("Eq"===c)return 0===e;if("NotEq"===c)return 0!==e;if("Lt"===c)return 0>e;if("Gt"===c)return 0<e;if("LtE"===c)return 0>=e;if("GtE"===c)return 0<=e}if(e!==Sk.builtin.NotImplemented.NotImplemented$)throw new Sk.builtin.TypeError("comparison did not return an int");}catch(p){throw new Sk.builtin.TypeError("comparison did not return an int");}if(d=Sk.abstr.lookupSpecial(b,"__cmp__"))try{e=
            Sk.misceval.callsim(d,b,a);if(Sk.builtin.checkNumber(e)){e=Sk.builtin.asnum$(e);if("Eq"===c)return 0===e;if("NotEq"===c)return 0!==e;if("Lt"===c)return 0<e;if("Gt"===c)return 0>e;if("LtE"===c)return 0<=e;if("GtE"===c)return 0>=e}if(e!==Sk.builtin.NotImplemented.NotImplemented$)throw new Sk.builtin.TypeError("comparison did not return an int");}catch(n){throw new Sk.builtin.TypeError("comparison did not return an int");}if(a instanceof Sk.builtin.none&&b instanceof Sk.builtin.none||a instanceof Sk.builtin.bool&&
            b instanceof Sk.builtin.bool){if("Eq"===c)return a.v===b.v;if("NotEq"===c)return a.v!==b.v;if("Gt"===c)return a.v>b.v;if("GtE"===c)return a.v>=b.v;if("Lt"===c)return a.v<b.v;if("LtE"===c)return a.v<=b.v}if("Eq"===c)return a instanceof Sk.builtin.str&&b instanceof Sk.builtin.str?a.v===b.v:a===b;if("NotEq"===c)return a instanceof Sk.builtin.str&&b instanceof Sk.builtin.str?a.v!==b.v:a!==b;a=Sk.abstr.typeName(a);b=Sk.abstr.typeName(b);throw new Sk.builtin.ValueError("don't know how to compare '"+a+"' and '"+
            b+"'");};goog.exportSymbol("Sk.misceval.richCompareBool",Sk.misceval.richCompareBool);
    Sk.misceval.objectRepr=function(a){goog.asserts.assert(void 0!==a,"trying to repr undefined");return null===a||a instanceof Sk.builtin.none?new Sk.builtin.str("None"):!0===a?new Sk.builtin.str("True"):!1===a?new Sk.builtin.str("False"):"number"===typeof a?new Sk.builtin.str(""+a):a.$r?a.constructor===Sk.builtin.float_?Infinity===a.v?new Sk.builtin.str("inf"):-Infinity===a.v?new Sk.builtin.str("-inf"):a.$r():a.$r():a.tp$name?new Sk.builtin.str("<"+a.tp$name+" object>"):new Sk.builtin.str("<unknown>")};
    goog.exportSymbol("Sk.misceval.objectRepr",Sk.misceval.objectRepr);Sk.misceval.opAllowsEquality=function(a){switch(a){case "LtE":case "Eq":case "GtE":return!0}return!1};goog.exportSymbol("Sk.misceval.opAllowsEquality",Sk.misceval.opAllowsEquality);
    Sk.misceval.isTrue=function(a){if(!0===a)return!0;if(!1===a||null===a||a.constructor===Sk.builtin.none||a.constructor===Sk.builtin.NotImplemented)return!1;if(a.constructor===Sk.builtin.bool)return a.v;if("number"===typeof a)return 0!==a;if(a instanceof Sk.builtin.lng)return a.nb$nonzero();if(a.constructor===Sk.builtin.int_||a.constructor===Sk.builtin.float_)return 0!==a.v;if(a.__nonzero__){a=Sk.misceval.callsim(a.__nonzero__,a);if(!Sk.builtin.checkInt(a))throw new Sk.builtin.TypeError("__nonzero__ should return an int");
        return 0!==Sk.builtin.asnum$(a)}if(a.__len__){a=Sk.misceval.callsim(a.__len__,a);if(!Sk.builtin.checkInt(a))throw new Sk.builtin.TypeError("__len__ should return an int");return 0!==Sk.builtin.asnum$(a)}return a.mp$length?0!==Sk.builtin.asnum$(a.mp$length()):a.sq$length?0!==Sk.builtin.asnum$(a.sq$length()):!0};goog.exportSymbol("Sk.misceval.isTrue",Sk.misceval.isTrue);Sk.misceval.softspace_=!1;
    Sk.misceval.print_=function(a){var b;Sk.misceval.softspace_&&("\n"!==a&&Sk.output(" "),Sk.misceval.softspace_=!1);a=new Sk.builtin.str(a);b=Sk.importModule("sys");Sk.misceval.apply(b.$d.stdout.write,void 0,void 0,void 0,[b.$d.stdout,a]);b=function(a){return"\n"===a||"\t"===a||"\r"===a};0!==a.v.length&&b(a.v[a.v.length-1])&&" "!==a.v[a.v.length-1]||(Sk.misceval.softspace_=!0)};goog.exportSymbol("Sk.misceval.print_",Sk.misceval.print_);
    Sk.misceval.loadname=function(a,b){var c;c=b[a];if(void 0!==c)return c;c=Sk.builtins[a];if(void 0!==c)return c;a=a.replace("_$rw$","");a=a.replace("_$rn$","");throw new Sk.builtin.NameError("name '"+a+"' is not defined");};goog.exportSymbol("Sk.misceval.loadname",Sk.misceval.loadname);Sk.misceval.call=function(a,b,c,d,e){e=Array.prototype.slice.call(arguments,4);return Sk.misceval.apply(a,b,c,d,e)};goog.exportSymbol("Sk.misceval.call",Sk.misceval.call);
    Sk.misceval.callAsync=function(a,b,c,d,e,f){f=Array.prototype.slice.call(arguments,5);return Sk.misceval.applyAsync(a,b,c,d,e,f)};goog.exportSymbol("Sk.misceval.callAsync",Sk.misceval.callAsync);Sk.misceval.callOrSuspend=function(a,b,c,d,e){e=Array.prototype.slice.call(arguments,4);return Sk.misceval.applyOrSuspend(a,b,c,d,e)};goog.exportSymbol("Sk.misceval.callOrSuspend",Sk.misceval.callOrSuspend);
    Sk.misceval.callsim=function(a,b){b=Array.prototype.slice.call(arguments,1);return Sk.misceval.apply(a,void 0,void 0,void 0,b)};goog.exportSymbol("Sk.misceval.callsim",Sk.misceval.callsim);Sk.misceval.callsimAsync=function(a,b,c){c=Array.prototype.slice.call(arguments,2);return Sk.misceval.applyAsync(a,b,void 0,void 0,void 0,c)};goog.exportSymbol("Sk.misceval.callsimAsync",Sk.misceval.callsimAsync);
    Sk.misceval.callsimOrSuspend=function(a,b){b=Array.prototype.slice.call(arguments,1);return Sk.misceval.applyOrSuspend(a,void 0,void 0,void 0,b)};goog.exportSymbol("Sk.misceval.callsimOrSuspend",Sk.misceval.callsimOrSuspend);Sk.misceval.apply=function(a,b,c,d,e){a=Sk.misceval.applyOrSuspend(a,b,c,d,e);return a instanceof Sk.misceval.Suspension?Sk.misceval.retryOptionalSuspensionOrThrow(a):a};goog.exportSymbol("Sk.misceval.apply",Sk.misceval.apply);
    Sk.misceval.asyncToPromise=function(a,b){return new Promise(function(c,d){try{(function g(a){try{for(var e=function(){g(a.resume())},l=function(b){try{a.data.result=b,e()}catch(c){d(c)}},m=function(b){try{a.data.error=b,e()}catch(c){d(c)}};a instanceof Sk.misceval.Suspension;){var p=b&&(b[a.data.type]||b["*"]);if(p){var n=p(a);if(n){n.then(g,d);return}}if("Sk.promise"==a.data.type){a.data.promise.then(l,m);return}if("Sk.yield"==a.data.type){Sk.setTimeout(e,0);return}if(a.optional)a=a.resume();else throw new Sk.builtin.SuspensionError("Unhandled non-optional suspension of type '"+
        a.data.type+"'");}c(a)}catch(r){d(r)}})(a())}catch(e){d(e)}})};goog.exportSymbol("Sk.misceval.asyncToPromise",Sk.misceval.asyncToPromise);Sk.misceval.applyAsync=function(a,b,c,d,e,f){return Sk.misceval.asyncToPromise(function(){return Sk.misceval.applyOrSuspend(b,c,d,e,f)},a)};goog.exportSymbol("Sk.misceval.applyAsync",Sk.misceval.applyAsync);
    Sk.misceval.chain=function(a,b){for(var c=Array(arguments.length),d=1,d=1;d<arguments.length;d++)c[d]=arguments[d];d=1;return function f(a){for(;d<c.length;){if(a instanceof Sk.misceval.Suspension)return new Sk.misceval.Suspension(f,a);a=c[d](a);d++}return a}(a)};goog.exportSymbol("Sk.misceval.chain",Sk.misceval.chain);
    Sk.misceval.tryCatch=function(a,b){var c;try{c=a()}catch(d){return b(d)}if(c instanceof Sk.misceval.Suspension){var e=new Sk.misceval.Suspension(void 0,c);e.resume=function(){return Sk.misceval.tryCatch(c.resume,b)};return e}return c};goog.exportSymbol("Sk.misceval.tryCatch",Sk.misceval.tryCatch);
    Sk.misceval.iterFor=function(a,b,c){var d=c,e=function(b){d=b;return b instanceof Sk.misceval.Break?b:a.tp$iternext(!0)};return function g(a){for(;void 0!==a;){if(a instanceof Sk.misceval.Suspension)return new Sk.misceval.Suspension(g,a);if(a===Sk.misceval.Break||a instanceof Sk.misceval.Break)return a.brValue;a=Sk.misceval.chain(b(a,d),e)}return d}(a.tp$iternext(!0))};goog.exportSymbol("Sk.misceval.iterFor",Sk.misceval.iterFor);
    Sk.misceval.Break=function(a){if(!(this instanceof Sk.misceval.Break))return new Sk.misceval.Break(a);this.brValue=a};goog.exportSymbol("Sk.misceval.Break",Sk.misceval.Break);
    Sk.misceval.applyOrSuspend=function(a,b,c,d,e){var f,g;if(null===a||a instanceof Sk.builtin.none)throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(a)+"' object is not callable");if("function"===typeof a){if(a.sk$klass)return a.apply(null,[b,c,d,e,!0]);if(c)for(g=c.tp$iter(),c=g.tp$iternext();void 0!==c;c=g.tp$iternext())e.push(c);if(b)for(g=Sk.abstr.iter(b),c=g.tp$iternext();void 0!==c;c=g.tp$iternext()){if(!Sk.builtin.checkString(c))throw new Sk.builtin.TypeError("Function keywords must be strings");
        d.push(c.v);d.push(Sk.abstr.objectGetItem(b,c,!1))}if(void 0!==d&&0<d.length){if(!a.co_varnames)throw new Sk.builtin.ValueError("Keyword arguments are not supported by this function");g=a.co_numargs-a.co_varnames.length;f=e.length-g;e=e.concat(a.$defaults.slice(f));for(c=0;c<d.length;c+=2){b=a.co_varnames.indexOf(d[c]);if(-1===b)throw new Sk.builtin.TypeError("'"+d[c]+"' is an invalid keyword argument for this function");if(b<f)throw new Sk.builtin.TypeError("Argument given by name ('"+d[c]+"') and position ("+
        (b+g+1)+")");e[b+g]=d[c+1]}}return a.apply(null,e)}f=a.tp$call;if(void 0!==f){if(c)for(g=c.tp$iter(),c=g.tp$iternext();void 0!==c;c=g.tp$iternext())e.push(c);if(b)for(g=Sk.abstr.iter(b),c=g.tp$iternext();void 0!==c;c=g.tp$iternext()){if(!Sk.builtin.checkString(c))throw new Sk.builtin.TypeError("Function keywords must be strings");d.push(c.v);d.push(Sk.abstr.objectGetItem(b,c,!1))}return f.call(a,e,d,b)}f=a.__call__;if(void 0!==f)return e.unshift(a),Sk.misceval.apply(f,b,c,d,e);throw new Sk.builtin.TypeError("'"+
        Sk.abstr.typeName(a)+"' object is not callable");};goog.exportSymbol("Sk.misceval.applyOrSuspend",Sk.misceval.applyOrSuspend);Sk.misceval.buildClass=function(a,b,c,d){var e=Sk.builtin.type,f={};b(a,f,[]);f.__module__=a.__name__;a=new Sk.builtin.str(c);d=new Sk.builtin.tuple(d);b=[];for(var g in f)f.hasOwnProperty(g)&&(b.push(new Sk.builtin.str(g)),b.push(f[g]));b=new Sk.builtin.dict(b);return Sk.misceval.callsim(e,a,d,b)};goog.exportSymbol("Sk.misceval.buildClass",Sk.misceval.buildClass);Sk.builtin.seqtype=function(){throw new Sk.builtin.ExternalError("Cannot instantiate abstract Sk.builtin.seqtype class");};Sk.abstr.setUpInheritance("SequenceType",Sk.builtin.seqtype,Sk.builtin.object);Sk.builtin.seqtype.sk$abstract=!0;Sk.builtin.seqtype.prototype.__len__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__len__",arguments,0,0,!1,!0);return new Sk.builtin.int_(a.sq$length())});
    Sk.builtin.seqtype.prototype.__iter__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__iter__",arguments,0,0,!1,!0);return a.tp$iter()});Sk.builtin.seqtype.prototype.__contains__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__contains__",arguments,1,1,!1,!0);return a.sq$contains(b)?Sk.builtin.bool.true$:Sk.builtin.bool.false$});Sk.builtin.seqtype.prototype.__getitem__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__getitem__",arguments,1,1,!1,!0);return a.mp$subscript(b)});
    Sk.builtin.seqtype.prototype.__add__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__add__",arguments,1,1,!1,!0);return a.sq$concat(b)});Sk.builtin.seqtype.prototype.__mul__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__mul__",arguments,1,1,!1,!0);if(!Sk.misceval.isIndex(b))throw new Sk.builtin.TypeError("can't multiply sequence by non-int of type '"+Sk.abstr.typeName(b)+"'");return a.sq$repeat(b)});
    Sk.builtin.seqtype.prototype.__rmul__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__rmul__",arguments,1,1,!1,!0);return a.sq$repeat(b)});Sk.builtin.list=function(a,b){var c,d,e;if(this instanceof Sk.builtin.list)b=b||!1;else return new Sk.builtin.list(a,b||!0);this.__class__=Sk.builtin.list;if(void 0===a)c=[];else if("[object Array]"===Object.prototype.toString.apply(a))c=a;else{if(Sk.builtin.checkIterable(a))return c=[],d=Sk.abstr.iter(a),e=this,function g(a){for(;;){if(a instanceof Sk.misceval.Suspension)return new Sk.misceval.Suspension(g,a);if(void 0===a)return e.v=c,e;c.push(a);a=d.tp$iternext(b)}}(d.tp$iternext(b));throw new Sk.builtin.TypeError("expecting Array or iterable");
    }this.v=this.v=c;return this};Sk.abstr.setUpInheritance("list",Sk.builtin.list,Sk.builtin.seqtype);Sk.abstr.markUnhashable(Sk.builtin.list);Sk.builtin.list.prototype.list_iter_=function(){var a={tp$iter:function(){return a},$obj:this,$index:0,tp$iternext:function(){return a.$index>=a.$obj.v.length?void 0:a.$obj.v[a.$index++]},tp$name:"list_iterator"};return a};
    Sk.builtin.list.prototype.list_concat_=function(a){var b,c;if(!a.__class__||a.__class__!=Sk.builtin.list)throw new Sk.builtin.TypeError("can only concatenate list to list");c=this.v.slice();for(b=0;b<a.v.length;++b)c.push(a.v[b]);return new Sk.builtin.list(c,!1)};
    Sk.builtin.list.prototype.list_extend_=function(a){var b,c;if(!Sk.builtin.checkIterable(a))throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(a)+"' object is not iterable");if(this==a){c=[];a=Sk.abstr.iter(a);for(b=a.tp$iternext();void 0!==b;b=a.tp$iternext())c.push(b);this.v.push.apply(this.v,c)}else for(a=Sk.abstr.iter(a),b=a.tp$iternext();void 0!==b;b=a.tp$iternext())this.v.push(b);return this};
    Sk.builtin.list.prototype.list_del_item_=function(a){a=Sk.builtin.asnum$(a);if(0>a||a>=this.v.length)throw new Sk.builtin.IndexError("list assignment index out of range");this.list_del_slice_(a,a+1)};Sk.builtin.list.prototype.list_del_slice_=function(a,b){var c;a=Sk.builtin.asnum$(a);b=Sk.builtin.asnum$(b);c=[];c.unshift(b-a);c.unshift(a);this.v.splice.apply(this.v,c)};
    Sk.builtin.list.prototype.list_ass_item_=function(a,b){a=Sk.builtin.asnum$(a);if(0>a||a>=this.v.length)throw new Sk.builtin.IndexError("list assignment index out of range");this.v[a]=b};Sk.builtin.list.prototype.list_ass_slice_=function(a,b,c){a=Sk.builtin.asnum$(a);b=Sk.builtin.asnum$(b);if(Sk.builtin.checkIterable(c))c=(new Sk.builtin.list(c,!1)).v.slice(0);else throw new Sk.builtin.TypeError("can only assign an iterable");c.unshift(b-a);c.unshift(a);this.v.splice.apply(this.v,c)};
    Sk.builtin.list.prototype.$r=function(){var a,b,c=[];a=Sk.abstr.iter(this);for(b=a.tp$iternext();void 0!==b;b=a.tp$iternext())b===this?c.push("[...]"):c.push(Sk.misceval.objectRepr(b).v);return new Sk.builtin.str("["+c.join(", ")+"]")};
    Sk.builtin.list.prototype.tp$richcompare=function(a,b){var c,d,e,f,g;if(this===a&&Sk.misceval.opAllowsEquality(b))return!0;if(!a.__class__||a.__class__!=Sk.builtin.list)return"Eq"===b?!1:"NotEq"===b?!0:!1;g=this.v;a=a.v;f=g.length;e=a.length;for(d=0;d<f&&d<e&&(c=Sk.misceval.richCompareBool(g[d],a[d],"Eq"),c);++d);if(d>=f||d>=e)switch(b){case "Lt":return f<e;case "LtE":return f<=e;case "Eq":return f===e;case "NotEq":return f!==e;case "Gt":return f>e;case "GtE":return f>=e;default:goog.asserts.fail()}return"Eq"===
    b?!1:"NotEq"===b?!0:Sk.misceval.richCompareBool(g[d],a[d],b)};Sk.builtin.list.prototype.tp$iter=Sk.builtin.list.prototype.list_iter_;Sk.builtin.list.prototype.sq$length=function(){return this.v.length};Sk.builtin.list.prototype.sq$concat=Sk.builtin.list.prototype.list_concat_;Sk.builtin.list.prototype.nb$add=Sk.builtin.list.prototype.list_concat_;Sk.builtin.list.prototype.nb$inplace_add=Sk.builtin.list.prototype.list_extend_;
    Sk.builtin.list.prototype.sq$repeat=function(a){var b,c,d;if(!Sk.misceval.isIndex(a))throw new Sk.builtin.TypeError("can't multiply sequence by non-int of type '"+Sk.abstr.typeName(a)+"'");a=Sk.misceval.asIndex(a);d=[];for(c=0;c<a;++c)for(b=0;b<this.v.length;++b)d.push(this.v[b]);return new Sk.builtin.list(d,!1)};Sk.builtin.list.prototype.nb$multiply=Sk.builtin.list.prototype.sq$repeat;
    Sk.builtin.list.prototype.nb$inplace_multiply=function(a){var b,c,d;if(!Sk.misceval.isIndex(a))throw new Sk.builtin.TypeError("can't multiply sequence by non-int of type '"+Sk.abstr.typeName(a)+"'");a=Sk.misceval.asIndex(a);d=this.v.length;for(c=1;c<a;++c)for(b=0;b<d;++b)this.v.push(this.v[b]);return this};Sk.builtin.list.prototype.sq$ass_item=Sk.builtin.list.prototype.list_ass_item_;Sk.builtin.list.prototype.sq$del_item=Sk.builtin.list.prototype.list_del_item_;
    Sk.builtin.list.prototype.sq$ass_slice=Sk.builtin.list.prototype.list_ass_slice_;Sk.builtin.list.prototype.sq$del_slice=Sk.builtin.list.prototype.list_del_slice_;Sk.builtin.list.prototype.sq$contains=function(a){var b,c;b=this.tp$iter();for(c=b.tp$iternext();void 0!==c;c=b.tp$iternext())if(Sk.misceval.richCompareBool(c,a,"Eq"))return!0;return!1};
    Sk.builtin.list.prototype.list_subscript_=function(a){var b,c;if(Sk.misceval.isIndex(a)){if(c=Sk.misceval.asIndex(a),void 0!==c){0>c&&(c=this.v.length+c);if(0>c||c>=this.v.length)throw new Sk.builtin.IndexError("list index out of range");return this.v[c]}}else if(a instanceof Sk.builtin.slice)return b=[],a.sssiter$(this,function(a,c){b.push(c.v[a])}),new Sk.builtin.list(b,!1);throw new Sk.builtin.TypeError("list indices must be integers, not "+Sk.abstr.typeName(a));};
    Sk.builtin.list.prototype.list_ass_subscript_=function(a,b){var c,d,e;if(Sk.misceval.isIndex(a)){if(c=Sk.misceval.asIndex(a),void 0!==c){0>c&&(c=this.v.length+c);this.list_ass_item_(c,b);return}}else if(a instanceof Sk.builtin.slice){c=a.slice_indices_(this.v.length);if(1===c[2])this.list_ass_slice_(c[0],c[1],b);else{e=[];a.sssiter$(this,function(a,b){e.push(a)});d=0;if(e.length!==b.v.length)throw new Sk.builtin.ValueError("attempt to assign sequence of size "+b.v.length+" to extended slice of size "+
        e.length);for(c=0;c<e.length;++c)this.v.splice(e[c],1,b.v[d]),d+=1}return}throw new Sk.builtin.TypeError("list indices must be integers, not "+Sk.abstr.typeName(a));};
    Sk.builtin.list.prototype.list_del_subscript_=function(a){var b,c,d,e;if(Sk.misceval.isIndex(a)){if(e=Sk.misceval.asIndex(a),void 0!==e){0>e&&(e=this.v.length+e);this.list_del_item_(e);return}}else if(a instanceof Sk.builtin.slice){e=a.slice_indices_(this.v.length);1===e[2]?this.list_del_slice_(e[0],e[1]):(d=this,c=0,b=0<e[2]?1:0,a.sssiter$(this,function(a,e){d.v.splice(a-c,1);c+=b}));return}throw new Sk.builtin.TypeError("list indices must be integers, not "+typeof a);};
    Sk.builtin.list.prototype.mp$subscript=Sk.builtin.list.prototype.list_subscript_;Sk.builtin.list.prototype.mp$ass_subscript=Sk.builtin.list.prototype.list_ass_subscript_;Sk.builtin.list.prototype.mp$del_subscript=Sk.builtin.list.prototype.list_del_subscript_;Sk.builtin.list.prototype.__getitem__=new Sk.builtin.func(function(a,b){return Sk.builtin.list.prototype.list_subscript_.call(a,b)});
    Sk.builtin.list.prototype.list_sort_=function(a,b,c,d){var e,f,g,h,k=void 0!==c&&null!==c;f=void 0!==b&&null!==b;var l;if(void 0===d)l=!1;else{if(d===Sk.builtin.none.none$)throw new Sk.builtin.TypeError("an integer is required");l=Sk.misceval.isTrue(d)}d=new Sk.builtin.timSort(a);a.v=[];h=new Sk.builtin.int_(0);if(k)for(d.lt=f?function(a,c){var d=Sk.misceval.callsim(b,a[0],c[0]);return Sk.misceval.richCompareBool(d,h,"Lt")}:function(a,b){return Sk.misceval.richCompareBool(a[0],b[0],"Lt")},g=0;g<d.listlength;g++)f=
        d.list.v[g],e=Sk.misceval.callsim(c,f),d.list.v[g]=[e,f];else f&&(d.lt=function(a,c){var d=Sk.misceval.callsim(b,a,c);return Sk.misceval.richCompareBool(d,h,"Lt")});l&&d.list.list_reverse_(d.list);d.sort();l&&d.list.list_reverse_(d.list);if(k)for(c=0;c<d.listlength;c++)f=d.list.v[c][1],d.list.v[c]=f;c=0<a.sq$length();a.v=d.list.v;if(c)throw new Sk.builtin.OperationError("list modified during sort");return Sk.builtin.none.none$};
    Sk.builtin.list.prototype.list_reverse_=function(a){var b,c,d;Sk.builtin.pyCheckArgs("reverse",arguments,1,1);b=a.v.length;d=a.v;c=[];for(b-=1;-1<b;--b)c.push(d[b]);a.v=c;return Sk.builtin.none.none$};Sk.builtin.list.prototype.__iter__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__iter__",arguments,1,1);return a.list_iter_()});Sk.builtin.list.prototype.append=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("append",arguments,2,2);a.v.push(b);return Sk.builtin.none.none$});
    Sk.builtin.list.prototype.insert=new Sk.builtin.func(function(a,b,c){Sk.builtin.pyCheckArgs("insert",arguments,3,3);if(!Sk.builtin.checkNumber(b))throw new Sk.builtin.TypeError("an integer is required");b=Sk.builtin.asnum$(b);0>b&&(b+=a.v.length);0>b?b=0:b>a.v.length&&(b=a.v.length);a.v.splice(b,0,c);return Sk.builtin.none.none$});Sk.builtin.list.prototype.extend=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("extend",arguments,2,2);a.list_extend_(b);return Sk.builtin.none.none$});
    Sk.builtin.list.prototype.pop=new Sk.builtin.func(function(a,b){var c;Sk.builtin.pyCheckArgs("pop",arguments,1,2);void 0===b&&(b=a.v.length-1);if(!Sk.builtin.checkNumber(b))throw new Sk.builtin.TypeError("an integer is required");b=Sk.builtin.asnum$(b);0>b&&(b+=a.v.length);if(0>b||b>=a.v.length)throw new Sk.builtin.IndexError("pop index out of range");c=a.v[b];a.v.splice(b,1);return c});
    Sk.builtin.list.prototype.remove=new Sk.builtin.func(function(a,b){var c;Sk.builtin.pyCheckArgs("remove",arguments,2,2);c=Sk.builtin.list.prototype.index.func_code(a,b);a.v.splice(Sk.builtin.asnum$(c),1);return Sk.builtin.none.none$});
    Sk.builtin.list.prototype.index=new Sk.builtin.func(function(a,b,c,d){var e,f;Sk.builtin.pyCheckArgs("index",arguments,2,4);if(void 0!==c&&!Sk.builtin.checkInt(c))throw new Sk.builtin.TypeError("slice indices must be integers");if(void 0!==d&&!Sk.builtin.checkInt(d))throw new Sk.builtin.TypeError("slice indices must be integers");e=a.v.length;f=a.v;c=void 0===c?0:c.v;0>c&&(c=0<=c+e?c+e:0);d=void 0===d?e:d.v;0>d&&(d=0<=d+e?d+e:0);for(e=c;e<d;++e)if(Sk.misceval.richCompareBool(f[e],b,"Eq"))return new Sk.builtin.int_(e);
        throw new Sk.builtin.ValueError("list.index(x): x not in list");});Sk.builtin.list.prototype.count=new Sk.builtin.func(function(a,b){var c,d,e,f;Sk.builtin.pyCheckArgs("count",arguments,2,2);f=a.v.length;e=a.v;for(c=d=0;c<f;++c)Sk.misceval.richCompareBool(e[c],b,"Eq")&&(d+=1);return new Sk.builtin.int_(d)});Sk.builtin.list.prototype.reverse=new Sk.builtin.func(Sk.builtin.list.prototype.list_reverse_);Sk.builtin.list.prototype.sort=new Sk.builtin.func(Sk.builtin.list.prototype.list_sort_);
    Sk.builtin.list.prototype.sort.func_code.co_varnames=["__self__","cmp","key","reverse"];goog.exportSymbol("Sk.builtin.list",Sk.builtin.list);Sk.builtin.interned={};
    Sk.builtin.str=function(a){void 0===a&&(a="");if(a instanceof Sk.builtin.str)return a;if(!(this instanceof Sk.builtin.str))return new Sk.builtin.str(a);if(!0===a)a="True";else if(!1===a)a="False";else if(null===a||a instanceof Sk.builtin.none)a="None";else if(a instanceof Sk.builtin.bool)a=a.v?"True":"False";else if("number"===typeof a)a=a.toString(),"Infinity"===a?a="inf":"-Infinity"===a&&(a="-inf");else if("string"!==typeof a){if(void 0!==a.tp$str){a=a.tp$str();if(!(a instanceof Sk.builtin.str))throw new Sk.builtin.ValueError("__str__ didn't return a str");
        return a}return Sk.misceval.objectRepr(a)}if(Sk.builtin.interned["1"+a])return Sk.builtin.interned["1"+a];this.__class__=Sk.builtin.str;this.v=this.v=a;Sk.builtin.interned["1"+a]=this;return this};goog.exportSymbol("Sk.builtin.str",Sk.builtin.str);Sk.abstr.setUpInheritance("str",Sk.builtin.str,Sk.builtin.seqtype);
    Sk.builtin.str.prototype.mp$subscript=function(a){var b;if(Sk.misceval.isIndex(a)){a=Sk.misceval.asIndex(a);0>a&&(a=this.v.length+a);if(0>a||a>=this.v.length)throw new Sk.builtin.IndexError("string index out of range");return new Sk.builtin.str(this.v.charAt(a))}if(a instanceof Sk.builtin.slice)return b="",a.sssiter$(this,function(a,d){0<=a&&a<d.v.length&&(b+=d.v.charAt(a))}),new Sk.builtin.str(b);throw new Sk.builtin.TypeError("string indices must be integers, not "+Sk.abstr.typeName(a));};
    Sk.builtin.str.prototype.sq$length=function(){return this.v.length};Sk.builtin.str.prototype.sq$concat=function(a){if(!a||!Sk.builtin.checkString(a))throw a=Sk.abstr.typeName(a),new Sk.builtin.TypeError("cannot concatenate 'str' and '"+a+"' objects");return new Sk.builtin.str(this.v+a.v)};Sk.builtin.str.prototype.nb$add=Sk.builtin.str.prototype.sq$concat;Sk.builtin.str.prototype.nb$inplace_add=Sk.builtin.str.prototype.sq$concat;
    Sk.builtin.str.prototype.sq$repeat=function(a){var b,c;if(!Sk.misceval.isIndex(a))throw new Sk.builtin.TypeError("can't multiply sequence by non-int of type '"+Sk.abstr.typeName(a)+"'");a=Sk.misceval.asIndex(a);c="";for(b=0;b<a;++b)c+=this.v;return new Sk.builtin.str(c)};Sk.builtin.str.prototype.nb$multiply=Sk.builtin.str.prototype.sq$repeat;Sk.builtin.str.prototype.nb$inplace_multiply=Sk.builtin.str.prototype.sq$repeat;Sk.builtin.str.prototype.sq$item=function(){goog.asserts.fail()};
    Sk.builtin.str.prototype.sq$slice=function(a,b){a=Sk.builtin.asnum$(a);b=Sk.builtin.asnum$(b);0>a&&(a=0);return new Sk.builtin.str(this.v.substr(a,b-a))};Sk.builtin.str.prototype.sq$contains=function(a){if(!(a instanceof Sk.builtin.str))throw new Sk.builtin.TypeError("TypeError: 'In <string> requires string as left operand");return-1!=this.v.indexOf(a.v)};
    Sk.builtin.str.prototype.tp$iter=function(){var a={tp$iter:function(){return a},$obj:this,$index:0,tp$iternext:function(){return a.$index>=a.$obj.v.length?void 0:new Sk.builtin.str(a.$obj.v.substr(a.$index++,1))},tp$name:"str_iterator"};return a};
    Sk.builtin.str.prototype.tp$richcompare=function(a,b){if(a instanceof Sk.builtin.str)switch(b){case "Lt":return this.v<a.v;case "LtE":return this.v<=a.v;case "Eq":return this.v===a.v;case "NotEq":return this.v!==a.v;case "Gt":return this.v>a.v;case "GtE":return this.v>=a.v;default:goog.asserts.fail()}};
    Sk.builtin.str.prototype.$r=function(){var a,b,c,d,e="'";-1!==this.v.indexOf("'")&&-1===this.v.indexOf('"')&&(e='"');d=this.v.length;c=e;for(b=0;b<d;++b)a=this.v.charAt(b),a===e||"\\"===a?c+="\\"+a:"\t"===a?c+="\\t":"\n"===a?c+="\\n":"\r"===a?c+="\\r":" ">a||127<=a?(a=a.charCodeAt(0).toString(16),2>a.length&&(a="0"+a),c+="\\x"+a):c+=a;return new Sk.builtin.str(c+e)};
    Sk.builtin.str.re_escape_=function(a){var b,c,d=[],e=/^[A-Za-z0-9]+$/;for(c=0;c<a.length;++c)b=a.charAt(c),e.test(b)?d.push(b):"\\000"===b?d.push("\\000"):d.push("\\"+b);return d.join("")};Sk.builtin.str.prototype.lower=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("lower",arguments,1,1);return new Sk.builtin.str(a.v.toLowerCase())});Sk.builtin.str.prototype.upper=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("upper",arguments,1,1);return new Sk.builtin.str(a.v.toUpperCase())});
    Sk.builtin.str.prototype.capitalize=new Sk.builtin.func(function(a){var b,c,d;Sk.builtin.pyCheckArgs("capitalize",arguments,1,1);d=a.v;if(0===d.length)return new Sk.builtin.str("");c=d.charAt(0).toUpperCase();for(b=1;b<d.length;b++)c+=d.charAt(b).toLowerCase();return new Sk.builtin.str(c)});
    Sk.builtin.str.prototype.join=new Sk.builtin.func(function(a,b){var c,d,e;Sk.builtin.pyCheckArgs("join",arguments,2,2);Sk.builtin.pyCheckType("seq","iterable",Sk.builtin.checkIterable(b));e=[];c=b.tp$iter();for(d=c.tp$iternext();void 0!==d;d=c.tp$iternext()){if(d.constructor!==Sk.builtin.str)throw new Sk.builtin.TypeError("TypeError: sequence item "+e.length+": expected string, "+typeof d+" found");e.push(d.v)}return new Sk.builtin.str(e.join(a.v))});
    Sk.builtin.str.prototype.split=new Sk.builtin.func(function(a,b,c){var d,e,f,g,h,k;Sk.builtin.pyCheckArgs("split",arguments,1,3);if(void 0===b||b instanceof Sk.builtin.none)b=null;if(null!==b&&!Sk.builtin.checkString(b))throw new Sk.builtin.TypeError("expected a string");if(null!==b&&""===b.v)throw new Sk.builtin.ValueError("empty separator");if(void 0!==c&&!Sk.builtin.checkInt(c))throw new Sk.builtin.TypeError("an integer is required");c=Sk.builtin.asnum$(c);k=/[\s]+/g;h=a.v;null===b?h=goog.string.trimLeft(h):
        (d=b.v.replace(/([.*+?=|\\\/()\[\]\{\}^$])/g,"\\$1"),k=RegExp(d,"g"));g=[];for(d=e=0;null!=(f=k.exec(h))&&f.index!==k.lastIndex&&!(g.push(new Sk.builtin.str(h.substring(e,f.index))),e=k.lastIndex,d+=1,c&&d>=c););h=h.substring(e);(null!==b||0<h.length)&&g.push(new Sk.builtin.str(h));return new Sk.builtin.list(g)});
    Sk.builtin.str.prototype.strip=new Sk.builtin.func(function(a,b){var c;Sk.builtin.pyCheckArgs("strip",arguments,1,2);if(void 0!==b&&!Sk.builtin.checkString(b))throw new Sk.builtin.TypeError("strip arg must be None or str");void 0===b?c=/^\s+|\s+$/g:(c=Sk.builtin.str.re_escape_(b.v),c=RegExp("^["+c+"]+|["+c+"]+$","g"));return new Sk.builtin.str(a.v.replace(c,""))});
    Sk.builtin.str.prototype.lstrip=new Sk.builtin.func(function(a,b){var c;Sk.builtin.pyCheckArgs("lstrip",arguments,1,2);if(void 0!==b&&!Sk.builtin.checkString(b))throw new Sk.builtin.TypeError("lstrip arg must be None or str");void 0===b?c=/^\s+/g:(c=Sk.builtin.str.re_escape_(b.v),c=RegExp("^["+c+"]+","g"));return new Sk.builtin.str(a.v.replace(c,""))});
    Sk.builtin.str.prototype.rstrip=new Sk.builtin.func(function(a,b){var c;Sk.builtin.pyCheckArgs("rstrip",arguments,1,2);if(void 0!==b&&!Sk.builtin.checkString(b))throw new Sk.builtin.TypeError("rstrip arg must be None or str");void 0===b?c=/\s+$/g:(c=Sk.builtin.str.re_escape_(b.v),c=RegExp("["+c+"]+$","g"));return new Sk.builtin.str(a.v.replace(c,""))});
    Sk.builtin.str.prototype.partition=new Sk.builtin.func(function(a,b){var c,d;Sk.builtin.pyCheckArgs("partition",arguments,2,2);Sk.builtin.pyCheckType("sep","string",Sk.builtin.checkString(b));d=new Sk.builtin.str(b);c=a.v.indexOf(d.v);return 0>c?new Sk.builtin.tuple([a,Sk.builtin.str.$emptystr,Sk.builtin.str.$emptystr]):new Sk.builtin.tuple([new Sk.builtin.str(a.v.substring(0,c)),d,new Sk.builtin.str(a.v.substring(c+d.v.length))])});
    Sk.builtin.str.prototype.rpartition=new Sk.builtin.func(function(a,b){var c,d;Sk.builtin.pyCheckArgs("rpartition",arguments,2,2);Sk.builtin.pyCheckType("sep","string",Sk.builtin.checkString(b));d=new Sk.builtin.str(b);c=a.v.lastIndexOf(d.v);return 0>c?new Sk.builtin.tuple([Sk.builtin.str.$emptystr,Sk.builtin.str.$emptystr,a]):new Sk.builtin.tuple([new Sk.builtin.str(a.v.substring(0,c)),d,new Sk.builtin.str(a.v.substring(c+d.v.length))])});
    Sk.builtin.str.prototype.count=new Sk.builtin.func(function(a,b,c,d){var e;Sk.builtin.pyCheckArgs("count",arguments,2,4);if(!Sk.builtin.checkString(b))throw new Sk.builtin.TypeError("expected a character buffer object");if(void 0!==c&&!Sk.builtin.checkInt(c))throw new Sk.builtin.TypeError("slice indices must be integers or None or have an __index__ method");if(void 0!==d&&!Sk.builtin.checkInt(d))throw new Sk.builtin.TypeError("slice indices must be integers or None or have an __index__ method");void 0===
    c?c=0:(c=Sk.builtin.asnum$(c),c=0<=c?c:a.v.length+c);void 0===d?d=a.v.length:(d=Sk.builtin.asnum$(d),d=0<=d?d:a.v.length+d);e=b.v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");e=RegExp(e,"g");return(e=a.v.slice(c,d).match(e))?new Sk.builtin.int_(e.length):new Sk.builtin.int_(0)});
    Sk.builtin.str.prototype.ljust=new Sk.builtin.func(function(a,b,c){var d;Sk.builtin.pyCheckArgs("ljust",arguments,2,3);if(!Sk.builtin.checkInt(b))throw new Sk.builtin.TypeError("integer argument exepcted, got "+Sk.abstr.typeName(b));if(void 0!==c&&(!Sk.builtin.checkString(c)||1!==c.v.length))throw new Sk.builtin.TypeError("must be char, not "+Sk.abstr.typeName(c));c=void 0===c?" ":c.v;b=Sk.builtin.asnum$(b);if(a.v.length>=b)return a;d=Array.prototype.join.call({length:Math.floor(b-a.v.length)+1},
        c);return new Sk.builtin.str(a.v+d)});
    Sk.builtin.str.prototype.rjust=new Sk.builtin.func(function(a,b,c){var d;Sk.builtin.pyCheckArgs("rjust",arguments,2,3);if(!Sk.builtin.checkInt(b))throw new Sk.builtin.TypeError("integer argument exepcted, got "+Sk.abstr.typeName(b));if(void 0!==c&&(!Sk.builtin.checkString(c)||1!==c.v.length))throw new Sk.builtin.TypeError("must be char, not "+Sk.abstr.typeName(c));c=void 0===c?" ":c.v;b=Sk.builtin.asnum$(b);if(a.v.length>=b)return a;d=Array.prototype.join.call({length:Math.floor(b-a.v.length)+1},
        c);return new Sk.builtin.str(d+a.v)});
    Sk.builtin.str.prototype.center=new Sk.builtin.func(function(a,b,c){var d;Sk.builtin.pyCheckArgs("center",arguments,2,3);if(!Sk.builtin.checkInt(b))throw new Sk.builtin.TypeError("integer argument exepcted, got "+Sk.abstr.typeName(b));if(void 0!==c&&(!Sk.builtin.checkString(c)||1!==c.v.length))throw new Sk.builtin.TypeError("must be char, not "+Sk.abstr.typeName(c));c=void 0===c?" ":c.v;b=Sk.builtin.asnum$(b);if(a.v.length>=b)return a;d=Array.prototype.join.call({length:Math.floor((b-a.v.length)/
            2)+1},c);d=d+a.v+d;d.length<b&&(d+=c);return new Sk.builtin.str(d)});
    Sk.builtin.str.prototype.find=new Sk.builtin.func(function(a,b,c,d){var e;Sk.builtin.pyCheckArgs("find",arguments,2,4);if(!Sk.builtin.checkString(b))throw new Sk.builtin.TypeError("expected a character buffer object");if(void 0!==c&&!Sk.builtin.checkInt(c))throw new Sk.builtin.TypeError("slice indices must be integers or None or have an __index__ method");if(void 0!==d&&!Sk.builtin.checkInt(d))throw new Sk.builtin.TypeError("slice indices must be integers or None or have an __index__ method");void 0===
    c?c=0:(c=Sk.builtin.asnum$(c),c=0<=c?c:a.v.length+c);void 0===d?d=a.v.length:(d=Sk.builtin.asnum$(d),d=0<=d?d:a.v.length+d);e=a.v.indexOf(b.v,c);return new Sk.builtin.int_(e>=c&&e<d?e:-1)});Sk.builtin.str.prototype.index=new Sk.builtin.func(function(a,b,c,d){var e;Sk.builtin.pyCheckArgs("index",arguments,2,4);e=Sk.misceval.callsim(a.find,a,b,c,d);if(-1===Sk.builtin.asnum$(e))throw new Sk.builtin.ValueError("substring not found");return e});
    Sk.builtin.str.prototype.rfind=new Sk.builtin.func(function(a,b,c,d){var e;Sk.builtin.pyCheckArgs("rfind",arguments,2,4);if(!Sk.builtin.checkString(b))throw new Sk.builtin.TypeError("expected a character buffer object");if(void 0!==c&&!Sk.builtin.checkInt(c))throw new Sk.builtin.TypeError("slice indices must be integers or None or have an __index__ method");if(void 0!==d&&!Sk.builtin.checkInt(d))throw new Sk.builtin.TypeError("slice indices must be integers or None or have an __index__ method");void 0===
    c?c=0:(c=Sk.builtin.asnum$(c),c=0<=c?c:a.v.length+c);void 0===d?d=a.v.length:(d=Sk.builtin.asnum$(d),d=0<=d?d:a.v.length+d);e=a.v.lastIndexOf(b.v,d);e=e!==d?e:a.v.lastIndexOf(b.v,d-1);return new Sk.builtin.int_(e>=c&&e<d?e:-1)});Sk.builtin.str.prototype.rindex=new Sk.builtin.func(function(a,b,c,d){var e;Sk.builtin.pyCheckArgs("rindex",arguments,2,4);e=Sk.misceval.callsim(a.rfind,a,b,c,d);if(-1===Sk.builtin.asnum$(e))throw new Sk.builtin.ValueError("substring not found");return e});
    Sk.builtin.str.prototype.startswith=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("startswith",arguments,2,2);Sk.builtin.pyCheckType("tgt","string",Sk.builtin.checkString(b));return new Sk.builtin.bool(0===a.v.indexOf(b.v))});Sk.builtin.str.prototype.endswith=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("endswith",arguments,2,2);Sk.builtin.pyCheckType("tgt","string",Sk.builtin.checkString(b));return new Sk.builtin.bool(-1!==a.v.indexOf(b.v,a.v.length-b.v.length))});
    Sk.builtin.str.prototype.replace=new Sk.builtin.func(function(a,b,c,d){var e,f;Sk.builtin.pyCheckArgs("replace",arguments,3,4);Sk.builtin.pyCheckType("oldS","string",Sk.builtin.checkString(b));Sk.builtin.pyCheckType("newS","string",Sk.builtin.checkString(c));if(void 0!==d&&!Sk.builtin.checkInt(d))throw new Sk.builtin.TypeError("integer argument expected, got "+Sk.abstr.typeName(d));d=Sk.builtin.asnum$(d);f=RegExp(Sk.builtin.str.re_escape_(b.v),"g");if(void 0===d||0>d)return new Sk.builtin.str(a.v.replace(f,
        c.v));e=0;return new Sk.builtin.str(a.v.replace(f,function(a){e++;return e<=d?c.v:a}))});Sk.builtin.str.prototype.zfill=new Sk.builtin.func(function(a,b){var c=a.v,d,e,f="";Sk.builtin.pyCheckArgs("zfill",arguments,2,2);if(!Sk.builtin.checkInt(b))throw new Sk.builtin.TypeError("integer argument exepected, got "+Sk.abstr.typeName(b));d=b.v-c.length;e="+"===c[0]||"-"===c[0]?1:0;for(var g=0;g<d;g++)f+="0";c=c.substr(0,e)+f+c.substr(e);return new Sk.builtin.str(c)});
    Sk.builtin.str.prototype.isdigit=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("isdigit",arguments,1,1);return new Sk.builtin.bool(/^\d+$/.test(a.v))});Sk.builtin.str.prototype.isspace=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("isspace",arguments,1,1);return new Sk.builtin.bool(/^\s+$/.test(a.v))});
    Sk.builtin.str.prototype.expandtabs=new Sk.builtin.func(function(a,b){var c,d;Sk.builtin.pyCheckArgs("expandtabs",arguments,1,2);if(void 0!==b&&!Sk.builtin.checkInt(b))throw new Sk.builtin.TypeError("integer argument exepected, got "+Sk.abstr.typeName(b));b=void 0===b?8:Sk.builtin.asnum$(b);c=Array(b+1).join(" ");d=a.v.replace(/([^\r\n\t]*)\t/g,function(a,d){return d+c.slice(d.length%b)});return new Sk.builtin.str(d)});
    Sk.builtin.str.prototype.swapcase=new Sk.builtin.func(function(a){var b;Sk.builtin.pyCheckArgs("swapcase",arguments,1,1);b=a.v.replace(/[a-z]/gi,function(a){var b=a.toLowerCase();return b===a?a.toUpperCase():b});return new Sk.builtin.str(b)});
    Sk.builtin.str.prototype.splitlines=new Sk.builtin.func(function(a,b){var c=a.v,d=0,e=a.v.length,f=[],g,h=0;Sk.builtin.pyCheckArgs("splitlines",arguments,1,2);if(void 0!==b&&!Sk.builtin.checkBool(b))throw new Sk.builtin.TypeError("boolean argument expected, got "+Sk.abstr.typeName(b));b=void 0===b?!1:b.v;for(d=0;d<e;d++)if(g=c.charAt(d),"\n"===c.charAt(d+1)&&"\r"===g)g=d+2,h=c.slice(h,g),b||(h=h.replace(/(\r|\n)/g,"")),f.push(new Sk.builtin.str(h)),h=g;else if("\n"===g&&"\r"!==c.charAt(d-1)||"\r"===
        g)g=d+1,h=c.slice(h,g),b||(h=h.replace(/(\r|\n)/g,"")),f.push(new Sk.builtin.str(h)),h=g;h<e&&(h=c.slice(h,e),b||(h=h.replace(/(\r|\n)/g,"")),f.push(new Sk.builtin.str(h)));return new Sk.builtin.list(f)});Sk.builtin.str.prototype.title=new Sk.builtin.func(function(a){var b;Sk.builtin.pyCheckArgs("title",arguments,1,1);b=a.v.replace(/[a-z][a-z]*/gi,function(a){return a[0].toUpperCase()+a.substr(1).toLowerCase()});return new Sk.builtin.str(b)});
    Sk.builtin.str.prototype.isalpha=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("isalpha",arguments,1,1);return new Sk.builtin.bool(a.v.length&&goog.string.isAlpha(a.v))});Sk.builtin.str.prototype.isalnum=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("isalnum",arguments,1,1);return new Sk.builtin.bool(a.v.length&&goog.string.isAlphaNumeric(a.v))});
    Sk.builtin.str.prototype.isnumeric=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("isnumeric",arguments,1,1);return new Sk.builtin.bool(a.v.length&&goog.string.isNumeric(a.v))});Sk.builtin.str.prototype.islower=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("islower",arguments,1,1);return new Sk.builtin.bool(a.v.length&&/[a-z]/.test(a.v)&&!/[A-Z]/.test(a.v))});
    Sk.builtin.str.prototype.isupper=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("isupper",arguments,1,1);return new Sk.builtin.bool(a.v.length&&!/[a-z]/.test(a.v)&&/[A-Z]/.test(a.v))});
    Sk.builtin.str.prototype.istitle=new Sk.builtin.func(function(a){var b=a.v,c=!1,d=!1,e,f;Sk.builtin.pyCheckArgs("istitle",arguments,1,1);for(e=0;e<b.length;e++)if(f=b.charAt(e),!/[a-z]/.test(f)&&/[A-Z]/.test(f)){if(d)return new Sk.builtin.bool(!1);c=d=!0}else if(/[a-z]/.test(f)&&!/[A-Z]/.test(f)){if(!d)return new Sk.builtin.bool(!1);c=!0}else d=!1;return new Sk.builtin.bool(c)});
    Sk.builtin.str.prototype.nb$remainder=function(a){var b,c;a.constructor===Sk.builtin.tuple||void 0!==a.mp$subscript&&a.constructor!==Sk.builtin.str||(a=new Sk.builtin.tuple([a]));c=0;b=this.v.replace(/%(\([a-zA-Z0-9]+\))?([#0 +\-]+)?(\*|[0-9]+)?(\.(\*|[0-9]+))?[hlL]?([diouxXeEfFgGcrs%])/g,function(b,e,f,g,h,k,l){var m,p,n,r,q,t;g=Sk.builtin.asnum$(g);h=Sk.builtin.asnum$(h);if(void 0===e||""===e)m=c++;""===h&&(h=void 0);p=n=r=q=t=!1;f&&(-1!==f.indexOf("-")?q=!0:-1!==f.indexOf("0")&&(t=!0),-1!==f.indexOf("+")?
        n=!0:-1!==f.indexOf(" ")&&(r=!0),p=-1!==f.indexOf("#"));h&&(h=parseInt(h.substr(1),10));f=function(a,b){var c,d,e,f;b=Sk.builtin.asnum$(b);e=!1;"number"===typeof a?(0>a&&(a=-a,e=!0),f=a.toString(b)):a instanceof Sk.builtin.float_?(f=a.str$(b,!1),2<f.length&&".0"===f.substr(-2)&&(f=f.substr(0,f.length-2)),e=a.nb$isnegative()):a instanceof Sk.builtin.int_?(f=a.str$(b,!1),e=a.nb$isnegative()):a instanceof Sk.builtin.lng&&(f=a.str$(b,!1),e=a.nb$isnegative());goog.asserts.assert(void 0!==f,"unhandled number format");
        c=!1;if(h)for(d=f.length;d<h;++d)f="0"+f,c=!0;d="";e?d="-":n?d="+"+d:r&&(d=" "+d);p&&(16===b?d+="0x":8!==b||(c||"0"===f)||(d+="0"));return[d,f]};b=function(a){var b,c=a[0];a=a[1];if(g)if(g=parseInt(g,10),b=a.length+c.length,t)for(;b<g;++b)a="0"+a;else if(q)for(;b<g;++b)a+=" ";else for(;b<g;++b)c=" "+c;return c+a};if(a.constructor===Sk.builtin.tuple)e=a.v[m];else if(void 0!==a.mp$subscript&&void 0!==e)e=e.substring(1,e.length-1),e=a.mp$subscript(new Sk.builtin.str(e));else if(a.constructor===Sk.builtin.dict||
        a.constructor===Sk.builtin.list)e=a;else throw new Sk.builtin.AttributeError(a.tp$name+" instance has no attribute 'mp$subscript'");if("d"===l||"i"===l)return b(f(e,10));if("o"===l)return b(f(e,8));if("x"===l)return b(f(e,16));if("X"===l)return b(f(e,16)).toUpperCase();if("f"===l||"F"===l||"e"===l||"E"===l||"g"===l||"G"===l){m=Sk.builtin.asnum$(e);"string"===typeof m&&(m=Number(m));if(Infinity===m)return"inf";if(-Infinity===m)return"-inf";if(isNaN(m))return"nan";f=["toExponential","toFixed","toPrecision"]["efg".indexOf(l.toLowerCase())];
        if(void 0===h||""===h)if("e"===l||"E"===l)h=6;else if("f"===l||"F"===l)h=7;f=m[f](h);Sk.builtin.checkFloat(e)&&0===m&&-Infinity===1/m&&(f="-"+f);-1!=="EFG".indexOf(l)&&(f=f.toUpperCase());return b(["",f])}if("c"===l){if("number"===typeof e)return String.fromCharCode(e);if(e instanceof Sk.builtin.int_)return String.fromCharCode(e.v);if(e instanceof Sk.builtin.float_)return String.fromCharCode(e.v);if(e instanceof Sk.builtin.lng)return String.fromCharCode(e.str$(10,!1)[0]);if(e.constructor===Sk.builtin.str)return e.v.substr(0,
        1);throw new Sk.builtin.TypeError("an integer is required");}if("r"===l)return l=Sk.builtin.repr(e),h?l.v.substr(0,h):l.v;if("s"===l){l=new Sk.builtin.str(e);if(h)return l.v.substr(0,h);g&&(l.v=b([" ",l.v]));return l.v}if("%"===l)return"%"});return new Sk.builtin.str(b)};var format=function(a){var b,c,d,e={};Sk.builtin.pyCheckArgs("format",arguments,0,Infinity,!0,!0);b=new Sk.builtins.tuple(Array.prototype.slice.call(arguments,1));c=new Sk.builtins.dict(a);if(void 0===arguments[1])return b.v;d=0;if(0!==c.size){c=Sk.misceval.callsim(Sk.builtin.dict.prototype.items,c);for(var f in c.v)e[c.v[f].v[0].v]=c.v[f].v[1].v}for(var g in b.v)"0"!==g&&(e[g-1]=b.v[g].v);b=b.v[0].v.replace(/{(((?:\d+)|(?:\w+))?((?:\.(\w+))|(?:\[((?:\d+)|(?:\w+))\])?))?(?:\!([rs]))?(?:\:((?:(.)?([<\>\=\^]))?([\+\-\s])?(#)?(0)?(\d+)?(,)?(?:\.(\d+))?([bcdeEfFgGnosxX%])?))?}/g,
        function(a,b,c,f,g,n,r,q,t,y,v,z,F,w,E,x,s,K,C){var D,u,A,B,G,H,I,J;w=Sk.builtin.asnum$(w);x=Sk.builtin.asnum$(x);if(void 0!==n&&""!==n)u=e[c][n].v,d++;else if(void 0!==g&&""!==g)u=e[c][g].v,d++;else if(void 0!==c&&""!==c)u=e[c],d++;else if(void 0===b||""===b)a=e[d],d++,u=a;else if(b instanceof Sk.builtin.int_||b instanceof Sk.builtin.float_||b instanceof Sk.builtin.lng||!isNaN(parseInt(b,10)))a=e[b],d++,u=a;""===x&&(x=void 0);if(void 0===t||""===t)t=" ";B=G=H=I=!1;q&&(void 0!==v&&""!==v&&(-1!=="-".indexOf(v)?
            I=!0:-1!=="+".indexOf(v)?G=!0:-1!==" ".indexOf(v)&&(H=!0)),z&&(B=-1!=="#".indexOf(z)),void 0===w||""===w||void 0!==t&&""!==t||(t=" "),-1!=="%".indexOf(s)&&(J=!0));x&&(x=parseInt(x,10));D=function(a){if(void 0===r||""===r)return a;if("r"==r)return a=new Sk.builtin.str(a),a=Sk.builtin.repr(a),a.v;if("s"==r)return a=new Sk.builtin.str(a),a.v};A=function(a,b){var c;J&&(b+="%");if(void 0!==w&&""!==w)if(w=parseInt(w,10),c=b.length+a.length,I)for(;c<w;++c)b+=t;else if(-1!==">".indexOf(y))for(;c<w;++c)a=
            t+a;else if(-1!=="^".indexOf(y))for(;c<w;++c)0===c%2?a=t+a:1===c%2&&(b+=t);else if(-1!=="=".indexOf(y))for(;c<w;++c)b=t+b;else for(;c<w;++c)b+=t;return D(a+b)};v=function(a,b){var c,d,e;b=Sk.builtin.asnum$(b);d=!1;if(void 0===q)return D(u);"number"!==typeof a||x?x?(0>a&&(a=-a,d=!0),a=Number(a.toString(b)),e=a.toFixed(x)):a instanceof Sk.builtin.float_?(e=a.str$(b,!1),2<e.length&&".0"===e.substr(-2)&&(e=e.substr(0,e.length-2)),d=a.nb$isnegative()):a instanceof Sk.builtin.int_?(e=a.str$(b,!1),d=a.nb$isnegative()):
            a instanceof Sk.builtin.lng?(e=a.str$(b,!1),d=a.nb$isnegative()):e=a:(0>a&&(a=-a,d=!0),e=a.toString(b));c="";d?c="-":G?c="+":H&&(c=" ");B&&(16===b?c+="0x":8===b&&"0"!==e?c+="0o":2===b&&"0"!==e&&(c+="0b"));"n"===s?e=e.toLocaleString():-1!==",".indexOf(E)&&(d=e.toString().split("."),d[0]=d[0].replace(/\B(?=(\d{3})+(?!\d))/g,","),e=d.join("."));return A(c,e)};if("d"===s||"n"===s||""===s||void 0===s)return v(u,10);if("b"===s)return v(u,2);if("o"===s)return v(u,8);if("x"===s)return v(u,16);if("X"===s)return v(u,
            16).toUpperCase();if("f"===s||"F"===s||"e"===s||"E"===s||"g"===s||"G"===s){if(B)throw new Sk.builtin.ValueError("Alternate form (#) not allowed in float format specifier");a=Sk.builtin.asnum$(u);"string"===typeof a&&(a=Number(a));if(Infinity===a)return A("","inf");if(-Infinity===a)return A("-","inf");if(isNaN(a))return A("","nan");z=["toExponential","toFixed","toPrecision"]["efg".indexOf(s.toLowerCase())];if(void 0===x||""===x)if("e"===s||"E"===s||"%"===s)x=6;else if("f"===s||"F"===s)x=6;z=a[z](x);
            -1!=="EFG".indexOf(s)&&(z=z.toUpperCase());return v(z,10)}if("c"===s){if("number"===typeof u)return A("",String.fromCharCode(u));if(u instanceof Sk.builtin.int_)return A("",String.fromCharCode(u.v));if(u instanceof Sk.builtin.float_)return A("",String.fromCharCode(u.v));if(u instanceof Sk.builtin.lng)return A("",String.fromCharCode(u.str$(10,!1)[0]));if(u.constructor===Sk.builtin.str)return A("",u.v.substr(0,1));throw new Sk.builtin.TypeError("an integer is required");}if(J)return void 0===x&&(x=
            7),v(100*u,10)});return new Sk.builtin.str(b)};format.co_kwargs=!0;Sk.builtin.str.prototype.format=new Sk.builtin.func(format);Sk.builtin.tuple=function(a){var b;if(!(this instanceof Sk.builtin.tuple))return new Sk.builtin.tuple(a);void 0===a&&(a=[]);if("[object Array]"===Object.prototype.toString.apply(a))this.v=a;else if(Sk.builtin.checkIterable(a))for(this.v=[],a=Sk.abstr.iter(a),b=a.tp$iternext();void 0!==b;b=a.tp$iternext())this.v.push(b);else throw new Sk.builtin.TypeError("expecting Array or iterable");this.__class__=Sk.builtin.tuple;this.v=this.v;return this};Sk.abstr.setUpInheritance("tuple",Sk.builtin.tuple,Sk.builtin.seqtype);
    Sk.builtin.tuple.prototype.$r=function(){var a,b;if(0===this.v.length)return new Sk.builtin.str("()");b=[];for(a=0;a<this.v.length;++a)b[a]=Sk.misceval.objectRepr(this.v[a]).v;a=b.join(", ");1===this.v.length&&(a+=",");return new Sk.builtin.str("("+a+")")};
    Sk.builtin.tuple.prototype.mp$subscript=function(a){var b,c;if(Sk.misceval.isIndex(a)){if(c=Sk.misceval.asIndex(a),void 0!==c){0>c&&(c=this.v.length+c);if(0>c||c>=this.v.length)throw new Sk.builtin.IndexError("tuple index out of range");return this.v[c]}}else if(a instanceof Sk.builtin.slice)return b=[],a.sssiter$(this,function(a,c){b.push(c.v[a])}),new Sk.builtin.tuple(b);throw new Sk.builtin.TypeError("tuple indices must be integers, not "+Sk.abstr.typeName(a));};
    Sk.builtin.tuple.prototype.tp$hash=function(){var a,b,c=1000003,d=3430008,e=this.v.length;for(b=0;b<e;++b){a=Sk.builtin.hash(this.v[b]).v;if(-1===a)return new Sk.builtin.int_(-1);d=(d^a)*c;c+=82520+e+e}d+=97531;-1===d&&(d=-2);return new Sk.builtin.int_(d|0)};Sk.builtin.tuple.prototype.sq$repeat=function(a){var b,c,d;a=Sk.misceval.asIndex(a);d=[];for(c=0;c<a;++c)for(b=0;b<this.v.length;++b)d.push(this.v[b]);return new Sk.builtin.tuple(d)};Sk.builtin.tuple.prototype.nb$multiply=Sk.builtin.tuple.prototype.sq$repeat;
    Sk.builtin.tuple.prototype.nb$inplace_multiply=Sk.builtin.tuple.prototype.sq$repeat;Sk.builtin.tuple.prototype.tp$iter=function(){var a={tp$iter:function(){return a},$obj:this,$index:0,tp$iternext:function(){return a.$index>=a.$obj.v.length?void 0:a.$obj.v[a.$index++]},tp$name:"tuple_iterator"};return a};Sk.builtin.tuple.prototype.__iter__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__iter__",arguments,1,1);return a.tp$iter()});
    Sk.builtin.tuple.prototype.tp$richcompare=function(a,b){var c,d,e,f,g;if(!a.__class__||!Sk.misceval.isTrue(Sk.builtin.isinstance(a,Sk.builtin.tuple)))return"Eq"===b?!1:"NotEq"===b?!0:!1;g=this.v;a=a.v;f=g.length;e=a.length;for(d=0;d<f&&d<e&&(c=Sk.misceval.richCompareBool(g[d],a[d],"Eq"),c);++d);if(d>=f||d>=e)switch(b){case "Lt":return f<e;case "LtE":return f<=e;case "Eq":return f===e;case "NotEq":return f!==e;case "Gt":return f>e;case "GtE":return f>=e;default:goog.asserts.fail()}return"Eq"===b?!1:
        "NotEq"===b?!0:Sk.misceval.richCompareBool(g[d],a[d],b)};Sk.builtin.tuple.prototype.sq$concat=function(a){if(a.__class__!=Sk.builtin.tuple)throw a='can only concatenate tuple (not "'+(Sk.abstr.typeName(a)+'") to tuple'),new Sk.builtin.TypeError(a);return new Sk.builtin.tuple(this.v.concat(a.v))};Sk.builtin.tuple.prototype.sq$contains=function(a){var b,c;b=this.tp$iter();for(c=b.tp$iternext();void 0!==c;c=b.tp$iternext())if(Sk.misceval.richCompareBool(c,a,"Eq"))return!0;return!1};
    Sk.builtin.tuple.prototype.nb$add=Sk.builtin.tuple.prototype.sq$concat;Sk.builtin.tuple.prototype.nb$inplace_add=Sk.builtin.tuple.prototype.sq$concat;Sk.builtin.tuple.prototype.sq$length=function(){return this.v.length};Sk.builtin.tuple.prototype.index=new Sk.builtin.func(function(a,b){var c,d=a.v.length,e=a.v;for(c=0;c<d;++c)if(Sk.misceval.richCompareBool(e[c],b,"Eq"))return new Sk.builtin.int_(c);throw new Sk.builtin.ValueError("tuple.index(x): x not in tuple");});
    Sk.builtin.tuple.prototype.count=new Sk.builtin.func(function(a,b){var c,d=a.v.length,e=a.v,f=0;for(c=0;c<d;++c)Sk.misceval.richCompareBool(e[c],b,"Eq")&&(f+=1);return new Sk.builtin.int_(f)});goog.exportSymbol("Sk.builtin.tuple",Sk.builtin.tuple);Sk.builtin.dict=function(a){var b,c,d;if(!(this instanceof Sk.builtin.dict))return new Sk.builtin.dict(a);void 0===a&&(a=[]);this.size=0;if("[object Array]"===Object.prototype.toString.apply(a))for(b=0;b<a.length;b+=2)this.mp$ass_subscript(a[b],a[b+1]);else if(a instanceof Sk.builtin.dict)for(c=Sk.abstr.iter(a),d=c.tp$iternext();void 0!==d;d=c.tp$iternext())b=a.mp$subscript(d),void 0===b&&(b=null),this.mp$ass_subscript(d,b);else if(Sk.builtin.checkIterable(a))for(c=Sk.abstr.iter(a),b=c.tp$iternext();void 0!==
    b;b=c.tp$iternext())if(b.mp$subscript)this.mp$ass_subscript(b.mp$subscript(0),b.mp$subscript(1));else throw new Sk.builtin.TypeError("element "+this.size+" is not a sequence");else throw new Sk.builtin.TypeError("object is not iterable");this.__class__=Sk.builtin.dict;return this};Sk.abstr.setUpInheritance("dict",Sk.builtin.dict,Sk.builtin.object);Sk.abstr.markUnhashable(Sk.builtin.dict);var kf=Sk.builtin.hash;
    Sk.builtin.dict.prototype.key$lookup=function(a,b){var c,d,e;for(e=0;e<a.items.length;e++)if(c=a.items[e],d=Sk.misceval.richCompareBool(c.lhs,b,"Eq"))return c;return null};Sk.builtin.dict.prototype.key$pop=function(a,b){var c,d,e;for(e=0;e<a.items.length;e++)if(c=a.items[e],d=Sk.misceval.richCompareBool(c.lhs,b,"Eq"))return a.items.splice(e,1),this.size-=1,c};Sk.builtin.dict.prototype.mp$lookup=function(a){var b=this[kf(a).v];if(void 0!==b&&(a=this.key$lookup(b,a)))return a.rhs};
    Sk.builtin.dict.prototype.mp$subscript=function(a){Sk.builtin.pyCheckArgs("[]",arguments,1,2,!1,!1);var b;b=this.mp$lookup(a);if(void 0!==b)return b;b=new Sk.builtin.str(a);throw new Sk.builtin.KeyError(b.v);};Sk.builtin.dict.prototype.sq$contains=function(a){Sk.builtin.pyCheckArgs("__contains__()",arguments,1,1,!1,!1);return void 0!==this.mp$lookup(a)};
    Sk.builtin.dict.prototype.mp$ass_subscript=function(a,b){var c=kf(a),d=this[c.v];void 0===d?(d={$hash:c,items:[{lhs:a,rhs:b}]},this[c.v]=d,this.size+=1):(c=this.key$lookup(d,a))?c.rhs=b:(d.items.push({lhs:a,rhs:b}),this.size+=1)};Sk.builtin.dict.prototype.mp$del_subscript=function(a){Sk.builtin.pyCheckArgs("del",arguments,1,1,!1,!1);var b=this[kf(a).v];if(void 0!==b&&(b=this.key$pop(b,a),void 0!==b))return;b=new Sk.builtin.str(a);throw new Sk.builtin.KeyError(b.v);};
    Sk.builtin.dict.prototype.tp$iter=function(){var a,b,c,d,e=[];for(d in this)if(this.hasOwnProperty(d)&&(c=this[d])&&void 0!==c.$hash&&void 0!==c.items)for(b=0;b<c.items.length;b++)e.push(c.items[b].lhs);return a={tp$iter:function(){return a},$obj:this,$index:0,$keys:e,tp$iternext:function(){return a.$index>=a.$keys.length?void 0:a.$keys[a.$index++]},tp$name:"dict_keyiterator"}};
    Sk.builtin.dict.prototype.$r=function(){var a,b,c,d=[];b=Sk.abstr.iter(this);for(c=b.tp$iternext();void 0!==c;c=b.tp$iternext())a=this.mp$subscript(c),void 0===a&&(a=null),a===this?d.push(Sk.misceval.objectRepr(c).v+": {...}"):d.push(Sk.misceval.objectRepr(c).v+": "+Sk.misceval.objectRepr(a).v);return new Sk.builtin.str("{"+d.join(", ")+"}")};Sk.builtin.dict.prototype.mp$length=function(){return this.size};
    Sk.builtin.dict.prototype.get=new Sk.builtin.func(function(a,b,c){Sk.builtin.pyCheckArgs("get()",arguments,1,2,!1,!0);var d;void 0===c&&(c=Sk.builtin.none.none$);d=a.mp$lookup(b);void 0===d&&(d=c);return d});Sk.builtin.dict.prototype.pop=new Sk.builtin.func(function(a,b,c){Sk.builtin.pyCheckArgs("pop()",arguments,1,2,!1,!0);var d=kf(b),d=a[d.v];if(void 0!==d&&(d=a.key$pop(d,b),void 0!==d))return d.rhs;if(void 0!==c)return c;d=new Sk.builtin.str(b);throw new Sk.builtin.KeyError(d.v);});
    Sk.builtin.dict.prototype.has_key=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("has_key()",arguments,1,1,!1,!0);return new Sk.builtin.bool(a.sq$contains(b))});Sk.builtin.dict.prototype.items=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("items()",arguments,0,0,!1,!0);var b,c,d,e=[];c=Sk.abstr.iter(a);for(d=c.tp$iternext();void 0!==d;d=c.tp$iternext())b=a.mp$subscript(d),void 0===b&&(b=null),e.push(new Sk.builtin.tuple([d,b]));return new Sk.builtin.list(e)});
    Sk.builtin.dict.prototype.keys=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("keys()",arguments,0,0,!1,!0);var b,c,d=[];b=Sk.abstr.iter(a);for(c=b.tp$iternext();void 0!==c;c=b.tp$iternext())d.push(c);return new Sk.builtin.list(d)});Sk.builtin.dict.prototype.values=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("values()",arguments,0,0,!1,!0);var b,c,d=[];c=Sk.abstr.iter(a);for(b=c.tp$iternext();void 0!==b;b=c.tp$iternext())b=a.mp$subscript(b),void 0===b&&(b=null),d.push(b);return new Sk.builtin.list(d)});
    Sk.builtin.dict.prototype.clear=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("clear()",arguments,0,0,!1,!0);var b,c;c=Sk.abstr.iter(a);for(b=c.tp$iternext();void 0!==b;b=c.tp$iternext())a.mp$del_subscript(b)});Sk.builtin.dict.prototype.setdefault=new Sk.builtin.func(function(a,b,c){try{return a.mp$subscript(b)}catch(d){return void 0===c&&(c=Sk.builtin.none.none$),a.mp$ass_subscript(b,c),c}});
    Sk.builtin.dict.prototype.dict_merge=function(a){var b,c,d;if(a instanceof Sk.builtin.dict)for(b=a.tp$iter(),c=b.tp$iternext();void 0!==c;c=b.tp$iternext()){d=a.mp$subscript(c);if(void 0===d)throw new Sk.builtin.AttributeError("cannot get item for key: "+c.v);this.mp$ass_subscript(c,d)}else for(b=Sk.misceval.callsim(a.keys,a),b=Sk.abstr.iter(b),c=b.tp$iternext();void 0!==c;c=b.tp$iternext()){d=a.tp$getitem(c);if(void 0===d)throw new Sk.builtin.AttributeError("cannot get item for key: "+c.v);this.mp$ass_subscript(c,
        d)}};
    var update_f=function(a,b,c){if(void 0!==c&&("dict"===c.tp$name||c.keys))b.dict_merge(c);else if(void 0!==c&&Sk.builtin.checkIterable(c)){var d,e=0;c=Sk.abstr.iter(c);for(d=c.tp$iternext();void 0!==d;d=c.tp$iternext(),e++){if(!Sk.builtin.checkIterable(d))throw new Sk.builtin.TypeError("cannot convert dictionary update sequence element #"+e+" to a sequence");if(2===d.sq$length()){var f=Sk.abstr.iter(d);d=f.tp$iternext();f=f.tp$iternext();b.mp$ass_subscript(d,f)}else throw new Sk.builtin.ValueError("dictionary update sequence element #"+e+
        " has length "+d.sq$length()+"; 2 is required");}}else if(void 0!==c)throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(c)+"' object is not iterable");a=new Sk.builtins.dict(a);b.dict_merge(a);return Sk.builtin.none.none$};update_f.co_kwargs=!0;Sk.builtin.dict.prototype.update=new Sk.builtin.func(update_f);Sk.builtin.dict.prototype.__contains__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__contains__",arguments,1,1,!1,!0);return Sk.builtin.dict.prototype.sq$contains.call(a,b)});
    Sk.builtin.dict.prototype.__cmp__=new Sk.builtin.func(function(a,b,c){return Sk.builtin.NotImplemented.NotImplemented$});Sk.builtin.dict.prototype.__delitem__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__delitem__",arguments,1,1,!1,!0);return Sk.builtin.dict.prototype.mp$del_subscript.call(a,b)});Sk.builtin.dict.prototype.__getitem__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__getitem__",arguments,1,1,!1,!0);return Sk.builtin.dict.prototype.mp$subscript.call(a,b)});
    Sk.builtin.dict.prototype.__setitem__=new Sk.builtin.func(function(a,b,c){Sk.builtin.pyCheckArgs("__setitem__",arguments,2,2,!1,!0);return Sk.builtin.dict.prototype.mp$ass_subscript.call(a,b,c)});Sk.builtin.dict.prototype.__hash__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__hash__",arguments,0,0,!1,!0);return Sk.builtin.dict.prototype.tp$hash.call(a)});Sk.builtin.dict.prototype.__len__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__len__",arguments,0,0,!1,!0);return Sk.builtin.dict.prototype.mp$length.call(a)});
    Sk.builtin.dict.prototype.__getattr__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__getattr__",arguments,1,1,!1,!0);if(!Sk.builtin.checkString(b))throw new Sk.builtin.TypeError("__getattr__ requires a string");return Sk.builtin.dict.prototype.tp$getattr.call(a,Sk.ffi.remapToJs(b))});Sk.builtin.dict.prototype.__iter__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__iter__",arguments,0,0,!1,!0);return Sk.builtin.dict.prototype.tp$iter.call(a)});
    Sk.builtin.dict.prototype.__repr__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__repr__",arguments,0,0,!1,!0);return Sk.builtin.dict.prototype.$r.call(a)});
    Sk.builtin.dict.prototype.ob$eq=function(a){var b,c,d;if(this===a)return Sk.builtin.bool.true$;if(!(a instanceof Sk.builtin.dict))return Sk.builtin.NotImplemented.NotImplemented$;if(this.size!==a.size)return Sk.builtin.bool.false$;b=this.tp$iter();for(c=b.tp$iternext();void 0!==c;c=b.tp$iternext())if(d=this.mp$subscript(c),c=a.mp$subscript(c),!Sk.misceval.richCompareBool(d,c,"Eq"))return Sk.builtin.bool.false$;return Sk.builtin.bool.true$};
    Sk.builtin.dict.prototype.ob$ne=function(a){a=this.ob$eq(a);return a instanceof Sk.builtin.NotImplemented?a:a.v?Sk.builtin.bool.false$:Sk.builtin.bool.true$};Sk.builtin.dict.prototype.copy=new Sk.builtin.func(function(a){throw new Sk.builtin.NotImplementedError("dict.copy is not yet implemented in Skulpt");});Sk.builtin.dict.prototype.fromkeys=new Sk.builtin.func(function(a,b){throw new Sk.builtin.NotImplementedError("dict.fromkeys is not yet implemented in Skulpt");});
    Sk.builtin.dict.prototype.iteritems=new Sk.builtin.func(function(a){throw new Sk.builtin.NotImplementedError("dict.iteritems is not yet implemented in Skulpt");});Sk.builtin.dict.prototype.iterkeys=new Sk.builtin.func(function(a){throw new Sk.builtin.NotImplementedError("dict.iterkeys is not yet implemented in Skulpt");});Sk.builtin.dict.prototype.itervalues=new Sk.builtin.func(function(a){throw new Sk.builtin.NotImplementedError("dict.itervalues is not yet implemented in Skulpt");});
    Sk.builtin.dict.prototype.popitem=new Sk.builtin.func(function(a){throw new Sk.builtin.NotImplementedError("dict.popitem is not yet implemented in Skulpt");});Sk.builtin.dict.prototype.viewitems=new Sk.builtin.func(function(a){throw new Sk.builtin.NotImplementedError("dict.viewitems is not yet implemented in Skulpt");});Sk.builtin.dict.prototype.viewkeys=new Sk.builtin.func(function(a){throw new Sk.builtin.NotImplementedError("dict.viewkeys is not yet implemented in Skulpt");});
    Sk.builtin.dict.prototype.viewvalues=new Sk.builtin.func(function(a){throw new Sk.builtin.NotImplementedError("dict.viewvalues is not yet implemented in Skulpt");});goog.exportSymbol("Sk.builtin.dict",Sk.builtin.dict);Sk.builtin.numtype=function(){throw new Sk.builtin.ExternalError("Cannot instantiate abstract Sk.builtin.numtype class");};Sk.abstr.setUpInheritance("NumericType",Sk.builtin.numtype,Sk.builtin.object);Sk.builtin.numtype.sk$abstract=!0;Sk.builtin.numtype.prototype.__abs__=new Sk.builtin.func(function(a){if(void 0===a.nb$abs)throw new Sk.builtin.NotImplementedError("__abs__ is not yet implemented");Sk.builtin.pyCheckArgs("__abs__",arguments,0,0,!1,!0);return a.nb$abs()});
    Sk.builtin.numtype.prototype.__neg__=new Sk.builtin.func(function(a){if(void 0===a.nb$negative)throw new Sk.builtin.NotImplementedError("__neg__ is not yet implemented");Sk.builtin.pyCheckArgs("__neg__",arguments,0,0,!1,!0);return a.nb$negative()});Sk.builtin.numtype.prototype.__pos__=new Sk.builtin.func(function(a){if(void 0===a.nb$positive)throw new Sk.builtin.NotImplementedError("__pos__ is not yet implemented");Sk.builtin.pyCheckArgs("__pos__",arguments,0,0,!1,!0);return a.nb$positive()});
    Sk.builtin.numtype.prototype.__int__=new Sk.builtin.func(function(a){if(void 0===a.nb$int_)throw new Sk.builtin.NotImplementedError("__int__ is not yet implemented");Sk.builtin.pyCheckArgs("__int__",arguments,0,0,!1,!0);return a.nb$int_()});Sk.builtin.numtype.prototype.__long__=new Sk.builtin.func(function(a){if(void 0===a.nb$lng)throw new Sk.builtin.NotImplementedError("__long__ is not yet implemented");Sk.builtin.pyCheckArgs("__long__",arguments,0,0,!1,!0);return a.nb$lng()});
    Sk.builtin.numtype.prototype.__float__=new Sk.builtin.func(function(a){if(void 0===a.nb$float_)throw new Sk.builtin.NotImplementedError("__float__ is not yet implemented");Sk.builtin.pyCheckArgs("__float__",arguments,0,0,!1,!0);return a.nb$float_()});Sk.builtin.numtype.prototype.__add__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$add)throw new Sk.builtin.NotImplementedError("__add__ is not yet implemented");Sk.builtin.pyCheckArgs("__add__",arguments,1,1,!1,!0);return a.nb$add(b)});
    Sk.builtin.numtype.prototype.__radd__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$reflected_add)throw new Sk.builtin.NotImplementedError("__radd__ is not yet implemented");Sk.builtin.pyCheckArgs("__radd__",arguments,1,1,!1,!0);return a.nb$reflected_add(b)});Sk.builtin.numtype.prototype.__sub__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$subtract)throw new Sk.builtin.NotImplementedError("__sub__ is not yet implemented");Sk.builtin.pyCheckArgs("__sub__",arguments,1,1,!1,!0);return a.nb$subtract(b)});
    Sk.builtin.numtype.prototype.__rsub__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$reflected_subtract)throw new Sk.builtin.NotImplementedError("__rsub__ is not yet implemented");Sk.builtin.pyCheckArgs("__rsub__",arguments,1,1,!1,!0);return a.nb$reflected_subtract(b)});
    Sk.builtin.numtype.prototype.__mul__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$multiply)throw new Sk.builtin.NotImplementedError("__mul__ is not yet implemented");Sk.builtin.pyCheckArgs("__mul__",arguments,1,1,!1,!0);return a.nb$multiply(b)});Sk.builtin.numtype.prototype.__rmul__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$reflected_multiply)throw new Sk.builtin.NotImplementedError("__rmul__ is not yet implemented");Sk.builtin.pyCheckArgs("__rmul__",arguments,1,1,!1,!0);return a.nb$reflected_multiply(b)});
    Sk.builtin.numtype.prototype.__div__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$divide)throw new Sk.builtin.NotImplementedError("__div__ is not yet implemented");Sk.builtin.pyCheckArgs("__div__",arguments,1,1,!1,!0);return a.nb$divide(b)});Sk.builtin.numtype.prototype.__rdiv__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$reflected_divide)throw new Sk.builtin.NotImplementedError("__rdiv__ is not yet implemented");Sk.builtin.pyCheckArgs("__rdiv__",arguments,1,1,!1,!0);return a.nb$reflected_divide(b)});
    Sk.builtin.numtype.prototype.__floordiv__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$floor_divide)throw new Sk.builtin.NotImplementedError("__floordiv__ is not yet implemented");Sk.builtin.pyCheckArgs("__floordiv__",arguments,1,1,!1,!0);return a.nb$floor_divide(b)});
    Sk.builtin.numtype.prototype.__rfloordiv__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$reflected_floor_divide)throw new Sk.builtin.NotImplementedError("__rfloordiv__ is not yet implemented");Sk.builtin.pyCheckArgs("__rfloordiv__",arguments,1,1,!1,!0);return a.nb$reflected_floor_divide(b)});
    Sk.builtin.numtype.prototype.__mod__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$remainder)throw new Sk.builtin.NotImplementedError("__mod__ is not yet implemented");Sk.builtin.pyCheckArgs("__mod__",arguments,1,1,!1,!0);return a.nb$remainder(b)});Sk.builtin.numtype.prototype.__rmod__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$reflected_remainder)throw new Sk.builtin.NotImplementedError("__rmod__ is not yet implemented");Sk.builtin.pyCheckArgs("__rmod__",arguments,1,1,!1,!0);return a.nb$reflected_remainder(b)});
    Sk.builtin.numtype.prototype.__divmod__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$divmod)throw new Sk.builtin.NotImplementedError("__divmod__ is not yet implemented");Sk.builtin.pyCheckArgs("__divmod__",arguments,1,1,!1,!0);return a.nb$divmod(b)});
    Sk.builtin.numtype.prototype.__rdivmod__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$reflected_divmod)throw new Sk.builtin.NotImplementedError("__rdivmod__ is not yet implemented");Sk.builtin.pyCheckArgs("__rdivmod__",arguments,1,1,!1,!0);return a.nb$reflected_divmod(b)});
    Sk.builtin.numtype.prototype.__pow__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$power)throw new Sk.builtin.NotImplementedError("__pow__ is not yet implemented");Sk.builtin.pyCheckArgs("__pow__",arguments,1,1,!1,!0);return a.nb$power(b)});Sk.builtin.numtype.prototype.__rpow__=new Sk.builtin.func(function(a,b){if(void 0===a.nb$reflected_power)throw new Sk.builtin.NotImplementedError("__rpow__ is not yet implemented");Sk.builtin.pyCheckArgs("__rpow__",arguments,1,1,!1,!0);return a.nb$reflected_power(b)});
    Sk.builtin.numtype.prototype.__coerce__=new Sk.builtin.func(function(a,b){throw new Sk.builtin.NotImplementedError("__coerce__ is not yet implemented");});Sk.builtin.numtype.prototype.nb$add=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$reflected_add=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$inplace_add=function(a){return Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.numtype.prototype.nb$subtract=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$reflected_subtract=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$inplace_subtract=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$multiply=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$reflected_multiply=function(a){return Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.numtype.prototype.nb$inplace_multiply=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$divide=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$reflected_divide=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$inplace_divide=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$floor_divide=function(a){return Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.numtype.prototype.nb$reflected_floor_divide=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$inplace_floor_divide=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$remainder=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$reflected_remainder=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$inplace_remainder=function(a){return Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.numtype.prototype.nb$divmod=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$reflected_divmod=function(a){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$power=function(a,b){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$reflected_power=function(a,b){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$inplace_power=function(a){return Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.numtype.prototype.nb$abs=function(){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$negative=function(){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$positive=function(){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$nonzero=function(){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.numtype.prototype.nb$isnegative=function(){return Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.numtype.prototype.nb$ispositive=function(){return Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.biginteger=function(a,b,c){null!=a&&("number"==typeof a?this.fromNumber(a,b,c):null==b&&"string"!=typeof a?this.fromString(a,256):this.fromString(a,b))};Sk.builtin.biginteger.canary=0xdeadbeefcafe;Sk.builtin.biginteger.j_lm=15715070==(Sk.builtin.biginteger.canary&16777215);Sk.builtin.biginteger.nbi=function(){return new Sk.builtin.biginteger(null)};
    Sk.builtin.biginteger.prototype.am1=function(a,b,c,d,e,f){for(var g;0<=--f;)g=b*this[a++]+c[d]+e,e=Math.floor(g/67108864),c[d++]=g&67108863;return e};Sk.builtin.biginteger.prototype.am2=function(a,b,c,d,e,f){for(var g,h,k=b&32767,l=b>>15;0<=--f;)h=this[a]&32767,g=this[a++]>>15,b=l*h+g*k,h=k*h+((b&32767)<<15)+c[d]+(e&1073741823),e=(h>>>30)+(b>>>15)+l*g+(e>>>30),c[d++]=h&1073741823;return e};
    Sk.builtin.biginteger.prototype.am3=function(a,b,c,d,e,f){for(var g,h,k=b&16383,l=b>>14;0<=--f;)h=this[a]&16383,g=this[a++]>>14,b=l*h+g*k,h=k*h+((b&16383)<<14)+c[d]+e,e=(h>>28)+(b>>14)+l*g,c[d++]=h&268435455;return e};Sk.builtin.biginteger.prototype.am=Sk.builtin.biginteger.prototype.am3;Sk.builtin.biginteger.dbits=28;Sk.builtin.biginteger.prototype.DB=Sk.builtin.biginteger.dbits;Sk.builtin.biginteger.prototype.DM=(1<<Sk.builtin.biginteger.dbits)-1;Sk.builtin.biginteger.prototype.DV=1<<Sk.builtin.biginteger.dbits;
    Sk.builtin.biginteger.BI_FP=52;Sk.builtin.biginteger.prototype.FV=Math.pow(2,Sk.builtin.biginteger.BI_FP);Sk.builtin.biginteger.prototype.F1=Sk.builtin.biginteger.BI_FP-Sk.builtin.biginteger.dbits;Sk.builtin.biginteger.prototype.F2=2*Sk.builtin.biginteger.dbits-Sk.builtin.biginteger.BI_FP;Sk.builtin.biginteger.BI_RM="0123456789abcdefghijklmnopqrstuvwxyz";Sk.builtin.biginteger.BI_RC=[];var rr,vv;rr=48;for(vv=0;9>=vv;++vv)Sk.builtin.biginteger.BI_RC[rr++]=vv;rr=97;
    for(vv=10;36>vv;++vv)Sk.builtin.biginteger.BI_RC[rr++]=vv;rr=65;for(vv=10;36>vv;++vv)Sk.builtin.biginteger.BI_RC[rr++]=vv;Sk.builtin.biginteger.int2char=function(a){return Sk.builtin.biginteger.BI_RM.charAt(a)};Sk.builtin.biginteger.intAt=function(a,b){var c=Sk.builtin.biginteger.BI_RC[a.charCodeAt(b)];return null==c?-1:c};Sk.builtin.biginteger.prototype.bnpCopyTo=function(a){var b;for(b=this.t-1;0<=b;--b)a[b]=this[b];a.t=this.t;a.s=this.s};
    Sk.builtin.biginteger.prototype.bnpFromInt=function(a){this.t=1;this.s=0>a?-1:0;0<a?this[0]=a:-1>a?this[0]=a+this.DV:this.t=0};Sk.builtin.biginteger.nbv=function(a){var b=new Sk.builtin.biginteger(null);b.bnpFromInt(a);return b};
    Sk.builtin.biginteger.prototype.bnpFromString=function(a,b){var c,d,e,f,g;if(16==b)g=4;else if(8==b)g=3;else if(256==b)g=8;else if(2==b)g=1;else if(32==b)g=5;else if(4==b)g=2;else{this.fromRadix(a,b);return}this.s=this.t=0;d=a.length;e=!1;for(f=0;0<=--d;)c=8==g?a[d]&255:Sk.builtin.biginteger.intAt(a,d),0>c?"-"==a.charAt(d)&&(e=!0):(e=!1,0===f?this[this.t++]=c:f+g>this.DB?(this[this.t-1]|=(c&(1<<this.DB-f)-1)<<f,this[this.t++]=c>>this.DB-f):this[this.t-1]|=c<<f,f+=g,f>=this.DB&&(f-=this.DB));8==g&&
    0!==(a[0]&128)&&(this.s=-1,0<f&&(this[this.t-1]|=(1<<this.DB-f)-1<<f));this.clamp();e&&Sk.builtin.biginteger.ZERO.subTo(this,this)};Sk.builtin.biginteger.prototype.bnpClamp=function(){for(var a=this.s&this.DM;0<this.t&&this[this.t-1]==a;)--this.t};
    Sk.builtin.biginteger.prototype.bnToString=function(a){var b,c,d,e,f,g;if(0>this.s)return"-"+this.negate().toString(a);if(16==a)g=4;else if(8==a)g=3;else if(2==a)g=1;else if(32==a)g=5;else if(4==a)g=2;else return this.toRadix(a);b=(1<<g)-1;d=!1;e="";f=this.t;a=this.DB-f*this.DB%g;if(0<f--)for(a<this.DB&&0<(c=this[f]>>a)&&(d=!0,e=Sk.builtin.biginteger.int2char(c));0<=f;)a<g?(c=(this[f]&(1<<a)-1)<<g-a,c|=this[--f]>>(a+=this.DB-g)):(c=this[f]>>(a-=g)&b,0>=a&&(a+=this.DB,--f)),0<c&&(d=!0),d&&(e+=Sk.builtin.biginteger.int2char(c));
        return d?e:"0"};Sk.builtin.biginteger.prototype.bnNegate=function(){var a=Sk.builtin.biginteger.nbi();Sk.builtin.biginteger.ZERO.subTo(this,a);return a};Sk.builtin.biginteger.prototype.bnAbs=function(){return 0>this.s?this.negate():this};Sk.builtin.biginteger.prototype.bnCompareTo=function(a){var b,c=this.s-a.s;if(0!==c)return c;b=this.t;c=b-a.t;if(0!==c)return 0>this.s?-c:c;for(;0<=--b;)if(0!==(c=this[b]-a[b]))return c;return 0};
    Sk.builtin.biginteger.nbits=function(a){var b=1,c;0!==(c=a>>>16)&&(a=c,b+=16);0!==(c=a>>8)&&(a=c,b+=8);0!==(c=a>>4)&&(a=c,b+=4);0!==(c=a>>2)&&(a=c,b+=2);0!==a>>1&&(b+=1);return b};Sk.builtin.biginteger.prototype.bnBitLength=function(){return 0>=this.t?0:this.DB*(this.t-1)+Sk.builtin.biginteger.nbits(this[this.t-1]^this.s&this.DM)};Sk.builtin.biginteger.prototype.bnpDLShiftTo=function(a,b){var c;for(c=this.t-1;0<=c;--c)b[c+a]=this[c];for(c=a-1;0<=c;--c)b[c]=0;b.t=this.t+a;b.s=this.s};
    Sk.builtin.biginteger.prototype.bnpDRShiftTo=function(a,b){var c;for(c=a;c<this.t;++c)b[c-a]=this[c];b.t=Math.max(this.t-a,0);b.s=this.s};Sk.builtin.biginteger.prototype.bnpLShiftTo=function(a,b){var c=a%this.DB,d=this.DB-c,e=(1<<d)-1,f=Math.floor(a/this.DB),g=this.s<<c&this.DM,h;for(h=this.t-1;0<=h;--h)b[h+f+1]=this[h]>>d|g,g=(this[h]&e)<<c;for(h=f-1;0<=h;--h)b[h]=0;b[f]=g;b.t=this.t+f+1;b.s=this.s;b.clamp()};
    Sk.builtin.biginteger.prototype.bnpRShiftTo=function(a,b){var c,d,e,f,g;b.s=this.s;g=Math.floor(a/this.DB);if(g>=this.t)b.t=0;else{f=a%this.DB;e=this.DB-f;d=(1<<f)-1;b[0]=this[g]>>f;for(c=g+1;c<this.t;++c)b[c-g-1]|=(this[c]&d)<<e,b[c-g]=this[c]>>f;0<f&&(b[this.t-g-1]|=(this.s&d)<<e);b.t=this.t-g;b.clamp()}};
    Sk.builtin.biginteger.prototype.bnpSubTo=function(a,b){for(var c=0,d=0,e=Math.min(a.t,this.t);c<e;)d+=this[c]-a[c],b[c++]=d&this.DM,d>>=this.DB;if(a.t<this.t){for(d-=a.s;c<this.t;)d+=this[c],b[c++]=d&this.DM,d>>=this.DB;d+=this.s}else{for(d+=this.s;c<a.t;)d-=a[c],b[c++]=d&this.DM,d>>=this.DB;d-=a.s}b.s=0>d?-1:0;-1>d?b[c++]=this.DV+d:0<d&&(b[c++]=d);b.t=c;b.clamp()};
    Sk.builtin.biginteger.prototype.bnpMultiplyTo=function(a,b){var c=this.abs(),d=a.abs(),e=c.t;for(b.t=e+d.t;0<=--e;)b[e]=0;for(e=0;e<d.t;++e)b[e+c.t]=c.am(0,d[e],b,e,0,c.t);b.s=0;b.clamp();this.s!=a.s&&Sk.builtin.biginteger.ZERO.subTo(b,b)};
    Sk.builtin.biginteger.prototype.bnpSquareTo=function(a){for(var b,c=this.abs(),d=a.t=2*c.t;0<=--d;)a[d]=0;for(d=0;d<c.t-1;++d)b=c.am(d,c[d],a,2*d,0,1),(a[d+c.t]+=c.am(d+1,2*c[d],a,2*d+1,b,c.t-d-1))>=c.DV&&(a[d+c.t]-=c.DV,a[d+c.t+1]=1);0<a.t&&(a[a.t-1]+=c.am(d,c[d],a,2*d,0,1));a.s=0;a.clamp()};
    Sk.builtin.biginteger.prototype.bnpDivRemTo=function(a,b,c){var d,e,f,g,h,k,l,m,p,n,r,q;m=a.abs();if(!(0>=m.t))if(h=this.abs(),h.t<m.t)null!=b&&b.fromInt(0),null!=c&&this.copyTo(c);else if(null==c&&(c=Sk.builtin.biginteger.nbi()),n=Sk.builtin.biginteger.nbi(),r=this.s,q=a.s,a=this.DB-Sk.builtin.biginteger.nbits(m[m.t-1]),0<a?(m.lShiftTo(a,n),h.lShiftTo(a,c)):(m.copyTo(n),h.copyTo(c)),p=n.t,m=n[p-1],0!==m){d=m*(1<<this.F1)+(1<p?n[p-2]>>this.F2:0);h=this.FV/d;k=(1<<this.F1)/d;l=1<<this.F2;e=c.t;f=e-
        p;g=null==b?Sk.builtin.biginteger.nbi():b;n.dlShiftTo(f,g);0<=c.compareTo(g)&&(c[c.t++]=1,c.subTo(g,c));Sk.builtin.biginteger.ONE.dlShiftTo(p,g);for(g.subTo(n,n);n.t<p;)n[n.t++]=0;for(;0<=--f;)if(d=c[--e]==m?this.DM:Math.floor(c[e]*h+(c[e-1]+l)*k),(c[e]+=n.am(0,d,c,f,0,p))<d)for(n.dlShiftTo(f,g),c.subTo(g,c);c[e]<--d;)c.subTo(g,c);null!=b&&(c.drShiftTo(p,b),r!=q&&Sk.builtin.biginteger.ZERO.subTo(b,b));c.t=p;c.clamp();0<a&&c.rShiftTo(a,c);0>r&&Sk.builtin.biginteger.ZERO.subTo(c,c)}};
    Sk.builtin.biginteger.prototype.bnMod=function(a){var b=Sk.builtin.biginteger.nbi();this.abs().divRemTo(a,null,b);0>this.s&&0<b.compareTo(Sk.builtin.biginteger.ZERO)&&a.subTo(b,b);return b};Sk.builtin.biginteger.Classic=function(a){this.m=a};Sk.builtin.biginteger.prototype.cConvert=function(a){return 0>a.s||0<=a.compareTo(this.m)?a.mod(this.m):a};Sk.builtin.biginteger.prototype.cRevert=function(a){return a};Sk.builtin.biginteger.prototype.cReduce=function(a){a.divRemTo(this.m,null,a)};
    Sk.builtin.biginteger.prototype.cMulTo=function(a,b,c){a.multiplyTo(b,c);this.reduce(c)};Sk.builtin.biginteger.prototype.cSqrTo=function(a,b){a.squareTo(b);this.reduce(b)};Sk.builtin.biginteger.Classic.prototype.convert=Sk.builtin.biginteger.prototype.cConvert;Sk.builtin.biginteger.Classic.prototype.revert=Sk.builtin.biginteger.prototype.cRevert;Sk.builtin.biginteger.Classic.prototype.reduce=Sk.builtin.biginteger.prototype.cReduce;Sk.builtin.biginteger.Classic.prototype.mulTo=Sk.builtin.biginteger.prototype.cMulTo;
    Sk.builtin.biginteger.Classic.prototype.sqrTo=Sk.builtin.biginteger.prototype.cSqrTo;Sk.builtin.biginteger.prototype.bnpInvDigit=function(){var a,b;if(1>this.t)return 0;b=this[0];if(0===(b&1))return 0;a=b&3;a=a*(2-(b&15)*a)&15;a=a*(2-(b&255)*a)&255;a=a*(2-((b&65535)*a&65535))&65535;a=a*(2-b*a%this.DV)%this.DV;return 0<a?this.DV-a:-a};Sk.builtin.biginteger.Montgomery=function(a){this.m=a;this.mp=a.invDigit();this.mpl=this.mp&32767;this.mph=this.mp>>15;this.um=(1<<a.DB-15)-1;this.mt2=2*a.t};
    Sk.builtin.biginteger.prototype.montConvert=function(a){var b=Sk.builtin.biginteger.nbi();a.abs().dlShiftTo(this.m.t,b);b.divRemTo(this.m,null,b);0>a.s&&0<b.compareTo(Sk.builtin.biginteger.ZERO)&&this.m.subTo(b,b);return b};Sk.builtin.biginteger.prototype.montRevert=function(a){var b=Sk.builtin.biginteger.nbi();a.copyTo(b);this.reduce(b);return b};
    Sk.builtin.biginteger.prototype.montReduce=function(a){for(var b,c,d;a.t<=this.mt2;)a[a.t++]=0;for(d=0;d<this.m.t;++d)for(c=a[d]&32767,b=c*this.mpl+((c*this.mph+(a[d]>>15)*this.mpl&this.um)<<15)&a.DM,c=d+this.m.t,a[c]+=this.m.am(0,b,a,d,0,this.m.t);a[c]>=a.DV;)a[c]-=a.DV,a[++c]++;a.clamp();a.drShiftTo(this.m.t,a);0<=a.compareTo(this.m)&&a.subTo(this.m,a)};Sk.builtin.biginteger.prototype.montSqrTo=function(a,b){a.squareTo(b);this.reduce(b)};
    Sk.builtin.biginteger.prototype.montMulTo=function(a,b,c){a.multiplyTo(b,c);this.reduce(c)};Sk.builtin.biginteger.Montgomery.prototype.convert=Sk.builtin.biginteger.prototype.montConvert;Sk.builtin.biginteger.Montgomery.prototype.revert=Sk.builtin.biginteger.prototype.montRevert;Sk.builtin.biginteger.Montgomery.prototype.reduce=Sk.builtin.biginteger.prototype.montReduce;Sk.builtin.biginteger.Montgomery.prototype.mulTo=Sk.builtin.biginteger.prototype.montMulTo;
    Sk.builtin.biginteger.Montgomery.prototype.sqrTo=Sk.builtin.biginteger.prototype.montSqrTo;Sk.builtin.biginteger.prototype.bnpIsEven=function(){return 0===(0<this.t?this[0]&1:this.s)};Sk.builtin.biginteger.prototype.bnpExp=function(a,b){var c,d,e,f,g;if(4294967295<a||1>a)return Sk.builtin.biginteger.ONE;d=Sk.builtin.biginteger.nbi();e=Sk.builtin.biginteger.nbi();f=b.convert(this);g=Sk.builtin.biginteger.nbits(a)-1;for(f.copyTo(d);0<=--g;)b.sqrTo(d,e),0<(a&1<<g)?b.mulTo(e,f,d):(c=d,d=e,e=c);return b.revert(d)};
    Sk.builtin.biginteger.prototype.bnModPowInt=function(a,b){var c;c=256>a||b.isEven()?new Sk.builtin.biginteger.Classic(b):new Sk.builtin.biginteger.Montgomery(b);return this.exp(a,c)};Sk.builtin.biginteger.prototype.copyTo=Sk.builtin.biginteger.prototype.bnpCopyTo;Sk.builtin.biginteger.prototype.fromInt=Sk.builtin.biginteger.prototype.bnpFromInt;Sk.builtin.biginteger.prototype.fromString=Sk.builtin.biginteger.prototype.bnpFromString;Sk.builtin.biginteger.prototype.clamp=Sk.builtin.biginteger.prototype.bnpClamp;
    Sk.builtin.biginteger.prototype.dlShiftTo=Sk.builtin.biginteger.prototype.bnpDLShiftTo;Sk.builtin.biginteger.prototype.drShiftTo=Sk.builtin.biginteger.prototype.bnpDRShiftTo;Sk.builtin.biginteger.prototype.lShiftTo=Sk.builtin.biginteger.prototype.bnpLShiftTo;Sk.builtin.biginteger.prototype.rShiftTo=Sk.builtin.biginteger.prototype.bnpRShiftTo;Sk.builtin.biginteger.prototype.subTo=Sk.builtin.biginteger.prototype.bnpSubTo;Sk.builtin.biginteger.prototype.multiplyTo=Sk.builtin.biginteger.prototype.bnpMultiplyTo;
    Sk.builtin.biginteger.prototype.squareTo=Sk.builtin.biginteger.prototype.bnpSquareTo;Sk.builtin.biginteger.prototype.divRemTo=Sk.builtin.biginteger.prototype.bnpDivRemTo;Sk.builtin.biginteger.prototype.invDigit=Sk.builtin.biginteger.prototype.bnpInvDigit;Sk.builtin.biginteger.prototype.isEven=Sk.builtin.biginteger.prototype.bnpIsEven;Sk.builtin.biginteger.prototype.exp=Sk.builtin.biginteger.prototype.bnpExp;Sk.builtin.biginteger.prototype.toString=Sk.builtin.biginteger.prototype.bnToString;
    Sk.builtin.biginteger.prototype.negate=Sk.builtin.biginteger.prototype.bnNegate;Sk.builtin.biginteger.prototype.abs=Sk.builtin.biginteger.prototype.bnAbs;Sk.builtin.biginteger.prototype.compareTo=Sk.builtin.biginteger.prototype.bnCompareTo;Sk.builtin.biginteger.prototype.bitLength=Sk.builtin.biginteger.prototype.bnBitLength;Sk.builtin.biginteger.prototype.mod=Sk.builtin.biginteger.prototype.bnMod;Sk.builtin.biginteger.prototype.modPowInt=Sk.builtin.biginteger.prototype.bnModPowInt;
    Sk.builtin.biginteger.ZERO=Sk.builtin.biginteger.nbv(0);Sk.builtin.biginteger.ONE=Sk.builtin.biginteger.nbv(1);Sk.builtin.biginteger.prototype.bnClone=function(){var a=Sk.builtin.biginteger.nbi();this.copyTo(a);return a};Sk.builtin.biginteger.prototype.bnIntValue=function(){if(0>this.s){if(1==this.t)return this[0]-this.DV;if(0===this.t)return-1}else{if(1==this.t)return this[0];if(0===this.t)return 0}return(this[1]&(1<<32-this.DB)-1)<<this.DB|this[0]};
    Sk.builtin.biginteger.prototype.bnByteValue=function(){return 0===this.t?this.s:this[0]<<24>>24};Sk.builtin.biginteger.prototype.bnShortValue=function(){return 0===this.t?this.s:this[0]<<16>>16};Sk.builtin.biginteger.prototype.bnpChunkSize=function(a){return Math.floor(Math.LN2*this.DB/Math.log(a))};Sk.builtin.biginteger.prototype.bnSigNum=function(){return 0>this.s?-1:0>=this.t||1==this.t&&0>=this[0]?0:1};
    Sk.builtin.biginteger.prototype.bnpToRadix=function(a){var b,c,d,e,f;null==a&&(a=10);if(0===this.signum()||2>a||36<a)return"0";b=this.chunkSize(a);f=Math.pow(a,b);b=Sk.builtin.biginteger.nbv(f);c=Sk.builtin.biginteger.nbi();d=Sk.builtin.biginteger.nbi();e="";for(this.divRemTo(b,c,d);0<c.signum();)e=(f+d.intValue()).toString(a).substr(1)+e,c.divRemTo(b,c,d);return d.intValue().toString(a)+e};
    Sk.builtin.biginteger.prototype.bnpFromRadix=function(a,b){var c,d,e,f,g,h,k;this.fromInt(0);null==b&&(b=10);k=this.chunkSize(b);e=Math.pow(b,k);f=!1;for(d=h=g=0;d<a.length;++d)if(c=Sk.builtin.biginteger.intAt(a,d),0>c){if("-"==a.charAt(d)&&0===this.signum()&&(f=!0),"."==a.charAt(d))break}else h=b*h+c,++g>=k&&(this.dMultiply(e),this.dAddOffset(h,0),h=g=0);0<g&&(this.dMultiply(Math.pow(b,g)),this.dAddOffset(h,0));f&&Sk.builtin.biginteger.ZERO.subTo(this,this)};
    Sk.builtin.biginteger.prototype.bnpFromNumber=function(a,b,c){if("number"==typeof b)if(2>a)this.fromInt(1);else for(this.fromNumber(a,c),this.testBit(a-1)||this.bitwiseTo(Sk.builtin.biginteger.ONE.shiftLeft(a-1),Sk.builtin.biginteger.op_or,this),this.isEven()&&this.dAddOffset(1,0);!this.isProbablePrime(b);)this.dAddOffset(2,0),this.bitLength()>a&&this.subTo(Sk.builtin.biginteger.ONE.shiftLeft(a-1),this);this.fromString(a+"")};
    Sk.builtin.biginteger.prototype.bnToByteArray=function(){var a,b,c,d=this.t,e=[];e[0]=this.s;a=this.DB-d*this.DB%8;c=0;if(0<d--)for(a<this.DB&&(b=this[d]>>a)!=(this.s&this.DM)>>a&&(e[c++]=b|this.s<<this.DB-a);0<=d;)if(8>a?(b=(this[d]&(1<<a)-1)<<8-a,b|=this[--d]>>(a+=this.DB-8)):(b=this[d]>>(a-=8)&255,0>=a&&(a+=this.DB,--d)),0!==(b&128)&&(b|=-256),0===c&&(this.s&128)!=(b&128)&&++c,0<c||b!=this.s)e[c++]=b;return e};Sk.builtin.biginteger.prototype.bnEquals=function(a){return 0===this.compareTo(a)};
    Sk.builtin.biginteger.prototype.bnMin=function(a){return 0>this.compareTo(a)?this:a};Sk.builtin.biginteger.prototype.bnMax=function(a){return 0<this.compareTo(a)?this:a};Sk.builtin.biginteger.prototype.bnpBitwiseTo=function(a,b,c){var d,e,f=Math.min(a.t,this.t);for(d=0;d<f;++d)c[d]=b(this[d],a[d]);if(a.t<this.t){e=a.s&this.DM;for(d=f;d<this.t;++d)c[d]=b(this[d],e);c.t=this.t}else{e=this.s&this.DM;for(d=f;d<a.t;++d)c[d]=b(e,a[d]);c.t=a.t}c.s=b(this.s,a.s);c.clamp()};
    Sk.builtin.biginteger.op_and=function(a,b){return a&b};Sk.builtin.biginteger.prototype.bnAnd=function(a){var b=Sk.builtin.biginteger.nbi();this.bitwiseTo(a,Sk.builtin.biginteger.op_and,b);return b};Sk.builtin.biginteger.op_or=function(a,b){return a|b};Sk.builtin.biginteger.prototype.bnOr=function(a){var b=Sk.builtin.biginteger.nbi();this.bitwiseTo(a,Sk.builtin.biginteger.op_or,b);return b};Sk.builtin.biginteger.op_xor=function(a,b){return a^b};
    Sk.builtin.biginteger.prototype.bnXor=function(a){var b=Sk.builtin.biginteger.nbi();this.bitwiseTo(a,Sk.builtin.biginteger.op_xor,b);return b};Sk.builtin.biginteger.op_andnot=function(a,b){return a&~b};Sk.builtin.biginteger.prototype.bnAndNot=function(a){var b=Sk.builtin.biginteger.nbi();this.bitwiseTo(a,Sk.builtin.biginteger.op_andnot,b);return b};
    Sk.builtin.biginteger.prototype.bnNot=function(){var a,b=Sk.builtin.biginteger.nbi();for(a=0;a<this.t;++a)b[a]=this.DM&~this[a];b.t=this.t;b.s=~this.s;return b};Sk.builtin.biginteger.prototype.bnShiftLeft=function(a){var b=Sk.builtin.biginteger.nbi();0>a?this.rShiftTo(-a,b):this.lShiftTo(a,b);return b};Sk.builtin.biginteger.prototype.bnShiftRight=function(a){var b=Sk.builtin.biginteger.nbi();0>a?this.lShiftTo(-a,b):this.rShiftTo(a,b);return b};
    Sk.builtin.biginteger.lbit=function(a){var b;if(0===a)return-1;b=0;0===(a&65535)&&(a>>=16,b+=16);0===(a&255)&&(a>>=8,b+=8);0===(a&15)&&(a>>=4,b+=4);0===(a&3)&&(a>>=2,b+=2);0===(a&1)&&++b;return b};Sk.builtin.biginteger.prototype.bnGetLowestSetBit=function(){var a;for(a=0;a<this.t;++a)if(0!==this[a])return a*this.DB+Sk.builtin.biginteger.lbit(this[a]);return 0>this.s?this.t*this.DB:-1};Sk.builtin.biginteger.cbit=function(a){for(var b=0;0!==a;)a&=a-1,++b;return b};
    Sk.builtin.biginteger.prototype.bnBitCount=function(){var a,b=0,c=this.s&this.DM;for(a=0;a<this.t;++a)b+=Sk.builtin.biginteger.cbit(this[a]^c);return b};Sk.builtin.biginteger.prototype.bnTestBit=function(a){var b=Math.floor(a/this.DB);return b>=this.t?0!==this.s:0!==(this[b]&1<<a%this.DB)};Sk.builtin.biginteger.prototype.bnpChangeBit=function(a,b){var c=Sk.builtin.biginteger.ONE.shiftLeft(a);this.bitwiseTo(c,b,c);return c};
    Sk.builtin.biginteger.prototype.bnSetBit=function(a){return this.changeBit(a,Sk.builtin.biginteger.op_or)};Sk.builtin.biginteger.prototype.bnClearBit=function(a){return this.changeBit(a,Sk.builtin.biginteger.op_andnot)};Sk.builtin.biginteger.prototype.bnFlipBit=function(a){return this.changeBit(a,Sk.builtin.biginteger.op_xor)};
    Sk.builtin.biginteger.prototype.bnpAddTo=function(a,b){for(var c=0,d=0,e=Math.min(a.t,this.t);c<e;)d+=this[c]+a[c],b[c++]=d&this.DM,d>>=this.DB;if(a.t<this.t){for(d+=a.s;c<this.t;)d+=this[c],b[c++]=d&this.DM,d>>=this.DB;d+=this.s}else{for(d+=this.s;c<a.t;)d+=a[c],b[c++]=d&this.DM,d>>=this.DB;d+=a.s}b.s=0>d?-1:0;0<d?b[c++]=d:-1>d&&(b[c++]=this.DV+d);b.t=c;b.clamp()};Sk.builtin.biginteger.prototype.bnAdd=function(a){var b=Sk.builtin.biginteger.nbi();this.addTo(a,b);return b};
    Sk.builtin.biginteger.prototype.bnSubtract=function(a){var b=Sk.builtin.biginteger.nbi();this.subTo(a,b);return b};Sk.builtin.biginteger.prototype.bnMultiply=function(a){var b=Sk.builtin.biginteger.nbi();this.multiplyTo(a,b);return b};Sk.builtin.biginteger.prototype.bnDivide=function(a){var b=Sk.builtin.biginteger.nbi();this.divRemTo(a,b,null);return b};Sk.builtin.biginteger.prototype.bnRemainder=function(a){var b=Sk.builtin.biginteger.nbi();this.divRemTo(a,null,b);return b};
    Sk.builtin.biginteger.prototype.bnDivideAndRemainder=function(a){var b=Sk.builtin.biginteger.nbi(),c=Sk.builtin.biginteger.nbi();this.divRemTo(a,b,c);return[b,c]};Sk.builtin.biginteger.prototype.bnpDMultiply=function(a){this[this.t]=this.am(0,a-1,this,0,0,this.t);++this.t;this.clamp()};Sk.builtin.biginteger.prototype.bnpDAddOffset=function(a,b){if(0!==a){for(;this.t<=b;)this[this.t++]=0;for(this[b]+=a;this[b]>=this.DV;)this[b]-=this.DV,++b>=this.t&&(this[this.t++]=0),++this[b]}};
    Sk.builtin.biginteger.NullExp=function(){};Sk.builtin.biginteger.prototype.nNop=function(a){return a};Sk.builtin.biginteger.prototype.nMulTo=function(a,b,c){a.multiplyTo(b,c)};Sk.builtin.biginteger.prototype.nSqrTo=function(a,b){a.squareTo(b)};Sk.builtin.biginteger.NullExp.prototype.convert=Sk.builtin.biginteger.prototype.nNop;Sk.builtin.biginteger.NullExp.prototype.revert=Sk.builtin.biginteger.prototype.nNop;Sk.builtin.biginteger.NullExp.prototype.mulTo=Sk.builtin.biginteger.prototype.nMulTo;
    Sk.builtin.biginteger.NullExp.prototype.sqrTo=Sk.builtin.biginteger.prototype.nSqrTo;Sk.builtin.biginteger.prototype.bnPow=function(a){return this.exp(a,new Sk.builtin.biginteger.NullExp)};Sk.builtin.biginteger.prototype.bnpMultiplyLowerTo=function(a,b,c){var d,e=Math.min(this.t+a.t,b);c.s=0;for(c.t=e;0<e;)c[--e]=0;for(d=c.t-this.t;e<d;++e)c[e+this.t]=this.am(0,a[e],c,e,0,this.t);for(d=Math.min(a.t,b);e<d;++e)this.am(0,a[e],c,e,0,b-e);c.clamp()};
    Sk.builtin.biginteger.prototype.bnpMultiplyUpperTo=function(a,b,c){var d;--b;d=c.t=this.t+a.t-b;for(c.s=0;0<=--d;)c[d]=0;for(d=Math.max(b-this.t,0);d<a.t;++d)c[this.t+d-b]=this.am(b-d,a[d],c,0,0,this.t+d-b);c.clamp();c.drShiftTo(1,c)};Sk.builtin.biginteger.Barrett=function(a){this.r2=Sk.builtin.biginteger.nbi();this.q3=Sk.builtin.biginteger.nbi();Sk.builtin.biginteger.ONE.dlShiftTo(2*a.t,this.r2);this.mu=this.r2.divide(a);this.m=a};
    Sk.builtin.biginteger.prototype.barrettConvert=function(a){var b;if(0>a.s||a.t>2*this.m.t)return a.mod(this.m);if(0>a.compareTo(this.m))return a;b=Sk.builtin.biginteger.nbi();a.copyTo(b);this.reduce(b);return b};Sk.builtin.biginteger.prototype.barrettRevert=function(a){return a};
    Sk.builtin.biginteger.prototype.barrettReduce=function(a){a.drShiftTo(this.m.t-1,this.r2);a.t>this.m.t+1&&(a.t=this.m.t+1,a.clamp());this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);for(this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);0>a.compareTo(this.r2);)a.dAddOffset(1,this.m.t+1);for(a.subTo(this.r2,a);0<=a.compareTo(this.m);)a.subTo(this.m,a)};Sk.builtin.biginteger.prototype.barrettSqrTo=function(a,b){a.squareTo(b);this.reduce(b)};
    Sk.builtin.biginteger.prototype.barrettMulTo=function(a,b,c){a.multiplyTo(b,c);this.reduce(c)};Sk.builtin.biginteger.Barrett.prototype.convert=Sk.builtin.biginteger.prototype.barrettConvert;Sk.builtin.biginteger.Barrett.prototype.revert=Sk.builtin.biginteger.prototype.barrettRevert;Sk.builtin.biginteger.Barrett.prototype.reduce=Sk.builtin.biginteger.prototype.barrettReduce;Sk.builtin.biginteger.Barrett.prototype.mulTo=Sk.builtin.biginteger.prototype.barrettMulTo;
    Sk.builtin.biginteger.Barrett.prototype.sqrTo=Sk.builtin.biginteger.prototype.barrettSqrTo;
    Sk.builtin.biginteger.prototype.bnModPow=function(a,b){var c,d,e,f,g,h,k,l,m=a.bitLength(),p,n=Sk.builtin.biginteger.nbv(1),r;if(0>=m)return n;p=18>m?1:48>m?3:144>m?4:768>m?5:6;r=8>m?new Sk.builtin.biginteger.Classic(b):b.isEven()?new Sk.builtin.biginteger.Barrett(b):new Sk.builtin.biginteger.Montgomery(b);h=[];g=3;k=p-1;l=(1<<p)-1;h[1]=r.convert(this);if(1<p)for(c=Sk.builtin.biginteger.nbi(),r.sqrTo(h[1],c);g<=l;)h[g]=Sk.builtin.biginteger.nbi(),r.mulTo(c,h[g-2],h[g]),g+=2;c=a.t-1;e=!0;f=Sk.builtin.biginteger.nbi();
        for(m=Sk.builtin.biginteger.nbits(a[c])-1;0<=c;){m>=k?d=a[c]>>m-k&l:(d=(a[c]&(1<<m+1)-1)<<k-m,0<c&&(d|=a[c-1]>>this.DB+m-k));for(g=p;0===(d&1);)d>>=1,--g;0>(m-=g)&&(m+=this.DB,--c);if(e)h[d].copyTo(n),e=!1;else{for(;1<g;)r.sqrTo(n,f),r.sqrTo(f,n),g-=2;0<g?r.sqrTo(n,f):(g=n,n=f,f=g);r.mulTo(f,h[d],n)}for(;0<=c&&0===(a[c]&1<<m);)r.sqrTo(n,f),g=n,n=f,f=g,0>--m&&(m=this.DB-1,--c)}return r.revert(n)};
    Sk.builtin.biginteger.prototype.bnGCD=function(a){var b,c,d=0>this.s?this.negate():this.clone();a=0>a.s?a.negate():a.clone();0>d.compareTo(a)&&(b=d,d=a,a=b);b=d.getLowestSetBit();c=a.getLowestSetBit();if(0>c)return d;b<c&&(c=b);0<c&&(d.rShiftTo(c,d),a.rShiftTo(c,a));for(;0<d.signum();)0<(b=d.getLowestSetBit())&&d.rShiftTo(b,d),0<(b=a.getLowestSetBit())&&a.rShiftTo(b,a),0<=d.compareTo(a)?(d.subTo(a,d),d.rShiftTo(1,d)):(a.subTo(d,a),a.rShiftTo(1,a));0<c&&a.lShiftTo(c,a);return a};
    Sk.builtin.biginteger.prototype.bnpModInt=function(a){var b,c,d;if(0>=a)return 0;c=this.DV%a;d=0>this.s?a-1:0;if(0<this.t)if(0===c)d=this[0]%a;else for(b=this.t-1;0<=b;--b)d=(c*d+this[b])%a;return d};
    Sk.builtin.biginteger.prototype.bnModInverse=function(a){var b,c,d,e,f,g,h=a.isEven();if(this.isEven()&&h||0===a.signum())return Sk.builtin.biginteger.ZERO;f=a.clone();g=this.clone();b=Sk.builtin.biginteger.nbv(1);c=Sk.builtin.biginteger.nbv(0);d=Sk.builtin.biginteger.nbv(0);for(e=Sk.builtin.biginteger.nbv(1);0!==f.signum();){for(;f.isEven();)f.rShiftTo(1,f),h?(b.isEven()&&c.isEven()||(b.addTo(this,b),c.subTo(a,c)),b.rShiftTo(1,b)):c.isEven()||c.subTo(a,c),c.rShiftTo(1,c);for(;g.isEven();)g.rShiftTo(1,
        g),h?(d.isEven()&&e.isEven()||(d.addTo(this,d),e.subTo(a,e)),d.rShiftTo(1,d)):e.isEven()||e.subTo(a,e),e.rShiftTo(1,e);0<=f.compareTo(g)?(f.subTo(g,f),h&&b.subTo(d,b),c.subTo(e,c)):(g.subTo(f,g),h&&d.subTo(b,d),e.subTo(c,e))}if(0!==g.compareTo(Sk.builtin.biginteger.ONE))return Sk.builtin.biginteger.ZERO;if(0<=e.compareTo(a))return e.subtract(a);if(0>e.signum())e.addTo(a,e);else return e;return 0>e.signum()?e.add(a):e};
    Sk.builtin.biginteger.lowprimes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509];
    Sk.builtin.biginteger.lplim=67108864/Sk.builtin.biginteger.lowprimes[Sk.builtin.biginteger.lowprimes.length-1];
    Sk.builtin.biginteger.prototype.bnIsProbablePrime=function(a){var b,c,d,e=this.abs();if(1==e.t&&e[0]<=Sk.builtin.biginteger.lowprimes[Sk.builtin.biginteger.lowprimes.length-1]){for(d=0;d<Sk.builtin.biginteger.lowprimes.length;++d)if(e[0]==Sk.builtin.biginteger.lowprimes[d])return!0;return!1}if(e.isEven())return!1;for(d=1;d<Sk.builtin.biginteger.lowprimes.length;){b=Sk.builtin.biginteger.lowprimes[d];for(c=d+1;c<Sk.builtin.biginteger.lowprimes.length&&b<Sk.builtin.biginteger.lplim;)b*=Sk.builtin.biginteger.lowprimes[c++];
        for(b=e.modInt(b);d<c;)if(0===b%Sk.builtin.biginteger.lowprimes[d++])return!1}return e.millerRabin(a)};
    Sk.builtin.biginteger.prototype.bnpMillerRabin=function(a){var b,c,d,e,f,g=this.subtract(Sk.builtin.biginteger.ONE),h=g.getLowestSetBit();if(0>=h)return!1;f=g.shiftRight(h);a=a+1>>1;a>Sk.builtin.biginteger.lowprimes.length&&(a=Sk.builtin.biginteger.lowprimes.length);e=Sk.builtin.biginteger.nbi();for(d=0;d<a;++d)if(e.fromInt(Sk.builtin.biginteger.lowprimes[d]),c=e.modPow(f,this),0!==c.compareTo(Sk.builtin.biginteger.ONE)&&0!==c.compareTo(g)){for(b=1;b++<h&&0!==c.compareTo(g);)if(c=c.modPowInt(2,this),
    0===c.compareTo(Sk.builtin.biginteger.ONE))return!1;if(0!==c.compareTo(g))return!1}return!0};Sk.builtin.biginteger.prototype.isnegative=function(){return 0>this.s};Sk.builtin.biginteger.prototype.ispositive=function(){return 0<=this.s};Sk.builtin.biginteger.prototype.trueCompare=function(a){return 0<=this.s&&0>a.s?1:0>this.s&&0<=a.s?-1:this.compare(a)};Sk.builtin.biginteger.prototype.chunkSize=Sk.builtin.biginteger.prototype.bnpChunkSize;Sk.builtin.biginteger.prototype.toRadix=Sk.builtin.biginteger.prototype.bnpToRadix;
    Sk.builtin.biginteger.prototype.fromRadix=Sk.builtin.biginteger.prototype.bnpFromRadix;Sk.builtin.biginteger.prototype.fromNumber=Sk.builtin.biginteger.prototype.bnpFromNumber;Sk.builtin.biginteger.prototype.bitwiseTo=Sk.builtin.biginteger.prototype.bnpBitwiseTo;Sk.builtin.biginteger.prototype.changeBit=Sk.builtin.biginteger.prototype.bnpChangeBit;Sk.builtin.biginteger.prototype.addTo=Sk.builtin.biginteger.prototype.bnpAddTo;Sk.builtin.biginteger.prototype.dMultiply=Sk.builtin.biginteger.prototype.bnpDMultiply;
    Sk.builtin.biginteger.prototype.dAddOffset=Sk.builtin.biginteger.prototype.bnpDAddOffset;Sk.builtin.biginteger.prototype.multiplyLowerTo=Sk.builtin.biginteger.prototype.bnpMultiplyLowerTo;Sk.builtin.biginteger.prototype.multiplyUpperTo=Sk.builtin.biginteger.prototype.bnpMultiplyUpperTo;Sk.builtin.biginteger.prototype.modInt=Sk.builtin.biginteger.prototype.bnpModInt;Sk.builtin.biginteger.prototype.millerRabin=Sk.builtin.biginteger.prototype.bnpMillerRabin;Sk.builtin.biginteger.prototype.clone=Sk.builtin.biginteger.prototype.bnClone;
    Sk.builtin.biginteger.prototype.intValue=Sk.builtin.biginteger.prototype.bnIntValue;Sk.builtin.biginteger.prototype.byteValue=Sk.builtin.biginteger.prototype.bnByteValue;Sk.builtin.biginteger.prototype.shortValue=Sk.builtin.biginteger.prototype.bnShortValue;Sk.builtin.biginteger.prototype.signum=Sk.builtin.biginteger.prototype.bnSigNum;Sk.builtin.biginteger.prototype.toByteArray=Sk.builtin.biginteger.prototype.bnToByteArray;Sk.builtin.biginteger.prototype.equals=Sk.builtin.biginteger.prototype.bnEquals;
    Sk.builtin.biginteger.prototype.compare=Sk.builtin.biginteger.prototype.compareTo;Sk.builtin.biginteger.prototype.min=Sk.builtin.biginteger.prototype.bnMin;Sk.builtin.biginteger.prototype.max=Sk.builtin.biginteger.prototype.bnMax;Sk.builtin.biginteger.prototype.and=Sk.builtin.biginteger.prototype.bnAnd;Sk.builtin.biginteger.prototype.or=Sk.builtin.biginteger.prototype.bnOr;Sk.builtin.biginteger.prototype.xor=Sk.builtin.biginteger.prototype.bnXor;Sk.builtin.biginteger.prototype.andNot=Sk.builtin.biginteger.prototype.bnAndNot;
    Sk.builtin.biginteger.prototype.not=Sk.builtin.biginteger.prototype.bnNot;Sk.builtin.biginteger.prototype.shiftLeft=Sk.builtin.biginteger.prototype.bnShiftLeft;Sk.builtin.biginteger.prototype.shiftRight=Sk.builtin.biginteger.prototype.bnShiftRight;Sk.builtin.biginteger.prototype.getLowestSetBit=Sk.builtin.biginteger.prototype.bnGetLowestSetBit;Sk.builtin.biginteger.prototype.bitCount=Sk.builtin.biginteger.prototype.bnBitCount;Sk.builtin.biginteger.prototype.testBit=Sk.builtin.biginteger.prototype.bnTestBit;
    Sk.builtin.biginteger.prototype.setBit=Sk.builtin.biginteger.prototype.bnSetBit;Sk.builtin.biginteger.prototype.clearBit=Sk.builtin.biginteger.prototype.bnClearBit;Sk.builtin.biginteger.prototype.flipBit=Sk.builtin.biginteger.prototype.bnFlipBit;Sk.builtin.biginteger.prototype.add=Sk.builtin.biginteger.prototype.bnAdd;Sk.builtin.biginteger.prototype.subtract=Sk.builtin.biginteger.prototype.bnSubtract;Sk.builtin.biginteger.prototype.multiply=Sk.builtin.biginteger.prototype.bnMultiply;
    Sk.builtin.biginteger.prototype.divide=Sk.builtin.biginteger.prototype.bnDivide;Sk.builtin.biginteger.prototype.remainder=Sk.builtin.biginteger.prototype.bnRemainder;Sk.builtin.biginteger.prototype.divideAndRemainder=Sk.builtin.biginteger.prototype.bnDivideAndRemainder;Sk.builtin.biginteger.prototype.modPow=Sk.builtin.biginteger.prototype.bnModPow;Sk.builtin.biginteger.prototype.modInverse=Sk.builtin.biginteger.prototype.bnModInverse;Sk.builtin.biginteger.prototype.pow=Sk.builtin.biginteger.prototype.bnPow;
    Sk.builtin.biginteger.prototype.gcd=Sk.builtin.biginteger.prototype.bnGCD;Sk.builtin.biginteger.prototype.isProbablePrime=Sk.builtin.biginteger.prototype.bnIsProbablePrime;Sk.builtin.int_=function(a,b){var c,d;if(!(this instanceof Sk.builtin.int_))return new Sk.builtin.int_(a,b);if(this instanceof Sk.builtin.bool)return this;if(a instanceof Sk.builtin.int_&&void 0===b)return this.v=a.v,this;if(void 0!==b&&!Sk.builtin.checkInt(b)){if(Sk.builtin.checkFloat(b))throw new Sk.builtin.TypeError("integer argument expected, got "+Sk.abstr.typeName(b));if(b.__index__)b=Sk.misceval.callsim(b.__index__,b);else if(b.__int__)b=Sk.misceval.callsim(b.__int__,b);else throw new Sk.builtin.AttributeError(Sk.abstr.typeName(b)+
        " instance has no attribute '__index__' or '__int__'");}if(a instanceof Sk.builtin.str){b=Sk.builtin.asnum$(b);c=Sk.str2number(a.v,b,parseInt,function(a){return-a},"int");if(c>Sk.builtin.int_.threshold$||c<-Sk.builtin.int_.threshold$)return new Sk.builtin.lng(a,b);this.v=c;return this}if(void 0!==b)throw new Sk.builtin.TypeError("int() can't convert non-string with explicit base");if(void 0===a||a===Sk.builtin.none)a=0;void 0!==a&&a.tp$getattr&&a.tp$getattr("__int__")?(c=Sk.misceval.callsim(a.tp$getattr("__int__")),
        d="__int__"):void 0!==a&&a.__int__?(c=Sk.misceval.callsim(a.__int__,a),d="__int__"):void 0!==a&&a.tp$getattr&&a.tp$getattr("__trunc__")?(c=Sk.misceval.callsim(a.tp$getattr("__trunc__")),d="__trunc__"):void 0!==a&&a.__trunc__&&(c=Sk.misceval.callsim(a.__trunc__,a),d="__trunc__");if(void 0===c||Sk.builtin.checkInt(c))void 0!==c&&(a=c);else throw new Sk.builtin.TypeError(d+" returned non-Integral (type "+Sk.abstr.typeName(c)+")");if(!Sk.builtin.checkNumber(a))throw new Sk.builtin.TypeError("int() argument must be a string or a number, not '"+
        Sk.abstr.typeName(a)+"'");a=Sk.builtin.asnum$(a);if(a>Sk.builtin.int_.threshold$||a<-Sk.builtin.int_.threshold$)return new Sk.builtin.lng(a);-1<a&&1>a&&(a=0);this.v=parseInt(a,b);return this};Sk.abstr.setUpInheritance("int",Sk.builtin.int_,Sk.builtin.numtype);Sk.builtin.int_.prototype.nb$int_=function(){return this};Sk.builtin.int_.prototype.nb$float_=function(){return new Sk.builtin.float_(this.v)};Sk.builtin.int_.prototype.nb$lng=function(){return new Sk.builtin.lng(this.v)};
    Sk.builtin.int_.prototype.__trunc__=new Sk.builtin.func(function(a){return a});Sk.builtin.int_.prototype.__index__=new Sk.builtin.func(function(a){return a});Sk.builtin.int_.prototype.__complex__=new Sk.builtin.func(function(a){return Sk.builtin.NotImplemented.NotImplemented$});Sk.builtin.int_.prototype.tp$index=function(){return this.v};Sk.builtin.int_.prototype.tp$hash=function(){return new Sk.builtin.int_(this.v)};Sk.builtin.int_.threshold$=Math.pow(2,53)-1;Sk.builtin.int_.prototype.clone=function(){return new Sk.builtin.int_(this.v)};
    Sk.builtin.int_.prototype.nb$add=function(a){var b;return a instanceof Sk.builtin.int_?new Sk.builtin.int_(this.v+a.v):a instanceof Sk.builtin.lng?(b=new Sk.builtin.lng(this.v),b.nb$add(a)):a instanceof Sk.builtin.float_?(b=new Sk.builtin.float_(this.v),b.nb$add(a)):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.int_.prototype.nb$reflected_add=function(a){return Sk.builtin.int_.prototype.nb$add.call(this,a)};
    Sk.builtin.int_.prototype.nb$subtract=function(a){var b;return a instanceof Sk.builtin.int_?new Sk.builtin.int_(this.v-a.v):a instanceof Sk.builtin.lng?(b=new Sk.builtin.lng(this.v),b.nb$subtract(a)):a instanceof Sk.builtin.float_?(b=new Sk.builtin.float_(this.v),b.nb$subtract(a)):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.int_.prototype.nb$reflected_subtract=function(a){var b=this.nb$negative();return Sk.builtin.int_.prototype.nb$add.call(b,a)};
    Sk.builtin.int_.prototype.nb$multiply=function(a){var b;return a instanceof Sk.builtin.int_?(b=this.v*a.v,b>Sk.builtin.int_.threshold$||b<-Sk.builtin.int_.threshold$?(b=new Sk.builtin.lng(this.v),b.nb$multiply(a)):new Sk.builtin.int_(b)):a instanceof Sk.builtin.lng?(b=new Sk.builtin.lng(this.v),b.nb$multiply(a)):a instanceof Sk.builtin.float_?(b=new Sk.builtin.float_(this.v),b.nb$multiply(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.int_.prototype.nb$reflected_multiply=function(a){return Sk.builtin.int_.prototype.nb$multiply.call(this,a)};Sk.builtin.int_.prototype.nb$divide=function(a){var b;return Sk.python3?(b=new Sk.builtin.float_(this.v),b.nb$divide(a)):a instanceof Sk.builtin.int_?this.nb$floor_divide(a):a instanceof Sk.builtin.lng?(b=new Sk.builtin.lng(this.v),b.nb$divide(a)):a instanceof Sk.builtin.float_?(b=new Sk.builtin.float_(this.v),b.nb$divide(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.int_.prototype.nb$reflected_divide=function(a){return this.nb$reflected_floor_divide(a)};
    Sk.builtin.int_.prototype.nb$floor_divide=function(a){var b;if(a instanceof Sk.builtin.int_){if(0===a.v)throw new Sk.builtin.ZeroDivisionError("integer division or modulo by zero");return new Sk.builtin.int_(Math.floor(this.v/a.v))}return a instanceof Sk.builtin.lng?(b=new Sk.builtin.lng(this.v),b.nb$floor_divide(a)):a instanceof Sk.builtin.float_?(b=new Sk.builtin.float_(this.v),b.nb$floor_divide(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.int_.prototype.nb$reflected_floor_divide=function(a){return a instanceof Sk.builtin.int_?a.nb$divide(this):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.int_.prototype.nb$remainder=function(a){var b;return a instanceof Sk.builtin.int_?(b=Sk.abstr.numberBinOp(this,a,"FloorDiv"),b=Sk.abstr.numberBinOp(b,a,"Mult"),b=Sk.abstr.numberBinOp(this,b,"Sub"),b=b.v,0>a.v&&0===b?b=-0:0===b&&-Infinity===Infinity/b&&(b=0),new Sk.builtin.int_(b)):a instanceof Sk.builtin.lng?(b=new Sk.builtin.lng(this.v),b.nb$remainder(a)):a instanceof Sk.builtin.float_?(b=new Sk.builtin.float_(this.v),b.nb$remainder(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.int_.prototype.nb$reflected_remainder=function(a){return a instanceof Sk.builtin.int_?a.nb$remainder(this):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.int_.prototype.nb$divmod=function(a){var b;return a instanceof Sk.builtin.int_?new Sk.builtin.tuple([this.nb$floor_divide(a),this.nb$remainder(a)]):a instanceof Sk.builtin.lng?(b=new Sk.builtin.lng(this.v),b.nb$divmod(a)):a instanceof Sk.builtin.float_?(b=new Sk.builtin.float_(this.v),b.nb$divmod(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.int_.prototype.nb$reflected_divmod=function(a){return a instanceof Sk.builtin.int_?new Sk.builtin.tuple([a.nb$floor_divide(this),a.nb$remainder(this)]):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.int_.prototype.nb$power=function(a,b){var c;if(a instanceof Sk.builtin.int_&&(void 0===b||b instanceof Sk.builtin.int_)){c=Math.pow(this.v,a.v);c>Sk.builtin.int_.threshold$||c<-Sk.builtin.int_.threshold$?(c=new Sk.builtin.lng(this.v),c=c.nb$power(a,b)):c=0>a.v?new Sk.builtin.float_(c):new Sk.builtin.int_(c);if(void 0!==b){if(0>a.v)throw new Sk.builtin.TypeError("pow() 2nd argument cannot be negative when 3rd argument specified");return c.nb$remainder(b)}return c}return a instanceof Sk.builtin.lng?
        (c=new Sk.builtin.lng(this.v),c.nb$power(a)):a instanceof Sk.builtin.float_?(c=new Sk.builtin.float_(this.v),c.nb$power(a)):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.int_.prototype.nb$reflected_power=function(a,b){return a instanceof Sk.builtin.int_?a.nb$power(this,b):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.int_.prototype.nb$abs=function(){return new Sk.builtin.int_(Math.abs(this.v))};
    Sk.builtin.int_.prototype.nb$and=function(a){var b;return a instanceof Sk.builtin.int_&&(a=Sk.builtin.asnum$(a),b=this.v&a,void 0!==b&&0>b&&(b+=4294967296),void 0!==b)?new Sk.builtin.int_(b):a instanceof Sk.builtin.lng?(b=new Sk.builtin.lng(this.v),b.nb$and(a)):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.int_.prototype.nb$reflected_and=Sk.builtin.int_.prototype.nb$and;
    Sk.builtin.int_.prototype.nb$or=function(a){var b;return a instanceof Sk.builtin.int_&&(a=Sk.builtin.asnum$(a),b=this.v|a,void 0!==b&&0>b&&(b+=4294967296),void 0!==b)?new Sk.builtin.int_(b):a instanceof Sk.builtin.lng?(b=new Sk.builtin.lng(this.v),b.nb$and(a)):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.int_.prototype.nb$reflected_or=Sk.builtin.int_.prototype.nb$or;
    Sk.builtin.int_.prototype.nb$xor=function(a){var b;return a instanceof Sk.builtin.int_&&(a=Sk.builtin.asnum$(a),b=this.v^a,void 0!==b&&0>b&&(b+=4294967296),void 0!==b)?new Sk.builtin.int_(b):a instanceof Sk.builtin.lng?(b=new Sk.builtin.lng(this.v),b.nb$xor(a)):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.int_.prototype.nb$reflected_xor=Sk.builtin.int_.prototype.nb$xor;
    Sk.builtin.int_.prototype.nb$lshift=function(a){var b;if(a instanceof Sk.builtin.int_){var c=Sk.builtin.asnum$(a);if(void 0!==c){if(0>c)throw new Sk.builtin.ValueError("negative shift count");b=this.v<<c;if(b<=this.v)return(new Sk.builtin.lng(this.v)).nb$lshift(a)}if(void 0!==b)return new Sk.builtin.int_(b)}return a instanceof Sk.builtin.lng?(b=new Sk.builtin.lng(this.v),b.nb$lshift(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.int_.prototype.nb$reflected_lshift=function(a){return a instanceof Sk.builtin.int_?a.nb$lshift(this):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.int_.prototype.nb$rshift=function(a){var b;if(a instanceof Sk.builtin.int_){var c=Sk.builtin.asnum$(a);if(void 0!==c){if(0>c)throw new Sk.builtin.ValueError("negative shift count");b=this.v>>c;0<this.v&&0>b&&(b&=Math.pow(2,32-c)-1)}if(void 0!==b)return new Sk.builtin.int_(b)}return a instanceof Sk.builtin.lng?(b=new Sk.builtin.lng(this.v),b.nb$rshift(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.int_.prototype.nb$reflected_rshift=function(a){return a instanceof Sk.builtin.int_?a.nb$rshift(this):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.int_.prototype.nb$invert=function(){return new Sk.builtin.int_(~this.v)};Sk.builtin.int_.prototype.nb$inplace_add=Sk.builtin.int_.prototype.nb$add;Sk.builtin.int_.prototype.nb$inplace_subtract=Sk.builtin.int_.prototype.nb$subtract;Sk.builtin.int_.prototype.nb$inplace_multiply=Sk.builtin.int_.prototype.nb$multiply;
    Sk.builtin.int_.prototype.nb$inplace_divide=Sk.builtin.int_.prototype.nb$divide;Sk.builtin.int_.prototype.nb$inplace_remainder=Sk.builtin.int_.prototype.nb$remainder;Sk.builtin.int_.prototype.nb$inplace_floor_divide=Sk.builtin.int_.prototype.nb$floor_divide;Sk.builtin.int_.prototype.nb$inplace_power=Sk.builtin.int_.prototype.nb$power;Sk.builtin.int_.prototype.nb$inplace_and=Sk.builtin.int_.prototype.nb$and;Sk.builtin.int_.prototype.nb$inplace_or=Sk.builtin.int_.prototype.nb$or;
    Sk.builtin.int_.prototype.nb$inplace_xor=Sk.builtin.int_.prototype.nb$xor;Sk.builtin.int_.prototype.nb$inplace_lshift=Sk.builtin.int_.prototype.nb$lshift;Sk.builtin.int_.prototype.nb$inplace_rshift=Sk.builtin.int_.prototype.nb$rshift;Sk.builtin.int_.prototype.nb$negative=function(){return new Sk.builtin.int_(-this.v)};Sk.builtin.int_.prototype.nb$positive=function(){return this.clone()};Sk.builtin.int_.prototype.nb$nonzero=function(){return 0!==this.v};
    Sk.builtin.int_.prototype.nb$isnegative=function(){return 0>this.v};Sk.builtin.int_.prototype.nb$ispositive=function(){return 0<=this.v};Sk.builtin.int_.prototype.numberCompare=function(a){return a instanceof Sk.builtin.int_?this.v-a.v:a instanceof Sk.builtin.lng?-a.longCompare(this):a instanceof Sk.builtin.float_?-a.numberCompare(this):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.int_.prototype.ob$eq=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0==this.numberCompare(a)):a instanceof Sk.builtin.none?Sk.builtin.bool.false$:Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.int_.prototype.ob$ne=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0!=this.numberCompare(a)):a instanceof Sk.builtin.none?Sk.builtin.bool.true$:Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.int_.prototype.ob$lt=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0>this.numberCompare(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.int_.prototype.ob$le=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0>=this.numberCompare(a)):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.int_.prototype.ob$gt=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0<this.numberCompare(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.int_.prototype.ob$ge=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0<=this.numberCompare(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.int_.prototype.__round__=function(a,b){Sk.builtin.pyCheckArgs("__round__",arguments,1,2);var c,d;if(void 0!==b&&!Sk.misceval.isIndex(b))throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(b)+"' object cannot be interpreted as an index");void 0===b&&(b=0);d=Sk.builtin.asnum$(a);b=Sk.misceval.asIndex(b);c=Math.pow(10,b);c=Math.round(d*c)/c;return new Sk.builtin.int_(c)};Sk.builtin.int_.prototype.conjugate=new Sk.builtin.func(function(a){return new Sk.builtin.int_(a.v)});
    Sk.builtin.int_.prototype.$r=function(){return new Sk.builtin.str(this.str$(10,!0))};Sk.builtin.int_.prototype.tp$str=function(){return new Sk.builtin.str(this.str$(10,!0))};Sk.builtin.int_.prototype.str$=function(a,b){var c;void 0===b&&(b=!0);c=b?this.v:Math.abs(this.v);return void 0===a||10===a?c.toString():c.toString(a)};
    Sk.str2number=function(a,b,c,d,e){var f=a,g=!1,h,k,l;a=a.replace(/^\s+|\s+$/g,"");"-"===a.charAt(0)&&(g=!0,a=a.substring(1));"+"===a.charAt(0)&&(a=a.substring(1));void 0===b&&(b=10);if((2>b||36<b)&&0!==b)throw new Sk.builtin.ValueError(e+"() base must be >= 2 and <= 36");if("0x"===a.substring(0,2).toLowerCase())if(16===b||0===b)a=a.substring(2),b=16;else{if(34>b)throw new Sk.builtin.ValueError("invalid literal for "+e+"() with base "+b+": '"+f+"'");}else if("0b"===a.substring(0,2).toLowerCase())if(2===
        b||0===b)a=a.substring(2),b=2;else{if(12>b)throw new Sk.builtin.ValueError("invalid literal for "+e+"() with base "+b+": '"+f+"'");}else if("0o"===a.substring(0,2).toLowerCase())if(8===b||0===b)a=a.substring(2),b=8;else{if(25>b)throw new Sk.builtin.ValueError("invalid literal for "+e+"() with base "+b+": '"+f+"'");}else if("0"===a.charAt(0)){if("0"===a)return 0;if(8===b||0===b)b=8}0===b&&(b=10);if(0===a.length)throw new Sk.builtin.ValueError("invalid literal for "+e+"() with base "+b+": '"+f+"'");
        for(h=0;h<a.length;h+=1)if(k=a.charCodeAt(h),l=b,48<=k&&57>=k?l=k-48:65<=k&&90>=k?l=k-65+10:97<=k&&122>=k&&(l=k-97+10),l>=b)throw new Sk.builtin.ValueError("invalid literal for "+e+"() with base "+b+": '"+f+"'");l=c(a,b);g&&(l=d(l));return l};goog.exportSymbol("Sk.builtin.int_",Sk.builtin.int_);Sk.builtin.bool=function(a){Sk.builtin.pyCheckArgs("bool",arguments,1);return Sk.misceval.isTrue(a)?Sk.builtin.bool.true$:Sk.builtin.bool.false$};Sk.abstr.setUpInheritance("bool",Sk.builtin.bool,Sk.builtin.int_);Sk.builtin.bool.prototype.$r=function(){return this.v?new Sk.builtin.str("True"):new Sk.builtin.str("False")};Sk.builtin.bool.prototype.tp$hash=function(){return new Sk.builtin.int_(this.v)};Sk.builtin.bool.prototype.__int__=new Sk.builtin.func(function(a){a=Sk.builtin.asnum$(a);return new Sk.builtin.int_(a)});
    Sk.builtin.bool.prototype.__float__=new Sk.builtin.func(function(a){return new Sk.builtin.float_(Sk.ffi.remapToJs(a))});goog.exportSymbol("Sk.builtin.bool",Sk.builtin.bool);Sk.builtin.float_=function(a){if(void 0===a)return new Sk.builtin.float_(0);if(!(this instanceof Sk.builtin.float_))return new Sk.builtin.float_(a);if(a instanceof Sk.builtin.str){if(a.v.match(/^-inf$/i))a=-Infinity;else if(a.v.match(/^[+]?inf$/i))a=Infinity;else if(a.v.match(/^[-+]?nan$/i))a=NaN;else{if(isNaN(a.v))throw new Sk.builtin.ValueError("float: Argument: "+a.v+" is not number");a=parseFloat(a.v)}return new Sk.builtin.float_(a)}if("number"===typeof a||a instanceof Sk.builtin.int_||a instanceof
        Sk.builtin.lng||a instanceof Sk.builtin.float_)return this.v=Sk.builtin.asnum$(a),this;if(a instanceof Sk.builtin.bool)return this.v=Sk.builtin.asnum$(a),this;if("boolean"===typeof a)return this.v=a?1:0,this;if("string"===typeof a)return this.v=parseFloat(a),this;var b=Sk.abstr.lookupSpecial(a,"__float__");if(null!=b)return Sk.misceval.callsim(b,a);throw new Sk.builtin.TypeError("float() argument must be a string or a number");};Sk.abstr.setUpInheritance("float",Sk.builtin.float_,Sk.builtin.numtype);
    Sk.builtin.float_.prototype.nb$int_=function(){var a=this.v,a=0>a?Math.ceil(a):Math.floor(a);return new Sk.builtin.int_(a)};Sk.builtin.float_.prototype.nb$float_=function(){return this};Sk.builtin.float_.prototype.nb$lng=function(){return new Sk.builtin.lng(this.v)};Sk.builtin.float_.PyFloat_Check=function(a){return void 0===a?!1:Sk.builtin.checkNumber(a)||Sk.builtin.checkFloat(a)||Sk.builtin.issubclass(a.ob$type,Sk.builtin.float_)?!0:!1};Sk.builtin.float_.PyFloat_Check_Exact=function(a){return Sk.builtin.checkFloat(a)};
    Sk.builtin.float_.PyFloat_AsDouble=function(a){var b;if(a&&Sk.builtin.float_.PyFloat_Check(a))return Sk.ffi.remapToJs(a);if(null==a)throw Error("bad argument for internal PyFloat_AsDouble function");b=Sk.builtin.type.typeLookup(a.ob$type,"__float__");if(null==b)throw new Sk.builtin.TypeError("a float is required");a=Sk.misceval.callsim(b,a);if(!Sk.builtin.float_.PyFloat_Check(a))throw new Sk.builtin.TypeError("nb_float should return float object");return Sk.ffi.remapToJs(a)};
    Sk.builtin.float_.prototype.tp$index=function(){return this.v};Sk.builtin.float_.prototype.tp$hash=function(){return this.nb$int_()};Sk.builtin.float_.prototype.clone=function(){return new Sk.builtin.float_(this.v)};Sk.builtin.float_.prototype.toFixed=function(a){a=Sk.builtin.asnum$(a);return this.v.toFixed(a)};
    Sk.builtin.float_.prototype.nb$add=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.float_?new Sk.builtin.float_(this.v+a.v):a instanceof Sk.builtin.lng?new Sk.builtin.float_(this.v+parseFloat(a.str$(10,!0))):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.float_.prototype.nb$reflected_add=function(a){return Sk.builtin.float_.prototype.nb$add.call(this,a)};
    Sk.builtin.float_.prototype.nb$subtract=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.float_?new Sk.builtin.float_(this.v-a.v):a instanceof Sk.builtin.lng?new Sk.builtin.float_(this.v-parseFloat(a.str$(10,!0))):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.float_.prototype.nb$reflected_subtract=function(a){var b=this.nb$negative();return Sk.builtin.float_.prototype.nb$add.call(b,a)};
    Sk.builtin.float_.prototype.nb$multiply=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.float_?new Sk.builtin.float_(this.v*a.v):a instanceof Sk.builtin.lng?new Sk.builtin.float_(this.v*parseFloat(a.str$(10,!0))):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.float_.prototype.nb$reflected_multiply=function(a){return Sk.builtin.float_.prototype.nb$multiply.call(this,a)};
    Sk.builtin.float_.prototype.nb$divide=function(a){if(a instanceof Sk.builtin.int_||a instanceof Sk.builtin.float_){if(0===a.v)throw new Sk.builtin.ZeroDivisionError("integer division or modulo by zero");return Infinity===this.v?Infinity===a.v||-Infinity===a.v?new Sk.builtin.float_(NaN):a.nb$isnegative()?new Sk.builtin.float_(-Infinity):new Sk.builtin.float_(Infinity):-Infinity===this.v?Infinity===a.v||-Infinity===a.v?new Sk.builtin.float_(NaN):a.nb$isnegative()?new Sk.builtin.float_(Infinity):new Sk.builtin.float_(-Infinity):
        new Sk.builtin.float_(this.v/a.v)}if(a instanceof Sk.builtin.lng){if(0===a.longCompare(Sk.builtin.biginteger.ZERO))throw new Sk.builtin.ZeroDivisionError("integer division or modulo by zero");return Infinity===this.v?a.nb$isnegative()?new Sk.builtin.float_(-Infinity):new Sk.builtin.float_(Infinity):-Infinity===this.v?a.nb$isnegative()?new Sk.builtin.float_(Infinity):new Sk.builtin.float_(-Infinity):new Sk.builtin.float_(this.v/parseFloat(a.str$(10,!0)))}return Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.float_.prototype.nb$reflected_divide=function(a){if(a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng)a=new Sk.builtin.float_(a);return a instanceof Sk.builtin.float_?a.nb$divide(this):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.float_.prototype.nb$floor_divide=function(a){if(a instanceof Sk.builtin.int_||a instanceof Sk.builtin.float_){if(Infinity===this.v||-Infinity===this.v)return new Sk.builtin.float_(NaN);if(0===a.v)throw new Sk.builtin.ZeroDivisionError("integer division or modulo by zero");return Infinity===a.v?this.nb$isnegative()?new Sk.builtin.float_(-1):new Sk.builtin.float_(0):-Infinity===a.v?this.nb$isnegative()||!this.nb$nonzero()?new Sk.builtin.float_(0):new Sk.builtin.float_(-1):new Sk.builtin.float_(Math.floor(this.v/
        a.v))}if(a instanceof Sk.builtin.lng){if(0===a.longCompare(Sk.builtin.biginteger.ZERO))throw new Sk.builtin.ZeroDivisionError("integer division or modulo by zero");return Infinity===this.v||-Infinity===this.v?new Sk.builtin.float_(NaN):new Sk.builtin.float_(Math.floor(this.v/parseFloat(a.str$(10,!0))))}return Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.float_.prototype.nb$reflected_floor_divide=function(a){if(a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng)a=new Sk.builtin.float_(a);return a instanceof Sk.builtin.float_?a.nb$floor_divide(this):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.float_.prototype.nb$remainder=function(a){var b,c;if(a instanceof Sk.builtin.int_||a instanceof Sk.builtin.float_){if(0===a.v)throw new Sk.builtin.ZeroDivisionError("integer division or modulo by zero");if(0===this.v)return new Sk.builtin.float_(0);if(Infinity===a.v)return Infinity===this.v||-Infinity===this.v?new Sk.builtin.float_(NaN):this.nb$ispositive()?new Sk.builtin.float_(this.v):new Sk.builtin.float_(Infinity);c=this.v%a.v;0>this.v?0<a.v&&0>c&&(c+=a.v):0>a.v&&0!==c&&(c+=a.v);0>
    a.v&&0===c?c=-0:0===c&&-Infinity===Infinity/c&&(c=0);return new Sk.builtin.float_(c)}if(a instanceof Sk.builtin.lng){if(0===a.longCompare(Sk.builtin.biginteger.ZERO))throw new Sk.builtin.ZeroDivisionError("integer division or modulo by zero");if(0===this.v)return new Sk.builtin.float_(0);b=parseFloat(a.str$(10,!0));c=this.v%b;0>c?0<b&&0!==c&&(c+=b):0>b&&0!==c&&(c+=b);a.nb$isnegative()&&0===c?c=-0:0===c&&-Infinity===Infinity/c&&(c=0);return new Sk.builtin.float_(c)}return Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.float_.prototype.nb$reflected_remainder=function(a){if(a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng)a=new Sk.builtin.float_(a);return a instanceof Sk.builtin.float_?a.nb$remainder(this):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.float_.prototype.nb$divmod=function(a){if(a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng)a=new Sk.builtin.float_(a);return a instanceof Sk.builtin.float_?new Sk.builtin.tuple([this.nb$floor_divide(a),this.nb$remainder(a)]):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.float_.prototype.nb$reflected_divmod=function(a){if(a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng)a=new Sk.builtin.float_(a);return a instanceof Sk.builtin.float_?new Sk.builtin.tuple([a.nb$floor_divide(this),a.nb$remainder(this)]):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.float_.prototype.nb$power=function(a,b){var c;if(a instanceof Sk.builtin.int_||a instanceof Sk.builtin.float_){if(0>this.v&&0!==a.v%1)throw new Sk.builtin.NegativePowerError("cannot raise a negative number to a fractional power");if(0===this.v&&0>a.v)throw new Sk.builtin.NegativePowerError("cannot raise zero to a negative power");c=new Sk.builtin.float_(Math.pow(this.v,a.v));if(Infinity===Math.abs(c.v)&&Infinity!==Math.abs(this.v)&&Infinity!==Math.abs(a.v))throw new Sk.builtin.OverflowError("Numerical result out of range");
        return c}if(a instanceof Sk.builtin.lng){if(0===this.v&&0>a.longCompare(Sk.builtin.biginteger.ZERO))throw new Sk.builtin.NegativePowerError("cannot raise zero to a negative power");return new Sk.builtin.float_(Math.pow(this.v,parseFloat(a.str$(10,!0))))}return Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.float_.prototype.nb$reflected_power=function(a,b){if(a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng)a=new Sk.builtin.float_(a);return a instanceof Sk.builtin.float_?a.nb$power(this,b):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.float_.prototype.nb$abs=function(){return new Sk.builtin.float_(Math.abs(this.v))};Sk.builtin.float_.prototype.nb$inplace_add=Sk.builtin.float_.prototype.nb$add;Sk.builtin.float_.prototype.nb$inplace_subtract=Sk.builtin.float_.prototype.nb$subtract;
    Sk.builtin.float_.prototype.nb$inplace_multiply=Sk.builtin.float_.prototype.nb$multiply;Sk.builtin.float_.prototype.nb$inplace_divide=Sk.builtin.float_.prototype.nb$divide;Sk.builtin.float_.prototype.nb$inplace_remainder=Sk.builtin.float_.prototype.nb$remainder;Sk.builtin.float_.prototype.nb$inplace_floor_divide=Sk.builtin.float_.prototype.nb$floor_divide;Sk.builtin.float_.prototype.nb$inplace_power=Sk.builtin.float_.prototype.nb$power;Sk.builtin.float_.prototype.nb$negative=function(){return new Sk.builtin.float_(-this.v)};
    Sk.builtin.float_.prototype.nb$positive=function(){return this.clone()};Sk.builtin.float_.prototype.nb$nonzero=function(){return 0!==this.v};Sk.builtin.float_.prototype.nb$isnegative=function(){return 0>this.v};Sk.builtin.float_.prototype.nb$ispositive=function(){return 0<=this.v};
    Sk.builtin.float_.prototype.numberCompare=function(a){var b;if(a instanceof Sk.builtin.int_||a instanceof Sk.builtin.float_)return Infinity==this.v&&Infinity==a.v||-Infinity==this.v&&-Infinity==a.v?0:this.v-a.v;if(a instanceof Sk.builtin.lng){if(0===this.v%1)return b=new Sk.builtin.lng(this.v),a=b.longCompare(a);a=this.nb$subtract(a);if(a instanceof Sk.builtin.float_)return a.v;if(a instanceof Sk.builtin.lng)return a.longCompare(Sk.builtin.biginteger.ZERO)}return Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.float_.prototype.ob$eq=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0==this.numberCompare(a)):a instanceof Sk.builtin.none?Sk.builtin.bool.false$:Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.float_.prototype.ob$ne=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0!=this.numberCompare(a)):a instanceof Sk.builtin.none?Sk.builtin.bool.true$:Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.float_.prototype.ob$lt=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0>this.numberCompare(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.float_.prototype.ob$le=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0>=this.numberCompare(a)):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.float_.prototype.ob$gt=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0<this.numberCompare(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.float_.prototype.ob$ge=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0<=this.numberCompare(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.float_.prototype.__round__=function(a,b){Sk.builtin.pyCheckArgs("__round__",arguments,1,2);var c,d;if(void 0!==b&&!Sk.misceval.isIndex(b))throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(b)+"' object cannot be interpreted as an index");void 0===b&&(b=0);d=Sk.builtin.asnum$(a);b=Sk.misceval.asIndex(b);c=Math.pow(10,b);c=Math.round(d*c)/c;return new Sk.builtin.float_(c)};Sk.builtin.float_.prototype.conjugate=new Sk.builtin.func(function(a){return new Sk.builtin.float_(a.v)});
    Sk.builtin.float_.prototype.$r=function(){return new Sk.builtin.str(this.str$(10,!0))};Sk.builtin.float_.prototype.tp$str=function(){return new Sk.builtin.str(this.str$(10,!0))};
    Sk.builtin.float_.prototype.str$=function(a,b){var c,d,e,f;if(isNaN(this.v))return"nan";void 0===b&&(b=!0);if(Infinity==this.v)return"inf";if(-Infinity==this.v&&b)return"-inf";if(-Infinity==this.v&&!b)return"inf";f=b?this.v:Math.abs(this.v);if(void 0===a||10===a){e=f.toPrecision(12);c=e.indexOf(".");d=f.toString().slice(0,c);c=f.toString().slice(c);d.match(/^-?0$/)&&c.slice(1).match(/^0{4,}/)&&(e=12>e.length?f.toExponential():f.toExponential(11));if(0>e.indexOf("e")&&0<=e.indexOf(".")){for(;"0"==
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    e.charAt(e.length-1);)e=e.substring(0,e.length-1);"."==e.charAt(e.length-1)&&(e+="0")}e=e.replace(/\.0+e/,"e","i");e=e.replace(/(e[-+])([1-9])$/,"$10$2");e=e.replace(/0+(e.*)/,"$1")}else e=f.toString(a);0===this.v&&-Infinity===1/this.v&&(e="-"+e);0>e.indexOf(".")&&(0>e.indexOf("E")&&0>e.indexOf("e"))&&(e+=".0");return e};var deprecatedError=new Sk.builtin.ExternalError("Sk.builtin.nmber is deprecated.");Sk.builtin.nmber=function(a,b){throw new Sk.builtin.ExternalError("Sk.builtin.nmber is deprecated. Please replace with Sk.builtin.int_, Sk.builtin.float_, or Sk.builtin.assk$.");};Sk.builtin.nmber.prototype.tp$index=function(){return this.v};Sk.builtin.nmber.prototype.tp$hash=function(){throw deprecatedError;};Sk.builtin.nmber.fromInt$=function(a){throw deprecatedError;};
    Sk.builtin.nmber.prototype.clone=function(){throw deprecatedError;};Sk.builtin.nmber.prototype.toFixed=function(a){throw deprecatedError;};Sk.builtin.nmber.prototype.nb$add=function(a){throw deprecatedError;};Sk.builtin.nmber.prototype.nb$subtract=function(a){throw deprecatedError;};Sk.builtin.nmber.prototype.nb$multiply=function(a){throw deprecatedError;};Sk.builtin.nmber.prototype.nb$divide=function(a){throw deprecatedError;};
    Sk.builtin.nmber.prototype.nb$floor_divide=function(a){throw deprecatedError;};Sk.builtin.nmber.prototype.nb$remainder=function(a){throw deprecatedError;};Sk.builtin.nmber.prototype.nb$divmod=function(a){throw deprecatedError;};Sk.builtin.nmber.prototype.nb$power=function(a){throw deprecatedError;};Sk.builtin.nmber.prototype.nb$and=function(a){throw deprecatedError;};Sk.builtin.nmber.prototype.nb$or=function(a){throw deprecatedError;};
    Sk.builtin.nmber.prototype.nb$xor=function(a){throw deprecatedError;};Sk.builtin.nmber.prototype.nb$lshift=function(a){throw deprecatedError;};Sk.builtin.nmber.prototype.nb$rshift=function(a){throw deprecatedError;};Sk.builtin.nmber.prototype.nb$inplace_add=Sk.builtin.nmber.prototype.nb$add;Sk.builtin.nmber.prototype.nb$inplace_subtract=Sk.builtin.nmber.prototype.nb$subtract;Sk.builtin.nmber.prototype.nb$inplace_multiply=Sk.builtin.nmber.prototype.nb$multiply;
    Sk.builtin.nmber.prototype.nb$inplace_divide=Sk.builtin.nmber.prototype.nb$divide;Sk.builtin.nmber.prototype.nb$inplace_remainder=Sk.builtin.nmber.prototype.nb$remainder;Sk.builtin.nmber.prototype.nb$inplace_floor_divide=Sk.builtin.nmber.prototype.nb$floor_divide;Sk.builtin.nmber.prototype.nb$inplace_power=Sk.builtin.nmber.prototype.nb$power;Sk.builtin.nmber.prototype.nb$inplace_and=Sk.builtin.nmber.prototype.nb$and;Sk.builtin.nmber.prototype.nb$inplace_or=Sk.builtin.nmber.prototype.nb$or;
    Sk.builtin.nmber.prototype.nb$inplace_xor=Sk.builtin.nmber.prototype.nb$xor;Sk.builtin.nmber.prototype.nb$inplace_lshift=Sk.builtin.nmber.prototype.nb$lshift;Sk.builtin.nmber.prototype.nb$inplace_rshift=Sk.builtin.nmber.prototype.nb$rshift;Sk.builtin.nmber.prototype.nb$negative=function(){throw deprecatedError;};Sk.builtin.nmber.prototype.nb$positive=function(){throw deprecatedError;};Sk.builtin.nmber.prototype.nb$nonzero=function(){throw deprecatedError;};
    Sk.builtin.nmber.prototype.nb$isnegative=function(){throw deprecatedError;};Sk.builtin.nmber.prototype.nb$ispositive=function(){throw deprecatedError;};Sk.builtin.nmber.prototype.numberCompare=function(a){throw deprecatedError;};Sk.builtin.nmber.prototype.__eq__=function(a,b){throw deprecatedError;};Sk.builtin.nmber.prototype.__ne__=function(a,b){throw deprecatedError;};Sk.builtin.nmber.prototype.__lt__=function(a,b){throw deprecatedError;};
    Sk.builtin.nmber.prototype.__le__=function(a,b){throw deprecatedError;};Sk.builtin.nmber.prototype.__gt__=function(a,b){throw deprecatedError;};Sk.builtin.nmber.prototype.__ge__=function(a,b){throw deprecatedError;};Sk.builtin.nmber.prototype.__round__=function(a,b){throw deprecatedError;};Sk.builtin.nmber.prototype.$r=function(){throw deprecatedError;};Sk.builtin.nmber.prototype.tp$str=function(){throw deprecatedError;};Sk.builtin.nmber.prototype.str$=function(a,b){throw deprecatedError;};
    goog.exportSymbol("Sk.builtin.nmber",Sk.builtin.nmber);Sk.builtin.lng=function(a,b){b=Sk.builtin.asnum$(b);if(!(this instanceof Sk.builtin.lng))return new Sk.builtin.lng(a,b);if(void 0===a)return this.biginteger=new Sk.builtin.biginteger(0),this;if(a instanceof Sk.builtin.lng)return this.biginteger=a.biginteger.clone(),this;if(a instanceof Sk.builtin.biginteger)return this.biginteger=a,this;if(a instanceof String||"string"===typeof a)return Sk.longFromStr(a,b);if(a instanceof Sk.builtin.str)return Sk.longFromStr(a.v,b);if(void 0!==a&&!Sk.builtin.checkString(a)&&
        !Sk.builtin.checkNumber(a))if(!0===a)a=1;else if(!1===a)a=0;else throw new Sk.builtin.TypeError("long() argument must be a string or a number, not '"+Sk.abstr.typeName(a)+"'");a=Sk.builtin.asnum$nofloat(a);this.biginteger=new Sk.builtin.biginteger(a);return this};Sk.abstr.setUpInheritance("long",Sk.builtin.lng,Sk.builtin.numtype);Sk.builtin.lng.prototype.tp$index=function(){return parseInt(this.str$(10,!0),10)};Sk.builtin.lng.prototype.tp$hash=function(){return new Sk.builtin.int_(this.tp$index())};
    Sk.builtin.lng.prototype.nb$int_=function(){return this.cantBeInt()?new Sk.builtin.lng(this):new Sk.builtin.int_(this.toInt$())};Sk.builtin.lng.prototype.__index__=new Sk.builtin.func(function(a){return a.nb$int_(a)});Sk.builtin.lng.prototype.nb$lng_=function(){return this};Sk.builtin.lng.prototype.nb$float_=function(){return new Sk.builtin.float_(Sk.ffi.remapToJs(this))};Sk.builtin.lng.MAX_INT$=new Sk.builtin.lng(Sk.builtin.int_.threshold$);Sk.builtin.lng.MIN_INT$=new Sk.builtin.lng(-Sk.builtin.int_.threshold$);
    Sk.builtin.lng.prototype.cantBeInt=function(){return 0<this.longCompare(Sk.builtin.lng.MAX_INT$)||0>this.longCompare(Sk.builtin.lng.MIN_INT$)};Sk.builtin.lng.fromInt$=function(a){return new Sk.builtin.lng(a)};Sk.longFromStr=function(a,b){var c=Sk.str2number(a,b,function(a,b){return 10===b?new Sk.builtin.biginteger(a):new Sk.builtin.biginteger(a,b)},function(a){return a.negate()},"long");return new Sk.builtin.lng(c)};goog.exportSymbol("Sk.longFromStr",Sk.longFromStr);
    Sk.builtin.lng.prototype.toInt$=function(){return this.biginteger.intValue()};Sk.builtin.lng.prototype.clone=function(){return new Sk.builtin.lng(this)};Sk.builtin.lng.prototype.conjugate=new Sk.builtin.func(function(a){return a.clone()});
    Sk.builtin.lng.prototype.nb$add=function(a){var b;if(a instanceof Sk.builtin.float_)return b=new Sk.builtin.float_(this.str$(10,!0)),b.nb$add(a);a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?new Sk.builtin.lng(this.biginteger.add(a.biginteger)):a instanceof Sk.builtin.biginteger?new Sk.builtin.lng(this.biginteger.add(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.lng.prototype.nb$reflected_add=function(a){return Sk.builtin.lng.prototype.nb$add.call(this,a)};Sk.builtin.lng.prototype.nb$inplace_add=Sk.builtin.lng.prototype.nb$add;
    Sk.builtin.lng.prototype.nb$subtract=function(a){var b;if(a instanceof Sk.builtin.float_)return b=new Sk.builtin.float_(this.str$(10,!0)),b.nb$subtract(a);a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?new Sk.builtin.lng(this.biginteger.subtract(a.biginteger)):a instanceof Sk.builtin.biginteger?new Sk.builtin.lng(this.biginteger.subtract(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.lng.prototype.nb$reflected_subtract=function(a){var b=this.nb$negative();return Sk.builtin.lng.prototype.nb$add.call(b,a)};Sk.builtin.lng.prototype.nb$inplace_subtract=Sk.builtin.lng.prototype.nb$subtract;
    Sk.builtin.lng.prototype.nb$multiply=function(a){var b;if(a instanceof Sk.builtin.float_)return b=new Sk.builtin.float_(this.str$(10,!0)),b.nb$multiply(a);a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?new Sk.builtin.lng(this.biginteger.multiply(a.biginteger)):a instanceof Sk.builtin.biginteger?new Sk.builtin.lng(this.biginteger.multiply(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.lng.prototype.nb$reflected_multiply=function(a){return Sk.builtin.lng.prototype.nb$multiply.call(this,a)};Sk.builtin.lng.prototype.nb$inplace_multiply=Sk.builtin.lng.prototype.nb$multiply;
    Sk.builtin.lng.prototype.nb$divide=function(a){var b,c;if(a instanceof Sk.builtin.float_)return b=new Sk.builtin.float_(this.str$(10,!0)),b.nb$divide(a);a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));if(a instanceof Sk.builtin.lng){b=this.nb$isnegative();c=a.nb$isnegative();if(b&&!c||c&&!b){a=this.biginteger.divideAndRemainder(a.biginteger);if(0===a[1].trueCompare(Sk.builtin.biginteger.ZERO))return new Sk.builtin.lng(a[0]);a=a[0].subtract(Sk.builtin.biginteger.ONE);return new Sk.builtin.lng(a)}return new Sk.builtin.lng(this.biginteger.divide(a.biginteger))}return Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.lng.prototype.nb$reflected_divide=function(a){a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?a.nb$divide(this):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.lng.prototype.nb$floor_divide=function(a){var b;if(a instanceof Sk.builtin.float_)return b=new Sk.builtin.float_(this.str$(10,!0)),b.nb$floor_divide(a);a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?a.nb$divide(this):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.lng.prototype.nb$divmod=function(a){a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?new Sk.builtin.tuple([this.nb$floor_divide(a),this.nb$remainder(a)]):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.lng.prototype.nb$reflected_divmod=function(a){a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?new Sk.builtin.tuple([a.nb$floor_divide(this),a.nb$remainder(this)]):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.lng.prototype.nb$inplace_divide=Sk.builtin.lng.prototype.nb$divide;Sk.builtin.lng.prototype.nb$floor_divide=Sk.builtin.lng.prototype.nb$divide;Sk.builtin.lng.prototype.nb$reflected_floor_divide=Sk.builtin.lng.prototype.nb$reflected_divide;Sk.builtin.lng.prototype.nb$inplace_floor_divide=Sk.builtin.lng.prototype.nb$floor_divide;
    Sk.builtin.lng.prototype.nb$remainder=function(a){var b;if(0===this.biginteger.trueCompare(Sk.builtin.biginteger.ZERO))return a instanceof Sk.builtin.float_?new Sk.builtin.float_(0):new Sk.builtin.lng(0);if(a instanceof Sk.builtin.float_)return b=new Sk.builtin.float_(this.str$(10,!0)),b.nb$remainder(a);a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?(b=new Sk.builtin.lng(this.biginteger.remainder(a.biginteger)),this.nb$isnegative()?a.nb$ispositive()&&
        b.nb$nonzero()&&(b=b.nb$add(a).nb$remainder(a)):a.nb$isnegative()&&b.nb$nonzero()&&(b=b.nb$add(a)),b):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.lng.prototype.nb$reflected_remainder=function(a){a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?a.nb$remainder(this):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.lng.prototype.nb$inplace_remainder=Sk.builtin.lng.prototype.nb$remainder;
    Sk.builtin.lng.prototype.nb$divmod=function(a){var b;a===Sk.builtin.bool.true$&&(a=new Sk.builtin.lng(1));a===Sk.builtin.bool.false$&&(a=new Sk.builtin.lng(0));a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?new Sk.builtin.tuple([this.nb$floor_divide(a),this.nb$remainder(a)]):a instanceof Sk.builtin.float_?(b=new Sk.builtin.float_(this.str$(10,!0)),b.nb$divmod(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.lng.prototype.nb$power=function(a,b){var c;if(void 0!==b)return a=new Sk.builtin.biginteger(Sk.builtin.asnum$(a)),b=new Sk.builtin.biginteger(Sk.builtin.asnum$(b)),new Sk.builtin.lng(this.biginteger.modPowInt(a,b));if(a instanceof Sk.builtin.float_||a instanceof Sk.builtin.int_&&0>a.v)return c=new Sk.builtin.float_(this.str$(10,!0)),c.nb$power(a);a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?void 0!==b?(a=new Sk.builtin.biginteger(Sk.builtin.asnum$(a)),
        b=new Sk.builtin.biginteger(Sk.builtin.asnum$(b)),new Sk.builtin.lng(this.biginteger.modPowInt(a,b))):a.nb$isnegative()?(c=new Sk.builtin.float_(this.str$(10,!0)),c.nb$power(a)):new Sk.builtin.lng(this.biginteger.pow(a.biginteger)):a instanceof Sk.builtin.biginteger?void 0!==b?(b=new Sk.builtin.biginteger(Sk.builtin.asnum$(b)),new Sk.builtin.lng(this.biginteger.modPowInt(a,b))):a.isnegative()?(c=new Sk.builtin.float_(this.str$(10,!0)),c.nb$power(a)):new Sk.builtin.lng(this.biginteger.pow(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.lng.prototype.nb$reflected_power=function(a,b){a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?a.nb$power(this,b):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.lng.prototype.nb$inplace_power=Sk.builtin.lng.prototype.nb$power;Sk.builtin.lng.prototype.nb$abs=function(){return new Sk.builtin.lng(this.biginteger.bnAbs())};
    Sk.builtin.lng.prototype.nb$lshift=function(a){a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));if(a instanceof Sk.builtin.lng){if(0>a.biginteger.signum())throw new Sk.builtin.ValueError("negative shift count");return new Sk.builtin.lng(this.biginteger.shiftLeft(a.biginteger))}if(a instanceof Sk.builtin.biginteger){if(0>a.signum())throw new Sk.builtin.ValueError("negative shift count");return new Sk.builtin.lng(this.biginteger.shiftLeft(a))}return Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.lng.prototype.nb$reflected_lshift=function(a){a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?a.nb$lshift(this):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.lng.prototype.nb$inplace_lshift=Sk.builtin.lng.prototype.nb$lshift;
    Sk.builtin.lng.prototype.nb$rshift=function(a){a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));if(a instanceof Sk.builtin.lng){if(0>a.biginteger.signum())throw new Sk.builtin.ValueError("negative shift count");return new Sk.builtin.lng(this.biginteger.shiftRight(a.biginteger))}if(a instanceof Sk.builtin.biginteger){if(0>a.signum())throw new Sk.builtin.ValueError("negative shift count");return new Sk.builtin.lng(this.biginteger.shiftRight(a))}return Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.lng.prototype.nb$reflected_rshift=function(a){a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?a.nb$rshift(this):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.lng.prototype.nb$inplace_rshift=Sk.builtin.lng.prototype.nb$rshift;
    Sk.builtin.lng.prototype.nb$and=function(a){a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?new Sk.builtin.lng(this.biginteger.and(a.biginteger)):a instanceof Sk.builtin.biginteger?new Sk.builtin.lng(this.biginteger.and(a)):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.lng.prototype.nb$reflected_and=Sk.builtin.lng.prototype.nb$and;Sk.builtin.lng.prototype.nb$inplace_and=Sk.builtin.lng.prototype.nb$and;
    Sk.builtin.lng.prototype.nb$or=function(a){a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?new Sk.builtin.lng(this.biginteger.or(a.biginteger)):a instanceof Sk.builtin.biginteger?new Sk.builtin.lng(this.biginteger.or(a)):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.lng.prototype.nb$reflected_or=Sk.builtin.lng.prototype.nb$or;Sk.builtin.lng.prototype.nb$inplace_or=Sk.builtin.lng.prototype.nb$or;
    Sk.builtin.lng.prototype.nb$xor=function(a){a instanceof Sk.builtin.int_&&(a=new Sk.builtin.lng(a.v));return a instanceof Sk.builtin.lng?new Sk.builtin.lng(this.biginteger.xor(a.biginteger)):a instanceof Sk.builtin.biginteger?new Sk.builtin.lng(this.biginteger.xor(a)):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.lng.prototype.nb$reflected_xor=Sk.builtin.lng.prototype.nb$xor;Sk.builtin.lng.prototype.nb$inplace_xor=Sk.builtin.lng.prototype.nb$xor;Sk.builtin.lng.prototype.nb$negative=function(){return new Sk.builtin.lng(this.biginteger.negate())};
    Sk.builtin.lng.prototype.nb$invert=function(){return new Sk.builtin.lng(this.biginteger.not())};Sk.builtin.lng.prototype.nb$positive=function(){return this.clone()};Sk.builtin.lng.prototype.nb$nonzero=function(){return 0!==this.biginteger.trueCompare(Sk.builtin.biginteger.ZERO)};Sk.builtin.lng.prototype.nb$isnegative=function(){return this.biginteger.isnegative()};Sk.builtin.lng.prototype.nb$ispositive=function(){return!this.biginteger.isnegative()};
    Sk.builtin.lng.prototype.longCompare=function(a){var b;"number"===typeof a&&(a=new Sk.builtin.lng(a));return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.float_&&0===a.v%1?(a=new Sk.builtin.lng(a.v),this.longCompare(a)):a instanceof Sk.builtin.float_?(b=new Sk.builtin.float_(this),b.numberCompare(a)):a instanceof Sk.builtin.lng?this.biginteger.subtract(a.biginteger):a instanceof Sk.builtin.biginteger?this.biginteger.subtract(a):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.lng.prototype.ob$eq=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0==this.longCompare(a)):a instanceof Sk.builtin.none?Sk.builtin.bool.false$:Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.lng.prototype.ob$ne=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0!=this.longCompare(a)):a instanceof Sk.builtin.none?Sk.builtin.bool.true$:Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.lng.prototype.ob$lt=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0>this.longCompare(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.lng.prototype.ob$le=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0>=this.longCompare(a)):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.lng.prototype.ob$gt=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0<this.longCompare(a)):Sk.builtin.NotImplemented.NotImplemented$};
    Sk.builtin.lng.prototype.ob$ge=function(a){return a instanceof Sk.builtin.int_||a instanceof Sk.builtin.lng||a instanceof Sk.builtin.float_?new Sk.builtin.bool(0<=this.longCompare(a)):Sk.builtin.NotImplemented.NotImplemented$};Sk.builtin.lng.prototype.$r=function(){return new Sk.builtin.str(this.str$(10,!0)+"L")};Sk.builtin.lng.prototype.tp$str=function(){return new Sk.builtin.str(this.str$(10,!0))};
    Sk.builtin.lng.prototype.str$=function(a,b){var c;void 0===b&&(b=!0);c=b?this.biginteger:this.biginteger.abs();return void 0===a||10===a?c.toString():c.toString(a)};Math.hypot=Math.hypot||function(){for(var a=0,b=arguments.length,c=0;c<b;c++){if(Infinity===arguments[c]||-Infinity===arguments[c])return Infinity;a+=arguments[c]*arguments[c]}return Math.sqrt(a)};
    Sk.builtin.complex=function(a,b){Sk.builtin.pyCheckArgs("complex",arguments,0,2);var c,d,e,f,g,h=!1,k=!1;if(!(this instanceof Sk.builtin.complex))return new Sk.builtin.complex(a,b);c=null==a?Sk.builtin.bool.false$:a;d=b;if(c instanceof Sk.builtin.complex&&null==d)return a;if(null!=c&&Sk.builtin.checkString(c)){if(null!=d)throw new Sk.builtin.TypeError("complex() can't take second arg if first is a string");return Sk.builtin.complex.complex_subtype_from_string(c)}if(null!=d&&Sk.builtin.checkString(d))throw new Sk.builtin.TypeError("complex() second arg can't be a string");
        e=Sk.builtin.complex.try_complex_special_method(c);if(null!=e&&e!==Sk.builtin.NotImplemented.NotImplemented$){if(!Sk.builtin.checkComplex(e))throw new Sk.builtin.TypeError("__complex__ should return a complex object");c=e}e=Sk.builtin.asnum$(c);null!=d&&(f=Sk.builtin.asnum$(d));var l=function(a){if(Sk.builtin.checkNumber(a)||void 0!==Sk.builtin.type.typeLookup(a.ob$type,"__float__"))return!0};if(null==e||!l(c)&&!Sk.builtin.checkComplex(c)||null!=d&&(null==f||!l(d)&&!Sk.builtin.checkComplex(d)))throw new Sk.builtin.TypeError("complex() argument must be a string or number");
        if(Sk.builtin.complex._complex_check(c))f=c.real.v,c=c.imag.v,h=!0;else{e=Sk.builtin.float_.PyFloat_AsDouble(c);if(null==e)return null;f=e;c=0}if(null==d)e=0;else if(Sk.builtin.complex._complex_check(d))e=d.real.v,g=d.imag.v,k=!0;else{e=Sk.builtin.float_.PyFloat_AsDouble(d);if(null==e)return null;g=0}!0===k&&(f-=g);!0===h&&(e+=c);0===f&&(0>e||Sk.builtin.complex._isNegativeZero(e))&&(f=-0);this.real=new Sk.builtin.float_(f);this.imag=new Sk.builtin.float_(e);this.__class__=Sk.builtin.complex;return this};
    Sk.abstr.setUpInheritance("complex",Sk.builtin.complex,Sk.builtin.numtype);Sk.builtin.complex.prototype.nb$int_=function(){throw new Sk.builtin.TypeError("can't convert complex to int");};Sk.builtin.complex.prototype.nb$float_=function(){throw new Sk.builtin.TypeError("can't convert complex to float");};Sk.builtin.complex.prototype.nb$lng=function(){throw new Sk.builtin.TypeError("can't convert complex to long");};Sk.builtin.complex.prototype.__doc__=new Sk.builtin.str("complex(real[, imag]) -> complex number\n\nCreate a complex number from a real part and an optional imaginary part.\nThis is equivalent to (real + imag*1j) where imag defaults to 0.");
    Sk.builtin.complex._isNegativeZero=function(a){return 0!==a?!1:-Infinity===1/a};Sk.builtin.complex.try_complex_special_method=function(a){new Sk.builtin.str("__complex__");var b;if(null==a)return null;b=Sk.abstr.lookupSpecial(a,"__complex__");return null!=b?a=Sk.misceval.callsim(b,a):null};
    Sk.builtin.complex.check_number_or_complex=function(a){if(!Sk.builtin.checkNumber(a)&&"complex"!==a.tp$name)throw new Sk.builtin.TypeError("unsupported operand type(s) for +: 'complex' and '"+Sk.abstr.typeName(a)+"'");Sk.builtin.checkNumber(a)&&(a=new Sk.builtin.complex(a));return a};
    Sk.builtin.complex.complex_subtype_from_string=function(a){var b,c,d=0,e=0,f=!1,g;if(Sk.builtin.checkString(a))a=Sk.ffi.remapToJs(a);else if("string"!==typeof a)throw new TypeError("provided unsupported string-alike argument");if(-1!==a.indexOf("\x00")||0===a.length||""===a)throw new Sk.builtin.ValueError("complex() arg is a malformed string");b=0;a=a.replace(/inf|infinity/gi,"Infinity");for(a=a.replace(/nan/gi,"NaN");" "===a[b];)b++;if("("===a[b])for(f=!0,b++;" "===a[b];)b++;var h=/^(?:[+-]?(?:(?:(?:\d*\.\d+)|(?:\d+\.?))(?:[eE][+-]?\d+)?|NaN|Infinity))/;
        c=a.substr(b);g=c.match(h);if(null!==g)if(b+=g[0].length,"j"===a[b]||"J"===a[b])e=parseFloat(g[0]),b++;else if("+"===a[b]||"-"===a[b]){d=parseFloat(g[0]);g=a.substr(b).match(h);null!==g?(e=parseFloat(g[0]),b+=g[0].length):(e="+"===a[b]?1:-1,b++);if("j"!==a[b]&&"J"!==a[b])throw new Sk.builtin.ValueError("complex() arg is malformed string");b++}else d=parseFloat(g[0]);else g=g=c.match(/^([+-]?[jJ])/),null!==g&&(e=1===g[0].length?1:"+"===g[0][0]?1:-1,b+=g[0].length);for(;" "===a[b];)b++;if(f){if(")"!==
            a[b])throw new Sk.builtin.ValueError("complex() arg is malformed string");for(b++;" "===a[b];)b++}if(a.length!==b)throw new Sk.builtin.ValueError("complex() arg is malformed string");return new Sk.builtin.complex(new Sk.builtin.float_(d),new Sk.builtin.float_(e))};Sk.builtin.complex.prototype.tp$hash=function(){return new Sk.builtin.int_(1000003*this.tp$getattr("imag").v+this.tp$getattr("real").v)};
    Sk.builtin.complex.prototype.nb$add=function(a){var b;a=Sk.builtin.complex.check_number_or_complex(a);b=this.tp$getattr("real").v+a.tp$getattr("real").v;a=this.tp$getattr("imag").v+a.tp$getattr("imag").v;return new Sk.builtin.complex(new Sk.builtin.float_(b),new Sk.builtin.float_(a))};Sk.builtin.complex._c_diff=function(a,b){var c,d;c=a.real.nb$subtract.call(a.real,b.real);d=a.imag.nb$subtract.call(a.imag,b.imag);return new Sk.builtin.complex(c,d)};
    Sk.builtin.complex.prototype.nb$subtract=function(a){var b;b=Sk.builtin.complex.check_number_or_complex(this);a=Sk.builtin.complex.check_number_or_complex(a);return Sk.builtin.complex._c_diff(b,a)};Sk.builtin.complex.prototype.nb$multiply=function(a){var b;b=Sk.builtin.complex.check_number_or_complex(a);a=this.real.v*b.real.v-this.imag.v*b.imag.v;b=this.real.v*b.imag.v+this.imag.v*b.real.v;return new Sk.builtin.complex(new Sk.builtin.float_(a),new Sk.builtin.float_(b))};
    Sk.builtin.complex.prototype.nb$divide=function(a){var b;a=Sk.builtin.complex.check_number_or_complex(a);var c,d;b=a.real.v;var e=a.imag.v;a=this.real.v;var f=this.imag.v;c=Math.abs(b);d=Math.abs(e);if(c>=d){if(0===c)throw new Sk.builtin.ZeroDivisionError("complex division by zero");c=e/b;d=b+e*c;b=(a+f*c)/d;a=(f-a*c)/d}else d>=c?(c=b/e,d=b*c+e,goog.asserts.assert(0!==e),b=(a*c+f)/d,a=(f*c-a)/d):a=b=NaN;return new Sk.builtin.complex(new Sk.builtin.float_(b),new Sk.builtin.float_(a))};
    Sk.builtin.complex.prototype.nb$floor_divide=function(a){throw new Sk.builtin.TypeError("can't take floor of complex number.");};Sk.builtin.complex.prototype.nb$remainder=function(a){throw new Sk.builtin.TypeError("can't mod complex numbers.");};
    Sk.builtin.complex.prototype.nb$power=function(a,b){var c,d;if(null!=b&&!Sk.builtin.checkNone(b))throw new Sk.builtin.ValueError("complex modulo");d=Sk.builtin.complex.check_number_or_complex(a);c=d.real.v|0;return 0===d.imag.v&&d.real.v===c?Sk.builtin.complex.c_powi(this,c):Sk.builtin.complex.c_pow(this,d)};
    Sk.builtin.complex.c_pow=function(a,b){var c,d,e,f;f=b.real.v;var g=b.imag.v;e=a.real.v;var h=a.imag.v;if(0===f&&0===g)c=1,d=0;else if(0===e&&0===h){if(0!==g||0>f)throw new Sk.builtin.ZeroDivisionError("complex division by zero");d=c=0}else c=Math.hypot(e,h),d=Math.pow(c,f),e=Math.atan2(h,e),f*=e,0!==g&&(d/=Math.exp(e*g),f+=g*Math.log(c)),c=d*Math.cos(f),d*=Math.sin(f);return new Sk.builtin.complex(new Sk.builtin.float_(c),new Sk.builtin.float_(d))};
    Sk.builtin.complex.c_powi=function(a,b){var c;return 100<b||-100>b?(c=new Sk.builtin.complex(new Sk.builtin.float_(b),new Sk.builtin.float_(0)),Sk.builtin.complex.c_pow(a,c)):0<b?Sk.builtin.complex.c_powu(a,b):(new Sk.builtin.complex(new Sk.builtin.float_(1),new Sk.builtin.float_(0))).nb$divide(Sk.builtin.complex.c_powu(a,-b))};
    Sk.builtin.complex.c_powu=function(a,b){var c,d,e=1;c=new Sk.builtin.complex(new Sk.builtin.float_(1),new Sk.builtin.float_(0));for(d=a;0<e&&b>=e;)b&e&&(c=c.nb$multiply(d)),e<<=1,d=d.nb$multiply(d);return c};Sk.builtin.complex.prototype.nb$inplace_add=Sk.builtin.complex.prototype.nb$add;Sk.builtin.complex.prototype.nb$inplace_subtract=Sk.builtin.complex.prototype.nb$subtract;Sk.builtin.complex.prototype.nb$inplace_multiply=Sk.builtin.complex.prototype.nb$multiply;
    Sk.builtin.complex.prototype.nb$inplace_divide=Sk.builtin.complex.prototype.nb$divide;Sk.builtin.complex.prototype.nb$inplace_remainder=Sk.builtin.complex.prototype.nb$remainder;Sk.builtin.complex.prototype.nb$inplace_floor_divide=Sk.builtin.complex.prototype.nb$floor_divide;Sk.builtin.complex.prototype.nb$inplace_power=Sk.builtin.complex.prototype.nb$power;
    Sk.builtin.complex.prototype.nb$negative=function(){var a,b;b=this.imag.v;a=-this.real.v;b=-b;return new Sk.builtin.complex(new Sk.builtin.float_(a),new Sk.builtin.float_(b))};Sk.builtin.complex.prototype.nb$positive=function(){return Sk.builtin.complex.check_number_or_complex(this)};Sk.builtin.complex._complex_check=function(a){return void 0===a?!1:a instanceof Sk.builtin.complex||a.tp$name&&"complex"===a.tp$name||Sk.builtin.issubclass(new Sk.builtin.type(a),Sk.builtin.complex)?!0:!1};
    Sk.builtin.complex.prototype.tp$richcompare=function(a,b){var c,d;if("Eq"!==b&&"NotEq"!==b){if(Sk.builtin.checkNumber(a)||Sk.builtin.complex._complex_check(a))throw new Sk.builtin.TypeError("no ordering relation is defined for complex numbers");return Sk.builtin.NotImplemented.NotImplemented$}d=Sk.builtin.complex.check_number_or_complex(this);c=d.tp$getattr("real").v;d=d.tp$getattr("imag").v;if(Sk.builtin.checkInt(a)){if(0===d)return c=Sk.misceval.richCompareBool(new Sk.builtin.float_(c),a,b),c=new Sk.builtin.bool(c);
        c=!1}else if(Sk.builtin.checkFloat(a))c=c===Sk.builtin.float_.PyFloat_AsDouble(a)&&0===d;else if(Sk.builtin.complex._complex_check(a)){var e=a.tp$getattr("real").v,f=a.tp$getattr("imag").v;c=c===e&&d===f}else return Sk.builtin.NotImplemented.NotImplemented$;"NotEq"===b&&(c=!c);return c=new Sk.builtin.bool(c)};Sk.builtin.complex.prototype.__eq__=function(a,b){return Sk.builtin.complex.prototype.tp$richcompare.call(a,b,"Eq")};
    Sk.builtin.complex.prototype.__ne__=function(a,b){return Sk.builtin.complex.prototype.tp$richcompare.call(a,b,"NotEq")};Sk.builtin.complex.prototype.__lt__=function(a,b){throw new Sk.builtin.TypeError("unorderable types: "+Sk.abstr.typeName(a)+" < "+Sk.abstr.typeName(b));};Sk.builtin.complex.prototype.__le__=function(a,b){throw new Sk.builtin.TypeError("unorderable types: "+Sk.abstr.typeName(a)+" <= "+Sk.abstr.typeName(b));};
    Sk.builtin.complex.prototype.__gt__=function(a,b){throw new Sk.builtin.TypeError("unorderable types: "+Sk.abstr.typeName(a)+" > "+Sk.abstr.typeName(b));};Sk.builtin.complex.prototype.__ge__=function(a,b){throw new Sk.builtin.TypeError("unorderable types: "+Sk.abstr.typeName(a)+" >= "+Sk.abstr.typeName(b));};Sk.builtin.complex.prototype.__float__=function(a){throw new Sk.builtin.TypeError("can't convert complex to float");};
    Sk.builtin.complex.prototype.__int__=function(a){throw new Sk.builtin.TypeError("can't convert complex to int");};Sk.builtin.complex.prototype._internalGenericGetAttr=Sk.builtin.object.prototype.GenericGetAttr;Sk.builtin.complex.prototype.tp$getattr=function(a){if(null!=a&&(Sk.builtin.checkString(a)||"string"===typeof a)){var b=a;Sk.builtin.checkString(a)&&(b=Sk.ffi.remapToJs(a));if("real"===b||"imag"===b)return this[b]}return this._internalGenericGetAttr(a)};
    Sk.builtin.complex.prototype.tp$setattr=function(a,b){if(null!=a&&(Sk.builtin.checkString(a)||"string"===typeof a)){var c=a;Sk.builtin.checkString(a)&&(c=Sk.ffi.remapToJs(a));if("real"===c||"imag"===c)throw new Sk.builtin.AttributeError("readonly attribute");}throw new Sk.builtin.AttributeError("'complex' object attribute '"+a+"' is readonly");};
    Sk.builtin.complex.complex_format=function(a,b,c){if(null==a||!Sk.builtin.complex._complex_check(a))throw Error("Invalid internal method call: Sk.complex.complex_format() called with invalid value type.");var d="",d="",e=null,f="",g="";0===a.real.v&&1==(0>a.real.v?-Math.abs(1):Math.abs(1))?(e="",d=Sk.builtin.complex.PyOS_double_to_string(a.imag.v,c,b,0,null)):(e=d=Sk.builtin.complex.PyOS_double_to_string(a.real.v,c,b,0,null),d=Sk.builtin.complex.PyOS_double_to_string(a.imag.v,c,b,Sk.builtin.complex.PyOS_double_to_string.Py_DTSF_SIGN,
        null),0===a.imag.v&&(-Infinity===1/a.imag.v&&d&&"-"!==d[0])&&(d="-"+d),f="(",g=")");return new Sk.builtin.str(""+f+e+d+"j"+g)};Sk.builtin.complex.prototype.$r=function(){return Sk.builtin.complex.complex_format(this,0,"r")};Sk.builtin.complex.prototype.tp$str=function(){return Sk.builtin.complex.complex_format(this,null,"g")};
    Sk.builtin.complex.prototype.__format__=new Sk.builtin.func(function(a,b){var c;if(null==b)return null;if(Sk.builtin.checkString(b))return c=Sk.builtin.complex._PyComplex_FormatAdvanced(a,b);throw new Sk.builtin.TypeError("__format__ requires str or unicode");});Sk.builtin.complex._PyComplex_FormatAdvanced=function(a,b){throw new Sk.builtin.NotImplementedError("__format__ is not implemented for complex type.");};
    Sk.builtin.complex._is_finite=function(a){return!isNaN(a)&&Infinity!==a&&-Infinity!==a};Sk.builtin.complex._is_infinity=function(a){return Infinity===a||-Infinity===a};
    Sk.builtin.complex.prototype.__abs__=new Sk.builtin.func(function(a){var b;b=a.real.v;a=a.imag.v;if(!Sk.builtin.complex._is_finite(b)||!Sk.builtin.complex._is_finite(a))return Sk.builtin.complex._is_infinity(b)?(b=Math.abs(b),new Sk.builtin.float_(b)):Sk.builtin.complex._is_infinity(a)?(b=Math.abs(a),new Sk.builtin.float_(b)):new Sk.builtin.float_(NaN);b=Math.hypot(b,a);if(!Sk.builtin.complex._is_finite(b))throw new Sk.builtin.OverflowError("absolute value too large");return new Sk.builtin.float_(b)});
    Sk.builtin.complex.prototype.__bool__=new Sk.builtin.func(function(a){return new Sk.builtin.bool(a.tp$getattr("real").v||a.tp$getattr("real").v)});Sk.builtin.complex.prototype.__truediv__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__truediv__",arguments,1,1,!0);return a.nb$divide.call(a,b)});Sk.builtin.complex.prototype.__hash__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__hash__",arguments,0,0,!0);return a.tp$hash.call(a)});
    Sk.builtin.complex.prototype.__add__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__add__",arguments,1,1,!0);return a.nb$add.call(a,b)});Sk.builtin.complex.prototype.__repr__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__repr__",arguments,0,0,!0);return a.r$.call(a)});Sk.builtin.complex.prototype.__str__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__str__",arguments,0,0,!0);return a.tp$str.call(a)});
    Sk.builtin.complex.prototype.__sub__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__sub__",arguments,1,1,!0);return a.nb$subtract.call(a,b)});Sk.builtin.complex.prototype.__mul__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__mul__",arguments,1,1,!0);return a.nb$multiply.call(a,b)});Sk.builtin.complex.prototype.__div__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__div__",arguments,1,1,!0);return a.nb$divide.call(a,b)});
    Sk.builtin.complex.prototype.__floordiv__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__floordiv__",arguments,1,1,!0);return a.nb$floor_divide.call(a,b)});Sk.builtin.complex.prototype.__mod__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__mod__",arguments,1,1,!0);return a.nb$remainder.call(a,b)});Sk.builtin.complex.prototype.__pow__=new Sk.builtin.func(function(a,b,c){Sk.builtin.pyCheckArgs("__pow__",arguments,1,2,!0);return a.nb$power.call(a,b,c)});
    Sk.builtin.complex.prototype.__neg__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__neg__",arguments,0,0,!0);return a.nb$negative.call(a)});Sk.builtin.complex.prototype.__pos__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__pos__",arguments,0,0,!0);return a.nb$positive.call(a)});Sk.builtin.complex.prototype.conjugate=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("conjugate",arguments,0,0,!0);var b=a.imag.v;return new Sk.builtin.complex(a.real,new Sk.builtin.float_(-b))});
    Sk.builtin.complex.prototype.__divmod__=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("__divmod__",arguments,1,1,!0);var c,d,e;d=Sk.builtin.complex.check_number_or_complex(a);e=Sk.builtin.complex.check_number_or_complex(b);c=d.nb$divide.call(d,e);c.real=new Sk.builtin.float_(Math.floor(c.real.v));c.imag=new Sk.builtin.float_(0);d=d.nb$subtract.call(d,e.nb$multiply.call(e,c));return new Sk.builtin.tuple([c,d])});
    Sk.builtin.complex.prototype.__getnewargs__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__getnewargs__",arguments,0,0,!0);return new Sk.builtin.tuple([a.real,a.imag])});Sk.builtin.complex.prototype.__nonzero__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__nonzero__",arguments,0,0,!0);return 0!==a.real.v||0!==a.imag.v?Sk.builtin.bool.true$:Sk.builtin.bool.false$});goog.exportSymbol("Sk.builtin.complex",Sk.builtin.complex);
    Sk.builtin.complex.PyOS_double_to_string=function(a,b,c,d,e){e=!1;switch(b){case "e":case "f":case "g":break;case "E":e=!0;b="e";break;case "F":e=!0;b="f";break;case "r":if(0!==c)throw Error("Bad internall call");c=17;b="g";break;default:throw Error("Bad internall call");}if(isNaN(a))a="nan";else if(Infinity===a)a="inf";else if(-Infinity===a)a="-inf";else{d&Sk.builtin.complex.PyOS_double_to_string.Py_DTSF_ADD_DOT_0&&(b="g");var f;f="%"+(d&Sk.builtin.complex.PyOS_double_to_string.Py_DTSF_ALT?"#":"");
        null!=c&&(f=f+"."+c);f+=b;f=new Sk.builtin.str(f);a=f.nb$remainder(new Sk.builtin.float_(a));a=a.v}d&Sk.builtin.complex.PyOS_double_to_string.Py_DTSF_SIGN&&"-"!==a[0]&&(a="+"+a);e&&(a=a.toUpperCase());return a};Sk.builtin.complex.PyOS_double_to_string.Py_DTSF_SIGN=1;Sk.builtin.complex.PyOS_double_to_string.Py_DTSF_ADD_DOT_0=2;Sk.builtin.complex.PyOS_double_to_string.Py_DTSF_ALT=4;Sk.builtin.complex.PyOS_double_to_string.Py_DTST_FINITE=0;Sk.builtin.complex.PyOS_double_to_string.Py_DTST_INFINITE=1;
    Sk.builtin.complex.PyOS_double_to_string.Py_DTST_NAN=2;Sk.builtin.slice=function(a,b,c){Sk.builtin.pyCheckArgs("slice",arguments,1,3,!1,!1);if(void 0!==c&&Sk.misceval.isIndex(c)&&0===Sk.misceval.asIndex(c))throw new Sk.builtin.ValueError("slice step cannot be zero");if(!(this instanceof Sk.builtin.slice))return new Sk.builtin.slice(a,b,c);void 0===b&&void 0===c&&(b=a,a=Sk.builtin.none.none$);void 0===b&&(b=Sk.builtin.none.none$);void 0===c&&(c=Sk.builtin.none.none$);this.start=a;this.stop=b;this.step=c;this.__class__=Sk.builtin.slice;this.$d=new Sk.builtin.dict([Sk.builtin.slice$start,
        this.start,Sk.builtin.slice$stop,this.stop,Sk.builtin.slice$step,this.step]);return this};Sk.abstr.setUpInheritance("slice",Sk.builtin.slice,Sk.builtin.object);Sk.builtin.slice.prototype.$r=function(){var a=Sk.builtin.repr(this.start).v,b=Sk.builtin.repr(this.stop).v,c=Sk.builtin.repr(this.step).v;return new Sk.builtin.str("slice("+a+", "+b+", "+c+")")};
    Sk.builtin.slice.prototype.tp$richcompare=function(a,b){var c,d;if(!a.__class__||a.__class__!=Sk.builtin.slice)return"Eq"===b?!1:"NotEq"===b?!0:!1;c=new Sk.builtin.tuple([this.start,this.stop,this.step]);d=new Sk.builtin.tuple([a.start,a.stop,a.step]);return c.tp$richcompare(d,b)};
    Sk.builtin.slice.prototype.slice_indices_=function(a){var b,c,d;if(Sk.builtin.checkNone(this.start))b=null;else if(Sk.misceval.isIndex(this.start))b=Sk.misceval.asIndex(this.start);else throw new Sk.builtin.TypeError("slice indices must be integers or None");if(Sk.builtin.checkNone(this.stop))c=null;else if(Sk.misceval.isIndex(this.stop))c=Sk.misceval.asIndex(this.stop);else throw new Sk.builtin.TypeError("slice indices must be integers or None");if(Sk.builtin.checkNone(this.step))d=null;else if(Sk.misceval.isIndex(this.step))d=
        Sk.misceval.asIndex(this.step);else throw new Sk.builtin.TypeError("slice indices must be integers or None");null===d&&(d=1);0<d?(null===b&&(b=0),null===c&&(c=a),c>a&&(c=a),0>b&&(b=a+b,0>b&&(b=0)),0>c&&(c=a+c)):(null===b&&(b=a-1),b>=a&&(b=a-1),null===c?c=-1:0>c&&(c=a+c,0>c&&(c=-1)),0>b&&(b=a+b));return[b,c,d]};
    Sk.builtin.slice.prototype.indices=new Sk.builtin.func(function(a,b){Sk.builtin.pyCheckArgs("indices",arguments,2,2,!1,!1);b=Sk.builtin.asnum$(b);var c=a.slice_indices_(b);return new Sk.builtin.tuple([new Sk.builtin.int_(c[0]),new Sk.builtin.int_(c[1]),new Sk.builtin.int_(c[2])])});
    Sk.builtin.slice.prototype.sssiter$=function(a,b){var c,d=Sk.builtin.asnum$(a),e=this.slice_indices_("number"===typeof d?d:a.v.length);if(0<e[2])for(c=e[0];c<e[1]&&!1!==b(c,d);c+=e[2]);else for(c=e[0];c>e[1]&&!1!==b(c,d);c+=e[2]);};Sk.builtin.slice$start=new Sk.builtin.str("start");Sk.builtin.slice$stop=new Sk.builtin.str("stop");Sk.builtin.slice$step=new Sk.builtin.str("step");Sk.builtin.set=function(a){var b;if(!(this instanceof Sk.builtin.set))return new Sk.builtin.set(a);"undefined"===typeof a&&(a=[]);this.set_reset_();a=new Sk.builtin.list(a);a=Sk.abstr.iter(a);for(b=a.tp$iternext();void 0!==b;b=a.tp$iternext())Sk.builtin.set.prototype.add.func_code(this,b);this.__class__=Sk.builtin.set;this.v=this.v;return this};Sk.abstr.setUpInheritance("set",Sk.builtin.set,Sk.builtin.object);Sk.abstr.markUnhashable(Sk.builtin.set);
    Sk.builtin.set.prototype.set_iter_=function(){var a=this.v.tp$iter();a.tp$name="set_iterator";return a};Sk.builtin.set.prototype.set_reset_=function(){this.v=new Sk.builtin.dict([])};Sk.builtin.set.prototype.$r=function(){var a,b,c=[];a=Sk.abstr.iter(this);for(b=a.tp$iternext();void 0!==b;b=a.tp$iternext())c.push(Sk.misceval.objectRepr(b).v);return Sk.python3?new Sk.builtin.str("{"+c.join(", ")+"}"):new Sk.builtin.str("set(["+c.join(", ")+"])")};
    Sk.builtin.set.prototype.ob$eq=function(a){return this===a?Sk.builtin.bool.true$:a instanceof Sk.builtin.set&&Sk.builtin.set.prototype.sq$length.call(this)===Sk.builtin.set.prototype.sq$length.call(a)?this.issubset.func_code(this,a):Sk.builtin.bool.false$};
    Sk.builtin.set.prototype.ob$ne=function(a){return this===a?Sk.builtin.bool.false$:a instanceof Sk.builtin.set&&Sk.builtin.set.prototype.sq$length.call(this)===Sk.builtin.set.prototype.sq$length.call(a)?this.issubset.func_code(this,a).v?Sk.builtin.bool.false$:Sk.builtin.bool.true$:Sk.builtin.bool.true$};
    Sk.builtin.set.prototype.ob$lt=function(a){return this===a||Sk.builtin.set.prototype.sq$length.call(this)>=Sk.builtin.set.prototype.sq$length.call(a)?Sk.builtin.bool.false$:this.issubset.func_code(this,a)};Sk.builtin.set.prototype.ob$le=function(a){return this===a?Sk.builtin.bool.true$:Sk.builtin.set.prototype.sq$length.call(this)>Sk.builtin.set.prototype.sq$length.call(a)?Sk.builtin.bool.false$:this.issubset.func_code(this,a)};
    Sk.builtin.set.prototype.ob$gt=function(a){return this===a||Sk.builtin.set.prototype.sq$length.call(this)<=Sk.builtin.set.prototype.sq$length.call(a)?Sk.builtin.bool.false$:this.issuperset.func_code(this,a)};Sk.builtin.set.prototype.ob$ge=function(a){return this===a?Sk.builtin.bool.true$:Sk.builtin.set.prototype.sq$length.call(this)<Sk.builtin.set.prototype.sq$length.call(a)?Sk.builtin.bool.false$:this.issuperset.func_code(this,a)};
    Sk.builtin.set.prototype.__iter__=new Sk.builtin.func(function(a){Sk.builtin.pyCheckArgs("__iter__",arguments,0,0,!1,!0);return Sk.builtin.set.prototype.tp$iter.call(a)});Sk.builtin.set.prototype.tp$iter=Sk.builtin.set.prototype.set_iter_;Sk.builtin.set.prototype.sq$length=function(){return this.v.mp$length()};Sk.builtin.set.prototype.sq$contains=function(a){return this.v.sq$contains(a)};
    Sk.builtin.set.prototype.isdisjoint=new Sk.builtin.func(function(a,b){var c,d;d=Sk.abstr.iter(a);for(c=d.tp$iternext();void 0!==c;c=d.tp$iternext())if(c=Sk.abstr.sequenceContains(b,c))return Sk.builtin.bool.false$;return Sk.builtin.bool.true$});
    Sk.builtin.set.prototype.issubset=new Sk.builtin.func(function(a,b){var c,d;d=a.sq$length();c=b.sq$length();if(d>c)return Sk.builtin.bool.false$;d=Sk.abstr.iter(a);for(c=d.tp$iternext();void 0!==c;c=d.tp$iternext())if(c=Sk.abstr.sequenceContains(b,c),!c)return Sk.builtin.bool.false$;return Sk.builtin.bool.true$});Sk.builtin.set.prototype.issuperset=new Sk.builtin.func(function(a,b){return Sk.builtin.set.prototype.issubset.func_code(b,a)});
    Sk.builtin.set.prototype.union=new Sk.builtin.func(function(a){var b,c=new Sk.builtin.set(a);for(b=1;b<arguments.length;b++)Sk.builtin.set.prototype.update.func_code(c,arguments[b]);return c});Sk.builtin.set.prototype.intersection=new Sk.builtin.func(function(a){var b=Sk.builtin.set.prototype.copy.func_code(a),c=Array.prototype.slice.call(arguments);c[0]=b;Sk.builtin.set.prototype.intersection_update.func_code.apply(null,c);return b});
    Sk.builtin.set.prototype.difference=new Sk.builtin.func(function(a,b){var c=Sk.builtin.set.prototype.copy.func_code(a),d=Array.prototype.slice.call(arguments);d[0]=c;Sk.builtin.set.prototype.difference_update.func_code.apply(null,d);return c});
    Sk.builtin.set.prototype.symmetric_difference=new Sk.builtin.func(function(a,b){var c,d,e=Sk.builtin.set.prototype.union.func_code(a,b);c=Sk.abstr.iter(e);for(d=c.tp$iternext();void 0!==d;d=c.tp$iternext())Sk.abstr.sequenceContains(a,d)&&Sk.abstr.sequenceContains(b,d)&&Sk.builtin.set.prototype.discard.func_code(e,d);return e});Sk.builtin.set.prototype.copy=new Sk.builtin.func(function(a){return new Sk.builtin.set(a)});
    Sk.builtin.set.prototype.update=new Sk.builtin.func(function(a,b){var c,d;c=Sk.abstr.iter(b);for(d=c.tp$iternext();void 0!==d;d=c.tp$iternext())Sk.builtin.set.prototype.add.func_code(a,d);return Sk.builtin.none.none$});
    Sk.builtin.set.prototype.intersection_update=new Sk.builtin.func(function(a,b){var c,d,e;d=Sk.abstr.iter(a);for(e=d.tp$iternext();void 0!==e;e=d.tp$iternext())for(c=1;c<arguments.length;c++)if(!Sk.abstr.sequenceContains(arguments[c],e)){Sk.builtin.set.prototype.discard.func_code(a,e);break}return Sk.builtin.none.none$});
    Sk.builtin.set.prototype.difference_update=new Sk.builtin.func(function(a,b){var c,d,e;d=Sk.abstr.iter(a);for(e=d.tp$iternext();void 0!==e;e=d.tp$iternext())for(c=1;c<arguments.length;c++)if(Sk.abstr.sequenceContains(arguments[c],e)){Sk.builtin.set.prototype.discard.func_code(a,e);break}return Sk.builtin.none.none$});
    Sk.builtin.set.prototype.symmetric_difference_update=new Sk.builtin.func(function(a,b){var c=Sk.builtin.set.prototype.symmetric_difference.func_code(a,b);a.set_reset_();Sk.builtin.set.prototype.update.func_code(a,c);return Sk.builtin.none.none$});Sk.builtin.set.prototype.add=new Sk.builtin.func(function(a,b){a.v.mp$ass_subscript(b,!0);return Sk.builtin.none.none$});
    Sk.builtin.set.prototype.discard=new Sk.builtin.func(function(a,b){Sk.builtin.dict.prototype.pop.func_code(a.v,b,Sk.builtin.none.none$);return Sk.builtin.none.none$});Sk.builtin.set.prototype.pop=new Sk.builtin.func(function(a){var b;if(0===a.sq$length())throw new Sk.builtin.KeyError("pop from an empty set");b=Sk.abstr.iter(a).tp$iternext();Sk.builtin.set.prototype.discard.func_code(a,b);return b});Sk.builtin.set.prototype.remove=new Sk.builtin.func(function(a,b){a.v.mp$del_subscript(b);return Sk.builtin.none.none$});
    goog.exportSymbol("Sk.builtin.set",Sk.builtin.set);var print_f=function(a){Sk.builtin.pyCheckArgs("print",arguments,0,Infinity,!0,!1);var b=Array.prototype.slice.call(arguments,1),c=new Sk.builtins.dict(a);Sk.ffi.remapToJs(c);var d={sep:" ",end:"\n",file:null},e,f;e=c.mp$lookup(new Sk.builtin.str("sep"));if(void 0!==e)if(f=Sk.builtin.checkNone(e),Sk.builtin.checkString(e)||f)d.sep=f?d.sep:Sk.ffi.remapToJs(e);else throw new Sk.builtin.TypeError("sep must be None or a string, not "+Sk.abstr.typeName(e));e=c.mp$lookup(new Sk.builtin.str("end"));if(void 0!==
        e)if(f=Sk.builtin.checkNone(e),Sk.builtin.checkString(e)||f)d.end=f?d.end:Sk.ffi.remapToJs(e);else throw new Sk.builtin.TypeError("end must be None or a string, not "+Sk.abstr.typeName(e));e=c.mp$lookup(new Sk.builtin.str("file"));if(void 0!==e)if((f=Sk.builtin.checkNone(e))||void 0!==e.tp$getattr("write"))d.file=f?d.file:e;else throw new Sk.builtin.AttributeError("'"+Sk.abstr.typeName(e)+"' object has no attribute 'write'");c="";for(e=0;e<b.length;e++)c+=(new Sk.builtin.str(b[e])).v,c+=d.sep;0<b.length&&
    0<d.sep.length&&(c=c.substring(0,c.length-d.sep.length));c+=d.end;null!==d.file?Sk.misceval.callsim(d.file.write,d.file,new Sk.builtin.str(c)):(b=Sk.importModule("sys"),Sk.misceval.apply(b.$d.stdout.write,void 0,void 0,void 0,[b.$d.stdout,new Sk.builtin.str(c)]))};print_f.co_kwargs=!0;Sk.builtin.print=new Sk.builtin.func(print_f);Sk.builtin.print.__doc__=new Sk.builtin.str("print(value, ..., sep=' ', end='\\n', file=sys.stdout, flush=False)\n\nPrints the values to a stream, or to sys.stdout by default.\nOptional keyword arguments:\nfile:  a file-like object (stream); defaults to the current sys.stdout.\nsep:   string inserted between values, default a space.\nend:   string appended after the last value, default a newline.\nflush: whether to forcibly flush the stream.");Sk.builtin.module=function(){};goog.exportSymbol("Sk.builtin.module",Sk.builtin.module);Sk.builtin.module.prototype.ob$type=Sk.builtin.type.makeIntoTypeObj("module",Sk.builtin.module);Sk.builtin.module.prototype.tp$getattr=Sk.builtin.object.prototype.GenericGetAttr;Sk.builtin.module.prototype.tp$setattr=Sk.builtin.object.prototype.GenericSetAttr;Sk.builtin.structseq_types={};
    Sk.builtin.make_structseq=function(a,b,c,d){var e=a+"."+b,f=[];a=[];for(var g in c)f.push(g),a.push(c[g]);c=function(a){Sk.builtin.pyCheckArgs(e,arguments,1,1);var b,c,d;if(!(this instanceof Sk.builtin.structseq_types[e]))return b=Object.create(Sk.builtin.structseq_types[e].prototype),b.constructor.apply(b,arguments),b;if("[object Array]"===Object.prototype.toString.apply(a))d=a;else{d=[];b=Sk.abstr.iter(a);for(c=b.tp$iternext();void 0!==c;c=b.tp$iternext())d.push(c);if(d.length!=f.length)throw new Sk.builtin.TypeError(e+
        "() takes a "+f.length+"-sequence ("+d.length+"-sequence given)");}Sk.builtin.tuple.call(this,d);this.__class__=Sk.builtin.structseq_types[e]};Sk.builtin.structseq_types[e]=c;goog.inherits(c,Sk.builtin.tuple);d&&(c.prototype.__doc__=d);c.prototype.tp$name=e;c.prototype.ob$type=Sk.builtin.type.makeIntoTypeObj(e,Sk.builtin.structseq_types[e]);c.prototype.ob$type.$d=new Sk.builtin.dict([]);c.prototype.ob$type.$d.mp$ass_subscript(Sk.builtin.type.basesStr_,new Sk.builtin.tuple([Sk.builtin.tuple]));c.prototype.__getitem__=
        new Sk.builtin.func(function(a,b){return Sk.builtin.tuple.prototype.mp$subscript.call(a,b)});c.prototype.__reduce__=new Sk.builtin.func(function(a){throw new Sk.builtin.Exception("__reduce__ is not implemented");});c.prototype.$r=function(){var a,b;if(0===this.v.length)return new Sk.builtin.str(e+"()");b=[];for(a=0;a<this.v.length;++a)b[a]=f[a]+"="+Sk.misceval.objectRepr(this.v[a]).v;a=b.join(", ");1===this.v.length&&(a+=",");return new Sk.builtin.str(e+"("+a+")")};c.prototype.tp$setattr=function(a,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              b){throw new Sk.builtin.AttributeError("readonly property");};c.prototype.tp$getattr=function(a){var b=f.indexOf(a);return 0<=b?this.v[b]:Sk.builtin.object.prototype.GenericGetAttr(a)};return c};goog.exportSymbol("Sk.builtin.make_structseq",Sk.builtin.make_structseq);Sk.builtin.generator=function(a,b,c,d,e){var f;if(a){if(!(this instanceof Sk.builtin.generator))return new Sk.builtin.generator(a,b,c,d,e);this.func_code=a;this.func_globals=b||null;this.gi$running=!1;this.gi$resumeat=0;this.gi$sentvalue=void 0;this.gi$locals={};this.gi$cells={};if(0<c.length)for(b=0;b<a.co_varnames.length;++b)this.gi$locals[a.co_varnames[b]]=c[b];if(void 0!==e)for(f in e)d[f]=e[f];this.func_closure=d;return this}};goog.exportSymbol("Sk.builtin.generator",Sk.builtin.generator);
    Sk.abstr.setUpInheritance("generator",Sk.builtin.generator,Sk.builtin.object);Sk.builtin.generator.prototype.tp$iter=function(){return this};
    Sk.builtin.generator.prototype.tp$iternext=function(a,b){var c,d=this;this.gi$running=!0;void 0===b&&(b=null);this.gi$sentvalue=b;c=[this];this.func_closure&&c.push(this.func_closure);return function f(b){if(b instanceof Sk.misceval.Suspension){if(a)return new Sk.misceval.Suspension(f,b);b=Sk.misceval.retryOptionalSuspensionOrThrow(b)}d.gi$running=!1;goog.asserts.assert(void 0!==b);if(b!==Sk.builtin.none.none$)return d.gi$resumeat=b[0],b=b[1]}(this.func_code.apply(this.func_globals,c))};
    Sk.builtin.generator.prototype.next=new Sk.builtin.func(function(a){return a.tp$iternext(!0)});Sk.builtin.generator.prototype.$r=function(){return new Sk.builtin.str("<generator object "+this.func_code.co_name.v+">")};Sk.builtin.generator.prototype.send=new Sk.builtin.func(function(a,b){return a.tp$iternext(!0,b)});Sk.builtin.makeGenerator=function(a,b){var c,d=new Sk.builtin.generator(null,null,null);d.tp$iternext=a;for(c in b)b.hasOwnProperty(c)&&(d[c]=b[c]);return d};
    goog.exportSymbol("Sk.builtin.makeGenerator",Sk.builtin.makeGenerator);Sk.builtin.file=function(a,b,c){var d;if(!(this instanceof Sk.builtin.file))return new Sk.builtin.file(a,b,c);this.mode=b;this.name=Sk.ffi.remapToJs(a);this.closed=!1;if("/dev/stdout"===this.name)this.data$=Sk.builtin.none.none$,this.fileno=1;else if("/dev/stdin"===this.name)this.fileno=0;else if("/dev/stderr"===this.name)this.fileno=2;else{if(Sk.inBrowser){this.fileno=10;b=document.getElementById(a.v);if(null==b)throw new Sk.builtin.IOError("[Errno 2] No such file or directory: '"+a.v+"'");"textarea"==
    b.nodeName.toLowerCase()?this.data$=b.value:this.data$=b.textContent}else this.fileno=11,this.data$=Sk.read(a.v);this.lineList=this.data$.split("\n");this.lineList=this.lineList.slice(0,-1);for(d in this.lineList)this.lineList[d]+="\n";this.currentLine=0}this.pos$=0;this.__class__=Sk.builtin.file;return this};Sk.abstr.setUpInheritance("file",Sk.builtin.file,Sk.builtin.object);
    Sk.builtin.file.prototype.$r=function(){return new Sk.builtin.str("<"+(this.closed?"closed":"open")+"file '"+this.name+"', mode '"+this.mode+"'>")};Sk.builtin.file.prototype.tp$iter=function(){var a={tp$iter:function(){return a},$obj:this,$index:0,$lines:this.lineList,tp$iternext:function(){return a.$index>=a.$lines.length?void 0:new Sk.builtin.str(a.$lines[a.$index++])}};return a};Sk.builtin.file.prototype.close=new Sk.builtin.func(function(a){a.closed=!0});Sk.builtin.file.prototype.flush=new Sk.builtin.func(function(a){});
    Sk.builtin.file.prototype.fileno=new Sk.builtin.func(function(a){return this.fileno});Sk.builtin.file.prototype.isatty=new Sk.builtin.func(function(a){return!1});Sk.builtin.file.prototype.read=new Sk.builtin.func(function(a,b){var c,d;if(a.closed)throw new Sk.builtin.ValueError("I/O operation on closed file");d=a.data$.length;void 0===b&&(b=d);c=new Sk.builtin.str(a.data$.substr(a.pos$,b));a.pos$+=b;a.pos$>=d&&(a.pos$=d);return c});
    Sk.builtin.file.prototype.readline=new Sk.builtin.func(function(a,b){if(0===a.fileno){var c,d,e;c=c?c.v:"";c=Sk.inputfun(c);return c instanceof Promise?(e=new Sk.misceval.Suspension,e.resume=function(){return new Sk.builtin.str(d)},e.data={type:"Sk.promise",promise:c.then(function(a){return d=a},function(a){d="";return a})},e):new Sk.builtin.str(c)}c="";a.currentLine<a.lineList.length&&(c=a.lineList[a.currentLine],a.currentLine++);return new Sk.builtin.str(c)});
    Sk.builtin.file.prototype.readlines=new Sk.builtin.func(function(a,b){if(0===a.fileno)return new Sk.builtin.NotImplementedError("readlines ins't implemented because the web doesn't support Ctrl+D");var c,d=[];for(c=a.currentLine;c<a.lineList.length;c++)d.push(new Sk.builtin.str(a.lineList[c]));return new Sk.builtin.list(d)});Sk.builtin.file.prototype.seek=new Sk.builtin.func(function(a,b,c){void 0===c&&(c=1);a.pos$=1==c?b:a.data$+b});Sk.builtin.file.prototype.tell=new Sk.builtin.func(function(a){return a.pos$});
    Sk.builtin.file.prototype.truncate=new Sk.builtin.func(function(a,b){goog.asserts.fail()});Sk.builtin.file.prototype.write=new Sk.builtin.func(function(a,b){1===a.fileno?Sk.output(Sk.ffi.remapToJs(b)):goog.asserts.fail()});goog.exportSymbol("Sk.builtin.file",Sk.builtin.file);Sk.ffi=Sk.ffi||{};
    Sk.ffi.remapToPy=function(a){var b,c;if("[object Array]"===Object.prototype.toString.call(a)){c=[];for(b=0;b<a.length;++b)c.push(Sk.ffi.remapToPy(a[b]));return new Sk.builtin.list(c)}if("object"===typeof a){c=[];for(b in a)c.push(Sk.ffi.remapToPy(b)),c.push(Sk.ffi.remapToPy(a[b]));return new Sk.builtin.dict(c)}if("string"===typeof a)return new Sk.builtin.str(a);if("number"===typeof a)return Sk.builtin.assk$(a);if("boolean"===typeof a)return new Sk.builtin.bool(a);goog.asserts.fail("unhandled remap type "+typeof a)};
    goog.exportSymbol("Sk.ffi.remapToPy",Sk.ffi.remapToPy);
    Sk.ffi.remapToJs=function(a){var b,c,d,e;if(a instanceof Sk.builtin.dict){e={};d=a.tp$iter();for(c=d.tp$iternext();void 0!==c;c=d.tp$iternext())b=a.mp$subscript(c),void 0===b&&(b=null),c=Sk.ffi.remapToJs(c),e[c]=Sk.ffi.remapToJs(b);return e}if(a instanceof Sk.builtin.list||a instanceof Sk.builtin.tuple){e=[];for(b=0;b<a.v.length;++b)e.push(Sk.ffi.remapToJs(a.v[b]));return e}return a instanceof Sk.builtin.bool?a.v?!0:!1:a instanceof Sk.builtin.int_?Sk.builtin.asnum$(a):a instanceof Sk.builtin.float_?
        Sk.builtin.asnum$(a):a instanceof Sk.builtin.lng?Sk.builtin.asnum$(a):"number"===typeof a||"boolean"===typeof a?a:a.v};goog.exportSymbol("Sk.ffi.remapToJs",Sk.ffi.remapToJs);Sk.ffi.callback=function(a){return void 0===a?a:function(){return Sk.misceval.apply(a,void 0,void 0,void 0,Array.prototype.slice.call(arguments,0))}};goog.exportSymbol("Sk.ffi.callback",Sk.ffi.callback);Sk.ffi.stdwrap=function(a,b){var c=new a;c.v=b;return c};goog.exportSymbol("Sk.ffi.stdwrap",Sk.ffi.stdwrap);
    Sk.ffi.basicwrap=function(a){if(a instanceof Sk.builtin.int_)return Sk.builtin.asnum$(a);if(a instanceof Sk.builtin.float_)return Sk.builtin.asnum$(a);if(a instanceof Sk.builtin.lng)return Sk.builtin.asnum$(a);if("number"===typeof a||"boolean"===typeof a)return a;if("string"===typeof a)return new Sk.builtin.str(a);goog.asserts.fail("unexpected type for basicwrap")};goog.exportSymbol("Sk.ffi.basicwrap",Sk.ffi.basicwrap);Sk.ffi.unwrapo=function(a){return void 0===a?void 0:a.v};
    goog.exportSymbol("Sk.ffi.unwrapo",Sk.ffi.unwrapo);Sk.ffi.unwrapn=function(a){return null===a?null:a.v};goog.exportSymbol("Sk.ffi.unwrapn",Sk.ffi.unwrapn);Sk.builtin.enumerate=function(a,b){var c;if(!(this instanceof Sk.builtin.enumerate))return new Sk.builtin.enumerate(a,b);Sk.builtin.pyCheckArgs("enumerate",arguments,1,2);if(!Sk.builtin.checkIterable(a))throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(a)+"' object is not iterable");if(void 0!==b)if(Sk.misceval.isIndex(b))b=Sk.misceval.asIndex(b);else throw new Sk.builtin.TypeError("'"+Sk.abstr.typeName(b)+"' object cannot be interpreted as an index");else b=0;c=a.tp$iter();this.tp$iter=function(){return this};
        this.$index=b;this.tp$iternext=function(){var a,b=c.tp$iternext();if(void 0!==b)return a=new Sk.builtin.int_(this.$index++),new Sk.builtin.tuple([a,b])};this.__class__=Sk.builtin.enumerate;return this};Sk.abstr.setUpInheritance("enumerate",Sk.builtin.enumerate,Sk.builtin.object);Sk.builtin.enumerate.prototype.__iter__=new Sk.builtin.func(function(a){return a.tp$iter()});Sk.builtin.enumerate.prototype.next=new Sk.builtin.func(function(a){return a.tp$iternext()});Sk.builtin.enumerate.prototype.$r=function(){return new Sk.builtin.str("<enumerate object>")};Sk.Tokenizer=function(a,b,c){this.filename=a;this.callback=c;this.parenlev=this.lnum=0;this.continued=!1;this.namechars="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";this.numchars="0123456789";this.contstr="";this.needcont=!1;this.contline=void 0;this.indents=[0];this.endprog=/.*/;this.strstart=[-1,-1];this.interactive=b;this.doneFunc=function(){var a;for(a=1;a<this.indents.length;++a)if(this.callback(Sk.Tokenizer.Tokens.T_DEDENT,"",[this.lnum,0],[this.lnum,0],""))return"done";return this.callback(Sk.Tokenizer.Tokens.T_ENDMARKER,
        "",[this.lnum,0],[this.lnum,0],"")?"done":"failed"}};
    Sk.Tokenizer.Tokens={T_ENDMARKER:0,T_NAME:1,T_NUMBER:2,T_STRING:3,T_NEWLINE:4,T_INDENT:5,T_DEDENT:6,T_LPAR:7,T_RPAR:8,T_LSQB:9,T_RSQB:10,T_COLON:11,T_COMMA:12,T_SEMI:13,T_PLUS:14,T_MINUS:15,T_STAR:16,T_SLASH:17,T_VBAR:18,T_AMPER:19,T_LESS:20,T_GREATER:21,T_EQUAL:22,T_DOT:23,T_PERCENT:24,T_BACKQUOTE:25,T_LBRACE:26,T_RBRACE:27,T_EQEQUAL:28,T_NOTEQUAL:29,T_LESSEQUAL:30,T_GREATEREQUAL:31,T_TILDE:32,T_CIRCUMFLEX:33,T_LEFTSHIFT:34,T_RIGHTSHIFT:35,T_DOUBLESTAR:36,T_PLUSEQUAL:37,T_MINEQUAL:38,T_STAREQUAL:39,
        T_SLASHEQUAL:40,T_PERCENTEQUAL:41,T_AMPEREQUAL:42,T_VBAREQUAL:43,T_CIRCUMFLEXEQUAL:44,T_LEFTSHIFTEQUAL:45,T_RIGHTSHIFTEQUAL:46,T_DOUBLESTAREQUAL:47,T_DOUBLESLASH:48,T_DOUBLESLASHEQUAL:49,T_AT:50,T_OP:51,T_COMMENT:52,T_NL:53,T_RARROW:54,T_ERRORTOKEN:55,T_N_TOKENS:56,T_NT_OFFSET:256};function group(a){return"("+Array.prototype.slice.call(arguments).join("|")+")"}function any(a){return group.apply(null,arguments)+"*"}function maybe(a){return group.apply(null,arguments)+"?"}
    var Whitespace="[ \\f\\t]*",Comment_="#[^\\r\\n]*",Ident="[a-zA-Z_]\\w*",Binnumber="0[bB][01]*",Hexnumber="0[xX][\\da-fA-F]*[lL]?",Octnumber="0[oO]?[0-7]*[lL]?",Decnumber="[1-9]\\d*[lL]?",Intnumber=group(Binnumber,Hexnumber,Octnumber,Decnumber),Exponent="[eE][-+]?\\d+",Pointfloat=group("\\d+\\.\\d*","\\.\\d+")+maybe(Exponent),Expfloat="\\d+"+Exponent,Floatnumber=group(Pointfloat,Expfloat),Imagnumber=group("\\d+[jJ]",Floatnumber+"[jJ]"),Number_=group(Imagnumber,Floatnumber,Intnumber),Single="^[^'\\\\]*(?:\\\\.[^'\\\\]*)*'",
        Double_='^[^"\\\\]*(?:\\\\.[^"\\\\]*)*"',Single3="[^'\\\\]*(?:(?:\\\\.|'(?!''))[^'\\\\]*)*'''",Double3='[^"\\\\]*(?:(?:\\\\.|"(?!""))[^"\\\\]*)*"""',Triple=group("[ubUB]?[rR]?'''",'[ubUB]?[rR]?"""'),String_=group("[uU]?[rR]?'[^\\n'\\\\]*(?:\\\\.[^\\n'\\\\]*)*'",'[uU]?[rR]?"[^\\n"\\\\]*(?:\\\\.[^\\n"\\\\]*)*"'),Operator=group("\\*\\*=?",">>=?","<<=?","<>","!=","//=?","->","[+\\-*/%&|^=<>]=?","~"),Bracket="[\\][(){}]",Special=group("\\r?\\n","[:;.,`@]"),Funny=group(Operator,Bracket,Special),ContStr=
            group("[uUbB]?[rR]?'[^\\n'\\\\]*(?:\\\\.[^\\n'\\\\]*)*"+group("'","\\\\\\r?\\n"),'[uUbB]?[rR]?"[^\\n"\\\\]*(?:\\\\.[^\\n"\\\\]*)*'+group('"',"\\\\\\r?\\n")),PseudoExtras=group("\\\\\\r?\\n",Comment_,Triple),PseudoToken="^"+group(PseudoExtras,Number_,Funny,ContStr,Ident),triple_quoted={"'''":!0,'"""':!0,"r'''":!0,'r"""':!0,"R'''":!0,'R"""':!0,"u'''":!0,'u"""':!0,"U'''":!0,'U"""':!0,"b'''":!0,'b"""':!0,"B'''":!0,'B"""':!0,"ur'''":!0,'ur"""':!0,"Ur'''":!0,'Ur"""':!0,"uR'''":!0,'uR"""':!0,"UR'''":!0,
            'UR"""':!0,"br'''":!0,'br"""':!0,"Br'''":!0,'Br"""':!0,"bR'''":!0,'bR"""':!0,"BR'''":!0,'BR"""':!0},single_quoted={"'":!0,'"':!0,"r'":!0,'r"':!0,"R'":!0,'R"':!0,"u'":!0,'u"':!0,"U'":!0,'U"':!0,"b'":!0,'b"':!0,"B'":!0,'B"':!0,"ur'":!0,'ur"':!0,"Ur'":!0,'Ur"':!0,"uR'":!0,'uR"':!0,"UR'":!0,'UR"':!0,"br'":!0,'br"':!0,"Br'":!0,'Br"':!0,"bR'":!0,'bR"':!0,"BR'":!0,'BR"':!0};(function(){for(var a in triple_quoted);for(a in single_quoted);})();var tabsize=8;
    function contains(a,b){for(var c=a.length;c--;)if(a[c]===b)return!0;return!1}function rstrip(a,b){var c;for(c=a.length;0<c&&-1!==b.indexOf(a.charAt(c-1));--c);return a.substring(0,c)}
    Sk.Tokenizer.prototype.generateTokens=function(a){var b,c,d,e,f,g,h,k;b=RegExp(PseudoToken);k=RegExp(Single3,"g");h=RegExp(Double3,"g");var l={"'":RegExp(Single,"g"),'"':RegExp(Double_,"g"),"'''":k,'"""':h,"r'''":k,'r"""':h,"u'''":k,'u"""':h,"b'''":k,'b"""':h,"ur'''":k,'ur"""':h,"br'''":k,'br"""':h,"R'''":k,'R"""':h,"U'''":k,'U"""':h,"B'''":k,'B"""':h,"uR'''":k,'uR"""':h,"Ur'''":k,'Ur"""':h,"UR'''":k,'UR"""':h,"bR'''":k,'bR"""':h,"Br'''":k,'Br"""':h,"BR'''":k,'BR"""':h,r:null,R:null,u:null,U:null,
        b:null,B:null};a||(a="");this.lnum+=1;k=0;h=a.length;if(0<this.contstr.length){if(!a)throw new Sk.builtin.TokenError("EOF in multi-line string",this.filename,this.strstart[0],this.strstart[1],this.contline);this.endprog.lastIndex=0;if(f=this.endprog.test(a)){k=e=this.endprog.lastIndex;if(this.callback(Sk.Tokenizer.Tokens.T_STRING,this.contstr+a.substring(0,e),this.strstart,[this.lnum,e],this.contline+a))return"done";this.contstr="";this.needcont=!1;this.contline=void 0}else{if(this.needcont&&"\\\n"!==
        a.substring(a.length-2)&&"\\\r\n"!==a.substring(a.length-3)){if(this.callback(Sk.Tokenizer.Tokens.T_ERRORTOKEN,this.contstr+a,this.strstart,[this.lnum,a.length],this.contline))return"done";this.contstr="";this.contline=void 0}else this.contstr+=a,this.contline+=a;return!1}}else if(0!==this.parenlev||this.continued){if(!a)throw new Sk.builtin.TokenError("EOF in multi-line statement",this.filename,this.lnum,0,a);this.continued=!1}else{if(!a)return this.doneFunc();for(g=0;k<h;){if(" "===a.charAt(k))g+=
        1;else if("\t"===a.charAt(k))g=(g/tabsize+1)*tabsize;else if("\f"===a.charAt(k))g=0;else break;k+=1}if(k===h)return this.doneFunc();if(-1!=="#\r\n".indexOf(a.charAt(k))){if("#"===a.charAt(k))return h=rstrip(a.substring(k),"\r\n"),b=k+h.length,this.callback(Sk.Tokenizer.Tokens.T_COMMENT,h,[this.lnum,k],[this.lnum,k+h.length],a)||this.callback(Sk.Tokenizer.Tokens.T_NL,a.substring(b),[this.lnum,b],[this.lnum,a.length],a)?"done":!1;if(this.callback(Sk.Tokenizer.Tokens.T_NL,a.substring(k),[this.lnum,k],
        [this.lnum,a.length],a))return"done";if(!this.interactive)return!1}if(g>this.indents[this.indents.length-1]&&(this.indents.push(g),this.callback(Sk.Tokenizer.Tokens.T_INDENT,a.substring(0,k),[this.lnum,0],[this.lnum,k],a)))return"done";for(;g<this.indents[this.indents.length-1];){if(!contains(this.indents,g))throw new Sk.builtin.IndentationError("unindent does not match any outer indentation level",this.filename,this.lnum,k,a);this.indents.splice(this.indents.length-1,1);if(this.callback(Sk.Tokenizer.Tokens.T_DEDENT,
        "",[this.lnum,k],[this.lnum,k],a))return"done"}}for(;k<h;){for(g=a.charAt(k);" "===g||"\f"===g||"\t"===g;)k+=1,g=a.charAt(k);b.lastIndex=0;if(g=b.exec(a.substring(k)))if(c=k,e=c+g[1].length,g=[this.lnum,c],f=[this.lnum,e],k=e,e=a.substring(c,e),d=a.charAt(c),-1!==this.numchars.indexOf(d)||"."===d&&"."!==e){if(this.callback(Sk.Tokenizer.Tokens.T_NUMBER,e,g,f,a))return"done"}else if("\r"===d||"\n"===d){if(c=Sk.Tokenizer.Tokens.T_NEWLINE,0<this.parenlev&&(c=Sk.Tokenizer.Tokens.T_NL),this.callback(c,
        e,g,f,a))return"done"}else if("#"===d){if(this.callback(Sk.Tokenizer.Tokens.T_COMMENT,e,g,f,a))return"done"}else if(triple_quoted.hasOwnProperty(e))if(this.endprog=l[e],this.endprog.lastIndex=0,f=this.endprog.test(a.substring(k))){if(k=this.endprog.lastIndex+k,e=a.substring(c,k),this.callback(Sk.Tokenizer.Tokens.T_STRING,e,g,[this.lnum,k],a))return"done"}else{this.strstart=[this.lnum,c];this.contstr=a.substring(c);this.contline=a;break}else if(single_quoted.hasOwnProperty(d)||single_quoted.hasOwnProperty(e.substring(0,
        2))||single_quoted.hasOwnProperty(e.substring(0,3)))if("\n"===e[e.length-1]){this.strstart=[this.lnum,c];this.endprog=l[d]||l[e[1]]||l[e[2]];this.contstr=a.substring(c);this.needcont=!0;this.contline=a;break}else{if(this.callback(Sk.Tokenizer.Tokens.T_STRING,e,g,f,a))return"done"}else if(-1!==this.namechars.indexOf(d)){if(this.callback(Sk.Tokenizer.Tokens.T_NAME,e,g,f,a))return"done"}else if("\\"===d){if(this.callback(Sk.Tokenizer.Tokens.T_NL,e,g,[this.lnum,k],a))return"done";this.continued=!0}else{if(-1!==
    "([{".indexOf(d)?this.parenlev+=1:-1!==")]}".indexOf(d)&&(this.parenlev-=1),this.callback(Sk.Tokenizer.Tokens.T_OP,e,g,f,a))return"done"}else{if(this.callback(Sk.Tokenizer.Tokens.T_ERRORTOKEN,a.charAt(k),[this.lnum,k],[this.lnum,k+1],a))return"done";k+=1}}return!1};
    Sk.Tokenizer.tokenNames={0:"T_ENDMARKER",1:"T_NAME",2:"T_NUMBER",3:"T_STRING",4:"T_NEWLINE",5:"T_INDENT",6:"T_DEDENT",7:"T_LPAR",8:"T_RPAR",9:"T_LSQB",10:"T_RSQB",11:"T_COLON",12:"T_COMMA",13:"T_SEMI",14:"T_PLUS",15:"T_MINUS",16:"T_STAR",17:"T_SLASH",18:"T_VBAR",19:"T_AMPER",20:"T_LESS",21:"T_GREATER",22:"T_EQUAL",23:"T_DOT",24:"T_PERCENT",25:"T_BACKQUOTE",26:"T_LBRACE",27:"T_RBRACE",28:"T_EQEQUAL",29:"T_NOTEQUAL",30:"T_LESSEQUAL",31:"T_GREATEREQUAL",32:"T_TILDE",33:"T_CIRCUMFLEX",34:"T_LEFTSHIFT",
        35:"T_RIGHTSHIFT",36:"T_DOUBLESTAR",37:"T_PLUSEQUAL",38:"T_MINEQUAL",39:"T_STAREQUAL",40:"T_SLASHEQUAL",41:"T_PERCENTEQUAL",42:"T_AMPEREQUAL",43:"T_VBAREQUAL",44:"T_CIRCUMFLEXEQUAL",45:"T_LEFTSHIFTEQUAL",46:"T_RIGHTSHIFTEQUAL",47:"T_DOUBLESTAREQUAL",48:"T_DOUBLESLASH",49:"T_DOUBLESLASHEQUAL",50:"T_AT",51:"T_OP",52:"T_COMMENT",53:"T_NL",54:"T_RARROW",55:"T_ERRORTOKEN",56:"T_N_TOKENS",256:"T_NT_OFFSET"};goog.exportSymbol("Sk.Tokenizer",Sk.Tokenizer);
    goog.exportSymbol("Sk.Tokenizer.prototype.generateTokens",Sk.Tokenizer.prototype.generateTokens);goog.exportSymbol("Sk.Tokenizer.tokenNames",Sk.Tokenizer.tokenNames);Sk.OpMap={"(":Sk.Tokenizer.Tokens.T_LPAR,")":Sk.Tokenizer.Tokens.T_RPAR,"[":Sk.Tokenizer.Tokens.T_LSQB,"]":Sk.Tokenizer.Tokens.T_RSQB,":":Sk.Tokenizer.Tokens.T_COLON,",":Sk.Tokenizer.Tokens.T_COMMA,";":Sk.Tokenizer.Tokens.T_SEMI,"+":Sk.Tokenizer.Tokens.T_PLUS,"-":Sk.Tokenizer.Tokens.T_MINUS,"*":Sk.Tokenizer.Tokens.T_STAR,"/":Sk.Tokenizer.Tokens.T_SLASH,"|":Sk.Tokenizer.Tokens.T_VBAR,"&":Sk.Tokenizer.Tokens.T_AMPER,"<":Sk.Tokenizer.Tokens.T_LESS,">":Sk.Tokenizer.Tokens.T_GREATER,"=":Sk.Tokenizer.Tokens.T_EQUAL,
        ".":Sk.Tokenizer.Tokens.T_DOT,"%":Sk.Tokenizer.Tokens.T_PERCENT,"`":Sk.Tokenizer.Tokens.T_BACKQUOTE,"{":Sk.Tokenizer.Tokens.T_LBRACE,"}":Sk.Tokenizer.Tokens.T_RBRACE,"@":Sk.Tokenizer.Tokens.T_AT,"==":Sk.Tokenizer.Tokens.T_EQEQUAL,"!=":Sk.Tokenizer.Tokens.T_NOTEQUAL,"<>":Sk.Tokenizer.Tokens.T_NOTEQUAL,"<=":Sk.Tokenizer.Tokens.T_LESSEQUAL,">=":Sk.Tokenizer.Tokens.T_GREATEREQUAL,"~":Sk.Tokenizer.Tokens.T_TILDE,"^":Sk.Tokenizer.Tokens.T_CIRCUMFLEX,"<<":Sk.Tokenizer.Tokens.T_LEFTSHIFT,">>":Sk.Tokenizer.Tokens.T_RIGHTSHIFT,
        "**":Sk.Tokenizer.Tokens.T_DOUBLESTAR,"+=":Sk.Tokenizer.Tokens.T_PLUSEQUAL,"-=":Sk.Tokenizer.Tokens.T_MINEQUAL,"*=":Sk.Tokenizer.Tokens.T_STAREQUAL,"/=":Sk.Tokenizer.Tokens.T_SLASHEQUAL,"%=":Sk.Tokenizer.Tokens.T_PERCENTEQUAL,"&=":Sk.Tokenizer.Tokens.T_AMPEREQUAL,"|=":Sk.Tokenizer.Tokens.T_VBAREQUAL,"^=":Sk.Tokenizer.Tokens.T_CIRCUMFLEXEQUAL,"<<=":Sk.Tokenizer.Tokens.T_LEFTSHIFTEQUAL,">>=":Sk.Tokenizer.Tokens.T_RIGHTSHIFTEQUAL,"**=":Sk.Tokenizer.Tokens.T_DOUBLESTAREQUAL,"//":Sk.Tokenizer.Tokens.T_DOUBLESLASH,
        "//=":Sk.Tokenizer.Tokens.T_DOUBLESLASHEQUAL,"->":Sk.Tokenizer.Tokens.T_RARROW};
    Sk.ParseTables={sym:{and_expr:257,and_test:258,arglist:259,argument:260,arith_expr:261,assert_stmt:262,atom:263,augassign:264,break_stmt:265,classdef:266,comp_for:267,comp_if:268,comp_iter:269,comp_op:270,comparison:271,compound_stmt:272,continue_stmt:273,debugger_stmt:274,decorated:275,decorator:276,decorators:277,del_stmt:278,dictorsetmaker:279,dotted_as_name:280,dotted_as_names:281,dotted_name:282,encoding_decl:283,eval_input:284,except_clause:285,exec_stmt:286,expr:287,expr_stmt:288,exprlist:289,
            factor:290,file_input:291,flow_stmt:292,for_stmt:293,fpdef:294,fplist:295,funcdef:296,global_stmt:297,if_stmt:298,import_as_name:299,import_as_names:300,import_from:301,import_name:302,import_stmt:303,lambdef:304,list_for:305,list_if:306,list_iter:307,listmaker:308,not_test:309,old_lambdef:310,old_test:311,or_test:312,parameters:313,pass_stmt:314,power:315,print_stmt:316,raise_stmt:317,return_stmt:318,shift_expr:319,simple_stmt:320,single_input:256,sliceop:321,small_stmt:322,stmt:323,subscript:324,
            subscriptlist:325,suite:326,term:327,test:328,testlist:329,testlist1:330,testlist_comp:331,testlist_safe:332,trailer:333,try_stmt:334,varargslist:335,while_stmt:336,with_item:337,with_stmt:338,xor_expr:339,yield_expr:340,yield_stmt:341},number2symbol:{256:"single_input",257:"and_expr",258:"and_test",259:"arglist",260:"argument",261:"arith_expr",262:"assert_stmt",263:"atom",264:"augassign",265:"break_stmt",266:"classdef",267:"comp_for",268:"comp_if",269:"comp_iter",270:"comp_op",271:"comparison",272:"compound_stmt",
            273:"continue_stmt",274:"debugger_stmt",275:"decorated",276:"decorator",277:"decorators",278:"del_stmt",279:"dictorsetmaker",280:"dotted_as_name",281:"dotted_as_names",282:"dotted_name",283:"encoding_decl",284:"eval_input",285:"except_clause",286:"exec_stmt",287:"expr",288:"expr_stmt",289:"exprlist",290:"factor",291:"file_input",292:"flow_stmt",293:"for_stmt",294:"fpdef",295:"fplist",296:"funcdef",297:"global_stmt",298:"if_stmt",299:"import_as_name",300:"import_as_names",301:"import_from",302:"import_name",
            303:"import_stmt",304:"lambdef",305:"list_for",306:"list_if",307:"list_iter",308:"listmaker",309:"not_test",310:"old_lambdef",311:"old_test",312:"or_test",313:"parameters",314:"pass_stmt",315:"power",316:"print_stmt",317:"raise_stmt",318:"return_stmt",319:"shift_expr",320:"simple_stmt",321:"sliceop",322:"small_stmt",323:"stmt",324:"subscript",325:"subscriptlist",326:"suite",327:"term",328:"test",329:"testlist",330:"testlist1",331:"testlist_comp",332:"testlist_safe",333:"trailer",334:"try_stmt",335:"varargslist",
            336:"while_stmt",337:"with_item",338:"with_stmt",339:"xor_expr",340:"yield_expr",341:"yield_stmt"},dfas:{256:[[[[1,1],[2,1],[3,2]],[[0,1]],[[2,1]]],{2:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1,11:1,12:1,13:1,14:1,15:1,16:1,17:1,18:1,19:1,20:1,21:1,22:1,23:1,24:1,25:1,26:1,27:1,28:1,29:1,30:1,31:1,32:1,33:1,34:1,35:1,36:1,37:1}],257:[[[[38,1]],[[39,0],[0,1]]],{6:1,8:1,9:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],258:[[[[40,1]],[[41,0],[0,1]]],{6:1,7:1,8:1,9:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],259:[[[[42,1],[43,
                2],[44,3]],[[45,4]],[[46,5],[0,2]],[[45,6]],[[46,7],[0,4]],[[42,1],[43,2],[44,3],[0,5]],[[0,6]],[[43,4],[44,3]]],{6:1,7:1,8:1,9:1,11:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1,42:1,44:1}],260:[[[[45,1]],[[47,2],[48,3],[0,1]],[[45,3]],[[0,3]]],{6:1,7:1,8:1,9:1,11:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],261:[[[[49,1]],[[26,0],[37,0],[0,1]]],{6:1,8:1,9:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],262:[[[[21,1]],[[45,2]],[[46,3],[0,2]],[[45,4]],[[0,4]]],{21:1}],263:[[[[19,1],[8,2],[9,5],[30,4],[14,3],[15,6],[22,2]],
                [[19,1],[0,1]],[[0,2]],[[50,7],[51,2]],[[52,2],[53,8],[54,8]],[[55,2],[56,9]],[[57,10]],[[51,2]],[[52,2]],[[55,2]],[[15,2]]],{8:1,9:1,14:1,15:1,19:1,22:1,30:1}],264:[[[[58,1],[59,1],[60,1],[61,1],[62,1],[63,1],[64,1],[65,1],[66,1],[67,1],[68,1],[69,1]],[[0,1]]],{58:1,59:1,60:1,61:1,62:1,63:1,64:1,65:1,66:1,67:1,68:1,69:1}],265:[[[[33,1]],[[0,1]]],{33:1}],266:[[[[10,1]],[[22,2]],[[70,3],[30,4]],[[71,5]],[[52,6],[72,7]],[[0,5]],[[70,3]],[[52,6]]],{10:1}],267:[[[[29,1]],[[73,2]],[[74,3]],[[75,4]],[[76,
                5],[0,4]],[[0,5]]],{29:1}],268:[[[[32,1]],[[77,2]],[[76,3],[0,2]],[[0,3]]],{32:1}],269:[[[[78,1],[48,1]],[[0,1]]],{29:1,32:1}],270:[[[[79,1],[80,1],[7,2],[81,1],[79,1],[74,1],[82,1],[83,3],[84,1],[85,1]],[[0,1]],[[74,1]],[[7,1],[0,3]]],{7:1,74:1,79:1,80:1,81:1,82:1,83:1,84:1,85:1}],271:[[[[86,1]],[[87,0],[0,1]]],{6:1,8:1,9:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],272:[[[[88,1],[89,1],[90,1],[91,1],[92,1],[93,1],[94,1],[95,1]],[[0,1]]],{4:1,10:1,16:1,18:1,29:1,32:1,35:1,36:1}],273:[[[[34,1]],[[0,1]]],
                {34:1}],274:[[[[13,1]],[[0,1]]],{13:1}],275:[[[[96,1]],[[94,2],[91,2]],[[0,2]]],{35:1}],276:[[[[35,1]],[[97,2]],[[2,4],[30,3]],[[52,5],[98,6]],[[0,4]],[[2,4]],[[52,5]]],{35:1}],277:[[[[99,1]],[[99,1],[0,1]]],{35:1}],278:[[[[23,1]],[[73,2]],[[0,2]]],{23:1}],279:[[[[45,1]],[[70,2],[48,3],[46,4],[0,1]],[[45,5]],[[0,3]],[[45,6],[0,4]],[[48,3],[46,7],[0,5]],[[46,4],[0,6]],[[45,8],[0,7]],[[70,9]],[[45,10]],[[46,7],[0,10]]],{6:1,7:1,8:1,9:1,11:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],280:[[[[97,1]],[[100,
                2],[0,1]],[[22,3]],[[0,3]]],{22:1}],281:[[[[101,1]],[[46,0],[0,1]]],{22:1}],282:[[[[22,1]],[[102,0],[0,1]]],{22:1}],283:[[[[22,1]],[[0,1]]],{22:1}],284:[[[[72,1]],[[2,1],[103,2]],[[0,2]]],{6:1,7:1,8:1,9:1,11:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],285:[[[[104,1]],[[45,2],[0,1]],[[100,3],[46,3],[0,2]],[[45,4]],[[0,4]]],{104:1}],286:[[[[17,1]],[[86,2]],[[74,3],[0,2]],[[45,4]],[[46,5],[0,4]],[[45,6]],[[0,6]]],{17:1}],287:[[[[105,1]],[[106,0],[0,1]]],{6:1,8:1,9:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],288:[[[[72,
                1]],[[107,2],[47,3],[0,1]],[[72,4],[53,4]],[[72,5],[53,5]],[[0,4]],[[47,3],[0,5]]],{6:1,7:1,8:1,9:1,11:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],289:[[[[86,1]],[[46,2],[0,1]],[[86,1],[0,2]]],{6:1,8:1,9:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],290:[[[[37,2],[26,2],[6,2],[108,1]],[[0,1]],[[109,1]]],{6:1,8:1,9:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],291:[[[[2,0],[103,1],[110,0]],[[0,1]]],{2:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1,11:1,12:1,13:1,14:1,15:1,16:1,17:1,18:1,19:1,20:1,21:1,22:1,23:1,24:1,25:1,26:1,27:1,
                28:1,29:1,30:1,31:1,32:1,33:1,34:1,35:1,36:1,37:1,103:1}],292:[[[[111,1],[112,1],[113,1],[114,1],[115,1]],[[0,1]]],{5:1,20:1,27:1,33:1,34:1}],293:[[[[29,1]],[[73,2]],[[74,3]],[[72,4]],[[70,5]],[[71,6]],[[116,7],[0,6]],[[70,8]],[[71,9]],[[0,9]]],{29:1}],294:[[[[30,1],[22,2]],[[117,3]],[[0,2]],[[52,2]]],{22:1,30:1}],295:[[[[118,1]],[[46,2],[0,1]],[[118,1],[0,2]]],{22:1,30:1}],296:[[[[4,1]],[[22,2]],[[119,3]],[[70,4]],[[71,5]],[[0,5]]],{4:1}],297:[[[[28,1]],[[22,2]],[[46,1],[0,2]]],{28:1}],298:[[[[32,
                1]],[[45,2]],[[70,3]],[[71,4]],[[116,5],[120,1],[0,4]],[[70,6]],[[71,7]],[[0,7]]],{32:1}],299:[[[[22,1]],[[100,2],[0,1]],[[22,3]],[[0,3]]],{22:1}],300:[[[[121,1]],[[46,2],[0,1]],[[121,1],[0,2]]],{22:1}],301:[[[[31,1]],[[97,2],[102,3]],[[25,4]],[[97,2],[25,4],[102,3]],[[122,5],[42,5],[30,6]],[[0,5]],[[122,7]],[[52,5]]],{31:1}],302:[[[[25,1]],[[123,2]],[[0,2]]],{25:1}],303:[[[[124,1],[125,1]],[[0,1]]],{25:1,31:1}],304:[[[[11,1]],[[70,2],[126,3]],[[45,4]],[[70,2]],[[0,4]]],{11:1}],305:[[[[29,1]],[[73,
                2]],[[74,3]],[[127,4]],[[128,5],[0,4]],[[0,5]]],{29:1}],306:[[[[32,1]],[[77,2]],[[128,3],[0,2]],[[0,3]]],{32:1}],307:[[[[129,1],[130,1]],[[0,1]]],{29:1,32:1}],308:[[[[45,1]],[[129,2],[46,3],[0,1]],[[0,2]],[[45,4],[0,3]],[[46,3],[0,4]]],{6:1,7:1,8:1,9:1,11:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],309:[[[[7,1],[131,2]],[[40,2]],[[0,2]]],{6:1,7:1,8:1,9:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],310:[[[[11,1]],[[70,2],[126,3]],[[77,4]],[[70,2]],[[0,4]]],{11:1}],311:[[[[132,1],[75,1]],[[0,1]]],{6:1,7:1,8:1,
                9:1,11:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],312:[[[[133,1]],[[134,0],[0,1]]],{6:1,7:1,8:1,9:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],313:[[[[30,1]],[[52,2],[126,3]],[[0,2]],[[52,2]]],{30:1}],314:[[[[24,1]],[[0,1]]],{24:1}],315:[[[[135,1]],[[44,2],[136,1],[0,1]],[[109,3]],[[0,3]]],{8:1,9:1,14:1,15:1,19:1,22:1,30:1}],316:[[[[12,1]],[[45,2],[137,3],[0,1]],[[46,4],[0,2]],[[45,5]],[[45,2],[0,4]],[[46,6],[0,5]],[[45,7]],[[46,8],[0,7]],[[45,7],[0,8]]],{12:1}],317:[[[[5,1]],[[45,2],[0,1]],[[46,3],[0,2]],
                [[45,4]],[[46,5],[0,4]],[[45,6]],[[0,6]]],{5:1}],318:[[[[20,1]],[[72,2],[0,1]],[[0,2]]],{20:1}],319:[[[[138,1]],[[139,0],[137,0],[0,1]]],{6:1,8:1,9:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],320:[[[[140,1]],[[2,2],[141,3]],[[0,2]],[[140,1],[2,2]]],{5:1,6:1,7:1,8:1,9:1,11:1,12:1,13:1,14:1,15:1,17:1,19:1,20:1,21:1,22:1,23:1,24:1,25:1,26:1,27:1,28:1,30:1,31:1,33:1,34:1,37:1}],321:[[[[70,1]],[[45,2],[0,1]],[[0,2]]],{70:1}],322:[[[[142,1],[143,1],[144,1],[145,1],[146,1],[147,1],[148,1],[149,1],[150,1],[151,
                1]],[[0,1]]],{5:1,6:1,7:1,8:1,9:1,11:1,12:1,13:1,14:1,15:1,17:1,19:1,20:1,21:1,22:1,23:1,24:1,25:1,26:1,27:1,28:1,30:1,31:1,33:1,34:1,37:1}],323:[[[[1,1],[3,1]],[[0,1]]],{4:1,5:1,6:1,7:1,8:1,9:1,10:1,11:1,12:1,13:1,14:1,15:1,16:1,17:1,18:1,19:1,20:1,21:1,22:1,23:1,24:1,25:1,26:1,27:1,28:1,29:1,30:1,31:1,32:1,33:1,34:1,35:1,36:1,37:1}],324:[[[[45,1],[70,2],[102,3]],[[70,2],[0,1]],[[45,4],[152,5],[0,2]],[[102,6]],[[152,5],[0,4]],[[0,5]],[[102,5]]],{6:1,7:1,8:1,9:1,11:1,14:1,15:1,19:1,22:1,26:1,30:1,
                37:1,70:1,102:1}],325:[[[[153,1]],[[46,2],[0,1]],[[153,1],[0,2]]],{6:1,7:1,8:1,9:1,11:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1,70:1,102:1}],326:[[[[1,1],[2,2]],[[0,1]],[[154,3]],[[110,4]],[[155,1],[110,4]]],{2:1,5:1,6:1,7:1,8:1,9:1,11:1,12:1,13:1,14:1,15:1,17:1,19:1,20:1,21:1,22:1,23:1,24:1,25:1,26:1,27:1,28:1,30:1,31:1,33:1,34:1,37:1}],327:[[[[109,1]],[[156,0],[42,0],[157,0],[158,0],[0,1]]],{6:1,8:1,9:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],328:[[[[75,1],[159,2]],[[32,3],[0,1]],[[0,2]],[[75,4]],[[116,
                5]],[[45,2]]],{6:1,7:1,8:1,9:1,11:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],329:[[[[45,1]],[[46,2],[0,1]],[[45,1],[0,2]]],{6:1,7:1,8:1,9:1,11:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],330:[[[[45,1]],[[46,0],[0,1]]],{6:1,7:1,8:1,9:1,11:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],331:[[[[45,1]],[[48,2],[46,3],[0,1]],[[0,2]],[[45,4],[0,3]],[[46,3],[0,4]]],{6:1,7:1,8:1,9:1,11:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],332:[[[[77,1]],[[46,2],[0,1]],[[77,3]],[[46,4],[0,3]],[[77,3],[0,4]]],{6:1,7:1,8:1,9:1,11:1,14:1,15:1,
                19:1,22:1,26:1,30:1,37:1}],333:[[[[30,1],[102,2],[14,3]],[[52,4],[98,5]],[[22,4]],[[160,6]],[[0,4]],[[52,4]],[[51,4]]],{14:1,30:1,102:1}],334:[[[[16,1]],[[70,2]],[[71,3]],[[161,4],[162,5]],[[70,6]],[[70,7]],[[71,8]],[[71,9]],[[161,4],[116,10],[162,5],[0,8]],[[0,9]],[[70,11]],[[71,12]],[[162,5],[0,12]]],{16:1}],335:[[[[42,1],[118,2],[44,3]],[[22,4]],[[47,5],[46,6],[0,2]],[[22,7]],[[46,8],[0,4]],[[45,9]],[[42,1],[118,2],[44,3],[0,6]],[[0,7]],[[44,3]],[[46,6],[0,9]]],{22:1,30:1,42:1,44:1}],336:[[[[18,
                1]],[[45,2]],[[70,3]],[[71,4]],[[116,5],[0,4]],[[70,6]],[[71,7]],[[0,7]]],{18:1}],337:[[[[45,1]],[[100,2],[0,1]],[[86,3]],[[0,3]]],{6:1,7:1,8:1,9:1,11:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],338:[[[[36,1]],[[163,2]],[[70,3],[46,1]],[[71,4]],[[0,4]]],{36:1}],339:[[[[164,1]],[[165,0],[0,1]]],{6:1,8:1,9:1,14:1,15:1,19:1,22:1,26:1,30:1,37:1}],340:[[[[27,1]],[[72,2],[0,1]],[[0,2]]],{27:1}],341:[[[[53,1]],[[0,1]]],{27:1}]},states:[[[[1,1],[2,1],[3,2]],[[0,1]],[[2,1]]],[[[38,1]],[[39,0],[0,1]]],[[[40,1]],
            [[41,0],[0,1]]],[[[42,1],[43,2],[44,3]],[[45,4]],[[46,5],[0,2]],[[45,6]],[[46,7],[0,4]],[[42,1],[43,2],[44,3],[0,5]],[[0,6]],[[43,4],[44,3]]],[[[45,1]],[[47,2],[48,3],[0,1]],[[45,3]],[[0,3]]],[[[49,1]],[[26,0],[37,0],[0,1]]],[[[21,1]],[[45,2]],[[46,3],[0,2]],[[45,4]],[[0,4]]],[[[19,1],[8,2],[9,5],[30,4],[14,3],[15,6],[22,2]],[[19,1],[0,1]],[[0,2]],[[50,7],[51,2]],[[52,2],[53,8],[54,8]],[[55,2],[56,9]],[[57,10]],[[51,2]],[[52,2]],[[55,2]],[[15,2]]],[[[58,1],[59,1],[60,1],[61,1],[62,1],[63,1],[64,1],
            [65,1],[66,1],[67,1],[68,1],[69,1]],[[0,1]]],[[[33,1]],[[0,1]]],[[[10,1]],[[22,2]],[[70,3],[30,4]],[[71,5]],[[52,6],[72,7]],[[0,5]],[[70,3]],[[52,6]]],[[[29,1]],[[73,2]],[[74,3]],[[75,4]],[[76,5],[0,4]],[[0,5]]],[[[32,1]],[[77,2]],[[76,3],[0,2]],[[0,3]]],[[[78,1],[48,1]],[[0,1]]],[[[79,1],[80,1],[7,2],[81,1],[79,1],[74,1],[82,1],[83,3],[84,1],[85,1]],[[0,1]],[[74,1]],[[7,1],[0,3]]],[[[86,1]],[[87,0],[0,1]]],[[[88,1],[89,1],[90,1],[91,1],[92,1],[93,1],[94,1],[95,1]],[[0,1]]],[[[34,1]],[[0,1]]],[[[13,
            1]],[[0,1]]],[[[96,1]],[[94,2],[91,2]],[[0,2]]],[[[35,1]],[[97,2]],[[2,4],[30,3]],[[52,5],[98,6]],[[0,4]],[[2,4]],[[52,5]]],[[[99,1]],[[99,1],[0,1]]],[[[23,1]],[[73,2]],[[0,2]]],[[[45,1]],[[70,2],[48,3],[46,4],[0,1]],[[45,5]],[[0,3]],[[45,6],[0,4]],[[48,3],[46,7],[0,5]],[[46,4],[0,6]],[[45,8],[0,7]],[[70,9]],[[45,10]],[[46,7],[0,10]]],[[[97,1]],[[100,2],[0,1]],[[22,3]],[[0,3]]],[[[101,1]],[[46,0],[0,1]]],[[[22,1]],[[102,0],[0,1]]],[[[22,1]],[[0,1]]],[[[72,1]],[[2,1],[103,2]],[[0,2]]],[[[104,1]],[[45,
            2],[0,1]],[[100,3],[46,3],[0,2]],[[45,4]],[[0,4]]],[[[17,1]],[[86,2]],[[74,3],[0,2]],[[45,4]],[[46,5],[0,4]],[[45,6]],[[0,6]]],[[[105,1]],[[106,0],[0,1]]],[[[72,1]],[[107,2],[47,3],[0,1]],[[72,4],[53,4]],[[72,5],[53,5]],[[0,4]],[[47,3],[0,5]]],[[[86,1]],[[46,2],[0,1]],[[86,1],[0,2]]],[[[37,2],[26,2],[6,2],[108,1]],[[0,1]],[[109,1]]],[[[2,0],[103,1],[110,0]],[[0,1]]],[[[111,1],[112,1],[113,1],[114,1],[115,1]],[[0,1]]],[[[29,1]],[[73,2]],[[74,3]],[[72,4]],[[70,5]],[[71,6]],[[116,7],[0,6]],[[70,8]],
            [[71,9]],[[0,9]]],[[[30,1],[22,2]],[[117,3]],[[0,2]],[[52,2]]],[[[118,1]],[[46,2],[0,1]],[[118,1],[0,2]]],[[[4,1]],[[22,2]],[[119,3]],[[70,4]],[[71,5]],[[0,5]]],[[[28,1]],[[22,2]],[[46,1],[0,2]]],[[[32,1]],[[45,2]],[[70,3]],[[71,4]],[[116,5],[120,1],[0,4]],[[70,6]],[[71,7]],[[0,7]]],[[[22,1]],[[100,2],[0,1]],[[22,3]],[[0,3]]],[[[121,1]],[[46,2],[0,1]],[[121,1],[0,2]]],[[[31,1]],[[97,2],[102,3]],[[25,4]],[[97,2],[25,4],[102,3]],[[122,5],[42,5],[30,6]],[[0,5]],[[122,7]],[[52,5]]],[[[25,1]],[[123,2]],
            [[0,2]]],[[[124,1],[125,1]],[[0,1]]],[[[11,1]],[[70,2],[126,3]],[[45,4]],[[70,2]],[[0,4]]],[[[29,1]],[[73,2]],[[74,3]],[[127,4]],[[128,5],[0,4]],[[0,5]]],[[[32,1]],[[77,2]],[[128,3],[0,2]],[[0,3]]],[[[129,1],[130,1]],[[0,1]]],[[[45,1]],[[129,2],[46,3],[0,1]],[[0,2]],[[45,4],[0,3]],[[46,3],[0,4]]],[[[7,1],[131,2]],[[40,2]],[[0,2]]],[[[11,1]],[[70,2],[126,3]],[[77,4]],[[70,2]],[[0,4]]],[[[132,1],[75,1]],[[0,1]]],[[[133,1]],[[134,0],[0,1]]],[[[30,1]],[[52,2],[126,3]],[[0,2]],[[52,2]]],[[[24,1]],[[0,
            1]]],[[[135,1]],[[44,2],[136,1],[0,1]],[[109,3]],[[0,3]]],[[[12,1]],[[45,2],[137,3],[0,1]],[[46,4],[0,2]],[[45,5]],[[45,2],[0,4]],[[46,6],[0,5]],[[45,7]],[[46,8],[0,7]],[[45,7],[0,8]]],[[[5,1]],[[45,2],[0,1]],[[46,3],[0,2]],[[45,4]],[[46,5],[0,4]],[[45,6]],[[0,6]]],[[[20,1]],[[72,2],[0,1]],[[0,2]]],[[[138,1]],[[139,0],[137,0],[0,1]]],[[[140,1]],[[2,2],[141,3]],[[0,2]],[[140,1],[2,2]]],[[[70,1]],[[45,2],[0,1]],[[0,2]]],[[[142,1],[143,1],[144,1],[145,1],[146,1],[147,1],[148,1],[149,1],[150,1],[151,
            1]],[[0,1]]],[[[1,1],[3,1]],[[0,1]]],[[[45,1],[70,2],[102,3]],[[70,2],[0,1]],[[45,4],[152,5],[0,2]],[[102,6]],[[152,5],[0,4]],[[0,5]],[[102,5]]],[[[153,1]],[[46,2],[0,1]],[[153,1],[0,2]]],[[[1,1],[2,2]],[[0,1]],[[154,3]],[[110,4]],[[155,1],[110,4]]],[[[109,1]],[[156,0],[42,0],[157,0],[158,0],[0,1]]],[[[75,1],[159,2]],[[32,3],[0,1]],[[0,2]],[[75,4]],[[116,5]],[[45,2]]],[[[45,1]],[[46,2],[0,1]],[[45,1],[0,2]]],[[[45,1]],[[46,0],[0,1]]],[[[45,1]],[[48,2],[46,3],[0,1]],[[0,2]],[[45,4],[0,3]],[[46,3],
            [0,4]]],[[[77,1]],[[46,2],[0,1]],[[77,3]],[[46,4],[0,3]],[[77,3],[0,4]]],[[[30,1],[102,2],[14,3]],[[52,4],[98,5]],[[22,4]],[[160,6]],[[0,4]],[[52,4]],[[51,4]]],[[[16,1]],[[70,2]],[[71,3]],[[161,4],[162,5]],[[70,6]],[[70,7]],[[71,8]],[[71,9]],[[161,4],[116,10],[162,5],[0,8]],[[0,9]],[[70,11]],[[71,12]],[[162,5],[0,12]]],[[[42,1],[118,2],[44,3]],[[22,4]],[[47,5],[46,6],[0,2]],[[22,7]],[[46,8],[0,4]],[[45,9]],[[42,1],[118,2],[44,3],[0,6]],[[0,7]],[[44,3]],[[46,6],[0,9]]],[[[18,1]],[[45,2]],[[70,3]],
            [[71,4]],[[116,5],[0,4]],[[70,6]],[[71,7]],[[0,7]]],[[[45,1]],[[100,2],[0,1]],[[86,3]],[[0,3]]],[[[36,1]],[[163,2]],[[70,3],[46,1]],[[71,4]],[[0,4]]],[[[164,1]],[[165,0],[0,1]]],[[[27,1]],[[72,2],[0,1]],[[0,2]]],[[[53,1]],[[0,1]]]],labels:[[0,"EMPTY"],[320,null],[4,null],[272,null],[1,"def"],[1,"raise"],[32,null],[1,"not"],[2,null],[26,null],[1,"class"],[1,"lambda"],[1,"print"],[1,"debugger"],[9,null],[25,null],[1,"try"],[1,"exec"],[1,"while"],[3,null],[1,"return"],[1,"assert"],[1,null],[1,"del"],
            [1,"pass"],[1,"import"],[15,null],[1,"yield"],[1,"global"],[1,"for"],[7,null],[1,"from"],[1,"if"],[1,"break"],[1,"continue"],[50,null],[1,"with"],[14,null],[319,null],[19,null],[309,null],[1,"and"],[16,null],[260,null],[36,null],[328,null],[12,null],[22,null],[267,null],[327,null],[308,null],[10,null],[8,null],[340,null],[331,null],[27,null],[279,null],[330,null],[46,null],[39,null],[41,null],[47,null],[42,null],[43,null],[37,null],[44,null],[49,null],[45,null],[38,null],[40,null],[11,null],[326,
                null],[329,null],[289,null],[1,"in"],[312,null],[269,null],[311,null],[268,null],[29,null],[21,null],[28,null],[30,null],[1,"is"],[31,null],[20,null],[287,null],[270,null],[334,null],[298,null],[293,null],[266,null],[338,null],[336,null],[296,null],[275,null],[277,null],[282,null],[259,null],[276,null],[1,"as"],[280,null],[23,null],[0,null],[1,"except"],[339,null],[18,null],[264,null],[315,null],[290,null],[323,null],[265,null],[273,null],[317,null],[318,null],[341,null],[1,"else"],[295,null],[294,
                null],[313,null],[1,"elif"],[299,null],[300,null],[281,null],[302,null],[301,null],[335,null],[332,null],[307,null],[305,null],[306,null],[271,null],[310,null],[258,null],[1,"or"],[263,null],[333,null],[35,null],[261,null],[34,null],[322,null],[13,null],[292,null],[278,null],[288,null],[314,null],[316,null],[262,null],[286,null],[297,null],[303,null],[274,null],[321,null],[324,null],[5,null],[6,null],[48,null],[17,null],[24,null],[304,null],[325,null],[285,null],[1,"finally"],[337,null],[257,null],
            [33,null]],keywords:{and:41,as:100,assert:21,"break":33,"class":10,"continue":34,"debugger":13,def:4,del:23,elif:120,"else":116,except:104,exec:17,"finally":162,"for":29,from:31,global:28,"if":32,"import":25,"in":74,is:83,lambda:11,not:7,or:134,pass:24,print:12,raise:5,"return":20,"try":16,"while":18,"with":36,yield:27},tokens:{0:103,1:22,2:8,3:19,4:2,5:154,6:155,7:30,8:52,9:14,10:51,11:70,12:46,13:141,14:37,15:26,16:42,17:157,18:106,19:39,20:85,21:80,22:47,23:102,24:158,25:15,26:9,27:55,28:81,29:79,
            30:82,31:84,32:6,33:165,34:139,35:137,36:44,37:64,38:68,39:59,40:69,41:60,42:62,43:63,44:65,45:67,46:58,47:61,48:156,49:66,50:35},start:256};function Parser(a,b){this.filename=a;this.grammar=b;this.p_flags=0;return this}Parser.FUTURE_PRINT_FUNCTION="print_function";Parser.FUTURE_UNICODE_LITERALS="unicode_literals";Parser.FUTURE_DIVISION="division";Parser.FUTURE_ABSOLUTE_IMPORT="absolute_import";Parser.FUTURE_WITH_STATEMENT="with_statement";Parser.FUTURE_NESTED_SCOPES="nested_scopes";Parser.FUTURE_GENERATORS="generators";Parser.CO_FUTURE_PRINT_FUNCTION=65536;Parser.CO_FUTURE_UNICODE_LITERALS=131072;Parser.CO_FUTURE_DIVISON=8192;
    Parser.CO_FUTURE_ABSOLUTE_IMPORT=16384;Parser.CO_FUTURE_WITH_STATEMENT=32768;Parser.prototype.setup=function(a){a=a||this.grammar.start;this.stack=[{dfa:this.grammar.dfas[a],state:0,node:{type:a,value:null,context:null,children:[]}}];this.used_names={}};function findInDfa(a,b){for(var c=a.length;c--;)if(a[c][0]===b[0]&&a[c][1]===b[1])return!0;return!1}
    Parser.prototype.addtoken=function(a,b,c){var d,e,f,g,h,k,l,m=this.classify(a,b,c);a:for(;;){l=this.stack[this.stack.length-1];d=l.dfa[0];k=d[l.state];for(h=0;h<k.length;++h){e=k[h][0];g=k[h][1];f=this.grammar.labels[e][0];if(m===e){goog.asserts.assert(256>f);this.shift(a,b,g,c);for(c=g;1===d[c].length&&0===d[c][0][0]&&d[c][0][1]===c;){this.pop();if(0===this.stack.length)return!0;l=this.stack[this.stack.length-1];c=l.state;d=l.dfa[0]}return!1}if(256<=f&&(e=this.grammar.dfas[f],e=e[1],e.hasOwnProperty(m))){this.push(f,
        this.grammar.dfas[f],g,c);continue a}}if(findInDfa(k,[0,l.state])){if(this.pop(),0===this.stack.length)throw new Sk.builtin.ParseError("too much input",this.filename);}else throw d=c[0][0],new Sk.builtin.ParseError("bad input",this.filename,d,c);}};
    Parser.prototype.classify=function(a,b,c){var d;if(a===Sk.Tokenizer.Tokens.T_NAME&&(this.used_names[b]=!0,d=this.grammar.keywords.hasOwnProperty(b)&&this.grammar.keywords[b],"print"===b&&(this.p_flags&Parser.CO_FUTURE_PRINT_FUNCTION||!0===Sk.python3)&&(d=!1),d))return d;d=this.grammar.tokens.hasOwnProperty(a)&&this.grammar.tokens[a];if(!d)throw new Sk.builtin.ParseError("bad token",this.filename,c[0][0],c);return d};
    Parser.prototype.shift=function(a,b,c,d){var e=this.stack[this.stack.length-1].dfa,f=this.stack[this.stack.length-1].node;f.children.push({type:a,value:b,lineno:d[0][0],col_offset:d[0][1],children:null});this.stack[this.stack.length-1]={dfa:e,state:c,node:f}};
    Parser.prototype.push=function(a,b,c,d){a={type:a,value:null,lineno:d[0][0],col_offset:d[0][1],children:[]};this.stack[this.stack.length-1]={dfa:this.stack[this.stack.length-1].dfa,state:c,node:this.stack[this.stack.length-1].node};this.stack.push({dfa:b,state:0,node:a})};Parser.prototype.pop=function(){var a,b=this.stack.pop().node;b&&(0!==this.stack.length?(a=this.stack[this.stack.length-1].node,a.children.push(b)):(this.rootnode=b,this.rootnode.used_names=this.used_names))};
    function makeParser(a,b){var c,d,e,f,g;void 0===b&&(b="file_input");g=new Parser(a,Sk.ParseTables);"file_input"===b?g.setup(Sk.ParseTables.sym.file_input):goog.asserts.fail("todo;");f=Sk.Tokenizer.Tokens.T_COMMENT;e=Sk.Tokenizer.Tokens.T_NL;d=Sk.Tokenizer.Tokens.T_OP;c=new Sk.Tokenizer(a,"single_input"===b,function(a,b,c,h,n){if(a!==f&&a!==e&&(a===d&&(a=Sk.OpMap[b]),g.addtoken(a,b,[c,h,n])))return!0});var h=function(a){if(a=c.generateTokens(a)){if("done"!==a)throw new Sk.builtin.ParseError("incomplete input",
        this.filename);return g.rootnode}return!1};h.p_flags=g.p_flags;return h}Sk.parse=function(a,b){var c,d,e,f=makeParser(a);"\n"!==b.substr(b.length-1,1)&&(b+="\n");e=b.split("\n");for(c=0;c<e.length;++c)d=f(e[c]+(c===e.length-1?"":"\n"));return{cst:d,flags:f.p_flags}};
    Sk.parseTreeDump=function(a,b){var c,d;b=b||"";d=""+b;if(256<=a.type)for(d+=Sk.ParseTables.number2symbol[a.type]+"\n",c=0;c<a.children.length;++c)d+=Sk.parseTreeDump(a.children[c],b+"  ");else d+=Sk.Tokenizer.tokenNames[a.type]+": "+(new Sk.builtin.str(a.value)).$r().v+"\n";return d};goog.exportSymbol("Sk.parse",Sk.parse);goog.exportSymbol("Sk.parseTreeDump",Sk.parseTreeDump);function Load(){}function Store(){}function Del(){}function AugLoad(){}function AugStore(){}function Param(){}function And(){}function Or(){}function Add(){}function Sub(){}function Mult(){}function Div(){}function Mod(){}function Pow(){}function LShift(){}function RShift(){}function BitOr(){}function BitXor(){}function BitAnd(){}function FloorDiv(){}function Invert(){}function Not(){}function UAdd(){}function USub(){}function Eq(){}function NotEq(){}function Lt(){}function LtE(){}
    function Gt(){}function GtE(){}function Is(){}function IsNot(){}function In_(){}function NotIn(){}function Module(a){this.body=a;return this}function Interactive(a){this.body=a;return this}function Expression(a){goog.asserts.assert(null!==a&&void 0!==a);this.body=a;return this}function Suite(a){this.body=a;return this}
    function FunctionDef(a,b,c,d,e,f){goog.asserts.assert(null!==a&&void 0!==a);goog.asserts.assert(null!==b&&void 0!==b);this.name=a;this.args=b;this.body=c;this.decorator_list=d;this.lineno=e;this.col_offset=f;return this}function ClassDef(a,b,c,d,e,f){goog.asserts.assert(null!==a&&void 0!==a);this.name=a;this.bases=b;this.body=c;this.decorator_list=d;this.lineno=e;this.col_offset=f;return this}function Return_(a,b,c){this.value=a;this.lineno=b;this.col_offset=c;return this}
    function Delete_(a,b,c){this.targets=a;this.lineno=b;this.col_offset=c;return this}function Assign(a,b,c,d){goog.asserts.assert(null!==b&&void 0!==b);this.targets=a;this.value=b;this.lineno=c;this.col_offset=d;return this}function AugAssign(a,b,c,d,e){goog.asserts.assert(null!==a&&void 0!==a);goog.asserts.assert(null!==b&&void 0!==b);goog.asserts.assert(null!==c&&void 0!==c);this.target=a;this.op=b;this.value=c;this.lineno=d;this.col_offset=e;return this}
    function Print(a,b,c,d,e){this.dest=a;this.values=b;this.nl=c;this.lineno=d;this.col_offset=e;return this}function For_(a,b,c,d,e,f){goog.asserts.assert(null!==a&&void 0!==a);goog.asserts.assert(null!==b&&void 0!==b);this.target=a;this.iter=b;this.body=c;this.orelse=d;this.lineno=e;this.col_offset=f;return this}function While_(a,b,c,d,e){goog.asserts.assert(null!==a&&void 0!==a);this.test=a;this.body=b;this.orelse=c;this.lineno=d;this.col_offset=e;return this}
    function If_(a,b,c,d,e){goog.asserts.assert(null!==a&&void 0!==a);this.test=a;this.body=b;this.orelse=c;this.lineno=d;this.col_offset=e;return this}function With_(a,b,c,d,e){goog.asserts.assert(null!==a&&void 0!==a);this.context_expr=a;this.optional_vars=b;this.body=c;this.lineno=d;this.col_offset=e;return this}function Raise(a,b,c,d,e){this.type=a;this.inst=b;this.tback=c;this.lineno=d;this.col_offset=e;return this}
    function TryExcept(a,b,c,d,e){this.body=a;this.handlers=b;this.orelse=c;this.lineno=d;this.col_offset=e;return this}function TryFinally(a,b,c,d){this.body=a;this.finalbody=b;this.lineno=c;this.col_offset=d;return this}function Assert(a,b,c,d){goog.asserts.assert(null!==a&&void 0!==a);this.test=a;this.msg=b;this.lineno=c;this.col_offset=d;return this}function Import_(a,b,c){this.names=a;this.lineno=b;this.col_offset=c;return this}
    function ImportFrom(a,b,c,d,e){goog.asserts.assert(null!==a&&void 0!==a);this.module=a;this.names=b;this.level=c;this.lineno=d;this.col_offset=e;return this}function Exec(a,b,c,d,e){goog.asserts.assert(null!==a&&void 0!==a);this.body=a;this.globals=b;this.locals=c;this.lineno=d;this.col_offset=e;return this}function Global(a,b,c){this.names=a;this.lineno=b;this.col_offset=c;return this}
    function Expr(a,b,c){goog.asserts.assert(null!==a&&void 0!==a);this.value=a;this.lineno=b;this.col_offset=c;return this}function Pass(a,b){this.lineno=a;this.col_offset=b;return this}function Break_(a,b){this.lineno=a;this.col_offset=b;return this}function Continue_(a,b){this.lineno=a;this.col_offset=b;return this}function Debugger_(a,b){this.lineno=a;this.col_offset=b;return this}
    function BoolOp(a,b,c,d){goog.asserts.assert(null!==a&&void 0!==a);this.op=a;this.values=b;this.lineno=c;this.col_offset=d;return this}function BinOp(a,b,c,d,e){goog.asserts.assert(null!==a&&void 0!==a);goog.asserts.assert(null!==b&&void 0!==b);goog.asserts.assert(null!==c&&void 0!==c);this.left=a;this.op=b;this.right=c;this.lineno=d;this.col_offset=e;return this}
    function UnaryOp(a,b,c,d){goog.asserts.assert(null!==a&&void 0!==a);goog.asserts.assert(null!==b&&void 0!==b);this.op=a;this.operand=b;this.lineno=c;this.col_offset=d;return this}function Lambda(a,b,c,d){goog.asserts.assert(null!==a&&void 0!==a);goog.asserts.assert(null!==b&&void 0!==b);this.args=a;this.body=b;this.lineno=c;this.col_offset=d;return this}
    function IfExp(a,b,c,d,e){goog.asserts.assert(null!==a&&void 0!==a);goog.asserts.assert(null!==b&&void 0!==b);goog.asserts.assert(null!==c&&void 0!==c);this.test=a;this.body=b;this.orelse=c;this.lineno=d;this.col_offset=e;return this}function Dict(a,b,c,d){this.keys=a;this.values=b;this.lineno=c;this.col_offset=d;return this}function Set(a,b,c){this.elts=a;this.lineno=b;this.col_offset=c;return this}
    function ListComp(a,b,c,d){goog.asserts.assert(null!==a&&void 0!==a);this.elt=a;this.generators=b;this.lineno=c;this.col_offset=d;return this}function SetComp(a,b,c,d){goog.asserts.assert(null!==a&&void 0!==a);this.elt=a;this.generators=b;this.lineno=c;this.col_offset=d;return this}function DictComp(a,b,c,d,e){goog.asserts.assert(null!==a&&void 0!==a);goog.asserts.assert(null!==b&&void 0!==b);this.key=a;this.value=b;this.generators=c;this.lineno=d;this.col_offset=e;return this}
    function GeneratorExp(a,b,c,d){goog.asserts.assert(null!==a&&void 0!==a);this.elt=a;this.generators=b;this.lineno=c;this.col_offset=d;return this}function Yield(a,b,c){this.value=a;this.lineno=b;this.col_offset=c;return this}function Compare(a,b,c,d,e){goog.asserts.assert(null!==a&&void 0!==a);this.left=a;this.ops=b;this.comparators=c;this.lineno=d;this.col_offset=e;return this}
    function Call(a,b,c,d,e,f,g){goog.asserts.assert(null!==a&&void 0!==a);this.func=a;this.args=b;this.keywords=c;this.starargs=d;this.kwargs=e;this.lineno=f;this.col_offset=g;return this}function Repr(a,b,c){goog.asserts.assert(null!==a&&void 0!==a);this.value=a;this.lineno=b;this.col_offset=c;return this}function Num(a,b,c){goog.asserts.assert(null!==a&&void 0!==a);this.n=a;this.lineno=b;this.col_offset=c;return this}
    function Str(a,b,c){goog.asserts.assert(null!==a&&void 0!==a);this.s=a;this.lineno=b;this.col_offset=c;return this}function Attribute(a,b,c,d,e){goog.asserts.assert(null!==a&&void 0!==a);goog.asserts.assert(null!==b&&void 0!==b);goog.asserts.assert(null!==c&&void 0!==c);this.value=a;this.attr=b;this.ctx=c;this.lineno=d;this.col_offset=e;return this}
    function Subscript(a,b,c,d,e){goog.asserts.assert(null!==a&&void 0!==a);goog.asserts.assert(null!==b&&void 0!==b);goog.asserts.assert(null!==c&&void 0!==c);this.value=a;this.slice=b;this.ctx=c;this.lineno=d;this.col_offset=e;return this}function Name(a,b,c,d){goog.asserts.assert(null!==a&&void 0!==a);goog.asserts.assert(null!==b&&void 0!==b);this.id=a;this.ctx=b;this.lineno=c;this.col_offset=d;return this}
    function List(a,b,c,d){goog.asserts.assert(null!==b&&void 0!==b);this.elts=a;this.ctx=b;this.lineno=c;this.col_offset=d;return this}function Tuple(a,b,c,d){goog.asserts.assert(null!==b&&void 0!==b);this.elts=a;this.ctx=b;this.lineno=c;this.col_offset=d;return this}function Ellipsis(){return this}function Slice(a,b,c){this.lower=a;this.upper=b;this.step=c;return this}function ExtSlice(a){this.dims=a;return this}function Index(a){goog.asserts.assert(null!==a&&void 0!==a);this.value=a;return this}
    function comprehension(a,b,c){goog.asserts.assert(null!==a&&void 0!==a);goog.asserts.assert(null!==b&&void 0!==b);this.target=a;this.iter=b;this.ifs=c;return this}function ExceptHandler(a,b,c,d,e){this.type=a;this.name=b;this.body=c;this.lineno=d;this.col_offset=e;return this}function arguments_(a,b,c,d){this.args=a;this.vararg=b;this.kwarg=c;this.defaults=d;return this}
    function keyword(a,b){goog.asserts.assert(null!==a&&void 0!==a);goog.asserts.assert(null!==b&&void 0!==b);this.arg=a;this.value=b;return this}function alias(a,b){goog.asserts.assert(null!==a&&void 0!==a);this.name=a;this.asname=b;return this}Module.prototype._astname="Module";Module.prototype._fields=["body",function(a){return a.body}];Interactive.prototype._astname="Interactive";Interactive.prototype._fields=["body",function(a){return a.body}];Expression.prototype._astname="Expression";
    Expression.prototype._fields=["body",function(a){return a.body}];Suite.prototype._astname="Suite";Suite.prototype._fields=["body",function(a){return a.body}];FunctionDef.prototype._astname="FunctionDef";FunctionDef.prototype._fields=["name",function(a){return a.name},"args",function(a){return a.args},"body",function(a){return a.body},"decorator_list",function(a){return a.decorator_list}];ClassDef.prototype._astname="ClassDef";
    ClassDef.prototype._fields=["name",function(a){return a.name},"bases",function(a){return a.bases},"body",function(a){return a.body},"decorator_list",function(a){return a.decorator_list}];Return_.prototype._astname="Return";Return_.prototype._fields=["value",function(a){return a.value}];Delete_.prototype._astname="Delete";Delete_.prototype._fields=["targets",function(a){return a.targets}];Assign.prototype._astname="Assign";Assign.prototype._fields=["targets",function(a){return a.targets},"value",function(a){return a.value}];
    AugAssign.prototype._astname="AugAssign";AugAssign.prototype._fields=["target",function(a){return a.target},"op",function(a){return a.op},"value",function(a){return a.value}];Print.prototype._astname="Print";Print.prototype._fields=["dest",function(a){return a.dest},"values",function(a){return a.values},"nl",function(a){return a.nl}];For_.prototype._astname="For";
    For_.prototype._fields=["target",function(a){return a.target},"iter",function(a){return a.iter},"body",function(a){return a.body},"orelse",function(a){return a.orelse}];While_.prototype._astname="While";While_.prototype._fields=["test",function(a){return a.test},"body",function(a){return a.body},"orelse",function(a){return a.orelse}];If_.prototype._astname="If";If_.prototype._fields=["test",function(a){return a.test},"body",function(a){return a.body},"orelse",function(a){return a.orelse}];
    With_.prototype._astname="With";With_.prototype._fields=["context_expr",function(a){return a.context_expr},"optional_vars",function(a){return a.optional_vars},"body",function(a){return a.body}];Raise.prototype._astname="Raise";Raise.prototype._fields=["type",function(a){return a.type},"inst",function(a){return a.inst},"tback",function(a){return a.tback}];TryExcept.prototype._astname="TryExcept";
    TryExcept.prototype._fields=["body",function(a){return a.body},"handlers",function(a){return a.handlers},"orelse",function(a){return a.orelse}];TryFinally.prototype._astname="TryFinally";TryFinally.prototype._fields=["body",function(a){return a.body},"finalbody",function(a){return a.finalbody}];Assert.prototype._astname="Assert";Assert.prototype._fields=["test",function(a){return a.test},"msg",function(a){return a.msg}];Import_.prototype._astname="Import";Import_.prototype._fields=["names",function(a){return a.names}];
    ImportFrom.prototype._astname="ImportFrom";ImportFrom.prototype._fields=["module",function(a){return a.module},"names",function(a){return a.names},"level",function(a){return a.level}];Exec.prototype._astname="Exec";Exec.prototype._fields=["body",function(a){return a.body},"globals",function(a){return a.globals},"locals",function(a){return a.locals}];Global.prototype._astname="Global";Global.prototype._fields=["names",function(a){return a.names}];Expr.prototype._astname="Expr";
    Expr.prototype._fields=["value",function(a){return a.value}];Pass.prototype._astname="Pass";Pass.prototype._fields=[];Break_.prototype._astname="Break";Break_.prototype._fields=[];Continue_.prototype._astname="Continue";Continue_.prototype._fields=[];Debugger_.prototype._astname="Debugger";Debugger_.prototype._fields=[];BoolOp.prototype._astname="BoolOp";BoolOp.prototype._fields=["op",function(a){return a.op},"values",function(a){return a.values}];BinOp.prototype._astname="BinOp";
    BinOp.prototype._fields=["left",function(a){return a.left},"op",function(a){return a.op},"right",function(a){return a.right}];UnaryOp.prototype._astname="UnaryOp";UnaryOp.prototype._fields=["op",function(a){return a.op},"operand",function(a){return a.operand}];Lambda.prototype._astname="Lambda";Lambda.prototype._fields=["args",function(a){return a.args},"body",function(a){return a.body}];IfExp.prototype._astname="IfExp";
    IfExp.prototype._fields=["test",function(a){return a.test},"body",function(a){return a.body},"orelse",function(a){return a.orelse}];Dict.prototype._astname="Dict";Dict.prototype._fields=["keys",function(a){return a.keys},"values",function(a){return a.values}];Set.prototype._astname="Set";Set.prototype._fields=["elts",function(a){return a.elts}];ListComp.prototype._astname="ListComp";ListComp.prototype._fields=["elt",function(a){return a.elt},"generators",function(a){return a.generators}];
    SetComp.prototype._astname="SetComp";SetComp.prototype._fields=["elt",function(a){return a.elt},"generators",function(a){return a.generators}];DictComp.prototype._astname="DictComp";DictComp.prototype._fields=["key",function(a){return a.key},"value",function(a){return a.value},"generators",function(a){return a.generators}];GeneratorExp.prototype._astname="GeneratorExp";GeneratorExp.prototype._fields=["elt",function(a){return a.elt},"generators",function(a){return a.generators}];
    Yield.prototype._astname="Yield";Yield.prototype._fields=["value",function(a){return a.value}];Compare.prototype._astname="Compare";Compare.prototype._fields=["left",function(a){return a.left},"ops",function(a){return a.ops},"comparators",function(a){return a.comparators}];Call.prototype._astname="Call";Call.prototype._fields=["func",function(a){return a.func},"args",function(a){return a.args},"keywords",function(a){return a.keywords},"starargs",function(a){return a.starargs},"kwargs",function(a){return a.kwargs}];
    Repr.prototype._astname="Repr";Repr.prototype._fields=["value",function(a){return a.value}];Num.prototype._astname="Num";Num.prototype._fields=["n",function(a){return a.n}];Str.prototype._astname="Str";Str.prototype._fields=["s",function(a){return a.s}];Attribute.prototype._astname="Attribute";Attribute.prototype._fields=["value",function(a){return a.value},"attr",function(a){return a.attr},"ctx",function(a){return a.ctx}];Subscript.prototype._astname="Subscript";
    Subscript.prototype._fields=["value",function(a){return a.value},"slice",function(a){return a.slice},"ctx",function(a){return a.ctx}];Name.prototype._astname="Name";Name.prototype._fields=["id",function(a){return a.id},"ctx",function(a){return a.ctx}];List.prototype._astname="List";List.prototype._fields=["elts",function(a){return a.elts},"ctx",function(a){return a.ctx}];Tuple.prototype._astname="Tuple";Tuple.prototype._fields=["elts",function(a){return a.elts},"ctx",function(a){return a.ctx}];
    Load.prototype._astname="Load";Load.prototype._isenum=!0;Store.prototype._astname="Store";Store.prototype._isenum=!0;Del.prototype._astname="Del";Del.prototype._isenum=!0;AugLoad.prototype._astname="AugLoad";AugLoad.prototype._isenum=!0;AugStore.prototype._astname="AugStore";AugStore.prototype._isenum=!0;Param.prototype._astname="Param";Param.prototype._isenum=!0;Ellipsis.prototype._astname="Ellipsis";Ellipsis.prototype._fields=[];Slice.prototype._astname="Slice";
    Slice.prototype._fields=["lower",function(a){return a.lower},"upper",function(a){return a.upper},"step",function(a){return a.step}];ExtSlice.prototype._astname="ExtSlice";ExtSlice.prototype._fields=["dims",function(a){return a.dims}];Index.prototype._astname="Index";Index.prototype._fields=["value",function(a){return a.value}];And.prototype._astname="And";And.prototype._isenum=!0;Or.prototype._astname="Or";Or.prototype._isenum=!0;Add.prototype._astname="Add";Add.prototype._isenum=!0;
    Sub.prototype._astname="Sub";Sub.prototype._isenum=!0;Mult.prototype._astname="Mult";Mult.prototype._isenum=!0;Div.prototype._astname="Div";Div.prototype._isenum=!0;Mod.prototype._astname="Mod";Mod.prototype._isenum=!0;Pow.prototype._astname="Pow";Pow.prototype._isenum=!0;LShift.prototype._astname="LShift";LShift.prototype._isenum=!0;RShift.prototype._astname="RShift";RShift.prototype._isenum=!0;BitOr.prototype._astname="BitOr";BitOr.prototype._isenum=!0;BitXor.prototype._astname="BitXor";
    BitXor.prototype._isenum=!0;BitAnd.prototype._astname="BitAnd";BitAnd.prototype._isenum=!0;FloorDiv.prototype._astname="FloorDiv";FloorDiv.prototype._isenum=!0;Invert.prototype._astname="Invert";Invert.prototype._isenum=!0;Not.prototype._astname="Not";Not.prototype._isenum=!0;UAdd.prototype._astname="UAdd";UAdd.prototype._isenum=!0;USub.prototype._astname="USub";USub.prototype._isenum=!0;Eq.prototype._astname="Eq";Eq.prototype._isenum=!0;NotEq.prototype._astname="NotEq";NotEq.prototype._isenum=!0;
    Lt.prototype._astname="Lt";Lt.prototype._isenum=!0;LtE.prototype._astname="LtE";LtE.prototype._isenum=!0;Gt.prototype._astname="Gt";Gt.prototype._isenum=!0;GtE.prototype._astname="GtE";GtE.prototype._isenum=!0;Is.prototype._astname="Is";Is.prototype._isenum=!0;IsNot.prototype._astname="IsNot";IsNot.prototype._isenum=!0;In_.prototype._astname="In";In_.prototype._isenum=!0;NotIn.prototype._astname="NotIn";NotIn.prototype._isenum=!0;comprehension.prototype._astname="comprehension";
    comprehension.prototype._fields=["target",function(a){return a.target},"iter",function(a){return a.iter},"ifs",function(a){return a.ifs}];ExceptHandler.prototype._astname="ExceptHandler";ExceptHandler.prototype._fields=["type",function(a){return a.type},"name",function(a){return a.name},"body",function(a){return a.body}];arguments_.prototype._astname="arguments";
    arguments_.prototype._fields=["args",function(a){return a.args},"vararg",function(a){return a.vararg},"kwarg",function(a){return a.kwarg},"defaults",function(a){return a.defaults}];keyword.prototype._astname="keyword";keyword.prototype._fields=["arg",function(a){return a.arg},"value",function(a){return a.value}];alias.prototype._astname="alias";alias.prototype._fields=["name",function(a){return a.name},"asname",function(a){return a.asname}];var SYM=Sk.ParseTables.sym,TOK=Sk.Tokenizer.Tokens,COMP_GENEXP=0,COMP_SETCOMP=1;function Compiling(a,b,c){this.c_encoding=a;this.c_filename=b;this.c_flags=c||0}function NCH(a){goog.asserts.assert(void 0!==a);return null===a.children?0:a.children.length}function CHILD(a,b){goog.asserts.assert(void 0!==a);goog.asserts.assert(void 0!==b);return a.children[b]}function REQ(a,b){goog.asserts.assert(a.type===b,"node wasn't expected type")}
    function strobj(a){goog.asserts.assert("string"===typeof a,"expecting string, got "+typeof a);return new Sk.builtin.str(a)}
    function numStmts(a){var b,c,d;switch(a.type){case SYM.single_input:if(CHILD(a,0).type===TOK.T_NEWLINE)break;else return numStmts(CHILD(a,0));case SYM.file_input:for(c=d=0;c<NCH(a);++c)b=CHILD(a,c),b.type===SYM.stmt&&(d+=numStmts(b));return d;case SYM.stmt:return numStmts(CHILD(a,0));case SYM.compound_stmt:return 1;case SYM.simple_stmt:return Math.floor(NCH(a)/2);case SYM.suite:if(1===NCH(a))return numStmts(CHILD(a,0));d=0;for(c=2;c<NCH(a)-1;++c)d+=numStmts(CHILD(a,c));return d;default:goog.asserts.fail("Non-statement found")}return 0}
    function forbiddenCheck(a,b,c,d){if("None"===c)throw new Sk.builtin.SyntaxError("assignment to None",a.c_filename,d);if("True"===c||"False"===c)throw new Sk.builtin.SyntaxError("assignment to True or False is forbidden",a.c_filename,d);}
    function setContext(a,b,c,d){var e,f;goog.asserts.assert(c!==AugStore&&c!==AugLoad);e=f=null;switch(b.constructor){case Attribute:case Name:c===Store&&forbiddenCheck(a,d,b.attr,d.lineno);b.ctx=c;break;case Subscript:b.ctx=c;break;case List:b.ctx=c;f=b.elts;break;case Tuple:if(0===b.elts.length)throw new Sk.builtin.SyntaxError("can't assign to ()",a.c_filename,d.lineno);b.ctx=c;f=b.elts;break;case Lambda:e="lambda";break;case Call:e="function call";break;case BoolOp:case BinOp:case UnaryOp:e="operator";
        break;case GeneratorExp:e="generator expression";break;case Yield:e="yield expression";break;case ListComp:e="list comprehension";break;case SetComp:e="set comprehension";break;case DictComp:e="dict comprehension";break;case Dict:case Set:case Num:case Str:e="literal";break;case Compare:e="comparison";break;case Repr:e="repr";break;case IfExp:e="conditional expression";break;default:goog.asserts.fail("unhandled expression in assignment")}if(e)throw new Sk.builtin.SyntaxError("can't "+(c===Store?"assign to":
        "delete")+" "+e,a.c_filename,d.lineno);if(f)for(b=0;b<f.length;++b)setContext(a,f[b],c,d)}var operatorMap={};(function(){operatorMap[TOK.T_VBAR]=BitOr;operatorMap[TOK.T_CIRCUMFLEX]=BitXor;operatorMap[TOK.T_AMPER]=BitAnd;operatorMap[TOK.T_LEFTSHIFT]=LShift;operatorMap[TOK.T_RIGHTSHIFT]=RShift;operatorMap[TOK.T_PLUS]=Add;operatorMap[TOK.T_MINUS]=Sub;operatorMap[TOK.T_STAR]=Mult;operatorMap[TOK.T_SLASH]=Div;operatorMap[TOK.T_DOUBLESLASH]=FloorDiv;operatorMap[TOK.T_PERCENT]=Mod})();
    function getOperator(a){goog.asserts.assert(void 0!==operatorMap[a.type]);return operatorMap[a.type]}
    function astForCompOp(a,b){REQ(b,SYM.comp_op);if(1===NCH(b))switch(b=CHILD(b,0),b.type){case TOK.T_LESS:return Lt;case TOK.T_GREATER:return Gt;case TOK.T_EQEQUAL:return Eq;case TOK.T_LESSEQUAL:return LtE;case TOK.T_GREATEREQUAL:return GtE;case TOK.T_NOTEQUAL:return NotEq;case TOK.T_NAME:if("in"===b.value)return In_;if("is"===b.value)return Is}else if(2===NCH(b)&&CHILD(b,0).type===TOK.T_NAME){if("in"===CHILD(b,1).value)return NotIn;if("is"===CHILD(b,0).value)return IsNot}goog.asserts.fail("invalid comp_op")}
    function seqForTestlist(a,b){var c,d=[];goog.asserts.assert(b.type===SYM.testlist||b.type===SYM.listmaker||b.type===SYM.testlist_comp||b.type===SYM.testlist_safe||b.type===SYM.testlist1);for(c=0;c<NCH(b);c+=2)goog.asserts.assert(CHILD(b,c).type===SYM.test||CHILD(b,c).type===SYM.old_test),d[c/2]=astForExpr(a,CHILD(b,c));return d}
    function astForSuite(a,b){var c,d,e,f,g;REQ(b,SYM.suite);g=[];f=0;if(CHILD(b,0).type===SYM.simple_stmt)for(b=CHILD(b,0),e=NCH(b)-1,CHILD(b,e-1).type===TOK.T_SEMI&&(e-=1),d=0;d<e;d+=2)g[f++]=astForStmt(a,CHILD(b,d));else for(d=2;d<NCH(b)-1;++d)if(e=CHILD(b,d),REQ(e,SYM.stmt),c=numStmts(e),1===c)g[f++]=astForStmt(a,e);else for(e=CHILD(e,0),REQ(e,SYM.simple_stmt),c=0;c<NCH(e);c+=2){if(0===NCH(CHILD(e,c))){goog.asserts.assert(c+1===NCH(e));break}g[f++]=astForStmt(a,CHILD(e,c))}goog.asserts.assert(f===
        numStmts(b));return g}
    function astForExceptClause(a,b,c){var d;REQ(b,SYM.except_clause);REQ(c,SYM.suite);if(1===NCH(b))return new ExceptHandler(null,null,astForSuite(a,c),b.lineno,b.col_offset);if(2===NCH(b))return new ExceptHandler(astForExpr(a,CHILD(b,1)),null,astForSuite(a,c),b.lineno,b.col_offset);if(4===NCH(b))return d=astForExpr(a,CHILD(b,3)),setContext(a,d,Store,CHILD(b,3)),new ExceptHandler(astForExpr(a,CHILD(b,1)),d,astForSuite(a,c),b.lineno,b.col_offset);goog.asserts.fail("wrong number of children for except clause")}
    function astForTryStmt(a,b){var c,d,e;d=NCH(b);c=(d-3)/3;var f,g=[],h=null;REQ(b,SYM.try_stmt);f=astForSuite(a,CHILD(b,2));if(CHILD(b,d-3).type===TOK.T_NAME)"finally"===CHILD(b,d-3).value?(9<=d&&CHILD(b,d-6).type===TOK.T_NAME&&(g=astForSuite(a,CHILD(b,d-4)),c--),h=astForSuite(a,CHILD(b,d-1))):g=astForSuite(a,CHILD(b,d-1)),c--;else if(CHILD(b,d-3).type!==SYM.except_clause)throw new Sk.builtin.SyntaxError("malformed 'try' statement",a.c_filename,b.lineno);if(0<c){e=[];for(d=0;d<c;++d)e[d]=astForExceptClause(a,
        CHILD(b,3+3*d),CHILD(b,5+3*d));c=new TryExcept(f,e,g,b.lineno,b.col_offset);if(!h)return c;f=[c]}goog.asserts.assert(null!==h);return new TryFinally(f,h,b.lineno,b.col_offset)}function astForDottedName(a,b){var c,d,e,f,g;REQ(b,SYM.dotted_name);g=b.lineno;f=b.col_offset;e=strobj(CHILD(b,0).value);d=new Name(e,Load,g,f);for(c=2;c<NCH(b);c+=2)e=strobj(CHILD(b,c).value),d=new Attribute(d,e,Load,g,f);return d}
    function astForDecorator(a,b){var c;REQ(b,SYM.decorator);REQ(CHILD(b,0),TOK.T_AT);REQ(CHILD(b,NCH(b)-1),TOK.T_NEWLINE);c=astForDottedName(a,CHILD(b,1));return 3===NCH(b)?c:5===NCH(b)?new Call(c,[],[],null,null,b.lineno,b.col_offset):astForCall(a,CHILD(b,3),c)}function astForDecorators(a,b){var c,d;REQ(b,SYM.decorators);d=[];for(c=0;c<NCH(b);++c)d[c]=astForDecorator(a,CHILD(b,c));return d}
    function astForDecorated(a,b){var c,d;REQ(b,SYM.decorated);d=astForDecorators(a,CHILD(b,0));goog.asserts.assert(CHILD(b,1).type===SYM.funcdef||CHILD(b,1).type===SYM.classdef);c=null;CHILD(b,1).type===SYM.funcdef?c=astForFuncdef(a,CHILD(b,1),d):CHILD(b,1)===SYM.classdef&&(c=astForClassdef(a,CHILD(b,1),d));c&&(c.lineno=b.lineno,c.col_offset=b.col_offset);return c}function astForWithVar(a,b){REQ(b,SYM.with_item);return astForExpr(a,CHILD(b,1))}
    function astForWithStmt(a,b){var c,d,e=3;goog.asserts.assert(b.type===SYM.with_stmt);d=astForExpr(a,CHILD(b,1));CHILD(b,2).type===SYM.with_item&&(c=astForWithVar(a,CHILD(b,2)),setContext(a,c,Store,b),e=4);return new With_(d,c,astForSuite(a,CHILD(b,e)),b.lineno,b.col_offset)}
    function astForExecStmt(a,b){var c,d=null,e=null,f=NCH(b);goog.asserts.assert(2===f||4===f||6===f);REQ(b,SYM.exec_stmt);c=astForExpr(a,CHILD(b,1));4<=f&&(d=astForExpr(a,CHILD(b,3)));6===f&&(e=astForExpr(a,CHILD(b,5)));return new Exec(c,d,e,b.lineno,b.col_offset)}
    function astForIfStmt(a,b){var c,d,e,f;REQ(b,SYM.if_stmt);if(4===NCH(b))return new If_(astForExpr(a,CHILD(b,1)),astForSuite(a,CHILD(b,3)),[],b.lineno,b.col_offset);e=CHILD(b,4).value.charAt(2);if("s"===e)return new If_(astForExpr(a,CHILD(b,1)),astForSuite(a,CHILD(b,3)),astForSuite(a,CHILD(b,6)),b.lineno,b.col_offset);if("i"===e){f=NCH(b)-4;c=!1;e=[];CHILD(b,f+1).type===TOK.T_NAME&&"s"===CHILD(b,f+1).value.charAt(2)&&(c=!0,f-=3);f/=4;c&&(e=[new If_(astForExpr(a,CHILD(b,NCH(b)-6)),astForSuite(a,CHILD(b,
        NCH(b)-4)),astForSuite(a,CHILD(b,NCH(b)-1)),CHILD(b,NCH(b)-6).lineno,CHILD(b,NCH(b)-6).col_offset)],f--);for(d=0;d<f;++d)c=5+4*(f-d-1),e=[new If_(astForExpr(a,CHILD(b,c)),astForSuite(a,CHILD(b,c+2)),e,CHILD(b,c).lineno,CHILD(b,c).col_offset)];return new If_(astForExpr(a,CHILD(b,1)),astForSuite(a,CHILD(b,3)),e,b.lineno,b.col_offset)}goog.asserts.fail("unexpected token in 'if' statement")}
    function astForExprlist(a,b,c){var d,e,f;REQ(b,SYM.exprlist);f=[];for(e=0;e<NCH(b);e+=2)d=astForExpr(a,CHILD(b,e)),f[e/2]=d,c&&setContext(a,d,c,CHILD(b,e));return f}function astForDelStmt(a,b){REQ(b,SYM.del_stmt);return new Delete_(astForExprlist(a,CHILD(b,1),Del),b.lineno,b.col_offset)}function astForGlobalStmt(a,b){var c,d=[];REQ(b,SYM.global_stmt);for(c=1;c<NCH(b);c+=2)d[(c-1)/2]=strobj(CHILD(b,c).value);return new Global(d,b.lineno,b.col_offset)}
    function astForAssertStmt(a,b){REQ(b,SYM.assert_stmt);if(2===NCH(b))return new Assert(astForExpr(a,CHILD(b,1)),null,b.lineno,b.col_offset);if(4===NCH(b))return new Assert(astForExpr(a,CHILD(b,1)),astForExpr(a,CHILD(b,3)),b.lineno,b.col_offset);goog.asserts.fail("improper number of parts to assert stmt")}
    function aliasForImportName(a,b){var c,d;a:for(;;)switch(b.type){case SYM.import_as_name:return d=null,c=strobj(CHILD(b,0).value),3===NCH(b)&&(d=CHILD(b,2).value),new alias(c,null==d?null:strobj(d));case SYM.dotted_as_name:if(1===NCH(b)){b=CHILD(b,0);continue a}else return d=aliasForImportName(a,CHILD(b,0)),goog.asserts.assert(!d.asname),d.asname=strobj(CHILD(b,2).value),d;case SYM.dotted_name:if(1===NCH(b))return new alias(strobj(CHILD(b,0).value),null);d="";for(c=0;c<NCH(b);c+=2)d+=CHILD(b,c).value+
        ".";return new alias(strobj(d.substr(0,d.length-1)),null);case TOK.T_STAR:return new alias(strobj("*"),null);default:throw new Sk.builtin.SyntaxError("unexpected import name",a.c_filename,b.lineno);}}
    function astForImportStmt(a,b){var c,d,e,f,g,h;REQ(b,SYM.import_stmt);h=b.lineno;g=b.col_offset;b=CHILD(b,0);if(b.type===SYM.import_name){b=CHILD(b,1);REQ(b,SYM.dotted_as_names);d=[];for(f=0;f<NCH(b);f+=2)d[f/2]=aliasForImportName(a,CHILD(b,f));return new Import_(d,h,g)}if(b.type===SYM.import_from){c=null;e=0;for(d=1;d<NCH(b);++d){if(CHILD(b,d).type===SYM.dotted_name){c=aliasForImportName(a,CHILD(b,d));d++;break}else if(CHILD(b,d).type!==TOK.T_DOT)break;e++}++d;switch(CHILD(b,d).type){case TOK.T_STAR:b=
        CHILD(b,d);break;case TOK.T_LPAR:b=CHILD(b,d+1);NCH(b);break;case SYM.import_as_names:b=CHILD(b,d);d=NCH(b);if(0===d%2)throw new Sk.builtin.SyntaxError("trailing comma not allowed without surrounding parentheses",a.c_filename,b.lineno);break;default:throw new Sk.builtin.SyntaxError("Unexpected node-type in from-import",a.c_filename,b.lineno);}d=[];if(b.type===TOK.T_STAR)d[0]=aliasForImportName(a,b);else for(f=0;f<NCH(b);f+=2)d[f/2]=aliasForImportName(a,CHILD(b,f));c=c?c.name.v:"";return new ImportFrom(strobj(c),
        d,e,h,g)}throw new Sk.builtin.SyntaxError("unknown import statement",a.c_filename,b.lineno);}function astForTestlistComp(a,b){goog.asserts.assert(b.type===SYM.testlist_comp||b.type===SYM.argument);return 1<NCH(b)&&CHILD(b,1).type===SYM.comp_for?astForGenExpr(a,b):astForTestlist(a,b)}
    function astForListcomp(a,b){function c(a,b){for(var c=0;;){REQ(b,SYM.list_iter);if(CHILD(b,0).type===SYM.list_for)return c;b=CHILD(b,0);REQ(b,SYM.list_if);c++;if(2==NCH(b))return c;b=CHILD(b,2)}}var d,e,f,g,h,k,l,m,p;REQ(b,SYM.listmaker);goog.asserts.assert(1<NCH(b));p=astForExpr(a,CHILD(b,0));m=function(a,b){var c=0,d=CHILD(b,1);a:for(;;){c++;REQ(d,SYM.list_for);if(5===NCH(d))d=CHILD(d,4);else return c;b:for(;;){REQ(d,SYM.list_iter);d=CHILD(d,0);if(d.type===SYM.list_for)continue a;else if(d.type===
        SYM.list_if)if(3===NCH(d)){d=CHILD(d,2);continue b}else return c;break}break}}(a,b);l=[];k=CHILD(b,1);for(h=0;h<m;++h){REQ(k,SYM.list_for);f=CHILD(k,1);e=astForExprlist(a,f,Store);d=astForTestlist(a,CHILD(k,3));g=1===NCH(f)?new comprehension(e[0],d,[]):new comprehension(new Tuple(e,Store,k.lineno,k.col_offset),d,[]);if(5===NCH(k)){k=CHILD(k,4);f=c(a,k);e=[];for(d=0;d<f;++d)REQ(k,SYM.list_iter),k=CHILD(k,0),REQ(k,SYM.list_if),e[d]=astForExpr(a,CHILD(k,1)),3===NCH(k)&&(k=CHILD(k,2));k.type===SYM.list_iter&&
    (k=CHILD(k,0));g.ifs=e}l[h]=g}return new ListComp(p,l,b.lineno,b.col_offset)}
    function astForFactor(a,b){var c,d;if(CHILD(b,0).type===TOK.T_MINUS&&2===NCH(b)&&(c=CHILD(b,1),c.type===SYM.factor&&1===NCH(c)&&(c=CHILD(c,0),c.type===SYM.power&&1===NCH(c)&&(d=CHILD(c,0),d.type===SYM.atom&&(c=CHILD(d,0),c.type===TOK.T_NUMBER)))))return c.value="-"+c.value,astForAtom(a,d);c=astForExpr(a,CHILD(b,1));switch(CHILD(b,0).type){case TOK.T_PLUS:return new UnaryOp(UAdd,c,b.lineno,b.col_offset);case TOK.T_MINUS:return new UnaryOp(USub,c,b.lineno,b.col_offset);case TOK.T_TILDE:return new UnaryOp(Invert,
        c,b.lineno,b.col_offset)}goog.asserts.fail("unhandled factor")}function astForForStmt(a,b){var c,d,e=[];REQ(b,SYM.for_stmt);9===NCH(b)&&(e=astForSuite(a,CHILD(b,8)));d=CHILD(b,1);c=astForExprlist(a,d,Store);c=1===NCH(d)?c[0]:new Tuple(c,Store,b.lineno,b.col_offset);return new For_(c,astForTestlist(a,CHILD(b,3)),astForSuite(a,CHILD(b,5)),e,b.lineno,b.col_offset)}
    function astForCall(a,b,c){var d,e,f,g,h,k,l,m,p,n,r;REQ(b,SYM.arglist);for(p=g=n=r=0;p<NCH(b);p++)m=CHILD(b,p),m.type===SYM.argument&&(1===NCH(m)?r++:CHILD(m,1).type===SYM.comp_for?g++:n++);if(1<g||g&&(r||n))throw new Sk.builtin.SyntaxError("Generator expression must be parenthesized if not sole argument",a.c_filename,b.lineno);if(255<r+n+g)throw new Sk.builtin.SyntaxError("more than 255 arguments",a.c_filename,b.lineno);l=[];k=[];n=r=0;g=h=null;for(p=0;p<NCH(b);p++)if(m=CHILD(b,p),m.type===SYM.argument)if(1===
        NCH(m)){if(n)throw new Sk.builtin.SyntaxError("non-keyword arg after keyword arg",a.c_filename,b.lineno);if(h)throw new Sk.builtin.SyntaxError("only named arguments may follow *expression",a.c_filename,b.lineno);l[r++]=astForExpr(a,CHILD(m,0))}else if(CHILD(m,1).type===SYM.comp_for)l[r++]=astForGenExpr(a,m);else{d=astForExpr(a,CHILD(m,0));if(d.constructor===Lambda)throw new Sk.builtin.SyntaxError("lambda cannot contain assignment",a.c_filename,b.lineno);if(d.constructor!==Name)throw new Sk.builtin.SyntaxError("keyword can't be an expression",
        a.c_filename,b.lineno);f=d.id;forbiddenCheck(a,CHILD(m,0),f,b.lineno);for(e=0;e<n;++e)if(d=k[e].arg,d===f)throw new Sk.builtin.SyntaxError("keyword argument repeated",a.c_filename,b.lineno);k[n++]=new keyword(f,astForExpr(a,CHILD(m,2)))}else m.type===TOK.T_STAR?h=astForExpr(a,CHILD(b,++p)):m.type===TOK.T_DOUBLESTAR&&(g=astForExpr(a,CHILD(b,++p)));return new Call(c,l,k,h,g,c.lineno,c.col_offset)}
    function astForTrailer(a,b,c){var d,e,f,g;REQ(b,SYM.trailer);if(CHILD(b,0).type===TOK.T_LPAR)return 2===NCH(b)?new Call(c,[],[],null,null,b.lineno,b.col_offset):astForCall(a,CHILD(b,1),c);if(CHILD(b,0).type===TOK.T_DOT)return new Attribute(c,strobj(CHILD(b,1).value),Load,b.lineno,b.col_offset);REQ(CHILD(b,0),TOK.T_LSQB);REQ(CHILD(b,2),TOK.T_RSQB);b=CHILD(b,1);if(1===NCH(b))return new Subscript(c,astForSlice(a,CHILD(b,0)),Load,b.lineno,b.col_offset);g=!0;f=[];for(e=0;e<NCH(b);e+=2)d=astForSlice(a,
        CHILD(b,e)),d.constructor!==Index&&(g=!1),f[e/2]=d;if(!g)return new Subscript(c,new ExtSlice(f),Load,b.lineno,b.col_offset);a=[];for(e=0;e<f.length;++e)d=f[e],goog.asserts.assert(d.constructor===Index&&null!==d.value&&void 0!==d.value),a[e]=d.value;d=new Tuple(a,Load,b.lineno,b.col_offset);return new Subscript(c,new Index(d),Load,b.lineno,b.col_offset)}
    function astForFlowStmt(a,b){var c;REQ(b,SYM.flow_stmt);c=CHILD(b,0);switch(c.type){case SYM.break_stmt:return new Break_(b.lineno,b.col_offset);case SYM.continue_stmt:return new Continue_(b.lineno,b.col_offset);case SYM.yield_stmt:return new Expr(astForExpr(a,CHILD(c,0)),b.lineno,b.col_offset);case SYM.return_stmt:return 1===NCH(c)?new Return_(null,b.lineno,b.col_offset):new Return_(astForTestlist(a,CHILD(c,1)),b.lineno,b.col_offset);case SYM.raise_stmt:if(1===NCH(c))return new Raise(null,null,null,
        b.lineno,b.col_offset);if(2===NCH(c))return new Raise(astForExpr(a,CHILD(c,1)),null,null,b.lineno,b.col_offset);if(4===NCH(c))return new Raise(astForExpr(a,CHILD(c,1)),astForExpr(a,CHILD(c,3)),null,b.lineno,b.col_offset);if(6===NCH(c))return new Raise(astForExpr(a,CHILD(c,1)),astForExpr(a,CHILD(c,3)),astForExpr(a,CHILD(c,5)),b.lineno,b.col_offset);break;default:goog.asserts.fail("unexpected flow_stmt")}goog.asserts.fail("unhandled flow statement")}
    function astForArguments(a,b){var c,d,e,f,g,h,k,l,m,p=null,n=null;if(b.type===SYM.parameters){if(2===NCH(b))return new arguments_([],null,null,[]);b=CHILD(b,1)}REQ(b,SYM.varargslist);l=[];k=[];h=!1;for(e=f=g=0;g<NCH(b);)switch(m=CHILD(b,g),m.type){case SYM.fpdef:c=0;a:for(;;){if(g+1<NCH(b)&&CHILD(b,g+1).type===TOK.T_EQUAL)k[f++]=astForExpr(a,CHILD(b,g+2)),g+=2,h=!0;else if(h){if(c)throw new Sk.builtin.SyntaxError("parenthesized arg with default",a.c_filename,b.lineno);throw new Sk.builtin.SyntaxError("non-default argument follows default argument",
        a.c_filename,b.lineno);}if(3===NCH(m)){m=CHILD(m,1);if(1!==NCH(m))throw new Sk.builtin.SyntaxError("tuple parameter unpacking has been removed",a.c_filename,b.lineno);c=!0;m=CHILD(m,0);goog.asserts.assert(m.type===SYM.fpdef);continue a}CHILD(m,0).type===TOK.T_NAME&&(forbiddenCheck(a,b,CHILD(m,0).value,b.lineno),d=strobj(CHILD(m,0).value),l[e++]=new Name(d,Param,m.lineno,m.col_offset));g+=2;if(c)throw new Sk.builtin.SyntaxError("parenthesized argument names are invalid",a.c_filename,b.lineno);break}break;
        case TOK.T_STAR:forbiddenCheck(a,CHILD(b,g+1),CHILD(b,g+1).value,b.lineno);p=strobj(CHILD(b,g+1).value);g+=3;break;case TOK.T_DOUBLESTAR:forbiddenCheck(a,CHILD(b,g+1),CHILD(b,g+1).value,b.lineno);n=strobj(CHILD(b,g+1).value);g+=3;break;default:goog.asserts.fail("unexpected node in varargslist")}return new arguments_(l,p,n,k)}
    function astForFuncdef(a,b,c){var d,e;REQ(b,SYM.funcdef);e=strobj(CHILD(b,1).value);forbiddenCheck(a,CHILD(b,1),CHILD(b,1).value,b.lineno);d=astForArguments(a,CHILD(b,2));a=astForSuite(a,CHILD(b,4));return new FunctionDef(e,d,a,c,b.lineno,b.col_offset)}function astForClassBases(a,b){goog.asserts.assert(0<NCH(b));REQ(b,SYM.testlist);return 1===NCH(b)?[astForExpr(a,CHILD(b,0))]:seqForTestlist(a,b)}
    function astForClassdef(a,b,c){var d,e;REQ(b,SYM.classdef);forbiddenCheck(a,b,CHILD(b,1).value,b.lineno);e=strobj(CHILD(b,1).value);if(4===NCH(b))return new ClassDef(e,[],astForSuite(a,CHILD(b,3)),c,b.lineno,b.col_offset);if(CHILD(b,3).type===TOK.T_RPAR)return new ClassDef(e,[],astForSuite(a,CHILD(b,5)),c,b.lineno,b.col_offset);d=astForClassBases(a,CHILD(b,3));a=astForSuite(a,CHILD(b,6));return new ClassDef(e,d,a,c,b.lineno,b.col_offset)}
    function astForLambdef(a,b){var c,d;3===NCH(b)?(c=new arguments_([],null,null,[]),d=astForExpr(a,CHILD(b,2))):(c=astForArguments(a,CHILD(b,1)),d=astForExpr(a,CHILD(b,3)));return new Lambda(c,d,b.lineno,b.col_offset)}
    function astForComprehension(a,b){function c(a,b){for(var c=0;;){REQ(b,SYM.comp_iter);if(CHILD(b,0).type===SYM.comp_for)return c;b=CHILD(b,0);REQ(b,SYM.comp_if);c++;if(2==NCH(b))return c;b=CHILD(b,2)}}var d,e,f,g,h,k,l,m;k=function(a,b){var c=0;a:for(;;){c++;REQ(b,SYM.comp_for);if(5===NCH(b))b=CHILD(b,4);else return c;b:for(;;){REQ(b,SYM.comp_iter);b=CHILD(b,0);if(b.type===SYM.comp_for)continue a;else if(b.type===SYM.comp_if)if(3===NCH(b)){b=CHILD(b,2);continue b}else return c;break}break}goog.asserts.fail("logic error in countCompFors")}(a,
        b);l=[];for(h=0;h<k;++h){REQ(b,SYM.comp_for);e=CHILD(b,1);d=astForExprlist(a,e,Store);g=astForExpr(a,CHILD(b,3));m=1===NCH(e)?new comprehension(d[0],g,[]):new comprehension(new Tuple(d,Store,b.lineno,b.col_offset),g,[]);if(5===NCH(b)){b=CHILD(b,4);f=c(a,b);e=[];for(d=0;d<f;++d)REQ(b,SYM.comp_iter),b=CHILD(b,0),REQ(b,SYM.comp_if),g=astForExpr(a,CHILD(b,1)),e[d]=g,3===NCH(b)&&(b=CHILD(b,2));b.type===SYM.comp_iter&&(b=CHILD(b,0));m.ifs=e}l[h]=m}return l}
    function astForIterComp(a,b,c){var d;goog.asserts.assert(1<NCH(b));d=astForExpr(a,CHILD(b,0));a=astForComprehension(a,CHILD(b,1));if(c===COMP_GENEXP)return new GeneratorExp(d,a,b.lineno,b.col_offset);if(c===COMP_SETCOMP)return new SetComp(d,a,b.lineno,b.col_offset)}
    function astForDictComp(a,b){var c,d,e=[];goog.asserts.assert(3<NCH(b));REQ(CHILD(b,1),TOK.T_COLON);c=astForExpr(a,CHILD(b,0));d=astForExpr(a,CHILD(b,2));e=astForComprehension(a,CHILD(b,3));return new DictComp(c,d,e,b.lineno,b.col_offset)}function astForGenExpr(a,b){goog.asserts.assert(b.type===SYM.testlist_comp||b.type===SYM.argument);return astForIterComp(a,b,COMP_GENEXP)}function astForSetComp(a,b){goog.asserts.assert(b.type===SYM.dictorsetmaker);return astForIterComp(a,b,COMP_SETCOMP)}
    function astForWhileStmt(a,b){REQ(b,SYM.while_stmt);if(4===NCH(b))return new While_(astForExpr(a,CHILD(b,1)),astForSuite(a,CHILD(b,3)),[],b.lineno,b.col_offset);if(7===NCH(b))return new While_(astForExpr(a,CHILD(b,1)),astForSuite(a,CHILD(b,3)),astForSuite(a,CHILD(b,6)),b.lineno,b.col_offset);goog.asserts.fail("wrong number of tokens for 'while' stmt")}
    function astForAugassign(a,b){REQ(b,SYM.augassign);b=CHILD(b,0);switch(b.value.charAt(0)){case "+":return Add;case "-":return Sub;case "/":return"/"===b.value.charAt(1)?FloorDiv:Div;case "%":return Mod;case "<":return LShift;case ">":return RShift;case "&":return BitAnd;case "^":return BitXor;case "|":return BitOr;case "*":return"*"===b.value.charAt(1)?Pow:Mult;default:goog.asserts.fail("invalid augassign")}}
    function astForBinop(a,b){var c,d,e,f,g=new BinOp(astForExpr(a,CHILD(b,0)),getOperator(CHILD(b,1)),astForExpr(a,CHILD(b,2)),b.lineno,b.col_offset),h=(NCH(b)-1)/2;for(f=1;f<h;++f)e=CHILD(b,2*f+1),d=getOperator(e),c=astForExpr(a,CHILD(b,2*f+2)),g=new BinOp(g,d,c,e.lineno,e.col_offset);return g}
    function astForTestlist(a,b){goog.asserts.assert(0<NCH(b));b.type===SYM.testlist_comp?1<NCH(b)&&goog.asserts.assert(CHILD(b,1).type!==SYM.comp_for):goog.asserts.assert(b.type===SYM.testlist||b.type===SYM.testlist_safe||b.type===SYM.testlist1);return 1===NCH(b)?astForExpr(a,CHILD(b,0)):new Tuple(seqForTestlist(a,b),Load,b.lineno,b.col_offset)}
    function astForExprStmt(a,b){var c,d,e;REQ(b,SYM.expr_stmt);if(1===NCH(b))return new Expr(astForTestlist(a,CHILD(b,0)),b.lineno,b.col_offset);if(CHILD(b,1).type===SYM.augassign){c=CHILD(b,0);e=astForTestlist(a,c);switch(e.constructor){case GeneratorExp:throw new Sk.builtin.SyntaxError("augmented assignment to generator expression not possible",a.c_filename,b.lineno);case Yield:throw new Sk.builtin.SyntaxError("augmented assignment to yield expression not possible",a.c_filename,b.lineno);case Name:d=
        e.id;forbiddenCheck(a,c,d,b.lineno);break;case Attribute:case Subscript:break;default:throw new Sk.builtin.SyntaxError("illegal expression for augmented assignment",a.c_filename,b.lineno);}setContext(a,e,Store,c);c=CHILD(b,2);c=c.type===SYM.testlist?astForTestlist(a,c):astForExpr(a,c);return new AugAssign(e,astForAugassign(a,CHILD(b,1)),c,b.lineno,b.col_offset)}REQ(CHILD(b,1),TOK.T_EQUAL);e=[];for(d=0;d<NCH(b)-2;d+=2){c=CHILD(b,d);if(c.type===SYM.yield_expr)throw new Sk.builtin.SyntaxError("assignment to yield expression not possible",
        a.c_filename,b.lineno);c=astForTestlist(a,c);setContext(a,c,Store,CHILD(b,d));e[d/2]=c}c=CHILD(b,NCH(b)-1);c=c.type===SYM.testlist?astForTestlist(a,c):astForExpr(a,c);return new Assign(e,c,b.lineno,b.col_offset)}function astForIfexpr(a,b){goog.asserts.assert(5===NCH(b));return new IfExp(astForExpr(a,CHILD(b,2)),astForExpr(a,CHILD(b,0)),astForExpr(a,CHILD(b,4)),b.lineno,b.col_offset)}
    function parsestr(a,b){var c=b.charAt(0),d=!1,e=!1;if(a.c_flags&Parser.CO_FUTURE_UNICODE_LITERALS||!0===Sk.python3)e=!0;if("u"===c||"U"===c)b=b.substr(1),c=b.charAt(0),e=!0;else if("r"===c||"R"===c)b=b.substr(1),c=b.charAt(0),d=!0;goog.asserts.assert("b"!==c&&"B"!==c,"todo; haven't done b'' strings yet");goog.asserts.assert("'"===c||'"'===c&&b.charAt(b.length-1)===c);b=b.substr(1,b.length-2);e&&(b=unescape(encodeURIComponent(b)));4<=b.length&&(b.charAt(0)===c&&b.charAt(1)===c)&&(goog.asserts.assert(b.charAt(b.length-
        1)===c&&b.charAt(b.length-2)===c),b=b.substr(2,b.length-4));if(d||-1===b.indexOf("\\"))c=strobj(decodeURIComponent(escape(b)));else{for(var c=strobj,d=b,f,g,h,k,l=d.length,m="",e=0;e<l;++e)f=d.charAt(e),"\\"===f?(++e,f=d.charAt(e),"n"===f?m+="\n":"\\"===f?m+="\\":"t"===f?m+="\t":"r"===f?m+="\r":"b"===f?m+="\b":"f"===f?m+="\f":"v"===f?m+="\v":"0"===f?m+="\x00":'"'===f?m+='"':"'"===f?m+="'":"\n"!==f&&("x"===f?(k=d.charAt(++e),h=d.charAt(++e),m+=String.fromCharCode(parseInt(k+h,16))):"u"===f||"U"===
    f?(k=d.charAt(++e),h=d.charAt(++e),g=d.charAt(++e),f=d.charAt(++e),m+=String.fromCharCode(parseInt(k+h,16),parseInt(g+f,16))):m+="\\"+f)):m+=f;c=c(m)}return c}function parsestrplus(a,b){var c,d;REQ(CHILD(b,0),TOK.T_STRING);d=new Sk.builtin.str("");for(c=0;c<NCH(b);++c)try{d=d.sq$concat(parsestr(a,CHILD(b,c).value))}catch(e){throw new Sk.builtin.SyntaxError("invalid string (possibly contains a unicode character)",a.c_filename,CHILD(b,c).lineno);}return d}
    function parsenumber(a,b,c){a=b.charAt(b.length-1);if("j"===a||"J"===a)return Sk.builtin.complex.complex_subtype_from_string(b);if("l"===a||"L"===a)return Sk.longFromStr(b.substr(0,b.length-1),0);if(-1!==b.indexOf("."))return new Sk.builtin.float_(parseFloat(b));c=b;a=!1;"-"===b.charAt(0)&&(c=b.substr(1),a=!0);if("0"!==c.charAt(0)||"x"!==c.charAt(1)&&"X"!==c.charAt(1)){if(-1!==b.indexOf("e")||-1!==b.indexOf("E"))return new Sk.builtin.float_(parseFloat(b));if("0"!==c.charAt(0)||"b"!==c.charAt(1)&&
        "B"!==c.charAt(1))if("0"===c.charAt(0))if("0"===c)c=0;else{c=c.substring(1);if("o"===c.charAt(0)||"O"===c.charAt(0))c=c.substring(1);c=parseInt(c,8)}else c=parseInt(c,10);else c=c.substring(2),c=parseInt(c,2)}else c=c.substring(2),c=parseInt(c,16);return c>Sk.builtin.int_.threshold$&&Math.floor(c)===c&&-1===b.indexOf("e")&&-1===b.indexOf("E")?Sk.longFromStr(b,0):a?new Sk.builtin.int_(-c):new Sk.builtin.int_(c)}
    function astForSlice(a,b){var c,d,e,f;REQ(b,SYM.subscript);c=CHILD(b,0);d=e=f=null;if(c.type===TOK.T_DOT)return new Ellipsis;if(1===NCH(b)&&c.type===SYM.test)return new Index(astForExpr(a,c));c.type===SYM.test&&(f=astForExpr(a,c));c.type===TOK.T_COLON?1<NCH(b)&&(c=CHILD(b,1),c.type===SYM.test&&(e=astForExpr(a,c))):2<NCH(b)&&(c=CHILD(b,2),c.type===SYM.test&&(e=astForExpr(a,c)));c=CHILD(b,NCH(b)-1);c.type===SYM.sliceop&&(1===NCH(c)?(c=CHILD(c,0),d=new Name(strobj("None"),Load,c.lineno,c.col_offset)):
        (c=CHILD(c,1),c.type===SYM.test&&(d=astForExpr(a,c))));return new Slice(f,e,d)}
    function astForAtom(a,b){var c,d,e,f=CHILD(b,0);switch(f.type){case TOK.T_NAME:return new Name(strobj(f.value),Load,b.lineno,b.col_offset);case TOK.T_STRING:return new Str(parsestrplus(a,b),b.lineno,b.col_offset);case TOK.T_NUMBER:return new Num(parsenumber(a,f.value,b.lineno),b.lineno,b.col_offset);case TOK.T_LPAR:return f=CHILD(b,1),f.type===TOK.T_RPAR?new Tuple([],Load,b.lineno,b.col_offset):f.type===SYM.yield_expr?astForExpr(a,f):astForTestlistComp(a,f);case TOK.T_LSQB:f=CHILD(b,1);if(f.type===
        TOK.T_RSQB)return new List([],Load,b.lineno,b.col_offset);REQ(f,SYM.listmaker);return 1===NCH(f)||CHILD(f,1).type===TOK.T_COMMA?new List(seqForTestlist(a,f),Load,b.lineno,b.col_offset):astForListcomp(a,f);case TOK.T_LBRACE:e=[];d=[];f=CHILD(b,1);if(b.type===TOK.T_RBRACE)return new Dict([],null,b.lineno,b.col_offset);if(1===NCH(f)||0!==NCH(f)&&CHILD(f,1).type===TOK.T_COMMA){d=[];NCH(f);for(c=0;c<NCH(f);c+=2)e=astForExpr(a,CHILD(f,c)),d[c/2]=e;return new Set(d,b.lineno,b.col_offset)}if(0!==NCH(f)&&
        CHILD(f,1).type==SYM.comp_for)return astForSetComp(a,f);if(3<NCH(f)&&CHILD(f,3).type===SYM.comp_for)return astForDictComp(a,f);NCH(f);for(c=0;c<NCH(f);c+=4)e[c/4]=astForExpr(a,CHILD(f,c)),d[c/4]=astForExpr(a,CHILD(f,c+2));return new Dict(e,d,b.lineno,b.col_offset);case TOK.T_BACKQUOTE:return new Repr(astForTestlist(a,CHILD(b,1)),b.lineno,b.col_offset);default:goog.asserts.fail("unhandled atom",f.type)}}
    function astForPower(a,b){var c,d,e;REQ(b,SYM.power);e=astForAtom(a,CHILD(b,0));if(1===NCH(b))return e;for(c=1;c<NCH(b);++c){d=CHILD(b,c);if(d.type!==SYM.trailer)break;d=astForTrailer(a,d,e);d.lineno=e.lineno;d.col_offset=e.col_offset;e=d}CHILD(b,NCH(b)-1).type===SYM.factor&&(c=astForExpr(a,CHILD(b,NCH(b)-1)),e=new BinOp(e,Pow,c,b.lineno,b.col_offset));return e}
    function astForExpr(a,b){var c,d,e;a:for(;;){switch(b.type){case SYM.test:case SYM.old_test:if(CHILD(b,0).type===SYM.lambdef||CHILD(b,0).type===SYM.old_lambdef)return astForLambdef(a,CHILD(b,0));if(1<NCH(b))return astForIfexpr(a,b);case SYM.or_test:case SYM.and_test:if(1===NCH(b)){b=CHILD(b,0);continue a}d=[];for(c=0;c<NCH(b);c+=2)d[c/2]=astForExpr(a,CHILD(b,c));if("and"===CHILD(b,1).value)return new BoolOp(And,d,b.lineno,b.col_offset);goog.asserts.assert("or"===CHILD(b,1).value);return new BoolOp(Or,
        d,b.lineno,b.col_offset);case SYM.not_test:if(1===NCH(b)){b=CHILD(b,0);continue a}else return new UnaryOp(Not,astForExpr(a,CHILD(b,1)),b.lineno,b.col_offset);case SYM.comparison:if(1===NCH(b)){b=CHILD(b,0);continue a}else{e=[];d=[];for(c=1;c<NCH(b);c+=2)e[(c-1)/2]=astForCompOp(a,CHILD(b,c)),d[(c-1)/2]=astForExpr(a,CHILD(b,c+1));return new Compare(astForExpr(a,CHILD(b,0)),e,d,b.lineno,b.col_offset)}case SYM.expr:case SYM.xor_expr:case SYM.and_expr:case SYM.shift_expr:case SYM.arith_expr:case SYM.term:if(1===
        NCH(b)){b=CHILD(b,0);continue a}return astForBinop(a,b);case SYM.yield_expr:return c=null,2===NCH(b)&&(c=astForTestlist(a,CHILD(b,1))),new Yield(c,b.lineno,b.col_offset);case SYM.factor:if(1===NCH(b)){b=CHILD(b,0);continue a}return astForFactor(a,b);case SYM.power:return astForPower(a,b);default:goog.asserts.fail("unhandled expr","n.type: %d",b.type)}break}}
    function astForPrintStmt(a,b){var c,d,e;c=1;var f=null;REQ(b,SYM.print_stmt);2<=NCH(b)&&CHILD(b,1).type===TOK.T_RIGHTSHIFT&&(f=astForExpr(a,CHILD(b,2)),c=4);e=[];for(d=0;c<NCH(b);c+=2,++d)e[d]=astForExpr(a,CHILD(b,c));c=CHILD(b,NCH(b)-1).type===TOK.T_COMMA?!1:!0;return new Print(f,e,c,b.lineno,b.col_offset)}
    function astForStmt(a,b){var c;b.type===SYM.stmt&&(goog.asserts.assert(1===NCH(b)),b=CHILD(b,0));b.type===SYM.simple_stmt&&(goog.asserts.assert(1===numStmts(b)),b=CHILD(b,0));if(b.type===SYM.small_stmt)switch(REQ(b,SYM.small_stmt),b=CHILD(b,0),b.type){case SYM.expr_stmt:return astForExprStmt(a,b);case SYM.print_stmt:return astForPrintStmt(a,b);case SYM.del_stmt:return astForDelStmt(a,b);case SYM.pass_stmt:return new Pass(b.lineno,b.col_offset);case SYM.flow_stmt:return astForFlowStmt(a,b);case SYM.import_stmt:return astForImportStmt(a,
        b);case SYM.global_stmt:return astForGlobalStmt(a,b);case SYM.exec_stmt:return astForExecStmt(a,b);case SYM.assert_stmt:return astForAssertStmt(a,b);case SYM.debugger_stmt:return new Debugger_(b.lineno,b.col_offset);default:goog.asserts.fail("unhandled small_stmt")}else switch(c=CHILD(b,0),REQ(b,SYM.compound_stmt),c.type){case SYM.if_stmt:return astForIfStmt(a,c);case SYM.while_stmt:return astForWhileStmt(a,c);case SYM.for_stmt:return astForForStmt(a,c);case SYM.try_stmt:return astForTryStmt(a,c);
        case SYM.with_stmt:return astForWithStmt(a,c);case SYM.funcdef:return astForFuncdef(a,c,[]);case SYM.classdef:return astForClassdef(a,c,[]);case SYM.decorated:return astForDecorated(a,c);default:goog.asserts.assert("unhandled compound_stmt")}}
    Sk.astFromParse=function(a,b,c){var d,e,f=new Compiling("utf-8",b,c),g=[],h=0;switch(a.type){case SYM.file_input:for(e=0;e<NCH(a)-1;++e)if(d=CHILD(a,e),a.type!==TOK.T_NEWLINE)if(REQ(d,SYM.stmt),c=numStmts(d),1===c)g[h++]=astForStmt(f,d);else for(d=CHILD(d,0),REQ(d,SYM.simple_stmt),b=0;b<c;++b)g[h++]=astForStmt(f,CHILD(d,2*b));return new Module(g);case SYM.eval_input:goog.asserts.fail("todo;");case SYM.single_input:goog.asserts.fail("todo;");default:goog.asserts.fail("todo;")}};
    Sk.astDump=function(a){var b=function(a){var b,c="";for(b=0;b<a;++b)c+=" ";return c},c=function(a,e){var f,g,h,k,l,m;if(null===a)return e+"None";if(a.prototype&&void 0!==a.prototype._astname&&a.prototype._isenum)return e+a.prototype._astname+"()";if(void 0!==a._astname){h=b(a._astname.length+1);g=[];for(f=0;f<a._fields.length;f+=2)m=a._fields[f],l=a._fields[f+1](a),k=b(m.length+1),g.push([m,c(l,e+h+k)]);l=[];for(f=0;f<g.length;++f)k=g[f],l.push(k[0]+"="+k[1].replace(/^\s+/,""));f=l.join(",\n"+e+h);
        return e+a._astname+"("+f+")"}if(goog.isArrayLike(a)){h=[];for(f=0;f<a.length;++f)g=a[f],h.push(c(g,e+" "));f=h.join(",\n");return e+"["+f.replace(/^\s+/,"")+"]"}f=!0===a?"True":!1===a?"False":a instanceof Sk.builtin.lng?a.tp$str().v:a instanceof Sk.builtin.str?a.$r().v:""+a;return e+f};return c(a,"")};goog.exportSymbol("Sk.astFromParse",Sk.astFromParse);goog.exportSymbol("Sk.astDump",Sk.astDump);var DEF_GLOBAL=1,DEF_LOCAL=2,DEF_PARAM=4,USE=8,DEF_STAR=16,DEF_DOUBLESTAR=32,DEF_INTUPLE=64,DEF_FREE=128,DEF_FREE_GLOBAL=256,DEF_FREE_CLASS=512,DEF_IMPORT=1024,DEF_BOUND=DEF_LOCAL|DEF_PARAM|DEF_IMPORT,SCOPE_OFF=11,SCOPE_MASK=7,LOCAL=1,GLOBAL_EXPLICIT=2,GLOBAL_IMPLICIT=3,FREE=4,CELL=5,OPT_IMPORT_STAR=1,OPT_EXEC=2,OPT_BARE_EXEC=4,OPT_TOPLEVEL=8,GENERATOR=2,GENERATOR_EXPRESSION=2,ModuleBlock="module",FunctionBlock="function",ClassBlock="class";
    function Symbol(a,b,c){this.__name=a;this.__flags=b;this.__scope=b>>SCOPE_OFF&SCOPE_MASK;this.__namespaces=c||[]}Symbol.prototype.get_name=function(){return this.__name};Symbol.prototype.is_referenced=function(){return!!(this.__flags&USE)};Symbol.prototype.is_parameter=function(){return!!(this.__flags&DEF_PARAM)};Symbol.prototype.is_global=function(){return this.__scope===GLOBAL_IMPLICIT||this.__scope==GLOBAL_EXPLICIT};Symbol.prototype.is_declared_global=function(){return this.__scope==GLOBAL_EXPLICIT};
    Symbol.prototype.is_local=function(){return!!(this.__flags&DEF_BOUND)};Symbol.prototype.is_free=function(){return this.__scope==FREE};Symbol.prototype.is_imported=function(){return!!(this.__flags&DEF_IMPORT)};Symbol.prototype.is_assigned=function(){return!!(this.__flags&DEF_LOCAL)};Symbol.prototype.is_namespace=function(){return this.__namespaces&&0<this.__namespaces.length};Symbol.prototype.get_namespaces=function(){return this.__namespaces};var astScopeCounter=0;
    function SymbolTableScope(a,b,c,d,e){this.symFlags={};this.name=b;this.varnames=[];this.children=[];this.blockType=c;this.returnsValue=this.varkeywords=this.varargs=this.generator=this.childHasFree=this.hasFree=this.isNested=!1;this.lineno=e;this.table=a;a.cur&&(a.cur.nested||a.cur.blockType===FunctionBlock)&&(this.isNested=!0);d.scopeId=astScopeCounter++;a.stss[d.scopeId]=this;this.symbols={}}SymbolTableScope.prototype.get_type=function(){return this.blockType};
    SymbolTableScope.prototype.get_name=function(){return this.name};SymbolTableScope.prototype.get_lineno=function(){return this.lineno};SymbolTableScope.prototype.is_nested=function(){return this.isNested};SymbolTableScope.prototype.has_children=function(){return 0<this.children.length};SymbolTableScope.prototype.get_identifiers=function(){return this._identsMatching(function(){return!0})};
    SymbolTableScope.prototype.lookup=function(a){var b,c;this.symbols.hasOwnProperty(a)?a=this.symbols[a]:(c=this.symFlags[a],b=this.__check_children(a),a=this.symbols[a]=new Symbol(a,c,b));return a};SymbolTableScope.prototype.__check_children=function(a){var b,c,d=[];for(c=0;c<this.children.length;++c)b=this.children[c],b.name===a&&d.push(b);return d};
    SymbolTableScope.prototype._identsMatching=function(a){var b,c=[];for(b in this.symFlags)this.symFlags.hasOwnProperty(b)&&a(this.symFlags[b])&&c.push(b);c.sort();return c};SymbolTableScope.prototype.get_parameters=function(){goog.asserts.assert("function"==this.get_type(),"get_parameters only valid for function scopes");this._funcParams||(this._funcParams=this._identsMatching(function(a){return a&DEF_PARAM}));return this._funcParams};
    SymbolTableScope.prototype.get_locals=function(){goog.asserts.assert("function"==this.get_type(),"get_locals only valid for function scopes");this._funcLocals||(this._funcLocals=this._identsMatching(function(a){return a&DEF_BOUND}));return this._funcLocals};
    SymbolTableScope.prototype.get_globals=function(){goog.asserts.assert("function"==this.get_type(),"get_globals only valid for function scopes");this._funcGlobals||(this._funcGlobals=this._identsMatching(function(a){a=a>>SCOPE_OFF&SCOPE_MASK;return a==GLOBAL_IMPLICIT||a==GLOBAL_EXPLICIT}));return this._funcGlobals};
    SymbolTableScope.prototype.get_frees=function(){goog.asserts.assert("function"==this.get_type(),"get_frees only valid for function scopes");this._funcFrees||(this._funcFrees=this._identsMatching(function(a){return(a>>SCOPE_OFF&SCOPE_MASK)==FREE}));return this._funcFrees};
    SymbolTableScope.prototype.get_methods=function(){var a,b;goog.asserts.assert("class"==this.get_type(),"get_methods only valid for class scopes");if(!this._classMethods){b=[];for(a=0;a<this.children.length;++a)b.push(this.children[a].name);b.sort();this._classMethods=b}return this._classMethods};SymbolTableScope.prototype.getScope=function(a){a=this.symFlags[a];return void 0===a?0:a>>SCOPE_OFF&SCOPE_MASK};
    function SymbolTable(a){this.filename=a;this.top=this.cur=null;this.stack=[];this.curClass=this.global=null;this.tmpname=0;this.stss={}}SymbolTable.prototype.getStsForAst=function(a){goog.asserts.assert(void 0!==a.scopeId,"ast wasn't added to st?");a=this.stss[a.scopeId];goog.asserts.assert(void 0!==a,"unknown sym tab entry");return a};
    SymbolTable.prototype.SEQStmt=function(a){var b,c,d;goog.asserts.assert(goog.isArrayLike(a),"SEQ: nodes isn't array? got %s",a);d=a.length;for(c=0;c<d;++c)(b=a[c])&&this.visitStmt(b)};SymbolTable.prototype.SEQExpr=function(a){var b,c,d;goog.asserts.assert(goog.isArrayLike(a),"SEQ: nodes isn't array? got %s",a);d=a.length;for(c=0;c<d;++c)(b=a[c])&&this.visitExpr(b)};
    SymbolTable.prototype.enterBlock=function(a,b,c,d){var e;a=fixReservedNames(a);e=null;this.cur&&(e=this.cur,this.stack.push(this.cur));this.cur=new SymbolTableScope(this,a,b,c,d);"top"===a&&(this.global=this.cur.symFlags);e&&e.children.push(this.cur)};SymbolTable.prototype.exitBlock=function(){this.cur=null;0<this.stack.length&&(this.cur=this.stack.pop())};
    SymbolTable.prototype.visitParams=function(a,b){var c,d;for(d=0;d<a.length;++d)if(c=a[d],c.constructor===Name)goog.asserts.assert(c.ctx===Param||c.ctx===Store&&!b),this.addDef(c.id,DEF_PARAM,c.lineno);else throw new Sk.builtin.SyntaxError("invalid expression in parameter list",this.filename);};
    SymbolTable.prototype.visitArguments=function(a,b){a.args&&this.visitParams(a.args,!0);a.vararg&&(this.addDef(a.vararg,DEF_PARAM,b),this.cur.varargs=!0);a.kwarg&&(this.addDef(a.kwarg,DEF_PARAM,b),this.cur.varkeywords=!0)};SymbolTable.prototype.newTmpname=function(a){this.addDef(new Sk.builtin.str("_["+ ++this.tmpname+"]"),DEF_LOCAL,a)};
    SymbolTable.prototype.addDef=function(a,b,c){var d,e=mangleName(this.curClass,new Sk.builtin.str(a)).v,e=fixReservedNames(e);d=this.cur.symFlags[e];if(void 0!==d){if(b&DEF_PARAM&&d&DEF_PARAM)throw new Sk.builtin.SyntaxError("duplicate argument '"+a.v+"' in function definition",this.filename,c);d|=b}else d=b;this.cur.symFlags[e]=d;b&DEF_PARAM?this.cur.varnames.push(e):b&DEF_GLOBAL&&(d=b,a=this.global[e],void 0!==a&&(d|=a),this.global[e]=d)};
    SymbolTable.prototype.visitSlice=function(a){var b;switch(a.constructor){case Slice:a.lower&&this.visitExpr(a.lower);a.upper&&this.visitExpr(a.upper);a.step&&this.visitExpr(a.step);break;case ExtSlice:for(b=0;b<a.dims.length;++b)this.visitSlice(a.dims[b]);break;case Index:this.visitExpr(a.value)}};
    SymbolTable.prototype.visitStmt=function(a){var b,c,d,e;goog.asserts.assert(void 0!==a,"visitStmt called with undefined");switch(a.constructor){case FunctionDef:this.addDef(a.name,DEF_LOCAL,a.lineno);a.args.defaults&&this.SEQExpr(a.args.defaults);a.decorator_list&&this.SEQExpr(a.decorator_list);this.enterBlock(a.name.v,FunctionBlock,a,a.lineno);this.visitArguments(a.args,a.lineno);this.SEQStmt(a.body);this.exitBlock();break;case ClassDef:this.addDef(a.name,DEF_LOCAL,a.lineno);this.SEQExpr(a.bases);
        a.decorator_list&&this.SEQExpr(a.decorator_list);this.enterBlock(a.name.v,ClassBlock,a,a.lineno);this.curClass=a.name;this.SEQStmt(a.body);this.exitBlock();break;case Return_:if(a.value&&(this.visitExpr(a.value),this.cur.returnsValue=!0,this.cur.generator))throw new Sk.builtin.SyntaxError("'return' with argument inside generator",this.filename);break;case Delete_:this.SEQExpr(a.targets);break;case Assign:this.SEQExpr(a.targets);this.visitExpr(a.value);break;case AugAssign:this.visitExpr(a.target);
        this.visitExpr(a.value);break;case Print:a.dest&&this.visitExpr(a.dest);this.SEQExpr(a.values);break;case For_:this.visitExpr(a.target);this.visitExpr(a.iter);this.SEQStmt(a.body);a.orelse&&this.SEQStmt(a.orelse);break;case While_:this.visitExpr(a.test);this.SEQStmt(a.body);a.orelse&&this.SEQStmt(a.orelse);break;case If_:this.visitExpr(a.test);this.SEQStmt(a.body);a.orelse&&this.SEQStmt(a.orelse);break;case Raise:a.type&&(this.visitExpr(a.type),a.inst&&(this.visitExpr(a.inst),a.tback&&this.visitExpr(a.tback)));
        break;case TryExcept:this.SEQStmt(a.body);this.SEQStmt(a.orelse);this.visitExcepthandlers(a.handlers);break;case TryFinally:this.SEQStmt(a.body);this.SEQStmt(a.finalbody);break;case Assert:this.visitExpr(a.test);a.msg&&this.visitExpr(a.msg);break;case Import_:case ImportFrom:this.visitAlias(a.names,a.lineno);break;case Exec:this.visitExpr(a.body);a.globals&&(this.visitExpr(a.globals),a.locals&&this.visitExpr(a.locals));break;case Global:e=a.names.length;for(d=0;d<e;++d){c=mangleName(this.curClass,
        a.names[d]).v;c=fixReservedNames(c);b=this.cur.symFlags[c];if(b&(DEF_LOCAL|USE)){if(b&DEF_LOCAL)throw new Sk.builtin.SyntaxError("name '"+c+"' is assigned to before global declaration",this.filename,a.lineno);throw new Sk.builtin.SyntaxError("name '"+c+"' is used prior to global declaration",this.filename,a.lineno);}this.addDef(new Sk.builtin.str(c),DEF_GLOBAL,a.lineno)}break;case Expr:this.visitExpr(a.value);break;case Pass:case Break_:case Debugger_:case Continue_:break;case With_:this.newTmpname(a.lineno);
        this.visitExpr(a.context_expr);a.optional_vars&&(this.newTmpname(a.lineno),this.visitExpr(a.optional_vars));this.SEQStmt(a.body);break;default:goog.asserts.fail("Unhandled type "+a.constructor.name+" in visitStmt")}};
    SymbolTable.prototype.visitExpr=function(a){var b;goog.asserts.assert(void 0!==a,"visitExpr called with undefined");switch(a.constructor){case BoolOp:this.SEQExpr(a.values);break;case BinOp:this.visitExpr(a.left);this.visitExpr(a.right);break;case UnaryOp:this.visitExpr(a.operand);break;case Lambda:this.addDef(new Sk.builtin.str("lambda"),DEF_LOCAL,a.lineno);a.args.defaults&&this.SEQExpr(a.args.defaults);this.enterBlock("lambda",FunctionBlock,a,a.lineno);this.visitArguments(a.args,a.lineno);this.visitExpr(a.body);
        this.exitBlock();break;case IfExp:this.visitExpr(a.test);this.visitExpr(a.body);this.visitExpr(a.orelse);break;case Dict:this.SEQExpr(a.keys);this.SEQExpr(a.values);break;case DictComp:case SetComp:this.visitComprehension(a.generators,0);break;case ListComp:this.newTmpname(a.lineno);this.visitExpr(a.elt);this.visitComprehension(a.generators,0);break;case GeneratorExp:this.visitGenexp(a);break;case Yield:a.value&&this.visitExpr(a.value);this.cur.generator=!0;if(this.cur.returnsValue)throw new Sk.builtin.SyntaxError("'return' with argument inside generator",
        this.filename);break;case Compare:this.visitExpr(a.left);this.SEQExpr(a.comparators);break;case Call:this.visitExpr(a.func);this.SEQExpr(a.args);for(b=0;b<a.keywords.length;++b)this.visitExpr(a.keywords[b].value);a.starargs&&this.visitExpr(a.starargs);a.kwargs&&this.visitExpr(a.kwargs);break;case Num:case Str:break;case Attribute:this.visitExpr(a.value);break;case Subscript:this.visitExpr(a.value);this.visitSlice(a.slice);break;case Name:this.addDef(a.id,a.ctx===Load?USE:DEF_LOCAL,a.lineno);break;
        case List:case Tuple:case Set:this.SEQExpr(a.elts);break;default:goog.asserts.fail("Unhandled type "+a.constructor.name+" in visitExpr")}};SymbolTable.prototype.visitComprehension=function(a,b){var c,d,e=a.length;for(d=b;d<e;++d)c=a[d],this.visitExpr(c.target),this.visitExpr(c.iter),this.SEQExpr(c.ifs)};
    SymbolTable.prototype.visitAlias=function(a,b){var c,d,e,f;for(f=0;f<a.length;++f)if(c=a[f],d=e=null===c.asname?c.name.v:c.asname.v,c=e.indexOf("."),-1!==c&&(d=e.substr(0,c)),"*"!==e)this.addDef(new Sk.builtin.str(d),DEF_IMPORT,b);else if(this.cur.blockType!==ModuleBlock)throw new Sk.builtin.SyntaxError("import * only allowed at module level",this.filename);};
    SymbolTable.prototype.visitGenexp=function(a){var b=a.generators[0];this.visitExpr(b.iter);this.enterBlock("genexpr",FunctionBlock,a,a.lineno);this.cur.generator=!0;this.addDef(new Sk.builtin.str(".0"),DEF_PARAM,a.lineno);this.visitExpr(b.target);this.SEQExpr(b.ifs);this.visitComprehension(a.generators,1);this.visitExpr(a.elt);this.exitBlock()};SymbolTable.prototype.visitExcepthandlers=function(a){var b,c;for(b=0;c=a[b];++b)c.type&&this.visitExpr(c.type),c.name&&this.visitExpr(c.name),this.SEQStmt(c.body)};
    function _dictUpdate(a,b){for(var c in b)a[c]=b[c]}
    SymbolTable.prototype.analyzeBlock=function(a,b,c,d){var e,f,g;g={};var h={},k={},l={},m={};a.blockType==ClassBlock&&(_dictUpdate(k,d),b&&_dictUpdate(l,b));for(f in a.symFlags)e=a.symFlags[f],this.analyzeName(a,h,f,e,b,g,c,d);a.blockType!==ClassBlock&&(a.blockType===FunctionBlock&&_dictUpdate(l,g),b&&_dictUpdate(l,b),_dictUpdate(k,d));g={};f=a.children.length;for(e=0;e<f;++e)if(d=a.children[e],this.analyzeChildBlock(d,l,m,k,g),d.hasFree||d.childHasFree)a.childHasFree=!0;_dictUpdate(m,g);a.blockType===
    FunctionBlock&&this.analyzeCells(h,m);this.updateSymbols(a.symFlags,h,b,m,a.blockType===ClassBlock);_dictUpdate(c,m)};SymbolTable.prototype.analyzeChildBlock=function(a,b,c,d,e){var f={};_dictUpdate(f,b);b={};_dictUpdate(b,c);c={};_dictUpdate(c,d);this.analyzeBlock(a,f,b,c);_dictUpdate(e,b)};SymbolTable.prototype.analyzeCells=function(a,b){var c,d;for(d in a)c=a[d],c===LOCAL&&void 0!==b[d]&&(a[d]=CELL,delete b[d])};
    SymbolTable.prototype.updateSymbols=function(a,b,c,d,e){var f,g,h;for(h in a)g=a[h],f=b[h],g|=f<<SCOPE_OFF,a[h]=g;b=FREE<<SCOPE_OFF;for(h in d)d=a[h],void 0!==d?e&&d&(DEF_BOUND|DEF_GLOBAL)&&(d|=DEF_FREE_CLASS,a[h]=d):void 0!==c[h]&&(a[h]=b)};
    SymbolTable.prototype.analyzeName=function(a,b,c,d,e,f,g,h){if(d&DEF_GLOBAL){if(d&DEF_PARAM)throw new Sk.builtin.SyntaxError("name '"+c+"' is local and global",this.filename,a.lineno);b[c]=GLOBAL_EXPLICIT;h[c]=null;e&&void 0!==e[c]&&delete e[c]}else d&DEF_BOUND?(b[c]=LOCAL,f[c]=null,delete h[c]):e&&void 0!==e[c]?(b[c]=FREE,a.hasFree=!0,g[c]=null):(h&&void 0!==h[c]||!a.isNested||(a.hasFree=!0),b[c]=GLOBAL_IMPLICIT)};SymbolTable.prototype.analyze=function(){this.analyzeBlock(this.top,null,{},{})};
    Sk.symboltable=function(a,b){var c,d=new SymbolTable(b);d.enterBlock("top",ModuleBlock,a,0);d.top=d.cur;for(c=0;c<a.body.length;++c)d.visitStmt(a.body[c]);d.exitBlock();d.analyze();return d};
    Sk.dumpSymtab=function(a){var b=function(a){return a?"True":"False"},c=function(a){var b,c=[];for(b=0;b<a.length;++b)c.push((new Sk.builtin.str(a[b])).$r().v);return"["+c.join(", ")+"]"},d=function(a,f){var g,h,k,l,m,p,n,r,q;void 0===f&&(f="");q=""+(f+"Sym_type: "+a.get_type()+"\n");q+=f+"Sym_name: "+a.get_name()+"\n";q+=f+"Sym_lineno: "+a.get_lineno()+"\n";q+=f+"Sym_nested: "+b(a.is_nested())+"\n";q+=f+"Sym_haschildren: "+b(a.has_children())+"\n";"class"===a.get_type()?q+=f+"Class_methods: "+c(a.get_methods())+
        "\n":"function"===a.get_type()&&(q+=f+"Func_params: "+c(a.get_parameters())+"\n",q+=f+"Func_locals: "+c(a.get_locals())+"\n",q+=f+"Func_globals: "+c(a.get_globals())+"\n",q+=f+"Func_frees: "+c(a.get_frees())+"\n");q+=f+"-- Identifiers --\n";r=a.get_identifiers();n=r.length;for(p=0;p<n;++p){g=a.lookup(r[p]);q+=f+"name: "+g.get_name()+"\n";q+=f+"  is_referenced: "+b(g.is_referenced())+"\n";q+=f+"  is_imported: "+b(g.is_imported())+"\n";q+=f+"  is_parameter: "+b(g.is_parameter())+"\n";q+=f+"  is_global: "+
        b(g.is_global())+"\n";q+=f+"  is_declared_global: "+b(g.is_declared_global())+"\n";q+=f+"  is_local: "+b(g.is_local())+"\n";q+=f+"  is_free: "+b(g.is_free())+"\n";q+=f+"  is_assigned: "+b(g.is_assigned())+"\n";q+=f+"  is_namespace: "+b(g.is_namespace())+"\n";m=g.get_namespaces();l=m.length;q+=f+"  namespaces: [\n";k=[];for(h=0;h<l;++h)g=m[h],k.push(d(g,f+"    "));q+=k.join("\n");q+=f+"  ]\n"}return q};return d(a.top,"")};goog.exportSymbol("Sk.symboltable",Sk.symboltable);
    goog.exportSymbol("Sk.dumpSymtab",Sk.dumpSymtab);var out;Sk.gensymcount=0;function Compiler(a,b,c,d,e){this.filename=a;this.st=b;this.flags=c;this.canSuspend=d;this.interactive=!1;this.nestlevel=0;this.u=null;this.stack=[];this.result=[];this.allUnits=[];this.source=e?e.split("\n"):!1}
    function CompilerUnit(){this.name=this.ste=null;this.doesSuspend=this.canSuspend=!1;this.private_=null;this.lineno=this.firstlineno=0;this.linenoSet=!1;this.localnames=[];this.localtemps=[];this.tempsToSave=[];this.blocknum=0;this.blocks=[];this.curblock=0;this.scopename=null;this.suffixCode=this.switchCode=this.varDeclsCode=this.prefixCode="";this.breakBlocks=[];this.continueBlocks=[];this.exceptBlocks=[];this.finallyBlocks=[]}
    CompilerUnit.prototype.activateScope=function(){var a=this;out=function(){var b,c=a.blocks[a.curblock];if(null===c._next)for(b=0;b<arguments.length;++b)c.push(arguments[b])}};Compiler.prototype.getSourceLine=function(a){goog.asserts.assert(this.source);return this.source[a-1]};
    Compiler.prototype.annotateSource=function(a){var b,c;if(this.source){c=a.lineno;b=a.col_offset;out("\n//\n// line ",c,":\n// ",this.getSourceLine(c),"\n// ");for(a=0;a<b;++a)out(" ");out("^\n//\n");out("currLineNo = ",c,";\ncurrColNo = ",b,";\n\n")}};Compiler.prototype.gensym=function(a){a="$"+(a||"");return a+=Sk.gensymcount++};Compiler.prototype.niceName=function(a){return this.gensym(a.replace("<","").replace(">","").replace(" ","_"))};
    var reservedWords_={"abstract":!0,as:!0,"boolean":!0,"break":!0,"byte":!0,"case":!0,"catch":!0,"char":!0,"class":!0,"continue":!0,"const":!0,"debugger":!0,"default":!0,"delete":!0,"do":!0,"double":!0,"else":!0,"enum":!0,"export":!0,"extends":!0,"false":!0,"final":!0,"finally":!0,"float":!0,"for":!0,"function":!0,"goto":!0,"if":!0,"implements":!0,"import":!0,"in":!0,"instanceof":!0,"int":!0,"interface":!0,is:!0,"long":!0,namespace:!0,"native":!0,"new":!0,"null":!0,"package":!0,"private":!0,"protected":!0,
        "public":!0,"return":!0,"short":!0,"static":!0,"super":!1,"switch":!0,"synchronized":!0,"this":!0,"throw":!0,"throws":!0,"transient":!0,"true":!0,"try":!0,"typeof":!0,use:!0,"var":!0,"void":!0,"volatile":!0,"while":!0,"with":!0};function fixReservedWords(a){return!0!==reservedWords_[a]?a:a+"_$rw$"}
    var reservedNames_={__defineGetter__:!0,__defineSetter__:!0,apply:!0,call:!0,eval:!0,hasOwnProperty:!0,isPrototypeOf:!0,__lookupGetter__:!0,__lookupSetter__:!0,__noSuchMethod__:!0,propertyIsEnumerable:!0,toSource:!0,toLocaleString:!0,toString:!0,unwatch:!0,valueOf:!0,watch:!0,length:!0};function fixReservedNames(a){return reservedNames_[a]?a+"_$rn$":a}
    function mangleName(a,b){var c=b.v,d=null;if(null===a||(null===c||"_"!==c.charAt(0)||"_"!==c.charAt(1))||"_"===c.charAt(c.length-1)&&"_"===c.charAt(c.length-2))return b;d=a.v;d.replace(/_/g,"");if(""===d)return b;d=a.v;d.replace(/^_*/,"");return d=new Sk.builtin.str("_"+d+c)}Compiler.prototype._gr=function(a,b){var c,d=this.gensym(a);this.u.localtemps.push(d);out("var ",d,"=");for(c=1;c<arguments.length;++c)out(arguments[c]);out(";");return d};
    Compiler.prototype.outputInterruptTest=function(){var a="";if(null!==Sk.execLimit||null!==Sk.yieldLimit&&this.u.canSuspend)a+="var $dateNow = Date.now();",null!==Sk.execLimit&&(a+="if ($dateNow - Sk.execStart > Sk.execLimit) {throw new Sk.builtin.TimeLimitError(Sk.timeoutMsg())}"),null!==Sk.yieldLimit&&this.u.canSuspend&&(a=a+"if ($dateNow - Sk.lastYield > Sk.yieldLimit) {"+("var $susp = $saveSuspension({data: {type: 'Sk.yield'}, resume: function() {}}, '"+this.filename+"',currLineNo,currColNo);"),
        a+="$susp.$blk = $blk;",a+="$susp.optional = true;",a+="return $susp;",a+="}",this.u.doesSuspend=!0);return a};Compiler.prototype._jumpfalse=function(a,b){var c=this._gr("jfalse","(",a,"===false||!Sk.misceval.isTrue(",a,"))");out("if(",c,"){/*test failed */$blk=",b,";continue;}")};Compiler.prototype._jumpundef=function(a,b){out("if(",a,"===undefined){$blk=",b,";continue;}")};
    Compiler.prototype._jumptrue=function(a,b){var c=this._gr("jtrue","(",a,"===true||Sk.misceval.isTrue(",a,"))");out("if(",c,"){/*test passed */$blk=",b,";continue;}")};Compiler.prototype._jump=function(a){null===this.u.blocks[this.u.curblock]._next&&(out("$blk=",a,";"),this.u.blocks[this.u.curblock]._next=a)};
    Compiler.prototype._checkSuspension=function(a){var b;this.u.canSuspend?(b=this.newBlock("function return or resume suspension"),this._jump(b),this.setBlock(b),a=a||{lineno:"currLineNo",col_offset:"currColNo"},out("if ($ret && $ret.isSuspension) { return $saveSuspension($ret,'"+this.filename+"',"+a.lineno+","+a.col_offset+"); }"),this.u.doesSuspend=!0,this.u.tempsToSave=this.u.tempsToSave.concat(this.u.localtemps)):out("if ($ret && $ret.isSuspension) { $ret = Sk.misceval.retryOptionalSuspensionOrThrow($ret); }")};
    Compiler.prototype.ctuplelistorset=function(a,b,c){var d;goog.asserts.assert("tuple"===c||"list"===c||"set"===c);if(a.ctx===Store)for(d=this._gr("items","Sk.abstr.sequenceUnpack("+b+","+a.elts.length+")"),b=0;b<a.elts.length;++b)this.vexpr(a.elts[b],d+"["+b+"]");else if(a.ctx===Load||"set"===c){d=[];for(b=0;b<a.elts.length;++b)d.push(this._gr("elem",this.vexpr(a.elts[b])));return this._gr("load"+c,"new Sk.builtins['",c,"']([",d,"])")}};
    Compiler.prototype.cdict=function(a){var b,c,d;goog.asserts.assert(a.values.length===a.keys.length);d=[];for(c=0;c<a.values.length;++c)b=this.vexpr(a.values[c]),d.push(this.vexpr(a.keys[c])),d.push(b);return this._gr("loaddict","new Sk.builtins['dict']([",d,"])")};Compiler.prototype.clistcomp=function(a){goog.asserts.assert(a instanceof ListComp);var b=this._gr("_compr","new Sk.builtins['list']([])");return this.ccompgen("list",b,a.generators,0,a.elt,null,a)};
    Compiler.prototype.cdictcomp=function(a){goog.asserts.assert(a instanceof DictComp);var b=this._gr("_dcompr","new Sk.builtins.dict([])");return this.ccompgen("dict",b,a.generators,0,a.value,a.key,a)};Compiler.prototype.csetcomp=function(a){goog.asserts.assert(a instanceof SetComp);var b=this._gr("_setcompr","new Sk.builtins.set([])");return this.ccompgen("set",b,a.generators,0,a.elt,null,a)};
    Compiler.prototype.ccompgen=function(a,b,c,d,e,f,g){var h=this.newBlock(a+" comp start"),k=this.newBlock(a+" comp skip"),l=this.newBlock(a+" comp anchor"),m=c[d],p=this.vexpr(m.iter),p=this._gr("iter","Sk.abstr.iter(",p,")"),n,r;this._jump(h);this.setBlock(h);out("$ret = Sk.abstr.iternext(",p,", true);");this._checkSuspension(g);p=this._gr("next","$ret");this._jumpundef(p,l);this.vexpr(m.target,p);r=m.ifs.length;for(n=0;n<r;++n)p=this.vexpr(m.ifs[n]),this._jumpfalse(p,h);++d<c.length&&this.ccompgen(a,
        b,c,d,e,f,g);d>=c.length&&(c=this.vexpr(e),"dict"===a?(a=this.vexpr(f),out(b,".mp$ass_subscript(",a,",",c,");")):"list"===a?out(b,".v.push(",c,");"):"set"===a&&out(b,".v.mp$ass_subscript(",c,", true);"),this._jump(k),this.setBlock(k));this._jump(h);this.setBlock(l);return b};
    Compiler.prototype.cyield=function(a){if(this.u.ste.blockType!==FunctionBlock)throw new SyntaxError("'yield' outside function");var b="null";a.value&&(b=this.vexpr(a.value));a=this.newBlock("after yield");out("return [/*resume*/",a,",/*ret*/",b,"];");this.setBlock(a);return"$gen.gi$sentvalue"};
    Compiler.prototype.ccompare=function(a){var b,c,d,e,f,g;goog.asserts.assert(a.ops.length===a.comparators.length);g=this.vexpr(a.left);f=a.ops.length;e=this.newBlock("done");d=this._gr("compareres","null");for(c=0;c<f;++c)b=this.vexpr(a.comparators[c]),out("$ret = Sk.builtin.bool(Sk.misceval.richCompareBool(",g,",",b,",'",a.ops[c].prototype._astname,"', true));"),this._checkSuspension(a),out(d,"=$ret;"),this._jumpfalse("$ret",e),g=b;this._jump(e);this.setBlock(e);return d};
    Compiler.prototype.ccall=function(a){var b,c,d,e=this.vexpr(a.func),f=this.vseqexpr(a.args);if(0<a.keywords.length||a.starargs||a.kwargs){c=[];for(b=0;b<a.keywords.length;++b)c.push("'"+a.keywords[b].arg.v+"'"),c.push(this.vexpr(a.keywords[b].value));d="["+c.join(",")+"]";b=c="undefined";a.starargs&&(c=this.vexpr(a.starargs));a.kwargs&&(b=this.vexpr(a.kwargs));out("$ret;");out("$ret = Sk.misceval.callOrSuspend(",e,",",b,",",c,",",d,0<f.length?",":"",f,");")}else out("$ret;"),out("$ret = Sk.misceval.callsimOrSuspend(",
        e,0<f.length?",":"",f,");");this._checkSuspension(a);return this._gr("call","$ret")};Compiler.prototype.cslice=function(a){var b,c;goog.asserts.assert(a instanceof Slice);c=a.lower?this.vexpr(a.lower):a.step?"Sk.builtin.none.none$":"new Sk.builtin.int_(0)";b=a.upper?this.vexpr(a.upper):a.step?"Sk.builtin.none.none$":"new Sk.builtin.int_(2147483647)";a=a.step?this.vexpr(a.step):"Sk.builtin.none.none$";return this._gr("slice","new Sk.builtins['slice'](",c,",",b,",",a,")")};
    Compiler.prototype.eslice=function(a){var b,c;goog.asserts.assert(a instanceof Array);c=[];for(b=0;b<a.length;b++)c.push(this.vslicesub(a[b]));return this._gr("extslice","new Sk.builtins['tuple']([",c,"])")};Compiler.prototype.vslicesub=function(a){var b;switch(a.constructor){case Index:b=this.vexpr(a.value);break;case Slice:b=this.cslice(a);break;case Ellipsis:goog.asserts.fail("todo compile.js Ellipsis;");break;case ExtSlice:b=this.eslice(a.dims);break;default:goog.asserts.fail("invalid subscript kind")}return b};
    Compiler.prototype.vslice=function(a,b,c,d){a=this.vslicesub(a);return this.chandlesubscr(b,c,a,d)};Compiler.prototype.chandlesubscr=function(a,b,c,d){if(a===Load||a===AugLoad)return out("$ret = Sk.abstr.objectGetItem(",b,",",c,", true);"),this._checkSuspension(),this._gr("lsubscr","$ret");a===Store||a===AugStore?(out("$ret = Sk.abstr.objectSetItem(",b,",",c,",",d,", true);"),this._checkSuspension()):a===Del?out("Sk.abstr.objectDelItem(",b,",",c,");"):goog.asserts.fail("handlesubscr fail")};
    Compiler.prototype.cboolop=function(a){var b,c,d,e,f,g;goog.asserts.assert(a instanceof BoolOp);g=a.op===And?this._jumpfalse:this._jumptrue;f=this.newBlock("end of boolop");e=a.values;d=e.length;for(b=0;b<d;++b)a=this.vexpr(e[b]),0===b&&(c=this._gr("boolopsucc",a)),out(c,"=",a,";"),g.call(this,a,f);this._jump(f);this.setBlock(f);return c};
    Compiler.prototype.vexpr=function(a,b,c,d){var e;a.lineno>this.u.lineno&&(this.u.lineno=a.lineno,this.u.linenoSet=!1);switch(a.constructor){case BoolOp:return this.cboolop(a);case BinOp:return this._gr("binop","Sk.abstr.numberBinOp(",this.vexpr(a.left),",",this.vexpr(a.right),",'",a.op.prototype._astname,"')");case UnaryOp:return this._gr("unaryop","Sk.abstr.numberUnaryOp(",this.vexpr(a.operand),",'",a.op.prototype._astname,"')");case Lambda:return this.clambda(a);case IfExp:return this.cifexp(a);
        case Dict:return this.cdict(a);case ListComp:return this.clistcomp(a);case DictComp:return this.cdictcomp(a);case SetComp:return this.csetcomp(a);case GeneratorExp:return this.cgenexp(a);case Yield:return this.cyield(a);case Compare:return this.ccompare(a);case Call:return b=this.ccall(a),this.annotateSource(a),b;case Num:if("number"===typeof a.n)return a.n;if(a.n instanceof Sk.builtin.int_)return"new Sk.builtin.int_("+a.n.v+")";if(a.n instanceof Sk.builtin.float_)return a=0===a.n.v&&-Infinity===
        1/a.n.v?"-0":a.n.v,"new Sk.builtin.float_("+a+")";if(a.n instanceof Sk.builtin.lng)return"Sk.longFromStr('"+a.n.tp$str().v+"')";if(a.n instanceof Sk.builtin.complex)return"new Sk.builtin.complex(new Sk.builtin.float_("+(0===a.n.real.v&&-Infinity===1/a.n.real.v?"-0":a.n.real.v)+"), new Sk.builtin.float_("+(0===a.n.imag.v&&-Infinity===1/a.n.imag.v?"-0":a.n.imag.v)+"))";goog.asserts.fail("unhandled Num type");case Str:return this._gr("str","new Sk.builtins['str'](",a.s.$r().v,")");case Attribute:a.ctx!==
        AugLoad&&a.ctx!==AugStore&&(e=this.vexpr(a.value));d=a.attr.$r().v;d=d.substring(1,d.length-1);d=mangleName(this.u.private_,new Sk.builtin.str(d)).v;d=fixReservedWords(d);d=fixReservedNames(d);switch(a.ctx){case AugLoad:return out("$ret = Sk.abstr.gattr(",c,",'",d,"', true);"),this._checkSuspension(a),this._gr("lattr","$ret");case Load:return out("$ret = Sk.abstr.gattr(",e,",'",d,"', true);"),this._checkSuspension(a),this._gr("lattr","$ret");case AugStore:out("$ret = undefined;");out("if(",b,"!==undefined){");
            out("$ret = Sk.abstr.sattr(",c,",'",d,"',",b,", true);");out("}");this._checkSuspension(a);break;case Store:out("$ret = Sk.abstr.sattr(",e,",'",d,"',",b,", true);");this._checkSuspension(a);break;case Del:goog.asserts.fail("todo Del;");break;default:goog.asserts.fail("invalid attribute expression")}break;case Subscript:switch(a.ctx){case AugLoad:return out("$ret = Sk.abstr.objectGetItem(",c,",",d,", true);"),this._checkSuspension(a),this._gr("gitem","$ret");case Load:case Store:case Del:return this.vslice(a.slice,
            a.ctx,this.vexpr(a.value),b);case AugStore:out("$ret=undefined;");out("if(",b,"!==undefined){");out("$ret=Sk.abstr.objectSetItem(",c,",",d,",",b,", true)");out("}");this._checkSuspension(a);break;default:goog.asserts.fail("invalid subscript expression")}break;case Name:return this.nameop(a.id,a.ctx,b);case List:return this.ctuplelistorset(a,b,"list");case Tuple:return this.ctuplelistorset(a,b,"tuple");case Set:return this.ctuplelistorset(a,b,"set");default:goog.asserts.fail("unhandled case in vexpr")}};
    Compiler.prototype.vseqexpr=function(a,b){var c,d;goog.asserts.assert(void 0===b||a.length===b.length);d=[];for(c=0;c<a.length;++c)d.push(this.vexpr(a[c],void 0===b?void 0:b[c]));return d};
    Compiler.prototype.caugassign=function(a){var b,c,d,e,f;goog.asserts.assert(a instanceof AugAssign);f=a.target;switch(f.constructor){case Attribute:return b=this.vexpr(f.value),f=new Attribute(f.value,f.attr,AugLoad,f.lineno,f.col_offset),e=this.vexpr(f,void 0,b),d=this.vexpr(a.value),a=this._gr("inplbinopattr","Sk.abstr.numberInplaceBinOp(",e,",",d,",'",a.op.prototype._astname,"')"),f.ctx=AugStore,this.vexpr(f,a,b);case Subscript:return b=this.vexpr(f.value),c=this.vslicesub(f.slice),f=new Subscript(f.value,
        c,AugLoad,f.lineno,f.col_offset),e=this.vexpr(f,void 0,b,c),d=this.vexpr(a.value),a=this._gr("inplbinopsubscr","Sk.abstr.numberInplaceBinOp(",e,",",d,",'",a.op.prototype._astname,"')"),f.ctx=AugStore,this.vexpr(f,a,b,c);case Name:return b=this.nameop(f.id,Load),d=this.vexpr(a.value),a=this._gr("inplbinop","Sk.abstr.numberInplaceBinOp(",b,",",d,",'",a.op.prototype._astname,"')"),this.nameop(f.id,Store,a);default:goog.asserts.fail("unhandled case in augassign")}};
    Compiler.prototype.exprConstant=function(a){switch(a.constructor){case Num:return Sk.misceval.isTrue(a.n)?1:0;case Str:return Sk.misceval.isTrue(a.s)?1:0;default:return-1}};Compiler.prototype.newBlock=function(a){var b=this.u.blocknum++;this.u.blocks[b]=[];this.u.blocks[b]._name=a||"<unnamed>";this.u.blocks[b]._next=null;return b};Compiler.prototype.setBlock=function(a){goog.asserts.assert(0<=a&&a<this.u.blocknum);this.u.curblock=a};
    Compiler.prototype.pushBreakBlock=function(a){goog.asserts.assert(0<=a&&a<this.u.blocknum);this.u.breakBlocks.push(a)};Compiler.prototype.popBreakBlock=function(){this.u.breakBlocks.pop()};Compiler.prototype.pushContinueBlock=function(a){goog.asserts.assert(0<=a&&a<this.u.blocknum);this.u.continueBlocks.push(a)};Compiler.prototype.popContinueBlock=function(){this.u.continueBlocks.pop()};Compiler.prototype.pushExceptBlock=function(a){goog.asserts.assert(0<=a&&a<this.u.blocknum);this.u.exceptBlocks.push(a)};
    Compiler.prototype.popExceptBlock=function(){this.u.exceptBlocks.pop()};Compiler.prototype.pushFinallyBlock=function(a){goog.asserts.assert(0<=a&&a<this.u.blocknum);this.u.finallyBlocks.push(a)};Compiler.prototype.popFinallyBlock=function(){this.u.finallyBlocks.pop()};Compiler.prototype.setupExcept=function(a){out("$exc.push(",a,");")};Compiler.prototype.endExcept=function(){out("$exc.pop();")};
    Compiler.prototype.outputLocals=function(a){var b,c,d,e={};for(d=0;a.argnames&&d<a.argnames.length;++d)e[a.argnames[d]]=!0;a.localnames.sort();c=[];for(d=0;d<a.localnames.length;++d)b=a.localnames[d],void 0===e[b]&&(c.push(b),e[b]=!0);return 0<c.length?"var "+c.join(",")+"; /* locals */":""};
    Compiler.prototype.outputSuspensionHelpers=function(a){var b,c,d=[],e=a.localnames.concat(a.tempsToSave),f={},g=a.ste.blockType===FunctionBlock&&a.ste.childHasFree,h="var $wakeFromSuspension = function() {var susp = "+a.scopename+".wakingSuspension; delete "+a.scopename+".wakingSuspension;$blk=susp.$blk; $loc=susp.$loc; $gbl=susp.$gbl; $exc=susp.$exc; $err=susp.$err;currLineNo=susp.lineno; currColNo=susp.colno; Sk.lastYield=Date.now();"+(g?"$cell=susp.$cell;":"");for(b=0;b<e.length;b++)c=e[b],void 0===
    f[c]&&(h+=c+"=susp.$tmps."+c+";",f[c]=!0);h+="try { $ret=susp.child.resume(); } catch(err) { if (!(err instanceof Sk.builtin.BaseException)) { err = new Sk.builtin.ExternalError(err); } err.traceback.push({lineno: currLineNo, colno: currColNo, filename: '"+this.filename+"'}); if($exc.length>0) { $err=err; $blk=$exc.pop(); } else { throw err; } }};";h+="var $saveSuspension = function(child, filename, lineno, colno) {var susp = new Sk.misceval.Suspension(); susp.child=child;susp.resume=function(){"+
        a.scopename+".wakingSuspension=susp; return "+a.scopename+"("+(a.ste.generator?"$gen":"")+"); };susp.data=susp.child.data;susp.$blk=$blk;susp.$loc=$loc;susp.$gbl=$gbl;susp.$exc=$exc;susp.$err=$err;susp.filename=filename;susp.lineno=lineno;susp.colno=colno;susp.optional=child.optional;"+(g?"susp.$cell=$cell;":"");f={};for(b=0;b<e.length;b++)c=e[b],void 0===f[c]&&(d.push('"'+c+'":'+c),f[c]=!0);return h+="susp.$tmps={"+d.join(",")+"};return susp;};"};
    Compiler.prototype.outputAllUnits=function(){var a,b,c,d,e="",f,g;for(d=0;d<this.allUnits.length;++d){c=this.allUnits[d];e+=c.prefixCode;e+=this.outputLocals(c);c.doesSuspend&&(e+=this.outputSuspensionHelpers(c));e+=c.varDeclsCode;e+=c.switchCode;b=c.blocks;g=Object.create(null);for(a=0;a<b.length;++a)if(f=a,!(f in g))for(;;)if(g[f]=!0,e+="case "+f+": /* --- "+b[f]._name+" --- */",e+=b[f].join(""),null!==b[f]._next)if(b[f]._next in g){e+="/* jump */ continue;";break}else e+="/* allowing case fallthrough */",
        f=b[f]._next;else{e+="throw new Sk.builtin.SystemError('internal error: unterminated block');";break}e+=c.suffixCode}return e};
    Compiler.prototype.cif=function(a){var b,c,d;goog.asserts.assert(a instanceof If_);b=this.exprConstant(a.test);0===b?a.orelse&&0<a.orelse.length&&this.vseqstmt(a.orelse):1===b?this.vseqstmt(a.body):(d=this.newBlock("end of if"),a.orelse&&0<a.orelse.length&&(c=this.newBlock("next branch of if")),b=this.vexpr(a.test),a.orelse&&0<a.orelse.length?(this._jumpfalse(b,c),this.vseqstmt(a.body),this._jump(d),this.setBlock(c),this.vseqstmt(a.orelse)):(this._jumpfalse(b,d),this.vseqstmt(a.body)),this._jump(d),
        this.setBlock(d))};
    Compiler.prototype.cwhile=function(a){var b,c,d,e;0===this.exprConstant(a.test)?a.orelse&&this.vseqstmt(a.orelse):(e=this.newBlock("while test"),this._jump(e),this.setBlock(e),d=this.newBlock("after while"),c=0<a.orelse.length?this.newBlock("while orelse"):null,b=this.newBlock("while body"),this.annotateSource(a),this._jumpfalse(this.vexpr(a.test),c?c:d),this._jump(b),this.pushBreakBlock(d),this.pushContinueBlock(e),this.setBlock(b),this.vseqstmt(a.body),this._jump(e),this.popContinueBlock(),this.popBreakBlock(),
    0<a.orelse.length&&(this.setBlock(c),this.vseqstmt(a.orelse),this._jump(d)),this.setBlock(d))};
    Compiler.prototype.cfor=function(a){var b,c,d=this.newBlock("for start"),e=this.newBlock("for cleanup"),f=this.newBlock("for end");this.pushBreakBlock(f);this.pushContinueBlock(d);c=this.vexpr(a.iter);this.u.ste.generator?(b="$loc."+this.gensym("iter"),out(b,"=Sk.abstr.iter(",c,");")):(b=this._gr("iter","Sk.abstr.iter(",c,")"),this.u.tempsToSave.push(b));this._jump(d);this.setBlock(d);out("$ret = Sk.abstr.iternext(",b,this.u.canSuspend?", true":", false",");");this._checkSuspension(a);b=this._gr("next",
        "$ret");this._jumpundef(b,e);this.vexpr(a.target,b);this.vseqstmt(a.body);this._jump(d);this.setBlock(e);this.popContinueBlock();this.popBreakBlock();this.vseqstmt(a.orelse);this._jump(f);this.setBlock(f)};
    Compiler.prototype.craise=function(a){var b="";a.inst?(b=this.vexpr(a.inst),out("throw ",this.vexpr(a.type),"(",b,");")):a.type?a.type.func?out("throw ",this.vexpr(a.type),";"):(a=this._gr("err",this.vexpr(a.type)),out("if(",a," instanceof Sk.builtin.type) {","throw Sk.misceval.callsim(",a,");","} else if(typeof(",a,") === 'function') {","throw ",a,"();","} else {","throw ",a,";","}")):out("throw $err;")};
    Compiler.prototype.ctryexcept=function(a){var b,c,d,e,f,g,h,k=a.handlers.length,l=[];for(h=0;h<k;++h)l.push(this.newBlock("except_"+h+"_"));g=this.newBlock("unhandled");f=this.newBlock("orelse");e=this.newBlock("end");this.setupExcept(l[0]);this.vseqstmt(a.body);this.endExcept();this._jump(f);for(h=0;h<k;++h){this.setBlock(l[h]);d=a.handlers[h];if(!d.type&&h<k-1)throw new SyntaxError("default 'except:' must be last");d.type&&(b=this.vexpr(d.type),c=h==k-1?g:l[h+1],b=this._gr("instance","$err instanceof ",
        b),this._jumpfalse(b,c));d.name&&this.vexpr(d.name,"$err");this.vseqstmt(d.body);this._jump(e)}this.setBlock(g);out("throw $err;");this.setBlock(f);this.vseqstmt(a.orelse);this._jump(e);this.setBlock(e)};Compiler.prototype.ctryfinally=function(a){out("/*todo; tryfinally*/");this.ctryexcept(a.body[0])};Compiler.prototype.cassert=function(a){var b=this.vexpr(a.test),c=this.newBlock("end");this._jumptrue(b,c);out("throw new Sk.builtin.AssertionError(",a.msg?this.vexpr(a.msg):"",");");this.setBlock(c)};
    Compiler.prototype.cimportas=function(a,b,c){a=a.v;var d=a.indexOf("."),e=c;if(-1!==d)for(a=a.substr(d+1);-1!==d;)d=a.indexOf("."),c=-1!==d?a.substr(0,d):a,e=this._gr("lattr","Sk.abstr.gattr(",e,",'",c,"')"),a=a.substr(d+1);return this.nameop(b,Store,e)};
    Compiler.prototype.cimport=function(a){var b,c,d,e,f=a.names.length;for(e=0;e<f;++e)b=a.names[e],out("$ret = Sk.builtin.__import__(",b.name.$r().v,",$gbl,$loc,[]);"),this._checkSuspension(a),d=this._gr("module","$ret"),b.asname?this.cimportas(b.name,b.asname,d):(c=b.name,b=c.v.indexOf("."),-1!==b&&(c=new Sk.builtin.str(c.v.substr(0,b))),this.nameop(c,Store,d))};
    Compiler.prototype.cfromimport=function(a){var b,c,d,e,f,g=a.names.length;b=[];for(f=0;f<g;++f)b[f]=a.names[f].name.$r().v;out("$ret = Sk.builtin.__import__(",a.module.$r().v,",$gbl,$loc,[",b,"]);");this._checkSuspension(a);e=this._gr("module","$ret");for(f=0;f<g;++f){d=a.names[f];if(0===f&&"*"===d.name.v){goog.asserts.assert(1===g);out("Sk.importStar(",e,",$loc, $gbl);");break}c=this._gr("item","Sk.abstr.gattr(",e,",",d.name.$r().v,")");b=d.name;d.asname&&(b=d.asname);this.nameop(b,Store,c)}};
    Compiler.prototype.buildcodeobj=function(a,b,c,d,e){var f,g,h,k,l,m,p,n,r=[],q=null;f=null;c&&this.vseqexpr(c);d&&d.defaults&&(r=this.vseqexpr(d.defaults));d&&d.vararg&&(q=d.vararg);d&&d.kwarg&&(f=d.kwarg);c=this.enterScope(b,a,a.lineno,this.canSuspend);a=this.u.ste.generator;n=this.u.ste.hasFree;m=this.u.ste.childHasFree;l=this.newBlock("codeobj entry");this.u.prefixCode="var "+c+"=(function "+this.niceName(b.v)+"$(";h=[];if(a){if(f)throw new SyntaxError(b.v+"(): keyword arguments in generators not supported");
        if(q)throw new SyntaxError(b.v+"(): variable number of arguments in generators not supported");h.push("$gen")}else for(f&&(h.push("$kwa"),this.u.tempsToSave.push("$kwa")),k=0;d&&k<d.args.length;++k)h.push(this.nameop(d.args[k].id,Param));n&&(h.push("$free"),this.u.tempsToSave.push("$free"));this.u.prefixCode+=h.join(",");this.u.prefixCode+="){";a&&(this.u.prefixCode+="\n// generator\n");n&&(this.u.prefixCode+="\n// has free\n");m&&(this.u.prefixCode+="\n// has cell\n");p="{}";a&&(l="$gen.gi$resumeat",
        p="$gen.gi$locals");k="";m&&(k=a?",$cell=$gen.gi$cells":",$cell={}");this.u.varDeclsCode+="var $blk="+l+",$exc=[],$loc="+p+k+",$gbl=this,$err=undefined,$ret=undefined,currLineNo=undefined,currColNo=undefined;";null!==Sk.execLimit&&(this.u.varDeclsCode+="if (typeof Sk.execStart === 'undefined') {Sk.execStart = Date.now()}");null!==Sk.yieldLimit&&this.u.canSuspend&&(this.u.varDeclsCode+="if (typeof Sk.lastYield === 'undefined') {Sk.lastYield = Date.now()}");this.u.varDeclsCode+="if ("+c+".wakingSuspension!==undefined) { $wakeFromSuspension(); } else {";
        if(0<r.length)for(m=d.args.length-r.length,k=0;k<r.length;++k)l=this.nameop(d.args[k+m].id,Param),this.u.varDeclsCode+="if("+l+"===undefined)"+l+"="+c+".$defaults["+k+"];";for(k=0;d&&k<d.args.length;++k)l=d.args[k].id,this.isCell(l)&&(this.u.varDeclsCode+="$cell."+l.v+"="+l.v+";");a||(l=d?d.args.length-r.length:0,k=q?Infinity:d?d.args.length:0,this.u.varDeclsCode+='Sk.builtin.pyCheckArgs("'+b.v+'", arguments, '+l+", "+k+", "+(f?!0:!1)+", "+n+");");q&&(h=h.length,this.u.localnames.push(q.v),this.u.varDeclsCode+=
            q.v+"=new Sk.builtins['tuple'](Array.prototype.slice.call(arguments,"+h+")); /*vararg*/");f&&(this.u.localnames.push(f.v),this.u.varDeclsCode+=f.v+"=new Sk.builtins['dict']($kwa);");this.u.varDeclsCode+="}";this.u.switchCode="while(true){try{";this.u.switchCode+=this.outputInterruptTest();this.u.switchCode+="switch($blk){";this.u.suffixCode="} }catch(err){ if (!(err instanceof Sk.builtin.BaseException)) { err = new Sk.builtin.ExternalError(err); } err.traceback.push({lineno: currLineNo, colno: currColNo, filename: '"+
            this.filename+"'}); if ($exc.length>0) { $err = err; $blk=$exc.pop(); continue; } else { throw err; }} }});";e.call(this,c);if(d&&0<d.args.length){e=[];for(k=0;k<d.args.length;++k)e.push(d.args[k].id.v);g=e.join("', '");this.u.argnames=e}this.exitScope();0<r.length&&out(c,".$defaults=[",r.join(","),"];");g&&out(c,".co_varnames=['",g,"'];");f&&out(c,".co_kwargs=1;");g="";n&&(g=",$cell",(f=this.u.ste.hasFree)&&(g+=",$free"));return a?d&&0<d.args.length?this._gr("gener","new Sk.builtins['function']((function(){var $origargs=Array.prototype.slice.call(arguments);Sk.builtin.pyCheckArgs(\"",
            b.v,'",arguments,',d.args.length-r.length,",",d.args.length,");return new Sk.builtins['generator'](",c,",$gbl,$origargs",g,");}))"):this._gr("gener","new Sk.builtins['function']((function(){Sk.builtin.pyCheckArgs(\"",b.v,"\",arguments,0,0);return new Sk.builtins['generator'](",c,",$gbl,[]",g,");}))"):this._gr("funcobj","new Sk.builtins['function'](",c,",$gbl",g,")")};
    Compiler.prototype.cfunction=function(a){var b;goog.asserts.assert(a instanceof FunctionDef);b=this.buildcodeobj(a,a.name,a.decorator_list,a.args,function(b){this.vseqstmt(a.body);out("return Sk.builtin.none.none$;")});this.nameop(a.name,Store,b)};Compiler.prototype.clambda=function(a){goog.asserts.assert(a instanceof Lambda);return this.buildcodeobj(a,new Sk.builtin.str("<lambda>"),null,a.args,function(b){b=this.vexpr(a.body);out("return ",b,";")})};
    Compiler.prototype.cifexp=function(a){var b=this.newBlock("next of ifexp"),c=this.newBlock("end of ifexp"),d=this._gr("res","null"),e=this.vexpr(a.test);this._jumpfalse(e,b);out(d,"=",this.vexpr(a.body),";");this._jump(c);this.setBlock(b);out(d,"=",this.vexpr(a.orelse),";");this._jump(c);this.setBlock(c);return d};
    Compiler.prototype.cgenexpgen=function(a,b,c){var d,e,f,g=this.newBlock("start for "+b),h=this.newBlock("skip for "+b);this.newBlock("if cleanup for "+b);var k=this.newBlock("end for "+b),l=a[b];0===b?e="$loc.$iter0":(d=this.vexpr(l.iter),e="$loc."+this.gensym("iter"),out(e,"=","Sk.abstr.iter(",d,");"));this._jump(g);this.setBlock(g);this.annotateSource(c);out("$ret = Sk.abstr.iternext(",e,this.u.canSuspend?", true":", false",");");this._checkSuspension(c);d=this._gr("next","$ret");this._jumpundef(d,
        k);this.vexpr(l.target,d);f=l.ifs.length;for(e=0;e<f;++e)this.annotateSource(l.ifs[e]),d=this.vexpr(l.ifs[e]),this._jumpfalse(d,g);++b<a.length&&this.cgenexpgen(a,b,c);b>=a.length&&(this.annotateSource(c),a=this.vexpr(c),out("return [",h,"/*resume*/,",a,"/*ret*/];"),this.setBlock(h));this._jump(g);this.setBlock(k);1===b&&out("return Sk.builtin.none.none$;")};
    Compiler.prototype.cgenexp=function(a){var b=this.buildcodeobj(a,new Sk.builtin.str("<genexpr>"),null,null,function(b){this.cgenexpgen(a.generators,0,a.elt)}),b=this._gr("gener","Sk.misceval.callsim(",b,");");out(b,".gi$locals.$iter0=Sk.abstr.iter(",this.vexpr(a.generators[0].iter),");");return b};
    Compiler.prototype.cclass=function(a){var b,c,d;goog.asserts.assert(a instanceof ClassDef);d=this.vseqexpr(a.bases);c=this.enterScope(a.name,a,a.lineno);b=this.newBlock("class entry");this.u.prefixCode="var "+c+"=(function $"+a.name.v+"$class_outer($globals,$locals,$rest){var $gbl=$globals,$loc=$locals;";this.u.switchCode+="(function $"+a.name.v+"$_closure(){";this.u.switchCode+="var $blk="+b+",$exc=[],$ret=undefined,currLineNo=undefined,currColNo=undefined;";null!==Sk.execLimit&&(this.u.switchCode+=
        "if (typeof Sk.execStart === 'undefined') {Sk.execStart = Date.now()}");null!==Sk.yieldLimit&&this.u.canSuspend&&(this.u.switchCode+="if (typeof Sk.lastYield === 'undefined') {Sk.lastYield = Date.now()}");this.u.switchCode+="while(true){try{";this.u.switchCode+=this.outputInterruptTest();this.u.switchCode+="switch($blk){";this.u.suffixCode="}}catch(err){ if (!(err instanceof Sk.builtin.BaseException)) { err = new Sk.builtin.ExternalError(err); } err.traceback.push({lineno: currLineNo, colno: currColNo, filename: '"+
        this.filename+"'}); if ($exc.length>0) { $err = err; $blk=$exc.pop(); continue; } else { throw err; }}}";this.u.suffixCode+="}).apply(null,$rest);});";this.u.private_=a.name;this.cbody(a.body);out("return;");this.exitScope();b=this._gr("built","Sk.misceval.buildClass($gbl,",c,",",a.name.$r().v,",[",d,"])");this.nameop(a.name,Store,b)};
    Compiler.prototype.ccontinue=function(a){if(0===this.u.continueBlocks.length)throw new SyntaxError("'continue' outside loop");this._jump(this.u.continueBlocks[this.u.continueBlocks.length-1])};
    Compiler.prototype.vstmt=function(a){var b,c,d;this.u.lineno=a.lineno;this.u.linenoSet=!1;this.u.localtemps=[];Sk.debugging&&this.u.canSuspend&&(b=this.newBlock("debug breakpoint for line "+a.lineno),out("if (Sk.breakpoints('"+this.filename+"',"+a.lineno+","+a.col_offset+")) {","var $susp = $saveSuspension({data: {type: 'Sk.debug'}, resume: function() {}}, '"+this.filename+"',"+a.lineno+","+a.col_offset+");","$susp.$blk = "+b+";","$susp.optional = true;","return $susp;","}"),this._jump(b),this.setBlock(b),
        this.u.doesSuspend=!0);this.annotateSource(a);switch(a.constructor){case FunctionDef:this.cfunction(a);break;case ClassDef:this.cclass(a);break;case Return_:if(this.u.ste.blockType!==FunctionBlock)throw new SyntaxError("'return' outside function");a.value?out("return ",this.vexpr(a.value),";"):out("return Sk.builtin.none.none$;");break;case Delete_:this.vseqexpr(a.targets);break;case Assign:d=a.targets.length;c=this.vexpr(a.value);for(b=0;b<d;++b)this.vexpr(a.targets[b],c);break;case AugAssign:return this.caugassign(a);
        case Print:this.cprint(a);break;case For_:return this.cfor(a);case While_:return this.cwhile(a);case If_:return this.cif(a);case Raise:return this.craise(a);case TryExcept:return this.ctryexcept(a);case TryFinally:return this.ctryfinally(a);case Assert:return this.cassert(a);case Import_:return this.cimport(a);case ImportFrom:return this.cfromimport(a);case Global:break;case Expr:this.vexpr(a.value);break;case Pass:break;case Break_:if(0===this.u.breakBlocks.length)throw new SyntaxError("'break' outside loop");
            this._jump(this.u.breakBlocks[this.u.breakBlocks.length-1]);break;case Continue_:this.ccontinue(a);break;case Debugger_:out("debugger;");break;default:goog.asserts.fail("unhandled case in vstmt")}};Compiler.prototype.vseqstmt=function(a){var b;for(b=0;b<a.length;++b)this.vstmt(a[b])};var OP_FAST=0,OP_GLOBAL=1,OP_DEREF=2,OP_NAME=3,D_NAMES=0,D_FREEVARS=1,D_CELLVARS=2;Compiler.prototype.isCell=function(a){a=mangleName(this.u.private_,a).v;return this.u.ste.getScope(a)===CELL};
    Compiler.prototype.nameop=function(a,b,c){var d,e,f,g;if((b===Store||b===AugStore||b===Del)&&"__debug__"===a.v)throw new Sk.builtin.SyntaxError("can not assign to __debug__");if((b===Store||b===AugStore||b===Del)&&"None"===a.v)throw new Sk.builtin.SyntaxError("can not assign to None");if("None"===a.v)return"Sk.builtin.none.none$";if("True"===a.v)return"Sk.builtin.bool.true$";if("False"===a.v)return"Sk.builtin.bool.false$";if("NotImplemented"===a.v)return"Sk.builtin.NotImplemented.NotImplemented$";
        g=mangleName(this.u.private_,a).v;g=fixReservedNames(g);f=OP_NAME;e=this.u.ste.getScope(g);d=null;switch(e){case FREE:d="$free";f=OP_DEREF;break;case CELL:d="$cell";f=OP_DEREF;break;case LOCAL:this.u.ste.blockType!==FunctionBlock||this.u.ste.generator||(f=OP_FAST);break;case GLOBAL_IMPLICIT:this.u.ste.blockType===FunctionBlock&&(f=OP_GLOBAL);break;case GLOBAL_EXPLICIT:f=OP_GLOBAL}g=fixReservedWords(g);goog.asserts.assert(e||"_"===a.v.charAt(1));a=g;this.u.ste.generator||this.u.ste.blockType!==FunctionBlock?
            g="$loc."+g:f!==OP_FAST&&f!==OP_NAME||this.u.localnames.push(g);switch(f){case OP_FAST:switch(b){case Load:case Param:return out("if (",g," === undefined) { throw new Sk.builtin.UnboundLocalError('local variable \\'",g,"\\' referenced before assignment'); }\n"),g;case Store:out(g,"=window.currentPythonRunner.reportValue(",c,",'",a,"');");break;case Del:out("delete ",g,";");break;default:goog.asserts.fail("unhandled")}break;case OP_NAME:switch(b){case Load:return this._gr("loadname",g,"!==undefined?",g,":Sk.misceval.loadname('",a,"',$gbl);");case Store:out(g,
            "=window.currentPythonRunner.reportValue(",c,",'",a,"');");break;case Del:out("delete ",g,";");break;case Param:return g;default:goog.asserts.fail("unhandled")}break;case OP_GLOBAL:switch(b){case Load:return this._gr("loadgbl","Sk.misceval.loadname('",a,"',$gbl)");case Store:out("$gbl.",a,"=window.currentPythonRunner.reportValue(",c,",'",a,"');");break;case Del:out("delete $gbl.",a);break;default:goog.asserts.fail("unhandled case in name op_global")}break;case OP_DEREF:switch(b){case Load:return d+"."+a;case Store:out(d,".",a,"=window.currentPythonRunner.reportValue(",c,",'",d,"[\"",a,"\"]');");break;case Param:return a;default:goog.asserts.fail("unhandled case in name op_deref")}break;
            default:goog.asserts.fail("unhandled case")}};Compiler.prototype.enterScope=function(a,b,c,d){var e=new CompilerUnit;e.ste=this.st.getStsForAst(b);e.name=a;e.firstlineno=c;e.canSuspend=d||!1;this.u&&this.u.private_&&(e.private_=this.u.private_);this.stack.push(this.u);this.allUnits.push(e);a=this.gensym("scope");e.scopename=a;this.u=e;this.u.activateScope();this.nestlevel++;return a};
    Compiler.prototype.exitScope=function(){var a,b=this.u;this.nestlevel--;(this.u=0<=this.stack.length-1?this.stack.pop():null)&&this.u.activateScope();"<module>"!==b.name.v&&(a=b.name.$r().v,a=a.substring(1,a.length-1),a=fixReservedWords(a),a=fixReservedNames(a),out(b.scopename,".co_name=new Sk.builtins['str']('",a,"');"))};Compiler.prototype.cbody=function(a){var b;for(b=0;b<a.length;++b)this.vstmt(a[b])};
    Compiler.prototype.cprint=function(a){var b,c;goog.asserts.assert(a instanceof Print);a.dest&&this.vexpr(a.dest);c=a.values.length;for(b=0;b<c;++b)out("Sk.misceval.print_(","new Sk.builtins['str'](",this.vexpr(a.values[b]),").v);");a.nl&&out("Sk.misceval.print_(",'"\\n");')};
    Compiler.prototype.cmod=function(a){var b=this.enterScope(new Sk.builtin.str("<module>"),a,0,this.canSuspend),c=this.newBlock("module entry");this.u.prefixCode="var "+b+"=(function($modname){";this.u.varDeclsCode="var $gbl = {}, $blk="+c+",$exc=[],$loc=$gbl,$err=undefined;$gbl.__name__=$modname;$loc.__file__=new Sk.builtins.str('"+this.filename+"');var $ret=undefined,currLineNo=undefined,currColNo=undefined;";null!==Sk.execLimit&&(this.u.varDeclsCode+="if (typeof Sk.execStart === 'undefined') {Sk.execStart = Date.now()}");
        null!==Sk.yieldLimit&&this.u.canSuspend&&(this.u.varDeclsCode+="if (typeof Sk.lastYield === 'undefined') {Sk.lastYield = Date.now()}");this.u.varDeclsCode+="if ("+b+".wakingSuspension!==undefined) { $wakeFromSuspension(); }if (Sk.retainGlobals) {    if (Sk.globals) { $gbl = Sk.globals; Sk.globals = $gbl; $loc = $gbl; }    else { Sk.globals = $gbl; }} else { Sk.globals = $gbl; }";this.u.switchCode="while(true){try{";this.u.switchCode+=this.outputInterruptTest();this.u.switchCode+="switch($blk){";this.u.suffixCode=
            "}";this.u.suffixCode+="}catch(err){ if (!(err instanceof Sk.builtin.BaseException)) { err = new Sk.builtin.ExternalError(err); } err.traceback.push({lineno: currLineNo, colno: currColNo, filename: '"+this.filename+"'}); if ($exc.length>0) { $err = err; $blk=$exc.pop(); continue; } else { throw err; }} } });";switch(a.constructor){case Module:this.cbody(a.body);out("return $loc;");break;default:goog.asserts.fail("todo; unhandled case in compilerMod")}this.exitScope();this.result.push(this.outputAllUnits());
        return b};Sk.compile=function(a,b,c,d){var e=Sk.parse(b,a);c=Sk.astFromParse(e.cst,b,e.flags);var e=e.flags,f=Sk.symboltable(c,b);a=new Compiler(b,f,e,d,a);b=a.cmod(c);a=a.result.join("");return{funcname:b,code:a}};goog.exportSymbol("Sk.compile",Sk.compile);Sk.resetCompiler=function(){Sk.gensymcount=0};goog.exportSymbol("Sk.resetCompiler",Sk.resetCompiler);Sk.sysmodules=new Sk.builtin.dict([]);Sk.realsyspath=void 0;Sk.externalLibraryCache={};Sk.loadExternalLibraryInternal_=function(a,b){var c,d;if(null!=a){if(Sk.externalLibraryCache[a])return Sk.externalLibraryCache[a];c=new XMLHttpRequest;c.open("GET",a,!1);c.send();if(200===c.status)return d=c.responseText,b&&(c=document.createElement("script"),c.type="text/javascript",c.text=d,document.getElementsByTagName("head")[0].appendChild(c)),d}};
    Sk.loadExternalLibrary=function(a){var b,c,d,e,f,g;if(Sk.externalLibraryCache[a])return Sk.externalLibraryCache[a];if(b=Sk.externalLibraries&&Sk.externalLibraries[a]){c="string"===typeof b?b:b.path;if("string"!==typeof c)throw new Sk.builtin.ImportError("Invalid path specified for "+a);g=b.type;g||(g=(d=c.match(/\.(js|py)$/))&&d[1]);if(!g)throw new Sk.builtin.ImportError("Invalid file extension specified for "+a);d=Sk.loadExternalLibraryInternal_(c,!1);if(!d)throw new Sk.builtin.ImportError("Failed to load remote module '"+
        a+"'");if((e=b.dependencies)&&e.length)for(b=0;b<e.length;b++)if(f=Sk.loadExternalLibraryInternal_(e[b],!0),!f)throw new Sk.builtin.ImportError("Failed to load dependencies required for "+a);c="js"===g?{funcname:"$builtinmodule",code:d}:Sk.compile(d,c,"exec",!0);return Sk.externalLibraryCache[a]=c}};
    Sk.importSearchPathForName=function(a,b,c,d,e){var f,g=[],h=a.replace(/\./g,"/"),k,l;k=Sk.realsyspath.tp$iter();for(l=k.tp$iternext();void 0!==l;l=k.tp$iternext())g.push(l.v+"/"+h+b),g.push(l.v+"/"+h+"/__init__"+b);g.push(e+"/"+h+b);g.push(e+"/"+h+"/__init__"+b);f=0;return function p(){for(var b=function y(a){var b;return a instanceof Sk.misceval.Suspension?(b=new Sk.misceval.Suspension(void 0,a),b.resume=function(){try{return y(a.resume())}catch(b){return f++,p()}},b):{filename:g[f],code:a}},e;f<
    g.length;)try{return e=Sk.read(g[f]),d||(e=Sk.misceval.retryOptionalSuspensionOrThrow(e)),b(e)}catch(h){f++}if(c)return null;throw new Sk.builtin.ImportError("No module named "+a);}()};
    Sk.doOneTimeInitialization=function(){var a,b,c;Sk.builtin.type.basesStr_=new Sk.builtin.str("__bases__");Sk.builtin.type.mroStr_=new Sk.builtin.str("__mro__");for(a in Sk.builtin)if(b=Sk.builtin[a],(b.prototype instanceof Sk.builtin.object||b===Sk.builtin.object)&&!b.sk$abstract){c=[];for(var d=void 0,d=b.tp$base;void 0!==d;d=d.tp$base)c.push(d);b.$d=new Sk.builtin.dict([]);b.$d.mp$ass_subscript(Sk.builtin.type.basesStr_,new Sk.builtin.tuple(c));b.$d.mp$ass_subscript(Sk.builtin.type.mroStr_,new Sk.builtin.tuple([b]))}a=
        Sk.builtin.object.prototype;for(c=0;c<Sk.builtin.object.pythonFunctions.length;c++){b=Sk.builtin.object.pythonFunctions[c];if(a[b]instanceof Sk.builtin.func)break;a[b]=new Sk.builtin.func(a[b])}};Sk.importSetUpPath=function(){var a,b;if(!Sk.realsyspath){b=[new Sk.builtin.str("src/builtin"),new Sk.builtin.str("src/lib"),new Sk.builtin.str(".")];for(a=0;a<Sk.syspath.length;++a)b.push(new Sk.builtin.str(Sk.syspath[a]));Sk.realsyspath=new Sk.builtin.list(b);Sk.doOneTimeInitialization()}};
    if(COMPILED)var js_beautify=function(a){return a};
    Sk.importModuleInternal_=function(a,b,c,d,e,f){var g,h,k,l,m,p,n,r,q,t,y,v;Sk.importSetUpPath();void 0===c&&(c=a);v=null;y=c.split(".");try{return p=Sk.sysmodules.mp$subscript(c),1<y.length?Sk.sysmodules.mp$subscript(y[0]):p}catch(z){}if(1<y.length&&(t=y.slice(0,y.length-1).join("."),v=Sk.importModuleInternal_(t,b,void 0,void 0,e,f),v instanceof Sk.misceval.Suspension))return function w(g){return g instanceof Sk.misceval.Suspension?new Sk.misceval.Suspension(w,g):Sk.importModuleInternal_(a,b,c,d,
        e,f)}(v);q=new Sk.builtin.module;Sk.sysmodules.mp$ass_subscript(a,q);if(d)n=a+".py",p=Sk.compile(d,n,"exec",e);else{if(Sk.onBeforeImport&&"function"===typeof Sk.onBeforeImport){p=Sk.onBeforeImport(a);if(!1===p)throw new Sk.builtin.ImportError("Importing "+a+" is not allowed");if("string"===typeof p)throw new Sk.builtin.ImportError(p);}(p=Sk.loadExternalLibrary(a))?n=Sk.externalLibraries?Sk.externalLibraries[a].path:"unknown":(p=Sk.importSearchPathForName(a,".js",!0,e,f),p=function E(b){if(b instanceof
        Sk.misceval.Suspension)return new Sk.misceval.Suspension(E,b);if(b)return n=b.filename,r?Sk.compile(b.code,b.filename,"exec",e):{funcname:"$builtinmodule",code:b.code};goog.asserts.assert(!r,"Sk.importReadFileFromPath did not throw when loading Python file failed");r=!0;return E(Sk.importSearchPathForName(a,".py",!1,e,f))}(p))}return function x(d){if(d instanceof Sk.misceval.Suspension)return e?new Sk.misceval.Suspension(x,d):Sk.misceval.retryOptionalSuspensionOrThrow(d);m=q.$js=d.code;null==n&&(n=
        d.filename);null!=Sk.dateSet&&Sk.dateSet||(m="Sk.execStart = Sk.lastYield = new Date();\n"+d.code,Sk.dateSet=!0);b&&(l=function(a){var b,c,d=js_beautify(a).split("\n");for(c=1;c<=d.length;++c){b=(""+c).length;for(a="";5>b;++b)a+=" ";d[c-1]="/* "+a+c+" */ "+d[c-1]}return d.join("\n")},m=l(m),Sk.debugout(m));k="new Sk.builtin.str('"+c+"')";m+="\n"+d.funcname+"("+k+");";h=goog.global.eval(m);return function C(b){if(b instanceof Sk.misceval.Suspension){if(e)return new Sk.misceval.Suspension(C,b);b=Sk.misceval.retryOptionalSuspensionOrThrow(b,
        'Module "'+c+'" suspended or blocked during load, and it was loaded somewhere that does not permit this')}b.__name__||(b.__name__=new Sk.builtin.str(c));b.__path__=new Sk.builtin.str(n);q.$d=b;b.__doc__||(b.__doc__=Sk.builtin.none.none$);if(Sk.onAfterImport&&"function"===typeof Sk.onAfterImport)try{Sk.onAfterImport(a)}catch(d){}return v?(g=Sk.sysmodules.mp$subscript(t),g.tp$setattr(y[y.length-1],q),v):q}(h)}(p)};Sk.importModule=function(a,b,c){return Sk.importModuleInternal_(a,b,void 0,void 0,c)};
    Sk.importMain=function(a,b,c){Sk.dateSet=!1;Sk.filesLoaded=!1;Sk.sysmodules=new Sk.builtin.dict([]);Sk.realsyspath=void 0;Sk.resetCompiler();return Sk.importModuleInternal_(a,b,"__main__",void 0,c)};Sk.importMainWithBody=function(a,b,c,d){Sk.dateSet=!1;Sk.filesLoaded=!1;Sk.sysmodules=new Sk.builtin.dict([]);Sk.realsyspath=void 0;Sk.resetCompiler();return Sk.importModuleInternal_(a,b,"__main__",c,d)};
    Sk.builtin.__import__=function(a,b,c,d){var e=Sk.globals,f=void 0===c.__file__?void 0:c.__file__.v.substring(0,c.__file__.v.lastIndexOf("/"));return function h(b){if(b instanceof Sk.misceval.Suspension)return new Sk.misceval.Suspension(h,b);e!==Sk.globals&&(Sk.globals=e);if(d&&0!==d.length){var c,m,p,n=a.split("."),n=n[n.length-1];for(c=0;c<d.length;c++)p=d[c],"*"==p||(null!=b.$d[p]||null==b.$d[n]&&b.$d.__name__.v!=n)||(m=""+a+"."+p,m=Sk.importModuleInternal_(m,void 0,void 0,void 0,!0,f),b.$d[p]=
        m)}else return b;b=Sk.sysmodules.mp$subscript(a);goog.asserts.assert(b);return b}(Sk.importModuleInternal_(a,void 0,void 0,void 0,!0,f))};Sk.importStar=function(a,b,c){var d,e=c.__name__,f=Object.getOwnPropertyNames(a.$d);for(d in f)b[f[d]]=a.$d[f[d]];c.__name__!==e&&(c.__name__=e)};goog.exportSymbol("Sk.importMain",Sk.importMain);goog.exportSymbol("Sk.importMainWithBody",Sk.importMainWithBody);goog.exportSymbol("Sk.builtin.__import__",Sk.builtin.__import__);goog.exportSymbol("Sk.importStar",Sk.importStar);Sk.builtin.timSort=function(a,b){this.list=new Sk.builtin.list(a.v);this.MIN_GALLOP=7;this.listlength=b?b:a.sq$length()};Sk.builtin.timSort.prototype.lt=function(a,b){return Sk.misceval.richCompareBool(a,b,"Lt")};Sk.builtin.timSort.prototype.le=function(a,b){return!this.lt(b,a)};Sk.builtin.timSort.prototype.setitem=function(a,b){this.list.v[a]=b};
    Sk.builtin.timSort.prototype.binary_sort=function(a,b){var c,d,e,f,g;for(g=a.base+b;g<a.base+a.len;g++){f=a.base;e=g;for(c=a.getitem(e);f<e;)d=f+(e-f>>1),this.lt(c,a.getitem(d))?e=d:f=d+1;goog.asserts.assert(f===e);for(d=g;d>f;d--)a.setitem(d,a.getitem(d-1));a.setitem(f,c)}};
    Sk.builtin.timSort.prototype.count_run=function(a){var b,c,d;if(1>=a.len)b=a.len,d=!1;else if(b=2,this.lt(a.getitem(a.base+1),a.getitem(a.base)))for(d=!0,c=a.base+2;c<a.base+a.len;c++)if(this.lt(a.getitem(c),a.getitem(c-1)))b++;else break;else for(d=!1,c=a.base+2;c<a.base+a.len&&!this.lt(a.getitem(c),a.getitem(c-1));c++)b++;return{run:new Sk.builtin.listSlice(a.list,a.base,b),descending:d}};
    Sk.builtin.timSort.prototype.sort=function(){var a,b,c,d=new Sk.builtin.listSlice(this.list,0,this.listlength);if(!(2>d.len)){this.merge_init();for(a=this.merge_compute_minrun(d.len);0<d.len;)b=this.count_run(d),b.descending&&b.run.reverse(),b.run.len<a&&(c=b.run.len,b.run.len=a<d.len?a:d.len,this.binary_sort(b.run,c)),d.advance(b.run.len),this.pending.push(b.run),this.merge_collapse();goog.asserts.assert(d.base==this.listlength);this.merge_force_collapse();goog.asserts.assert(1==this.pending.length);
        goog.asserts.assert(0===this.pending[0].base);goog.asserts.assert(this.pending[0].len==this.listlength)}};
    Sk.builtin.timSort.prototype.gallop=function(a,b,c,d){var e,f,g,h,k;goog.asserts.assert(0<=c&&c<b.len);e=this;d=d?function(a,b){return e.le(a,b)}:function(a,b){return e.lt(a,b)};f=b.base+c;g=0;h=1;if(d(b.getitem(f),a)){for(k=b.len-c;h<k;)if(d(b.getitem(f+h),a)){g=h;try{h=(h<<1)+1}catch(l){h=k}}else break;h>k&&(h=k);g+=c;h+=c}else{for(k=c+1;h<k&&!d(b.getitem(f-h),a);){g=h;try{h=(h<<1)+1}catch(m){h=k}}h>k&&(h=k);f=c-g;g=c-h;h=f}goog.asserts.assert(-1<=g<h<=b.len);for(g+=1;g<h;)c=g+(h-g>>1),d(b.getitem(b.base+
        c),a)?g=c+1:h=c;goog.asserts.assert(g==h);return h};Sk.builtin.timSort.prototype.merge_init=function(){this.min_gallop=this.MIN_GALLOP;this.pending=[]};
    Sk.builtin.timSort.prototype.merge_lo=function(a,b){var c,d,e,f,g;goog.asserts.assert(0<a.len&&0<b.len&&a.base+a.len==b.base);c=this.min_gallop;d=a.base;a=a.copyitems();try{if(this.setitem(d,b.popleft()),d++,1!=a.len&&0!==b.len)for(;;){for(f=e=0;;)if(this.lt(b.getitem(b.base),a.getitem(a.base))){this.setitem(d,b.popleft());d++;if(0===b.len)return;f++;e=0;if(f>=c)break}else{this.setitem(d,a.popleft());d++;if(1==a.len)return;e++;f=0;if(e>=c)break}for(c+=1;;){this.min_gallop=c-=1<c;e=this.gallop(b.getitem(b.base),
        a,0,!0);for(g=a.base;g<a.base+e;g++)this.setitem(d,a.getitem(g)),d++;a.advance(e);if(1>=a.len)return;this.setitem(d,b.popleft());d++;if(0===b.len)return;f=this.gallop(a.getitem(a.base),b,0,!1);for(g=b.base;g<b.base+f;g++)this.setitem(d,b.getitem(g)),d++;b.advance(f);if(0===b.len)return;this.setitem(d,a.popleft());d++;if(1==a.len)return;if(e<this.MIN_GALLOP&&f<this.MIN_GALLOP)break;c++;this.min_gallop=c}}}finally{goog.asserts.assert(0<=a.len&&0<=b.len);for(g=b.base;g<b.base+b.len;g++)this.setitem(d,
        b.getitem(g)),d++;for(g=a.base;g<a.base+a.len;g++)this.setitem(d,a.getitem(g)),d++}};
    Sk.builtin.timSort.prototype.merge_hi=function(a,b){var c,d,e,f,g,h,k,l;goog.asserts.assert(0<a.len&&0<b.len&&a.base+a.len==b.base);c=this.min_gallop;d=b.base+b.len;b=b.copyitems();try{if(d--,this.setitem(d,a.popright()),0!==a.len&&1!=b.len)for(;;){for(f=e=0;;)if(g=a.getitem(a.base+a.len-1),h=b.getitem(b.base+b.len-1),this.lt(h,g)){d--;this.setitem(d,g);a.len--;if(0===a.len)return;e++;f=0;if(e>=c)break}else{d--;this.setitem(d,h);b.len--;if(1==b.len)return;f++;e=0;if(f>=c)break}for(c+=1;;){this.min_gallop=
        c-=1<c;h=b.getitem(b.base+b.len-1);k=this.gallop(h,a,a.len-1,!0);e=a.len-k;for(l=a.base+a.len-1;l>a.base+k-1;l--)d--,this.setitem(d,a.getitem(l));a.len-=e;if(0===a.len)return;d--;this.setitem(d,b.popright());if(1==b.len)return;g=a.getitem(a.base+a.len-1);k=this.gallop(g,b,b.len-1,!1);f=b.len-k;for(l=b.base+b.len-1;l>b.base+k-1;l--)d--,this.setitem(d,b.getitem(l));b.len-=f;if(1>=b.len)return;d--;this.setitem(d,a.popright());if(0===a.len)return;if(e<this.MIN_GALLOP&&f<this.MIN_GALLOP)break;c++;this.min_gallop=
        c}}}finally{goog.asserts.assert(0<=a.len&&0<=b.len);for(l=a.base+a.len-1;l>a.base-1;l--)d--,this.setitem(d,a.getitem(l));for(l=b.base+b.len-1;l>b.base-1;l--)d--,this.setitem(d,b.getitem(l))}};
    Sk.builtin.timSort.prototype.merge_at=function(a){var b,c;0>a&&(a=this.pending.length+a);b=this.pending[a];c=this.pending[a+1];goog.asserts.assert(0<b.len&&0<c.len);goog.asserts.assert(b.base+b.len==c.base);this.pending[a]=new Sk.builtin.listSlice(this.list,b.base,b.len+c.len);this.pending.splice(a+1,1);a=this.gallop(c.getitem(c.base),b,0,!0);b.advance(a);0!==b.len&&(c.len=this.gallop(b.getitem(b.base+b.len-1),c,c.len-1,!1),0!==c.len&&(b.len<=c.len?this.merge_lo(b,c):this.merge_hi(b,c)))};
    Sk.builtin.timSort.prototype.merge_collapse=function(){for(var a=this.pending;1<a.length;)if(3<=a.length&&a[a.length-3].len<=a[a.length-2].len+a[a.length-1].len)a[a.length-3].len<a[a.length-1].len?this.merge_at(-3):this.merge_at(-2);else if(a[a.length-2].len<=a[a.length-1].len)this.merge_at(-2);else break};Sk.builtin.timSort.prototype.merge_force_collapse=function(){for(var a=this.pending;1<a.length;)3<=a.length&&a[a.length-3].len<a[a.length-1].len?this.merge_at(-3):this.merge_at(-2)};
    Sk.builtin.timSort.prototype.merge_compute_minrun=function(a){for(var b=0;64<=a;)b|=a&1,a>>=1;return a+b};Sk.builtin.listSlice=function(a,b,c){this.list=a;this.base=b;this.len=c};Sk.builtin.listSlice.prototype.copyitems=function(){var a=this.base,b=this.base+this.len;goog.asserts.assert(0<=a<=b);return new Sk.builtin.listSlice(new Sk.builtin.list(this.list.v.slice(a,b)),0,this.len)};Sk.builtin.listSlice.prototype.advance=function(a){this.base+=a;this.len-=a;goog.asserts.assert(this.base<=this.list.sq$length())};
    Sk.builtin.listSlice.prototype.getitem=function(a){return this.list.v[a]};Sk.builtin.listSlice.prototype.setitem=function(a,b){this.list.v[a]=b};Sk.builtin.listSlice.prototype.popleft=function(){var a=this.list.v[this.base];this.base++;this.len--;return a};Sk.builtin.listSlice.prototype.popright=function(){this.len--;return this.list.v[this.base+this.len]};
    Sk.builtin.listSlice.prototype.reverse=function(){for(var a,b,c=this.list,d=this.base,e=d+this.len-1;d<e;)a=c.v[e],b=c.v[d],c.v[d]=a,c.v[e]=b,d++,e--};goog.exportSymbol("Sk.builtin.listSlice",Sk.builtin.listSlice);goog.exportSymbol("Sk.builtin.timSort",Sk.builtin.timSort);Sk.builtin.sorted=function(a,b,c,d){var e,f,g;if(void 0===d)d=!1;else{if(d instanceof Sk.builtin.float_)throw new Sk.builtin.TypeError("an integer is required, got float");if(d instanceof Sk.builtin.int_||d.prototype instanceof Sk.builtin.int_)d=Sk.misceval.isTrue(d);else throw new Sk.builtin.TypeError("an integer is required");}if(void 0===c||c instanceof Sk.builtin.none)b instanceof Sk.builtin.none||void 0===b||(g=b);else for(g=b instanceof Sk.builtin.none||void 0===b?function(a,b){return Sk.misceval.richCompareBool(a[0],
        b[0],"Lt")?new Sk.builtin.int_(-1):new Sk.builtin.int_(0)}:function(a,c){return Sk.misceval.callsim(b,a[0],c[0])},f=a.tp$iter(),e=f.tp$iternext(),a=[];void 0!==e;)a.push([Sk.misceval.callsim(c,e),e]),e=f.tp$iternext();a=new Sk.builtin.list(a);void 0!==g?a.list_sort_(a,g):a.list_sort_(a);d&&a.list_reverse_(a);if(void 0!==c&&!(c instanceof Sk.builtin.none)){f=a.tp$iter();e=f.tp$iternext();for(a=[];void 0!==e;)a.push(e[1]),e=f.tp$iternext();a=new Sk.builtin.list(a)}return a};Sk.builtins={range:Sk.builtin.range,round:Sk.builtin.round,len:Sk.builtin.len,min:Sk.builtin.min,max:Sk.builtin.max,sum:Sk.builtin.sum,zip:Sk.builtin.zip,abs:Sk.builtin.abs,fabs:Sk.builtin.abs,ord:Sk.builtin.ord,chr:Sk.builtin.chr,hex:Sk.builtin.hex,oct:Sk.builtin.oct,bin:Sk.builtin.bin,dir:Sk.builtin.dir,repr:Sk.builtin.repr,open:Sk.builtin.open,isinstance:Sk.builtin.isinstance,hash:Sk.builtin.hash,getattr:Sk.builtin.getattr,float_$rw$:Sk.builtin.float_,int_$rw$:Sk.builtin.int_,hasattr:Sk.builtin.hasattr,
        map:Sk.builtin.map,filter:Sk.builtin.filter,reduce:Sk.builtin.reduce,sorted:Sk.builtin.sorted,bool:Sk.builtin.bool,any:Sk.builtin.any,all:Sk.builtin.all,enumerate:Sk.builtin.enumerate,AttributeError:Sk.builtin.AttributeError,ValueError:Sk.builtin.ValueError,Exception:Sk.builtin.Exception,ZeroDivisionError:Sk.builtin.ZeroDivisionError,AssertionError:Sk.builtin.AssertionError,ImportError:Sk.builtin.ImportError,IndentationError:Sk.builtin.IndentationError,IndexError:Sk.builtin.IndexError,KeyError:Sk.builtin.KeyError,
        TypeError:Sk.builtin.TypeError,NameError:Sk.builtin.NameError,IOError:Sk.builtin.IOError,NotImplementedError:Sk.builtin.NotImplementedError,StandardError:Sk.builtin.StandardError,SystemExit:Sk.builtin.SystemExit,OverflowError:Sk.builtin.OverflowError,OperationError:Sk.builtin.OperationError,RuntimeError:Sk.builtin.RuntimeError,StopIteration:Sk.builtin.StopIteration,dict:Sk.builtin.dict,file:Sk.builtin.file,"function":Sk.builtin.func,generator:Sk.builtin.generator,list:Sk.builtin.list,long_$rw$:Sk.builtin.lng,
        method:Sk.builtin.method,object:Sk.builtin.object,slice:Sk.builtin.slice,str:Sk.builtin.str,set:Sk.builtin.set,tuple:Sk.builtin.tuple,type:Sk.builtin.type,input:Sk.builtin.input,raw_input:Sk.builtin.raw_input,setattr:Sk.builtin.setattr,jseval:Sk.builtin.jseval,jsmillis:Sk.builtin.jsmillis,quit:Sk.builtin.quit,exit:Sk.builtin.quit,print:Sk.builtin.print,divmod:Sk.builtin.divmod,format:Sk.builtin.format,globals:Sk.builtin.globals,issubclass:Sk.builtin.issubclass,iter:Sk.builtin.iter,complex:Sk.builtin.complex,
        bytearray:Sk.builtin.bytearray,callable:Sk.builtin.callable,delattr:Sk.builtin.delattr,eval_$rn$:Sk.builtin.eval_,execfile:Sk.builtin.execfile,frozenset:Sk.builtin.frozenset,help:Sk.builtin.help,locals:Sk.builtin.locals,memoryview:Sk.builtin.memoryview,next:Sk.builtin.next_,pow:Sk.builtin.pow,property:Sk.builtin.property,reload:Sk.builtin.reload,reversed:Sk.builtin.reversed,"super":Sk.builtin.superbi,unichr:Sk.builtin.unichr,vars:Sk.builtin.vars,xrange:Sk.builtin.xrange,apply_$rn$:Sk.builtin.apply_,
        buffer:Sk.builtin.buffer,coerce:Sk.builtin.coerce,intern:Sk.builtin.intern};goog.exportSymbol("Sk.builtins",Sk.builtins);Sk.builtin.str.$emptystr=new Sk.builtin.str("");Sk.builtin.bool.true$=Object.create(Sk.builtin.bool.prototype,{v:{value:1,enumerable:!0}});Sk.builtin.bool.false$=Object.create(Sk.builtin.bool.prototype,{v:{value:0,enumerable:!0}});Sk.builtin.int_.co_varnames=["base"];Sk.builtin.int_.co_numargs=2;Sk.builtin.int_.$defaults=[new Sk.builtin.int_(10)];Sk.builtin.lng.co_varnames=["base"];Sk.builtin.lng.co_numargs=2;Sk.builtin.lng.$defaults=[new Sk.builtin.int_(10)];
    Sk.builtin.sorted.co_varnames=["cmp","key","reverse"];Sk.builtin.sorted.co_numargs=4;Sk.builtin.sorted.$defaults=[Sk.builtin.none.none$,Sk.builtin.none.none$,Sk.builtin.bool.false$];}());

/**
 * Debugger support for skulpt module
 */

var Sk = Sk || {}; //jshint ignore:line

function hasOwnProperty(obj, prop) {
  var proto = obj.constructor.prototype;
  return (prop in obj) &&
      (!(prop in proto) || proto[prop] !== obj[prop]);
}

Sk.Breakpoint = function (filename, lineno, colno) {
  this.filename = filename;
  this.lineno = lineno;
  this.colno = colno;
  this.enabled = true;
  this.ignore_count = 0;
};

Sk.Debugger = function (filename, output_callback) {
  this.dbg_breakpoints = {};
  this.tmp_breakpoints = {};
  this.suspension_stack = [];
  this.current_suspension = -1;
  this.eval_callback = null;
  this.suspension = null;
  this.output_callback = output_callback;
  this.step_mode = false;
  this.filename = filename;
};

Sk.Debugger.prototype.print = function (txt) {
  if (this.output_callback != null) {
    this.output_callback.print(txt);
  }
};

Sk.Debugger.prototype.get_source_line = function (lineno) {
  if (this.output_callback != null) {
    return this.output_callback.get_source_line(lineno);
  }

  return "";
};

Sk.Debugger.prototype.move_up_the_stack = function () {
  this.current_suspension = Math.min(this.current_suspension + 1, this.suspension_stack.length - 1);
};

Sk.Debugger.prototype.move_down_the_stack = function () {
  this.current_suspension = Math.max(this.current_suspension - 1, 0);
};

Sk.Debugger.prototype.enable_step_mode = function () {
  this.step_mode = true;
};

Sk.Debugger.prototype.disable_step_mode = function () {
  this.step_mode = false;
};

Sk.Debugger.prototype.get_suspension_stack = function () {
  return this.suspension_stack;
};

Sk.Debugger.prototype.get_active_suspension = function () {
  if (this.suspension_stack.length === 0) {
    return null;
  }

  return this.suspension_stack[this.current_suspension];
};

Sk.Debugger.prototype.generate_breakpoint_key = function (filename, lineno, colno) {
  var key = filename + "-" + lineno;
  return key;
};

Sk.Debugger.prototype.check_breakpoints = function (filename, lineno, colno, globals, locals) {
  // If Step mode is enabled then ignore breakpoints since we will just break
  // at every line.
  if (this.step_mode === true) {
    return true;
  }

  var key = this.generate_breakpoint_key(filename, lineno, colno);
  if (hasOwnProperty(this.dbg_breakpoints, key) &&
      this.dbg_breakpoints[key].enabled === true) {
    var bp = null;
    if (hasOwnProperty(this.tmp_breakpoints, key)) {
      delete this.dbg_breakpoints[key];
      delete this.tmp_breakpoints[key];
      return true;
    }

    this.dbg_breakpoints[key].ignore_count -= 1;
    this.dbg_breakpoints[key].ignore_count = Math.max(0, this.dbg_breakpoints[key].ignore_count);

    bp = this.dbg_breakpoints[key];
    if (bp.ignore_count === 0) {
      return true;
    } else {
      return false;
    }
  }
  return false;
};

Sk.Debugger.prototype.get_breakpoints_list = function () {
  return this.dbg_breakpoints;
};

Sk.Debugger.prototype.disable_breakpoint = function (filename, lineno, colno) {
  var key = this.generate_breakpoint_key(filename, lineno, colno);

  if (hasOwnProperty(this.dbg_breakpoints, key)) {
    this.dbg_breakpoints[key].enabled = false;
  }
};

Sk.Debugger.prototype.enable_breakpoint = function (filename, lineno, colno) {
  var key = this.generate_breakpoint_key(filename, lineno, colno);

  if (hasOwnProperty(this.dbg_breakpoints, key)) {
    this.dbg_breakpoints[key].enabled = true;
  }
};

Sk.Debugger.prototype.clear_breakpoint = function (filename, lineno, colno) {
  var key = this.generate_breakpoint_key(filename, lineno, colno);
  if (hasOwnProperty(this.dbg_breakpoints, key)) {
    delete this.dbg_breakpoints[key];
    return null;
  } else {
    return "Invalid breakpoint specified: " + filename + " line: " + lineno;
  }
};

Sk.Debugger.prototype.clear_all_breakpoints = function () {
  this.dbg_breakpoints = {};
  this.tmp_breakpoints = {};
};

Sk.Debugger.prototype.set_ignore_count = function (filename, lineno, colno, count) {
  var key = this.generate_breakpoint_key(filename, lineno, colno);
  if (hasOwnProperty(this.dbg_breakpoints, key)) {
    var bp = this.dbg_breakpoints[key];
    bp.ignore_count = count;
  }
};

Sk.Debugger.prototype.set_condition = function (filename, lineno, colno, lhs, cond, rhs) {
  var key = this.generate_breakpoint_key(filename, lineno, colno);
  var bp;
  if (hasOwnProperty(this.dbg_breakpoints, key)) {
    // Set a new condition
    bp = this.dbg_breakpoints[key];
  } else {
    bp = new Sk.Breakpoint(filename, lineno, colno);
  }

  bp.condition = new Sk.Condition(lhs, cond, rhs);
  this.dbg_breakpoints[key] = bp;
};

Sk.Debugger.prototype.print_suspension_info = function (suspension) {
  var filename = suspension.filename;
  var lineno = suspension.lineno;
  var colno = suspension.colno;
  // this.print("Hit Breakpoint at <" + filename + "> at line: " + lineno + " column: " + colno + "\n");
  // this.print("----------------------------------------------------------------------------------\n");
  // this.print(" ==> " + this.get_source_line(lineno - 1) + "\n");
  // this.print("----------------------------------------------------------------------------------\n");
};

Sk.Debugger.prototype.set_suspension = function (suspension) {
  var parent = null;
  if (!hasOwnProperty(suspension, "filename") && suspension.child instanceof Sk.misceval.Suspension) {
    suspension = suspension.child;
  }

  // Pop the last suspension of the stack if there is more than 0
  if (this.suspension_stack.length > 0) {
    this.suspension_stack.pop();
    this.current_suspension -= 1;
  }

  // Unroll the stack to get each suspension.
  while (suspension instanceof Sk.misceval.Suspension) {
    parent = suspension;
    this.suspension_stack.push(parent);
    this.current_suspension += 1;
    suspension = suspension.child;
  }

  suspension = parent;

  this.print_suspension_info(suspension);
};

Sk.Debugger.prototype.add_breakpoint = function (filename, lineno, colno, temporary) {
  var key = this.generate_breakpoint_key(filename, lineno, colno);
  this.dbg_breakpoints[key] = new Sk.Breakpoint(filename, lineno, colno);
  if (temporary) {
    this.tmp_breakpoints[key] = true;
  }
};

Sk.Debugger.prototype.suspension_handler = function (susp) {
  return new Promise(function (resolve, reject) {
    try {
      resolve(susp.resume());
    } catch (e) {
      reject(e);
    }
  });
};

Sk.Debugger.prototype.resume = function () {
  // Reset the suspension stack to the topmost
  this.current_suspension = this.suspension_stack.length - 1;

  if (this.suspension_stack.length === 0) {
    this.print("No running program");
  } else {
    var promise = this.suspension_handler(this.get_active_suspension());
    promise.then(this.success.bind(this), this.error.bind(this));
  }
};


Sk.Debugger.prototype.pop_suspension_stack = function () {
  this.suspension_stack.pop();
  this.current_suspension -= 1;
};

Sk.Debugger.prototype.success = function (r) {
  if (r instanceof Sk.misceval.Suspension) {
    this.set_suspension(r);
    if (this.output_callback != null) {
      this.output_callback._onStepSuccess();
    }
  } else {
    if (this.suspension_stack.length > 0) {
      // Current suspension needs to be popped of the stack
      this.pop_suspension_stack();

      if (this.suspension_stack.length === 0) {
        this.print("Program execution complete");
        return;
      }

      var parent_suspension = this.get_active_suspension();
      // The child has completed the execution. So override the child's resume
      // so we can continue the execution.
      parent_suspension.child.resume = function () {
        return r;
      };
      this.resume();
    } else {
      this.print("Program execution complete");
    }
  }
};

Sk.Debugger.prototype.error = function (e) {
  if (this.output_callback != null) {
    this.output_callback._onStepError(e);
  }
  // this.print("Traceback (most recent call last):");
  for (var idx = 0; idx < e.traceback.length; ++idx) {
    // this.print("  File \"" + e.traceback[idx].filename + "\", line " + e.traceback[idx].lineno + ", in <module>");
    var code = this.get_source_line(e.traceback[idx].lineno - 1);
    code = code.trim();
    code = "    " + code;
    this.print(code);
  }

  var err_ty = e.constructor.tp$name;
  for (idx = 0; idx < e.args.v.length; ++idx) {
    this.print(err_ty + ": " + e.args.v[idx].v);
  }
};

Sk.Debugger.prototype.asyncToPromise = function (suspendablefn, suspHandlers, debugger_obj) {
  return new Promise(function (resolve, reject) {
    try {
      var r = suspendablefn();

      (function handleResponse(r) {
        try {
          while (r instanceof Sk.misceval.Suspension) {
            debugger_obj.set_suspension(r);
            return;
          }

          resolve(r);
        } catch (e) {
          reject(e);
        }
      })(r);

    } catch (e) {
      reject(e);
    }
  });
};

Sk.Debugger.prototype.execute = function (suspendablefn, suspHandlers) {
  var r = suspendablefn();

  if (r instanceof Sk.misceval.Suspension) {
    this.suspensions.concat(r);
    this.eval_callback(r);
  }
};

/*
    utils:
        Various utility functions for all modes.
*/

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1));
    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

var arrayContains = function(array, needle) {
   for (var index in array) {
      if (needle == array[index]) {
         return true;
      }
   }
   return false;
}

var highlightPause = false;

function resetFormElement(e) {
  e.wrap('<form>').closest('form').get(0).reset();
  e.unwrap();

  // Prevent form submission
  //e.stopPropagation();
  //e.preventDefault();
}


// from http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
// where they got it from the stackoverflow-code itself ("formatUnicorn")
if (!String.prototype.format) {
   String.prototype.format = function() {
      var str = this.toString();
      if (!arguments.length)
         return str;
      var args = typeof arguments[0],
          args = (("string" == args || "number" == args) ? arguments : arguments[0]);
      for (var arg in args) {
         str = str.replace(RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
      }
      return str;
   }
}


function showModal(id) {
   var el = '#' + id
   $(el).show();
}
function closeModal(id) {
   var el = '#' + id;
   $(el).hide();
}






// Merges arrays by values
// (Flat-Copy only)
function mergeIntoArray(into, other) {
   for (var iOther in other) {
      var intoContains = false;

      for (var iInto in into) {
         if (other[iOther] == into[iInto]) {
            intoContains = true;
         }
      }

      if (!intoContains) {
         into.push(other[iOther]);
      }
   }
}

// Merges objects into each other similar to $.extend, but
// merges Arrays differently (see above)
// (Deep-Copy only)
function mergeIntoObject(into, other) {
   for (var property in other) {
      if (other[property] instanceof Array) {
         if (!(into[property] instanceof Array)) {
            into[property] = [];
         }
         mergeIntoArray(into[property], other[property]);
      }
      if (other[property] instanceof Object) {
         if (!(into[property] instanceof Object)) {
            into[property] = {};
         }
         mergeIntoObject(into[property], other[property]);
      }
      into[property] = other[property];
   }
}

/*
{ shared: { field1: X }, easy: { field2: Y } } becomes { field1: X, field2: Y } if the current level is easy
{ shared: [X, Y], easy: [Z] }  becomes [X, Y, Z] if the current level is easy
{ easy: X, medium: Y, hard: Z}  becomes X if the current level is easy
*/

function testLevelSpecific() {
   var tests = [
      {
         in: { field1: "X", field2: "Y" },
         out: { field1: "X", field2: "Y" }
      },
      {
            in: { easy: "X", medium: "Y", hard: "Z"},
            out: "X"
      },
      {
          in: { shared: { field1: "X" }, easy: { field2: "Y" } },
          out: { field1: "X", field2: "Y" }
      },
      {
            in: { shared: ["X", "Y"], easy: ["Z"] },
            out: ["X", "Y", "Z"]
      }
   ];
   for (var iTest = 0; iTest < tests.length; iTest++) {
      var res = extractLevelSpecific(tests[iTest].in, "easy");
      if (JSON.stringify(res) != JSON.stringify(tests[iTest].out)) { // TODO better way to compare two objects
         console.error("Test " + iTest + " failed: returned " + JSON.stringify(res));
      }
   }
}



// We need to be able to clean all events

if (Node && Node.prototype.addEventListenerBase == undefined) {
   // IE11 doesn't have EventTarget
   if(typeof EventTarget === 'undefined') {
      var targetPrototype = Node.prototype;
   } else {
      var targetPrototype = EventTarget.prototype;
   }
   targetPrototype.addEventListenerBase = targetPrototype.addEventListener;
   targetPrototype.addEventListener = function(type, listener)
   {
       if(!this.EventList) { this.EventList = []; }
       this.addEventListenerBase.apply(this, arguments);
       if(!this.EventList[type]) { this.EventList[type] = []; }
       var list = this.EventList[type];
       for(var index = 0; index != list.length; index++)
       {
           if(list[index] === listener) { return; }
       }
       list.push(listener);
   };

   targetPrototype.removeEventListenerBase = targetPrototype.removeEventListener;
   targetPrototype.removeEventListener = function(type, listener)
   {
       if(!this.EventList) { this.EventList = []; }
       if(listener instanceof Function) { this.removeEventListenerBase.apply(this, arguments); }
       if(!this.EventList[type]) { return; }
       var list = this.EventList[type];
       for(var index = 0; index != list.length;)
       {
           var item = list[index];
           if(!listener)
           {
               this.removeEventListenerBase(type, item);
               list.splice(index, 1); continue;
           }
           else if(item === listener)
           {
               list.splice(index, 1); break;
           }
           index++;
       }
       if(list.length == 0) { delete this.EventList[type]; }
   };
}

function debounce(fn, threshold, wait) {
   var timeout;
   return function debounced() {
      if (timeout) {
         if(wait) {
            clearTimeout(timeout);
         } else {
            return;
         }
      }
      function delayed() {
         fn();
         timeout = null;
      }
      timeout = setTimeout(delayed, threshold || 100);
   }
}

function addInSet(l, val) {
   // Add val to list l if not already present
   if(l.indexOf(val) == -1) {
      l.push(val);
   }
}

// From w3schools.com
function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "-header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "-header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}


window.iOSDetected = (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) || (navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform));

(function() {
   var detectTouch = null;
   detectTouch = function() {
      window.touchDetected = true;
      window.removeEventListener('touchstart', detectTouch);
      }
   window.addEventListener('touchstart', detectTouch);
})();

/*
    i18n:
        Translations for the various strings in quickAlgo
*/

var localLanguageStrings = {
   fr: {
      categories: {
         actions: "Actions",
         sensors: "Capteurs",
         debug: "Débogage",
         colour: "Couleurs",
         data: "Données",
         dicts: "Dictionnaires",
         input: "Entrées",
         lists: "Listes",
         tables: "Tableaux",
         logic: "Logique",
         loops: "Boucles",
         control: "Contrôles",
         operator: "Opérateurs",
         math: "Maths",
         texts: "Texte",
         variables: "Variables",
         functions: "Fonctions",
         read: "Lecture",
         print: "Écriture",
         internet: "Internet",
         display: "Afficher",
      },
      invalidContent: "Contenu invalide",
      unknownFileType: "Type de fichier non reconnu",
      download: "télécharger",
      smallestOfTwoNumbers: "Plus petit des deux nombres",
      greatestOfTwoNumbers: "Plus grand des deux nombres",
      flagClicked: "Quand %1 cliqué",
      tooManyIterations: "Votre programme met trop de temps à se terminer !",
      tooManyIterationsWithoutAction: "Votre programme s'est exécuté trop longtemps sans effectuer d'action !",
      submitProgram: "Valider le programme",
      runProgram: "Exécuter sur ce test",
      stopProgram: "|<",
      speedSliderSlower: "Slower",
      speedSliderFaster: "Faster",
      speed: "Vitesse :",
      stepProgram: "|>",
      slowSpeed: ">",
      mediumSpeed: ">>",
      fastSpeed: ">>>",
      ludicrousSpeed: ">|",
      stopProgramDesc: "Repartir du début",
      stepProgramDesc: "Exécution pas à pas",
      slowSpeedDesc: "Exécuter sur ce test",
      mediumSpeedDesc: "Vitesse moyenne",
      fastSpeedDesc: "Vitesse rapide",
      ludicrousSpeedDesc: "Vitesse très rapide",
      selectLanguage: "Langage :",
      blocklyLanguage: "Blockly",
      javascriptLanguage: "Javascript",
      importFromBlockly: "Repartir de blockly",
      loadExample: "Insérer l'exemple",
      saveOrLoadButton: "Charger / enregistrer",
      saveOrLoadProgram: "Enregistrer ou recharger votre programme :",
      avoidReloadingOtherTask: "Attention : ne rechargez pas le programme d'un autre sujet !",
      files: "Fichiers",
      reloadProgram: "Recharger",
      restart: "Recommencer",
      loadBestAnswer: "Charger ma meilleure réponse",
      saveProgram: "Enregistrer",
      copy: "Copier",
      paste: "Coller",
      blocklyToPython: "Afficher la traduction en Python",
      blocklyToPythonTitle: "Code Python",
      blocklyToPythonIntro: "Le code ci-dessous est l'équivalent dans le langage Python de votre programme Blockly.",
      blocklyToPythonPassComment: '# Insérer des instructions ici',
      limitBlocks: "{remainingBlocks} blocs restants sur {maxBlocks} autorisés.",
      limitBlocksOver: "{remainingBlocks} blocs en trop utilisés pour {maxBlocks} autorisés.",
      limitElements: "{remainingBlocks} blocs restants sur {maxBlocks} autorisés.",
      limitElementsOver: "{remainingBlocks} blocs en trop utilisés pour {maxBlocks} autorisés.",
      capacityWarning: "Attention : votre programme est invalide car il utilise trop de blocs. Faites attention à la limite de blocs affichée en haut à droite de l'éditeur.",
      clipboardDisallowedBlocks: "Vous ne pouvez pas coller ce programme, car il contient des blocs non autorisés dans cette version.",
      previousTestcase: "Précédent",
      nextTestcase: "Suivant",
      allTests: "Tous les tests : ",
      errorEmptyProgram: "Le programme est vide ! Connectez des blocs.",
      tooManyBlocks: "Vous utilisez trop de blocs !",
      limitedBlock: "Vous utilisez trop souvent un bloc à utilisation limitée :",
      uninitializedVar: "Variable non initialisée :",
      undefinedMsg: "Cela peut venir d'un accès à un indice hors d'une liste, ou d'une variable non définie.",
      valueTrue: 'vrai',
      valueFalse: 'faux',
      evaluatingAnswer: 'Évaluation en cours',
      correctAnswer: 'Réponse correcte',
      partialAnswer: 'Réponse améliorable',
      wrongAnswer: 'Réponse incorrecte',
      resultsNoSuccess: "Vous n'avez validé aucun test.",
      resultsPartialSuccess: "Vous avez validé seulement {nbSuccess} test(s) sur {nbTests}.",
      gradingInProgress: "Évaluation en cours",
      introTitle: "Votre mission",
      introDetailsTitle: "Détails de la mission",
      textVariable: "texte",
      listVariable: "liste",
      scaleDrawing: "Zoom ×2",
      loopRepeat: "repeat",
      loopDo: "do",
      displayVideo: "Afficher la vidéo",
      showDetails: "Plus de détails",
      hideDetails: "Masquer les détails",
      editor: "Éditeur",
      instructions: "Énoncé",
      testLabel: "Test",
      testError: "erreur",
      testSuccess: "validé",
      seeTest: "voir",
      infiniteLoop: "répéter indéfiniment"
   },
   en: {
      categories: {
         actions: "Actions",
         sensors: "Sensors",
         debug: "Debug",
         colour: "Colors",
         data: "Data",
         dicts: "Dictionaries",
         input: "Input",
         lists: "Lists",
         tables: "Tables",
         logic: "Logic",
         loops: "Loops",
         control: "Controls",
         operator: "Operators",
         math: "Math",
         texts: "Text",
         variables: "Variables",
         functions: "Functions",
         read: "Reading",
         print: "Writing",
         display: "Pantalla",
      },
      invalidContent: "Invalid content",
      unknownFileType: "Unrecognized file type",
      download: "download",
      smallestOfTwoNumbers: "Smallest of the two numbers",
      greatestOfTwoNumbers: "Greatest of the two numbers",
      flagClicked: "When %1 clicked",
      tooManyIterations: "Too many iterations!",
      tooManyIterationsWithoutAction: "Too many iterations without action!",
      submitProgram: "Validate this program",
      runProgram: "Run this program",
      stopProgram: "|<",
      speedSliderSlower: "Slower",
      speedSliderFaster: "Faster",
      speed: "Speed:",
      stepProgram: "|>",
      slowSpeed: ">",
      mediumSpeed: ">>",
      fastSpeed: ">>>",
      ludicrousSpeed: ">|",
      stopProgramDesc: "Restart from the beginning",
      stepProgramDesc: "Step-by-step execution",
      slowSpeedDesc: "Execute on this test",
      mediumSpeedDesc: "Average speed",
      fastSpeedDesc: "Fast speed",
      ludicrousSpeedDesc: "Ludicrous speed",
      selectLanguage: "Language :",
      blocklyLanguage: "Blockly",
      javascriptLanguage: "Javascript",
      importFromBlockly: "Generate from blockly",
      loadExample: "Insert example",
      saveOrLoadButton: "Load / save",
      saveOrLoadProgram: "Save or reload your code:",
      avoidReloadingOtherTask: "Warning: do not reload code for another task!",
      files: "Files",
      reloadProgram: "Reload",
      restart: "Restart",
      loadBestAnswer: "Load best answer",
      saveProgram: "Save",
      copy: "Copy",
      paste: "Paste",
      blocklyToPython: "Convert to Python",
      blocklyToPythonTitle: "Python code",
      blocklyToPythonIntro: "",
      blocklyToPythonPassComment: '# Insert instructions here',
      limitBlocks: "{remainingBlocks} blocks remaining out of {maxBlocks} available.",
      limitBlocksOver: "{remainingBlocks} blocks over the limit of {maxBlocks} available.",
      limitElements: "{remainingBlocks} elements remaining out of {maxBlocks} available.",
      limitElementsOver: "{remainingBlocks} elements over the limit of {maxBlocks} available.",
      capacityWarning: "Warning : your program is invalid as it uses too many blocks. Be careful of the block limit displayed on the top right side of the editor.",
      clipboardDisallowedBlocks: "You cannot paste this program, as it contains blocks which aren't allowed in this version.",
      previousTestcase: "Previous",
      nextTestcase: "Next",
      allTests: "All tests: ",
      errorEmptyProgram: "Le programme est vide ! Connectez des blocs.",
      tooManyBlocks: "You use too many blocks!",
      limitedBlock: "You use too many of a limited use block:",
      uninitializedVar: "Uninitialized variable:",
      undefinedMsg: "This can be because of an access to an index out of a list, or an undefined variable.",
      valueTrue: 'true',
      valueFalse: 'false',
      evaluatingAnswer: 'Evaluation in progress',
      correctAnswer: 'Correct answer',
      partialAnswer: 'Partial answer',
      wrongAnswer: 'Wrong answer',
      resultsNoSuccess: "You passed none of the tests.",
      resultsPartialSuccess: "You passed only {nbSuccess} test(s) of {nbTests}.",
      gradingInProgress: "Grading in process",
      introTitle: "Your mission",
      introDetailsTitle: "Mission details",
      textVariable: "text",
      listVariable: "list",
      scaleDrawing: "Scale 2×",
      loopRepeat: "repeat",
      loopDo: "do",
      displayVideo: "Display video",
      showDetails: "Show details",
      hideDetails: "Hide details",
      editor: "Editor",
      instructions: "Instructions",
      testLabel: "Test",
      testError: "error",
      testSuccess: "valid",
      seeTest: "see test"
   },
   de: {
      categories: {
         actions: "Aktionen",
         sensors: "Sensoren",
         debug: "Debug",
         colour: "Farben",
         data: "Daten", // TODO :: translate
         dicts: "Hash-Map",
         input: "Eingabe",
         lists: "Listen",
         tables: "Tables", // TODO :: translate
         logic: "Logik",
         loops: "Schleifen",
         control: "Steuerung",
         operator: "Operatoren",
         math: "Mathe",
         texts: "Text",
         variables: "Variablen",
         functions: "Funktionen",
         read: "Einlesen",
         print: "Ausgeben",
         manipulate: "Umwandeln",
      },
      invalidContent: "Ungültiger Inhalt",
      unknownFileType: "Ungültiger Datentyp",
      download: "Herunterladen",
      smallestOfTwoNumbers: "Kleinere von zwei Zahlen",
      greatestOfTwoNumbers: "Größere von zwei Zahlen",
      flagClicked: "Sobald %1 geklickt", // (scratch start flag, %1 is the flag icon)
      tooManyIterations: "Zu viele Anweisungen wurden ausgeführt!",
      tooManyIterationsWithoutAction: "Zu viele Anweisungen ohne eine Aktion wurden ausgeführt!",
      submitProgram: "Speichern, ausführen und bewerten",
      runProgram: "Testen",
      stopProgram: "|<",
      speedSliderSlower: "Slower",
      speedSliderFaster: "Faster",
      speed: "Ablaufgeschwindigkeit:",
      stepProgram: "|>",
      slowSpeed: ">",
      mediumSpeed: ">>",
      fastSpeed: ">>>",
      ludicrousSpeed: ">|",
      stopProgramDesc: "Von vorne anfangen", // TODO :: translate and next 5
      stepProgramDesc: "Schritt für Schritt",
      slowSpeedDesc: "Für diesen Test ausführen",
      mediumSpeedDesc: "Mittlere Geschwindigkeit",
      fastSpeedDesc: "Schnell",
      ludicrousSpeedDesc: "Sehr schnell",
      selectLanguage: "Sprache:",
      blocklyLanguage: "Blockly",
      javascriptLanguage: "Javascript",
      importFromBlockly: "Generiere von Blockly-Blöcken",
      loadExample: "Insert example", // TODO :: translate
      saveOrLoadButton: "Load / save", // TODO :: translate
      saveOrLoadProgram: "Speicher oder lade deinen Quelltext:",
      avoidReloadingOtherTask: "Warnung: Lade keinen Quelltext von einer anderen Aufgabe!",
      files: "Dateien",
      reloadProgram: "Laden",
      restart: "Restart",  // TODO :: translate
      loadBestAnswer: "Load best answer",  // TODO :: translate
      saveProgram: "Speichern",
      copy: "Copy", // TODO :: translate
      paste: "Paste",
      blocklyToPython: "Convert to Python",
      blocklyToPythonTitle: "Python code",
      blocklyToPythonIntro: "",
      blocklyToPythonPassComment: '# Insert instructions here',
      limitBlocks: "Noch {remainingBlocks} von {maxBlocks} Bausteinen verfügbar.",
      limitBlocksOver: "{remainingBlocks} Bausteine zusätzlich zum Limit von {maxBlocks} verbraucht.", // TODO :: stimmt das?
      limitElements: "Noch {remainingBlocks} von {maxBlocks} Bausteinen verfügbar.", // TODO :: check this one and next one (same strings as above but with "elements" instead of "blocks"
      limitElementsOver: "{remainingBlocks} Bausteine zusätzlich zum Limit von {maxBlocks} verbraucht.",
      capacityWarning: "Warning : your program is invalid as it uses too many blocks. Be careful of the block limit displayed on the top right side of the editor.",  // TODO :: translate
      clipboardDisallowedBlocks: "You cannot paste this program, as it contains blocks which aren't allowed in this version.", // TODO :: translate
      previousTestcase: " < ",
      nextTestcase: " > ",
      allTests: "Alle Testfälle: ",
      errorEmptyProgram: "Das Programm enthält keine Befehle. Verbinde die Blöcke um ein Programm zu schreiben.",
      tooManyBlocks: "Du benutzt zu viele Bausteine!",
      limitedBlock: "You use too many of a limited use block:", // TODO
      uninitializedVar: "Nicht initialisierte Variable:",
      undefinedMsg: "This can be because of an access to an index out of a list, or an undefined variable.", // TODO :: translate
      valueTrue: 'wahr',
      valueFalse: 'unwahr',
      evaluatingAnswer: 'Evaluation in progress', // TODO
      correctAnswer: 'Richtige Antwort',
      partialAnswer: 'Teilweise richtige Antwort',
      wrongAnswer: 'Falsche Antwort',
      resultsNoSuccess: "Du hast keinen Testfall richtig.",
      resultsPartialSuccess: "Du hast {nbSuccess} von {nbTests} Testfällen richtig.",
      gradingInProgress: "Das Ergebnis wird ausgewertet …",
      introTitle: "Your mission",  // TODO :: translate
      introDetailsTitle: "Mission details",  // TODO :: translate
      textVariable: "Text",
      listVariable: "Liste",
      scaleDrawing: "Scale 2×",
      loopRepeat: "wiederhole",
      loopDo: "mache",
      displayVideo: "Display video", // TODO :: translate
      showDetails: "Show details", // TODO :: translate
      hideDetails: "Hide details",  // TODO :: translate
      editor: "Editor",  // TODO :: translate
      instructions: "Instructions",  // TODO :: translate
      testLabel: "Test", // TODO :: translate
      testError: "error",  // TODO :: translate
      testSuccess: "valid",  // TODO :: translate
      seeTest: "see test"  // TODO :: translate
   },
   es: {
      categories: {
         actions: "Acciones",
         sensors: "Sensores",
         debug: "Depurar",
         colour: "Colores",
         data: "Datos",
         dicts: "Diccionarios",
         input: "Entradas",
         lists: "Listas",
         tables: "Tablas",
         logic: "Lógica",
         loops: "Bucles",
         control: "Control",
         operator: "Operadores",
         math: "Mate",
         text: "Texto",
         variables: "Variables",
         functions: "Funciones",
         read: "Lectura",
         print: "Escritura"
      },
      invalidContent: "Contenido inválido",
      unknownFileType: "Tipo de archivo no reconocido",
      download: "descargar",
      smallestOfTwoNumbers: "El menor de dos números",
      greatestOfTwoNumbers: "El mayor de dos números",
      flagClicked: "Cuando se hace click en %1",
      tooManyIterations: "¡Su programa se tomó demasiado tiempo para terminar!",
      tooManyIterationsWithoutAction: "¡Su programa se tomó demasiado tiempo para terminar!", // TODO :: change translation
      submitProgram: "Validar el programa",
      runProgram: "Ejecutar el programa",
      speedSliderSlower: "Más lento",
      speedSliderFaster: "Más rápido",
      speed: "Velocidad:",
      stopProgram: "|<",
      stepProgram: "|>",
      slowSpeed: ">",
      mediumSpeed: ">>",
      fastSpeed: ">>>",
      ludicrousSpeed: ">|",
      stopProgramDesc: "Reiniciar desde el principio",
      stepProgramDesc: "Ejecución paso a paso",
      slowSpeedDesc: "Ejecutar en esta prueba",
      mediumSpeedDesc: "Velocidad media",
      fastSpeedDesc: "Velocidad rápida",
      ludicrousSpeedDesc: "Velocidad muy rápida",
      selectLanguage: "Lenguaje:",
      blocklyLanguage: "Blockly",
      javascriptLanguage: "Javascript",
      importFromBlockly: "Generar desde blockly",
      loadExample: "Cargar el ejemplo",
      saveOrLoadButton: "Cargar / Guardar",
      saveOrLoadProgram: "Guardar o cargar su programa:",
      avoidReloadingOtherTask: "Atención: ¡no recargue el programa de otro problema!",
      files: "Archivos",
      reloadProgram: "Recargar",
      restart: "Reiniciar",
      loadBestAnswer: "Cargar la mejor respuesta",
      saveProgram: "Guardar",
      copy: "Copy", // TODO :: translate
      paste: "Paste",
      blocklyToPython: "Convert to Python",
      blocklyToPythonTitle: "Python code",
      blocklyToPythonIntro: "",
      blocklyToPythonPassComment: '# Insert instructions here',
      limitBlocks: "{remainingBlocks} bloques disponibles de {maxBlocks} autorizados.",
      limitBlocksOver: "{remainingBlocks} bloques sobre el límite de {maxBlocks} autorizados.",
      limitElements: "{remainingBlocks} elementos disponibles de {maxBlocks} autorizados.",
      limitElementsOver: "{remainingBlocks} elementos sobre el límite de {maxBlocks} autorizados.",
      capacityWarning: "Advertencia: tu programa está inválido porque ha utilizado demasiados bloques. Pon atención al límite de bloques permitidos mostrados en la parte superior derecha del editor.",
      clipboardDisallowedBlocks: "You cannot paste this program, as it contains blocks which aren't allowed in this version.", // TODO :: translate
      previousTestcase: "Anterior",
      nextTestcase: "Siguiente",
      allTests: "Todas las pruebas:",
      errorEmptyProgram: "¡El programa está vacio! Conecta algunos bloques.",
      tooManyBlocks: "¡Utiliza demasiados bloques!",
      limitedBlock: "Utiliza demasiadas veces un tipo de bloque limitado:",
      uninitializedVar: "Variable no inicializada:",
      undefinedMsg: "Esto puede ser causado por acceder a un índice fuera de la lista o por una variable no definida.",
      valueTrue: 'verdadero',
      valueFalse: 'falso',
      evaluatingAnswer: 'Evaluación en progreso',
      correctAnswer: 'Respuesta correcta',
      partialAnswer: 'Respuesta parcial',
      wrongAnswer: 'Respuesta Incorrecta',
      resultsNoSuccess: "No pasó ninguna prueba.",
      resultsPartialSuccess: "Pasó únicamente {nbSuccess} prueba(s) de {nbTests}.",
      gradingInProgress: "Evaluación en curso",
      introTitle: "Su misión",
      introDetailsTitle: "Detalles de la misión",
      textVariable: "texto",
      listVariable: "lista",
      scaleDrawing: "Aumentar 2X",
      loopRepeat: "repetir",
      loopDo: "hacer",
      displayVideo: "Mostrar el video",
      showDetails: "Mostrar más información",
      hideDetails: "Ocultar información",
      editor: "Editor",
      instructions: "Enunciado",
      testLabel: "Caso",
      testError: "error",
      testSuccess: "correcto",
      seeTest: "ver"
   },
   sl: {
      categories: {
         actions: "Dejanja",
         sensors: "Senzorji",
         debug: "Razhroščevanje",
         colour: "Barve",
         dicts: "Slovarji",
         input: "Vnos",
         lists: "Seznami",
         tables: "Tabele",
         logic: "Logika",
         loops: "Zanke",
         control: "Nadzor",
         operator: "Operatorji",
         math: "Matematika",
         texts: "Besedilo",
         variables: "Spremenljivke",
         functions: "Funkcije",
         read: "Branje",
         print: "Pisanje",
         turtle: "Želva"
      },
      invalidContent: "Neveljavna vsebina",
      unknownFileType: "Neznana vrsta datoteke",
      download: "prenos",
      smallestOfTwoNumbers: "Manjše od dveh števil",
      greatestOfTwoNumbers: "Večje od dveh števil",
      flagClicked: "Ko je kliknjena %1",
      tooManyIterations: "Preveč ponovitev!",
      tooManyIterationsWithoutAction: "Preveč ponovitev brez dejanja!",
      submitProgram: "Oddaj program",
      runProgram: "Poženi program",
      stopProgram: "|<",
      speedSliderSlower: "Slower",
      speedSliderFaster: "Faster",
      speed: "Hitrost:",
      stepProgram: "|>",
      slowSpeed: ">",
      mediumSpeed: ">>",
      fastSpeed: ">>>",
      ludicrousSpeed: ">|",
      stopProgramDesc: "Začni znova",
      stepProgramDesc: "Izvajanje po korakih",
      slowSpeedDesc: "Počasi",
      mediumSpeedDesc: "Običajno hitro",
      fastSpeedDesc: "Hitro",
      ludicrousSpeedDesc: "Nesmiselno hitro",
      selectLanguage: "Jezik:",
      blocklyLanguage: "Blockly",
      javascriptLanguage: "Javascript",
      importFromBlockly: "Ustvari iz Blocklyja",
      loadExample: "Naloži primer",
      saveOrLoadButton: "Naloži / Shrani",
      saveOrLoadProgram: "Shrani ali znova naloži kodo:",
      avoidReloadingOtherTask: "Opozorilo: Za drugo nalogo ne naloži kode znova!",
      files: "Datoteke",
      reloadProgram: "Znova naloži",
      restart: "Ponastavi",
      loadBestAnswer: "Naloži najboljši odgovor",
      saveProgram: "Shrani",
      copy: "Copy", // TODO :: translate
      paste: "Paste",
      blocklyToPython: "Convert to Python",
      blocklyToPythonTitle: "Python code",
      blocklyToPythonIntro: "",
      blocklyToPythonPassComment: '# Insert instructions here',
      limitBlocks: "Delčkov na voljo: {remainingBlocks}",
      limitBlocksOver: "{remainingBlocks} delčkov preko meje {maxBlocks}",
      limitElements: "{remainingBlocks} elementov izmed {maxBlocks} imaš še na voljo.",
      limitElementsOver: "{remainingBlocks} elementov preko meje {maxBlocks} elementov, ki so na voljo.",
      capacityWarning: "Opozorilo : program je rešen narobe, uporablja preveliko število delčkov. Bodi pozoren na število delčkov, ki jih lahko uporabiš, informacijo o tem imaš zgoraj.",
      clipboardDisallowedBlocks: "You cannot paste this program, as it contains blocks which aren't allowed in this version.", // TODO :: translate
      previousTestcase: "Nazaj",
      nextTestcase: "Naprej",
      allTests: "Vsi testi: ",
      errorEmptyProgram: "Program je prazen! Poveži delčke.",
      tooManyBlocks: "Uporabljaš preveč delčkov!",
      limitedBlock: "Uporabljaš preveliko število omejeneg števila blokov:",
      uninitializedVar: "Spremenljivka ni določena:",
      undefinedMsg: "Do napake lahko pride, ker je indeks prevelik, ali pa spremenljivka ni definirana.",
      valueTrue: 'resnično',
      valueFalse: 'neresnično',
      evaluatingAnswer: 'Proces preverjanja',
      correctAnswer: 'Pravilni odgovor',
      partialAnswer: 'Delni odgovor',
      wrongAnswer: 'Napačen odgovor',
      resultsNoSuccess: "Noben test ni bil opravljen.",
      resultsPartialSuccess: "Opravljen(ih) {nbSuccess} test(ov) od {nbTests}.",
      gradingInProgress: "Ocenjevanje poteka",
      introTitle: "Naloga",  
      introDetailsTitle: "Podrobnosti naloge",
      textVariable: "besedilo",
      listVariable: "tabela",
      scaleDrawing: "Približaj ×2",
      loopRepeat: "repeat",
      loopDo: "do",
      displayVideo: "Prikaži video",
      showDetails: "Prikaži podrobnosti",
      hideDetails: "Skrij podrobnosti",
      editor: "Urednik",
      instructions: "Navodila",
      testLabel: "Test",
      testError: "napaka",
      testSuccess: "pravilno",
      seeTest: "poglej test"
   }
};


window.stringsLanguage = window.stringsLanguage || "fr";
window.languageStrings = window.languageStrings || {};

if (typeof window.languageStrings != "object") {
   console.error("window.languageStrings is not an object");
}
else { // merge translations
   $.extend(true, window.languageStrings, localLanguageStrings[window.stringsLanguage]);
}

/*
    interface:
        Main interface for quickAlgo, common to all languages.
*/

var quickAlgoInterface = {
   strings: {},
   nbTestCases: 0,
   delayFactory: new DelayFactory(),

   loadInterface: function(context) {
      // Load quickAlgo interface into the DOM
      this.context = context;
      this.strings = window.languageStrings;

      var gridHtml = "<center>";
      gridHtml += "<div id='gridButtonsBefore'></div>";
      gridHtml += "<div id='grid'></div>";
      gridHtml += "<div id='gridButtonsAfter'></div>";
      gridHtml += "</center>";
      $("#gridContainer").html(gridHtml)

      $("#blocklyLibContent").html(
         "<div id='editorBar'>" +
         "  <div id='editorButtons'></div>" +
         "  <div id='capacity'></div>" +
         "</div>" +
         "<div id='languageInterface'></div>" +
         "<div id='saveOrLoadModal' class='modalWrapper'></div>\n");

      // Upper right load buttons
      $("#editorButtons").html(
         "<button type='button' id='displayHelpBtn' class='btn btn-xs btn-default' style='display: none;' onclick='conceptViewer.show()'>" +
         "?" +
         "</button>&nbsp;" +
         "<button type='button' id='loadExampleBtn' class='btn btn-xs btn-default' style='display: none;' onclick='task.displayedSubTask.loadExample()'>" +
         this.strings.loadExample +
         "</button>&nbsp;" +
         "<button type='button' id='saveOrLoadBtn' class='btn btn-xs btn-default' onclick='quickAlgoInterface.saveOrLoad()'>" +
         this.strings.saveOrLoadButton +
         "</button>");

      var saveOrLoadModal = "<div class='modal'>" +
                            "    <p><b>" + this.strings.saveOrLoadProgram + "</b></p>\n" +
                            "    <button type='button' class='btn' onclick='task.displayedSubTask.blocklyHelper.saveProgram()' >" + this.strings.saveProgram +
                            "</button><span id='saveUrl'></span>\n" +
                            "    <p>" + this.strings.avoidReloadingOtherTask + "</p>\n" +
                            "    <p>" + this.strings.reloadProgram + " <input type='file' id='input' " +
                            "onchange='task.displayedSubTask.blocklyHelper.handleFiles(this.files);resetFormElement($(\"#input\"))'></p>\n" +
                            "    <button type='button' class='btn close' onclick='closeModal(`saveOrLoadModal`)' >x</button>"
                            "</div>";
      $("#saveOrLoadModal").html(saveOrLoadModal);

      // Buttons from buttonsAndMessages
      var addTaskHTML = '<div id="displayHelperAnswering" class="contentCentered" style="padding: 1px;">';
      var placementNames = ['graderMessage', 'validate', 'saved'];
      for (var iPlacement = 0; iPlacement < placementNames.length; iPlacement++) {
         var placement = 'displayHelper_' + placementNames[iPlacement];
         if ($('#' + placement).length === 0) {
            addTaskHTML += '<div id="' + placement + '"></div>';
         }
      }
      addTaskHTML += '</div>';
      if(!$('#displayHelper_cancel').length) {
         $('body').append($('<div class="contentCentered" style="margin-top: 15px;"><div id="displayHelper_cancel"></div></div>'));
      }

      var scaleControl = '';
      if(context.display && context.infos.buttonScaleDrawing) {
        var scaleControl = '<div class="scaleDrawingControl">' +
            '<label for="scaleDrawing"><input id="scaleDrawing" type="checkbox">' +
            this.strings.scaleDrawing +
            '</label>' +
            '</div>';
      }

      var gridButtonsAfter = scaleControl
        + "<div id='testSelector'></div>";
      if(!this.context || !this.context.infos || !this.context.infos.hideValidate) {
         gridButtonsAfter += ''
            + "<button type='button' id='submitBtn' class='btn btn-primary' onclick='task.displayedSubTask.submit()'>"
            + this.strings.submitProgram
            + "</button><br/>";
      }
      gridButtonsAfter += "<div id='messages'><span id='tooltip'></span><span id='errors'></span></div>" + addTaskHTML;
      $("#gridButtonsAfter").html(gridButtonsAfter);
      $('#scaleDrawing').change(this.onScaleDrawingChange.bind(this));
   },

   bindBlocklyHelper: function(blocklyHelper) {
      this.blocklyHelper = blocklyHelper;
   },

   setOptions: function(opt) {
      // Load options from the task
      var hideControls = opt.hideControls ? opt.hideControls : {};
      $('#saveOrLoadBtn').toggle(!hideControls.saveOrLoad);
      $('#loadExampleBtn').toggle(!!opt.hasExample);
      if(opt.conceptViewer) {
         conceptViewer.load(opt.conceptViewerLang);
         $('#displayHelpBtn').show();
      } else {
         $('#displayHelpBtn').hide();
      }
   },

   appendTaskIntro: function(html) {
      $('#taskIntro').append(html);
   },

   toggleLongIntro: function(forceNewState) {
      // For compatibility with new interface
   },

   onScaleDrawingChange: function(e) {
      var scaled = $(e.target).prop('checked');
      $("#gridContainer").toggleClass('gridContainerScaled', scaled);
      $("#blocklyLibContent").toggleClass('blocklyLibContentScaled', scaled);
      this.context.setScale(scaled ? 2 : 1);
   },

   onEditorChange: function() {},
   onResize: function() {},
   updateBestAnswerStatus: function() {},

   blinkRemaining: function(times, red) {
      var capacity = $('#capacity');
      if(times % 2 == 0) {
         capacity.removeClass('capacityRed');
      } else {
         capacity.addClass('capacityRed');
      }
      this.delayFactory.destroy('blinkRemaining');
      if(times > (red ? 1 : 0)) {
         var that = this;
         this.delayFactory.createTimeout('blinkRemaining', function() { that.blinkRemaining(times - 1, red); }, 400);
      }
   },

   displayCapacity: function(info) {
      $('#capacity').html(info.text ? info.text : '');
      if(info.invalid) {
         this.blinkRemaining(11, true);
      } else if(info.warning) {
         this.blinkRemaining(6);
      } else {
         this.blinkRemaining(0);
      }
   },


   initTestSelector: function (nbTestCases) {
      // Create the DOM for the tests display (typically on the left side)
      this.nbTestCases = nbTestCases;

      var buttons = [
         {cls: 'speedStop', label: this.strings.stopProgram, tooltip: this.strings.stopProgramDesc, onclick: 'task.displayedSubTask.stop()'},
         {cls: 'speedStep', label: this.strings.stepProgram, tooltip: this.strings.stepProgramDesc, onclick: 'task.displayedSubTask.step()'},
         {cls: 'speedSlow', label: this.strings.slowSpeed, tooltip: this.strings.slowSpeedDesc, onclick: 'task.displayedSubTask.changeSpeed(200)'},
         {cls: 'speedMedium', label: this.strings.mediumSpeed, tooltip: this.strings.mediumSpeedDesc, onclick: 'task.displayedSubTask.changeSpeed(50)'},
         {cls: 'speedFast', label: this.strings.fastSpeed, tooltip: this.strings.fastSpeedDesc, onclick: 'task.displayedSubTask.changeSpeed(5)'},
         {cls: 'speedLudicrous', label: this.strings.ludicrousSpeed, tooltip: this.strings.ludicrousSpeedDesc, onclick: 'task.displayedSubTask.changeSpeed(0)'}
      ];

      var selectSpeed = "<div class='selectSpeed'>" +
                        "  <div class='btn-group'>\n";
      for(var btnIdx = 0; btnIdx < buttons.length; btnIdx++) {
         var btn = buttons[btnIdx];
         selectSpeed += "    <button type='button' class='"+btn.cls+" btn btn-default btn-icon'>"+btn.label+" </button>\n";
      }
      selectSpeed += "  </div></div>";

      var html = '<div class="panel-group">';
      for(var iTest=0; iTest<this.nbTestCases; iTest++) {
         html += '<div id="testPanel'+iTest+'" class="panel panel-default">';
         if(this.nbTestCases > 1) {
            html += '  <div class="panel-heading" onclick="task.displayedSubTask.changeTestTo('+iTest+')"><h4 class="panel-title"></h4></div>';
         }
         html += '  <div class="panel-body">'
              + selectSpeed
              +  '  </div>'
              +  '</div>';
      }
      $('#testSelector').html(html);

      var selectSpeedClickHandler = function () {
         var thisBtn = $(this);
         for(var btnIdx = 0; btnIdx < buttons.length; btnIdx++) {
            var btnInfo = buttons[btnIdx];
            if(thisBtn.hasClass(btnInfo.cls)) {
               $('#tooltip').html(btnInfo.tooltip + '<br>');
               eval(btnInfo.onclick);
               break;
            }
         }
      }
      var selectSpeedHoverHandler = function () {
         var thisBtn = $(this);
         for(var btnIdx = 0; btnIdx < buttons.length; btnIdx++) {
            var btnInfo = buttons[btnIdx];
            if(thisBtn.hasClass(btnInfo.cls)) {
               $('#tooltip').html(btnInfo.tooltip + '<br>');
               break;
            }
         }
      };
      var selectSpeedHoverClear = function () {
         // Only clear #tooltip if the tooltip was for this button
         var thisBtn = $(this);
         for(var btnIdx = 0; btnIdx < buttons.length; btnIdx++) {
            var btnInfo = buttons[btnIdx];
            if(thisBtn.hasClass(btnInfo.cls)) {
               if($('#tooltip').html() == btnInfo.tooltip + '<br>') {
                  $('#tooltip').html('');
               }
               break;
            }
         }
      };

      // TODO :: better display functions for #errors
      $('.selectSpeed button').click(selectSpeedClickHandler);
      $('.selectSpeed button').hover(selectSpeedHoverHandler, selectSpeedHoverClear);


      this.updateTestSelector(0);
      this.resetTestScores();
   },

   updateTestScores: function (testScores) {
      // Display test results
      for(var iTest=0; iTest<testScores.length; iTest++) {
         if(!testScores[iTest]) { continue; }
         if(testScores[iTest].successRate >= 1) {
            var icon = '<span class="testResultIcon" style="color: green">✔</span>';
            var label = '<span class="testResult testSuccess">'+this.strings.correctAnswer+'</span>';
         } else if(testScores[iTest].successRate > 0) {
            var icon = '<span class="testResultIcon" style="color: orange">✖</span>';
            var label = '<span class="testResult testPartial">'+this.strings.partialAnswer+'</span>';
         } else {
            var icon = '<span class="testResultIcon" style="color: red">✖</span>';
            var label = '<span class="testResult testFailure">'+this.strings.wrongAnswer+'</span>';
         }
         $('#testPanel'+iTest+' .panel-title').html(icon+' Test '+(iTest+1)+' '+label);
      }
   },

   resetTestScores: function () {
      // Reset test results display
      for(var iTest=0; iTest<this.nbTestCases; iTest++) {
         $('#testPanel'+iTest+' .panel-title').html('<span class="testResultIcon">&nbsp;</span> Test '+(iTest+1));
      }
   },

   updateTestSelector: function (newCurTest) {
      $("#testSelector .panel-body").hide();
      $("#testSelector .panel").removeClass('currentTest');
      $("#testPanel"+newCurTest).addClass('currentTest');
      $("#testPanel"+newCurTest+" .panel-body").prepend($('#grid')).append($('#messages')).show();
   },

   unloadLevel: function() {
      // Called when level is unloaded
      this.resetTestScores();
   },

   saveOrLoad: function () {
      $("#saveOrLoadModal").show();
   },

   displayError: function(message) {
      message ? $('#errors').html(message) : $('#errors').empty();
   },

   displayResults: function(mainResults, worstResults) {
      this.displayError('<span class="testError">'+mainResults.message+'</span>');
   },

   setPlayPause: function(isPlaying) {}, // Does nothing

   exportCurrentAsPng: function(name) {
      if(typeof window.saveSvgAsPng == 'undefined') {
         throw "Unable to export without save-svg-as-png. Please add 'save-svg-as-png' to the importModules statement.";
      }
      if(!name) { name = 'export.png'; }
      var svgBbox = $('#blocklyDiv svg')[0].getBoundingClientRect();
      var blocksBbox = $('#blocklyDiv svg > .blocklyWorkspace > .blocklyBlockCanvas')[0].getBoundingClientRect();
      var svg = $('#blocklyDiv svg').clone();
      svg.find('.blocklyFlyout, .blocklyMainBackground, .blocklyTrash, .blocklyBubbleCanvas, .blocklyScrollbarVertical, .blocklyScrollbarHorizontal, .blocklyScrollbarBackground').remove();
      var options = {
         backgroundColor: '#FFFFFF',
         top: blocksBbox.top - svgBbox.top - 4,
         left: blocksBbox.left - svgBbox.left - 4,
         width: blocksBbox.width + 8,
         height: blocksBbox.height + 8
         };
      window.saveSvgAsPng(svg[0], name, options);
   },

   updateControlsDisplay: function() {}
};

/*
    python_interface:
        Python mode interface and running logic.
*/

function LogicController(nbTestCases, maxInstructions) {
  /**
   * Class properties
   */
  this._nbTestCases = nbTestCases;
  this._maxInstructions = maxInstructions || null;
  this.language = 'python';
  this._textFile = null;
  this._extended = false;
  this.programs = [{
    blockly: null,
    blocklyJS: null,
    javascript: null
  }];
  this._aceEditor = null;
  this._workspace = null;
  this._prevWidth = 0;
  this._startingBlock = true;
  this._visible = true;
  this._strings = window.languageStrings;
  this._options = {};
  this._readOnly = false;
  this.includeBlocks = null;

  /** @type {React.Component|null} */
  this.analysisComponent = null;

  this.loadContext = function (mainContext) {
    this._mainContext = mainContext;
  }

  this.savePrograms = function () {
    if(this._aceEditor) {
      this.programs[0].blockly = this._aceEditor.getValue();
    }
  };

  this.loadPrograms = function () {
    if(this._aceEditor && this.programs[0].blockly) {
      this._aceEditor.setValue(''+this.programs[0].blockly);
      this._aceEditor.selection.clearSelection();
    }
  };

  this.loadExample = function (example) {
    if(!example.python) { return; }
    this._aceEditor.setValue('' + example.python + '\n\n' + this._aceEditor.getValue());
    var Range = ace.require('ace/range').Range;
    this._aceEditor.selection.setRange(new Range(0, 0, example.python.split(/\r\n|\r|\n/).length, 0));
  };

  this.switchLanguage = function (e) {
    this.language = e.value;
  };

  this.load = function (language, display, nbTestCases, options) {
    if (this.skulptAnalysisEnabled() && !this.skulptAnalysisShouldByEnabled()) {
      console.log('Module "python-analysis" is loaded but not used.');
    }

    this._nbTestCases = nbTestCases;
    this._options = options;
    this._loadBasicEditor();

    if(this._aceEditor && ! this._aceEditor.getValue()) {
      if(options.defaultCode !== undefined)
         this._aceEditor.setValue(options.defaultCode);
      else
         this._aceEditor.setValue(this.getDefaultContent());
    }
  };

  this.unload = function () {
    this.stop();
    this._unbindEditorEvents();
  };

  this.unloadLevel = this.unload;

  this.getCodeFromXml = function (code, lang) {
    // TODO :: rename
    return code;
  };

  this.getFullCode = function (code) {
    // TODO :: simplify
    return code;
  }

  this.getCode = function(language) {

    if (language == "python")
      return this._aceEditor.getValue();
    return "";
  }

  this.checkCode = function(code, display) {
    // Check a code before validation; display is a function which will get
    // error messages
    var forbidden = pythonForbidden(code, this.includeBlocks);
    if(!display) {
       display = function() {};
    }

    if(forbidden) {
      display("Le mot-clé "+forbidden+" est interdit ici !");
      return false;
    }
    if(maxInstructions && pythonCount(code) > maxInstructions) {
      display("Vous utilisez trop d'éléments Python !");
      return false;
    }
    var limited = this.findLimited(code);
    if(limited) {
      display('Vous utilisez trop souvent un mot-clé à utilisation limitée : "'+limited+'".');
    }
    if(pythonCount(code) <= 0) {
      display("Vous ne pouvez pas valider un programme vide !");
      return false;
    }
    var availableModules = this.getAvailableModules();
    for(var i=0; i < availableModules.length; i++) {
      var match = new RegExp('from\\s+' + availableModules[i] + '\\s+import\\s+\\*');
      match = match.exec(code);
      if(match === null) {
        display("Vous devez mettre la ligne <code>from " + availableModules[i] + " import *</code> dans votre programme.");
        return false;
      }
    }

    // Check for functions used as values
    var re = /def\W+([^(]+)\(/g;
    var foundFuncs = this._mainContext && this._mainContext.runner ? this._mainContext.runner.getDefinedFunctions() : [];
    var match;
    while(match = re.exec(code)) {
       foundFuncs.push(match[1]);
    }
    for(var j=0; j<foundFuncs.length; j++) {
       var re = new RegExp('\\W' + foundFuncs[j] + '([^A-Za-z0-9_(]|$)');
       if(re.exec(code)) {
          display("Vous utilisez un nom de fonction sans les parenthèses. Ajoutez les parenthèses pour appeler la fonction.");
          return false;
       }
    }
    return true;
  }

  this.getDefaultContent = function () {
    if(this._options.startingExample && this._options.startingExample.python) {
      return this._options.startingExample.python;
    }
    var availableModules = this.getAvailableModules();
    var content = '';
    for(var i=0; i < availableModules.length; i++) {
      content += 'from ' + availableModules[i] + ' import *\n';
    }
    return content;
  };

  /**
   * Code running specific operations
   */
  this.stopAndTryAgain = function () {
    this.stop();
    window.setTimeout(this.run.bind(this), 100);
  };

  this.getLanguage = function () {
    return this.language;
  };

  this.prepareRun = function () {
    if (!this._mainContext) { return; }

    var nbRunning = this._mainContext.runner.nbRunning();
    if (nbRunning > 0) {
      this.stopAndTryAgain();
      return undefined;
    }

    // Get code
    this.savePrograms();
    var codes = [];
    codes.push(this.programs[0].blockly);
    var code = codes[0];

    // Abort if code is not valid
    if(!this.checkCode(code, function(err) {
      if(window.quickAlgoInterface) {
        window.quickAlgoInterface.displayError(err);
        window.quickAlgoInterface.setPlayPause(false);
      } else {
        $('#errors').html(err);
      }
    })) {
       return;
    }

    // Initialize runner
    this._mainContext.runner.initCodes(codes);

    if (this.skulptAnalysisEnabled()) {
      this.loadSkulptAnalysis();
    }
  };

  this.run = function () {
    this.prepareRun();
    this._mainContext.runner.run();
  };

  this.step = function () {
    var self = this;

    if(!this._mainContext.runner._isRunning) {
      this.prepareRun();
    }

    this._mainContext.runner.runStep(function() {
      // After the step is complete.
      if (self.skulptAnalysisEnabled() && self.analysisComponent) {
        // Compute and update the internal analysis.
        var skulptSuspensions = self._mainContext.runner._debugger.suspension_stack;
        var oldAnalysis = self.analysisComponent.props.analysis;

        self.analysisComponent.props.analysis = analyseSkulptState(skulptSuspensions, oldAnalysis);

        self.analysisComponent.forceUpdate();
      }
    });
  };

  this.stop = function () {
    if(this._mainContext.runner) {
      this._mainContext.runner.stop();
    }
  }

  /**
   *  IO specific operations
   */
  this.handleFiles = function (files) {
    var that = this;
    if (files.length < 0) {
      return;
    }
    var file = files[0];
    var textType = /text.*/;
    if (file.type.match(textType)) {
      var reader = new FileReader();

      reader.onload = function (e) {
        var code = reader.result;
        if (code[0] == "<") {
          try {
            var xml = Blockly.Xml.textToDom(code);
            that.programs[0][that.player].blockly = code;
          } catch (e) {

            if(window.quickAlgoInterface) {
              window.quickAlgoInterface.displayError(that._strings.invalidContent);
            } else {
              $("#errors").html(that._strings.invalidContent);
            }
          }
        } else {
          that.programs[0].blockly = code;
        }
        that.loadPrograms();
      };

      reader.readAsText(file);
    } else {

      if(window.quickAlgoInterface) {
        window.quickAlgoInterface.displayError(this._strings.unknownFileType);
      } else {
        $("#errors").html(this._strings.unknownFileType);
      }
    }
  };
  this.saveProgram = function () {
    this.savePrograms();
    var code = this.programs[0].blockly;
    var data = new Blob([code], { type: 'text/plain' });

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (this.textFile !== null) {
      window.URL.revokeObjectURL(this.textFile);
    }

    this.textFile = window.URL.createObjectURL(data);

    // returns a URL you can use as a href
    $("#saveUrl").html("<a id='downloadAnchor' href='" + this.textFile + "' download='robot_python_program.txt'>" + this._strings.download + "</a>");
    var downloadAnchor = document.getElementById('downloadAnchor');
    downloadAnchor.click();
    return this.textFile;
  };

  /**
   * Getters & Setters
   */
  this.setLocalization = function (localization) {
    this._localization = localization;
  };
  this.getLocalization = function () {
    return this._localization;
  };
  this.getLocalizedStrings = function () {
    return this._strings;
  };
  this.setIncludeBlocks = function (blocks) {
    this.includeBlocks = blocks;
    this.updateTaskIntro();
  };
  this.setMainContext = function (mainContext) {
    this._mainContext = mainContext;
  };
  this.isVisible = function () {
    return this._visible;
  };

  /**
   * DOM specific operations
   */
  this._loadEditorWorkSpace = function () {
    return "<div id='python-analysis'></div>" +
        "<div id='blocklyContainer'>" + // TODO :: change ID here and in CSS
        "<div id='python-workspace' class='language_python' style='width: 100%; height: 100%'></div>" +
        "</div>";
  };
  this._loadBasicEditor = function () {
    if (this._mainContext.display) {
      $('#languageInterface').html(
        this._loadEditorWorkSpace()
      );
      if(window.quickAlgoResponsive) {
        $('#blocklyLibContent').prepend('<div class="pythonIntroSimple"></div>');
        $('#editorBar').prependTo('#languageInterface');
      }
      this._loadAceEditor();
      this._bindEditorEvents();
      this.updateTaskIntro();
    }
  };

  /**
   * Load the skulp analysis block in React.
   */
  this.loadSkulptAnalysis = function() {
    var self = this;
    var domContainer = document.querySelector('#python-analysis');

    ReactDOM.render(React.createElement(PythonStackViewContainer, {
      ref: function(componentReference) {
        if (componentReference) {
          self.analysisComponent = componentReference;

          /**
           * Move the analysis container with the mouse.
           */
          document.addEventListener('mouseup', function () {
            self.analysisComponent.mouseUpHandler();
          });
          document.addEventListener('mousemove', function (event) {
            self.analysisComponent.mouseMoveHandler(event.clientX, event.clientY);
          });
        }
      },
      analysis: null,
      show: true
    }), domContainer);
  };

  /**
   * Whether skulpt analysis should be enabled given the current task.
   *
   * @return {boolean}
   */
  this.skulptAnalysisShouldByEnabled = function() {
    var variablesEnabled = true;
    var taskInfos = this._mainContext.infos;
    var forbidden = pythonForbiddenLists(taskInfos.includeBlocks).forbidden;
    if (forbidden.indexOf('var_assign') !== -1) {
      variablesEnabled = false;
    }

    return variablesEnabled;
  };

  /**
   * Whether skulpt analysis is enabled.
   *
   * @return {boolean}
   */
  this.skulptAnalysisEnabled = function() {
    return (this.language === 'python' && typeof analyseSkulptState === 'function');
  };

  /**
   * Clears the skulpt analysis window.
   */
  this.clearSkulptAnalysis = function() {
    if (this.skulptAnalysisEnabled() && this.analysisComponent) {
      this.analysisComponent.props.analysis = null;
      this.analysisComponent.forceUpdate();
    }
  };

  /**
   * Shows the skulpt analysis window.
   */
  this.showSkulptAnalysis = function() {
    if (this.skulptAnalysisEnabled() && this.analysisComponent) {
      this.analysisComponent.props.show = true;
      this.analysisComponent.forceUpdate();
    }
  };

  /**
   * Hides the skulpt analysis window.
   */
  this.hideSkulptAnalysis = function() {
    if (this.skulptAnalysisEnabled() && this.analysisComponent) {
      this.analysisComponent.props.show = false;
      this.analysisComponent.forceUpdate();
    }
  };

  this.onResize = function() {
    // On resize function to be called by the interface
    this._aceEditor.resize();
  };
  this._loadAceEditor = function () {
    this._aceEditor = ace.edit('python-workspace');
    this._aceEditor.setOption('readOnly', !!this._options.readOnly);
    this._aceEditor.$blockScrolling = Infinity;
    this._aceEditor.getSession().setMode("ace/mode/python");
    this._aceEditor.setFontSize(16);
  };

  this.findLimited = function(code) {
    if(this._mainContext.infos.limitedUses) {
      return pythonFindLimited(code, this._mainContext.infos.limitedUses, this._mainContext.strings.code);
    } else {
      return false;
    }
  };

  this.getCapacityInfo = function() {
    // Handle capacity display
    var code = this._aceEditor.getValue();

    var forbidden = pythonForbidden(code, this.includeBlocks);
    if(forbidden) {
      return {text: "Mot-clé interdit utilisé : "+forbidden, invalid: true, type: 'forbidden'};
    }
    var text = '';
    var remaining = 1;
    if(maxInstructions) {
      remaining = maxInstructions - pythonCount(code);
      var optLimitElements = {
        maxBlocks: maxInstructions,
        remainingBlocks: Math.abs(remaining)
      };
      var strLimitElements = remaining < 0 ? this._strings.limitElementsOver : this._strings.limitElements;
      text = strLimitElements.format(optLimitElements);
    }
    if(remaining < 0) {
      return {text: text, invalid: true, type: 'capacity'};
    }
    var limited = this.findLimited(code);
    if(limited && limited.type == 'uses') {
      return {text: 'Vous utilisez trop souvent un mot-clé à utilisation limitée : "'+limited.name+'".', invalid: true, type: 'limited'};
    } else if(limited && limited.type == 'assign') {
      return {text: 'Vous n\'avez pas le droit de réassigner un mot-clé à utilisation limitée : "'+limited.name+'".', invalid: true, type: 'limited'};
    } else if(remaining == 0) {
      return {text: text, warning: true, type: 'capacity'};
    }
    return {text: text, type: 'capacity'};
  };

  this._removeDropDownDiv = function() {
    $('.blocklyDropDownDiv').remove();
  }

  this._bindEditorEvents = function () {
    $('body').on('click', this._removeDropDownDiv);
    var that = this;
    var onEditorChange = function () {
      if(!that._aceEditor) { return; }

      if(that._mainContext.runner && that._mainContext.runner._editorMarker) {
        that.clearSkulptAnalysis();

        that._aceEditor.session.removeMarker(that._mainContext.runner._editorMarker);
        that._mainContext.runner._editorMarker = null;
      }

      if(window.quickAlgoInterface) {
        window.quickAlgoInterface.displayCapacity(that.getCapacityInfo());
      } else {
        $('#capacity').html(that.getCapacityInfo().text);
      }

      // Interrupt any ongoing execution
      if(that._mainContext.runner && that._mainContext.runner.isRunning()) {
         that._mainContext.runner.stop();
         that._mainContext.reset();
      }

      if(window.quickAlgoInterface) {
        window.quickAlgoInterface.displayError(null);
      } else {
        $("#errors").html('');
      }

      // Close reportValue popups
      $('.blocklyDropDownDiv').remove();
    }
    this._aceEditor.getSession().on('change', debounce(onEditorChange, 500, false))
  };

  this._unbindEditorEvents = function () {
    $('body').off('click', this._removeDropDownDiv);
  }

  this.getAvailableModules = function () {
    if(this.includeBlocks && this.includeBlocks.generatedBlocks) {
      var availableModules = [];
      for (var generatorName in this.includeBlocks.generatedBlocks) {
        if(this.includeBlocks.generatedBlocks[generatorName].length) {
          availableModules.push(generatorName);
        }
      }
      return availableModules;
    } else {
      return [];
    }
  };

  this.updateTaskIntro = function () {
    if(!this._mainContext.display) { return; }
    if($('.pythonIntro').length == 0) {
      quickAlgoInterface.appendTaskIntro('<hr class="pythonIntroElement long" />'
        + '<div class="pythonIntro pythonIntroElement long">'
        + '  <div class="pythonIntroSimple"></div>'
        + '  <div class="pythonIntroFull"></div>'
        + '  <div class="pythonIntroBtn"></div>'
        + '</div>');
    }

    $('.pythonIntro').off('click', 'code');
    if(this._mainContext.infos.noPythonHelp) {
       $('.pythonIntroElement').css('display', 'none');
       return;
    }
    $('.pythonIntroElement').css('display', '');

    var fullHtml = '';
    var simpleHtml = '';

    var availableModules = this.getAvailableModules();
    if(availableModules.length) {
      fullHtml += '<p>Votre programme doit commencer par ';
      fullHtml += (availableModules.length > 1) ? 'les lignes' : 'la ligne';
      fullHtml += ' :</p>'
                 +  '<p><code>'
                 +  'from ' + availableModules[0] + ' import *';
      for(var i=1; i < availableModules.length; i++) {
        fullHtml += '\nfrom ' + availableModules[i] + ' import *';
      }
      fullHtml += '</code></p>'
                 +  '<p>Les fonctions disponibles pour contrôler le robot sont :</p>'
                 +  '<ul>';
      simpleHtml += 'Fonctions disponibles : ';

      var availableConsts = [];

      // Display a list for the simpleHtml version
      function displaySimpleList(elemList) {
        var html = '';
        if(window.quickAlgoResponsive && elemList.length > 0) {
          // Dropdown mode
          html  = '<div class="pythonIntroSelect">';
          html += '<select>';
          for(var i=0 ; i < elemList.length; i++) {
            var elem = elemList[i];
            html += '<option' + (elem.desc ? ' data-desc="' + elem.desc.replace('"', '&quot;') + '"' : '') + '>';
            html += (typeof elem == 'string' ? elem : elem.func);
            html += '</option>';
          }
          html += '</select>';
          html += '<div class="pythonIntroSelectBtn pythonIntroSelectBtnCopy"><span class="fas fa-clone"></span></div>';
          html += '<div class="pythonIntroSelectBtn pythonIntroSelectBtnHelp"><span class="fas fa-question"></span></div>';
          html += '<span class="pythonIntroSelectDesc"></span>';
          html += '</div>';
        } else {
          // Normal mode
          for(var i=0 ; i < elemList.length; i++) {
            var elem = elemList[i];
            if(i > 0) { html += ', '; }
            html += '<code>' + (typeof elem == 'string' ? elem : elem.func) + '</code>';
          }
        }
        return html;
      };

      // Generate list of functions available
      var simpleElements = [];
      for (var generatorName in this.includeBlocks.generatedBlocks) {
        var blockList = this.includeBlocks.generatedBlocks[generatorName];
        for (var iBlock=0; iBlock < blockList.length; iBlock++) {
          var blockDesc = '', funcProto = '', blockHelp = '';
          if (this._mainContext.docGenerator) {
            blockDesc = this._mainContext.docGenerator.blockDescription(blockList[iBlock]);
            funcProto = blockDesc.substring(blockDesc.indexOf('<code>') + 6, blockDesc.indexOf('</code>'));
            blockHelp = blockDesc.substring(blockDesc.indexOf('</code>') + 7);
          } else {
            var blockName = blockList[iBlock];
            blockDesc = this._mainContext.strings.description[blockName];
            if (!blockDesc) {
              funcProto = (this._mainContext.strings.code[blockName] || blockName) + '()';
              blockDesc = '<code>' + funcProto + '</code>';
            } else if (blockDesc.indexOf('</code>') < 0) {
              var funcProtoEnd = blockDesc.indexOf(')') + 1;
              funcProto = blockDesc.substring(0, funcProtoEnd);
              blockHelp = blockDesc.substring(funcProtoEnd);
              blockDesc = '<code>' + funcProto + '</code>' + blockHelp;
            }
          }
          fullHtml += '<li>' + blockDesc + '</li>';
          simpleElements.push({func: funcProto, desc: blockHelp});
        }

        // Handle constants as well
        if(this._mainContext.customConstants && this._mainContext.customConstants[generatorName]) {
          var constList = this._mainContext.customConstants[generatorName];
          for(var iConst=0; iConst < constList.length; iConst++) {
            var name = constList[iConst].name;
            if(this._mainContext.strings.constant && this._mainContext.strings.constant[name]) {
              name = this._mainContext.strings.constant[name];
            }
            availableConsts.push(name);
          }
        }
      }
      simpleHtml += displaySimpleList(simpleElements);
      fullHtml += '</ul>';
    }

    if(availableConsts.length) {
      fullHtml += '<p>Les constantes disponibles sont : <code>' + availableConsts.join('</code>, <code>') + '</code>.</p>';
      simpleHtml += '<br />Constantes disponibles : ' + displaySimpleList(availableConsts);
    }

    var pflInfos = pythonForbiddenLists(this.includeBlocks);

    function processForbiddenList(origList, allowed) {
      var list = origList.slice();

      var hiddenWords = ['__getitem__', '__setitem__'];
      for(var i = 0; i < hiddenWords.length; i++) {
        var word = hiddenWords[i];
        var wIdx = list.indexOf(word);
        if(wIdx > -1) {
          list.splice(wIdx, 1);
        }
      }

      var bracketsWords = { list_brackets: 'crochets [ ]+[]', dict_brackets: 'accolades { }+{}', var_assign: 'variables+x =' };
      for(var bracketsCode in bracketsWords) {
        var bracketsIdx = list.indexOf(bracketsCode);
        if(bracketsIdx >= 0) {
          list[bracketsIdx] = bracketsWords[bracketsCode];
        }
      }

      var word = allowed ? 'autorisé' : 'interdit';
      var cls = allowed ? '' : ' class="pflForbidden"';
      if(list.length == 1) {
        fullHtml += '<p>Le mot-clé suivant est ' + word + ' : <code'+cls+'>' + list[0] + '</code>.</p>';
      } else if(list.length > 0) {
        fullHtml += '<p>Les mots-clés suivants sont ' + word + 's : <code'+cls+'>' + list.join('</code>, <code'+cls+'>') + '</code>.</p>';
      }
      return list;
    }
    var pflAllowed = processForbiddenList(pflInfos.allowed, true);
    processForbiddenList(pflInfos.forbidden, false);
    if(pflAllowed.length) {
      simpleHtml += '<br />Mots-clés autorisés : ' + displaySimpleList(pflAllowed);
    }

    if(pflInfos.allowed.indexOf('var_assign') > -1) {
      fullHtml += '<p>Les variables sont autorisées.</p>';
    } else {
      fullHtml += '<p>Les variables sont interdites.</p>';
    }

    fullHtml += '<p>Vous êtes autorisé(e) à lire de la documentation sur Python et à utiliser un moteur de recherche pendant le concours.</p>';

    $('.pythonIntroSimple').html(simpleHtml);
    $('.pythonIntroFull').html(fullHtml);

    // Display the full details in the responsive version
    this.collapseTaskIntro(!window.quickAlgoResponsive);
    if(window.quickAlgoResponsive) {
        $('.pythonIntroBtn').hide();
    }

    function updateIntroSelect(elem) {
       elem = $(elem);
       var code = elem.find('option:selected').text();
       var funcName = code.split('(')[0];
       var conceptId = null;
       if(window.conceptViewer) {
          conceptId = window.conceptViewer.hasPythonConcept(funcName);
       }
       if(conceptId) {
          elem.parent().find('.pythonIntroSelectBtnHelp').attr('data-concept', conceptId).show();
       } else {
          elem.parent().find('.pythonIntroSelectBtnHelp').hide();
       }

       var desc = elem.find('option:selected').attr('data-desc');
       elem.parent().find('.pythonIntroSelectDesc').html(desc || "");
    }

    $('.pythonIntroSelect select').each(function(idx, elem) { updateIntroSelect(elem); });

    $('.pythonIntroSimple code, .pythonIntroSimple option, .pythonIntroFull code').each(function() {
      var elem = $(this);
      var txt = elem.text();
      var pIdx = txt.indexOf('+');
      if(pIdx > -1) {
        var newTxt = txt.substring(0, pIdx);
        var code = txt.substring(pIdx+1);
      } else {
        var newTxt = txt;
        var code = txt;
      }
      elem.attr('data-code', code);
      elem.text(newTxt);
    });

    var controller = this;
    $('.pythonIntroSimple code, .pythonIntroFull code').not('.pflForbidden').on('click', function() {
      quickAlgoInterface.toggleLongIntro(false);
      if(controller._aceEditor) {
        controller._aceEditor.insert(this.getAttribute('data-code'));
        controller._aceEditor.focus();
      }
    });
    $('.pythonIntroSelectBtn.pythonIntroSelectBtnCopy').on('click', function() {
      var code = $(this).parent().find('option:selected').attr('data-code');
      if(controller._aceEditor) {
        controller._aceEditor.insert(code);
        controller._aceEditor.focus();
      }
    });
    $('.pythonIntroSelectBtn.pythonIntroSelectBtnHelp').on('click', function() {
      window.conceptViewer.showConcept($(this).attr('data-concept'));
    });
    $('.pythonIntroSelect select').on('change', function() {
      updateIntroSelect(this);
    });
  };

  this.collapseTaskIntro = function(collapse) {
    var that = this;
    var div = $('.pythonIntroBtn').html('');
    if(collapse) {
      $('<a>Plus de détails</a>').appendTo(div).on('click', function() { that.collapseTaskIntro(false); });
      $('.pythonIntro .pythonIntroFull').hide();
      $('.pythonIntro .pythonIntroSimple').show();
    } else {
      $('<a>Moins de détails</a>').appendTo(div).on('click', function() { that.collapseTaskIntro(true); });
      $('.pythonIntro .pythonIntroFull').show();
      $('.pythonIntro .pythonIntroSimple').hide();
    }
  };

  this.toggleSize = function () {
    // Currently unused
    if (!this.extended) {
      this.extended = true;
      $('#editorContainer').css("width", "800px");
      $("#extendButton").val("<<");
    } else {
      this.extended = false;
      $('#editorContainer').css("width", "500px");
      $("#extendButton").val(">>");
    }
    this.updateSize();
  };
  this.updateSize = function () {
    var panelWidth = 500;

    if ($("#editorContainer").length > 0) {
      panelWidth = $('#editorContainer').width() - 30;
      if (panelWidth != this._prevWidth) {
          $("#taskIntro").css("width", panelWidth);
          $("#grid").css("left", panelWidth + 20 + "px");
      }
    }
    this._prevWidth = panelWidth;
  };
  this.resetDisplay = function () {
    if(this._mainContext.runner) {
      console.log('ok');
      this._mainContext.runner.removeEditorMarker();
    }
  };
  this.reload = function () {};
  this.setReadOnly = function(newState) {
    // setReadOnly called by quickAlgoInterface

    // TODO :: should we actually set the readOnly flag?
    return;

    if(!!newState == this._readOnly) { return; }
    this._readOnly = !!newState;

    // options.readOnly has priority
    if(this._options.readOnly) { return; }

    this._aceEditor.setOption('readOnly', this._readOnly);
  };

  this.canPaste = function() {
    return window.pythonClipboard ? true : null;
  }
  this.canConvertBlocklyToPython = function() {
    return false;
  }
  this.copyProgram = function() {
    var code = this._aceEditor.getSelectedText();
    if(!code) { code = this._aceEditor.getValue(); }
    window.pythonClipboard = code;
  }
  this.pasteProgram = function() {
    if(!window.pythonClipboard) { return; }
    var curCode = this._aceEditor.getValue();
    this._aceEditor.setValue(curCode + '\n\n' + window.pythonClipboard);
    var Range = ace.require('ace/range').Range;
    this._aceEditor.selection.setRange(new Range(curCode.split(/\r\n|\r|\n/).length + 1, 0, this._aceEditor.getValue().split(/\r\n|\r|\n/).length, 0), true);
  }
}

function getBlocklyHelper(maxBlocks, nbTestCases) {
  return new LogicController(nbTestCases, maxBlocks);
}

/*
    python_runner:
        Python code runner.
*/

var currentPythonContext = null;

function PythonInterpreter(context, msgCallback) {
  this.context = context;
  this.messageCallback = msgCallback;
  this._code = '';
  this._editor_filename = "<stdin>";
  this.context.runner = this;
  this._maxIterations = 4000;
  this._maxIterWithoutAction = 50;
  this._resetCallstackOnNextStep = false;
  this._paused = false;
  this._isRunning = false;
  this._stepInProgress = false;
  this.stepMode = false;
  this._steps = 0;
  this._stepsWithoutAction = 0;
  this._lastNbActions = null;
  this._hasActions = false;
  this._nbActions = 0;
  this._allowStepsWithoutDelay = 0;
  this._timeouts = [];
  this._editorMarker = null;
  this.availableModules = [];
  this._argumentsByBlock = {};
  this._definedFunctions = [];

  var that = this;

  this._skulptifyHandler = function (name, generatorName, blockName, nbArgs, type) {
    if(!arrayContains(this._definedFunctions, name)) { this._definedFunctions.push(name); }

    var handler = '';
    handler += "\tcurrentPythonContext.runner.checkArgs('" + name + "', '" + generatorName + "', '" + blockName + "', arguments);";

    handler += "\n\tvar susp = new Sk.misceval.Suspension();";
    handler += "\n\tvar result = Sk.builtin.none.none$;";

    // If there are arguments, convert them from Skulpt format to the libs format
    handler += "\n\tvar args = Array.prototype.slice.call(arguments);";
    handler += "\n\tfor(var i=0; i<args.length; i++) { args[i] = currentPythonContext.runner.skToJs(args[i]); };";

    handler += "\n\tsusp.resume = function() { return result; };";
    handler += "\n\tsusp.data = {type: 'Sk.promise', promise: new Promise(function(resolve) {";
    handler += "\n\targs.push(resolve);";

    // Count actions
    if(type == 'actions') {
      handler += "\n\tcurrentPythonContext.runner._nbActions += 1;";
    }

    handler += "\n\ttry {";
    handler += '\n\t\tcurrentPythonContext["' + generatorName + '"]["' + blockName + '"].apply(currentPythonContext, args);';
    handler += "\n\t} catch (e) {";
    handler += "\n\t\tcurrentPythonContext.runner._onStepError(e)}";
    handler += '\n\t}).then(function (value) {\nresult = value;\nreturn value;\n })};';
    handler += '\n\treturn susp;';
    return '\nmod.' + name + ' = new Sk.builtin.func(function () {\n' + handler + '\n});\n';
  };

  this._skulptifyConst = function(name, value) {
    if(typeof value === "number") {
      var handler = 'Sk.builtin.int_(' + value + ');';
    } else if(typeof value === "boolean") {
      var handler = 'Sk.builtin.bool(' + value.toString() + ');';
    } else if(typeof value === "string") {
      var handler = 'Sk.builtin.str(' + JSON.stringify(value) + ');';
    } else {
      throw "Unable to translate value '" + value + "' into a Skulpt constant.";
    }
    return '\nmod.' + name + ' = new ' + handler + '\n';
  };

  this._injectFunctions = function () {
    // Generate Python custom libraries from all generated blocks
    this._definedFunctions = [];

    if(this.context.infos && this.context.infos.includeBlocks && this.context.infos.includeBlocks.generatedBlocks) {
      // Flatten customBlocks information for easy access
      var blocksInfos = {};
      for (var generatorName in this.context.customBlocks) {
        for (var typeName in this.context.customBlocks[generatorName]) {
          var blockList = this.context.customBlocks[generatorName][typeName];
          for (var iBlock=0; iBlock < blockList.length; iBlock++) {
            var blockInfo = blockList[iBlock];
            blocksInfos[blockInfo.name] = {
              nbArgs: 0, // handled below
              type: typeName};
            blocksInfos[blockInfo.name].nbsArgs = [];
            if(blockInfo.anyArgs) {
              // Allows to specify the function can accept any number of arguments
              blocksInfos[blockInfo.name].nbsArgs.push(Infinity);
            }
            var variants = blockInfo.variants ? blockInfo.variants : (blockInfo.params ? [blockInfo.params] : []);
            if(variants.length) {
              for(var i=0; i < variants.length; i++) {
                blocksInfos[blockInfo.name].nbsArgs.push(variants[i].length);
              }
            }
          }
        }
      }

      // Generate functions used in the task
      for (var generatorName in this.context.infos.includeBlocks.generatedBlocks) {
        var blockList = this.context.infos.includeBlocks.generatedBlocks[generatorName];
        if(!blockList.length) { continue; }
        var modContents = "var $builtinmodule = function (name) {\n\nvar mod = {};\nmod.__package__ = Sk.builtin.none.none$;\n";
        if(!this._argumentsByBlock[generatorName]) {
          this._argumentsByBlock[generatorName] = {};
        }
        for (var iBlock=0; iBlock < blockList.length; iBlock++) {
          var blockName = blockList[iBlock];
          var code = this.context.strings.code[blockName];
          if (typeof(code) == "undefined") {
            code = blockName;
          }
          var nbsArgs = blocksInfos[blockName] ? (blocksInfos[blockName].nbsArgs ? blocksInfos[blockName].nbsArgs : []) : [];
          var type = blocksInfos[blockName] ? blocksInfos[blockName].type : 'actions';

          if(type == 'actions') {
            this._hasActions = true;
          }

          this._argumentsByBlock[generatorName][blockName] = nbsArgs;
          modContents += this._skulptifyHandler(code, generatorName, blockName, nbsArgs, type);
        }

        // TODO :: allow selection of constants available in a task
//        if(this.context.infos.includeBlocks.constants && this.context.infos.includeBlocks.constants[generatorName]) {
        if(this.context.customConstants && this.context.customConstants[generatorName]) {
          var constList = this.context.customConstants[generatorName];
          for(var iConst=0; iConst < constList.length; iConst++) {
            var name = constList[iConst].name;
            if(this.context.strings.constant && this.context.strings.constant[name]) {
              name = this.context.strings.constant[name];
            }
            modContents += this._skulptifyConst(name, constList[iConst].value)
          }
        }

        modContents += "\nreturn mod;\n};";
        Sk.builtinFiles["files"]["src/lib/"+generatorName+".js"] = modContents;
        this.availableModules.push(generatorName);
      }
    }
  };

  this.checkArgs = function (name, generatorName, blockName, args) {
    // Check the number of arguments corresponds to a variant of the function
    if(!this._argumentsByBlock[generatorName] || !this._argumentsByBlock[generatorName][blockName]) {
      console.error("Couldn't find the number of arguments for " + generatorName + "/" + blockName + ".");
      return;
    }
    var nbsArgs = this._argumentsByBlock[generatorName][blockName];
    if(nbsArgs.length == 0) {
      // This function doesn't have arguments
      if(args.length > 0) {
        msg = name + "() takes no arguments (" + args.length + " given)";
        throw new Sk.builtin.TypeError(msg);
      }
    } else if(nbsArgs.indexOf(args.length) == -1 && nbsArgs.indexOf(Infinity) == -1) {
      var minArgs = nbsArgs[0];
      var maxArgs = nbsArgs[0];
      for(var i=1; i < nbsArgs.length; i++) {
        minArgs = Math.min(minArgs, nbsArgs[i]);
        maxArgs = Math.max(maxArgs, nbsArgs[i]);
      }
      if (minArgs === maxArgs) {
        msg = name + "() takes exactly " + minArgs + " arguments";
      } else if (args.length < minArgs) {
        msg = name + "() takes at least " + minArgs + " arguments";
      } else if (args.length > maxArgs){
        msg = name + "() takes at most " + maxArgs + " arguments";
      } else {
        msg = name + "() doesn't have a variant accepting this number of arguments";
      }
      msg += " (" + args.length + " given)";
      throw new Sk.builtin.TypeError(msg);
    }
  };

  this._definePythonNumber = function() {
    // Create a class which behaves as a Number, but can have extra properties
    this.pythonNumber = function(val) {
      this.val = new Number(val);
    }
    this.pythonNumber.prototype = Object.create(Number.prototype);
    function makePrototype(func) {
      return function() { return Number.prototype[func].call(this.val); }
    }
    var funcs = ['toExponential', 'toFixed', 'toLocaleString', 'toPrecision', 'toSource', 'toString', 'valueOf'];
    for(var i = 0; i < funcs.length ; i++) {
      this.pythonNumber.prototype[funcs[i]] = makePrototype(funcs[i]);
    }
  }

  this.skToJs = function(val) {
    // Convert Skulpt item to JavaScript
    if(val instanceof Sk.builtin.bool) {
      return val.v ? true : false;
    } else if(val instanceof Sk.builtin.func) {
      return function() {
        var args = [];
        for(var i = 0; i < arguments.length; i++) {
          args.push(that._createPrimitive(arguments[i]));
        }
        var retp = new Promise(function(resolve, reject) {
          var p = Sk.misceval.asyncToPromise(function() { return val.tp$call(args); });
          p.then(function(val) { resolve(that.skToJs(val)); });
        });
        return retp;
      }
    } else if(val instanceof Sk.builtin.dict) {
      var dictKeys = Object.keys(val);
      var retVal = {};
      for(var i = 0; i < dictKeys.length; i++) {
        var key = dictKeys[i];
        if(key == 'size' || key == '__class__') { continue; }
        var subItems = val[key].items;
        for(var j = 0; j < subItems.length; j++) {
          var subItem = subItems[j];
          retVal[subItem.lhs.v] = this.skToJs(subItem.rhs);
        }
      }
      return retVal;
    } else {
      var retVal = val.v;
      if(val instanceof Sk.builtin.tuple || val instanceof Sk.builtin.list) {
        retVal = [];
        for(var i = 0; i < val.v.length; i++) {
          retVal[i] = this.skToJs(val.v[i]);
        }
      }
      if(val instanceof Sk.builtin.tuple) {
        retVal.isTuple = true;
      }
      if(val instanceof Sk.builtin.float_) {
        retVal = new this.pythonNumber(retVal);
        retVal.isFloat = true;
      }
      return retVal;
    }
  };

  this.getDefinedFunctions = function() {
    this._injectFunctions();
    return this._definedFunctions.slice();
  };

  this._setTimeout = function(func, time) {
    var timeoutId = null;
    var that = this;
    function wrapper() {
      var idx = that._timeouts.indexOf(timeoutId);
      if(idx > -1) { that._timeouts.splice(idx, 1); }
      func();
    }
    timeoutId = window.setTimeout(wrapper, time);
    this._timeouts.push(timeoutId);
  }

  this.waitDelay = function (callback, value, delay) {
    this._paused = true;
    if (delay > 0) {
      var _noDelay = this.noDelay.bind(this, callback, value);
      this._setTimeout(_noDelay, delay);
      // We just waited some time, allow next steps to not be delayed
      this._allowStepsWithoutDelay = Math.min(this._allowStepsWithoutDelay + Math.ceil(delay / 10), 100);
    } else {
      this.noDelay(callback, value);
    }
  };

  this.waitEvent = function (callback, target, eventName, func) {
    this._paused = true;
    var listenerFunc = null;
    var that = this;
    listenerFunc = function(e) {
      target.removeEventListener(eventName, listenerFunc);
      that.noDelay(callback, func(e));
    };
    target.addEventListener(eventName, listenerFunc);
  };

  this.waitCallback = function (callback) {
    // Returns a callback to be called once we can continue the execution
    this._paused = true;
    var that = this;
    return function(value) {
      that.noDelay(callback, value);
    };
  };

  this.noDelay = function (callback, value) {
    var primitive = this._createPrimitive(value);
    if (primitive !== Sk.builtin.none.none$) {
      // Apparently when we create a new primitive, the debugger adds a call to
      // the callstack.
      this._resetCallstackOnNextStep = true;
      this.reportValue(value);
    }
    this._paused = false;
    callback(primitive);
    this._setTimeout(this._continue.bind(this), 10);
  };

  this._createPrimitive = function (data) {
    if (data === undefined || data === null) {
      return Sk.builtin.none.none$;  // Reuse the same object.
    }
    var type = typeof data;
    var result = {v: data}; // Emulate a Skulpt object as default
    if (type === 'number') {
      if(Math.floor(data) == data) { // isInteger isn't supported by IE
        result = new Sk.builtin.int_(data);
      } else {
        result = new Sk.builtin.float_(data);
      }
    } else if (type === 'string') {
      result = new Sk.builtin.str(data);
    } else if (type === 'boolean') {
      result = new Sk.builtin.bool(data);
    } else if (typeof data.length != 'undefined') {
      var skl = [];
      for(var i = 0; i < data.length; i++) {
        skl.push(this._createPrimitive(data[i]));
      }
      result = new Sk.builtin.list(skl);
    }
    return result;
  };

  this._onOutput = function (_output) {
    that.print(_output);
  };

  this._onDebugOut = function (text) {
    // console.log('DEBUG: ', text);
  };

  this._configure = function () {
    Sk.configure({
      output: this._onOutput,
      debugout: this._onDebugOut,
      read: this._builtinRead.bind(this),
      yieldLimit: null,
      execLimit: null,
      debugging: true,
      breakpoints: this._debugger.check_breakpoints.bind(this._debugger)
    });
    Sk.pre = "edoutput";
    Sk.pre = "codeoutput";

    // Disable document library
    delete Sk.builtinFiles["files"]["src/lib/document.js"];

    this._definePythonNumber();

    this.context.callCallback = this.noDelay.bind(this);
  };

  this.print = function (message, className) {
    if (message === 'Program execution complete') {
      this._onFinished();
    }
    if (message) {
      //console.log('PRINT: ', message, className || '');
    }
  };

  this._onFinished = function () {
    this.stop();
    try {
      this.context.infos.checkEndCondition(this.context, true);
    } catch (e) {
      this._onStepError(e);
    }
  };

  this._builtinRead = function (x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
      throw "File not found: '" + x + "'";
    return Sk.builtinFiles["files"][x];
  };

  this.get_source_line = function (lineno) {
    return this._code.split('\n')[lineno];
  };

  this._continue = function () {
    if (this.context.infos.checkEndEveryTurn) {
      try {
        this.context.infos.checkEndCondition(context, false);
      } catch(e) {
        this._onStepError(e);
        return;
      }
    }
    if (!this.context.allowInfiniteLoop && this._steps >= this._maxIterations) {
      this._onStepError(window.languageStrings.tooManyIterations);
    } else if (!this.context.allowInfiniteLoop && this._stepsWithoutAction >= this._maxIterWithoutAction) {
      this._onStepError(window.languageStrings.tooManyIterationsWithoutAction);
    } else if (!this._paused && this._isRunning) {
      this.step();
    }
  };

  this.initCodes = function (codes) {
    if(Sk.running) {
      if(typeof Sk.runQueue === 'undefined') {
        Sk.runQueue = [];
      }
      Sk.runQueue.push({ctrl: this, codes: codes});
      return;
    }

    // Set Skulpt to Python 3
    Sk.python3 = true;

    currentPythonContext = this.context;
    this._debugger = new Sk.Debugger(this._editor_filename, this);
    this._configure();
    this._injectFunctions();
    this._code = codes[0];
    this._setBreakpoint(1, false);

    if(typeof this.context.infos.maxIter !== 'undefined') {
      this._maxIterations = Math.ceil(this.context.infos.maxIter/10);
    }
    if(typeof this.context.infos.maxIterWithoutAction !== 'undefined') {
      this._maxIterWithoutAction = Math.ceil(this.context.infos.maxIterWithoutAction/10);
    }
    if(!this._hasActions) {
      // No limit on
      this._maxIterWithoutAction = this._maxIterations;
    }

    try {
      var susp_handlers = {};
      susp_handlers["*"] = this._debugger.suspension_handler.bind(this);
      var promise = this._debugger.asyncToPromise(this._asyncCallback.bind(this), susp_handlers, this._debugger);
      promise.then(this._debugger.success.bind(this._debugger), this._debugger.error.bind(this._debugger));
    } catch (e) {
      this._onOutput(e.toString() + "\n");
      //console.log('exception');
    }

    this._resetInterpreterState();
    Sk.running = true;
    this._isRunning = true;
  };

  this.run = function () {
    if(this.stepMode) {
      this._paused = this._stepInProgress;
      this.stepMode = false;
    }
    this._setTimeout(this._continue.bind(this), 100);
  };

  this.runCodes = function(codes) {
    this.initCodes(codes);
    this.run();
  };

  this.runStep = function () {
    this.stepMode = true;
    if(this._isRunning && !this._stepInProgress) {
      this.step();
    }
  };

  this.nbRunning = function () {
    return this._isRunning ? 1 : 0;
  };

  this.removeEditorMarker = function () {
    var editor = this.context.blocklyHelper._aceEditor;
    if(editor && this._editorMarker) {
      editor.session.removeMarker(this._editorMarker);
      this._editorMarker = null;
    }
  };

  this.unSkulptValue = function (origValue) {
    // Transform a value, possibly a Skulpt one, into a printable value
    if(typeof origValue !== 'object' || origValue === null) {
      var value = origValue;
    } else if(origValue.constructor === Sk.builtin.dict) {
      var keys = Object.keys(origValue);
      var dictElems = [];
      for(var i=0; i<keys.length; i++) {
        if(keys[i] == 'size' || keys[i] == '__class__'
            || !origValue[keys[i]].items
            || !origValue[keys[i]].items[0]) {
          continue;
        }
        var items = origValue[keys[i]].items[0];
        dictElems.push('' + this.unSkulptValue(items.lhs) + ': ' + this.unSkulptValue(items.rhs));
      }
      var value = '{' + dictElems.join(',' ) + '}';
    } else if(origValue.constructor === Sk.builtin.list) {
      var oldArray = origValue.v;
      var newArray = [];
      for(var i=0; i<oldArray.length; i++) {
        newArray.push(this.unSkulptValue(oldArray[i]));
      }
      var value = '[' + newArray.join(', ') + ']';
    } else if(origValue.v !== undefined) {
      var value = origValue.v;
      if(typeof value == 'string') {
        value = '"' + value + '"';
      }
    } else if(typeof origValue == 'object') {
      var value = origValue;
    }
    return value;
  };

  this.reportValue = function (origValue, varName) {
    // Show a popup displaying the value of a block in step-by-step mode
    if(origValue === undefined
        || (origValue && origValue.constructor === Sk.builtin.func)
        || !this._editorMarker
        || !context.display
        || !this.stepMode) {
      return origValue;
    }

    var value = this.unSkulptValue(origValue);

    var highlighted = $('.aceHighlight');
    if(highlighted.length == 0) {
      return origValue;
    } else if(highlighted.find('.ace_start').length > 0) {
      var target = highlighted.find('.ace_start')[0];
    } else {
      var target = highlighted[0];
    }
    var bbox = target.getBoundingClientRect();

    var leftPos = bbox.left+10;
    var topPos = bbox.top-14;

    var displayStr = value.toString();
    if(typeof value == 'boolean') {
      displayStr = value ? window.languageStrings.valueTrue : window.languageStrings.valueFalse;
    }
    if(varName) {
      displayStr = '' + varName + ' = ' + displayStr;
    }

    var dropDownDiv = '' +
        '<div class="blocklyDropDownDiv" style="transition: transform 0.25s, opacity 0.25s; background-color: rgb(255, 255, 255); border-color: rgb(170, 170, 170); left: '+leftPos+'px; top: '+topPos+'px; display: block; opacity: 1; transform: translate(0px, -20px);">' +
        '  <div class="blocklyDropDownContent">' +
        '    <div class="valueReportBox">' +
        displayStr +
        '    </div>' +
        '  </div>' +
        '  <div class="blocklyDropDownArrow arrowBottom" style="transform: translate(22px, 15px) rotate(45deg);"></div>' +
        '</div>';

    $('.blocklyDropDownDiv').remove();
    $('body').append(dropDownDiv);

    return origValue;
  };

  this.stop = function () {
    for (var i = 0; i < this._timeouts.length; i += 1) {
      window.clearTimeout(this._timeouts[i]);
    }
    this._timeouts = [];
    this.removeEditorMarker();
    if(Sk.runQueue) {
      for (var i=0; i<Sk.runQueue.length; i++) {
        if(Sk.runQueue[i].ctrl === this) {
          Sk.runQueue.splice(i, 1);
          i--;
        }
      }
    }
    if(window.quickAlgoInterface) {
      window.quickAlgoInterface.setPlayPause(false);
    }
    this._resetInterpreterState();
  };

  this.isRunning = function () {
    return this._isRunning;
  };

  this._resetInterpreterState = function () {
    this._steps = 0;
    this._stepsWithoutAction = 0;
    this._lastNbActions = 0;
    this._nbActions = 0;
    this._allowStepsWithoutDelay = 0;

    this._isRunning = false;
    this.stepMode = false;
    this._stepInProgress = false;
    this._resetCallstackOnNextStep = false;
    this._paused = false;
    Sk.running = false;
    if(Sk.runQueue && Sk.runQueue.length > 0) {
      var nextExec = Sk.runQueue.shift();
      setTimeout(function () { nextExec.ctrl.runCodes(nextExec.codes); }, 100);
    }
  };

  this._resetCallstack = function () {
    if (this._resetCallstackOnNextStep) {
      this._resetCallstackOnNextStep = false;
      this._debugger.suspension_stack.pop();
    }
  };

  this.step = function () {
    this._resetCallstack();
    this._stepInProgress = true;
    var editor = this.context.blocklyHelper._aceEditor;
    var markDelay = this.context.infos ? Math.floor(this.context.infos.actionDelay/4) : 0;
    if(this.context.display && (this.stepMode || markDelay > 30)) {
      var curSusp = this._debugger.suspension_stack[this._debugger.suspension_stack.length-1];
      if(curSusp && curSusp.lineno) {
        this.removeEditorMarker();
        var splitCode = this._code.split(/[\r\n]/);
        var Range = ace.require('ace/range').Range;
        this._editorMarker = editor.session.addMarker(
            new Range(curSusp.lineno-1, curSusp.colno, curSusp.lineno, 0),
            "aceHighlight",
            "line");
      }
    } else {
      this.removeEditorMarker();
    }

    var stepDelay = 0;
    if(!this.stepMode && this.context.allowInfiniteLoop) {
      // Add a delay in infinite loops to avoid using all CPU
      if(this._allowStepsWithoutDelay > 0) {
        // We just had a waitDelay, don't delay further
        this._allowStepsWithoutDelay -= 1;
      } else {
        stepDelay = 10;
      }
    }
    var realStepDelay = markDelay + stepDelay;

    if(realStepDelay > 0) {
      this._paused = true;
      setTimeout(this.realStep.bind(this), realStepDelay);
    } else {
      this.realStep();
    }
  };

  this.realStep = function () {
    // For reportValue in Skulpt
    window.currentPythonRunner = this;

    this._paused = this.stepMode;
    this._debugger.enable_step_mode();
    this._debugger.resume.call(this._debugger);
    this._steps += 1;
    if(this._lastNbActions != this._nbActions) {
      this._lastNbActions = this._nbActions;
      this._stepsWithoutAction = 0;
    } else {
      this._stepsWithoutAction += 1;
    }
  };

  this._onStepSuccess = function () {
    // If there are still timeouts, there's still a step in progress
    this._stepInProgress = !!this._timeouts.length;
    this._continue();
  };

  this._onStepError = function (message) {
    context.onExecutionEnd && context.onExecutionEnd();
    // We always get there, even on a success
    this.stop();

    message = '' + message;

    // Skulpt doesn't support well NoneTypes
    if(message.indexOf("TypeError: Cannot read property") > -1 && message.indexOf("undefined") > -1) {
      message = message.replace(/^.* line/, "TypeError: NoneType value used in operation on line");
    }

    if(message.indexOf('undefined') > -1) {
      message += '. ' + window.languageStrings.undefinedMsg;
    }

    // Transform message depending on whether we successfully
    if(this.context.success) {
      message = "<span style='color:green;font-weight:bold'>" + message + "</span>";
    } else {
      message = this.context.messagePrefixFailure + message;
    }

    this.messageCallback(message);
  };

  this._setBreakpoint = function (bp, isTemporary) {
    this._debugger.add_breakpoint(this._editor_filename + ".py", bp, "0", isTemporary);
  };

  this._asyncCallback = function () {
    return Sk.importMainWithBody(this._editor_filename, true, this._code, true);
  };

  this.signalAction = function () {
    // Allows a context to signal an "action" happened
    this._stepsWithoutAction = 0;
  };
}

function initBlocklyRunner(context, msgCallback) {
  return new PythonInterpreter(context, msgCallback);
};

/*
    subtask:
        Logic for quickAlgo tasks, implements the Bebras task API.
*/

var initBlocklySubTask = function(subTask, language) {
   // Blockly tasks need to always have the level-specific behavior from
   // beaver-task-2.0
   subTask.assumeLevels = true;

   if (window.forcedLevel != null) {
      for (var level in subTask.data) {
         if (window.forcedLevel != level) {
            subTask.data[level] = undefined;
         }
      }
      subTask.load = function(views, callback) {
         subTask.loadLevel(window.forcedLevel);
         callback();
      };
   } else if (subTask.data["medium"] == undefined) {
      subTask.load = function(views, callback) {
         subTask.loadLevel("easy");
         callback();
      };
   }

   if (language == undefined) {
      language = "fr";
   }

   subTask.loadLevel = function(curLevel) {
      var levelGridInfos = extractLevelSpecific(subTask.gridInfos, curLevel);
      subTask.levelGridInfos = levelGridInfos;

      // Convert legacy options
      if(!levelGridInfos.hideControls) { levelGridInfos.hideControls = {}; }
      levelGridInfos.hideControls.saveOrLoad = levelGridInfos.hideControls.saveOrLoad || !!levelGridInfos.hideSaveOrLoad;
      levelGridInfos.hideControls.loadBestAnswer = levelGridInfos.hideControls.loadBestAnswer || !!levelGridInfos.hideLoadBestAnswers;

      subTask.blocklyHelper = getBlocklyHelper(subTask.levelGridInfos.maxInstructions);
      subTask.answer = null;
      subTask.state = {};
      subTask.iTestCase = 0;
      if(!window.taskResultsCache) {
         window.taskResultsCache = {};
      }
      if(!window.taskResultsCache[curLevel]) {
         window.taskResultsCache[curLevel] = {};
      }

      this.level = curLevel;

      // TODO: fix bebras platform to make this unnecessary
      try {
         $('#question-iframe', window.parent.document).css('width', '100%');
      } catch(e) {
      }
      $('body').css("width", "100%").addClass('blockly');
      window.focus();

      this.iTestCase = 0;
      this.nbTestCases = subTask.data[curLevel].length;

      this.context = quickAlgoLibraries.getContext(this.display, levelGridInfos, curLevel);
      this.context.raphaelFactory = this.raphaelFactory;
      this.context.delayFactory = this.delayFactory;
      this.context.blocklyHelper = this.blocklyHelper;

      if (this.display) {
         window.quickAlgoInterface.loadInterface(this.context, curLevel);
         window.quickAlgoInterface.setOptions({
            hasExample: levelGridInfos.example && levelGridInfos.example[subTask.blocklyHelper.language],
            conceptViewer: levelGridInfos.conceptViewer,
            conceptViewerLang: this.blocklyHelper.language,
            hasTestThumbnails: levelGridInfos.hasTestThumbnails,
            hideControls: levelGridInfos.hideControls,
            introMaxHeight: levelGridInfos.introMaxHeight
         });
         window.quickAlgoInterface.bindBlocklyHelper(this.blocklyHelper);
      }

      this.blocklyHelper.loadContext(this.context);

      //this.answer = task.getDefaultAnswerObject();
      displayHelper.hideValidateButton = true;
      displayHelper.timeoutMinutes = 30;

      var curIncludeBlocks = extractLevelSpecific(this.context.infos.includeBlocks, curLevel);

      // Load concepts into conceptViewer; must be done before loading
      // Blockly/Scratch, as scratch-mode will modify includeBlocks
      if(this.display && levelGridInfos.conceptViewer) {
         // TODO :: testConcepts is temporary-ish
         if(this.context.conceptList) {
            var allConcepts = this.context.conceptList.concat(testConcepts);
         } else {
            var allConcepts = testConcepts;
         }

         var concepts = window.getConceptsFromBlocks(curIncludeBlocks, allConcepts, this.context);
         if(levelGridInfos.conceptViewer.length) {
            concepts = concepts.concat(levelGridInfos.conceptViewer);
         } else {
            concepts.push('base');
         }
         concepts = window.conceptsFill(concepts, allConcepts);
         window.conceptViewer.loadConcepts(concepts);
      }

      this.blocklyHelper.setIncludeBlocks(curIncludeBlocks);

      var blocklyOptions = {
         readOnly: !!subTask.taskParams.readOnly,
         defaultCode: subTask.defaultCode,
         maxListSize: this.context.infos.maxListSize,
         startingExample: this.context.infos.startingExample
      };

      // Handle zoom options
      var maxInstructions = this.context.infos.maxInstructions ? this.context.infos.maxInstructions : Infinity;
      var zoomOptions = {
         controls: false,
         scale: maxInstructions > 20 ? 1 : 1.1
      };
      if(this.context.infos && this.context.infos.zoom) {
         zoomOptions.controls = !!this.context.infos.zoom.controls;
         zoomOptions.scale = (typeof this.context.infos.zoom.scale != 'undefined') ? this.context.infos.zoom.scale : zoomOptions.scale;
      }
      blocklyOptions.zoom = zoomOptions;

      // Handle scroll
//      blocklyOptions.scrollbars = maxInstructions > 10;
      blocklyOptions.scrollbars = true;
      if(typeof this.context.infos.scrollbars != 'undefined') {
         blocklyOptions.scrollbars = this.context.infos.scrollbars;
      }

      this.blocklyHelper.load(stringsLanguage, this.display, this.data[curLevel].length, blocklyOptions);

      if(this.display) {
         window.quickAlgoInterface.initTestSelector(this.nbTestCases);
         window.quickAlgoInterface.onResize();
      }

      subTask.changeTest(0);

      // Log the loaded level after a second
      if(window.levelLogActivityTimeout) { clearTimeout(window.levelLogActivityTimeout); }
      window.levelLogActivityTimeout = setTimeout(function() {
         subTask.logActivity('loadLevel;' + curLevel);
         window.levelLogActivityTimeout = null;
      }, 1000);
   };

   subTask.updateScale = function() {
      setTimeout(function() {
         try {
            subTask.context.updateScale();
            subTask.blocklyHelper.updateSize();
         } catch(e) {}
      }, 0);
   };

   var resetScores = function() {
   };

   var updateScores = function() {
   };

   function changeScore(robot, deltaScore) {
      scores[robot] += deltaScore;
      updateScores();
   };

   subTask.unloadLevel = function(callback) {
      if(this.display) {
         window.quickAlgoInterface.unloadLevel();
      }
      this.context.unload();
      this.blocklyHelper.unloadLevel();
      if(window.conceptViewer) {
         window.conceptViewer.unload();
      }
      callback();
   };

   subTask.unload = function(callback) {
      var that = this;
      subTask.unloadLevel(function () {
         that.blocklyHelper.unload();
         callback();
      });
   };

   subTask.reset = function() {
      this.context.reset();
   };

   subTask.program_end = function(callback) {
      this.context.program_end(callback);
   };

   var initContextForLevel = function(iTestCase) {
      subTask.iTestCase = iTestCase;
      subTask.context.reset(subTask.data[subTask.level][iTestCase]);
      subTask.context.iTestCase = iTestCase;
      subTask.context.nbTestCases = subTask.nbTestCases;
      //      var prefix = "Test " + (subTask.iTestCase + 1) + "/" + subTask.nbTestCases + " : ";
      subTask.context.messagePrefixFailure = '';
      subTask.context.messagePrefixSuccess = '';
      subTask.context.linkBack = false;
   };

   subTask.logActivity = function(details) {
      var logOption = subTask.taskParams && subTask.taskParams.options && subTask.taskParams.options.log;
      if(!logOption) { return; }

      if(!details) {
         // Sends a validate("log") to the platform if the log GET parameter is set
         // Performance note : we don't call getAnswerObject, as it's already
         // called every second by buttonsAndMessages.
         if(JSON.stringify(subTask.answer) != subTask.lastLoggedAnswer) {
            platform.validate("log");
            subTask.lastLoggedAnswer = JSON.stringify(subTask.answer);
         }
         return;
      }

      // We can only log extended activity if the platform gave us a
      // logActivity function
      if(!window.logActivity) { return; }
      window.logActivity(details);
   };

   subTask.initRun = function(callback) {
      var initialTestCase = subTask.iTestCase;
      initBlocklyRunner(subTask.context, function(message, success) {
         if(typeof success == 'undefined') {
            success = subTask.context.success;
         }
         function handleResults(results) {
            subTask.context.display = true;
            if(callback) {
               callback(message, success);
            } else if(results.successRate >= 1) {
               // All tests passed, request validate from the platform
               platform.validate("done");
            }
            if(results.successRate < 1) {
               // Display the execution message as it won't be shown through
               // validate
               window.quickAlgoInterface.displayResults(
                   {iTestCase: initialTestCase, message: message, successRate: success ? 1 : 0},
                   results
               );
            }
         }
         // Log the attempt
         subTask.logActivity();
         // Launch an evaluation after the execution

         if (!subTask.context.doNotStartGrade ) {
            subTask.context.display = false;
            subTask.getGrade(handleResults, true, subTask.iTestCase);
         } else {
            if (!subTask.context.success)
               window.quickAlgoInterface.displayError(message);
         }
      });
      initContextForLevel(initialTestCase);
   };

   subTask.run = function(callback) {
      subTask.initRun(callback);
      subTask.blocklyHelper.run(subTask.context);
   };

   subTask.submit = function() {
      this.stop();
      this.context.display = false;
      this.getAnswerObject(); // to fill this.answer;

      $('#displayHelper_graderMessage').html('<div style="margin: .2em 0; color: red; font-weight: bold;">' + languageStrings.gradingInProgress + '</div>');

      this.getGrade(function(result) {
         $('#displayHelper_graderMessage').html("");
         subTask.context.display = true;
         initBlocklyRunner(subTask.context, function(message, success) {
            window.quickAlgoInterface.displayError('<span class="testError">'+message+'</span>');
            platform.validate("done");
         });
         subTask.changeTest(result.iTestCase - subTask.iTestCase);
         initContextForLevel(result.iTestCase);
         subTask.context.linkBack = true;
         subTask.context.messagePrefixSuccess = window.languageStrings.allTests;
         subTask.blocklyHelper.run(subTask.context);
      }, true);
   };

   subTask.step = function () {
      subTask.context.changeDelay(200);
      if ((this.context.runner === undefined) || !this.context.runner.isRunning()) {
         this.initRun();
      }
      subTask.blocklyHelper.step(subTask.context);
   };

   subTask.stop = function() {
      this.clearAnalysis();

      if(this.context.runner) {
         this.context.runner.stop();
      }

      // Reset everything through changeTest
      subTask.changeTest(0);
   };

   /**
    * Clears the analysis container.
    */
   subTask.clearAnalysis = function() {
      if (this.blocklyHelper.clearSkulptAnalysis) {
         this.blocklyHelper.clearSkulptAnalysis();
      }
   };

   subTask.reloadStateObject = function(stateObj) {
      this.state = stateObj;
//      this.level = state.level;

//      initContextForLevel(this.level);

//      this.context.runner.stop();
   };

   subTask.loadExample = function(exampleObj) {
      subTask.blocklyHelper.loadExample(exampleObj ? exampleObj : subTask.levelGridInfos.example);
   };

   subTask.getDefaultStateObject = function() {
      return { level: "easy" };
   };

   subTask.getStateObject = function() {
      this.state.level = this.level;
      return this.state;
   };

   subTask.changeSpeed = function(speed) {
      this.context.changeDelay(speed);
      if ((this.context.runner === undefined) || !this.context.runner.isRunning()) {
         this.run();
      } else if (this.context.runner.stepMode) {
         this.context.runner.run();
      }
   };

   // used in new playback controls with speed slider
   subTask.setStepDelay = function(delay) {
      this.context.changeDelay(delay);
   };

   // used in new playback controls with speed slider
   subTask.pause = function() {
      if(this.context.runner) {
         this.context.runner.stepMode = true;
      }
   };

   // used in new playback controls with speed slider
   subTask.play = function() {
      this.clearAnalysis();

      if ((this.context.runner === undefined) || !this.context.runner.isRunning()) {
         this.run();
      } else if (this.context.runner.stepMode) {
         this.context.runner.run();
      }
   };

   subTask.getAnswerObject = function() {
      this.blocklyHelper.savePrograms();

      this.answer = this.blocklyHelper.programs;
      return this.answer;
   };

   subTask.reloadAnswerObject = function(answerObj) {
      if(typeof answerObj == "undefined") {
         this.answer = this.getDefaultAnswerObject();
      } else {
         this.answer = answerObj;
      }
      this.blocklyHelper.programs = this.answer;
      if (this.answer != undefined) {
         this.blocklyHelper.loadPrograms();
      }
      window.quickAlgoInterface.updateBestAnswerStatus();
   };

   subTask.getDefaultAnswerObject = function() {
      var defaultBlockly = this.blocklyHelper.getDefaultContent();
      return [{javascript:"", blockly: defaultBlockly, blocklyJS: ""}];
   };

   subTask.changeTest = function(delta) {
      var newTest = subTask.iTestCase + delta;
      if ((newTest >= 0) && (newTest < this.nbTestCases)) {
         if(this.context.runner) {
            this.context.runner.stop();
         }
         initContextForLevel(newTest);
         if(window.quickAlgoInterface) {
            window.quickAlgoInterface.displayError(null);
            if(subTask.context.display) {
               window.quickAlgoInterface.updateTestSelector(newTest);
            }
         }
      }
   };

   subTask.changeTestTo = function(iTest) {
      var delta = iTest - subTask.iTestCase;
      if(delta != 0) {
         subTask.changeTest(delta);
      }
   };

   subTask.getGrade = function(callback, display, mainTestCase) {
      // mainTest : set to indicate the first iTestCase to test (typically,
      // current iTestCase) before others; test will then stop if the
      if(subTask.context.infos && subTask.context.infos.hideValidate) {
         // There's no validation
         callback({
            message: '',
            successRate: 1,
            iTestCase: 0
         });
         return;
      }

      // XXX :: Related to platform-pr.js#L67 : why does it start two
      // evaluations at the same time? This can cause serious issues with the
      // Python runner, and on some contexts such as quick-pi
      if(window.subTaskValidating && window.subTaskValidationAttempts < 5) {
         setTimeout(function() { subTask.getGrade(callback, display, mainTestCase); }, 1000);
         window.subTaskValidationAttempts += 1;
         console.log("Queueing validation... (attempt " + window.subTaskValidationAttempts + ")");
         return;
      }
      window.subTaskValidationAttempts = 0;
      window.subTaskValidating = true;

      var oldDelay = subTask.context.infos.actionDelay;
      subTask.context.changeDelay(0);
      var code = subTask.blocklyHelper.getCodeFromXml(subTask.answer[0].blockly, "javascript");
      code = subTask.blocklyHelper.getFullCode(code);

      var checkError = '';
      var checkDisplay = function(err) { checkError = err; }
      if(!subTask.blocklyHelper.checkCode(code, checkDisplay)) {
         var results = {
            message: checkError,
            successRate: 0,
            iTestCase: 0
         };
         subTask.context.changeDelay(oldDelay);
         window.subTaskValidating = false;
         callback(results);
         return;
      }

      var codes = [code]; // We only ever send one code to grade
      var oldTestCase = subTask.iTestCase;

      /*      var levelResultsCache = window.taskResultsCache[this.level];

            if(levelResultsCache[code]) {
               // We already have a cached result for that
               window.quickAlgoInterface.updateTestScores(levelResultsCache[code].fullResults);
               subTask.context.changeDelay(oldDelay);
               callback(levelResultsCache[code].results);
               return;
            }*/

      function startEval() {
         // Start evaluation on iTestCase
         initContextForLevel(subTask.iTestCase);
         subTask.testCaseResults[subTask.iTestCase] = {evaluating: true};
         if(display) {
            window.quickAlgoInterface.updateTestScores(subTask.testCaseResults);
         }
         subTask.context.runner.runCodes(codes);
      }

      function postEval() {
         // Behavior after an eval
         if(typeof mainTestCase == 'undefined') {
            // Normal behavior : evaluate all tests
            subTask.iTestCase++;
            if (subTask.iTestCase < subTask.nbTestCases) {
               startEval();
               return;
            }
         } else if(subTask.testCaseResults[subTask.iTestCase].successRate >= 1) {
            // A mainTestCase is defined, evaluate mainTestCase first then the
            // others until a test fails
            if(subTask.iTestCase == mainTestCase && subTask.iTestCase != 0) {
               subTask.iTestCase = 0;
               startEval();
               return;
            }
            subTask.iTestCase++;
            if(subTask.iTestCase == mainTestCase) { subTask.iTestCase++ }; // Already done
            if (subTask.iTestCase < subTask.nbTestCases) {
               startEval();
               return;
            }
         }

         // All evaluations done, tally results
         subTask.iTestCase = oldTestCase;
         if(typeof mainTestCase == 'undefined') {
            var iWorstTestCase = 0;
            var worstRate = 1;
         } else {
            // Priority to the mainTestCase if worst test case
            var iWorstTestCase = mainTestCase;
            var worstRate = subTask.testCaseResults[mainTestCase].successRate;
            // Change back to the mainTestCase
         }
         var nbSuccess = 0;
         for (var iCase = 0; iCase < subTask.nbTestCases; iCase++) {
            var sr = subTask.testCaseResults[iCase] ? subTask.testCaseResults[iCase].successRate : 0;
            if(sr >= 1) {
               nbSuccess++;
            }
            if(sr < worstRate) {
               worstRate = sr;
               iWorstTestCase = iCase;
            }
         }
         subTask.testCaseResults[iWorstTestCase].iTestCase = iWorstTestCase;
         if(display) {
            window.quickAlgoInterface.updateTestScores(subTask.testCaseResults);
         }
         if(subTask.testCaseResults[iWorstTestCase].successRate < 1) {
            if(subTask.nbTestCases == 1) {
               var msg = subTask.testCaseResults[iWorstTestCase].message;
            } else if(nbSuccess > 0) {
               var msg = languageStrings.resultsPartialSuccess.format({
                  nbSuccess: nbSuccess,
                  nbTests: subTask.nbTestCases
               });
            } else {
               var msg = languageStrings.resultsNoSuccess;
            }
            var results = {
               message: msg,
               successRate: subTask.testCaseResults[iWorstTestCase].successRate,
               iTestCase: iWorstTestCase
            };
         } else {
            var results = subTask.testCaseResults[iWorstTestCase];
         }
         /*levelResultsCache[code] = {
            results: results,
            fullResults: subTask.testCaseResults
            };*/
         subTask.context.changeDelay(oldDelay);
         window.subTaskValidating = false;
         callback(results);
         window.quickAlgoInterface.updateBestAnswerStatus();
      }

      initBlocklyRunner(subTask.context, function(message, success) {
         // Record grade from this evaluation into testCaseResults
         var computeGrade = function(context, message) {
            var rate = 0;
            if (context.success) {
               rate = 1;
            }
            return {
               successRate: rate,
               message: message
            };
         }
         if (subTask.levelGridInfos.computeGrade != undefined) {
            computeGrade = subTask.levelGridInfos.computeGrade;
         }
         subTask.testCaseResults[subTask.iTestCase] = computeGrade(subTask.context, message)
         postEval();
      });

      subTask.iTestCase = typeof mainTestCase != 'undefined' ? mainTestCase : 0;
      subTask.testCaseResults = [];
      for(var i=0; i < subTask.iTestCase; i++) {
         // Fill testCaseResults up to the first iTestCase
         subTask.testCaseResults.push(null);
      }
      subTask.context.linkBack = true;
      subTask.context.messagePrefixSuccess = window.languageStrings.allTests;

      startEval();
   };
}

var quickAlgoContext = function(display, infos) {
  var context = {
    display: display,
    infos: infos,
    nbRobots: 1
    };

  // Set the localLanguageStrings for this context
  context.setLocalLanguageStrings = function(localLanguageStrings) {
    if(window.BlocksHelper && infos && infos.blocksLanguage) {
      localLanguageStrings = BlocksHelper.mutateBlockStrings(
        localLanguageStrings,
        infos.blocksLanguage
        );
    }

    context.localLanguageStrings = localLanguageStrings;
    window.stringsLanguage = window.stringsLanguage || "fr";
    window.languageStrings = window.languageStrings || {};

    if (typeof window.languageStrings != "object") {
      console.error("window.languageStrings is not an object");
    } else { // merge translations
      $.extend(true, window.languageStrings, localLanguageStrings[window.stringsLanguage]);
    }
    context.strings = window.languageStrings;
    return context.strings;
  };

  // Import more language strings
  context.importLanguageStrings = function(source, dest) {
    if ((typeof source != "object") || (typeof dest != "object")) {
      return;
    }
    for (var key1 in source) {
      if (dest[key1] != undefined) {
        if (typeof dest[key1] == "object") {
          replaceStringsRec(source[key1], dest[key1]);
        } else {
          dest[key1] = source[key1];
        }
      }
    }
  };

  // Default implementations
  context.changeDelay = function(newDelay) {
    // Change the action delay while displaying
    infos.actionDelay = newDelay;
  };

  context.waitDelay = function(callback, value) {
    // Call the callback with value after actionDelay
    if(context.runner) {
      context.runner.waitDelay(callback, value, infos.actionDelay);
    } else {
      // When a function is used outside of an execution
      setTimeout(function () { callback(value); }, infos.actionDelay);
    }
  };

  context.callCallback = function(callback, value) {
    // Call the callback with value directly
    if(context.runner) {
      context.runner.noDelay(callback, value);
    } else {
      // When a function is used outside of an execution
      callback(value);
    }
  };

  context.debug_alert = function(message, callback) {
    // Display debug information
    message = message ? message.toString() : '';
    if (context.display) {
      alert(message);
    }
    context.callCallback(callback);
  };

  // Placeholders, should be actually defined by the library
  context.reset = function() {
    // Reset the context
    if(display) {
      context.resetDisplay();
    }
  };

  context.resetDisplay = function() {
    // Reset the context display
  };

  context.updateScale = function() {
    // Update the display scale when the window is resized for instance
  };

  context.unload = function() {
    // Unload the context, cleaning up
  };

  context.provideBlocklyColours = function() {
    // Provide colours for Blockly
    return {};
  };

  context.program_end = function(callback) {
    var curRobot = context.curRobot;
    if (!context.programEnded[curRobot]) {
      context.programEnded[curRobot] = true;
      infos.checkEndCondition(context, true);
    }
    context.waitDelay(callback);
  };

  // Properties we expect the context to have
  context.localLanguageStrings = {};
  context.customBlocks = {};
  context.customConstants = {};
  context.conceptList = [];

  return context;
};


// Global variable allowing access to each getContext
var quickAlgoLibraries = {
  libs: {},
  order: [],
  contexts: {},
  mergedMode: false,

  get: function(name) {
    return this.libs[name];
  },

  getContext: function() {
    // Get last context registered
    if(this.order.length) {
      if(this.mergedMode) {
        var gc = this.getMergedContext();
        return gc.apply(gc, arguments);
      } else {
        var gc = this.libs[this.order[this.order.length-1]];
        return gc.apply(gc, arguments);
      }
    } else {
      if(getContext) {
        return getContext.apply(getContext, arguments);
      } else {
        throw "No context registered!";
      }
    }
  },

  setMergedMode: function(options) {
    // Set to retrieve a context merged from all contexts registered
    // options can be true or an object with the following properties:
    // -displayed: name of module to display first
    this.mergedMode = options;
  },

  getMergedContext: function() {
    // Make a context merged from multiple contexts
    if(this.mergedMode.displayed && this.order.indexOf(this.mergedMode.displayed) > -1) {
      this.order.splice(this.order.indexOf(this.mergedMode.displayed), 1);
      this.order.unshift(this.mergedMode.displayed);
    }
    var that = this;

    return function(display, infos) {
      // Merged context
      var context = quickAlgoContext(display, infos);
      var localLanguageStrings = {};
      context.customBlocks = {};
      context.customConstants = {};
      context.conceptList = [];

      var subContexts = [];
      for(var scIdx=0; scIdx < that.order.length; scIdx++) {
        // Only the first context gets display = true
        var newContext = that.libs[that.order[scIdx]](display && (scIdx == 0), infos);
        subContexts.push(newContext);

        // Merge objects
        mergeIntoObject(localLanguageStrings, newContext.localLanguageStrings);
        mergeIntoObject(context.customBlocks, newContext.customBlocks);
        mergeIntoObject(context.customConstants, newContext.customConstants);
        mergeIntoArray(context.conceptList, newContext.conceptList);

        // Merge namespaces
        for(var namespace in newContext.customBlocks) {
          if(!context[namespace]) { context[namespace] = {}; }
          for(var category in newContext.customBlocks[namespace]) {
            var blockList = newContext.customBlocks[namespace][category];
            for(var i=0; i < blockList.length; i++) {
              var name = blockList[i].name;
              if(name && !context[namespace][name] && newContext[namespace][name]) {
                context[namespace][name] = function(nc, func) {
                  return function() {
                    context.propagate(nc);
                    func.apply(nc, arguments);
                    };
                }(newContext, newContext[namespace][name]);
              }
            }
          }
        }
      }

      var strings = context.setLocalLanguageStrings(localLanguageStrings);

      // Propagate properties to the subcontexts
      context.propagate = function(subContext) {
        var properties = ['raphaelFactory', 'delayFactory', 'blocklyHelper', 'display', 'runner'];
        for(var i=0; i < properties.length; i++) {
          subContext[properties[i]] = context[properties[i]];
        }
      }

      // Merge functions
      context.reset = function(taskInfos) {
        for(var i=0; i < subContexts.length; i++) {
          context.propagate(subContexts[i]);
          subContexts[i].reset(taskInfos);
        }
      };
      context.resetDisplay = function() {
        for(var i=0; i < subContexts.length; i++) {
          context.propagate(subContexts[i]);
          subContexts[i].resetDisplay();
        }
      };
      context.updateScale = function() {
        for(var i=0; i < subContexts.length; i++) {
          context.propagate(subContexts[i]);
          subContexts[i].updateScale();
        }
      };
      context.unload = function() {
        for(var i=subContexts.length-1; i >= 0; i--) {
          // Do the unload in reverse order
          context.propagate(subContexts[i]);
          subContexts[i].unload();
        }
      };
      context.provideBlocklyColours = function() {
        var colours = {};
        for(var i=0; i < subContexts.length; i++) {
          mergeIntoObject(colours, subContexts[i].provideBlocklyColours());
        }
        return colours;
      };

      // Fetch some other data / functions some contexts have
      for(var i=0; i < subContexts.length; i++) {
        for(var prop in subContexts[i]) {
          if(typeof context[prop] != 'undefined') { continue; }
          if(typeof subContexts[i][prop] == 'function') {
            context[prop] = function(sc, func) {
              return function() {
                context.propagate(sc);
                func.apply(sc, arguments);
              }
            }(subContexts[i], subContexts[i][prop]);
          } else {
            context[prop] = subContexts[i][prop];
          }
        }
      };

      return context;
    };
  },

  register: function(name, func) {
    if(this.order.indexOf(name) > -1) { return; }
    this.libs[name] = func;
    this.order.push(name);
  }
};

// Initialize with contexts loaded before
if(window.quickAlgoLibrariesList) {
  for(var i=0; i<quickAlgoLibrariesList.length; i++) {
    quickAlgoLibraries.register(quickAlgoLibrariesList[i][0], quickAlgoLibrariesList[i][1]);
  }
}