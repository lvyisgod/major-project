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
let newBot;
let userPassage;
let userQuestion;
let answerButton;
let answer;
let bg = "green";
let state = "startScreen";
let qnaHasLoaded = false;
let isElementsOnThisSceenLoaded = false;
let qnaButton;
let returnButton;
let toxicitybutton

class qnaBot{
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
      qnaButton = createButton("QNA Bot")
      qnaButton.elt.id = "startQNAButton";
      qnaButton.addClass("startScreenButtons");

      toxicitybutton = createButton("Toxicity Detection")
      toxicitybutton.elt.id = "startToxicitybutton";
      toxicitybutton.addClass("startScreenButtons");
      
      isElementsOnThisSceenLoaded = true;
    }

    qnaButton.mousePressed(() => {
      state = "qnaScreen";
      removeElements();
      isElementsOnThisSceenLoaded = false;
    })

    toxicitybutton.mousePressed(() => {
      state = "toxicity";
      removeElements();
      isElementsOnThisSceenLoaded = false;
    })
  }

  else if (state === "qnaScreen"){
    if (!qnaHasLoaded){
      newBot = new qnaBot();
      newBot.loadQNAModel();
      qnaHasLoaded = true;
    }

    createAndAskIfReturnButtonPressed();

    if (!isElementsOnThisSceenLoaded){
      returnButton = createButton("return to start screen")

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

    background(bg);
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

  else if (state = "toxicity") {
    background("darkgreen");

    createAndAskIfReturnButtonPressed();

    isElementsOnThisSceenLoaded = true;
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
  })
}