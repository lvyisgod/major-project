// Project Title
// Caylixx Starr
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let question = 'who is god';
let passage = 'World War I[b] or the First World War (28 July 1914 – 11 November 1918), also known as the Great War, was a global conflict between two coalitions: the Allies (or Entente) and the Central Powers. Fighting took place mainly in Europe and the Middle East, as well as in parts of Africa and the Asia-Pacific, and in Europe was characterised by trench warfare; the widespread use of artillery, machine guns, and chemical weapons (gas); and the introductions of tanks and aircraft. World War I was one of the deadliest conflicts in history, resulting in an estimated 10 million military dead and more than 20 million wounded, plus some 10 million civilian dead from causes including genocide. The movement of large numbers of people was a major factor in the deadly Spanish flu pandemic.';
let isModelLoaded = false;
let isAnswerLoaded;
let newBot;
let userPassage;
let userQuestion;
let answerButton;
let answer;

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

function setup() {
  createCanvas(windowWidth, windowHeight);
  newBot = new qnaBot();
  newBot.loadQNAModel();


  userPassage = createElement('textarea');
  userPassage.position(width/2, height/2);
  userPassage.elt.id = "userPassage";
}

function draw() {
  background(220);
  textAlign(CENTER, CENTER);

  try {

    if (newBot.answer.length <= 0){
      text("Error no answer found", width/2, height/2);
    }

    for (let i = 0; i < newBot.answer.length; i++){
      text(`${newBot.answer[i].text}  the score:  ${newBot.answer[i].score}`, width/2, height/2 + i * 20);
    }
  }

  catch {
    if (isModelLoaded){
      text("model is loaded", width/2, height/2);
    }
    else{
      text("Please wait for model to load", width/2, height/2);
    }
  }
}

function mousePressed(){
  newBot.findTheAnswer();
}
