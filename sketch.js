// qna, Toxicity and Graphing Bots
// Caylixx Starr
// nov 21 2024
// Matrix coded copied from https://github.com/RaghavCodeHub/matrix/tree/master

let img;
let qnaBot, toxicityBot, graphBot;
let state = "startScreen";
let qnaHasLoaded = false, toxicityHasLoaded = false;
const threshold = 0.6;
let predictions;
let graphingState = "function";

// Initializaing all the elements I will use
let isElementsOnThisSceenLoaded = false;
let tbl, div;
let returnButton, toxicityButton, qnaButton, graphButtion, answerButton;
let userPassage, userQuestion, answer, isAnswerLoaded;
let userXTable, userYTable;

let linearRegressionButton, doLinearRegression = false; 
let quadraticRegressionButton, doQuadraticRegression = false; 
let cubicRegressionButton, doCubicRegression = false;

let data, layout;

let userFunction, userStep, userXMin, userYmin, userXMax, userYMax;

// class for the graphing bots
class Graph{
  constructor(){
    this.function = undefined;
    this.unchangedFunction = undefined;
    this.step = undefined;
    this.YMin = undefined;
    this.XMin = undefined;
    this.YMax = undefined;
    this.XMax = undefined;
    this.XTable = undefined;
    this.YTable = undefined;
  }

  mathToComputerNotation(){
    // changing the function to computer notation
    this.unchangedFunction = this.function;

    this.function = this.function.replaceAll("sin", "Math.sin");
    this.function = this.function.replaceAll("tan", "Math.tan");
    this.function = this.function.replaceAll("cos", "Math.cos");
    this.function = this.function.replaceAll("log", "Math.log");
    this.function = this.function.replaceAll("sec", "findSecant");
    this.function = this.function.replaceAll("cot", "findCotangent");
    this.function = this.function.replaceAll("csc", "findCosecant");
    this.function = this.function.replaceAll("^", "**");
    this.function = this.function.replaceAll("pi", "Math.PI");
    this.function = this.function.replaceAll("root", "Math.sqrt");
    this.function = this.function.replaceAll("abs", "Math.abs");

  }

  graph(){
    // graphing the data
    data = [{x:this.doTableOrFunctionGraphing().xValues, y:this.doTableOrFunctionGraphing().yValues, mode: this.doTableOrFunctionGraphing().dataMode}];

    this.checkAndDoRegressions();

    layout = {title: this.doTableOrFunctionGraphing().titleSting, yaxis:{autorange: false, range: [this.YMin, this.YMax]}, xaxis:{autorange: false, range: [this.XMin, this.XMax]}};
  }

  doTableOrFunctionGraphing(){
    let xValues = [];
    let yValues = [];
    let titleSting;
    let dataMode;

    // function
    if (graphingState === "function"){
      for (let x = this.XMin - 200; x < this.XMax + 200; x += this.step){
        xValues.push(x);
        yValues.push(eval(this.function));
      } 
      titleSting = "f(x) = " + this.unchangedFunction;
      dataMode = 'lines+markers';
    }

    // table
    else if (graphingState === "table"){
      for (let i = 0; i < this.XTable.length; i++){
        xValues.push(Number(this.XTable[i]));
        yValues.push(Number(this.YTable[i]));
      }
      titleSting = "Table";
      dataMode = "markers";
    }
    return {xValues: xValues, yValues: yValues, dataMode: dataMode, titleSting: titleSting};
  }

