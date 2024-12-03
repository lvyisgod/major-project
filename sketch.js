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
let bg;

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
  bg = loadImage("robotMeme.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  newBot = new qnaBot();
  newBot.loadQNAModel();

  answerButton = createButton('click for answer');
  answerButton.position(width/2, height/1.9)
  answerButton.center("horizontal");
  answerButton.mousePressed(() => {
    question = userQuestion.elt.value;
    passage = userPassage.elt.value;
    newBot.findTheAnswer();
  })

  userPassage = createElement("textarea", "Input a passage");
  userQuestion = createElement("textarea", "Input a question");
  userPassage.size(width/2, height/3)
  userQuestion.size(350, 50);
  userPassage.position(0, height/16);
  userQuestion.position(0, height/2.25); 
  userPassage.center("horizontal");
  userQuestion.center("horizontal");
}

function draw() {
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