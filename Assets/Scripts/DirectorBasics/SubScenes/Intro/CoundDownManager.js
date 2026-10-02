// Bonus : Zoom blur
// bonus lut glowy
// systeme libre

//@input SceneObject parent
//@input int beforeStartDelay
//@input Asset.Material[] introMaterials
//@input Asset.Material whiteScreenMaterial
//@input float fadeDuration
// @input SceneObject[] countdownGroup
//@input float scaleFactor
//@input float changeNumberDelay

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//
var currentNumberDisplayed = 0; // used to know which number of the countdown is currently displayed
var sceneObjectsArray = []; // store all the number elements with their animations
var timePassed = 0;
var isCountingDown = false;

//________Caller________//
const endIntroCaller = script.subScene.CreateCaller("OnEndIntro");
//________Listener________//

const StartDelay = script.subScene.CreateEvent("DelayedCallbackEvent", OnStartDelay);

//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  Instantiation();
}
function OnLateStart() {
  StartDelay.event.reset(script.beforeStartDelay);

  sceneObjectsArray.forEach((numberElement) => {
    numberElement.fadeInAnim.AddTimeCodeEvent(1, function () {
      //print("Fade In Animation Ended for element ");
      numberElement.fadeOutAnim.JumpTo(1);
      numberElement.fadeOutAnim.GoTo(0);
    });
  });
}
function Update() {
  if (!isCountingDown) return;
  var deltaTime = getDeltaTime();
  timePassed += deltaTime;

  if (timePassed >= script.changeNumberDelay) {
    timePassed = 0;
    //print("new animation");
    if (currentNumberDisplayed < sceneObjectsArray.length) {
      sceneObjectsArray[currentNumberDisplayed].scaleAnim.GoTo(0);
      sceneObjectsArray[currentNumberDisplayed].fadeInAnim.GoTo(1);
    } else {
      isCountingDown = false;
      endIntroCaller.Call();
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

    this.fadeOutAnim = new Animation(script.getSceneObject(), 0.2, (ratio) => {
      this._obj.getComponent("Component.Image").mainPass.baseColor = new vec4(1, 1, 1, ratio);
    });
  }

  reset() {
    this.scaleAnim.Reset();
    this.fadeInAnim.Reset();
    this.fadeOutAnim.Reset();
  }
}

function OnAnimationEnd() {
  //print("Animation Ended");
}

function Instantiation() {
  script.countdownGroup.forEach((countdownElement, index) => {
    sceneObjectsArray.push(new NumberElement(countdownElement, index));
    sceneObjectsArray[index].reset();
    sceneObjectsArray[index].scaleAnim.JumpTo(0.5);
    sceneObjectsArray[index].fadeInAnim.JumpTo(0);
    sceneObjectsArray[index].fadeOutAnim.JumpTo(0);

    // sceneObjectsArray[index].scaleAnim.OnEnd = function () {
    //   OnAnimationEnd();
    // };
  });
}