  checkAndDoRegressions(){
    // checking if the regression button is on then trying to do the regression on the table

    // linear
    if (doLinearRegression){
      let linearXValues = [];
      let linearYValues = [];

      for (let x = this.XMin - 200; x < this.XMax + 200; x += 0.1){
        linearXValues.push(x);
        linearYValues.push(linearRegression().B * x - linearRegression().A);
      }
      data[data.length] = {x:linearXValues, y:linearYValues, mode:"lines", name: `f(x) ≈ ${linearRegression().B.toFixed(2)}x - ${linearRegression().A.toFixed(2)}`};
    }

    // quadratic
    if (doQuadraticRegression){
      let quadraticXValues = [];
      let quadraticYValues = [];

      for (let x = this.XMin - 200; x < this.XMax + 200; x += 0.1){
        quadraticXValues.push(x);
        quadraticYValues.push(quadraticRegression().A * x ** 2 + quadraticRegression().B * x + quadraticRegression().C);
      }
      data[data.length] = {x:quadraticXValues, y:quadraticYValues, mode:"lines", name: `f(x) ≈ ${quadraticRegression().A.toFixed(2)}x^2 + ${quadraticRegression().B.toFixed(2)}x + ${quadraticRegression().C.toFixed(2)}`};
    }
    
    // cubic
    if (doCubicRegression){
      let cubicXValues = [];
      let cubicYValues = [];
  
      for (let x = this.XMin - 200; x < this.XMax + 200; x += 0.1){
        cubicXValues.push(x);
        cubicYValues.push(cubicRegression().D * x ** 3 + cubicRegression().C * x ** 2 + cubicRegression().B * x + cubicRegression().A);
      }
      data[data.length] = {x:cubicXValues, y:cubicYValues, mode:"lines", name:`f(x) ≈ ${cubicRegression().D.toFixed(2)}x^3 + ${cubicRegression().C.toFixed(2)}x^2 + ${cubicRegression().B.toFixed(2)}x + ${cubicRegression().A.toFixed(2)}`};
    }
  }
}

// class for the qna and toxicity bot
class Bots{
  constructor(){
    this.model = undefined;
    this.answer = undefined;
    this.isThisModelLoaded = false;
    this.passage;
    this.question;
  }

  async loadQNAModel() {
    this.model = await qna.load();
    this.isThisModelLoaded = true;
  }

  async findTheAnswer() {
    this.answer = await this.model.findAnswers(this.question, this.passage);
  }

  async loadToxicityModel() {
    this.model = await toxicity.load(threshold);
    this.isThisModelLoaded = true;
  }

  async findIfPassageIsToxic() {
    predictions = await this.model.classify(this.passage);
  }
}

function preload(){
  img = loadImage("robot-meme.gif");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  basicSetupForTextAndWindow();

  // Start Screen
  if (state === "startScreen"){
    background("purple");
    startTextAndImage();
    loadElements();
    
  }

  // QNA Bot
  else if (state === "qna"){ 
    background("green");
    loadNeededBot();
    createAndAskIfReturnButtonPressed();
    loadElements();
    checkQNAForAnswer();
  }

  // Toxicity Bot
  else if (state === "toxicity") {
    background(color(180, 42, 32));
    loadNeededBot();
    createAndAskIfReturnButtonPressed();
    loadElements();
    fillToxicityTableWithAnswers();
  }

  // Graphing Bot
  else if (state === "graph"){
    background("mediumslateblue");
    createAndAskIfReturnButtonPressed();
    loadElements();
    tableAndFunctionGrpahingUI();
  }
}

function basicSetupForTextAndWindow(){
  // Adding all the basic stuff that will always be on
  textSize(15);
  fill('white');
  textAlign(CENTER, CENTER);
  resizeCanvas(windowWidth, windowHeight);
  noSmooth();
}

function createAndAskIfReturnButtonPressed(){
  // Making the return button then asking if it's clicked

  if (!isElementsOnThisSceenLoaded){
    returnButton = createButton("return to start screen");
    returnButton.elt.id = "returnButton";
  }
  returnButton.mousePressed(() => {
    state = "startScreen";
    removeElements();
    isElementsOnThisSceenLoaded = false;
  });
}

function findCotangent(num){
  // finding the cotangent of a number

  return Math.cos(num) / Math.sin(num);
}

function findSecant(num){
  // finding the secant of a number

  return 1 / Math.cos(num);
}

function findCosecant(num){
  // finding the cosecant of a number

  return 1 / Math.sin(num);
}

