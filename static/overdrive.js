var Overdrive = {

  CLIENT_ID: '849493785001.apps.googleusercontent.com',

  view: null,
  events: [],

  initializeModel: function(model) {
    var string = model.createString(Overdrive.defaultContent);
    model.getRoot().set('text', string);
  },

  send: function(e) {
    e.view = Overdrive.view;
    Overdrive.events.push(e);
  },

  postEvents: function() {
    var e = Overdrive.events.shift();
    if (e) {
      superagent.post('/')
        .send(e)
        .end(function(res) {
          console.log('sent:', e);
          if (e.type == 'error') {
            alert();
          } else {
            Overdrive.postEvents();
          }
        });
    } else {
      setTimeout(Overdrive.postEvents, 10);
    }
  },

  sendTextEvent: function(e) {
    Overdrive.send({
      type: e.type,
      event: {
        bubbles: e.bubbles,
        isLocal: e.isLocal,
        sessionId: e.sessionId,
        userId: e.userId,
        index: e.index,
        text: e.text
      }
    });
  },

  setView: function(view) {
    Overdrive.view = view;
  },

  setText: function(text) {
    Overdrive.string.setText(text);
  },

  onFileLoaded: function(doc) {
    Overdrive.string = string = doc.getModel().getRoot().get('text');
    string.addEventListener(
      gapi.drive.realtime.EventType.TEXT_INSERTED,
      Overdrive.sendTextEvent
    );
    string.addEventListener(
      gapi.drive.realtime.EventType.TEXT_DELETED,
      Overdrive.sendTextEvent
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
          gapi.client.drive.permissions.insert({
            'fileId': file.id,
            'resource': {
              'value': '',
              'type': 'anyone',
              'role': 'writer'
            }
          }).execute(function(resp) {
            if (resp.error) {
              send({
                type: 'error',
                error: 'Failed to share file'
              });
            } else {
              Overdrive.open(file.id, userId, accessToken);
            }
          });
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
    Overdrive.postEvents();

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
          console.log(token);
        }
      });
    });
  }

}
