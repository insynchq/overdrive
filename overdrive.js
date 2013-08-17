var Overdrive = {

  CLIENT_ID: '849493785001.apps.googleusercontent.com',

  initializeModel: function(model) {
    var string = model.createString(Overdrive.defaultContent);
    model.getRoot().set('text', string);
  },

  send: function(o) {
    alert(JSON.stringify(o));
  },

  sendEvent: function(e) {
    Overdrive.send({
      bubbles: e.bubbles,
      isLocal: e.isLocal,
      sessionId: e.sessionId,
      type: e.type,
      userId: e.userId,
      index: e.index,
      text: e.text
    });
  },

  onFileLoaded: function(doc) {
    var string = doc.getModel().getRoot().get('text');
    string.addEventListener(
      gapi.drive.realtime.EventType.TEXT_INSERTED,
      Overdrive.sendEvent
    );
    string.addEventListener(
      gapi.drive.realtime.EventType.TEXT_DELETED,
      Overdrive.sendEvent
    );
    gapi.drive.realtime.databinding.bindString(
      string,
      document.getElementById('editor')
    );
    Overdrive.send({
      type: 'file_content_loaded',
      text: string.getText()
    });
  },

  create: function(title, content, userId, accessToken) {
    Overdrive.defaultContent = content;
    gapi.load('auth:client', function() {
      gapi.auth.setToken({access_token: accessToken});
      rtclient.createRealtimeFile(title, rtclient.REALTIME_MIMETYPE, function(file) {
        if (file && file.id) {
          Overdrive.open(file.id, userId, accessToken);
        } else {
          Overdrive.send({
            type: 'error',
            error: 'Failed to create file'
          });
        }
      });
    });
  },

  open: function(fileId, userId, accessToken) {
    var options = {
      clientId: Overdrive.CLIENT_ID,
      initializeModel: Overdrive.initializeModel,
      autoCreate: false,
      newFileMimeType: null, // Using default.
      onFileLoaded: Overdrive.onFileLoaded,
      registerTypes: null, // No action.
      afterAuth: null // No action.
    };

    var rtLoader = new rtclient.RealtimeLoader(options);
    // Setting this here because I'm too lazy to update realtime-client-utils.js
    rtclient.params.fileIds = fileId;
    rtclient.params.userId = userId;

    gapi.load('auth:client,drive-realtime,drive-share', function() {
      gapi.auth.setToken({access_token: accessToken});
      rtLoader.load();
      rtclient.getFileMetadata(fileId, function(metadata) {
        if (metadata.error) {
          Overdrive.send({
            type: 'error',
            error: 'File not found'
          });
        } else {
          Overdrive.send({
            type: 'file_metadata_loaded',
            metadata: metadata
          });
        }
      });
    });
  },

  auth: function(userId) {
    gapi.load('auth:client', function() {
      gapi.auth.authorize({
        client_id: Overdrive.CLIENT_ID,
        response_type: 'token',
        scope: [
          rtclient.INSTALL_SCOPE,
          rtclient.FILE_SCOPE,
          rtclient.OPENID_SCOPE
        ],
        immediate: false
      }, function(token) {
        if (token) {
          Overdrive.send({
            type: 'authorized',
            token: {
              access_token: token.access_token
            }
          });
        }
      });
    });
  }

}
