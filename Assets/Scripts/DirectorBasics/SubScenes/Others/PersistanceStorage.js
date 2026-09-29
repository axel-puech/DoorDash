// Store high score and last score
//@input string toStore {"widget":"combobox", "values":[{"label":"Time", "value":"time"}, {"label":"Distance", "value":"distance"}, {"label":"Lifes", "value":"lifes"}, {"label":"Points", "value":"points"}]}
//@input string storingMethod {"widget":"combobox", "values":[{"label":"Highest", "value":"highest"}, {"label":"Lowest", "value":"lowest"}]}

//////////////////
/////// VARIABLES
//////////////////
let store = global.persistentStorageSystem.store;
const scoreKeyHighScore = "highScore";
const scoreKeyLastScore = "lastScore";

//////////////////
/////// GLOBALS
//////////////////

global.GetHighScore = GetHighScore;
global.GetLastScore = GetLastScore;
global.OnNewScore = OnNewScore;

//////////////////
/////// INIT
//////////////////

function Start() {
  InitStorage();
}

function InitStorage() {
  SetHighScore(0);
  SetLastScore(0);
}

function GetHighScore() {
  return store.getFloat(scoreKeyHighScore);
}
function SetHighScore(newHighScore) {
  store.putFloat(scoreKeyHighScore, newHighScore);
}

function GetLastScore() {
  return store.getFloat(scoreKeyLastScore);
}
function SetLastScore(newLastScore) {
  store.putFloat(scoreKeyLastScore, newLastScore);
}

//////////////////
/////// NEW SCORE
//////////////////

//newScore properties
//time
//distance
//lifes
//points
function OnNewScore(newScore) {
  let valueToStore = -1;
  switch (script.toStore) {
    case "time":
      valueToStore = newScore.time;
      break;
    case "distance":
      valueToStore = newScore.distance;
      break;
    case "lifes":
      valueToStore = newScore.lifes;
      break;
    case "points":
      valueToStore = newScore.points;
      break;
    default:
      print("Warning: no persistant storage due to wrong toStore string : " + script.toStore);
      break;
  }

  SetLastScore(valueToStore);

  switch (script.storingMethod) {
    case "highest":
      if (valueToStore > GetHighScore()) {
        SetHighScore(valueToStore);
      }
      break;
    case "lowest":
      if (valueToStore < GetHighScore()) {
        SetHighScore(valueToStore);
      }
      break;
    default:
      print("Warning: no persistant storage due to wrong storingMethod string : " + script.storingMethod);
      break;
  }
}

Start();
