import json

from ghost import Ghost


class Bridge(object):

  callbacks = dict()

  def __init__(self, **kwargs):
    kwargs.setdefault('wait_timeout', 60)
    self.user_id = kwargs.pop('user_id')
    self.access_token = kwargs.pop('access_token')
    self.ghost = Ghost(**kwargs)

  def open(self, url):
    self.ghost.open(url)

  def js(self, script, *args):
    args = ', '.join(map(json.dumps, args))
    script += '(' + args + ')'
    import q; q(script)
    self.ghost.evaluate(script)

  def open_file(self, file_id):
    self.js('Overdrive.open', file_id, self.user_id,
            self.access_token)

  def create_file(self, title, content):
    self.js('Overdrive.create', title, content, self.user_id,
            self.access_token)

  def listen(self):
    self.listening = True
    while self.listening:
      try:
        qt_str, _ = self.ghost.wait_for_alert()
        data = json.loads(str(qt_str))
        for callback in self.callbacks.get(str(data.pop('type')), []):
          callback(**data)
      except Exception as e:
        if str(e) != 'User has not been alerted.':
          raise

  def on(self, type):
    def wrapper(f):
      self.callbacks.setdefault(type, []).append(f)
      return f
    return wrapper

  def stop(self):
    self.listening = False


if __name__ == '__main__':
  bridge = Bridge(
    user_id='109552611493281203639',
    access_token='ya29.AHES6ZQbe47Q8HegYNmXphPf0OiFH9AM6tnVPypx9rl4NiE',
  )
  bridge.open('http://localhost:3000')

  @bridge.on('file_metadata_loaded')
  def test(**kwargs):
    print kwargs

  bridge.create_file('Testing', 'Hello world')
  bridge.listen()
