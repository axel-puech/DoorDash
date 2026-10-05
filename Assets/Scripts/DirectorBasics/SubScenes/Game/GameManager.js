// -----JS CODE-----
//@input SceneObject parent

//@ui {"widget":"separator"}
//@input bool startOnAwake
//@input Component.Image transitionBG
//@input float durationFade
//@input int gameDirection {"widget":"combobox", "values":[{"label":"BackToFront", "value":0}, {"label":"FrontToBack", "value":1}]}
//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"UI Settings"}
//@input Asset.Material[] gameUIMaterials

//@input Component.Text textPizza
//@input Component.Text textBurger
//@input Component.Text textNoodles

//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"TIME elements"}
//@input Asset.Material timeMaterial
//@input Component.Text textTime

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
let listenerEndIntro = script.subScene.CreateListener("OnEndIntro", OnEndIntro, function () {});
let listenerStartCountdown = script.subScene.CreateListener("OnStartCountdown", function () {
  fadeTimeElements.GoTo(1);
});

function OnEndIntro() {
  fadeGameUIElements.GoTo(1);
}

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
  global.properties.resetScores();
  isGameHasStarted = false;
  isGameHasStopped = false;
  isGameWon = null;

  if (global.properties.firstTime === false) {
    animFadeBG.JumpTo(1);
    animFadeBG.GoTo(0);
  }
}

function LateStart() {
  if (script.startOnAwake) {
    // start run only after delay
    global.StartRun();
  }
}

function Stop() {
  fadeGameUIElements.Reset();
  fadeTimeElements.Reset();
}

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

const fadeGameUIElements = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  script.gameUIMaterials.forEach((material) => {
    material.mainPass.alphaRatio = ratio;
  });

  [script.textPizza, script.textBurger, script.textNoodles].forEach((text) => {
    if (!text) {
      return;
    }

    const color = text.textFill.color;
    text.textFill.color = new vec4(color.x, color.y, color.z, ratio);
  });
});

const fadeTimeElements = new Animation(script.getSceneObject(), 0.3, (ratio) => {
  script.timeMaterial.mainPass.alphaRatio = ratio;

  if (script.textTime) {
    const color = script.textTime.textFill.color;
    script.textTime.textFill.color = new vec4(color.x, color.y, color.z, ratio);
  }
});
