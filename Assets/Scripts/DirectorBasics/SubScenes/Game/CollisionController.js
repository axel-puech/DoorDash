// Collision manager
//Manage effect of the collision with bonus or the obstacle

/*
@typedef customEvent
@property {string} nameCollider
@property {string} nameEvent
*/

//@input SceneObject parent

script.subScene = new global.SubScene(script, script.parent);

//////////////////
/////// Listeners/Callers
//////////////////
let listenerOnCollider = script.subScene.CreateListener("OnCollide", OnCollide, function () {});

// when collec a bonus - speed increase
let bonusCollisionCaller = script.subScene.CreateCaller("OnBonusCollision");

// when hitting an obstacle
let obstacleCollisionCaller = script.subScene.CreateCaller("OnObstacleCollision");

// when collecting a burger / pizza / noodle
let callerOnCollectObject = script.subScene.CreateCaller("OnCollectObject", null);

//////////////////
/////// Other
//////////////////

function OnCollide(e) {
  print("collided");
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

  scriptObj.OnHit(true);
  GetEffectsCollider(nameCollider);
}

function GetEffectsCollider(typeCollider) {
  // collectObject();
  switch (typeCollider) {
    case "SpawnBonus_pizza":
      print("SpawnBonus_pizza");

      // callerOnCollectObject.Call(0);
      break;
    case "SpawnBonus_noodle":
      print("SpawnBonus_noodle");
      // callerOnCollectObject.Call(1);

      break;
    case "SpawnBonus_burger":
      print("SpawnBonus_burger");

      // callerOnCollectObject.Call(2);
      break;
    case "SpawnObstacle":
      print("SpawnObstacle");

      // callerOnCollectObject.Call(3);
      break;
    default:
      print("Wrong typeCollider : " + typeCollider);
      return null;
  }
}
