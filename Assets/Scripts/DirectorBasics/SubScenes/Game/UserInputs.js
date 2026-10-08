//User inputs handling if we need to tap on the egdes or move our head to move the character
//@input SceneObject parent

//@ui {"widget":"separator"}
//@input string inputMode {"widget":"combobox", "values":[{"label":"HeadMovements", "value":"HeadMovements"}, {"label":"TapOnEdges", "value":"TapOnEdges"}, {"label":"TiltPhone", "value":"TiltPhone"}]}

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"Tap On Edges", "showIf":"inputMode", "showIfValue":"TapOnEdges"}
//@input float percentWhereCanTap {"widget":"slider", "min":0, "max":0.49, "step":0.01, "label":"Tappable Percent ", "hint":"This is the percent of the screen where the user can tap to go right/left. \n Example: if it equals to 0.25, we can go right by tapping on the 25% of the screen on right"}
//@ui {"widget":"group_end", "showIf":"inputMode", "showIfValue":"TapOnEdges"}

//@ui {"widget":"group_start", "label":"Head Tracking", "showIf":"inputMode", "showIfValue":"HeadMovements"}
//@input SceneObject faceTracker
//@input bool isCharacterFloating
//@input string mvtHeadType {"widget":"combobox", "values":[{"label":"X translation", "value":"translationX"}, {"label":"Z rotation", "value":"rotationZ"}]}

//@input float rotationThreshold {"widget":"slider", "min":0, "max":30, "step":0.1, "showIf":"isCharacterFloating", "showIfValue": false} //in degrees
//@input float positionThreshold {"widget":"slider", "min":0, "max":10, "step":0.1, "showIf":"isCharacterFloating", "showIfValue": true}
//@input float delayBetweenHeadMvts
//@input float multiplierMovementHead
//@ui {"widget":"group_end", "showIf":"inputMode", "showIfValue":"HeadMovements"}

//@ui {"widget":"group_start", "label":"Head Tracking", "showIf":"inputMode", "showIfValue":"TiltPhone"}
//@input SceneObject gyroTracking
//@input bool isCharacterFloatingTilt
//@input float multiplierMovementPhone
//@input float rotationPhoneThreshold {"widget":"slider", "min":0, "max":30, "step":0.1, "showIf":"isCharacterFloating", "showIfValue": false} //in degrees
//@input float positionPhoneThreshold {"widget":"slider", "min":0, "max":10, "step":0.1, "showIf":"isCharacterFloating", "showIfValue": true}
//@ui {"widget":"group_end", "showIf":"inputMode", "showIfValue":"TiltPhone"}

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//
let enableHeadMovement = false;
let isFaceFound = false;
let timerHeadMvt = 0;
let timerPhoneMvt = 0;
//________Caller________//
let callerGoRight = script.subScene.CreateCaller("OnGoRight");
let callerGoLeft = script.subScene.CreateCaller("OnGoLeft");
let callerUserHeadMovement = script.subScene.CreateCaller("OnUserHeadMovement", 0);
//________Listener________//
let enableHeadMovementListener = script.subScene.CreateListener("OnEnableHeadMovement", OnEnableHeadMovement);

let tapEvent = script.createEvent("TapEvent");
tapEvent.bind(onTapped);

let faceFoundEvent = script.createEvent("FaceFoundEvent");
faceFoundEvent.faceIndex = 0;
faceFoundEvent.bind(OnFaceFound);
let faceLostEvent = script.createEvent("FaceLostEvent");
faceLostEvent.faceIndex = 0;
faceLostEvent.bind(OnFaceLost);
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  isFaceFound = true;
  timerHeadMvt = 0;
  timerPhoneMvt = 0;
}
function OnLateStart() {}
function Update() {
  if (!global.IsGameHasStarted()) {
    return;
  }
  if (global.IsGameHasStopped()) {
    return;
  }

  if (script.inputMode === "HeadMovements") {
    if (!enableHeadMovement) return;
    UpdateHeadMovement();
  } else if (script.inputMode === "TiltPhone") {
    UpdatePhoneMovement();
  }
}
function Stop() {
  enableHeadMovement = false;
}

//___________________________Functions__________________________//
function OnEnableHeadMovement(toggle) {
  enableHeadMovement = toggle;
}

