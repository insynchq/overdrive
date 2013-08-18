from bottle import get, post, route, static_file, run, request, template


def serve(*args, **kwargs):
  callback = kwargs.pop('callback')

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
    return static_file(filename, root='static')

  run(*args, **kwargs)
