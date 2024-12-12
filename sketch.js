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
let tbl;

let wordList = ["identity attack", "insult", "obscene", "servere toxicity", "sexual explicit", "threat", "toxicity"];
let otherwordlist = ["Type of Attack", "Is F or T", "Prob of F", "Prob of T"];

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