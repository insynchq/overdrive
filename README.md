# Overdrive
Harness Drive's realtime features to collaborate in Sublime Text

## Motivation
There are several tools that allows you to remotely collaborate
while coding. Most of them are web based and we think people
don't like coding in browsers yet.

Just a few months ago, Google released Drive's [realtime API](https://developers.google.com/drive/realtime/) that
allows developers to utilize Docs' powerful collaboration features
in their own web apps. Yep. Web apps. But most of us are already
comfortable with coding in our own favorite editors may it be Vim,
Emacs, Sublime Text, nano, ed, etc. A web based editor that uses
Drive's realtime API is yet another software to learn and adapt
too.

Enter [Devcup 2013](http://webgeek.ph/devcup-2013). The hackathon's theme this year was "Development".
The idea of using Drive's realtime API to do collaboration in
Sublime Text popped up while we were brainstorming and Overdrive
became our project in the hackathon. We fell in love with it
and now hopes to continue developing it.

## I WANT IT NAOOOOOO!
It hasn't been a day (as of writing) after the hackathon so
Overdrive is far from pretty yet. But it's realtively easy to
install if you know what you're doing.

To get it, you basically just need to clone the repo into
Sublime Text's Packages directory.  _Btw, you have to name it
"Overdrive" (hard-coded values ftw)._ Setting up dependecies
is a bit trickier. You need to have `q`, `Bottle`, `Ghost.py` and
`PySide`/`PyQT` installed somewhere. Notice the `AAA.py` file?
After installing dependencies, you need to modify that and
set the paths so that the packages you just installed can
be loaded. Most systems have python2.7 now by default and
installing `PySide`/`PyQT` manually in a virtualenv could be
a pain. It was for us, so we just used paths for the python2.7
versions and it worked :P

Once you have dependencies working (you can confirm by
checking Sublime Text's console to see if modules are failing
to load while Overdrive is being loaded), it's time to
configure. You just need to create an `Overdrive.sublime-settings`
file either in the package's directory or your `User` directory:

```json
{
  "user_id": "GOOGLE_USER_ID",
  "access_token": "ACCESS_TOKEN",
  "server_host": "localhost",
  "server_port": 5000 // with the client ID we're using you can use 5000 or 3000
}
```

How do you get `GOOGLE_USER_ID` and `ACCESS_TOKEN` you say?
I'll leave `GOOGLE_USER_ID` as a reading exercise :P But
after getting your user ID, you can go to `localhost:server_port`
(while Sublime Text with Overdrive installed is running),
open up the developer tools console and run
`Overdrive.auth('GOOGLE_USER_ID')`. This will try to auth you
(pop-up could be blocked) and `console.log` a token object.
It'll have an `access_token`. Put that in and we're done!

You should be able to share and join files after that. But
note that access tokens expire after an hour so you need to
manually get another one and update your settings when it
does. Yeah it's very tedious and we'll surely change that
but hey, it was for a hackathon so bear with it for a while
or you can always hit that fork button ;)

## License
Haven't discussed this one yet but it'll be permissive for
sure :)


