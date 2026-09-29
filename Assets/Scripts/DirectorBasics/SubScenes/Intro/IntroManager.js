//@input SceneObject parent

//@ui {"widget":"separator"}
//@input Component.Image transitionBG
//@input Component.Text textIntro

//@ui {"widget":"separator"}
//@input float durationFade

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);

//__________________________Variables_____________________________//

let tapEvent = script.subScene.CreateEvent("TapEvent", OnTap);
let hasTapped = false;
//________Caller________//
//________Listener________//
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  hasTapped = false;
  animFadeBG.JumpTo(1);
  animFadeText.JumpTo(1);
}

function OnLateStart() {}
function Update() {}
function Stop() {}
//___________________________Functions__________________________//

function OnTap() {
  if (hasTapped) {
    return;
  }
  hasTapped = true;

  animFadeBG.GoTo(1);
}

//___________________________Animations_________________________//

let animFadeBG = new Animation(script.getSceneObject(), script.durationFade, UpdateFadeBG);
function UpdateFadeBG(ratio) {
  script.transitionBG.mainPass.baseColor = new vec4(1, 1, 1, ratio);
}
animFadeBG.OnEnd = function (ratio) {
  if (ratio === 1) {
    script.subScene.CallEnd(null);
  }
};

let animFadeText = new Animation(script.getSceneObject(), script.durationFade, UpdateFadeText);
function UpdateFadeText(ratio) {
  script.textIntro.textFill.color = new vec4(0, 0, 0, ratio);
}
