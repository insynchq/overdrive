import functools

import sublime


class OverdriveFile(object):

  def __init__(self, file_id, od_view):
    self.file_id = file_id
    self.od_view = od_view
    sublime.set_timeout(functools.partial(mock_open, self), 1000)

  def set_text(self, text):
    pass


def mock_open(od_file):
  od_file.od_view.set_title('Test')
  od_file.od_view.set_text('This is just a test.')
