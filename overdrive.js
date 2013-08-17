function initializeModel(model) {
  var string = model.createString('Hello, world');
  model.getRoot().set('text', string);
}

function sendEvent(e) {
  alert(JSON.stringify({
    bubbles: e.bubbles,
    isLocal: e.isLocal,
    sessionId: e.sessionId,
    type: e.type,
    userId: e.userId,
    index: e.index,
    text: e.text
  }));
}

function onFileLoaded(doc) {
  var string = doc.getModel().getRoot().get('text');
  string.addEventListener(
    gapi.drive.realtime.EventType.TEXT_INSERTED,
    sendEvent
  );
  string.addEventListener(
    gapi.drive.realtime.EventType.TEXT_DELETED,
    sendEvent
  );
  gapi.drive.realtime.databinding.bindString(
    string,
    document.getElementById('editor')
  );
}

function start(fileIds, userId, accessToken) {
  var options = {
    clientId: '849493785001.apps.googleusercontent.com',
    initializeModel: initializeModel,
    autoCreate: false,
    newFileMimeType: null, // Using default.
    onFileLoaded: onFileLoaded,
    registerTypes: null, // No action.
    afterAuth: null // No action.
  };
  var rtLoader = new rtclient.RealtimeLoader(options);
  rtclient.params.fileIds = fileIds;
  rtclient.params.userId = userId;
  gapi.load('auth:client,drive-realtime,drive-share', function() {
    gapi.auth.setToken({access_token: accessToken});
    rtLoader.load();
  });
}
