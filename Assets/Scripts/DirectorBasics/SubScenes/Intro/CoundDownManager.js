// Bonus : Zoom blur
// bonus lut glowy
// systeme libre

//@input SceneObject parent
//@input int beforeStartDelay

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
function Stop() {}
//___________________________Functions__________________________//

function OnStartDelay() {
  endIntroCaller.Call();
}

//___________________________Animations_________________________//