// finding the linear regression
function linearRegression(){
  // Setting up the vars
  let theXvalues = [];
  let values = [];
  let Xcounter = 0;
  let counter = 0;
  let averageOfX = 0;
  let averageOfY = 0;
  let a;
  let b;

  // finding the average of both the x and y tables
  for (let i = 0; i < graphBot.XTable.length; i++){
    averageOfX += Number(graphBot.XTable[i]);
    averageOfY += Number(graphBot.YTable[i]);
  }
  averageOfX = averageOfX / graphBot.XTable.length;
  averageOfY = averageOfY / graphBot.YTable.length;
  
  // doing the math to find all the x and y values to use as the A and B
  for (let i = 0; i < graphBot.XTable.length; i++){
    values.push((averageOfX - Number(graphBot.XTable[i]))* (averageOfY- Number(graphBot.YTable[i])));
    theXvalues.push((averageOfX - Number(graphBot.XTable[i]))** 2);
  }
  
  for (let i = 0; i < values.length; i++){
    counter += values[i];
    Xcounter += theXvalues[i];
  }
  
  b = counter / Xcounter;
  a = b * averageOfX - averageOfY;

  return {A: a, B: b};
}

// finding the quadratic regression
function quadraticRegression(){
  let a = 0;
  let b = 0;
  let c = 0;
  let x = 0;
  let y = 0;
  let x2 = 0;
  let x3 = 0;
  let x4 = 0;
  let xy = 0;
  let x2y = 0;
  let sigmaXX = 0;
  let sigmaXY = 0;
  let sigmaXX2 = 0;
  let sigmaX2Y = 0;
  let sigmaX2X2 = 0;

  // Setting up all the main vars to be changed later
  for (let i = 0; i < graphBot.XTable.length; i++){
    x += Number(graphBot.XTable[i]);
    y += Number(graphBot.YTable[i]);
    x2 += Number(graphBot.XTable[i]) ** 2;
    x3 += Number(graphBot.XTable[i]) ** 3;
    x4 += Number(graphBot.XTable[i]) ** 4;
    xy += Number(graphBot.XTable[i]) * Number(graphBot.YTable[i]);
    x2y += Number(graphBot.XTable[i]) ** 2 * Number(graphBot.YTable[i]);
  }
  
  // doing the math to find the sigmas
  sigmaXX = x2 - x**2 / graphBot.XTable.length;
  sigmaXY = xy - x * y / graphBot.XTable.length;
  sigmaXX2 = x3 - x2 * x / graphBot.XTable.length;
  sigmaX2Y = x2y - x2 * y / graphBot.XTable.length;
  sigmaX2X2 = x4 - x2 ** 2 / graphBot.XTable.length;
  
  // Finding A, B and C
  a = (sigmaX2Y * sigmaXX - sigmaXY * sigmaXX2) / (sigmaXX * sigmaX2X2 - sigmaXX2**2);
  b = (sigmaXY * sigmaX2X2 - sigmaX2Y * sigmaXX2) / (sigmaXX * sigmaX2X2 - sigmaXX2**2);
  c = y/graphBot.XTable.length - b * (x / graphBot.XTable.length) - a * (x2/graphBot.XTable.length);

  return {A: a, B: b, C: c};
}

// finding the cubic regression of the table
function cubicRegression(){
  let xMatrix;
  let yMatrix;
  let TxMatrix;
  let TxMatrix_XMatrix;
  let inversedTxMatrix_XMatrix;
  let cubicAnswer;
  let finalCubicAnswer;
  let cubicYTable = [];
  let cubicXTable = [];

  // Making a 2d array of X and Y Values
  for (let y = 0; y < graphBot.XTable.length; y++){
    cubicXTable.push([]);
    cubicYTable.push([]);
    cubicYTable[y][0] = Number(graphBot.YTable[y]);

    for (let x = 0; x < 4; x++){
      cubicXTable[y][x] = Number(graphBot.XTable[y]) ** x;
    }
  }

  // Creating all the Matries I will use T means tranpose and I means inverse and _ means mulitpily together
  yMatrix = matrix(cubicYTable);
  xMatrix = matrix(cubicXTable);
  TxMatrix = matrix(xMatrix.trans());
  TxMatrix_XMatrix = matrix(TxMatrix.prod(xMatrix));
  inversedTxMatrix_XMatrix = matrix(TxMatrix_XMatrix.inv());

  // finding the answer had to do it in two parts because how the library is
  cubicAnswer = matrix(inversedTxMatrix_XMatrix.prod(TxMatrix));
  finalCubicAnswer = matrix(cubicAnswer.prod(yMatrix));

  return {A: finalCubicAnswer()[0][0], B: finalCubicAnswer()[1][0], C: finalCubicAnswer()[2][0], D: finalCubicAnswer()[3][0]};
}

