// -----JS CODE-----
//@input SceneObject parent

//@ui {"widget":"separator"}
//@input bool startOnAwake
//@input Component.Image transitionBG
//@input float durationFade
//@input int gameDirection {"widget":"combobox", "values":[{"label":"BackToFront", "value":0}, {"label":"FrontToBack", "value":1}]}

script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = LateStart;
script.subScene.OnStop = Stop;

//////////////////
/////// Globals
//////////////////
global.IsGameHasStarted = function () {
  return isGameHasStarted;
};
global.IsGameHasStopped = function () {
  return isGameHasStopped;
};
global.GameResults = function () {
  return isGameWon;
};

global.StartRun = function () {
  if (isGameHasStarted) {
    return;
  }
  isGameHasStarted = true;
  callerStartRun.Call();
};

global.IsGameFrontToBack = function () {
  return script.gameDirection === 0;
};

//////////////////
/////// Listeners/Callers
//////////////////
let callerStartRun = script.subScene.CreateCaller("OnStartRun");
let listenerStopRun = script.subScene.CreateListener("OnStopRun", OnStopRun, function () {});

//////////////////
/////// Variables
//////////////////
let isGameHasStarted = false;
let isGameHasStopped = false;
let isGameWon = null;

//////////////////
/////// INIT
//////////////////
function Start() {
  isGameHasStarted = false;
  isGameHasStopped = false;
  isGameWon = null;

  animFadeBG.JumpTo(1);
  animFadeBG.GoTo(0);
}

function LateStart() {
  if (script.startOnAwake) {
    // start run only after delay
    global.StartRun();
  }
}

function Stop() {}

function OnStopRun(hasWin) {
  print("END GAME. haswin = " + hasWin);
  isGameWon = hasWin;
  isGameHasStopped = true;

  animFadeBG.GoTo(1);
}

//////////////////
/////// Animation
//////////////////
let animFadeBG = new Animation(script.getSceneObject(), script.durationFade, UpdateFadeBG);
function UpdateFadeBG(ratio) {
  script.transitionBG.mainPass.baseColor = new vec4(1, 1, 1, ratio);
}
animFadeBG.OnEnd = function (ratio) {
  if (ratio === 1) {
    script.subScene.CallEnd(null);
  }
};
