//@input SceneObject parent
//@input int beforeStartDelay
//@input Asset.Material[] introMaterials
//@input Asset.Material whiteScreenMaterial
//@input float fadeDuration
// @input SceneObject[] countdownGroup
//@input float scaleFactor
//@input float changeNumberDelay

//@ui {"widget":"separator"}
//@ui {"widget":"label", "label":"Start animation bitmoji"}
//@input SceneObject parentBitmoji
//@input vec3 offsetPositionBitmoji
//@input float tanslationBitmojiDuration

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);

//__________________________Variables_____________________________//
var sceneObjectsArray = []; // store all the number elements with their animations
var currentNumberDisplayed = 0; // used to know which number of the countdown is currently displayed
var timePassed = 0;
var isCountingDown = false;
var countdownStarted = false;

const transformBitmoji = script.parentBitmoji.getTransform();

//________Caller________//
const endIntroCaller = script.subScene.CreateCaller("OnEndIntro");
const startCountdown = script.subScene.CreateCaller("OnStartCountdown");
const startSpeedCaller = script.subScene.CreateCaller("OnStartSpeed");
const enableHeadMovementCaller = script.subScene.CreateCaller("OnEnableHeadMovement", null);

//________Listener________//

const StartDelay = script.subScene.CreateEvent("DelayedCallbackEvent", OnStartDelay);

//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  // NumberElement owns animation instances and must only be created once.
  // Recreating them on every replay used to append another 3, 2, 1, GO
  // sequence and made the countdown play twice.
  if (sceneObjectsArray.length === 0) {
    Instantiation();
  }
}
function OnLateStart() {
  if (global.properties.hasExperienceBeenPlayed) {
    // On replay, skip the initial intro wait and only play 3, 2, 1, GO.
    fadeIntroElements.JumpTo(0);
    fadeWhiteScreen.JumpTo(0);
    OnStartDelay();
    return;
  }

  StartDelay.event.reset(script.beforeStartDelay);
}
function Update() {
  if (!isCountingDown) return;
  if (!countdownStarted) {
    countdownStarted = true;
    startCountdown.Call();
  }
  var deltaTime = getDeltaTime();
  timePassed += deltaTime;

  if (timePassed >= script.changeNumberDelay) {
    timePassed = 0;
    //print("new animation");
    if (currentNumberDisplayed < sceneObjectsArray.length) {
      sceneObjectsArray[currentNumberDisplayed].play();
      if (currentNumberDisplayed === sceneObjectsArray.length - 1) {
        // calling a bit before to have obstacles spawn earlier
        endIntroCaller.Call();
        translateAnimInit.GoTo(1);
      }
    } else {
      startSpeedCaller.Call();
      enableHeadMovementCaller.Call(true);
      isCountingDown = false;
    }
    currentNumberDisplayed += 1;
  }
}
function Stop() {
  fadeIntroElements.Reset();
  fadeWhiteScreen.Reset();
  if (global.properties.firstTime) {
    fadeIntroElements.JumpTo(1);
    fadeWhiteScreen.JumpTo(1);
  }
  if (sceneObjectsArray) {
    sceneObjectsArray.forEach((countdownElement, index) => {
      countdownElement.reset();
    });
  }
  currentNumberDisplayed = 0;
  timePassed = 0;
  isCountingDown = false;
  countdownStarted = false;

  translateAnimInit.Reset();
}
//___________________________Functions__________________________//

function OnStartDelay() {
  isCountingDown = true;

  fadeIntroElements.GoTo(0);
  fadeWhiteScreen.GoTo(0);
}

//___________________________Animations_________________________//

const fadeIntroElements = new Animation(script.getSceneObject(), script.fadeDuration, (ratio) => {
  script.introMaterials.forEach((material) => {
    material.mainPass.alphaRatio = ratio;
  });
});

fadeIntroElements.OnEnd = function (ratio) {
  if (ratio === 0) {
    print("end");
    // endIntroCaller.Call();
  }
};

const fadeWhiteScreen = new Animation(script.getSceneObject(), script.fadeDuration, (ratio) => {
  script.whiteScreenMaterial.mainPass.alphaRatio = ratio;
});

var basePos = new vec3(0, 0, 0);
var offsetPosition = new vec3(
  basePos.x + script.offsetPositionBitmoji.x,
  basePos.y + script.offsetPositionBitmoji.y,
  basePos.z + script.offsetPositionBitmoji.z,
);

const translateAnimInit = new Animation(script.getSceneObject(), script.tanslationBitmojiDuration, (ratio) => {
  var positionUpdate = vec3.lerp(basePos, offsetPosition, 1 - ratio);
  transformBitmoji.setLocalPosition(positionUpdate);
});

// translateAnimInit.Easing = QuadraticInOut;

//___________________________Classes_________________________//

class NumberElement {
  constructor(obj, id) {
    this._obj = obj;
    this._transform = this._obj.getTransform();

    this.scaleAnim = null;
    this.fadeAnim = null;
    this.initAnimations();
  }

  initAnimations() {
    this.scaleAnim = new Animation(script.getSceneObject(), 0.7, (ratio) => {
      var scale = 1 + (script.scaleFactor - 1) * ratio;
      this._transform.setLocalScale(new vec3(scale, scale, scale));
    });
    this.scaleAnim.Easing = QuadraticInOut;

    this.fadeInAnim = new Animation(script.getSceneObject(), 0.7, (ratio) => {
      this._obj.getComponent("Component.Image").mainPass.baseColor = new vec4(1, 1, 1, ratio);
    });

    this.fadeOutAnim = new Animation(script.getSceneObject(), 0.4, (ratio) => {
      this._obj.getComponent("Component.Image").mainPass.baseColor = new vec4(1, 1, 1, ratio);
    });

    this.fadeInAnim.OnEnd = (ratio) => {
      if (ratio !== 1) {
        return;
      }

      this.fadeOutAnim.JumpTo(1);
      this.fadeOutAnim.GoTo(0);
    };
  }

  prepare() {
    // Every play must begin from the same state. Reset() would put the scale
    // animation at ratio 0, so a following GoTo(0) would have nothing to do.
    this.scaleAnim.JumpTo(0.5);
    this.fadeInAnim.JumpTo(0);
    this.fadeOutAnim.JumpTo(0);
  }

  play() {
    this.prepare();
    this.scaleAnim.GoTo(0);
    this.fadeInAnim.GoTo(1);
  }

  reset() {
    this.prepare();
  }
}

function OnAnimationEnd() {
  //print("Animation Ended");
}

function Instantiation() {
  script.countdownGroup.forEach((countdownElement, index) => {
    sceneObjectsArray.push(new NumberElement(countdownElement, index));
    sceneObjectsArray[index].reset();

    // sceneObjectsArray[index].scaleAnim.OnEnd = function () {
    //   OnAnimationEnd();
    // };
  });
}
