import sublime

def get_text(view):
    return view.substr(sublime.Region(0, view.size()))
