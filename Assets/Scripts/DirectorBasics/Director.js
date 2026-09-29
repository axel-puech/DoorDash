// -----JS CODE-----
//@input SceneObject subSceneParent
//@input bool useFrontBack = true;

var director = null;

script.createEvent("OnStartEvent").bind(OnStart);

function OnStart() {
  director = new global.Director(script, script.subSceneParent, script.useFrontBack, OnSceneEnded);
}
//global.touchSystem.touchBlocking = true

function OnSceneEnded(sceneName, params) {
  print("OnSceneEnded : " + sceneName);
  switch (sceneName) {
    case "SceneIntro":
      director.GoToScene("SceneGame", false, false);
      break;
    case "SceneGame":
      director.GoToScene("SceneOutro", false, false);
      break;
    case "SceneOutro":
      if (params === true) {
        director.GoToScene("SceneIntro", false, false);
      } else {
        director.GoToScene("SceneGame", false, false);
      }
      break;
    default:
      print("Wrong scene name : " + sceneName);
      break;
  }
}

//script.subScene.CallEnd(null);
