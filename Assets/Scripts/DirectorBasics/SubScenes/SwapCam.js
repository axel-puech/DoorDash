//@input SceneObject parent
//@input SceneObject[] sceneObjectToDeactivate

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
  toggle(false);
}
function OnLateStart() {}
function Update() {}
function Stop() {
  toggle(true);
}
//___________________________Functions__________________________//

function toggle(status) {
  script.sceneObjectToDeactivate.forEach(function (element, id) {
    element.enabled = status;
  });
}

//___________________________Animations_________________________//
