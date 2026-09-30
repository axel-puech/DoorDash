//@input SceneObject parent
//@input SceneObject parentPrefab
//@input Asset.ObjectPrefab bitmojiPrefab

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

const visiblePos = new vec3(0, 0, 0);
const positionYHided = 90;
const hiddedPos = new vec3(visiblePos.x, visiblePos.y - positionYHided, visiblePos.z);

const transform = script.parentPrefab.getTransform();

let instance = null;

//________Caller________//
//________Listener________//
const showBitmojiListener = script.subScene.CreateListener("showBitmojiEvent", function () {
  show();
});

const hideBitmojiListener = script.subScene.CreateListener("hideBitmojiEvent", function () {
  hide();
});

//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  hide();
}

function OnLateStart() {
  print("instanciation of the prefab");
  instance = script.bitmojiPrefab.instantiate(script.parentPrefab);
}

function Update() {}
function Stop() {}
//___________________________Functions__________________________//

function hide() {
  transform.setLocalPosition(hiddedPos);
}
function show() {
  transform.setLocalPosition(visiblePos);
}
//___________________________Animations_________________________//
