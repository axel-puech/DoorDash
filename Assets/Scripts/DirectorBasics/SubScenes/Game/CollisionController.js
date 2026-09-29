// Collision manager
//Manage effect of the collision with bonus or the obstacle

/*
@typedef customEvent
@property {string} nameCollider
@property {string} nameEvent
*/

//@input SceneObject parent

//@ui {"widget":"group_start", "label":"Custom events"}
//@ui {"widget":"label", "label":""}
//@ui {"widget":"label", "label":"These are optional."}
//@ui {"widget":"label", "label":"If you want to create a director caller event,"}
//@ui {"widget":"label", "label":"when you hit a specific collider, you can add it here."}
//@ui {"widget":"label", "label":""}
//@ui {"widget":"label", "label":"You only create the caller here."}
//@ui {"widget":"label", "label":"You must create the listener where you want then"}
//@ui {"widget":"label", "label":""}
//@input customEvent[] customEvents
//@ui {"widget":"group_end"}

script.subScene = new global.SubScene(script, script.parent);

//////////////////
/////// Listeners/Callers
//////////////////
let listenerOnCollider = script.subScene.CreateListener("OnCollide", OnCollide, function () {});

let callers = [];
for (let i = 0; i < script.customEvents.length; i++) {
  let newCaller = script.subScene.CreateCaller(script.customEvents[i].nameEvent);
  callers.push(newCaller);
}

//////////////////
/////// Other
//////////////////

function OnCollide(e) {
  if (global.IsGameHasStopped()) {
    return;
  }
  let overlap = e.overlap;
  let nameCollider = overlap.collider.getSceneObject().name + "";

  let scriptObj = overlap.collider.getSceneObject().getComponent("Component.ScriptComponent");
  if (scriptObj == null || scriptObj == undefined) {
    print(
      "Collide an object that should be collided. The object must contain the 'ObjectsSpawned' script. " + nameCollider,
    );
    return;
  }

  let typeCollider = scriptObj.GetTypeSpawn();
  let effects = GetEffectsCollider(typeCollider, scriptObj);
  for (let i = 0; i < effects.length; i++) {
    ApplyEffectCollider(effects[i].effect, effects[i].effectPower);
  }

  scriptObj.OnHit(true);

  if (HasCustomEvent(nameCollider)) {
    CallCustomEvent(nameCollider);
  }

  print("Has hit this object: " + nameCollider);
}

function GetEffectsCollider(typeCollider, scriptObj) {
  switch (typeCollider) {
    case "obstacle":
      return scriptObj.GetEffectObstacle();
    case "bonus":
      return scriptObj.GetEffectBonus();
    default:
      print("Wrong typeCollider : " + typeCollider);
      return null;
  }
}

function ApplyEffectCollider(effect, power) {
  switch (effect) {
    case "setTime":
      global.AddTime(power);
      break;
    case "setSpeed":
      global.AddSpeed(power);
      break;
    case "setPoints":
      global.AddPoints(power);
      break;
    case "setLifes":
      global.AddLifes(power);
      break;
    default:
      print("CollisionController : wrong effect name = " + effect);
  }
}

function HasCustomEvent(nameCollider) {
  for (let i = 0; i < script.customEvents.length; i++) {
    if (script.customEvents[i].nameCollider === nameCollider) {
      return true;
    }
  }
  return false;
}

function CallCustomEvent(nameCollider) {
  for (let i = 0; i < script.customEvents.length; i++) {
    if (script.customEvents[i].nameCollider === nameCollider) {
      callers[i].Call();
      print("Call custom event : " + script.customEvents[i].nameEvent);
    }
  }
}
