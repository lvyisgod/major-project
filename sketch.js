// Project Title
// Caylixx Starr
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"
let question = 'what gender is Bobo Fet';
let passage = 'Bobo fet is a male';

qna.load().then(model => {
  // Find the answers
  model.findAnswers(question, passage).then(answers => {
    console.log('Answers: ', answers);
  });
});

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  textAlign(CENTER, CENTER);
}