function UpdatePhoneMovement() {
  //Camera right vector
  let cameraRight = script.gyroTracking.getTransform().right;

  //Vector camera right projection
  let projectionOnXZPlan = cameraRight.projectOnPlane(new vec3(0, 1, 0));

  //Angle between the two vectors
  let angle = (projectionOnXZPlan.angleTo(cameraRight) * 180) / Math.PI;

  //negative angle or positive angle?
  let isClockwise = Math.sign(projectionOnXZPlan.sub(cameraRight).y);

  if (script.isCharacterFloatingTilt) {
    let newPos = angle * script.multiplierMovementPhone * isClockwise;
    if (Math.abs(newPos) > script.positionPhoneThreshold) {
      newPos = script.positionPhoneThreshold * Math.sign(newPos);
    }

    callerUserHeadMovement.Call(newPos);
  } else {
    if (angle >= script.rotationPhoneThreshold) {
      timerPhoneMvt = 0;
      callerGoLeft.Call();
    } else if (angle <= -script.rotationPhoneThreshold) {
      timerPhoneMvt = 0;
      callerGoRight.Call();
    }
  }
}
function OnFaceFound() {
  isFaceFound = true;
}

function OnFaceLost() {
  isFaceFound = false;
}

function UpdateHeadMovement() {
  if (!isFaceFound) {
    return;
  }
  if (script.mvtHeadType === "rotationZ") {
    CheckHeadRotation();
  } else if (script.mvtHeadType === "translationX") {
    CheckHeadPosition();
  }
}

function CheckHeadRotation() {
  if (timerHeadMvt < script.delayBetweenHeadMvts) {
    timerHeadMvt += getDeltaTime();
    return;
  }

  let currentHeadRot = script.faceTracker.getTransform().getWorldRotation().toEulerAngles();
  currentHeadRot.x *= 180 / Math.PI;
  currentHeadRot.y *= 180 / Math.PI;
  currentHeadRot.z *= 180 / Math.PI;

  if (script.isCharacterFloating) {
    if (currentHeadRot.z > 180) {
      currentHeadRot.z -= 360;
    }
    let newPos = -currentHeadRot.z * script.multiplierMovementHead;
    if (Math.abs(newPos) > script.positionThreshold) {
      newPos = script.positionThreshold * Math.sign(newPos);
    }

    callerUserHeadMovement.Call(newPos * (global.IsGameFrontToBack() ? 1 : -1));
  } else {
    if (currentHeadRot.z >= script.rotationThreshold && currentHeadRot.z < 180) {
      timerHeadMvt = 0;
      global.IsGameFrontToBack() ? callerGoLeft.Call() : callerGoRight.Call();
    } else if (currentHeadRot.z <= 360 - script.rotationThreshold && currentHeadRot.z > 180) {
      timerHeadMvt = 0;
      global.IsGameFrontToBack() ? callerGoRight.Call() : callerGoLeft.Call();
    }
  }
}

function CheckHeadPosition() {
  let currentHeadPos = script.faceTracker.getTransform().getWorldPosition();
  if (script.positionThreshold < Math.abs(currentHeadPos.x)) {
    return;
  }

  if (script.isCharacterFloating) {
    print(currentHeadPos.x * script.multiplierMovementHead);
    callerUserHeadMovement.Call(currentHeadPos.x * script.multiplierMovementHead);
  } else {
    if (timerHeadMvt < script.delayBetweenHeadMvts) {
      timerHeadMvt += getDeltaTime();
      return;
    }

    if (currentHeadPos.x < -script.positionThreshold / 2) {
      timerHeadMvt = 0;
      callerGoLeft.Call();
    } else if (currentHeadPos.x > script.positionThreshold / 2) {
      timerHeadMvt = 0;
      callerGoRight.Call();
    }
  }
}

function onTapped(eventData) {
  if (!(script.inputMode === "TapOnEdges")) {
    return;
  }
  if (!global.IsGameHasStarted()) {
    return;
  }
  if (global.IsGameHasStopped()) {
    return;
  }

  if (eventData.getTapPosition().x < script.percentWhereCanTap) {
    global.IsGameFrontToBack() ? callerGoLeft.Call() : callerGoRight.Call();
  } else if (eventData.getTapPosition().x > 1 - script.percentWhereCanTap) {
    global.IsGameFrontToBack() ? callerGoRight.Call() : callerGoLeft.Call();
  }
}

//___________________________Animations_________________________//
