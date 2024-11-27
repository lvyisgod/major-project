// Project Title
// Caylixx Starr
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"
let question = 'what gender is Bobo Fet';
let passage = 'Bobo fet is a male';
let answer;
let model;

let loadModel = async() => {
  model = await qna.load();
};

// qna.load().then(model => {
//   model.findAnswers(question, passage).then(answers => {
//     console.log('answers are ', answers);
//     answer = answers;
//   });
// });

function setup() {
  createCanvas(windowWidth, windowHeight);
  loadModel();
}

function draw() {
  background(220);
  textAlign(CENTER, CENTER);
  try{
    text(answer[0].text, width/2, height/2);
  }
  catch{
    text("Please wait for model to load", width/2, height/2);
  }
}
