// Manage round effect of the road/building and let the dev change values just here
// instead of on every material
//@input SceneObject parent

//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"Place all the materials rounded here"}
//@input Asset.Material[] materialsWithRound

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"Values"}
//@input int coefInclinaisonValue {"widget":"slider", "min":0, "max":1000, "step":10}
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
  InitRoundEffect();
}
function OnLateStart() {}
function Update() {}
function Stop() {}
//___________________________Functions__________________________//
function InitRoundEffect() {
  for (let i = 0; i < script.materialsWithRound.length; i++) {
    try {
      script.materialsWithRound[i].mainPass.coefInclinaison = script.coefInclinaisonValue;
    } catch (error) {
      print("Error: didn't succeed to set the coef inclinaison on element n° " + i);
    }
  }
}

//___________________________Animations_________________________//
