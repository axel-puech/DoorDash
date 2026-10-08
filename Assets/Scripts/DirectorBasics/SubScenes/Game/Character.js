// Character manager : movement
//@input SceneObject parent

//@ui {"widget":"separator"}
//@input SceneObject charactedObj

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"Advanced"}
//@input float durationToChangeLane
//@input float dampingMovementIfFloating  {"widget":"slider", "min":0.1, "max":1, "step":0.1}
//@ui {"widget":"group_end"}

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//
let characTransform = script.charactedObj.getTransform();
let characCollider = script.charactedObj.getComponent("Physics.ColliderComponent");
let currentLane = 0;
let nextLane = 0;
//________Caller________//
let callerOnCollider = script.subScene.CreateCaller("OnCollide", 0);
//________Listener________//
let listenerGoRight = script.subScene.CreateListener("OnGoRight", OnGoRight, function () {});
let listenerGoLeft = script.subScene.CreateListener("OnGoLeft", OnGoLeft, function () {});
let listenerUserHeadMovement = script.subScene.CreateListener("OnUserHeadMovement", OnUserHeadMovement, function () {});

characCollider.onOverlapEnter.add(function (e) {
  callerOnCollider.Call(e);
});
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  currentLane = 0;
  nextLane = 0;
  SetUpDefaultPosition();
}
function OnLateStart() {}
function Update() {}
function Stop() {}

//___________________________Functions__________________________//
//Center the character depending on the number of lanes
function SetUpDefaultPosition() {
  let newPosX = 0;
  //If even
  if (global.IsNbrLaneEven()) {
    newPosX = 0.5;
  }

  let currentPos = characTransform.getLocalPosition();
  characTransform.setLocalPosition(new vec3(newPosX, currentPos.y, currentPos.z));
}

function OnGoRight() {
  if (!CanMove("right")) {
    return;
  }
  nextLane++;
  animMoveCharacter.Start(1);

  print("OnGoRight : " + nextLane);
}

function OnGoLeft() {
  if (!CanMove("left")) {
    return;
  }
  nextLane--;
  animMoveCharacter.Start(1);

  print("OnGoLeft : " + nextLane);
}

function CanMove(nameDirection) {
  switch (nameDirection) {
    case "right":
      if (nextLane === global.GetNbrLanes() - 1 - global.GetOffsetLaneToCenter()) {
        return false;
      }
      break;
    case "left":
      if (nextLane === -global.GetOffsetLaneToCenter()) {
        return false;
      }
      break;
    default:
      print("ERROR: wrong nameDirection : " + nameDirection);
  }

  return true;
}

function OnUserHeadMovement(newPositionX) {
  if (newPositionX == null || newPositionX == undefined) {
    return;
  }
  var currentPos = characTransform.getLocalPosition();
  characTransform.setLocalPosition(
    new vec3(Lerp(currentPos.x, newPositionX, script.dampingMovementIfFloating), currentPos.y, currentPos.z),
  );
}

function Lerp(a, b, t) {
  return (b - a) * t + a;
}

//___________________________Animations_________________________//
let animMoveCharacter = new Animation(
  script.getSceneObject(),
  script.durationToChangeLane,
  UpdateMoveCharacter,
  RepeatMode.None,
);
function UpdateMoveCharacter(ratio) {
  let currentPos = characTransform.getLocalPosition();
  let newPosX = Lerp(
    currentLane * global.GetDistanceBetweenLanes(),
    nextLane * global.GetDistanceBetweenLanes(),
    ratio,
  );
  if (IsNbrLaneEven()) {
    let newPosX = Lerp(
      (currentLane + 0.5) * global.GetDistanceBetweenLanes(),
      (nextLane + 0.5) * global.GetDistanceBetweenLanes(),
      ratio,
    );
  }
  characTransform.setLocalPosition(new vec3(newPosX, currentPos.y, currentPos.z));
}
animMoveCharacter.OnEnd = function (ratio) {
  if (ratio === 1) {
    currentLane = nextLane;
  }
};
