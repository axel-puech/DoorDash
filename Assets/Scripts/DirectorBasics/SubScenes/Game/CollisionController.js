// Collision manager
//Manage effect of the collision with bonus or the obstacle

/*
@typedef customEvent
@property {string} nameCollider
@property {string} nameEvent
*/

//@input SceneObject parent
//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"FX Materials"}
//@input Asset.Material flareMaterial
//@input Asset.Material vignetteMaterial
//@input Asset.Material speedVignetteMaterial
//@input Asset.Material gliteringEffectMaterial

//@input Asset.Material[] frameMaterials
//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"FX Anim duration"}
//@input float obstacleDuration
//@input float bonusDuration
//@input float collectableDuration
//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"Post Effect"}
//@input Component.PostEffectVisual postEffect
//@input Component.PostEffectVisual zoomBlur

script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnStop = Stop;

let activeFrame = null;

let speedVignetteActive = false;
let obstacleVignetteActive = false;
let collectableFlareActive = false;

const fxSettings = {
  zoomBlurFactor: 3,
  vignetteAlphaFactor: 0.2,
  flareMultiplyFactor: 0.2,
};

function Start() {}

function Stop() {
  fadeFlare.Reset();
  fadeVignette.Reset();
  mixFrame.Reset();
  fadeSpeedVignette.Reset();
}

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

//____FadeImageDelay____//
const fadeSpeedVignetteDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  fadeSpeedVignette.GoTo(0);
  speedVignetteActive = false;
});

const fadeCollectableDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  fadeFlare.GoTo(0);
  collectableFlareActive = false;
});

const fadeObstacleDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  fadeVignette.GoTo(0);
  obstacleVignetteActive = false;
});

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
    case "Pizza":
      print("Pizza");
      PlayCollectableFlare();
      callerOnCollectObject.Call("Pizza");
      activeFrame = script.frameMaterials[0];
      mixFrame.Start(1);
      break;
    case "Noodles":
      print("Noodles");
      PlayCollectableFlare();
      activeFrame = script.frameMaterials[1];
      mixFrame.Start(1);

      callerOnCollectObject.Call("Noodles");

      break;
    case "Burger":
      print("Burger");
      activeFrame = script.frameMaterials[2];
      mixFrame.Start(1);
      PlayCollectableFlare();

      callerOnCollectObject.Call("Burger");
      break;
    case "SpawnObstacle":
      print("SpawnObstacle");

      if (obstacleVignetteActive) {
        fadeObstacleDelay.event.cancel();
        fadeObstacleDelay.event.reset(script.obstacleDuration);
      } else if (speedVignetteActive) {
        fadeSpeedVignetteDelay.event.cancel();
        fadeSpeedVignette.GoTo(0);
        speedVignetteActive = false;

        obstacleVignetteActive = true;
        fadeVignette.GoTo(1);
      } else {
        obstacleVignetteActive = true;
        fadeVignette.GoTo(1);
      }

      // callerOnCollectObject.Call(3);
      break;
    case "Bonus":
      print("Bonus");
      if (speedVignetteActive) {
        fadeSpeedVignetteDelay.event.cancel();
        fadeSpeedVignetteDelay.event.reset(script.bonusDuration);
      } else if (obstacleVignetteActive) {
        fadeObstacleDelay.event.cancel();
        fadeVignette.GoTo(0);
        speedVignetteActive = false;

        speedVignetteActive = true;
        fadeSpeedVignette.GoTo(1);
      } else {
        speedVignetteActive = true;
        fadeSpeedVignette.GoTo(1);
      }

      // callerOnCollectObject.Call(3);
      break;

    default:
      print("Wrong typeCollider : " + typeCollider);
      return null;
  }
}

function PlayCollectableFlare() {
  if (collectableFlareActive) {
    fadeCollectableDelay.event.cancel();
    fadeCollectableDelay.event.reset(script.collectableDuration);
  } else {
    collectableFlareActive = true;
    fadeFlare.GoTo(1);
  }
}

function PlayObstacleVignette() {
  if (obstacleVignetteActive) {
    fadeObstacleDelay.event.cancel();
    fadeObstacleDelay.event.reset(script.obstacleDuration);
  } else {
    obstacleVignetteActive = true;
    fadeVignette.GoTo(1);
  }
}

//___________________________Animations_________________________//

const fadeFlare = new Animation(script.getSceneObject(), 0.7, (ratio) => {
  script.flareMaterial.mainPass.flareRatio = ratio;
  script.flareMaterial.mainPass.multiply = 1 + fxSettings.flareMultiplyFactor * ratio;
});

fadeFlare.Easing = QuadraticOut;

fadeFlare.OnEnd = function (ratio) {
  if (ratio === 1) {
    fadeCollectableDelay.event.reset(script.collectableDuration);
  }
};

const fadeVignette = new Animation(script.getSceneObject(), 0.7, (ratio) => {
  script.vignetteMaterial.mainPass.alphaRatio = ratio;
});

fadeVignette.OnEnd = function (ratio) {
  if (ratio === 1) {
    fadeObstacleDelay.event.reset(script.obstacleDuration);
  }
};

const fadeSpeedVignette = new Animation(script.getSceneObject(), 0.7, (ratio) => {
  script.speedVignetteMaterial.mainPass.alphaRatio = ratio;
  script.postEffect.mainPass.alphaRatio = ratio * fxSettings.vignetteAlphaFactor;
  script.zoomBlur.mainPass.strength = ratio * fxSettings.zoomBlurFactor;
  script.gliteringEffectMaterial.mainPass.alphaRatio = ratio;
});

fadeSpeedVignette.OnEnd = function (ratio) {
  if (ratio === 1) {
    fadeSpeedVignetteDelay.event.reset(script.bonusDuration);
  }
};

const mixFrame = new Animation(
  script.getSceneObject(),
  0.4,
  (ratio) => {
    if (!activeFrame) return;
    activeFrame.mainPass.mixRatio = ratio;
  },
  RepeatMode.PingPong,
);

mixFrame.OnEnd = function (ratio) {
  if (ratio === 0) {
    activeFrame = null;
  }
};
