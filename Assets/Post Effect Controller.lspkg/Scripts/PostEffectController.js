// PostEffectController.js
// Version: 0.1.0
// Event: On Awake
// Description: Provides interfaces to add and configure post effects


//@input float colorCorrection = 0.5 {"widget":"slider", "min":0.0, "max":1.0, "step":0.1}
//@input float contrast = 0 {"widget":"slider", "min":0.0, "max":1.0, "step":0.1}
//@input float brightening = 0 {"widget":"slider", "min":0.0, "max":1.0, "step":0.1}
//@input bool smoothing = true;


//@input int tone {"widget":"combobox", "values":[{"label":"None", "value":1},{"label":"Black White", "value":2}, {"label":"Monocrome", "value":3}, {"label":"Brown White", "value":4}, {"label":"Blue Orange", "value":5}, {"label":"Vintage Red", "value":6}, {"label":"Vintage Blue", "value":7}, {"label":"Heat", "value":8}, {"label":"Curve", "value":9}, {"label":"Cinematic", "value":10}, {"label":"Crisp Warm", "value":11}, {"label":"Sharp Warm", "value":12}, {"label":"Color Gradient", "value":13}]}
//@input int style {"widget":"combobox", "values":[{"label":"None", "value":1},{"label":"Oil Paint", "value":2}, {"label":"Pixelization", "value":3}, {"label":"Zoom Blur", "value":4}]}

//@input bool outline
//@input bool vhsOverlay
//@input bool shakeAnimation

//@ui {"widget":"separator"}
//@input bool advanced

//@ui {"widget":"group_start", "label":"Post Effects [DO_NOT_EDIT]", "showIf":"advanced"}
//@input SceneObject correction
var correction = script.correction;

//@input SceneObject colorContrast
var colorContrast = script.colorContrast;

//@input SceneObject smooth
var smooth = script.smooth;

//@input SceneObject brighten
var brighten = script.brighten;

//@ui {"widget":"separator"}
//@input SceneObject[] tones
var tones = script.tones;

//@ui {"widget":"separator"}
//@input SceneObject[] styles
var styles = script.styles;

//@ui {"widget":"separator"}
//@input SceneObject edgeDetection
var edgeDetection = script.edgeDetection;

//@input SceneObject vhs
var vhs = script.vhs;

//@input SceneObject shake
var shake = script.shake;

//@ui {"widget":"group_end"}

function initialize() {
    if (validateInputs()) {
        setPostEffects();
    }
}

function setPostEffects() {
    // Color Correction
    var correctionR = correction.getComponent("Component.PostEffectVisual").mainPass.baseColor.r;
    var correctionG = correction.getComponent("Component.PostEffectVisual").mainPass.baseColor.g;
    var correctionB = correction.getComponent("Component.PostEffectVisual").mainPass.baseColor.b;
    var correctionA = script.colorCorrection;
    correction.getComponent("Component.PostEffectVisual").mainPass.baseColor = new vec4(correctionR,correctionG,correctionB,correctionA);
    
    // Contrast
    var contrastR = colorContrast.getComponent("Component.PostEffectVisual").mainPass.baseColor.r;
    var contrastG = colorContrast.getComponent("Component.PostEffectVisual").mainPass.baseColor.g;
    var contrastB = colorContrast.getComponent("Component.PostEffectVisual").mainPass.baseColor.b;
    var contrastA = script.contrast;
    colorContrast.getComponent("Component.PostEffectVisual").mainPass.baseColor = new vec4(contrastR,contrastG,contrastB,contrastA);
    
    // Smooth
    smooth.enabled = script.smoothing;
    
    // Brighten
    var brighteningR = brighten.getComponent("Component.PostEffectVisual").mainPass.baseColor.r;
    var brighteningG = brighten.getComponent("Component.PostEffectVisual").mainPass.baseColor.g;
    var brighteningB = brighten.getComponent("Component.PostEffectVisual").mainPass.baseColor.b;
    var brighteningA = script.brightening;
    brighten.getComponent("Component.PostEffectVisual").mainPass.baseColor = new vec4(brighteningR,brighteningG,brighteningB,brighteningA);
    
    // Tone
    for (var i = 0; i < tones.length; i++) {
        if (script.tone == 1) {
            tones[i].enabled = false;
        } else {
            tones[i].enabled = false;
            tones[script.tone - 2].enabled = true;
        }
    }
    
    // Style
    for (i = 0; i < script.styles.length; i++) {
        if (script.style == 1) {
            styles[i].enabled = false;
        } else {
            styles[i].enabled = false;
            styles[script.style - 2].enabled = true;
        }
    }
    
    // Special Effects
    edgeDetection.enabled = script.outline;
    vhs.enabled = script.vhsOverlay;
    shake.enabled = script.shakeAnimation;
}

function validateInputs() {
    if (!correction) {
        print("FaceStickers, ERROR: Please make sure Correction post effect exist and assign the post effect to the script");
        return false;
    }
    
    if (!colorContrast) {
        print("FaceStickers, ERROR: Please make sure Color Contrast post effect exist and assign the post effect to the script");
        return false;
    }
    
    if (!smooth) {
        print("FaceStickers, ERROR: Please make sure Smoothing post effect exist and assign the post effect to the script");
        return false;
    }
    
    if (!brighten) {
        print("FaceStickers, ERROR: Please make sure Brightening post effect exist and assign the post effect to the script");
        return false;
    }
    
    for (var i = 0; i < tones.length; i++) {
        if (!tones[i]) {
            print("FaceStickers, ERROR: Please make sure all post effects in Tones exist and assign those post effects to the script");
            return false;
        }
    }
    
    for (i = 0; i < styles.length; i++) {
        if (!styles[i]) {
            print("FaceStickers, ERROR: Please make sure all post effects in Styles exist and assign those post effects to the script");
            return false;
        }
    }
    
    if (!edgeDetection) {
        print("FaceStickers, ERROR: Please make sure Edge Detection post effect exist and assign the post effect to the script");
        return false;
    }
    
    if (!vhs) {
        print("FaceStickers, ERROR: Please make sure VHS post effect exist and assign the post effect to the script");
        return false;
    }
    
    if (!shake) {
        print("FaceStickers, ERROR: Please make sure Shake post effect exist and assign the post effect to the script");
        return false;
    }
    
    return true;
}

initialize();