function loadNeededBot(){
  // loading the qna and toxicity bots 

  // QNA
  if (!qnaHasLoaded && state === "qna"){
    qnaBot = new Bots();
    qnaBot.loadQNAModel();
    qnaHasLoaded = true;
  }

  // Toxicity
  else if (!toxicityHasLoaded && state === "toxicity"){
    toxicityBot = new Bots();
    toxicityBot.loadToxicityModel();
    toxicityHasLoaded = true;
  }
}

function loadElements(){

  // loading start screen elements
  if (!isElementsOnThisSceenLoaded && state === "startScreen"){
    createStartScreenButtons();
    
    isElementsOnThisSceenLoaded = true;
  }

  // loading qna elements
  else if (!isElementsOnThisSceenLoaded && state === "qna"){
    createAnswerButton();

    userPassage = createElement("textarea", "Input a passage");
    userQuestion = createElement("textarea", "Input a question");

    userPassage.elt.id = "qnaUserPassage";
    userQuestion.elt.id = "qnaUserQuestion";

    userPassage.addClass("qnaInputs");
    userQuestion.addClass("qnaInputs");
    isElementsOnThisSceenLoaded = true;
  }

  // loading toxicity elements
  else if (!isElementsOnThisSceenLoaded && state === "toxicity"){
    createToxicityTable();

    userPassage = createElement("textarea", "input a passage");
    userPassage.elt.id = "toxicityPassage";

    createAnswerButton();

    isElementsOnThisSceenLoaded = true;
  }

  // loading graphing elements
  else if (!isElementsOnThisSceenLoaded && state === "graph"){    
    createButtonsAndInputsGraphing();

    // Table graphing
    if (graphingState === "table"){
      makeRegressionButtons();

      userXTable = createElement("textarea");
      userXTable.elt.id = "XTable";
      userXTable.addClass("userTable");

      userYTable = createElement("textarea");
      userYTable.elt.id = "YTable";
      userYTable.addClass("userTable");

      swapButton();
    }

    // Function graphing
    if (graphingState === "function"){  
      userFunction = createElement("textarea", "Function");
      userFunction.elt.id = "userFunction";

      userStep = createInput("Step Size", "number");
      userStep.elt.id = "userStep";
      userStep.addClass("graphInputNumbers");

      swapButton();
    }


    createAnswerButton();
  }
}

function checkQNAForAnswer(){
  // checking the qna passage and question for an answer if there is one print it else print error

  try {
    if (qnaBot.answer.length <= 0){
      text("Error no answer found", width/2, height/1.6);
    }

    for (let i = 0; i < qnaBot.answer.length; i++){
      text(`Answer: ${qnaBot.answer[i].text}  confidence score: ${qnaBot.answer[i].score.toFixed(2)}`, width/2, height/1.6 + i * 20);
    }
  }

  catch {
    if (qnaBot.isThisModelLoaded){
      text("model is loaded", width/2, height/1.6);
    }
    else{
      text("Please wait for model to load", width/2, height/1.6);
    }
  }
}

