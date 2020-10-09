/*
    i18n:
        Translations for the various strings in quickAlgo
*/

var quickAlgoLanguageStrings = {
   fr: {
      categories: {
         actions: "Actions",
         actuator: "Actionneurs",
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
      infiniteLoop: "répéter indéfiniment",
      availableFunctions: "Fonctions disponibles : ",
      availableFunctionsVerbose: "Les fonctions disponibles pour contrôler le robot sont :",
      startingLine: "Votre programme doit commencer par la ligne",
      startingLines: "Votre programme doit commencer par les lignes",
      keyword: "mot-clé",
      keywordAllowed: "Le mot-clé suivant est autorisé : ",
      keywordForbidden: "Le mot-clé suivant est interdit : ",
      keywordsAllowed: "Les mots-clés suivants sont autorisés : ",
      keywordsForbidden: "Les mots-clés suivants sont interdits : ",
      variablesAllowed: "Les variables sont autorisées.",
      variablesForbidden: "Les variables sont interdites.",
      readDocumentation: "Vous êtes autorisé(e) à lire de la documentation sur Python et à utiliser un moteur de recherche pendant le concours.",
      autorizedKeyWords: "Mots-clés autorisés : ",
      constant: "constante",
      variable: "variable"
   },
   en: {
      categories: {
         actions: "Actions",
         actuator: "Actuators",
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
      seeTest: "see test",
      infiniteLoop: "répéter indéfiniment", // TODO :: translate
      availableFunctions: "Fonctions disponibles : ", // TODO :: translate
      availableFunctionsVerbose: "Les fonctions disponibles pour contrôler le robot sont :", // TODO :: translate
      startingLine: "Votre programme doit commencer par la ligne", // TODO :: translate
      startingLines: "Votre programme doit commencer par les lignes", // TODO :: translate
      keyword: "keyword", // TODO :: verify
      keywordAllowed: "Le mot-clé suivant est autorisé : ", // TODO :: translate
      keywordForbidden: "Le mot-clé suivant est interdit : ", // TODO :: translate
      keywordsAllowed: "Les mots-clés suivants sont autorisés : ", // TODO :: translate
      keywordsForbidden: "Les mots-clés suivants sont interdits : ", // TODO :: translate
      variablesAllowed: "Les variables sont autorisées.", // TODO :: translate
      variablesForbidden: "Les variables sont interdites.", // TODO :: translate
      readDocumentation: "Vous êtes autorisé(e) à lire de la documentation sur Python et à utiliser un moteur de recherche pendant le concours.", // TODO :: translate
      autorizedKeyWords: "Mots-clés autorisés : ", // TODO :: translate,
      constant: "constant", // TODO :: verify
      variable: "variable"
   },
   de: {
      categories: {
         actions: "Aktionen",
         actuator: "Aktoren",
         sensors: "Sensoren",
         debug: "Debug",
         colour: "Farben",
         data: "Daten",
         dicts: "Hash-Map",
         input: "Eingabe",
         lists: "Listen",
         tables: "Tabellen",
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
      stopProgramDesc: "Von vorne anfangen",
      stepProgramDesc: "Schritt für Schritt",
      slowSpeedDesc: "Langsame",
      mediumSpeedDesc: "Mittel",
      fastSpeedDesc: "Schnell",
      ludicrousSpeedDesc: "Sehr schnell",
      selectLanguage: "Sprache:",
      blocklyLanguage: "Blockly",
      javascriptLanguage: "Javascript",
      importFromBlockly: "Generiere von Blockly-Blöcken",
      loadExample: "Beispiel einfügen",
      saveOrLoadButton: "Laden / Speichern",
      saveOrLoadProgram: "Speicher oder lade deinen Quelltext:",
      avoidReloadingOtherTask: "Warnung: Lade keinen Quelltext von einer anderen Aufgabe!",
      files: "Dateien",
      reloadProgram: "Laden",
      restart: "Neustarten",
      loadBestAnswer: "Lade beste Lösung",
      saveProgram: "Speichern",
      copy: "Kopieren",
      paste: "Einfügen",
      blocklyToPython: "Convert to Python",
      blocklyToPythonTitle: "Python code",
      blocklyToPythonIntro: "",
      blocklyToPythonPassComment: '# Insert instructions here',
      limitBlocks: "Noch {remainingBlocks} von {maxBlocks} Bausteinen verfügbar.",
      limitBlocksOver: "{remainingBlocks} Bausteine zusätzlich zum Limit von {maxBlocks} verbraucht.", // TODO :: stimmt das?
      limitElements: "Noch {remainingBlocks} von {maxBlocks} Elementen verfügbar.",
      limitElementsOver: "{remainingBlocks} Elemente zusätzlich zum Limit von {maxBlocks} verbraucht.",
      capacityWarning: "Warning : your program is invalid as it uses too many blocks. Be careful of the block limit displayed on the top right side of the editor.",
      clipboardDisallowedBlocks: "You cannot paste this program, as it contains blocks which aren't allowed in this version.",
      previousTestcase: " < ",
      nextTestcase: " > ",
      allTests: "Alle Testfälle: ",
      errorEmptyProgram: "Das Programm enthält keine Befehle. Verbinde die Blöcke um ein Programm zu schreiben.",
      tooManyBlocks: "Du benutzt zu viele Bausteine!",
      limitedBlock: "Du verwendest zu viele Bausteine einer eingeschränkten Sorte:",
      uninitializedVar: "Nicht initialisierte Variable:",
      undefinedMsg: "This can be because of an access to an index out of a list, or an undefined variable.",
      valueTrue: 'wahr',
      valueFalse: 'unwahr',
      evaluatingAnswer: 'Wird ausgewertet',
      correctAnswer: 'Richtige Antwort',
      partialAnswer: 'Teilweise richtige Antwort',
      wrongAnswer: 'Falsche Antwort',
      resultsNoSuccess: "Du hast keinen Testfall richtig.",
      resultsPartialSuccess: "Du hast {nbSuccess} von {nbTests} Testfällen richtig.",
      gradingInProgress: "Das Ergebnis wird ausgewertet …",
      introTitle: "Deine Mission",
      introDetailsTitle: "Missionsdetails",
      textVariable: "Text",
      listVariable: "Liste",
      scaleDrawing: "Vergrößere",
      loopRepeat: "wiederhole",
      loopDo: "mache",
      displayVideo: "Zeige Video",
      showDetails: "Zeige Details",
      hideDetails: "Verstecke Details",
      editor: "Editor",
      instructions: "Anweisungen",
      testLabel: "Test",
      testError: "Fehler",
      testSuccess: "gültig",
      seeTest: "Siehe Test",
      infiniteLoop: "Endlosschleife", 
      availableFunctions: "Verfügbare Funktionen:",
      availableFunctionsVerbose: "Die verfügbaren Funktionen zum Steuern des Roboters sind:",
      startingLine: "Dein Programm muss mit folgender Zeile beginnen:",
      startingLines: "Dein Programm muss mit folgenden Zeilen beginnen",
      keyword: "Schlüsselwort", // TODO :: verify
      keywordAllowed: "Erlaubtes Schlüsselwort:",
      keywordForbidden: "Nicht erlaubtes Schlüsselwort:",
      keywordsAllowed: "Erlaubte Schlüsselwörter:",
      keywordsForbidden: "Nicht erlaubte Schlüsselwörter:",
      variablesAllowed: "Du darfst Variable verwenden.",
      variablesForbidden: "Du darfst keine Variablen verwenden",
      readDocumentation: "Du darfst die Python-Dokumentation lesen.",
      autorizedKeyWords: "Mots-clés autorisés : ", // TODO :: translate,
      constant: "constant", // TODO :: verify
      variable: "variable" // TODO: verify
   },
   es: {
      categories: {
         actions: "Acciones",
         actuator: "Actuadores",
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
         texts: "Texto",
         variables: "Variables",
         functions: "Funciones",
         read: "Lectura",
         print: "Escritura",
         internet: "Internet",
         display: "Pantalla",
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
      copy: "Copiar", // TODO :: translate
      paste: "Pegar",
      blocklyToPython: "Convertir a Python",
      blocklyToPythonTitle: "Python código",
      blocklyToPythonIntro: "",
      blocklyToPythonPassComment: '# Insertar instrucciones aquí',
      limitBlocks: "{remainingBlocks} bloques disponibles de {maxBlocks} autorizados.",
      limitBlocksOver: "{remainingBlocks} bloques sobre el límite de {maxBlocks} autorizados.",
      limitElements: "{remainingBlocks} elementos disponibles de {maxBlocks} autorizados.",
      limitElementsOver: "{remainingBlocks} elementos sobre el límite de {maxBlocks} autorizados.",
      capacityWarning: "Advertencia: tu programa está inválido porque ha utilizado demasiados bloques. Pon atención al límite de bloques permitidos mostrados en la parte superior derecha del editor.",
      clipboardDisallowedBlocks: "No puede pegar este programa, ya que contiene bloques que no están permitidos en esta versión.", 
      previousTestcase: "Anterior",
      nextTestcase: "Siguiente",
      allTests: "Todas las pruebas:",
      errorEmptyProgram: "¡El programa está vacio! Conecta algunos bloques",
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
      seeTest: "ver",
      infiniteLoop: "repetir indefinidamente",
      availableFunctions: "Funciones disponibles : ",
      availableFunctionsVerbose: "Las funciones disponibles para controlar el robot son:",
      startingLine: "El programa debe comenzar con la línea",
      startingLines: "Tu programa debe comenzar con las líneas",
      keyword: "palabra clave", // TODO :: verify
      keywordAllowed: "Se permite la siguiente palabra clave: ",
      keywordForbidden: "La siguiente palabra clave está prohibida: ",
      keywordsAllowed: "Se permiten las siguientes palabras clave: ",
      keywordsForbidden: "Las siguientes palabras clave están prohibidas: ",
      variablesAllowd: "Se permiten variables.",
      variablesForbidden: "Las variables están prohibidas.",
      readDocumentation: "Se le permite leer la documentación de Python y utilizar un motor de búsqueda durante el concurso.",
      autorizedKeyWords: "Palabras clave autorizadas: ",
      constant: "constante", // TODO :: verify
      variable: "variable" // TODO :: verify
   },
   sl: {
      categories: {
         actions: "Dejanja",
         actuator: "Pogoni",
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
      seeTest: "poglej test",
      infiniteLoop: "répéter indéfiniment", // TODO :: translate
      availableFunctions: "Fonctions disponibles : ", // TODO :: translate
      availableFunctionsVerbose: "Les fonctions disponibles pour contrôler le robot sont :", // TODO :: translate
      startingLine: "Votre programme doit commencer par la ligne", // TODO :: translate
      startingLines: "Votre programme doit commencer par les lignes", // TODO :: translate
      keyword: "ključna beseda", // TODO :: verify
      keywordAllowed: "Le mot-clé suivant est autorisé : ", // TODO :: translate
      keywordForbidden: "Le mot-clé suivant est interdit : ", // TODO :: translate
      keywordsAllowed: "Les mots-clés suivants sont autorisés : ", // TODO :: translate
      keywordsForbidden: "Les mots-clés suivants sont interdits : ", // TODO :: translate
      variablesAllowed: "Les variables sont autorisées.", // TODO :: translate
      variablesForbidden: "Les variables sont interdites.", // TODO :: translate
      readDocumentation: "Vous êtes autorisé(e) à lire de la documentation sur Python et à utiliser un moteur de recherche pendant le concours.", // TODO :: translate
      autorizedKeyWords: "Mots-clés autorisés : ", // TODO :: translate,
      constant: "konstanten", // TODO :: verify
      variable: "spremenljivka" // TODO :: verify
   },
   it: {
      categories: {
         actions: "Azioni",
         actuator: "Attuatori",
         sensors: "Sensori",
         debug: "Debug",
         colour: "Colori",
         data: "Dati",
         dicts: "Dizionari",
         input: "Input",
         lists: "Elenchi",
         tables: "Tabelle",
         logic: "Logica",
         loops: "Loop",
         control: "Controlli",
         operator: "Operatori",
         math: "Maths",
         texts: "Testo",
         variables: "Variabili",
         functions: "Funzioni",
         read: "Lettura",
         print: "Stampa",
         internet: "Internet",
         display: "Mostra",
      },
      invalidContent: "Contenuto non valido",
      unknownFileType: "Tipo di file non riconosciuto",
      download: "scarica",
      smallestOfTwoNumbers: "Più piccolo dei due numeri",
      greatestOfTwoNumbers: "Più grande dei due numeri",
      flagClicked: "Quando %1 cliccato",
      tooManyIterations: "Il tuo programma richiede troppo tempo per arrestarsi!",
      tooManyIterationsWithoutAction: "Il tuo programma è rimasto in funzione troppo a lungo senza intraprendere alcuna azione!",
      submitProgram: "Convalida il programma",
      runProgram: "Esegui su questo test",
      stopProgram: "|<",
      speedSliderSlower: "Più lentamente",
      speedSliderFaster: "Più veloce",
      speed: "Velocità:",
      stepProgram: "|>",
      slowSpeed: ">",
      mediumSpeed: ">>",
      fastSpeed: ">>>",
      ludicrousSpeed: ">|",
      stopProgramDesc: "Partire dall'inizio",
      stepProgramDesc: "Esecuzione passo a passo",
      slowSpeedDesc: "Esegui su questo test",
      mediumSpeedDesc: "Velocità media",
      fastSpeedDesc: "Velocità rapida",
      ludicrousSpeedDesc: "Velocità molto rapida",
      selectLanguage: "Linguaggio:",
      blocklyLanguage: "Blockly",
      javascriptLanguage: "Javascript",
      importFromBlockly: "Importa da blockly",
      loadExample: "Inserisci l'esempio",
      saveOrLoadButton: "Carica / salva",
      saveOrLoadProgram: "Salva o ricarica il tuo programma:",
      avoidReloadingOtherTask: "Attenzione: non ricaricare il programma di un altro argomento!",
      files: "File",
      reloadProgram: "Ricarica",
      restart: "Ricomincia",
      loadBestAnswer: "Carica la mia miglior risposta",
      saveProgram: "Salva",
      copy: "Copia",
      paste: "Incolla",
      blocklyToPython: "Mostra la traduzione in Python",
      blocklyToPythonTitle: "Codice Python",
      blocklyToPythonIntro: "Il codice sottostante è l'equivalente in linguaggio Python del tuo programma Blockly.",
      blocklyToPythonPassComment: '# Inserisci delle istruzioni qui',
      limitBlocks: "{remainingBlocks} blocchi restati su {maxBlocks} autorizzati.",
      limitBlocksOver: "{remainingBlocks} blocchi utilizzati in eccesso per {maxBlocks} autorizzati.",
      limitElements: "{remainingBlocks} blocchi restanti su {maxBlocks} autorizzati.",
      limitElementsOver: "{remainingBlocks} blocchi utilizzati in eccesso per  {maxBlocks} autorizzati.",
      capacityWarning: "Attenzione: il tuo programma non è valido perché utilizza troppi blocchi. Presta attenzione al limite di blocchi visualizzato nell'angolo in alto a destra dell'editor.",
      clipboardDisallowedBlocks: "Non è possibile incollare questo programma perché contiene blocchi che non sono ammessi in questa versione.",
      previousTestcase: "Precedente",
      nextTestcase: "Seguente",
      allTests: "Tutti i test: ",
      errorEmptyProgram: "Il programma è vuoto! Connetti dei blocchi.",
      tooManyBlocks: "Stai usando troppi blocchi!",
      limitedBlock: "Usi troppo spesso un blocco a uso limitato:",
      uninitializedVar: "Variabile non inizializzata:",
      undefinedMsg: "Questo può provenire da un accesso ad un indice fuori da un elenco, o da una variabile non definita.",
      valueTrue: 'vero',
      valueFalse: 'falso',
      evaluatingAnswer: 'Valutazione in corso',
      correctAnswer: 'Risposta corretta',
      partialAnswer: 'Risposta migliorabile',
      wrongAnswer: 'Risposta sbagliata',
      resultsNoSuccess: "Non hai convalidato nessun test.",
      resultsPartialSuccess: "Hai convalidato solo {nbSuccess} test(s) su {nbTests}.",
      gradingInProgress: "Valutazione in corso",
      introTitle: "La tua missione",
      introDetailsTitle: "Dettagli della missione",
      textVariable: "testo",
      listVariable: "elenco",
      scaleDrawing: "Zoom ×2",
      loopRepeat: "repeat",
      loopDo: "do",
      displayVideo: "Mostra il video",
      showDetails: "Più dettagli",
      hideDetails: "Nascondi i dettagli",
      editor: "Editor",
      instructions: "Istruzioni",
      testLabel: "Test",
      testError: "errore",
      testSuccess: "convalidato",
      seeTest: "vedi",
      infiniteLoop: "ripeti all'infinito",
      availableFunctions: "Funzioni disponibili: ",
      availableFunctionsVerbose: "Le funzioni disponibili per controllare il robot sono:",
      startingLine: "Il tuo programma dovrebbe iniziare con la frase",
      startingLines: "Il tuo programma dovrebbe iniziare con le frasi",
      keyword: "parola chiave", // TODO :: verify
      keywordAllowed: "La seguente parola-chiave è autorizzata: ",
      keywordForbidden: "La seguente parola chiave è vietata: ",
      keywordsAllowed: "Le seguenti parole-chiave sono autorizzate: ",
      keywordsForbidden: "Le seguenti parole-chiave sono vietate: ",
      variablesAllowed: "Le variabili sono autorizzate.",
      variablesForbidden: "Le variabili sono vietate.",
      readDocumentation: "Sei autorizzato(a) a leggere la documentazione su Python e a utilizzare un motore di ricerca durante il concorso.",
      autorizedKeyWords: "Parole-chiave autorizzate: ",
      constant: "costante", // TODO :: verify
      variable: "variabile" // TODO :: verify
   }
};


window.stringsLanguage = window.stringsLanguage || "fr";
window.languageStrings = window.languageStrings || {};

function quickAlgoImportLanguage() {
   if (typeof window.languageStrings != "object") {
      console.error("window.languageStrings is not an object");
      return;
   }
   var strings = quickAlgoLanguageStrings[window.stringsLanguage];
   if(!strings) {
      console.error("Language '" + window.stringsLanguage + "' not translated for quickAlgo, defaulting to 'fr'.");
      strings = quickAlgoLanguageStrings.fr;
   }
   // Merge translations
   $.extend(true, window.languageStrings, strings);
}

quickAlgoImportLanguage();
