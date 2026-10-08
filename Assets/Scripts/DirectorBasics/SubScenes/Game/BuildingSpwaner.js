//Building spawner manager
//It will create a pool for every type of building
//It creates building on the right and left sides
//It fills the whole road on start then add new building once there is space
//@input SceneObject parent

//@ui {"widget":"separator"}
//@input SceneObject poolParent
//@input Asset.ObjectPrefab[] buildingsPrefabs
//@input float[] buildingsProbabilities {"label":"buildingsProbabilities", "hint":"Addition of all the probabilities must be equal to 1"}

//@ui {"widget":"separator"}
//@input float offsetBuildingX
//@input float offsetBetweenBuildingZ
//@input float probablyToSpawn  {"widget":"slider", "min":0, "max":1, "step":0.01}

//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"Pool settings"}
//@input int maxElements
//@input bool instantiateOnStart
//@input int fullBehavior {"widget":"combobox","values":[{"label":"Error","value":0},{"label":"Repick","value":1},{"label":"Increase","value":2}]}
//@input int prefabType {"widget":"combobox","values":[{"label":"Order","value":0},{"label":"Random","value":1}]}
//@input float initialSpawnFrontZ

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//
let pools = [];

let hasStartedInstantiation = false;
let delayedInstanciationEvent = null;
let lastBuildingObjsLeft = null;
let lastBuildingObjsRight = null;
let finishedInitialSpawn = false;

const poolOffsetZ = script.poolParent.getTransform().getWorldPosition().z;
//________Caller________//
//________Listener________//
let listenerStartRun = script.subScene.CreateListener("OnStartRun", OnStartRun, function () {});
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  hasStartedInstantiation = false;
  finishedInitialSpawn = false;
  lastBuildingObjsLeft = null;
  lastBuildingObjsRight = null;
  if (script.buildingsPrefabs.length != script.buildingsProbabilities.length) {
    print("ERROR : the objectPrefabs and the objectProbabilities array must have the same length");
  }

  for (let i = 0; i < script.buildingsPrefabs.length; i++) {
    let pool = new global.PoolManager(
      [script.buildingsPrefabs[i]],
      script.maxElements,
      script.instantiateOnStart,
      script.poolParent,
      script.prefabType,
      script.fullBehavior,
    );
    pools.push(pool);
  }

  ClearBuildings();
}
function OnLateStart() {}
function Update() {
  if (global.IsGameHasStopped()) {
    return;
  }
  if (!finishedInitialSpawn) {
    return;
  }

  let lastPositionRight = GetPositionLastBuilding(false);
  let nbrSlotRight = GetSlotsLastBuilding(false);
  let offsetFutureNewBuilding = script.offsetBetweenBuildingZ * (nbrSlotRight - 0.5);

  //print(lastPositionRight.z)
  if (lastPositionRight.z + Math.abs(poolOffsetZ) >= offsetFutureNewBuilding) {
    OnInstantiateElement(lastPositionRight.z - offsetFutureNewBuilding, false);
  }

  let lastPositionLeft = GetPositionLastBuilding(true);
  let nbrSlotLeft = GetSlotsLastBuilding(true);
  let offsetFutureNewBuildingLeft = script.offsetBetweenBuildingZ * (nbrSlotLeft - 0.5);
  if (lastPositionLeft.z + Math.abs(poolOffsetZ) >= offsetFutureNewBuildingLeft) {
    OnInstantiateElement(lastPositionLeft.z - offsetFutureNewBuilding, true);
  }
}
function Stop() {}

//___________________________Functions__________________________//
global.GetBuildingPoolById = function (id) {
  if (pools.length >= id) {
    print("ERROR : wrong id " + id);
  }
  return pools[id];
};

function OnStartRun() {
  if (hasStartedInstantiation) {
    return;
  }
  hasStartedInstantiation = true;

  StartBuildingInstantiationBeginning();
}

function GetPositionLastBuilding(isOnLeftSide) {
  if (isOnLeftSide) {
    return lastBuildingObjsLeft.getTransform().getWorldPosition();
  } else {
    return lastBuildingObjsRight.getTransform().getWorldPosition();
  }
}

