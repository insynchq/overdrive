import threading

import sublime

import odbridge


class OverdriveFile(object):

  def __init__(self, od_view):
    settings = sublime.load_settings("Overdrive.sublime-settings")
    self.od_view = od_view
    self.bridge = odbridge.Bridge(
      user_id=settings.get('user_id'),
      access_token=settings.get('access_token'),
      server_host=settings.get('server_host'),
      server_port=settings.get('server_port'),
    )
    self.bridge.on('error')(self.on_error)
    self.bridge.on('file_metadata_loaded')(self.on_metadata_loaded)
    self.bridge.on('file_content_loaded')(self.on_content_loaded)
    self.bridge.on('text_inserted')(self.on_text_inserted)
    self.bridge.on('text_deleted')(self.on_text_deleted)
    self.bridge.on('reference_shifted')(self.on_ref_shifted)
    self.bridge.open()
    self.bridge.set_view(od_view.id)
    thread = threading.Thread(target=self.bridge.wait)
    thread.setDaemon(True)
    thread.start()

  def on_error(self, error):
    self.od_view.set_error_message(error)
    self.od_view.close()

  def on_metadata_loaded(self, metadata):
    self.od_view.set_metadata(metadata)

  def on_content_loaded(self, text):
    self.od_view.set_text(text)

  def on_text_inserted(self, event):
    if event['isLocal']:
      return
    self.od_view.insert_text(event['index'], event['text'])

  def on_text_deleted(self, event):
    if event['isLocal']:
      return
    self.od_view.delete_text(event['index'], event['text'])

  def on_ref_shifted(self, event):
    if event['isLocal']:
      return
    self.od_view.set_session_selection(event['userId'], event['sessionId'], event['index'])

  def open(self, file_id):
    self.bridge.open_file(file_id)

  def save_file(self, title, content, index):
    self.bridge.create_file(title, content, index)

  def set_text(self, text):
    self.bridge.set_text(text)

  def set_selection(self, index):
    self.bridge.set_ref(index)


def mock_open(od_file):
  od_file.od_view.set_title('Test')
  od_file.od_view.set_text('This is just a test.')
