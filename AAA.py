import sys

_paths = [
'/Users/marte/.virtualenvs/progsports/lib/python2.7/site-packages',
'/Library/Python/2.7/site-packages',
]
for _p in _paths:
  if _p not in sys.path:
    sys.path.append(_p)
