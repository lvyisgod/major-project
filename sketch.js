// Project Title
// Caylixx Starr
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let question;
let passage;
let isModelLoaded = false;
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

class Bots{
  constructor(){
    this.model = undefined;
    this.answer = undefined;
  }

  async loadQNAModel() {
    this.model = await qna.load();
    isModelLoaded = true;
  }

  async findTheAnswer() {
    this.answer = await this.model.findAnswers(question, passage);
  }

  async loadToxicityModel() {
    this.model = await toxicity.load(threshold);
  }

  async findIfPassageIsToxic() {
    predictions = await this.model.classify(passage);
    isModelLoaded = true;
  }
}

function preload(){
  // bg = loadImage("robotMeme.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
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
      returnButton = createButton("return to start screen");

      answerButton = createButton('click for answer');
      answerButton.elt.id = "qnaButton";
      answerButton.mousePressed(() => {
        question = userQuestion.elt.value;
        passage = userPassage.elt.value;
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
    textAlign(CENTER, CENTER);
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
      if (isModelLoaded){
        text("model is loaded", width/2, height/1.6);
      }
      else{
        text("Please wait for model to load", width/2, height/1.6);
      }
    }
  }

  else if (state === "toxicity") {
    background("darkgreen");

    createAndAskIfReturnButtonPressed();

    isElementsOnThisSceenLoaded = true;

    passage = "you are so bad and sexy";

    if (!toxicityHasLoaded){
      toxicityNewBot = new Bots();
      toxicityNewBot.loadToxicityModel();
      toxicityNewBot.findIfPassageIsToxic();
      toxicityHasLoaded = true;
    }

    if (isModelLoaded){
      for (let i = 0; i < 7; i++){
        console.log(predictions[i].results[0].match);
        for (let j = 0; j < 2; j++){
          console.log(predictions[i].results[0].probabilities[j]);
        }
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