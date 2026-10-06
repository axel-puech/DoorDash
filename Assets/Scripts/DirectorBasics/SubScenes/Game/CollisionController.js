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

//@input SceneObject[] framePoints
//@input Component.VFXComponent sparkles

//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"FX Anim duration"}
//@input float obstacleDuration
//@input float bonusDuration
//@input float collectableFlareDuration = 0.2
//@input float bonusFlareDuration = 0.2
//@input float frameflareDuration = 0.2
//@ui {"widget":"label", "label":"Flare intensity"}
//@input float collectableFlareIntensity = 0.7 {"widget":"slider", "min":0, "max":1, "step":0.05}
//@input float bonusFlareIntensity = 1.0 {"widget":"slider", "min":0, "max":1, "step":0.05}
//@input float bonusFlareMultiply = 0.35 {"widget":"slider", "min":0, "max":1, "step":0.05}
//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"Post Effect"}
//@input Component.PostEffectVisual postEffect
//@input Component.PostEffectVisual zoomBlur
//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"Obstacle/Bonus Speed Change"}
//@input float bonusSpeedIncrement
//@input float obstacleSpeedIncrement
//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"UI animations"}
//@input vec2 offsetFrame

//_________________________Director Setup_________________________//

script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);

//__________________________Variables_____________________________//

let speedVignetteActive = false;
let obstacleVignetteActive = false;
let bonusFlareActive = false;
let flareIntensity = 0;
let flareMultiplyFactor = 0;
let flareHoldDuration = 0;

let framePointsArray = [];

//__________________________Constants_____________________________//

const fxSettings = {
  zoomBlurFactor: 3,
  vignetteAlphaFactor: 0.2,
  particlesVisibleDuration: 1,
};

//________Caller________//
let bonusCollisionCaller = script.subScene.CreateCaller("OnBonusCollision");
let obstacleCollisionCaller = script.subScene.CreateCaller("OnObstacleCollision");
let callerOnCollectObject = script.subScene.CreateCaller("OnCollectObject", null);
let callerOnSpeedChange = script.subScene.CreateCaller("OnSpeedChange", null);

//________Listener________//
let listenerOnCollider = script.subScene.CreateListener("OnCollide", OnCollide, function () {});

//________DelayEvent________//
const fadeSpeedVignetteDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  fadeSpeedVignette.GoTo(0);
  speedVignetteActive = false;
  callerOnSpeedChange.Call({ speedIncrement: 1 });
  global.SetSpeed(global.GetDefaultSpeed());
  // script.sparkles.asset.properties["killRatio"] = 1;
});

const fadeFlareDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  fadeFlare.GoTo(0);
});

const killParticlesDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  StopBonusParticles();
});

const fadeObstacleDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  fadeVignette.GoTo(0);
  obstacleVignetteActive = false;
  callerOnSpeedChange.Call({ speedIncrement: 1 });
  global.SetSpeed(global.GetDefaultSpeed());
});

//_________________________Director_Functions_____________________//

function Start() {}

function OnLateStart() {
  Instantiation();
}

function Stop() {
  fadeFlare.Reset();
  bonusFlareActive = false;
  flareIntensity = 0;
  flareMultiplyFactor = 0;
  flareHoldDuration = 0;
  fadeVignette.Reset();
  fadeSpeedVignette.Reset();
  framePointsArray.forEach((framePoint) => framePoint.Reset());
  // script.sparkles.asset.properties["killRatio"] = 1;
  killParticlesAnim.Reset();
}
function Update() {}

