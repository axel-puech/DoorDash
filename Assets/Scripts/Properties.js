class ExperienceProperties {
  constructor() {
    print("[ExperienceProperties] constructor called");
    this.totalScore = 0;
    this.burgerScore = 0;
    this.pizzaScore = 0;
    this.noodlesScore = 0;

    this.firstTime = true;
  }

  setNoodlesScore(score) {
    this.noodlesScore = score;
  }
  setBurgerScore(score) {
    this.burgerScore = score;
  }
  setPizzaScore(score) {
    this.pizzaScore = score;
  }
  getPizzaScore() {
    return this.pizzaScore;
  }
  getBurgerScore() {
    return this.burgerScore;
  }
  getNoodlesScore() {
    return this.noodlesScore;
  }
  getTotalScore() {
    this.totalScore = this.pizzaScore + this.burgerScore + this.noodlesScore;
    return this.totalScore;
  }

  resetScores() {
    this.totalScore = 0;
    this.burgerScore = 0;
    this.pizzaScore = 0;
    this.noodlesScore = 0;
  }
}

global.properties = new ExperienceProperties();
