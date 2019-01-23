<p align="center">
  <img alt="Ironhack" src="https://i.postimg.cc/JR7cMFqG/ironhack-miny.png" width="60" />
</p>
<h1 align="center">
  Passport-local-mongoose
</h1>

## Learning Goals

After this lesson, you will be able to:

* Apply a mongoose plugin.
* Agilizar el proceso de autenticación
* Aplicar conceptos de unidades anteriores pero concentrado en la funcionalidad.

## Introduction

Passport-Local Mongoose is a Mongoose plugin that simplifies building username and password login with Passport. So we can focus on the business logic when we create the backend of our project.

## Let's code

Let's generate a new project with our `iron-generator`

```bash
irongenerate passport-lm
cd passport-lm
```

Before start we will need a couple of dependencies to install:

```bash
  npm i passport passport-local passport-local-mongoose
```

we will also need another dependencies to handle session:

```bash
npm i connect-mongo express-session connect-ensure-login
```

## Creating our user model

Make a new file called `/User.js` inside `/models` folder with next content:

```js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose =require('passport-local-mongoose');

const userSchema = new Schema({
  username: String,
  password: String
}, {
  timestamps: { 
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
});

// -> usernameField is an optional config. We could define another field as usernamefield, plm use username field by default.
userSchema.plugin(passportLocalMongoose, {usernameField: "username"});

const User = mongoose.model("User", userSchema);

module.exports = User;
```

## Setting Up passport

Create a new folder called `/services` and a file  `passport.js` inside with the next code:

```js
const passport = require('passport')
const localStrategy = require('passport-local').Strategy

const User = require('../models/User')

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport
```

the previous code configures passport with the local strateggy and applies `serializeUser` and `deserializeUser` methods.

In our main file `app.js` we should add the passport settup file that we recently created and apply the `initialize` and `session` methods as well as the basic session config:

```js
// don't forget import passport config(/services/passport), session y MongoStore
const passport = require('./services/passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)


app.use(require('express-session')({
  secret: 'plugin',
  resave: false,
  cookie: { maxAge: 60000 },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));

app.use(passport.initialize())
app.use(passport.session())
```

## Views

We need to create some files in `/views/auth` directory:

* `login.hbs`:

```hbs
<h2>Login</h2>
<form action="/login" method="post">
<label for="username">username</label>
<input type="text" name="username" id="username">
<br>
<label for="password">password</label>
<input type="password" name="password" id="password">
<input type="submit">
</form>
```

* `signup.hbs`:

```hbs
<h2>Signup</h2>
<form action="/signup" method="post">
<label for="username">username</label>
<input type="text" name="username" id="username">
<br>
<label for="password">password</label>
<input type="password" name="password" id="password">
<input type="submit">
</form>
```

* `private.hbs`:

```hbs
<h2>Private</h2>
<p>{{user.username}}</p>
```

> *and replace the content inside the leyout file*

* `layout.hbs`:

```hbs
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>{{title}}</title>
  <link rel="stylesheet" href="/stylesheets/style.css" />
</head>
<body>
  <nav>
    <ul id='navb'>
      <li>
        <a href="/">home</a>
      </li>
      <li>
        <a href="/login">login</a>
      </li>
      <li>
        <a href="/signup">signup</a>
      </li>
      <li>
        <a href="/logout">logout</a>
      </li>
      <li>
        <a href="/private">private</a>
      </li>
    </ulid>
  </nav>

  {{{body}}}

  <script src="/javascripts/script.js"></script>
</body>
</html>
```

> optional: replace the content inside the `index.hbs` file.

* `index.hbs`

```hbs
<div class="entry">
  {{#if user}}
    <h1>welcome {{user.username}}</h1>
  {{else}}
    <p>please login or signup</p>
  {{/if}}
</div>
```

## Routes

Createa new file inside `/routes` directory called `/auth.js` with the next content:

```js
const passport = require('passport');
const {Router} = require('express');
const router = Router();

const User = require('../models/User');

router
  .get('/signup', (req, res, next)=>{
    res.render('auth/signup');
  })
  .post('/signup', (req, res, next)=>{
    User.register( new User({ username: req.body.username }),
    req.body.password,
    function(err, account){
      if(err){
        return res.json(err);
      }
      return res.redirect('/login')
    });
  })
  .get('/login', (req, res, next)=>{
    return res.render('auth/login');
  })
  .post('/login', passport.authenticate('local'), (req, res, next)=>{
    return res.redirect('/');
  })
  .get('/logout', (req, res, next)=>{
    req.logout();
    res.redirect('/login');
  })
  .get('/private', (req, res, next)=>{
    const user = req.user;
    if(user){
      return res.render('auth/private', {user: req.user});
    }
    return res.redirect("/login")
  })
  .get('/logout', (req, res, next)=>{
    req.logout();
    res.redirect('/login');
  })

module.exports = router;
```

Now we should be able to see something at [http://localhost:3000](http://localhost:3000), *double check if your server is running*

The result sould look like this:

![resultado_1](https://i.postimg.cc/8cyH4cQP/Captura-de-pantalla-2019-01-22-a-la-s-16-54-55.png)

## Styles - *optional*

Add to `/public/stylesheets/style.scss` file the next styles:

```css
#navb{
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background-color: rebeccapurple;
  height: 60px;
  margin: 0;
}
#navb > li {
  list-style: none;
  color: white;
}
a{
  color: white;
  text-decoration: none;
}
a:visited{
  text-decoration: none;
  color: white;
}

```

The end result should looks like:

![styled](https://i.postimg.cc/B6w6Sf2w/Captura-de-pantalla-2019-01-22-a-la-s-19-16-21.png)

## Summary

In this learning we saw the `passport-local-mongoose` plugin in action and how can accelerate our development process. This saves us a lot of time when creating a new app, especially to configure all the essential environment settings and the passport hashing.

### Extra Resources

* [passport-local-mongoose | **docs**](https://github.com/saintedlama/passport-local-mongoose)