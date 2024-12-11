// Project Title
// Caylixx Starr
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let isAnswerLoaded;
let qnaNewBot, toxicityNewBot;
let userPassage;
let userQuestion;
let answer;
let state = "startScreen";
let qnaHasLoaded = false, toxicityHasLoaded = false;
let isElementsOnThisSceenLoaded = false;
let returnButton, toxicityButton, qnaButton, answerButton;
const threshold = 0.6;
let predictions;
let tbl

let wordList = ["identity attack", "insult", "obscene", "servere toxicity", "sexual explicit", "threat", "toxicity"];

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
      
      isElementsOnThisSceenLoaded = true;
    }

    qnaButton.mousePressed(() => {
      state = "qnaScreen";
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
    textSize(15);
    fill('white');


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
    background("darkgreen");

    if (!toxicityHasLoaded){
      toxicityNewBot = new Bots();
      toxicityNewBot.loadToxicityModel();
      toxicityHasLoaded = true;
    }

    createAndAskIfReturnButtonPressed();

    if (!isElementsOnThisSceenLoaded){

      tbl = createElement("table");

      for (let word of wordList){
        let tr = createElement("tr");
        tbl.child(tr);
        for (let i = 0; i < 4; i++){
          if (i === 0){
            theValue = createElement("th", word);
          }
          else{
            theValue = createElement("td", "waiting for input");
            theValue.addClass("numbers")
          }
          tr.child(theValue);
        }
      }

      // createTable();

      userPassage = createElement("textarea", "input a passage");
      userPassage.elt.id = "toxicityPassage";

      answerButton = createButton('click for answer');
      answerButton.elt.id = "qnaButton";
      answerButton.mousePressed(() => {
        if (toxicityNewBot.isThisModelLoaded){
          toxicityNewBot.passage = userPassage.elt.value;
          toxicityNewBot.findIfPassageIsToxic();
        }
      });

      isElementsOnThisSceenLoaded = true;
    }

    try{
      for (let i = 0; i < 7; i++){
        if (predictions[i].results[0].match === null){
          predictions[i].results[0].match = "not confident to make a choice";
        }
        text(`Is it a ${wordList[i]}: ${predictions[i].results[0].match}` , width/2, height/3 + i * 20);
        for (let j = 0; j < 2; j++){
          text(predictions[i].results[0].probabilities[j], width/2 + j * 200, height/1.5 + i * 20);
        }
      }
    }

    catch{
      if (toxicityNewBot.isThisModelLoaded){
        text("it is loaded", width/2, height/2);
      }
      else{
        text("wait to load", width/2, height/2);
      }
    }

    // predictions[0].results[0].probabilities[0];
    // 0.9982390403747559
    // predictions[0].results[0].probabilities[1];
    // 0.0017609137576073408
    // predictions[0].results[0].match
    // false
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