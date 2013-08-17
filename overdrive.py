import sublime, sublime_plugin
import q

import ghost
import odutils
import odfile


files = {}


class OverdriveJoinCommand(sublime_plugin.WindowCommand):

  def run(self):
    self.window.show_input_panel("Open File:", "", self.on_done, None, None)

  def on_done(self, file_id):
    if not file_id:
      return
    od_view = OverdriveView(self.window.new_file())
    files[od_view.id] = odfile.open_file(file_id, od_view)


class OverdriveShareCommand(sublime_plugin.TextCommand):

  def run(self, edit):
    self.view.set_status("Overdrive", "Sharing file...")
    od_view = OverdriveView(self.view)
    odfile.share_file(self.view.name(), od_view)


class OverdriveEventListener(sublime_plugin.EventListener):

  def on_modified(self, view):
    od_file = files.get(view.id())
    if not od_file:
      return
    cmd = view.command_history(0, True)
    if cmd[0] == 'overdrive_edit':
      return
    curr_text = odutils.get_text(view)
    od_file.set_text(curr_text)

  def on_close(self, view):
    od_file = files.pop(view.id(), None)


class OverdriveView(object):

  def __init__(self, view):
    self.view = view
    self.id = view.id()
    self.view.set_status("Overdrive", "Loading file...")
    self.view.set_read_only(True)
    self.view.set_name('Loading file...')

  def begin_edit(self):
    return self.view.begin_edit('overdrive_edit')

  def set_text(self, text):
    self.view.set_read_only(False)
    edit = self.begin_edit()
    self.view.insert(edit, 0, text)
    self.view.end_edit(edit)
    self.view.erase_status('Overdrive')

  def set_title(self, title):
    self.view.set_name(title)

  def insert_text(self, index, text):
    edit = self.begin_edit()
    self.view.insert(edit, index, text)
    self.view.end_edit(edit)

  def delete_text(self, index, text):
    region = sublime.Region(index, index + len(text))
    edit = self.begin_edit()
    self.view.erase(edit, region)
    self.view.end_edit(edit)

  def close(self):
    window = self.view.window()
    window.focus_view(self.view)
    window.run_command('close_file')

