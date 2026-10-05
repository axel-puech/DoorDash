//@input SceneObject parent
//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//
//________Caller________//
//________Listener________//
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {}
function OnLateStart() {}
function Update() {}
function Stop() {}
//___________________________Functions__________________________//

//___________________________Animations_________________________//

// INTRO
// - add tilt hint
// - add TEXT
// - change feedback user
// - add gray
// - add bitmoji user

// GAME
//- flare when taking object
//- vignette when taking obstacle
//- fade in burger, pizza, noodle on end intro and timer
//

// Ce qu'il reste a faire
// ajouter un countdown 3, 2, 1 dans le countdown manager

// TODO du lundi 5 octobre 2026
// integrer les compteurs de points in game
// quand un compteur est activé, alors le faire decaler avec une anim sur la droite
// Ajouter les collectables sur l'ecran d'intro du jeux
// ajouter les particules quand on choppe un bonus
// supprimer le flare quand on prend un collectable

