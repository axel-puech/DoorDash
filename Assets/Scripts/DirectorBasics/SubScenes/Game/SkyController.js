// Sky controller
//@input SceneObject parent

//@ui {"widget":"separator"}
//@input Component.Image sky
//@input float strengthIntensityLight

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//
//In case there is no end time value, the sky will change throught 60sec
let maxTime = 60;

//________Caller________//
//________Listener________//
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  InitMaxTime();
}
function OnLateStart() {}
function Update() {
  let ratioSky = global.GetActualTimer() / maxTime;
  script.sky.mainPass.mixRatio = ratioSky;
}
function Stop() {}
//___________________________Functions__________________________//

function InitMaxTime() {
  if (global.GetHasTimeEnd()) {
    if (global.GetEndTimeValue() <= 0) {
      print("ERROR : global.GetEndTimeValue is equal to zero or negative");
    } else {
      maxTime = global.GetEndTimeValue();
    }
  }
}

//___________________________Animations_________________________//
