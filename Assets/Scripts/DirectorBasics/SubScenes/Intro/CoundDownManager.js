// Bonus : Zoom blur
// bonus lut glowy
// systeme libre

//@input SceneObject parent
//@input int beforeStartDelay
//@input Asset.Material[] introMaterials
//@input Asset.Material whiteScreenMaterial
//@input float fadeDuration

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//
//________Caller________//
const endIntroCaller = script.subScene.CreateCaller("OnEndIntro");
//________Listener________//

const StartDelay = script.subScene.CreateEvent("DelayedCallbackEvent", OnStartDelay);

//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {}
function OnLateStart() {
  StartDelay.event.reset(script.beforeStartDelay);
}
function Update() {}
function Stop() {
  fadeIntroElements.Reset();
  fadeWhiteScreen.Reset();
  fadeIntroElements.JumpTo(1);
  fadeWhiteScreen.JumpTo(0.5);
}
//___________________________Functions__________________________//

function OnStartDelay() {
  fadeIntroElements.GoTo(0);
  fadeWhiteScreen.GoTo(0);
}

//___________________________Animations_________________________//

const fadeIntroElements = new Animation(script.getSceneObject(), script.fadeDuration, (ratio) => {
  script.introMaterials.forEach((material) => {
    material.mainPass.alphaRatio = ratio;
  });
});

fadeIntroElements.OnEnd = function (ratio) {
  if (ratio === 0) {
    print("end");
    endIntroCaller.Call();
  }
};

const fadeWhiteScreen = new Animation(script.getSceneObject(), script.fadeDuration, (ratio) => {
  script.whiteScreenMaterial.mainPass.alphaRatio = ratio;
});