//___________________________Functions__________________________//

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
      callerOnCollectObject.Call("Pizza");
      PlayCollectableFlare();
      framePointsArray[0].Activate();
      break;
    case "Noodles":
      framePointsArray[1].Activate();
      PlayCollectableFlare();
      callerOnCollectObject.Call("Noodles");

      break;
    case "Burger":
      framePointsArray[2].Activate();
      PlayCollectableFlare();
      callerOnCollectObject.Call("Burger");
      break;

    case "SpawnObstacle":
      global.SetSpeed(global.GetDefaultSpeed() * script.obstacleSpeedIncrement);
      callerOnSpeedChange.Call({ speedIncrement: script.obstacleSpeedIncrement });

      if (obstacleVignetteActive) {
        fadeObstacleDelay.event.cancel();
        fadeObstacleDelay.event.reset(script.obstacleDuration);
      } else if (speedVignetteActive) {
        StopBonusParticles();
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
      PlayBonusFlare();
      global.SetSpeed(global.GetDefaultSpeed() * script.bonusSpeedIncrement);

      callerOnSpeedChange.Call({ speedIncrement: script.bonusSpeedIncrement });
      PlayBonusParticles();

      if (speedVignetteActive) {
        fadeSpeedVignetteDelay.event.cancel();
        fadeSpeedVignetteDelay.event.reset(script.bonusDuration);
      } else if (obstacleVignetteActive) {
        fadeObstacleDelay.event.cancel();
        fadeVignette.GoTo(0);
        obstacleVignetteActive = false;

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
  // Do not weaken a bonus flare that is still visible.
  if (!bonusFlareActive) {
    SetFlareStrength(script.collectableFlareIntensity, 0);
  }

  RestartFlare(bonusFlareActive ? script.bonusFlareDuration : script.collectableFlareDuration);
}

function PlayBonusFlare() {
  bonusFlareActive = true;
  SetFlareStrength(script.bonusFlareIntensity, script.bonusFlareMultiply);
  RestartFlare(script.bonusFlareDuration);
}

function SetFlareStrength(intensity, multiplyFactor) {
  flareIntensity = intensity;
  flareMultiplyFactor = multiplyFactor;
  UpdateFlareMaterial(fadeFlare.GetRatio());
}

function RestartFlare(duration) {
  fadeFlareDelay.event.cancel();
  flareHoldDuration = duration;
  fadeFlare.GoTo(1);
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

function PlayBonusParticles() {
  // A second bonus refreshes the full one-second visibility window.
  killParticlesDelay.event.cancel();
  killParticlesAnim.JumpTo(1);
  killParticlesDelay.event.reset(fxSettings.particlesVisibleDuration);
}

function StopBonusParticles() {
  killParticlesDelay.event.cancel();
  killParticlesAnim.GoTo(0);
}

//___________________________Animations_________________________//

const killParticlesAnim = new Animation(script.getSceneObject(), 1, (ratio) => {
  script.sparkles.asset.properties["killRatio"] = 1 - ratio;
});

// A single animation owns the material, preventing collectable and bonus flares
// from writing conflicting values during the same frame.
function UpdateFlareMaterial(ratio) {
  script.flareMaterial.mainPass.flareRatio = ratio * flareIntensity;
  script.flareMaterial.mainPass.multiply = 1 + flareMultiplyFactor * ratio;
}

const fadeFlare = new Animation(script.getSceneObject(), 0.3, UpdateFlareMaterial);

fadeFlare.Easing = QuadraticOut;

fadeFlare.OnEnd = function (ratio) {
  if (ratio === 1) {
    fadeFlareDelay.event.reset(flareHoldDuration);
  } else if (ratio === 0) {
    fadeFlare.Reset();
    bonusFlareActive = false;
    flareIntensity = 0;
    flareMultiplyFactor = 0;
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
  script.speedVignetteMaterial.mainPass.alphaRatio = ratio * 0.5;
  script.postEffect.mainPass.alphaRatio = ratio * fxSettings.vignetteAlphaFactor;
  script.zoomBlur.mainPass.strength = ratio * fxSettings.zoomBlurFactor;
  script.gliteringEffectMaterial.mainPass.alphaRatio = ratio;
});

fadeSpeedVignette.OnEnd = function (ratio) {
  if (ratio === 1) {
    fadeSpeedVignetteDelay.event.reset(script.bonusDuration);
  }
};

//__________________________Classes_____________________________//
class FramePoints {
  constructor(obj, id) {
    this._obj = obj;
    this._id = id;
    this._transform = this._obj.getComponent("Component.ScreenTransform");
    this._baseCenter = this._transform.anchors.getCenter();
    this._targetCenter = new vec2(this._baseCenter.x + script.offsetFrame.x, this._baseCenter.y + script.offsetFrame.y);
    this._image = this._obj.getComponent("Component.Image");

    this._active = false;

    this._mixFrameDelay = script.subScene.CreateEvent("DelayedCallbackEvent", this.resetFrame.bind(this));

    this._anims = {
      fade: null,
      mix: null,
      translate: null,
    };

    this.initAnimations();
  }

  resetFrame() {
    this._anims.mix.GoTo(0);
    this._anims.translate.GoTo(0);
    this._active = false;
  }

  initAnimations() {
    this._anims.fade = new Animation(script.getSceneObject(), 0.5, (ratio) => {
      this._image.mainPass.alphaRatio = ratio;
    });
    // this._anims.fade.Easing = QuadraticInOut;
    this._anims.mix = new Animation(script.getSceneObject(), 0.3, (ratio) => {
      this._image.mainPass.mixRatio = ratio;
    });
    this._anims.mix.Easing = QuadraticInOut;
    this._anims.mix.OnEnd = (ratio) => {
      if (ratio === 1) {
        this._mixFrameDelay.event.reset(script.frameflareDuration);
      }
    };
    this._anims.translate = new Animation(script.getSceneObject(), 0.3, (ratio) => {
      const animationProgress = ratio;
      const currentCenter = vec2.lerp(this._baseCenter, this._targetCenter, animationProgress);
      this._transform.anchors.setCenter(currentCenter);
    });
    this._anims.translate.Easing = QuadraticInOut;
  }

  Activate() {
    if (this._active) {
      this._mixFrameDelay.event.cancel();
      this._mixFrameDelay.event.reset(script.frameflareDuration);
    } else {
      this._active = true;
      this._anims.mix.GoTo(1);
      this._anims.translate.GoTo(1);
    }
  }

  Reset() {
    this._anims.fade.Reset();
    this._anims.mix.Reset();
    this._anims.translate.Reset();
  }
}

function Instantiation() {
  framePointsArray = [];
  script.framePoints.forEach((point, index) => {
    let framePoint = new FramePoints(point, index);
    framePointsArray.push(framePoint);
  });
}