function GetSlotsLastBuilding(isOnLeftSide) {
  let lastBuildingScript = null;

  if (isOnLeftSide) {
    lastBuildingScript = lastBuildingObjsLeft.getComponent("Component.ScriptComponent");
  } else {
    lastBuildingScript = lastBuildingObjsRight.getComponent("Component.ScriptComponent");
  }

  if (isNull(lastBuildingScript)) {
    return 1;
  }
  let slots = lastBuildingScript.GetScaleZ();
  if (isNull(slots) || slots == undefined || slots === 0) {
    return 1;
  }
  return slots;
}

//Start instantiation to fill the road with buildings
function StartBuildingInstantiationBeginning() {
  if (script.offsetBetweenBuildingZ === 0) {
    return;
  }

  let currentZOffsetRight = script.initialSpawnFrontZ;
  while (currentZOffsetRight > poolOffsetZ) {
    OnInstantiateElement(currentZOffsetRight, false);
    let nbrSlotRight = GetSlotsLastBuilding(false);
    currentZOffsetRight -= script.offsetBetweenBuildingZ * nbrSlotRight;
  }

  let currentZOffsetLeft = script.initialSpawnFrontZ;
  while (currentZOffsetLeft > poolOffsetZ) {
    OnInstantiateElement(currentZOffsetLeft, true);
    let nbrSlotLeft = GetSlotsLastBuilding(true);
    currentZOffsetLeft -= script.offsetBetweenBuildingZ * nbrSlotLeft;
  }

  finishedInitialSpawn = true;
}

function OnInstantiateElement(offsetPositionZ, isOnLeftSide) {
  if (!isSpawning()) {
    return;
  }

  let newIdPool = GetRandomIdPool();
  let pool = pools[newIdPool];
  let newElement = pool.PickElement();
  newElement.getComponent("Component.ScriptComponent").OnPicked(pool);
  SetPosition(newElement, isOnLeftSide, offsetPositionZ);
  if (isOnLeftSide) {
    lastBuildingObjsLeft = newElement;
  } else {
    lastBuildingObjsRight = newElement;
  }
  return newElement;
}

function isSpawning() {
  return Math.random() < script.probablyToSpawn;
}

function GetRandomIdPool() {
  let randomPool = Math.random();
  let counter = 0;
  let idPool = -1;
  for (let i = 0; i < script.buildingsProbabilities.length; i++) {
    counter += script.buildingsProbabilities[i];
    if (randomPool - counter <= 0) {
      if (idPool === -1) {
        idPool = i;
      }
    }
  }
  if (idPool === -1) {
    print("Wrong probabilities - " + counter);
    return null;
  }
  return idPool;
}

//return position of the element
function SetPosition(element, isOnLeftSide, offsetPositionZ) {
  let elementPos = element.getTransform().getWorldPosition();
  elementPos.x += script.offsetBuildingX;
  elementPos.z = offsetPositionZ;

  //Add half of the building
  let offsetBySizeZ = (GetSlotsByElement(element) * script.offsetBetweenBuildingZ) / 2;
  elementPos.z -= offsetBySizeZ;

  let elementRot = quat.fromEulerAngles(0, 0, 0);

  if (isOnLeftSide) {
    elementPos.x *= -1;
    elementRot = quat.fromEulerAngles(0, Math.PI, 0);
  }

  element.getTransform().setWorldPosition(elementPos);
  element.getTransform().setWorldRotation(elementRot);
}

function GetSlotsByElement(element) {
  if (isNull(element)) {
    return 1;
  }

  let lastBuildingScript = element.getComponent("Component.ScriptComponent");
  let slots = lastBuildingScript.GetScaleZ();
  if (isNull(slots) || slots == undefined || slots === 0) {
    return 1;
  }
  return slots;
}

function ClearBuildings() {
  if (script.poolParent == null || script.poolParent == undefined) {
    return;
  }

  for (let i = script.poolParent.getChildrenCount() - 1; i >= 0; i--) {
    let scriptToDelete = script.poolParent.getChild(i).getComponent("Component.ScriptComponent");
    if (scriptToDelete === null) {
      print("ERROR: object spawned doesnt have a script");
      return;
    }
    scriptToDelete.OnHit(false);
  }
}

//___________________________Animations_________________________//
