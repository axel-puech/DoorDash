//@input SceneObject parent
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
function Start() {}
function OnLateStart() {}
function Update() {}
function Stop() {}
//___________________________Functions__________________________//

//___________________________Animations_________________________//

// INTRO
// - add tilt hint
// - add TEXT
// - change feedback user
// - add gray
// - add bitmoji user

// GAME
//- flare when taking object
//- vignette when taking obstacle
//- fade in burger, pizza, noodle on end intro and timer
//

//
