// Project Title
// Caylixx Starr
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let isAnswerLoaded;
let qnaNewBot, toxicityNewBot, graphBot;
let userPassage;
let userQuestion;
let answer;
let state = "startScreen";
let qnaHasLoaded = false, toxicityHasLoaded = false;
let isElementsOnThisSceenLoaded = false;
let returnButton, toxicityButton, qnaButton, graphButtion, answerButton;
const threshold = 0.6;
let predictions;
let tbl;
let div;


let data, layout;

let userFunction, userStep, userXMin, userYmin, userXMax, userYMax;
let userXTable, userYTable;
let buttonSwap;

let wordList = ["identity attack", "insult", "obscene", "servere toxicity", "sexual explicit", "threat", "toxicity"];
let otherwordlist = ["Type of Attack", "Is F or T", "Prob of F", "Prob of T"];

let graphingState = "function";

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

  graphFunction(){
    let xValues = [];
    let yValues = [];
    let titleSting;
    let dataMode;

    if (graphingState === "function"){
      for (let x = this.XMin - 200; x < this.XMax + 200; x += this.step){
        xValues.push(x);
        yValues.push(eval(this.function));
      }
    
      titleSting = "f(x) = " + this.unchangedFunction;
      dataMode = 'lines+markers';
    }

    else if (graphingState === "tableGraphing"){
      for (let i = 0; i < this.XTable.length; i++){
        xValues.push(Number(this.XTable[i]));
        yValues.push(Number(this.YTable[i]));
      }
    
      
      titleSting = "Table";
      dataMode = "markers";
    }

    data = [{x:xValues, y:yValues, mode: dataMode}];
    layout = {title: titleSting, yaxis:{autorange: false, range: [this.YMin, this.YMax]}, xaxis:{autorange: false, range: [this.XMin, this.XMax]}};
  }
}

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
  // bg = loadImage("robotMeme.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  textSize(15);
  fill('white');
  textAlign(CENTER, CENTER);
  resizeCanvas(windowWidth, windowHeight);

  if (state === "startScreen"){
    background("purple");
    if (!isElementsOnThisSceenLoaded){
      qnaButton = createButton("QNA Bot");
      qnaButton.elt.id = "startQNAButton";
      qnaButton.addClass("startScreenButtons");

      toxicityButton = createButton("Toxicity Detection");
      toxicityButton.elt.id = "startToxicitybutton";
      toxicityButton.addClass("startScreenButtons");

      graphButtion = createButton("Graph");
      graphButtion.elt.id = "startGraphButton";
      graphButtion.addClass("startScreenButtons");
      
      isElementsOnThisSceenLoaded = true;
    }

    qnaButton.mousePressed(() => {
      state = "qnaScreen";
      removeElements();
      isElementsOnThisSceenLoaded = false;
    });

    graphButtion.mousePressed(() => {
      state = "graph";
      removeElements();
      isElementsOnThisSceenLoaded = false;
    });

    toxicityButton.mousePressed(() => {
      state = "toxicity";
      removeElements();
      isElementsOnThisSceenLoaded = false;
    });
  }

  else if (state === "qnaScreen"){
    if (!qnaHasLoaded){
      newBot = new Bots();
      newBot.loadQNAModel();
      qnaHasLoaded = true;
    }

    createAndAskIfReturnButtonPressed();

    if (!isElementsOnThisSceenLoaded){
      answerButton = createButton('click for answer');
      answerButton.elt.id = "qnaButton";
      answerButton.mousePressed(() => {
        newBot.question = userQuestion.elt.value;
        newBot.passage = userPassage.elt.value;
        newBot.findTheAnswer();
      });

      userPassage = createElement("textarea", "Input a passage");
      userQuestion = createElement("textarea", "Input a question");
      userPassage.elt.id = "qnaUserPassage";
      userQuestion.elt.id = "qnaUserQuestion";
      userPassage.addClass("qnaInputs");
      userQuestion.addClass("qnaInputs");
      isElementsOnThisSceenLoaded = true;
    }

    background("green");



    try {
      if (newBot.answer.length <= 0){
        text("Error no answer found", width/2, height/1.6);
      }

      for (let i = 0; i < newBot.answer.length; i++){
        text(`Answer: ${newBot.answer[i].text}  confidence score: ${newBot.answer[i].score.toFixed(2)}`, width/2, height/1.6 + i * 20);
      }
    }

    catch {
      if (newBot.isThisModelLoaded){
        text("model is loaded", width/2, height/1.6);
      }
      else{
        text("Please wait for model to load", width/2, height/1.6);
      }
    }
  }

  else if (state === "toxicity") {
    background(color(180, 42, 32));
    if (!toxicityHasLoaded){
      toxicityNewBot = new Bots();
      toxicityNewBot.loadToxicityModel();
      toxicityHasLoaded = true;
    }

    createAndAskIfReturnButtonPressed();

    if (!isElementsOnThisSceenLoaded){

      tbl = createElement("table");

      let tr = createElement("tr");
      tbl.child(tr);
      for (let word of otherwordlist){
        theValue = createElement("th", `(${word}):`);
        theValue.addClass("title");
        tr.child(theValue);
      }

      for (let word of wordList){
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

      userPassage = createElement("textarea", "input a passage");
      userPassage.elt.id = "toxicityPassage";

      answerButton = createButton('click for answer');
      answerButton.elt.id = "toxicityButtion";
      answerButton.mousePressed(() => {
        if (toxicityNewBot.isThisModelLoaded){
          toxicityNewBot.passage = userPassage.elt.value;
          toxicityNewBot.findIfPassageIsToxic();
        }
      });

      isElementsOnThisSceenLoaded = true;
    }

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

    catch{
      if (toxicityNewBot.isThisModelLoaded){
        text("it is loaded", width/4, height/2.2);
      }
      else{
        text("wait to load", width/4, height/2.2);
      }
    }
  }

  else if (state === "graph"){
    background("mediumslateblue");
    createAndAskIfReturnButtonPressed();

    if (!isElementsOnThisSceenLoaded){    
      buttonSwap = createButton();
      buttonSwap.elt.id = "graphingSwap";
      graphBot = new Graph();
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

      answerButton = createButton('click for answer');
      answerButton.elt.id = "graphButton";

      if (graphingState === "tableGraphing"){
        userXTable = createElement("textarea");
        userXTable.elt.id = "XTable";
        userXTable.addClass("userTable");

        userYTable = createElement("textarea");
        userYTable.elt.id = "YTable";
        userYTable.addClass("userTable");

        buttonSwap.elt.innerHTML = 'swap to function graphing';
        buttonSwap.mousePressed(() => {
          removeElements();
          graphingState = "function";
          isElementsOnThisSceenLoaded = false;
        });
      }

      if (graphingState === "function"){
        userFunction = createElement("textarea", "Function");
        userFunction.elt.id = "userFunction";

        userStep = createInput("Step Size", "number");
        userStep.elt.id = "userStep";
        userStep.addClass("graphInputNumbers");

        buttonSwap.elt.innerHTML = 'swap to table graphing';
        buttonSwap.mousePressed(() => {
          removeElements();
          graphingState = "tableGraphing";
          isElementsOnThisSceenLoaded = false;
        });
      }

      answerButton.mousePressed(() => {

        if (graphingState === "function"){
          graphBot.step = Number(userStep.elt.value);

          graphBot.function = userFunction.elt.value;

          graphBot.mathToComputerNotation();
        }

        else if (graphingState === "tableGraphing"){
          graphBot.XTable = userXTable.elt.value.split(", ");
          graphBot.YTable = userYTable.elt.value.split(", ");
        }

        graphBot.XMin = Number(userXMin.elt.value);
        graphBot.YMin = Number(userYmin.elt.value);
        graphBot.XMax = Number(userXMax.elt.value);
        graphBot.YMax = Number(userYMax.elt.value);

        graphBot.graphFunction();

        Plotly.newPlot("graphArea", data, layout);
      });
      isElementsOnThisSceenLoaded = true;
    }

    text("X Min", width/5, height/5);
    text("Y Min", width/2.85, height/5);
    text("X Max", width/2, height/5);
    text("Y Max", width/1.54, height/5);

    if (graphingState === "function"){
      text("Input a function to graph", width/2, height/8.5);
      text("Step Size", width/1.25, height/5);
    }

    else if (graphingState === "tableGraphing"){
      text("x Table", width/2.5, height/10);
      text("y Table", width/1.68, height/10);
    }
  }
}

function createAndAskIfReturnButtonPressed(){
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
  return Math.cos(num) / Math.sin(num);
}

function findSecant(num){
  return 1 / Math.cos(num);
}

function findCosecant(num){
  return 1 / Math.sin(num);
}

function linearRegression(){
  let theXvalues = [];
  let values = [];
  let Xcounter = 0;
  let counter = 0;
  let avgX = 0;
  let avgY = 0;

  for (let i = 0; i < graphBot.XTable.length; i++){
    avgX += Number(graphBot.XTable[i]);
    avgY += Number(graphBot.YTable[i]);
  }
  avgX = avgX / graphBot.XTable.length;
  avgY = avgY / graphBot.YTable.length;
  
  for (let i = 0; i < graphBot.XTable.length; i++){
    values.push((avgX - Number(graphBot.XTable[i]))* (avgY- Number(graphBot.YTable[i])));
    theXvalues.push((avgX - Number(graphBot.XTable[i]))** 2);
  }
  
  for (let i = 0; i < values.length; i++){
    counter += values[i];
    Xcounter += theXvalues[i];
  }
  
  b = counter / Xcounter;
  a = b * avgX - avgY;
}