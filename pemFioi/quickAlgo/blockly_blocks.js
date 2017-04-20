/*
    blockly_blocks:
        Block generation and configuration logic for the Blockly mode
*/

"use strict";

// Blockly to Scratch translations
var blocklyToScratch = {
   singleBlocks: {
      'controls_if': ['control_if'],
      'controls_if_else': ['control_if_else'],
      'controls_repeat': ['control_repeat'],
      'controls_repeat_ext': ['control_repeat'],
      'controls_whileUntil': ['control_repeat_until'],
      'controls_untilWhile': ['control_repeat_until'],
      'logic_negate': ['operator_not'],
      'logic_boolean': [],
      'logic_compare': ['operator_equals', 'operator_gt', 'operator_lt'],
      'logic_operation': ['operator_and', 'operator_or'],
      'text_join': ['operator_join'],
      'math_arithmetic': ['operator_add', 'operator_subtract', 'operator_multiply', 'operator_divide'],
      'math_number': [],
    }
};

function getBlocklyBlockFunctions(maxBlocks, nbTestCases) {
   // TODO :: completely split the logic so it can be a separate object

   return {
      getCodeFromXml: function(xmlText, language) {
         try {
           var xml = Blockly.Xml.textToDom(xmlText)
         } catch (e) {
           alert(e);
           return;
         }
         // New workspaces need options, else they can give unpredictable results
         var tmpOptions = new Blockly.Options({});
         var tmpWorkspace = new Blockly.Workspace(tmpOptions);
         if(this.scratchMode) {
            // Make sure it has the right information from this blocklyHelper
            tmpWorkspace.maxBlocks = function () { return maxBlocks; };
         }
         Blockly.Xml.domToWorkspace(xml, tmpWorkspace);
         return this.getCode(language, tmpWorkspace);
      },

      getCode: function(language, codeWorkspace) {
         if (codeWorkspace == undefined) {
            codeWorkspace = this.workspace;
         }
         if(codeWorkspace.remainingCapacity() < 0) {
            // Safeguard: avoid generating code when we use too many blocks
            return '';
         }
         var blocks = codeWorkspace.getTopBlocks(true);
         var languageObj = null;
         if (language == "javascript") {
            languageObj = Blockly.JavaScript;
         }
         if (language == "python") {
            languageObj = Blockly.Python;
         }
         languageObj.init(codeWorkspace);

         var code = [];
         var comments = [];
         for (var b = 0; b < blocks.length; b++) {
            var block = blocks[b];
            var blockCode = languageObj.blockToCode(block);
            if (arrayContains(["procedures_defnoreturn", "procedures_defreturn"], block.type)) {
               // For function blocks, the code is stored in languageObj.definitions_
            } else {
               if (block.type == "robot_start" || !this.startingBlock) {
                  comments.push(blockCode);
               }
            }
         }

         for (var def in languageObj.definitions_) {
            code.push(languageObj.definitions_[def]);
         }

         var code = code.join("\n");
         code += comments.join("\n");
         return code;
      },

      completeBlockHandler: function(block, objectName, context) {
         if (typeof block.handler == "undefined") {
            block.handler = context[objectName][block.name];
         }


         if (typeof block.handler == "undefined") {
            block.handler = (function(oName, bName) {
               return function() { console.error("Error: No handler given. No function context." + oName + "." + bName + "() found!" ); }
            })(objectName, block.name);
         }
      },
      completeBlockJson: function(block, objectName, categoryName, context) {
         // Needs context object solely for the language strings. Maybe change that …
         
         if (typeof block.blocklyJson == "undefined") {
            block.blocklyJson =  {};
         }

         // Set block name
         if (typeof block.blocklyJson.type == "undefined") {
            block.blocklyJson.type = block.name;
         }

         // Add connectors (top-bottom or left)
         if (typeof block.blocklyJson.output == "undefined" &&
             typeof block.blocklyJson.previousStatement == "undefined" &&
             typeof block.blocklyJson.nextStatement == "undefined" &&
             !(block.noConnectors)) {
            if (block.yieldsValue) {
               block.blocklyJson.output = null;
               if(this.scratchMode) {
                   block.blocklyJson.outputShape = Blockly.OUTPUT_SHAPE_HEXAGONAL;
                   block.blocklyJson.colour = Blockly.Colours.sensing.primary;
                   block.blocklyJson.colourSecondary = Blockly.Colours.sensing.secondary;
                   block.blocklyJson.colourTertiary = Blockly.Colours.sensing.tertiary;
               }
            }
            else {
               block.blocklyJson.previousStatement = null;
               block.blocklyJson.nextStatement = null;
               if(this.scratchMode) {
                   block.blocklyJson.colour = Blockly.Colours.motion.primary;
                   block.blocklyJson.colourSecondary = Blockly.Colours.motion.secondary;
                   block.blocklyJson.colourTertiary = Blockly.Colours.motion.tertiary;
               }
            }
         }

         // Add parameters
         if (typeof block.blocklyJson.args0 == "undefined" &&
             typeof block.params != "undefined" &&
             block.params.length > 0) {
            block.blocklyJson.args0 = [];
            for (var iParam = 0; iParam < block.params.length; iParam++) {
               var param = {
                  type: "input_value",
                  name: "PARAM_" + iParam
               }
                  
               if (block.params[iParam] != null) {
                  param.check = block.params[iParam]; // Should be a string!
               }
               block.blocklyJson.args0.push(param);
            }
         }

         // Add message string
         if (typeof block.blocklyJson.message0 == "undefined") {
            block.blocklyJson.message0 = context.strings.label[block.name];

            if (typeof block.blocklyJson.message0 == "undefined") {
               block.blocklyJson.message0 = "<translation missing: " + block.name + ">";
            }

            // append all missing params to the message string
            if (typeof block.blocklyJson.args0 != "undefined") {
               var alreadyInserted = (block.blocklyJson.message0.match(/%/g) || []).length;
               for (var iArgs0 = alreadyInserted; iArgs0 < block.blocklyJson.args0.length; iArgs0++) {
                  if (block.blocklyJson.args0[iArgs0].type == "input_value"
                      || block.blocklyJson.args0[iArgs0].type == "field_number"
                      || block.blocklyJson.args0[iArgs0].type == "field_angle"
                      || block.blocklyJson.args0[iArgs0].type == "field_colour"
                      || block.blocklyJson.args0[iArgs0].type == "field_dropdown") {
                     block.blocklyJson.message0 += " %" + (iArgs0 + 1);
                  }
               }
            }
         }

         // Tooltip & HelpUrl should always exist, so lets just add empty ones in case they don't exist
         if (typeof block.blocklyJson.tooltip == "undefined") { block.blocklyJson.tooltip = ""; }
         if (typeof block.blocklyJson.helpUrl == "undefined") { block.blocklyJson.helpUrl = ""; } // TODO: Or maybe not?

         // TODO: Load default colours + custom styles
         if (typeof block.blocklyJson.colour == "undefined") {
            if(this.scratchMode) {
               block.blocklyJson.colour = Blockly.Colours.motion.primary;
               block.blocklyJson.colourSecondary = Blockly.Colours.motion.secondary;
               block.blocklyJson.colourTertiary = Blockly.Colours.motion.tertiary;
            } else {
               var colours = this.getDefaultColours();
               block.blocklyJson.colour = 210; // default: blue
               if ("blocks" in colours &&  block.name in colours.blocks) {
                  block.blocklyJson.colour = colours.blocks[block.name];                  
               }
               else if ("categories" in colours) {
                  if (categoryName in colours.categories) {
                     block.blocklyJson.colour = colours.categories[categoryName];                     
                  }
                  else if ("_default" in colours.categories) {
                     block.blocklyJson.colour = colours.categories["_default"];                     
                  }
               }
            }            
         }
      }, 
      completeBlockXml: function(block) {
         if (typeof block.blocklyXml == "undefined" || block.blocklyXml == "") {
            block.blocklyXml = "<block type='" + block.name + "'></block>";
         }
      },
      completeCodeGenerators: function(blockInfo, objectName) {
         if (typeof blockInfo.codeGenerators == "undefined") {
            blockInfo.codeGenerators = {};
         }

         // for closure:
         var args0 = blockInfo.blocklyJson.args0;
         var code = this.mainContext.strings.code[blockInfo.name];
         var output = blockInfo.blocklyJson.output;
         
         for (var language in {JavaScript: null, Python: null}) {
            if (typeof blockInfo.codeGenerators[language] == "undefined") {
               // Prevent the function name to be used as a variable
               Blockly[language].addReservedWords(code);
               function setCodeGeneratorForLanguage(language) {
                  blockInfo.codeGenerators[language] = function(block) {
                     var params = "";               

                     /* There are three kinds of input: value_input, statement_input and dummy_input,
                        We should definitely consider value_input here and not consider dummy_input here.

                        I don't know how statement_input is handled best, so I'll ignore it first -- Robert
                      */
                     var iParam = 0;
                     for (var iArgs0 in args0) {
                        if (args0[iArgs0].type == "input_value") {
                           if (iParam) {
                              params += ", ";
                           }
                           params += Blockly[language].valueToCode(block, 'PARAM_' + iParam, Blockly[language].ORDER_ATOMIC);
                           iParam += 1;
                        }
                        if (args0[iArgs0].type == "field_number"
                            || args0[iArgs0].type == "field_angle"
                            || args0[iArgs0].type == "field_dropdown") {
                           if (iParam) {
                              params += ", ";
                           }
                           params += block.getFieldValue('PARAM_' + iParam);
                           iParam += 1;
                        }
                        if (args0[iArgs0].type == "field_colour") {
                           if (iParam) {
                              params += ", ";
                           }
                           params += '"' + block.getFieldValue('PARAM_' + iParam) + '"';
                           iParam += 1;
                        }
                     }

                     var callCode = code + '(' + params + ')';
                     // Add reportValue to show the value in step-by-step mode
                     var reportedCode = "reportBlockValue('" + block.id + "', " + callCode + ")";

                     if (typeof output == "undefined") {                     
                        return callCode + ";\n";
                     }
                     else {
                        return [reportedCode, Blockly[language].ORDER_NONE];
                     }
                  }
               };
               setCodeGeneratorForLanguage(language);
            }
         }
      },
      
      applyCodeGenerators: function(block) {
         for (var language in block.codeGenerators) {
            Blockly[language][block.name] = block.codeGenerators[language];
         }
      },

      createBlock: function(block) {
         if (typeof block.blocklyInit == "undefined") {
            var blocklyjson = block.blocklyJson;
            Blockly.Blocks[block.name] = {
               init: function() {
                  this.jsonInit(blocklyjson);
               }
            };
         }
         else if (typeof block.blocklyInit == "function") {
            Blockly.Blocks[block.name] = {
               init: block.blocklyInit()
            };
         }
         else {
            console.err(block.name + ".blocklyInit is defined but not a function");
         }
      },
      
      createSimpleGenerator: function(label, code, type, nbParams) {
         var jsDefinitions = this.definitions['javascript'] ? this.definitions['javascript'] : [];
         var pyDefinitions = this.definitions['python'] ? this.definitions['python'] : [];

         // Prevent the function name to be used as a variable
         Blockly.JavaScript.addReservedWords(code);
         Blockly.Python.addReservedWords(code);
         
         Blockly.JavaScript[label] = function(block) {
            for (var iDef=0; iDef < jsDefinitions.length; iDef++) {
               var def = jsDefinitions[iDef];
               Blockly.Javascript.definitions_[def.label] = def.code;
            }
            var params = "";
            for (var iParam = 0; iParam < nbParams; iParam++) {
               if (iParam != 0) {
                  params += ", ";
               }
               params += Blockly.JavaScript.valueToCode(block, 'NAME_' + (iParam + 1), Blockly.JavaScript.ORDER_ATOMIC);
            }
           if (type == 0) {
              return code + "(" + params + ");\n";
           } else if (type == 1){
              return [code + "(" + params + ")", Blockly.JavaScript.ORDER_NONE];
           }
         };
         Blockly.Python[label] = function(block) {
            for (var iDef=0; iDef < pyDefinitions.length; iDef++) {
               var def = pyDefinitions[iDef];
               Blockly.Python.definitions_[def.label] = def.code;
            }
            var params = "";
            for (var iParam = 0; iParam < nbParams; iParam++) {
               if (iParam != 0) {
                  params += ", ";
               }
               params += Blockly.Python.valueToCode(block, 'NAME_' + (iParam + 1), Blockly.Python.ORDER_ATOMIC);
            }
            if (type == 0) {
               return code + "(" + params + ")\n";
            } else if (type == 1) {
               return [code + "(" + params + ")", Blockly.Python.ORDER_NONE];
            }
         };
      },

      createSimpleBlock: function(label, code, type, nbParams) {
         Blockly.Blocks[label] = {
           init: function() {
             this.appendDummyInput()
                 .appendField(code);
             if (type == 0) {
                this.setPreviousStatement(true);
                this.setNextStatement(true);
             }
             if (type == 1) {
                this.setOutput(true);
             }
             this.setInputsInline(true);
             for (var iParam = 0; iParam < nbParams; iParam++) {
                this.appendValueInput("NAME_" + (iParam + 1)).setCheck(null);
             }
             this.setColour(210);
             this.setTooltip('');
             this.setHelpUrl('');
           }
         };
      },

      createSimpleGeneratorsAndBlocks: function() { 
         for (var genName in this.simpleGenerators) {
            for (var iGen = 0; iGen < this.simpleGenerators[genName].length; iGen++) {
               var generator = this.simpleGenerators[genName][iGen];
               if(genName == '.') {
                 var label = generator.label + "__";
                 var code = generator.code;
               } else {
                 var label = genName + "_" + generator.label + "__";
                 var code = genName + "." + generator.code;
               }
               this.createSimpleGenerator(label, code, generator.type, generator.nbParams);
               // TODO :: merge createSimpleBlock with completeBlock*
               this.createSimpleBlock(label, generator.label, generator.type, generator.nbParams);
            }
         }
      },

      createGeneratorsAndBlocks: function() {
         var customGenerators = this.mainContext.customBlocks;
         for (var objectName in customGenerators) {
            for (var categoryName in customGenerators[objectName]) {
               var category =  customGenerators[objectName][categoryName];
               for (var iBlock = 0; iBlock < category.length; iBlock++) {
                  var block = category[iBlock];

                  /* TODO: Allow library writers to provide their own JS/Python code instead of just a handler */
                  this.completeBlockHandler(block, objectName, this.mainContext);
                  this.completeBlockJson(block, objectName, categoryName, this.mainContext); /* category.category is category name */
                  this.completeBlockXml(block);
                  this.completeCodeGenerators(block, objectName);
                  this.applyCodeGenerators(block);
                  this.createBlock(block);
               }
               // TODO: Anything of this still needs to be done?
               //this.createGenerator(label, objectName + "." + code, generator.type, generator.nbParams);
               //this.createBlock(label, generator.labelFr, generator.type, generator.nbParams);
            }
         }
      },

      getBlocklyLibCode: function(generators) {
         var strCode = "";
         for (var objectName in generators) {
            strCode += "var " + objectName + " = {\n";
            for (var iGen = 0; iGen < generators[objectName].length; iGen++) {
               var generator = generators[objectName][iGen];

               if (generator.nbParams == 0) {
                  strCode += generator.codeFr + ": function() { ";
               } else {
                  strCode += generator.codeFr + ": function(param1) { ";
               }
               if (generator.type == 1) {
                  strCode += "return ";
               }
               if (generator.nbParams == 0) {
                  strCode += objectName + "_" + generator.labelEn + "(); }";
               } else {
                  strCode += objectName + "_" + generator.labelEn + "(param1); }";
               }
               if (iGen < generators[objectName].length - 1) {
                  strCode += ",";
               }
               strCode += "\n";
            }
            strCode += "};\n\n";
         }
         strCode += "Math['max'] = function(a, b) { if (a > b) return a; return b; };\n";
         strCode += "Math['min'] = function(a, b) { if (a > b) return b; return a; };\n";
         return strCode;
      },

      
      getDefaultColours: function() {
         var colours = {
            categories: {
               logic: 210,
               loops: 120,
               control: 120,
               math: 230,
               operator: 230,
               texts: 160,
               lists: 260,
               colour: 20,
               variables: 330,
               functions: 290,
               _default: 65,
            },
            blocks: {},
         };

         if (typeof this.mainContext.provideBlocklyColours == "function") {
            var providedColours = this.mainContext.provideBlocklyColours();
            
            for (var group in providedColours) {
               if (!(group in colours)) {
                  colours[group] = {};
               }
               for (name in providedColours[group]) {
                  colours[group][name] = providedColours[group][name];
               }
            }
         }
         
         if (typeof provideBlocklyColours == "function") {
            var providedColours = provideBlocklyColours();
            
            for (var group in providedColours) {
               if (!(group in colours)) {
                  colours[group] = {};
               }
               for (name in providedColours[group]) {
                  colours[group][name] = providedColours[group][name];
               }
            }
         }

         return colours;
      },
      

      getStdBlocks: function() {
         return this.scratchMode ? this.getStdScratchBlocks() : this.getStdBlocklyBlocks();
      },

      getStdBlocklyBlocks: function() {
         return {
            input: [
               { 
                  name: "input_num", 
                  blocklyXml: "<block type='input_num'></block>"
               },
               { 
                  name: "input_char", 
                  blocklyXml: "<block type='input_char'></block>"
               },
               { 
                  name: "input_word", 
                  blocklyXml: "<block type='input_word'></block>"
               },
               { 
                  name: "input_line", 
                  blocklyXml: "<block type='input_line'></block>"
               },
            ],
            logic: [
               {
                  name: "controls_if",
                  blocklyXml: "<block type='controls_if'></block>",                     
               },
               { 
                  name: "controls_if_else",
                  blocklyXml: "<block type='controls_if'><mutation else='1'></mutation></block>",
                  excludedByDefault: this.mainContext.showIfMutator,
               },
               { 
                  name: "logic_compare", 
                  blocklyXml: "<block type='logic_compare'></block>"
               },
               { 
                  name: "logic_operation", 
                  blocklyXml: "<block type='logic_operation'></block>"
               },
               { 
                  name: "logic_negate", 
                  blocklyXml: "<block type='logic_negate'></block>"
               },
               { 
                  name: "logic_boolean", 
                  blocklyXml: "<block type='logic_boolean'></block>"
               },
               { 
                  name: "logic_boolean", 
                  blocklyXml: "<block type='logic_null'></block>",
                  excludedByDefault: true,
               },
               { 
                  name: "logic_boolean", 
                  blocklyXml: "<block type='logic_ternary'></block>",
                  excludedByDefault: true,
               },
            ],
            loops: [
               { 
                  name: "controls_repeat", 
                  blocklyXml: "<block type='controls_repeat'></block>",
                  excludedByDefault: true,
               },
               { 
                  name: "controls_repeat_ext", 
                  blocklyXml: "<block type='controls_repeat_ext'>" +
                              "  <value name='TIMES'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>10</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>"
               },
               { 
                  name: "controls_repeat_ext_noShadow", 
                  blocklyXml: "<block type='controls_repeat_ext'></block>",
                  excludedByDefault: true,
               },
               { 
                  name: "controls_whileUntil", 
                  blocklyXml: "<block type='controls_whileUntil'></block>"
               },
               { 
                  name: "controls_untilWhile", 
                  blocklyXml: "<block type='controls_whileUntil'><field name='MODE'>UNTIL</field></block>",
                  excludedByDefault: true,
               },
               { 
                  name: "controls_for", 
                  blocklyXml: "<block type='controls_for'>" +
                              "  <value name='FROM'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>1</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "  <value name='TO'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>10</field>" +
                              "     </shadow>" +
                              "  </value>" +
                              "  <value name='BY'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>1</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>"
               },
               { 
                  name: "controls_for_noShadow", 
                  blocklyXml: "<block type='controls_for'></block>",
                  excludedByDefault: true,
               },
               { 
                  name: "controls_forEach",
                  blocklyXml: "<block type='controls_forEach'></block>",
                  excludedByDefault: true,
               },
               { 
                  name: "controls_flow_statements", 
                  blocklyXml: "<block type='controls_flow_statements'></block>"
               },
            ],
            math: [
               { 
                  name: "math_number", 
                  blocklyXml: "<block type='math_number' gap='32'></block>"
               },
               {
                  name: "math_arithmetic", 
                  blocklyXml: "<block type='math_arithmetic'>" +
                              "  <value name='A'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>1</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "  <value name='B'>" + 
                              "    <shadow type='math_number'>" + 
                              "      <field name='NUM'>1</field>" + 
                              "    </shadow>" + 
                              "  </value>" + 
                              "</block>",
               },
               {
                  name: "math_arithmetic_noShadow", 
                  blocklyXml: "<block type='math_arithmetic'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_single",
                  blocklyXml: "<block type='math_single'>" +
                              "  <value name='NUM'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>9</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>",
               },
               {
                  name: "math_single_noShadow",
                  blocklyXml: "<block type='math_single'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_extra_single", 
                  blocklyXml: "<block type='math_extra_single'>" +
                              "  <value name='NUM'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>9</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_extra_single_noShadow", 
                  blocklyXml: "<block type='math_extra_single'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_extra_double", 
                  blocklyXml: "<block type='math_extra_double'>" +
                              "  <value name='A'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>1</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "  <value name='B'>" + 
                              "    <shadow type='math_number'>" + 
                              "      <field name='NUM'>1</field>" + 
                              "    </shadow>" + 
                              "  </value>" + 
                              "</block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_extra_double", 
                  blocklyXml: "<block type='math_extra_double'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_trig",
                  blocklyXml: "<block type='math_trig'>" +
                              "  <value name='NUM'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>45</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_trig_noShadow",
                  blocklyXml: "<block type='math_trig'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_constant",
                  blocklyXml: "<block type='math_constant'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_number_property",
                  blocklyXml: "<block type='math_number_property'>" +
                              "  <value name='NUMBER_TO_CHECK'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>0</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>",
               },
               {
                  name: "math_number_property_noShadow", 
                  blocklyXml: "<block type='math_number_property'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_round",
                  blocklyXml: "<block type='math_round'>" +
                              "  <value name='NUM'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>3.1</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>",
               },
               {
                  name: "math_round_noShadow", 
                  blocklyXml: "<block type='math_round'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_on_list",
                  blocklyXml: "<block type='math_on_list'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_modulo",
                  blocklyXml: "<block type='math_modulo'>" +
                              "  <value name='DIVIDEND'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>64</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "  <value name='DIVISOR'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>10</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>",
               },
               {
                  name: "math_modulo_noShadow", 
                  blocklyXml: "<block type='math_modulo'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_constrain",
                  blocklyXml: "<block type='math_constrain'>" +
                              "  <value name='VALUE'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>50</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "  <value name='LOW'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>1</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "  <value name='HIGH'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>100</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_constrain_noShadow",
                  blocklyXml: "<block type='math_constrain'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_random_int",
                  blocklyXml: "<block type='math_random_int'>" +
                              "  <value name='FROM'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>1</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "  <value name='TO'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>100</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_random_int_noShadow",
                  blocklyXml: "<block type='math_random_int'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "math_random_float",
                  blocklyXml: "<block type='math_random_float'></block>",
                  excludedByDefault: true,
               },
            ],
            texts: [
               {
                  name: "text", 
                  blocklyXml: "<block type='text'></block>"
               },
               {
                  name: "text_join", 
                  blocklyXml: "<block type='text_join'></block>"
               },
               {
                  name: "text_append", 
                  blocklyXml: "<block type='text_append'></block>"
               },
               {
                  name: "text_length", 
                  blocklyXml: "<block type='text_length'>" +
                              "  <value name='VALUE'>" +
                              "    <shadow type='text'>" +
                              "      <field name='TEXT'>abc</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>"
               },
               {
                  name: "text_length_noShadow", 
                  blocklyXml: "<block type='text_length'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "text_isEmpty", 
                  blocklyXml: "<block type='text_isEmpty'>" +
                              "  <value name='VALUE'>" +
                              "    <shadow type='text'>" +
                              "      <field name='TEXT'></field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>"
               },
               {
                  name: "text_isEmpty_noShadow", 
                  blocklyXml: "<block type='text_isEmpty'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "text_indexOf", 
                  blocklyXml: "<block type='text_indexOf'>" +
                              "  <value name='VALUE'>" +
                              "    <block type='variables_get'>" +
                              "      <field name='VAR'>{textVariable}</field>" +
                              "    </block>" +
                              "  </value>" +
                              "  <value name='FIND'>" +
                              "    <shadow type='text'>" +
                              "      <field name='TEXT'>abc</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>"
               },
               {
                  name: "text_indexOf_noShadow", 
                  blocklyXml: "<block type='text_indexOf'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "text_charAt", 
                  blocklyXml: "<block type='text_charAt'>" +
                              "  <value name='VALUE'>" +
                              "    <block type='variables_get'>" +
                              "      <field name='VAR'>{textVariable}</field>" +
                              "    </block>" +
                              "  </value>" +
                              "</block>"
               },
               {
                  name: "text_charAt_noShado", 
                  blocklyXml: "<block type='text_charAt'></block>",
                  excludedByDefault: true,
                  
               },
               {
                  name: "text_getSubstring", 
                  blocklyXml: "<block type='text_getSubstring'>" +
                              "  <value name='STRING'>" +
                              "    <block type='variables_get'>" +
                              "      <field name='VAR'>{textVariable}</field>" +
                              "    </block>" +
                              "  </value>" +
                              "</block>"
               },
               {
                  name: "text_getSubstring_noShadow", 
                  blocklyXml: "<block type='text_getSubstring'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "text_changeCase", 
                  blocklyXml: "<block type='text_changeCase'>" +
                              "  <value name='TEXT'>" +
                              "    <shadow type='text'>" +
                              "      <field name='TEXT'>abc</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>"
               },
               {
                  name: "text_changeCase_noShadow", 
                  blocklyXml: "<block type='text_changeCase'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "text_trim", 
                  blocklyXml: "<block type='text_trim'>" +
                              "  <value name='TEXT'>" +
                              "    <shadow type='text'>" +
                              "      <field name='TEXT'>abc</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>"
               },
               {
                  name: "text_trim_noShadow", 
                  blocklyXml: "<block type='text_trim'></block>"
               },
               {
                  name: "text_print", 
                  blocklyXml: "<block type='text_print'>" +
                              "  <value name='TEXT'>" +
                              "    <shadow type='text'>" +
                              "      <field name='TEXT'>abc</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>",
                  excludedByDefault: true,
               },
               {
                  name: "text_print_noShadow", 
                  blocklyXml: "<block type='text_print'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "text_prompt_ext", 
                  blocklyXml: "<block type='text_prompt_ext'>" +
                              "  <value name='TEXT'>" +
                              "    <shadow type='text'>" +
                              "      <field name='TEXT'>abc</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>",
                  excludedByDefault: true,
               },
               {
                  name: "text_prompt_ext_noShadow", 
                  blocklyXml: "<block type='text_prompt_ext'></block>",
                  excludedByDefault: true,
               }
            ],
            lists: [
               {
                  name: "lists_create_with_empty", 
                  blocklyXml: "<block type='lists_create_with'>" +
                              "  <mutation items='0'></mutation>" +
                              "</block>"
               },
               {
                  name: "lists_create_with", 
                  blocklyXml: "<block type='lists_create_with'></block>"
               },
               {
                  name: "lists_repeat", 
                  blocklyXml: "<block type='lists_repeat'>" +
                              "  <value name='NUM'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>5</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>"
               },
               {
                  name: "lists_length", 
                  blocklyXml: "<block type='lists_length'></block>"
               },
               {
                  name: "lists_isEmpty", 
                  blocklyXml: "<block type='lists_isEmpty'></block>"
               },
               {
                  name: "lists_indexOf", 
                  blocklyXml: "<block type='lists_indexOf'>" +
                              "  <value name='VALUE'>" +
                              "    <block type='variables_get'>" +
                              "      <field name='VAR'>{listVariable}</field>" +
                              "    </block>" +
                              "  </value>" +
                              "</block>"
               },
               {
                  name: "lists_getIndex", 
                  blocklyXml: "<block type='lists_getIndex'>" +
                              "  <value name='VALUE'>" +
                              "    <block type='variables_get'>" +
                              "      <field name='VAR'>{listVariable}</field>" +
                              "    </block>" +
                              "  </value>" +
                              "</block>"
               },
               {
                  name: "lists_setIndex", 
                  blocklyXml: "<block type='lists_setIndex'>" +
                              "  <value name='LIST'>" +
                              "    <block type='variables_get'>" +
                              "      <field name='VAR'>{listVariable}</field>" +
                              "    </block>" +
                              "  </value>" +
                              "</block>"
               },
               {
                  name: "lists_getSublist", 
                  blocklyXml: "<block type='lists_getSublist'>" +
                              "  <value name='LIST'>" +
                              "    <block type='variables_get'>" +
                              "      <field name='VAR'>{listVariable}</field>" +
                              "    </block>" +
                              "  </value>" +
                              "</block>"
               },
               {
                  name: "lists_sort", 
                  blocklyXml: "<block type='lists_sort'></block>"
               },
               {
                  name: "lists_split", 
                  blocklyXml: "<block type='lists_split'>" +
                              "  <value name='DELIM'>" +
                              "    <shadow type='text'>" +
                              "      <field name='TEXT'>,</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>"
               },
               {
                  name: "lists_append", 
                  blocklyXml: "<block type='lists_append'></block>"
               },
            ],
            colour: [
               {
                  name: "colour_picker", 
                  blocklyXml: "<block type='colour_picker'></block>"
               },
               {
                  name: "colour_random", 
                  blocklyXml: "<block type='colour_random'></block>"
               },
               {
                  name: "colour_rgb", 
                  blocklyXml: "<block type='colour_rgb'>" +
                              "  <value name='RED'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>100</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "  <value name='GREEN'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>50</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "  <value name='BLUE'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>0</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>",
               },
               {
                  name: "colour_rgb_noShadow", 
                  blocklyXml: "<block type='colour_rgb'></block>",
                  excludedByDefault: true,
               },
               {
                  name: "colour_blend", 
                  blocklyXml: "<block type='colour_blend'>" +
                              "  <value name='COLOUR1'>" +
                              "    <shadow type='colour_picker'>" +
                              "      <field name='COLOUR'>#ff0000</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "  <value name='COLOUR2'>" +
                              "    <shadow type='colour_picker'>" +
                              "      <field name='COLOUR'>#3333ff</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "  <value name='RATIO'>" +
                              "    <shadow type='math_number'>" +
                              "      <field name='NUM'>0.5</field>" +
                              "    </shadow>" +
                              "  </value>" +
                              "</block>",
               },
               {
                  name: "colour_blend_noShadow", 
                  blocklyXml: "<block type='colour_blend'></block>",
                  excludedByDefault: true,
               },
            ],
            dicts: [
               { 
                  name: "dict_get_literal", 
                  blocklyXml: "<block type='dict_get_literal'></block>"
               },
               { 
                  name: "dict_keys", 
                  blocklyXml: "<block type='dict_keys'></block>"
               },
               { 
                  name: "dicts_create_with", 
                  blocklyXml: "<block type='dicts_create_with'></block>"
               },
            ],
            variables: [],
            functions: [],
         };
      },

      getStdScratchBlocks: function() {
         // TODO :: make the list of standard scratch blocks
         return {
            control: [ 
                  {  
                     name: "control_if",
                     blocklyXml: "<block type='control_if'></block>"
                  },
                  {
                     name: "control_if_else",
                     blocklyXml: "<block type='control_if_else'></block>"
                  },
                  {
                     name: "control_repeat", 
                     blocklyXml: "<block type='control_repeat'>" +
                                 "  <value name='TIMES'>" +
                                 "    <shadow type='math_number'>" +
                                 "      <field name='NUM'>10</field>" +
                                 "    </shadow>" +
                                 "  </value>" +
                                 "</block>"
                  },
                  {
                     name: "control_repeat_until", 
                     blocklyXml: "<block type='control_repeat_until'></block>"
                  }
               ],
            operator: [
                  {
                     name: "operator_add",
                     blocklyXml: "<block type='operator_add'>" +
                                 "  <value name='NUM1'><shadow type='math_number'><field name='NUM'></field></shadow></value>" +
                                 "  <value name='NUM2'><shadow type='math_number'><field name='NUM'></field></shadow></value>" +
                                 "</block>"
                  },
                  {
                     name: "operator_subtract",
                     blocklyXml: "<block type='operator_subtract'>" +
                                 "  <value name='NUM1'><shadow type='math_number'><field name='NUM'></field></shadow></value>" +
                                 "  <value name='NUM2'><shadow type='math_number'><field name='NUM'></field></shadow></value>" +
                                 "</block>"
                  },
                  {
                     name: "operator_multiply",
                     blocklyXml: "<block type='operator_multiply'>" +
                                 "  <value name='NUM1'><shadow type='math_number'><field name='NUM'></field></shadow></value>" +
                                 "  <value name='NUM2'><shadow type='math_number'><field name='NUM'></field></shadow></value>" +
                                 "</block>"
                  },
                  {
                     name: "operator_divide",
                     blocklyXml: "<block type='operator_divide'>" +
                                 "  <value name='NUM1'><shadow type='math_number'><field name='NUM'></field></shadow></value>" +
                                 "  <value name='NUM2'><shadow type='math_number'><field name='NUM'></field></shadow></value>" +
                                 "</block>"
                  },
                  {
                     name: "operator_equals",
                     blocklyXml: "<block type='operator_equals'>" +
                                 "  <value name='OPERAND1'><shadow type='math_number'><field name='NUM'></field></shadow></value>" +
                                 "  <value name='OPERAND2'><shadow type='math_number'><field name='NUM'></field></shadow></value>" +
                                 "</block>"
                  },
                  {
                     name: "operator_gt",
                     blocklyXml: "<block type='operator_gt'>" +
                                 "  <value name='OPERAND1'><shadow type='math_number'><field name='NUM'></field></shadow></value>" +
                                 "  <value name='OPERAND2'><shadow type='math_number'><field name='NUM'></field></shadow></value>" +
                                 "</block>"
                  },
                  {
                     name: "operator_lt",
                     blocklyXml: "<block type='operator_lt'>" +
                                 "  <value name='OPERAND1'><shadow type='math_number'><field name='NUM'></field></shadow></value>" +
                                 "  <value name='OPERAND2'><shadow type='math_number'><field name='NUM'></field></shadow></value>" +
                                 "</block>"
                  },
                  {
                     name: "operator_and",
                     blocklyXml: "<block type='operator_and'></block>"
                  },
                  {
                     name: "operator_or",
                     blocklyXml: "<block type='operator_or'></block>"
                  },
                  {
                     name: "operator_not",
                     blocklyXml: "<block type='operator_not'></block>"
                  },
                  {
                     name: "operator_join",
                     blocklyXml: "<block type='operator_join'>" +
                                 "  <value name='STRING1'><shadow type='text'><field name='TEXT'></field></shadow></value>" +
                                 "  <value name='STRING2'><shadow type='text'><field name='TEXT'></field></shadow></value>" +
                                 "</block>"
                  }
               ],
            variables: []
         };
      },

      getBlockXmlInfo: function(generatorStruct, blockName) {
         for (var categoryName in generatorStruct) {
            var blocks = generatorStruct[categoryName];
            for (var iBlock = 0; iBlock < blocks.length; iBlock++) {
               var block = blocks[iBlock];
               if (block.name == blockName) {
                  return {
                     category: categoryName,
                     xml: block.blocklyXml,
                  };
               }
            }
         }

         console.error("Block not found: " + blockName);
         return null;
      },

      addBlocksAndCategories: function(blockNames, blocksDefinition, categoriesInfos) {
         var colours = this.getDefaultColours();
         for (var iBlock = 0; iBlock < blockNames.length; iBlock++) {
            var blockName = blockNames[iBlock];
            var blockXmlInfo = this.getBlockXmlInfo(blocksDefinition, blockName);
            var categoryName = blockXmlInfo.category;

            if (!(categoryName in categoriesInfos)) {
               categoriesInfos[categoryName] = {
                  blocksXml: [],
                  colour: colours.blocks[blockName],
               };
            }            
            categoriesInfos[categoryName].blocksXml.push(blockXmlInfo.xml);
         }

         // by the way, just change the defaul colours of the blockly blocks:
         if(!this.scratchMode) {
            var defCat = ["logic", "loops", "math", "texts", "lists", "colour"];
            for (var iCat in defCat) {
               Blockly.Blocks[defCat[iCat]].HUE = colours.categories[defCat[iCat]];
            }
         }
      },

      getToolboxXml: function() {
         var categoriesInfos = {};
         var colours = this.getDefaultColours();

         // Reset the flyoutOptions
         Blockly.Variables.flyoutOptions = {
            any: false,
            anyButton: !!this.includeBlocks.groupByCategory,
            fixed: [],
            includedBlocks: {get: true, set: true, incr: true},
            shortList: true,
         };
         
         for (var blockType in this.includeBlocks.generatedBlocks) {
            this.addBlocksAndCategories(this.includeBlocks.generatedBlocks[blockType], this.mainContext.customBlocks[blockType], categoriesInfos);
         }

         for (var genName in this.simpleGenerators) {
            for (var iGen = 0; iGen < this.simpleGenerators[genName].length; iGen++) {
               var generator = this.simpleGenerators[genName][iGen];
               if (categoriesInfos[generator.category] == undefined) {
                  categoriesInfos[generator.category] = {
                     blocksXml: [],
                     colour: 210,
                  };
               }
               var blockName = (genName == '.') ? generator.label + "__" : genName + "_" + generator.label + "__";
               categoriesInfos[generator.category].blocksXml.push("<block type='"+blockName+"'></block>");
            }
         }

         var stdBlocks = this.getStdBlocks();

         if (this.includeBlocks.standardBlocks.includeAll) {
            this.includeBlocks.standardBlocks.wholeCategories = ["input", "logic", "loops", "math", "texts", "lists", "colour", "dicts", "variables", "functions"];
         }
         var wholeCategories = this.includeBlocks.standardBlocks.wholeCategories || [];
         for (var iCategory = 0; iCategory < wholeCategories.length; iCategory++) {
            var categoryName = wholeCategories[iCategory];
            if (!(categoryName in categoriesInfos)) {
               categoriesInfos[categoryName] = {
                  blocksXml: [],
               };
            }
            if (categoryName == 'variables') {
               Blockly.Variables.flyoutOptions.any = true;
               continue;
            }
            var blocks = stdBlocks[categoryName];
            if (!(blocks instanceof Array)) { // just for now, maintain backwards compatibility
               blocks = blocks.blocks;
            }
            
            for (var iBlock = 0; iBlock < blocks.length; iBlock++) {
               if (!(blocks[iBlock].excludedByDefault)) {
                  categoriesInfos[categoryName].blocksXml.push(blocks[iBlock].blocklyXml);
               }
            }
         }

         this.addBlocksAndCategories(this.includeBlocks.standardBlocks.singleBlocks || [], stdBlocks, categoriesInfos);

         // Handle variable blocks, which are normally automatically added with
         // the VARIABLES category but can be customized here
         if (typeof this.includeBlocks.variables !== 'undefined') {
            Blockly.Variables.flyoutOptions.fixed = (this.includeBlocks.variables.length > 0) ? this.includeBlocks.variables : [];
            if (typeof this.includeBlocks.variablesOnlyBlocks !== 'undefined') {
               Blockly.Variables.flyoutOptions.includedBlocks = {get: false, set: false, incr: false};
               for (var iBlock=0; iBlock < this.includeBlocks.variablesOnlyBlocks.length; iBlock++) {
                  Blockly.Variables.flyoutOptions.includedBlocks[this.includeBlocks.variablesOnlyBlocks[iBlock]] = true;
               }
            }

            var varAnyIdx = Blockly.Variables.flyoutOptions.fixed.indexOf('*');
            if(varAnyIdx > -1) {
               Blockly.Variables.flyoutOptions.fixed.splice(varAnyIdx, 1);
               Blockly.Variables.flyoutOptions.any = true;
            }

            var blocksXml = Blockly.Variables.flyoutCategory();
            var xmlSer = new XMLSerializer();
            for(var i=0; i<blocksXml.length; i++) {
               blocksXml[i] = xmlSer.serializeToString(blocksXml[i]);
            }

            categoriesInfos["variables"] = {
               blocksXml: blocksXml,
               colour: 330
            }
         }

         var xmlString = "";         
         for (var categoryName in categoriesInfos) {
            var categoryInfo = categoriesInfos[categoryName];
            if (this.includeBlocks.groupByCategory) {
               var colour = categoryInfo.colour;
               if (typeof(colour) == "undefined") {
                  colour = colours.categories[categoryName]
                  if (typeof(colour) == "undefined") {
                     colour = colours.categories._default;
                  }
               }               
               xmlString += "<category "
                          + " name='" + this.strings.categories[categoryName] + "'"
                          + " colour='" + colour + "'"
                          + (this.scratchMode ? " secondaryColour='" + colour + "'" : '')
                          + (categoryName == 'variables' ? ' custom="VARIABLE"' : '')
                          + (categoryName == 'functions' ? ' custom="PROCEDURE"' : '')
                          + ">";
            }
            var blocks = categoryInfo.blocksXml;
            for (var iBlock = 0; iBlock < blocks.length; iBlock++) {
               xmlString += blocks[iBlock];
            }
            if (this.includeBlocks.groupByCategory) {
               xmlString += "</category>";
            }
         }

         (function (strings) {
            xmlString = xmlString.replace(/{(\w+)}/g, function(m, p1) {return strings[p1]}); // taken from blockly/demo/code
         })(this.strings);
         
         return xmlString;
      },
      

      addExtraBlocks: function() {
         var that = this;


         Blockly.Blocks['controls_untilWhile'] = Blockly.Blocks['controls_whileUntil'];
         Blockly.JavaScript['controls_untilWhile'] = Blockly.JavaScript['controls_whileUntil'];
         Blockly.Python['controls_untilWhile'] = Blockly.Python['controls_whileUntil'];
         
         Blockly.Blocks['math_extra_single'] = {
           /**
            * Block for advanced math operators with single operand.
            * @this Blockly.Block
            */
           init: function() {
             var OPERATORS =
                 [
                  [Blockly.Msg.MATH_SINGLE_OP_ABSOLUTE, 'ABS'],
                  ['-', 'NEG'],
             ];
             this.setHelpUrl(Blockly.Msg.MATH_SINGLE_HELPURL);
             this.setColour(Blockly.Blocks.math.HUE);
             this.setOutput(true, 'Number');
             this.appendValueInput('NUM')
                 .setCheck('Number')
                 .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
             // Assign 'this' to a variable for use in the tooltip closure below.
             var thisBlock = this;
             this.setTooltip(function() {
               var mode = thisBlock.getFieldValue('OP');
               var TOOLTIPS = {
                 'ABS': Blockly.Msg.MATH_SINGLE_TOOLTIP_ABS,
                 'NEG': Blockly.Msg.MATH_SINGLE_TOOLTIP_NEG
               };
               return TOOLTIPS[mode];
             });
           }
         };

         Blockly.JavaScript['math_extra_single'] = Blockly.JavaScript['math_single'];
         Blockly.Python['math_extra_single'] = Blockly.Python['math_single'];


         Blockly.Blocks['math_extra_double'] = {
           /**
            * Block for advanced math operators with double operand.
            * @this Blockly.Block
            */
           init: function() {
             var OPERATORS =
                 [
                  ['min', 'MIN'],
                  ['max', 'MAX'],
             ];
             this.setColour(Blockly.Blocks.math.HUE);
             this.setInputsInline(true);
             this.setOutput(true, 'Number');
             this.appendDummyInput('OP').appendField(new Blockly.FieldDropdown([["min", "MIN"], ["max", "MAX"], ["", ""]]), "OP");
             this.appendDummyInput().appendField(" entre ");
             this.appendValueInput('A').setCheck('Number');
             this.appendDummyInput().appendField(" et ");
             this.appendValueInput('B').setCheck('Number');
             // Assign 'this' to a variable for use in the tooltip closure below.
             var thisBlock = this;
             this.setTooltip(function() {
               var mode = thisBlock.getFieldValue('OP');
               var TOOLTIPS = {
                 'MIN': that.strings.smallestOfTwoNumbers,
                 'MAX': that.strings.greatestOfTwoNumbers
               };
               return TOOLTIPS[mode];
             });
           }
         };

         Blockly.JavaScript['math_extra_double'] = function(block) {
           // Math operators with double operand.
           var operator = block.getFieldValue('OP');
           var arg1 = Blockly.JavaScript.valueToCode(block, 'A',  Blockly.JavaScript.ORDER_NONE) || '0';
           var arg2 = Blockly.JavaScript.valueToCode(block, 'B',  Blockly.JavaScript.ORDER_NONE) || '0';
           if (operator == 'MIN') {
             var code = "Math.min(" + arg1 + ", " + arg2 + ")";
           }
           if (operator == 'MAX') {
             var code = "Math.max(" + arg1 + ", " + arg2 + ")";
           }
           return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
         };

         Blockly.Python['math_extra_double'] = function(block) {
           // Math operators with double operand.
           var operator = block.getFieldValue('OP');
           var arg1 = Blockly.Python.valueToCode(block, 'A',  Blockly.Python.ORDER_NONE) || '0';
           var arg2 = Blockly.Python.valueToCode(block, 'B',  Blockly.Python.ORDER_NONE) || '0';
           if (operator == 'MIN') {
             var code = "Math.min(" + arg1 + ", " + arg2 + ")";
           }
           if (operator == 'MAX') {
             var code = "Math.max(" + arg1 + ", " + arg2 + ")";
           }
           return [code, Blockly.Python.ORDER_FUNCTION_CALL];
         };


         if(this.scratchMode) {
            Blockly.Blocks['robot_start'] = {
              init: function() {
                this.jsonInit({
                  "id": "event_whenflagclicked",
                  "message0": that.strings.flagClicked,
                  "args0": [
                    {
                      "type": "field_image",
                      "src": Blockly.mainWorkspace.options.pathToMedia + "icons/event_whenflagclicked.svg",
                      "width": 24,
                      "height": 24,
                      "alt": "flag",
                      "flip_rtl": true
                    }
                  ],
                  "inputsInline": true,
                  "nextStatement": null,
                  "category": Blockly.Categories.event,
                  "colour": Blockly.Colours.event.primary,
                  "colourSecondary": Blockly.Colours.event.secondary,
                  "colourTertiary": Blockly.Colours.event.tertiary
                });
              }
            };

         } else {
            if (!(this.mainContext.showIfMutator)) {
               var old = Blockly.Blocks.controls_if.init; 
               Blockly.Blocks.controls_if.init = function() {
                  old.call(this);  
                  this.setMutator(undefined)
               };
            }
            
            Blockly.Blocks['robot_start'] = {
              init: function() {
                this.appendDummyInput()
                    .appendField(that.strings.startingBlockName);
                this.setNextStatement(true);
                this.setColour(210);
                this.setTooltip('');
                this.deletable_ = false;
                this.editable_ = false;
                this.movable_ = false;
            //    this.setHelpUrl('http://www.example.com/');
              }
            };
         }

         Blockly.JavaScript['robot_start'] = function(block) {
           return "";
         };

         Blockly.Python['robot_start'] = function(block) {
           return "";
         };
      },

      fixScratch: function() {
         // Store the maxBlocks information somehwere, as Scratch ignores it
         Blockly.Workspace.prototype.maxBlocks = function () { return maxBlocks; };

         // Translate requested Blocks from Blockly to Scratch blocks
         // TODO :: full translation
         var newSingleBlocks = [];
         for (var iBlock = 0;  iBlock < this.includeBlocks.standardBlocks.singleBlocks.length; iBlock++) {
            var blockName = this.includeBlocks.standardBlocks.singleBlocks[iBlock];
            if(blocklyToScratch.singleBlocks[blockName]) {
               for(var b=0; b<blocklyToScratch.singleBlocks[blockName].length; b++) {
                  newSingleBlocks.push(blocklyToScratch.singleBlocks[blockName][b]);
               }
            } else {
                newSingleBlocks.push(blockName);
            }
         }
         this.includeBlocks.standardBlocks.singleBlocks = newSingleBlocks;
      },

      getFullCode: function(code) {
         return this.getBlocklyLibCode(this.generators) + code + "program_end()";
      }
   };
}