import functools

import q
import sublime

import bridge


def open_file(file_id, od_view):
  settings = sublime.load_settings("OverdriveAccess.sublime-settings")
  b = bridge.Bridge(
    user_id=settings.get('user_id'),
    access_token=settings.get('access_token'),
    )
  b.open('http://localhost:3000/')
  import threading
  threading.Thread(target=b.listen).start()
  b.open_file(file_id)
  od_file = OverdriveFile(file_id, od_view)
  @b.on('file_metadata_loaded')
  def metadata(metadata):
    title = metadata['title']
    sublime.set_timeout(functools.partial(od_file.od_view.set_title, title), 0)
  @b.on('file_content_loaded')
  def content(text):
    sublime.set_timeout(functools.partial(od_file.od_view.set_text, text), 0)
  @b.on('error')
  def error(error):
    sublime.set_timeout(od_file.od_view.close, 0)
  return od_file

def save_file(title, od_view):
  pass


class OverdriveFile(object):

  def __init__(self, file_id, od_view):
    self.file_id = file_id
    self.od_view = od_view

  def set_text(self, text):
    pass


def mock_open(od_file):
  od_file.od_view.set_title('Test')
  od_file.od_view.set_text('This is just a test.')
