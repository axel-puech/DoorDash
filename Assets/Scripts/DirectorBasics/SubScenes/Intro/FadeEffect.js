// Manage fade effect of the objects/building according the Z position
// and let the dev change values just here instead of on every material

//Warning: the materials must be in the Normal Blend mode

//@input SceneObject parent

//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"Place all the materials rounded here"}
//@input Asset.Material[] materialsWithFade

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"Values"}
//@input float zThresholdValue {"widget":"slider", "min":-1000, "max":1000, "step":10}
//@input float fadeSizeValue {"widget":"slider", "min":0, "max":100, "step":1}
//@ui {"widget":"group_end"}

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//
//________Caller________//
//________Listener________//
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  InitFadeEffect();
}
function OnLateStart() {}
function Update() {}
function Stop() {}
//___________________________Functions__________________________//

function InitFadeEffect() {
  for (let i = 0; i < script.materialsWithFade.length; i++) {
    try {
      script.materialsWithFade[i].mainPass.zThreshold = script.zThresholdValue;
      script.materialsWithFade[i].mainPass.fadeSize = script.fadeSizeValue;
    } catch (error) {
      print("Error: didn't succeed to set the materials properties on element n° " + i);
    }
  }
}

//___________________________Animations_________________________//
