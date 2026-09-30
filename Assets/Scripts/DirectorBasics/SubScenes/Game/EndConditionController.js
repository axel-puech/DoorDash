// Manage Time and travelled Distance
// If time reaches the endTimeValue ==> loose
// If distance reaches the endDistanceValue ==> loose
// If loose all lifes ==> loose

//@input SceneObject parent

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"Debug"}
//@input Component.Text textTime

//@input Component.Text textPizza
//@input Component.Text textBurger
//@input Component.Text textNoodles

//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"End Condition"}
//@input bool hasTimeEnd
//@input bool isTimerAscending {"showIf":"hasTimeEnd"}
//@input float endTimeValue {"widget":"slider", "min":0, "max":300, "step":1, "showIf":"hasTimeEnd"}
//@ui {"widget":"separator"}
//@input bool hasDistanceEnd
//@input float endDistanceValue {"widget":"slider", "min":0, "max":300, "step":1, "showIf":"hasDistanceEnd"}
//@ui {"widget":"separator"}
//@input bool hasPointEnd
//@input int endPointValue {"widget":"slider", "min":0, "max":300, "step":1, "showIf":"hasPointEnd"}
//@ui {"widget":"separator"}
//@input bool hasLifeEnd
//@input int startLifeValue {"widget":"slider", "min":0, "max":10, "step":1, "showIf":"hasLifeEnd"}
//@ui {"widget":"group_end"}

script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);

//////////////////
/////// Globals
//////////////////
//TIME
global.GetHasTimeEnd = function () {
  return script.hasTimeEnd;
};
global.GetEndTimeValue = function () {
  return script.endTimeValue;
};
global.GetTimer = function () {
  return timer;
};
global.GetActualTimer = function () {
  return actualTimer;
};
global.AddTime = function (timeToAdd) {
  if (typeof timeToAdd != "number") {
    print("ERROR: wrong type of time bonus/malus : " + typeof timeToAdd);
  }
  AddTime(timeToAdd);
};

//DISTANCE
global.GetHasDistanceEnd = function () {
  return script.hasDistanceEnd;
};
global.GetEndDistanceValue = function () {
  return script.endDistanceValue;
};
global.GetDistance = function () {
  return distance;
};

//POINT
global.GetHasPointEnd = function () {
  return script.hasPointEnd;
};
global.GetEndPointValue = function () {
  return script.endPointValue;
};
global.GetPoint = function () {
  return points;
};
global.AddPoints = function (pointToAdd) {
  if (typeof pointToAdd != "number") {
    print("ERROR: wrong type of point bonus/malus : " + typeof pointToAdd);
  }
  AddPoints(pointToAdd);
};

//LIFE
global.GetHasLifeEnd = function () {
  return script.hasLifeEnd;
};
global.GetLife = function () {
  return life;
};
global.AddLifes = function (lifeToAdd) {
  if (typeof lifeToAdd != "number") {
    print("ERROR: wrong type of time bonus/malus : " + typeof lifeToAdd);
  }
  AddLifes(lifeToAdd);
};

//////////////////
/////// Listeners/Callers
//////////////////
let listenerOnStartRun = script.subScene.CreateListener("OnStartRun", OnStartRun, function () {});
let listenerEndIntro = script.subScene.CreateListener("OnEndIntro", OnEndIntro, function () {});

function OnEndIntro() {
  introEnded = true;
  print("Start counter");
}

let listenerCollectObject = script.subScene.CreateListener("OnCollectObject", OnCollectObject);

//Param:
//true = win
//false = loose
let callerOnStopRun = script.subScene.CreateCaller("OnStopRun", false);

//////////////////
/////// Variables
//////////////////

const textPizza = script.textPizza;
const textBurger = script.textBurger;
const textNoodles = script.textNoodles;

//Timer = the time displayed on the game that can be changed by malus/bonus
let timer = 0;
//Actual timer = the real time since the end of start of the run
let actualTimer = 0;

//point obtained
let points_pizza = 0;
let points_burger = 0;
let points_noodle = 0;

// if the intro ended
let introEnded = false;

//////////////////
/////// INIT
//////////////////
function Start() {
  timer = 0;
  distance = 0;
  actualTimer = 0;
  points = 0;
  points_pizza = 0;
  points_burger = 0;
  points_noodle = 0;
  life = script.startLifeValue;
  script.textTime.text = FormatTime(script.isTimerAscending ? 0 : script.endTimeValue);
  UpdatePoints(textPizza, points_pizza);
  UpdatePoints(textBurger, points_burger);
  UpdatePoints(textNoodles, points_noodle);
}

function OnStartRun() {}

function Stop() {}

function Update() {
  if (!global.IsGameHasStarted()) {
    return;
  }
  if (global.IsGameHasStopped()) {
    return;
  }

  if (!introEnded) return;

  UpdateTime();
}
//////////////////
/////// FUNCTION
//////////////////
function OnCollectObject(id) {
  if (id === "CollectablePizza") {
    points_pizza += 1;
    UpdatePoints(textPizza, points_pizza);
  } else if (id === "CollectableNoodle") {
    points_noodle += 1;
    UpdatePoints(textNoodles, points_noodle);
  } else if (id === "CollectableBurger") {
    points_burger += 1;
    UpdatePoints(textBurger, points_burger);
  }
}

//////////////////
/////// TIME
//////////////////
function UpdateTime() {
  timer += getDeltaTime();
  actualTimer += getDeltaTime();
  let timeToDisplay = Math.floor(timer);
  if (!script.isTimerAscending) {
    timeToDisplay = Math.ceil(script.endTimeValue - timer);
  }
  script.textTime.text = FormatTime(timeToDisplay);

  //Loose
  if (script.hasTimeEnd === true && timer >= script.endTimeValue) {
    global.properties.setNoodlesScore(points_noodle);
    global.properties.setBurgerScore(points_burger);
    global.properties.setPizzaScore(points_pizza);
    
    callerOnStopRun.Call(false);
  }
}

function FormatTime(timeInSeconds) {
  let totalSeconds = Math.max(0, Math.floor(timeInSeconds));
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  let formattedMinutes = (minutes < 10 ? "0" : "") + minutes;
  let formattedSeconds = (seconds < 10 ? "0" : "") + seconds;
  return formattedMinutes + ":" + formattedSeconds;
}

function AddTime(timeToAdd) {
  timer += timeToAdd;
  if (timer >= script.endTimeValue) {
    timer = script.endTimeValue;
  } else if (timer < 0) {
    timer = 0;
  }
}

//////////////////
/////// POINTS
//////////////////
function UpdatePoints(typeText, typePoints) {
  typeText.text = typePoints.toString();
  // script.textPoint.text = points.toString();
}
