// -----JS CODE-----
//@input Component.ScriptComponent[] subScenes

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"Ground"}
//@input int nbrLanes
//@input float distanceBetweenLanes  {"widget":"slider", "min":0.1, "max":5, "step":0.1}
//@input float defaultSpeed
//@ui {"widget":"group_end"}
script.scene = new global.Scene(script, script.subScenes);
script.scene.OnStart = Start;

//////////////////
/////// Variables
//////////////////
var currentSpeed = script.defaultSpeed;
var offsetLaneToCenterCharacter = 0;

//////////////////
/////// Init
//////////////////
function Start() {
  //currentSpeed
  currentSpeed = global.GetDefaultSpeed();

  //offsetLaneToCenterCharacter
  offsetLaneToCenterCharacter = 0;
  if (global.IsNbrLaneEven()) {
    offsetLaneToCenterCharacter = global.GetNbrLanes() / 2;
  }
  //If odd
  else {
    offsetLaneToCenterCharacter = (global.GetNbrLanes() - 1) / 2;
  }
}

//////////////////
/////// Speed
//////////////////
global.GetSpeed = function () {
  return currentSpeed;
};

global.SetSpeed = function (newSpeed) {
  if (typeof newSpeed != "number") {
    print("ERROR: wrong type of speed : " + typeof newSpeed);
  }
  currentSpeed = newSpeed;
};

global.AddSpeed = function (speedToAdd) {
  if (typeof speedToAdd != "number") {
    print("ERROR: wrong type of speed : " + typeof speedToAdd);
  }
  currentSpeed += speedToAdd;
};

global.GetDefaultSpeed = function () {
  return script.defaultSpeed;
};

//////////////////
/////// Lanes
//////////////////
global.GetNbrLanes = function () {
  return script.nbrLanes;
};

global.GetDistanceBetweenLanes = function () {
  return script.distanceBetweenLanes;
};

global.GetOffsetLaneToCenter = function () {
  return offsetLaneToCenterCharacter;
};

global.IsNbrLaneEven = function IsNbrLaneEven() {
  return global.GetNbrLanes() % 2 === 0;
};
