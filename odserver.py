import os
import bottle
from bottle import get, post, route, static_file, run, request, template


def serve(*args, **kwargs):
  callback = kwargs.pop('callback')
  path = kwargs.pop('server_path', os.path.dirname(__file__))
  bottle.TEMPLATE_PATH = [path]

  @get('/')
  def index_get():
    return template('index')

  @post('/')
  def index_post():
    import q; q(request.json)
    callback(dict(request.json))
    return ''

  @route('/static/<filename:path>')
  def static(filename):
    return static_file(filename, root=os.path.join(path, 'static'))

  run(*args, **kwargs)