function createStartScreenButtons(){
  // creating the qna, toxicity and graph start screen buttons

  // qna
  qnaButton = createButton("QNA Bot");
  qnaButton.elt.id = "startQNAButton";
  qnaButton.addClass("startScreenButtons");

  qnaButton.mousePressed(() => {
    state = "qna";
    removeElements();
    isElementsOnThisSceenLoaded = false;
  });


  // toxicity
  toxicityButton = createButton("Toxicity Detection");
  toxicityButton.elt.id = "startToxicitybutton";
  toxicityButton.addClass("startScreenButtons");

  toxicityButton.mousePressed(() => {
    state = "toxicity";
    removeElements();
    isElementsOnThisSceenLoaded = false;
  });

  // graph
  graphButtion = createButton("Graph");
  graphButtion.elt.id = "startGraphButton";
  graphButtion.addClass("startScreenButtons");

  graphButtion.mousePressed(() => {
    state = "graph";
    removeElements();
    isElementsOnThisSceenLoaded = false;
  });
}

function fillToxicityTableWithAnswers(){
  // filling the toxicity table with true, false, or not confident to make choice
  try{
    for (let i = 1; i < tbl.elt.childElementCount; i++){
      if (predictions[i-1].results[0].match === null){
        tbl.elt.children[i].children[1].innerHTML = "not confident to make choice";
      }
      else{
        tbl.elt.children[i].children[1].innerHTML = predictions[i-1].results[0].match;
      }

      for (let j = 2; j < 4; j++){
        tbl.elt.children[i].children[j].innerHTML = `${(predictions[i-1].results[0].probabilities[j-2] * 100).toFixed(1)}%`;
      }
    }
  }

  // making text to say if the toxicityBot is loaded
  catch{
    if (toxicityBot.isThisModelLoaded){
      text("it is loaded", width/4, height/2.2);
    }
    else{
      text("wait to load", width/4, height/2.2);
    }
  }
}

function tableAndFunctionGrpahingUI(){
  // making ui for table and function graphing

  text("X Min", width/5, height/5);
  text("Y Min", width/2.85, height/5);
  text("X Max", width/2, height/5);
  text("Y Max", width/1.54, height/5);

  if (graphingState === "function"){
    text("Input a function to graph", width/2, height/8.5);
    text("Step Size", width/1.25, height/5);
  }

  else if (graphingState === "table"){
    text("x Table", width/2.5, height/10);
    text("y Table", width/1.68, height/10);
  }
}

function makeRegressionButtons(){
  // making all the regresson buttons

  // linear regression button
  linearRegressionButton = createButton("linear regression off");
  linearRegressionButton.elt.id = "linearRegressionButton";
  linearRegressionButton.addClass("regressionButtons");
  linearRegressionButton.mousePressed(() => {
    if (!doLinearRegression){
      linearRegressionButton.elt.innerHTML = "linear regression on";
    }
    else{
      linearRegressionButton.elt.innerHTML = "linear regression off";
    }
    doLinearRegression = !doLinearRegression;
  });

  // quadratic regression button
  quadraticRegressionButton = createButton("quadratic regression off");
  quadraticRegressionButton.elt.id = "quadraticRegressionButton";
  quadraticRegressionButton.addClass("regressionButtons");
  quadraticRegressionButton.mousePressed(() => {
    if (!doQuadraticRegression){
      quadraticRegressionButton.elt.innerHTML = "quadratic regression on";
    }
    else{
      quadraticRegressionButton.elt.innerHTML = "quadratic regression off";
    }
    doQuadraticRegression = !doQuadraticRegression;
  });

  // Cubic regression button
  cubicRegressionButton = createButton("cubic regression off");
  cubicRegressionButton.elt.id = "cubicRegressionButton";
  cubicRegressionButton.addClass("regressionButtons");
  cubicRegressionButton.mousePressed(() => {
    if (!doCubicRegression){
      cubicRegressionButton.elt.innerHTML = "cubic regression on";
    }
    else{
      cubicRegressionButton.elt.innerHTML = "cubic regression off";
    }
    doCubicRegression = !doCubicRegression;
  });
}

