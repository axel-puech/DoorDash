//Manage ground movement
//@input SceneObject parent

//@ui {"widget":"separator"}
//@input SceneObject groundObj

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"Advanced"}
//@input float durationToReachSpeed
//@input float speedMultiplier {"hint":"Calibrate ground scroll speed relative to game speed"}
//@ui {"widget":"group_end"}

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//
let groundMat = script.groundObj.getComponent("Component.RenderMeshVisual").mainPass;
let speedIncrement = 1;
//________Caller________//

//________Listener________//
let listenerStartRun = script.subScene.CreateListener("OnStartRun", OnStartRun, function () {});
let listenerStopRun = script.subScene.CreateListener("OnStopRun", OnStopRun, function () {});

let listenerOnSpeedChange = script.subScene.CreateListener("OnSpeedChange", function (eventData) {
  speedIncrement = eventData.speedIncrement;
});
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  animFadeSpeedGround.Reset();
  groundMat.uv2Offset = new vec2(1, 0);
}
function OnLateStart() {}
function Update() {
  groundMat.uv2Offset = new vec2(
    1,
    groundMat.uv2Offset.y + currentSpeed * getDeltaTime() * script.speedMultiplier * speedIncrement,
  );
}
function Stop() {}
//___________________________Functions__________________________//

function OnStartRun() {
  animFadeSpeedGround.GoTo(1);
}

function OnStopRun() {
  animFadeSpeedGround.GoTo(0);
}

//___________________________Animations_________________________//

let animFadeSpeedGround = new Animation(
  script.getSceneObject(),
  script.durationToReachSpeed,
  UpdateSpeedGround,
  RepeatMode.None,
);
function UpdateSpeedGround(ratio) {
  currentSpeed = global.GetDefaultSpeed() * ratio;
}
