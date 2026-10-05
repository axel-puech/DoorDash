//@input SceneObject parent

//@ui {"widget":"separator"}
//@input Component.Image transitionBG

//@input Component.Text textTotalScore
//@input Component.Text textPizzaScore
//@input Component.Text textBurgerScore
//@input Component.Text textNoodlesScore

//@input SceneObject buttonReplay

//@ui {"widget":"separator"}
//@input float durationFade

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

const outroInteraction = script.buttonReplay.getComponent("Component.InteractionComponent");
let totalScore = 0;
let pizzaScore = 0;
let burgerScore = 0;
let noodlesScore = 0;

let hasTapped = false;
//________Caller________//

const showBitmojiCaller = script.subScene.CreateCaller("showBitmojiEvent");
const hideBitmojiCaller = script.subScene.CreateCaller("hideBitmojiEvent");
//________Listener________//
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  hasTapped = false;

  animFadeBG.JumpTo(1);
  // animFadeText.JumpTo(1);

  totalScore = global.properties.getTotalScore();
  pizzaScore = global.properties.getPizzaScore();
  burgerScore = global.properties.getBurgerScore();
  noodlesScore = global.properties.getNoodlesScore();
}

function OnLateStart() {
  global.properties.markExperienceAsPlayed();
  animFadeBG.GoTo(0);
  showBitmojiCaller.Call();

  script.textTotalScore.text = totalScore.toString();
  script.textPizzaScore.text = pizzaScore.toString();
  script.textBurgerScore.text = burgerScore.toString();
  script.textNoodlesScore.text = noodlesScore.toString();
  scaleReplayButton.Start(-1);
}
function Update() {}
function Stop() {
  hasTapped = false;
  animFadeBG.Reset();
  scaleReplayButton.Reset();
}

//___________________________Buttons__________________________//

outroInteraction.onTouchStart.add(function () {
  if (!hasTapped) {
    hasTapped = true;
    print("tap");
    animFadeBG.GoTo(1);
  }
});

//___________________________Functions__________________________//

//___________________________Animations_________________________//
let animFadeBG = new Animation(script.getSceneObject(), script.durationFade, UpdateFadeBG);
function UpdateFadeBG(ratio) {
  script.transitionBG.mainPass.baseColor = new vec4(1, 1, 1, ratio);
}
animFadeBG.OnEnd = function (ratio) {
  if (ratio === 1) {
    hideBitmojiCaller.Call();
    script.subScene.CallEnd(null);
  }
};

const scaleReplayButton = new Animation(
  script.getSceneObject(),
  0.5,
  (ratio) => {
    script.buttonReplay.getTransform().setLocalScale(new vec3(1, 1, 1).uniformScale(1 + 0.1 * ratio));
  },
  RepeatMode.PingPong,
);

// let animFadeText = new Animation(script.getSceneObject(), script.durationFade, UpdateFadeText);
// function UpdateFadeText(ratio) {
//   script.textOutro.textFill.color = new vec4(0, 0, 0, ratio);
// }