function createButtonsAndInputsGraphing(){
  // making all the inputs abd buttons for both table and function graphing

  buttonSwap = createButton();
  buttonSwap.elt.id = "graphingSwap";
  graphBot = new Graph();

  // plotify div
  div = createElement("div");
  div.elt.id = "graphArea";

  userXMin = createInput("X Min", "number");
  userXMin.elt.id = "userXMin";
  userXMin.addClass("graphInputNumbers");

  userYmin = createInput("Y min", "number");
  userYmin.elt.id = "userYmin";
  userYmin.addClass("graphInputNumbers");

  userXMax = createInput("X Max", "number");
  userXMax.elt.id = "userXMax";
  userXMax.addClass("graphInputNumbers");

  userYMax = createInput("Y Max", "number");
  userYMax.elt.id = "userYMax";
  userYMax.addClass("graphInputNumbers");
}

function createAnswerButton(){
  // creating the answer buttons for each section

  // qna
  if (state === "qna"){
    answerButton = createButton('click for answer');
    answerButton.elt.id = "qnaAnswerButton";
    answerButton.addClass("answerbutton");
    answerButton.mousePressed(() => {
      qnaBot.question = userQuestion.elt.value;
      qnaBot.passage = userPassage.elt.value;
      qnaBot.findTheAnswer();
    });
  }

  // toxicity
  else if (state === "toxicity"){
    answerButton = createButton('click for answer');
    answerButton.elt.id = "toxicityAnswerButtion";
    answerButton.addClass("answerbutton");
    answerButton.mousePressed(() => {
      if (toxicityBot.isThisModelLoaded){
        toxicityBot.passage = userPassage.elt.value;
        toxicityBot.findIfPassageIsToxic();
      }
    });
  }

  // graph
  else if (state === "graph"){
    answerButton = createButton('click for answer');
    answerButton.elt.id = "graphAnswerButton";
    answerButton.addClass("answerbutton");
    answerButton.mousePressed(() => {

      if (graphingState === "function"){
        graphBot.step = Number(userStep.elt.value);

        graphBot.function = userFunction.elt.value;

        graphBot.mathToComputerNotation();
      }

      else if (graphingState === "table"){
        graphBot.XTable = userXTable.elt.value.split(", ");
        graphBot.YTable = userYTable.elt.value.split(", ");
      }

      graphBot.XMin = Number(userXMin.elt.value);
      graphBot.YMin = Number(userYmin.elt.value);
      graphBot.XMax = Number(userXMax.elt.value);
      graphBot.YMax = Number(userYMax.elt.value);

      graphBot.graph();

      Plotly.newPlot("graphArea", data, layout);
    });
    isElementsOnThisSceenLoaded = true;
  }
}

function createToxicityTable(){
  // using the typesOfAttacks and titleWords lists to make a table waiting to be filled with values

  let typesOfAttacks = ["identity attack", "insult", "obscene", "servere toxicity", "sexual explicit", "threat", "toxicity"];
  let titleWords = ["Type of Attack", "Is F or T", "Prob of F", "Prob of T"];

  // making table
  tbl = createElement("table");

  // making the slots of the table
  let tr = createElement("tr");
  tbl.child(tr);
  for (let word of titleWords){
    theValue = createElement("th", `(${word}):`);
    theValue.addClass("title");
    tr.child(theValue);
  }

  for (let word of typesOfAttacks){
    let tr = createElement("tr");
    tbl.child(tr);
    for (let i = 0; i < 4; i++){
      if (i === 0){
        theValue = createElement("th", word);
      }
      else{
        theValue = createElement("td", "waiting input");
        theValue.addClass("numbers");
      }
      tr.child(theValue);
    }
  }
}

function swapButton(){
  
  // table
  if (graphingState === "table"){
    buttonSwap.elt.innerHTML = 'swap to function graphing';
    buttonSwap.mousePressed(() => {
      removeElements();
      graphingState = "function";
      isElementsOnThisSceenLoaded = false;
    });
  }

  // function
  else {
    buttonSwap.elt.innerHTML = 'swap to table graphing';
    buttonSwap.mousePressed(() => {
      removeElements();
      graphingState = "table";
      isElementsOnThisSceenLoaded = false;
    });
  }
}

function startTextAndImage(){
  text("Three kinda useful things ;)", width/2.05, height/4);
  text("by Caylixx Starr", width/2.05, height/3.6);
  image(img, width / 1.8, height/12);
}