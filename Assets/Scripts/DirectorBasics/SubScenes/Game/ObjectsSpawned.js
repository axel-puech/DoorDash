//Prefab that will be spawned. Obstacle or bonus or building
//This script is on the prefab object

/*
@typedef Effect
@property {string} effect {"widget":"combobox", "values":[{"label":"SetTime", "value":"setTime"}, {"label":"SetSpeed", "value":"setSpeed"}, {"label":"SetPoints", "value":"setPoints"}, {"label":"SetLife", "value":"setLifes"}]}
@property {float} effectPower 
*/

//@input string typeSpawn {"widget":"combobox", "values":[{"label":"Obstacle", "value":"obstacle"}, {"label":"Bonus", "value":"bonus"}, {"label":"Building", "value": "building"}]}

//@ui {"widget":"separator", "showIf":"typeSpawn", "showIfValue":"obstacle"}
//@ui {"widget":"group_start", "label":"Effect(s) if we hit this obstacle",  "showIf":"typeSpawn", "showIfValue":"obstacle"}
//@input Effect[] effectsObstacle
//@ui {"widget":"group_end"}

//@ui {"widget":"separator", "showIf":"typeSpawn", "showIfValue":"bonus"}
//@ui {"widget":"group_start", "label":"Effect(s) if we hit this bonus", "showIf":"typeSpawn", "showIfValue":"bonus"}
//@input Effect[] effectsBonus
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"Obstacle", "showIf":"typeSpawn", "showIfValue":"obstacle"}
//@input string effectObstacle {"widget":"combobox", "values":[{"label":"SetTime", "value":"setTime"}, {"label":"SetSpeed", "value":"setSpeed"}, {"label":"SetPoints", "value":"setPoints"}, {"label":"SetLife", "value":"setLifes"}]}
//@input float effectObstaclePower
//@ui {"widget":"group_end"}

//@ui {"widget":"group_start", "label":"Bonus", "showIf":"typeSpawn", "showIfValue":"bonus"}
//@input string effectBonus {"widget":"combobox", "values":[{"label":"SetTime", "value":"setTime"}, {"label":"SetSpeed", "value":"setSpeed"}, {"label":"SetPoints", "value":"setPoints"}, {"label":"SetLife", "value":"setLifes"}]}
//@input float effectBonusPower
//@ui {"widget":"group_end", "showIf":"typeSpawn", "showIfValue":"bonus"}

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"Placement"}
//@input float offsetBaseY
//@input float maximumZBeforeDeletion
//@input float scaleZ {"hint":"If this number of slots used by the building. \n Ex: the building is twice bigger than the others so the scaleZ = 2", "showIf":"typeSpawn", "showIfValue":"building"}
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"Audio"}
//@input Component.AudioComponent AudioToPlayOnStart
//@input Component.AudioComponent AudioToPlayOnHit
//@ui {"widget":"group_end"}

//////////////////
/////// Public methods
//////////////////
script.OnPicked = OnPicked;
script.OnHit = OnHit;
script.GetTypeSpawn = function () {
  return script.typeSpawn;
};

//Obstacle
//script.GetEffectObstacle = function(){ return script.effectObstacle; }
//script.GetEffectObstaclePower = function(){ return script.effectObstaclePower; }
script.GetEffectObstacle = function () {
  return script.effectsObstacle;
};

//Bonus
// script.GetEffectBonus = function(){ return script.effectBonus; }
// script.GetEffectBonusPower = function(){ return script.effectBonusPower; }
script.GetEffectBonus = function () {
  return script.effectsBonus;
};

//Buildings
script.GetScaleZ = function () {
  return script.scaleZ;
};

//////////////////
/////// Events
//////////////////
let event = script.createEvent("UpdateEvent");
event.bind(Update);

//////////////////
/////// Variables
//////////////////
let pool = null;

const SPEED_MULTIPLIER = 150; //To modify if we change the speed of the ground
let speed = 0;

let objCollider = script.getSceneObject().getComponent("Physics.ColliderComponent");

//////////////////
/////// INIT
//////////////////
function Start() {
  OnPicked();
}

function OnPicked(newIdPool) {
  SetDefaultOffsetY();

  if (newIdPool !== null) {
    pool = newIdPool;
  }

  if (script.AudioToPlayOnStart != null) {
    script.AudioToPlayOnStart.play(1);
  }
}

function SetDefaultOffsetY() {
  script.getTransform().setLocalPosition(new vec3(0, script.offsetBaseY, 0));
}

//////////////////
/////// UPDATE
//////////////////
function Update() {
  let currentPos = script.getTransform().getWorldPosition();
  currentPos.z += global.GetSpeed() * SPEED_MULTIPLIER * getDeltaTime();
  script.getTransform().setWorldPosition(currentPos);
  if (currentPos.z > script.maximumZBeforeDeletion) {
    DeleteElementInPool();
  }
}

//////////////////
/////// OTHERS
//////////////////
function OnHit(withSound) {
  if (withSound && script.AudioToPlayOnHit != null) {
    script.AudioToPlayOnHit.play(1);
  }

  DeleteElementInPool();
}

function DeleteElementInPool() {
  if (script.getSceneObject() === null) {
    return;
  }
  if (pool === null) {
    print("Error: pool null : " + script.getSceneObject().name);
    return;
  }

  try {
    pool.DeleteElement(script.getSceneObject());
  } catch (error) {
    print("Error : issue during deleting element " + script.typeSpawn);
    script.getSceneObject().destroy();
  }
}

Start();
