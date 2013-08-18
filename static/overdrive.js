var Overdrive = {

  CLIENT_ID: '849493785001.apps.googleusercontent.com',

  view: null,
  events: [],

  initializeModel: function(model) {
    var string = model.createString(Overdrive.content);
    model.getRoot().set('text', string);
    var map = model.createMap();
    model.getRoot().set('selections', map);
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

  setView: function(view) {
    Overdrive.view = view;
  },

  setText: function(text) {
    Overdrive.string.setText(text);
  },

  setRef: function(index) {
    Overdrive.ref.index = Overdrive.index = index;
  },

  onFileLoaded: function(doc) {
    var model = doc.getModel();
    // Text
    var string;
    Overdrive.string = string = model.getRoot().get('text');
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

    // Selection
    var refName;
    doc.getCollaborators().forEach(function(c) {
      if (c.isMe) {
        refName = c.sessionId + ':' + c.userId;
      }
    });
    Overdrive.index = Overdrive.index || 0;
    var selections = model.getRoot().get('selections');
    var ref = selections.get(refName);
    if (ref) {
      Overdrive.ref = ref;
    } else {
      Overdrive.ref = ref = string.registerReference(Overdrive.index, false);
      selections.set(refName, ref);
    }
    selections.values().forEach(function(r) {
      r.addEventListener(
        gapi.drive.realtime.EventType.REFERENCE_SHIFTED,
        Overdrive.sendRefEvent
      );
    });
    selections.addEventListener(
      gapi.drive.realtime.EventType.VALUE_CHANGED,
      function(e) {
        if (e.newValue) {
          e.newValue.addEventListener(
            gapi.drive.realtime.EventType.REFERENCE_SHIFTED,
            Overdrive.sendRefEvent
          )
        }
      }
    )
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

  sendRefEvent: function(e) {
    Overdrive.send({
      type: e.type,
      event: {
        bubbles: e.bubbles,
        isLocal: e.isLocal,
        sessionId: e.sessionId,
        userId: e.userId,
        newIndex: e.newIndex,
        oldIndex: e.oldIndex
      }
    });
  },

  create: function(title, content, index, userId, accessToken) {
    Overdrive.content = content;
    Overdrive.index = index;
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
