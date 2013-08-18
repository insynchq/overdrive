import json

from ghost import Ghost


class Bridge(object):

  def __init__(self, **kwargs):
    kwargs.setdefault('wait_timeout', 60)
    self.user_id = kwargs.pop('user_id')
    self.access_token = kwargs.pop('access_token')
    self.server_host = kwargs.pop('server_host')
    self.server_port = kwargs.pop('server_port')
    self.ghost = Ghost(**kwargs)
    self.callbacks = {}

  def open(self):
    self.ghost.open('http://%(host)s:%(port)s' % dict(
      host=self.server_host,
      port=self.server_port,
    ))

  def js(self, script, *args):
    args = ', '.join(map(json.dumps, args))
    script += '(' + args + ')'
    import q; q(script)
    return self.ghost.evaluate(script)

  def open_file(self, file_id):
    self.js('Overdrive.open', file_id, self.user_id,
            self.access_token)

  def create_file(self, title, content, index):
    self.js('Overdrive.create', title, content, index, self.user_id,
            self.access_token)

  def set_view(self, view):
    self.js('Overdrive.setView', view)

  def set_text(self, text):
    self.js('Overdrive.setText', text)

  def set_ref(self, index):
    self.js('Overdrive.setRef', index)

  def call_event(self, event):
    for callback in self.callbacks.get(str(event.pop('type')), []):
      callback(**event)

  def wait(self):
    self.waiting = True
    while self.waiting:
      try:
        self.ghost.wait_for_alert()
      except Exception as e:
        if str(e) != 'User has not been alerted.':
          raise
      else:
        self.stop()

  def on(self, type):
    def wrapper(f):
      self.callbacks.setdefault(type, []).append(f)
      return f
    return wrapper

  def stop(self):
    self.waiting = False


if __name__ == '__main__':
  import threading
  import odserver

  settings = dict(
    server_host='localhost',
    server_port=5000,
  )

  def cb(e):
    print 'view_id', e.pop('view')
    bridge.call_event(e)

  def start_server():
    thread = threading.Thread(target=odserver.serve, kwargs=dict(
      host=settings.get('server_host'),
      port=settings.get('server_port'),
      callback=cb,
    ))
    thread.setDaemon(True)
    thread.start()
  start_server()

  # Wait a bit for server to start
  import time
  time.sleep(1)

  bridge = Bridge(
    user_id='109552611493281203639',
    access_token='ya29.AHES6ZSxF03vDHDaBIF3UCDJ7Hi4BpzB5C4H8D-sMkM7C6k',
    server_host=settings.get('server_host'),
    server_port=settings.get('server_port'),
  )
  bridge.open()

  @bridge.on('file_metadata_loaded')
  def test(**kwargs):
    print kwargs['metadata']['id']

  bridge.set_view('12345')
  bridge.create_file('Testing', 'Hello world')
  bridge.wait()
