import functools
import os

import sublime


def get_text(view):
  return view.substr(sublime.Region(0, view.size()))


def auto_main_threaded(fn):
  @functools.wraps(fn)
  def wrapper(*args, **kwargs):
    f = functools.partial(fn, *args, **kwargs)
    sublime.set_timeout(f, 0)
  return wrapper


def get_syntax(file_name):
  ext = os.path.splitext(file_name)[-1]
  m = {
    '.py': 'Packages/Python/Python.tmLanguage',
    '.js': 'Packages/JavaScript/JavaScript.tmLanguage',
    '.html': 'Packages/HTML/HTML.tmLanguage',
  }
  return m.get(ext)
