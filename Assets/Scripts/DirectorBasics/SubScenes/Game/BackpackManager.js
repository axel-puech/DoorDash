//@input SceneObject parent
//@input SceneObject backpack

//@ui {"widget":"separator"}
//@ui {"widget":"group_start", "label":"Backpack Animation"}
//@input float verticalAmplitude = 2.0 {"widget":"slider", "min":0.0, "max":10.0, "step":0.1, "label":"Vertical Amplitude (cm)", "hint":"Maximum vertical offset from the backpack's initial position."}
//@input float oscillationFrequency = 1.5 {"widget":"slider", "min":0.1, "max":5.0, "step":0.1, "label":"Frequency (Hz)", "hint":"Number of complete oscillations per second."}
//@input float rotationAmplitude = 3.0 {"widget":"slider", "min":0.0, "max":20.0, "step":0.5, "label":"Z Rotation (degrees)", "hint":"Maximum rotation around the backpack's local Z axis."}
//@ui {"widget":"group_end"}

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//
const backpackTransform = script.backpack.getTransform();
let basePosition = backpackTransform.getLocalPosition();
let baseRotation = backpackTransform.getLocalRotation();
//________Caller________//
//________Listener________//
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  // Capture the authored pose so the animation remains relative to the
  // character and does not overwrite the backpack's attachment offset.
  basePosition = backpackTransform.getLocalPosition();
  baseRotation = backpackTransform.getLocalRotation();

  // Animation.duration represents one half of a PingPong cycle.
  const safeFrequency = Math.max(script.oscillationFrequency, 0.01);
  const halfPeriod = 0.5 / safeFrequency;
  backpackAnimation.duration = halfPeriod;
  backpackAnimation.durationDown = halfPeriod;

  // -1 repeats forever. Starting at 0.5 avoids a jump from the authored pose.
  backpackAnimation.Start(-1, 0.5);
}
function OnLateStart() {}
function Update() {}
function Stop() {
  backpackAnimation.Pause();
  ApplyBackpackPose(0.5);
}
//___________________________Functions__________________________//
function ApplyBackpackPose(ratio) {
  const signedRatio = ratio * 2 - 1;
  const verticalOffset = script.verticalAmplitude * signedRatio;
  const rotationRadians = script.rotationAmplitude * signedRatio * (Math.PI / 180);

  backpackTransform.setLocalPosition(
    new vec3(basePosition.x, basePosition.y + verticalOffset, basePosition.z),
  );

  const rotationOffset = quat.fromEulerAngles(0, 0, rotationRadians);
  backpackTransform.setLocalRotation(baseRotation.multiply(rotationOffset));
}

//___________________________Animations_________________________//
const backpackAnimation = new Animation(
  script.getSceneObject(),
  1,
  ApplyBackpackPose,
  RepeatMode.PingPong,
);
backpackAnimation.Easing = SinusoidalInOut;
