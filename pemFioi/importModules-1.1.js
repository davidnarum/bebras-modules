(function () {

var importedModules = {};

var importableModules = function () {
   // Wait to have modulesPath defined before executing the function
   return {
      'jquery-1.7.1': {src: modulesPath+"/ext/jquery/1.7/jquery.min.js", id: "http://code.jquery.com/jquery-1.7.1.min.js"},
      'jquery-ui.touch-punch': {src: modulesPath+"/ext/jquery-ui/jquery.ui.touch-punch.min.js", id: "jquery.ui.touch-punch.min.js"},
      'JSON-js': {src: modulesPath+"/ext/json/json2.min.js", id: "https://github.com/douglascrockford/JSON-js"},
      'raphael-2.2.1': {src: modulesPath+"/ext/raphael/2.2.1/raphael.min.js", id: "http://cdnjs.cloudflare.com/ajax/libs/raphael/2.2.1/raphael.min.js"},
      'beaver-task-2.0': {src: modulesPath+"/pemFioi/beaver-task-2.0.js", id: "http://www.france-ioi.org/modules/pemFioi/beaver-task-2.0.js"},
      'jschannel': {src: modulesPath+"/ext/jschannel/jschannel.js", id: "http://www.france-ioi.org/modules/ext/jschannel/jschannel.js"},
      'raphaelFactory-1.0': {src: modulesPath+"/pemFioi/raphaelFactory-1.0.js", id: "http://www.france-ioi.org/modules/pemFioi/raphaelFactory-1.0.js"},
      'delayFactory-1.0': {src: modulesPath+"/pemFioi/delayFactory-1.0.js", id: "http://www.france-ioi.org/modules/pemFioi/delayFactory-1.0.js"},
      'simulationFactory-1.0': {src: modulesPath+"/pemFioi/simulationFactory-1.0.js", id: "http://www.france-ioi.org/modules/pemFioi/simulationFactory-1.0.js"},
      'beav-1.0': {src: modulesPath+"/pemFioi/beav-1.0.js", id: "http://www.france-ioi.org/modules/pemFioi/beav-1.0.js"},
      'raphael-2.1': {src: modulesPath+"/ext/raphael/2.1/raphael-min.js", id: "http://cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"},
      'simulation-2.0': {src: modulesPath+"/pemFioi/simulation-2.0.js", id: "http://www.france-ioi.org/modules/pemFioi/simulation-2.0.js"},
      'raphaelButton-1.0': {src: modulesPath+"/pemFioi/raphaelButton-1.0.js", id: "http://www.france-ioi.org/modules/pemFioi/raphaelButton-1.0.js"},
      'graph-1.0': {src: modulesPath+"/pemFioi/graph-1.0.js", id: "http://www.france-ioi.org/modules/pemFioi/graph-1.0.js"},
      'visual-graph-1.0': {src: modulesPath+"/pemFioi/visual-graph-1.0.js", id: "http://www.france-ioi.org/modules/pemFioi/visual-graph-1.0.js"},
      'graph-mouse-1.0': {src: modulesPath+"/pemFioi/graph-mouse-1.0.js", id: "http://www.france-ioi.org/modules/pemFioi/graph-mouse-1.0.js"},
      'crane-1.0': {src: modulesPath+"/pemFioi/crane-1.0.js", id: "http://www.france-ioi.org/modules/pemFioi/crane-1.0.js"},
      'grid-1.0': {src: modulesPath+"/pemFioi/grid-1.0.js", id: "http://www.france-ioi.org/modules/pemFioi/grid-1.0.js"},
      'drag_lib-2.0': {src: modulesPath+"/pemFioi/drag_lib-2.0.js", id: "http://www.france-ioi.org/modules/pemFioi/drag_lib-2.0.js"},
      'randomGenerator-1.0': {src: modulesPath+"/pemFioi/randomGenerator-1.0.js", id: "http://www.france-ioi.org/modules/pemFioi/randomGenerator-1.0.js"},
      'simpleKeyboard-1.0': {src: modulesPath+"/pemFioi/simpleKeyboard-1.0.js", id: "http://www.france-ioi.org/modules/pemFioi/simpleKeyboard-1.0.js"},

      'platform-pr': {classStr: "proxy module", src: modulesPath+"/integrationAPI.01/official/platform-pr.js", id: "http://www.france-ioi.org/modules/integrationAPI.01/official/platform-pr.js"},
      'buttonsAndMessages': {classStr: "stdButtonsAndMessages module", src: modulesPath+"/integrationAPI.01/installationAPI.01/pemFioi/buttonsAndMessages.js",  id: "http://www.france-ioi.org/modules/integrationAPI.01/installationAPI.01/pemFioi/buttonsAndMessages.js"},
      'installationAPI.01': {classStr: "remove", src: modulesPath+"/integrationAPI.01/installationAPI.01/pemFioi/installation.js"},
      'miniPlatform': {classStr: "remove", src: modulesPath+"/integrationAPI.01/official/miniPlatform.js"},

      'acorn': {src: modulesPath+"/ext/js-interpreter/acorn.js", id: "acorn"},
      'interpreter': {src: modulesPath+"/ext/js-interpreter/interpreter.js", id: "interpreter"},
      'ace': {src: modulesPath+"/ext/ace/ace.js", id: "ace"},
      'ace_python': {src: modulesPath+"/ext/ace/mode-python.js", id: "ace_python"},
      'processing-1.4.8': {src: modulesPath+"/ext/processing/1.4.8/processing.min.js", id: "https://raw.github.com/processing-js/processing-js/v1.4.8/processing.min.js"},

      'taskStyles-0.1': {type: "stylesheet", src: modulesPath+"/pemFioi/taskStyles-0.1.css", id: "http://www.france-ioi.org/modules/pemFioi/taskStyles-0.1.css"},

      'conceptDisplay-1.0': {src: modulesPath+"/pemFioi/conceptDisplay-1.0.js", id: "concept_display"},
      'conceptViewer-1.0': {src: modulesPath+"/pemFioi/conceptViewer-1.0.js", id: "concept_viewer"},

      'blockly': {src: modulesPath+"/ext/blockly/blockly_compressed.js", id: "blockly"},
      'blockly_blocks': {src: modulesPath+"/ext/blockly/blocks_compressed.js", id: "blockly_blocks"},
      'blockly_javascript': {src: modulesPath+"/ext/blockly/javascript_compressed.js", id: "blockly_javascript"},
      'blockly_python': {src: modulesPath+"/ext/blockly/python_compressed.js", id: "blockly_python"},
      'blockly_fr': {src: modulesPath+"/ext/blockly/fr.js", id: "blockly_fr"},
      'blockly_en': {src: modulesPath+"/ext/blockly/en.js", id: "blockly_en"},
      'blockly_de': {src: modulesPath+"/ext/blockly/de.js", id: "blockly_de"},
      'blockly_es': {src: modulesPath+"/ext/blockly/es.js", id: "blockly_es"},
      'blockly_fioi': {src: modulesPath+"/ext/blockly-fioi/fioi-blockly.min.js", id: "blockly_fioi"},

      'blocklyRobot_lib': {src: modulesPath+"/pemFioi/blocklyRobot_lib-0.9.1.js", id: "blocklyRobot_lib"},
      'blockly-robot': {src: modulesPath+"/pemFioi/blocklyRobot_lib-0.9.1.js", id: "blocklyRobot_lib"}, // for BWINF legacy
      'blockly-printer': {src: modulesPath+"/pemFioi/blocklyPrinter_lib.js", id: "blocklyPrinter_lib"},
      'blockly-turtle': {src: modulesPath+"/pemFioi/blocklyTurtle_lib.js", id: "blocklyTurtle_lib"},
      'blockly-processing': {src: modulesPath+"/pemFioi/blocklyProcessing_lib.js", id: "blocklyProcessing_lib"},
      'blockly-example': {src: modulesPath+"/pemFioi/blocklyExample_lib.js", id: "blocklyExample_lib"},
      'jwinf_css': {type: "stylesheet", src: modulesPath+"/pemFioi/jwinf.css", id: "jwinf_css"}, // for BWINF

      'quickAlgo_utils': {src: modulesPath+"/pemFioi/quickAlgo/utils.js", id: "quickAlgo_utils"},
      'quickAlgo_i18n': {src: modulesPath+"/pemFioi/quickAlgo/i18n.js", id: "quickAlgo_i18n"},
      'quickAlgo_interface': {src: modulesPath+"/pemFioi/quickAlgo/interface.js", id: "quickAlgo_interface"},
      'quickAlgo_blockly_blocks': {src: modulesPath+"/pemFioi/quickAlgo/blockly_blocks.js", id: "quickAlgo_blockly_blocks"},
      'quickAlgo_blockly_interface': {src: modulesPath+"/pemFioi/quickAlgo/blockly_interface.js", id: "quickAlgo_blockly_interface"},
      'quickAlgo_blockly_runner': {src: modulesPath+"/pemFioi/quickAlgo/blockly_runner.js", id: "quickAlgo_blockly_runner"},
      'quickAlgo_python_interface': {src: modulesPath+"/pemFioi/quickAlgo/python_interface.js", id: "quickAlgo_python_interface"},
      'quickAlgo_python_runner': {src: modulesPath+"/pemFioi/quickAlgo/python_runner.js", id: "quickAlgo_python_runner"},
      'quickAlgo_subtask': {src: modulesPath+"/pemFioi/quickAlgo/subtask.js", id: "quickAlgo_subtask"},
      'quickAlgo_context': {src: modulesPath+"/pemFioi/quickAlgo/context.js", id: "quickAlgo_context"},
      'quickAlgo_css': {type: "stylesheet", src: modulesPath+"/pemFioi/quickAlgo/quickAlgo.css", id: "quickAlgo_css"},

      'scratch': {src: modulesPath+"/ext/scratch/blockly_compressed_vertical.js", id: "scratch"},
      'scratch_blocks_common': {src: modulesPath+"/ext/scratch/blocks_compressed.js", id: "scratch_blocks_common"},
      'scratch_blocks': {src: modulesPath+"/ext/scratch/blocks_compressed_vertical.js", id: "scratch_blocks"},
      'scratch_fixes': {src: modulesPath+"/ext/scratch/fixes.js", id: "scratch_fixes"},
      'scratch_procedures': {src: modulesPath+"/ext/scratch/procedures.js", id: "scratch_procedures"},

      'python_count': {src: modulesPath+"/pemFioi/pythonCount-1.0.js", id: "python_count"},
      'skulpt_quickAlgo': {src: modulesPath+"ext/skulpt/skulpt.quickAlgo.min.js", id: "skulpt_quickAlgo"},
      'skulpt_stdlib': {src: modulesPath+"ext/skulpt/skulpt-stdlib.js", id: "skulpt_stdlib"},
      'skulpt_debugger': {src: modulesPath+"ext/skulpt/debugger.js", id: "skulpt_debugger"}
   }
}

var languageScripts = function () {
   var strLang = window.stringsLanguage ? window.stringsLanguage : 'fr';
   return {
      blockly: [
         'acorn',
         'interpreter',
         'blockly',
         'blockly_blocks',
         'blockly_javascript',
         'blockly_python',
         'blockly_' + strLang,
         'blockly_fioi',
         'quickAlgo_utils',
         'quickAlgo_i18n',
         'quickAlgo_interface',
         'quickAlgo_blockly_blocks',
         'quickAlgo_blockly_interface',
         'quickAlgo_blockly_runner',
         'quickAlgo_subtask',
         'quickAlgo_context',
         'quickAlgo_css'
      ],
      scratch: [
         'acorn',
         'interpreter',
         'scratch',
         'scratch_blocks_common',
         'scratch_blocks',
         'blockly_javascript',
         'blockly_python',
         'blockly_' + strLang,
         'blockly_fioi',
         'scratch_fixes',
         'scratch_procedures',
         'quickAlgo_utils',
         'quickAlgo_i18n',
         'quickAlgo_interface',
         'quickAlgo_blockly_blocks',
         'quickAlgo_blockly_interface',
         'quickAlgo_blockly_runner',
         'quickAlgo_subtask',
         'quickAlgo_context',
         'quickAlgo_css'
      ],
      python: [
         'python_count',
         'ace',
         'ace_python',
         'skulpt_quickAlgo',
         'skulpt_stdlib',
         'skulpt_debugger',
         'quickAlgo_utils',
         'quickAlgo_i18n',
         'quickAlgo_interface',
         'quickAlgo_python_interface',
         'quickAlgo_python_runner',
         'quickAlgo_subtask',
         'quickAlgo_context',
         'quickAlgo_css'
      ]
   }
}


// from http://stackoverflow.com/questions/979975/
var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
}();


function importModules(modulesList) {
   if(typeof importableModules == 'function') {
      importableModules = importableModules();
   };
   var modulesStr = '';
   for(var iMod in modulesList) {
      var moduleName = modulesList[iMod];
      var curModule = importableModules[moduleName];
      if(curModule) {
         // Avoid importing the same module twice
         if(importedModules[moduleName] === true) {
            continue;
         } else {
            importedModules[moduleName] = true;
         }

         var modClass = curModule.classStr ? curModule.classStr : 'module';
         var modSrc = curModule.src;
         var modId = curModule.id ? curModule.id : moduleName;
         if(curModule.type == 'stylesheet') {
            modulesStr += '<link class="'+modClass+'" rel="stylesheet" type="text/css" href="'+modSrc+'" id="'+modId+'">';
         } else {
            modulesStr += '<script class="'+modClass+'" type="text/javascript" src="'+modSrc+'" id="'+modId+'"></script>';
         }
      } else {
         console.error("Module '"+moduleName+"' unknown.");
      }
   }
   document.write(modulesStr);
}


function conditionalLanguageElements(lang) {
   var elemList = document.querySelectorAll('[data-lang]');

   for(var iElem=0; iElem< elemList.length; iElem++) {
      elem = elemList[iElem];
      var elemLangs = elem.getAttribute('data-lang').split(' ');
      var elemOk = false;
      for (var i=0; i<elemLangs.length; i++) {
         if(elemLangs[i] == lang) {
            elemOk = true;
            break;
         }
      }
      if(!elemOk) {
         if(typeof elem.remove === 'function') {
            elem.remove();
         } else {
            elem.outerHTML = ''; // IE11 support
         }
      }
   }
}


function importLanguageModules(defaultLang) {
   // Default language
   var lang = QueryString.language ? QueryString.language : defaultLang;

   if(typeof languageScripts == 'function') {
      languageScripts = languageScripts();
   };

   if(!languageScripts[lang]) {
      console.error("Language "+lang+" unknown, couldn't load scripts.");
   }

   importModules(languageScripts[lang]);

   if(!window.preprocessingFunctions) { window.preprocessingFunctions = []; }
   var fct = function () { conditionalLanguageElements(lang); };
   window.preprocessingFunctions.push(fct);
   window.addEventListener('DOMContentLoaded', fct);
}

window.importModules = importModules;
window.conditionalLanguageElements = conditionalLanguageElements;
window.importLanguageModules = importLanguageModules;

})();
