//Object spawner manager
//@input SceneObject parent

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"Common"}
//@input SceneObject poolParent
//@input Asset.ObjectPrefab[] objectPrefabs
//@input float[] objectProbabilities {"label":"objectProbabilities", "hint":"Addition of all the probabilities must be equal to 1"}
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"Advanced"}
//@input float delayFirstSpawn
//@input float delayBetweenSpawn
//@input float probablyToSpawn  {"widget":"slider", "min":0, "max":1, "step":0.01}
//@input float probablyHavingTwoElements  {"widget":"slider", "min":0, "max":1, "step":0.01}

//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"Pool settings"}
//@ui {"widget":"separator"}
//@input int maxElements
//@input bool instantiateOnStart
//@input int fullBehavior {"widget":"combobox","values":[{"label":"Error","value":0},{"label":"Repick","value":1},{"label":"Increase","value":2}]}
//@input int prefabType {"widget":"combobox","values":[{"label":"Order","value":0},{"label":"Random","value":1}]}
//@ui {"widget":"group_end"}

script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);

//////////////////
/////// Listeners/Callers
//////////////////
let listenerStartRun = script.subScene.CreateListener("OnStartRun", OnStartRun, function () {});



let listenerEndIntro = script.subScene.CreateListener("OnEndIntro", OnEndIntro, function () {});

function OnEndIntro() {
  OnInstantiateElement();
  StartInstantiation();
  print("Start instantiation");
}



//////////////////
/////// Variables
//////////////////
let pools = [];

global.GetObjectPoolById = function (id) {
  if (pools.lenght >= id) {
    print("ERROR : wrong id " + id);
  }
  return pools[id];
};

let hasStartedInstantiation = false;
let canSpawn = false;

//////////////////
/////// INIT
//////////////////
if (script.objectPrefabs.length != script.objectProbabilities.length) {
  print("ERROR : the objectPrefabs and the objectProbabilities array must have the same length");
}

for (let i = 0; i < script.objectPrefabs.length; i++) {
  let pool = new global.PoolManager(
    [script.objectPrefabs[i]],
    script.maxElements,
    script.instantiateOnStart,
    script.poolParent,
    script.prefabType,
    script.fullBehavior,
  );
  pools.push(pool);
}

function Start() {
  hasStartedInstantiation = false;

  ClearObjects();
}

function OnStartRun() {
  if (hasStartedInstantiation) {
    return;
  }
  hasStartedInstantiation = true;
  canSpawn = true;

  let delayedEvent = script.createEvent("DelayedCallbackEvent");
  delayedEvent.bind(function (eventData) {
    if (!canSpawn) {
      return;
    }
    // OnInstantiateElement();
    // StartInstantiation();
  });
  delayedEvent.reset(script.delayFirstSpawn);
}

function Stop() {
  canSpawn = false;
  ClearObjects();
}

function Update() {}

//////////////////
/////// Instantiation
//////////////////
function StartInstantiation() {
  let delayedEvent = script.createEvent("DelayedCallbackEvent");
  delayedEvent.bind(function (eventData) {
    if (global.IsGameHasStopped() || !canSpawn) {
      return;
    }
    OnInstantiateElement();
    StartInstantiation();
  });
  delayedEvent.reset(script.delayBetweenSpawn);
}

function OnInstantiateElement() {
  if (!canSpawn) {
    return;
  }

  //Probability to not spawn
  if (!IsSpawning()) {
    return;
  }

  //Pick the type of prefab
  let newIdPool = GetRandomIdPool();
  let pool = pools[newIdPool];

  //Intantiate it
  let element = pool.PickElement();
  element.getComponent("Component.ScriptComponent").OnPicked(pool);
  let laneFirstElement = SetRandomPosition(element, -99);

  //Can have a second element on the row
  if (HasSecondElement()) {
    //Pick the type of prefab
    let newIdPool2 = GetRandomIdPool();
    let pool2 = pools[newIdPool2];

    let secondElement = pool2.PickElement();
    secondElement.getComponent("Component.ScriptComponent").OnPicked(pool2);
    let laneSecondElement = SetRandomPosition(secondElement, laneFirstElement);
  }
}

function IsSpawning() {
  return Math.random() < script.probablyToSpawn;
}

function GetRandomIdPool() {
  let randomPool = Math.random();
  let counter = 0;
  let idPool = -1;
  for (let i = 0; i < script.objectProbabilities.length; i++) {
    counter += script.objectProbabilities[i];
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

function HasSecondElement() {
  return Math.random() < script.probablyHavingTwoElements;
}

//return lane of the element
function SetRandomPosition(element, forbiddenLane) {
  let randomLane = RandomInteger(0, global.GetNbrLanes(), forbiddenLane);
  let elementPos = element.getTransform().getWorldPosition();
  elementPos.x += (randomLane - global.GetOffsetLaneToCenter()) * global.GetDistanceBetweenLanes();
  element.getTransform().setWorldPosition(elementPos);
  return randomLane;
}

//////////////////
/////// Other
//////////////////
function ClearObjects() {
  if (script.poolParent == null || script.poolParent == undefined) {
    return;
  }

  for (let i = script.poolParent.getChildrenCount() - 1; i >= 0; i--) {
    let scriptToDelete = script.poolParent.getChild(i).getComponent("Component.ScriptComponent");
    if (scriptToDelete === null || scriptToDelete.OnHit === undefined || scriptToDelete.OnHit === null) {
      print("ERROR: object spawned doesnt have a script");
      return;
    }
    scriptToDelete.OnHit(false);
  }
}

// function ClearObjects() {
//   for (let i = 0; i < pools.length; i++) {
//     pools[i].ClearUsedElements();
//   }
// }

//////////////////
/////// Helper
//////////////////
/* minInt = minimum integer
 * maxInt = maximum integer
 * forbiddenInt = value that can't be picked
 */
function RandomInteger(minInt, maxInt, forbidenInt) {
  if (minInt === maxInt && minInt === forbidenInt) {
    print("ERROR : Can't have these parameters");
    return 0;
  }
  let randInt = Math.floor(Math.random() * (maxInt - minInt)) + minInt;
  if (randInt === forbidenInt) {
    return RandomInteger(minInt, maxInt, forbidenInt);
  } else {
    return randInt;
  }
}
