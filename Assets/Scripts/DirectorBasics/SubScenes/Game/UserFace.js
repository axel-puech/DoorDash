//@input SceneObject parent

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"User Face"}
//@input Asset.Material userFaceMat
//@input SceneObject headBinding
//@input Component.Camera cameraPersp
//@ui {"widget":"group_end"}

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);

//__________________________Variables_____________________________//
let headBindingTr = script.headBinding.getTransform();

//________Caller________//
//________Listener________//
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {}
function OnLateStart() {}
function Update() {
  let posHeadBinding = headBindingTr.getWorldPosition();
  // let headSPos = script.cameraPersp.worldSpaceToScreenSpace(posHeadBinding);
  // script.userFaceMat.mainPass.headScreenPos = headSPos;
}
function Stop() {}
//___________________________Functions__________________________//

//___________________________Animations_________________________//
