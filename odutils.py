import functools

import sublime

def get_text(view):
  return view.substr(sublime.Region(0, view.size()))


def auto_main_threaded(fn):
  @functools.wraps(fn)
  def wrapper(*args, **kwargs):
    f = functools.partial(fn, *args, **kwargs)
    sublime.set_timeout(f, 0)
  return wrapper
