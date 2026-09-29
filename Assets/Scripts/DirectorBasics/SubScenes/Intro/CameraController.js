//Manage camera persp position and rotation on start
//@input SceneObject parent

//@ui {"widget":"separator"}
//@input string cameraView {"widget":"combobox", "values":[{"label":"3rd person view", "value":"3rd person view"}, {"label":"Top view", "value":"Top view"}]}

//@ui {"widget":"separator"}
//@input SceneObject mainCameraPersp

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"Advanced"}
//@input vec3 positionThird {"showIf":"cameraView", "showIfValue":"3rd person view"}
//@input vec3 rotationThird {"hint":"In degrees", "showIf":"cameraView", "showIfValue":"3rd person view"}
//@input vec3 positionTop {"showIf":"cameraView", "showIfValue":"Top view"}
//@input vec3 rotationTop {"hint":"In degrees", "showIf":"cameraView", "showIfValue":"Top view"}
//@ui {"widget":"group_end"}

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

let mainCameraPerspTransform = script.mainCameraPersp.getTransform();

//________Caller________//
//________Listener________//
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {}
function OnLateStart() {}
function Update() {}
function Stop() {}
//___________________________Functions__________________________//
function InitCameraTransform() {
  switch (script.cameraView) {
    case "3rd person view":
      InitThirdPersonView();
      break;
    case "Top view":
      InitTopView();
      break;
    default:
      InitThirdPersonView();
      print("Warning: no persistant storage due to wrong cameraView string : " + script.cameraView);
      break;
  }
}

function InitThirdPersonView() {
  let rotationToApply = script.rotationThird;
  rotationToApply.x *= Math.PI / 180;
  rotationToApply.y = ((rotationToApply.y + (global.IsGameFrontToBack() ? 0 : 180)) * Math.PI) / 180;
  rotationToApply.z *= Math.PI / 180;

  SetCameraTransform(
    script.positionThird.mult(new vec3(1, 1, global.IsGameFrontToBack() ? 1 : -1)),
    quat.fromEulerVec(rotationToApply),
  );
}

function InitTopView() {
  let rotationToApply = script.rotationTop;
  rotationToApply.x *= Math.PI / 180;
  rotationToApply.y = ((rotationToApply.y + (global.IsGameFrontToBack() ? 0 : 180)) * Math.PI) / 180;
  rotationToApply.z *= Math.PI / 180;

  SetCameraTransform(
    script.positionTop.mult(new vec3(1, 1, global.IsGameFrontToBack() ? 1 : -1)),
    quat.fromEulerVec(rotationToApply),
  );
}

function SetCameraTransform(newPos, newRot) {
  mainCameraPerspTransform.setWorldPosition(newPos);
  mainCameraPerspTransform.setWorldRotation(newRot);
}

InitCameraTransform();

//___________________________Animations_________________________//
