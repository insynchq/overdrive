var CLIENT_ID = '849493785001.apps.googleusercontent.com';

function initializeModel(model) {
  var string = model.createString('Hello, world');
  model.getRoot().set('text', string);
}

function send(o) {
  alert(JSON.stringify(o));
}

function sendEvent(e) {
  send({
    bubbles: e.bubbles,
    isLocal: e.isLocal,
    sessionId: e.sessionId,
    type: e.type,
    userId: e.userId,
    index: e.index,
    text: e.text
  });
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
  send({
    type: 'file_content_loaded',
    text: string.getText()
  });
}

function start(fileId, userId, accessToken) {
  var options = {
    clientId: CLIENT_ID,
    initializeModel: initializeModel,
    autoCreate: false,
    newFileMimeType: null, // Using default.
    onFileLoaded: onFileLoaded,
    registerTypes: null, // No action.
    afterAuth: null // No action.
  };
  var rtLoader = new rtclient.RealtimeLoader(options);
  rtclient.params.fileIds = fileId;
  rtclient.params.userId = userId;
  gapi.load('auth:client,drive-realtime,drive-share', function() {
    gapi.auth.setToken({access_token: accessToken});
    rtLoader.load();
    rtclient.getFileMetadata(fileId, function(metadata) {
      if (metadata.error) {
        send({
          type: 'error',
          error: 'File not found'
        });
      } else {
        send({
          type: 'file_metadata_loaded',
          metadata: metadata
        });
      }
    });
  });
}

function auth(userId) {
  gapi.load('auth:client', function() {
    gapi.auth.authorize({
      client_id: CLIENT_ID,
      response_type: 'token',
      scope: [
        rtclient.INSTALL_SCOPE,
        rtclient.FILE_SCOPE,
        rtclient.OPENID_SCOPE
      ],
      immediate: false
    }, function(token) {
      if (token) {
        send({
          type: 'authorized',
          token: {
            access_token: token.access_token
          }
        });
      }
    });
  });
}
