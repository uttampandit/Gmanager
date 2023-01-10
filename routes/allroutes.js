const { Router } = require("express");
const router = new Router();
const joiValidate = require("../utils/joiValidate");
const axios = require("axios");
const passport = require("passport");
const user = require("../models/usermodel");
const base64 = require("../base64topdf/index");
const fs = require("fs");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const methodoverride = require("method-override");
const ExpressError = require("../utils/expressError");
const asyncError = require("../utils/asyncError");
const Joi = require("joi");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");
const path = require("path");
//mongo session store

//configuring session
router.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.dburl,
      touchAfter: 24 * 3600,
    }),
    secret: process.env.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpsOnly: true,
    },
  })
);

router.use(methodoverride("_method"));
router.use(flash());
router.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

//middleware
const isLoggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).redirect("/");
  }
};

//passport stuff
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  user.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "https://gmanager.onrender.com/profile",
    },
    async function (accessToken, refreshToken, profile, done) {
      user.findOne({ googleId: profile.id }).then((currentUser) => {
        if (currentUser) {
          user
            .findOneAndUpdate(
              { googleId: profile.id },
              { access_token: accessToken },
              { new: true }
            )
            .then((updatedUser) => {
              done(null, updatedUser);
            });
        } else {
          new user({
            email: profile._json.email,
            googleId: profile.id,
            access_token: accessToken,
            display_name: profile.displayName,
          })
            .save()
            .then((newUser) => {
              done(null, newUser);
            });
        }
      });
    }
  )
);

router.use(passport.initialize());
router.use(passport.session());

router.get("/", (req, res) => {
  res.render("home");
});
router.post(
  "/login",
  passport.authenticate("google", {
    scope: [
      "profile",
      "https://www.googleapis.com/auth/gmail.readonly",
      "email",
    ],
  })
);

router.get(
  "/profile",
  passport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/userprofile");
  }
);

router.get(
  "/userprofile",
  isLoggedIn,
  asyncError(async (req, res, next) => {
    const userFind = await user.findOne({ email: req.user.email });

    res.render("profile", { userFind });
  })
);

router.get(
  "/:id/fill",
  isLoggedIn,
  asyncError(async (req, res, next) => {
    const { id } = req.params;
    const userFind = await user.findById(id);
    res.render("formfill", { userFind });
  })
);

router.post(
  "/:id/fill",
  isLoggedIn,
  asyncError(async (req, res, next) => {
    //trying to make array input
    const inputs = [];
    for (input in req.body) {
      req.body[input].searchEmail = req.body[input].searchEmail.trim();
      req.body[input].name = req.body[input].name.trim();
      inputs.push(req.body[input]);
    }

    //joi validate
    joiValidate(req);
    const userFind = await user.findById(req.user.id);

    const inputsName = [];
    const inputsEmail = [];
    for (input in req.body) {
      if (!inputsName.find((name) => name === req.body[input].name)) {
        inputsName.push(req.body[input].name);
      } else {
        req.flash("error", "Provide unique name for each folder");
        return res.redirect(`/${req.user.id}/fill`);
      }
    }
    //checking unique email
    for (input in req.body) {
      if (!inputsEmail.find((email) => email === req.body[input].searchEmail)) {
        inputsEmail.push(req.body[input].searchEmail);
      } else {
        req.flash("error", "Provide unique email address for each folder");
        return res.redirect(`/${req.user.id}/fill`);
      }
    }

    const resultname = await user.uniqueName(inputsName, req.user.id);

    const resultemail = await user.uniqueEmail(inputsEmail, req.user.id);

    if (resultname && resultemail) {
      for (input in req.body) {
        userFind.input.push({
          searchEmail: req.body[input].searchEmail,
          name: req.body[input].name,
        });
      }
      userFind.save((err) => {
        if (err) {
          throw new ExpressError(err.message, 400);
        } else {
          req.flash("success", "Successfully created folder!");
          return res.redirect(`/${req.user.id}/fill`);
        }
      });
    } else {
      const field = resultemail ? "name" : "email";
      req.flash("error", `Provide unique ${field} for each folder`);
      return res.redirect(`/${req.user.id}/fill`);
    }
  })
);

router.get(
  "/:id/allfolder",
  isLoggedIn,
  asyncError(async (req, res, next) => {
    const userFind = await user.findById(req.params.id);
    res.render("allfolder", { userFind });
  })
);

router.get(
  "/getprofile",
  isLoggedIn,
  asyncError(async (req, res, next) => {
    const doc = await user.find({ email: req.user.email });
    const access_token = doc[0].access_token;
    const apires = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/profile?access_token=${access_token}`
    );
    res.json(apires.data);
  })
);

router.get("/message", isLoggedIn, (req, res) => {
  res.render("message", { data: null });
});
var decode = function (input) {
  // Replace non-url compatible chars with base64 standard chars
  input = input.replace(/-/g, "+").replace(/_/g, "/");

  // Pad out with standard base64 required padding characters
  var pad = input.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error(
        "InvalidLengthError: Input base64url string is the wrong length to determine padding"
      );
    }
    input += new Array(5 - pad).join("=");
  }

  return input;
};
var data = [];
var messages = [];

router.post(
  "/search",
  isLoggedIn,
  asyncError(async (req, res, next) => {
    doc = await user.find({ email: req.user.email });
    const searchemail = req.body.searchEmail;
    const access_token = doc[0].access_token;
    messages = [];
    data = [];
    const promises = [];
    var i;
    const apires = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${searchemail}%20has:attachment&access_token=${access_token}`
    );
    if (apires.data.messages) {
      for (i = 0; i < apires.data.messages.length; i++) {
        message_id = apires.data.messages[i].id;

        //trying promises
        promises[i] = axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message_id}?access_token=${access_token}`
        );
      }

      Promise.all(promises).then((resolve) => {
        resolve.forEach((attachmentres) => {
          attachmentres.data.payload.parts.forEach((doc) => {
            if (doc.mimeType == "application/pdf") {
              let daterec = null;
              attachmentres.data.payload.headers.forEach((doc) => {
                if (doc.name === "Date") {
                  daterec = doc.value;
                }
              });
              let message = {
                attachment_id: null,
                message_id: null,
                filename: null,
                date: null,
              };
              message.attachment_id = doc.body.attachmentId;
              message.filename = doc.filename;
              message.message_id = message_id;
              message.date = daterec;

              messages.push(message);
            }
          });
        });

        return res.send(req.user.id);
      });
    }
    return res.send(req.user.id);
  })
);

router.get(
  "/search",
  isLoggedIn,
  asyncError(async (req, res, next) => {
    const id = req.user.id;
    const userFind = await user.findById(id);
    res.render("search", { userFind });
  })
);
router.post(
  "/:id/sendme",
  isLoggedIn,
  asyncError(async (req, res, next) => {
    const { id } = req.params;
    const userdata = await user.findById(id);
    const access_token = userdata.access_token;
    const response = await axios(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?access_token=${access_token}`
    );
    const promises = [];
    const nextPageToken = response.data.nextPageToken;
    response.data.messages.forEach((message, index) => {
      promises[index] = axios.get(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?access_token=${access_token}&fields=payload%2Fheaders`
      );
    });

    Promise.all(promises).then((resolve) => {
      const emails = [];
      resolve.forEach((header) => {
        var i = 0;
        header.data.payload.headers.forEach((doc) => {
          if (doc.name === "From") {
            emails.push(doc.value);
          }
        });
      });
      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }
      const respondEmail = [];
      var uniqueEmail = emails.filter(onlyUnique);
      uniqueEmail.forEach((email) => {
        if (email.indexOf("<") != -1) {
          respondEmail.push(
            email.substring(email.indexOf("<") + 1, email.indexOf(">"))
          );
        } else {
          respondEmail.push(email);
        }
      });
      res.send({ respondEmail, nextPageToken });
    });
  })
);

//getting next page
router.post(
  "/:id/nextpage",
  isLoggedIn,
  asyncError(async (req, res, next) => {
    let { nextPageToken } = req.body;
    const { id } = req.params;
    const userdata = await user.findById(id);
    const access_token = userdata.access_token;
    const response = await axios(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?access_token=${access_token}&pageToken=${nextPageToken}`
    );
    const promises = [];
    nextPageToken = response.data.nextPageToken;
    response.data.messages.forEach((message, index) => {
      promises[index] = axios.get(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?access_token=${access_token}&fields=payload%2Fheaders`
      );
    });

    Promise.all(promises).then((resolve) => {
      const emails = [];
      resolve.forEach((header) => {
        var i = 0;
        header.data.payload.headers.forEach((doc) => {
          if (doc.name === "From") {
            emails.push(doc.value);
          }
        });
      });
      function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
      }
      const respondEmail = [];
      var uniqueEmail = emails.filter(onlyUnique);
      uniqueEmail.forEach((email) => {
        if (email.indexOf("<") != -1 && email.indexOf("iitism") != -1) {
          respondEmail.push(
            email.substring(email.indexOf("<") + 1, email.indexOf(">"))
          );
        } else if (email.indexOf("iitism") != -1) {
          respondEmail.push(email);
        }
      });
      res.send({ respondEmail, nextPageToken });
    });
  })
);

var folderName = null;
router.post(
  "/:id/search/:email",
  isLoggedIn,
  asyncError(async (req, res, next) => {
    const { id, email } = req.params;
    doc = await user.findById(id);
    const searchemail = email;
    //used for displaying folder name
    const access_token = doc.access_token;
    messages = [];
    data = [];
    const promises = [];
    var i;
    const apires = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${searchemail}%20has:attachment&access_token=${access_token}`
    );
    if (apires.data.messages) {
      for (i = 0; i < apires.data.messages.length; i++) {
        message_id = apires.data.messages[i].id;
        promises[i] = axios.get(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message_id}?access_token=${access_token}`
        );
      }

      Promise.all(promises).then((resolve) => {
        resolve.forEach((attachmentres) => {
          attachmentres.data.payload.parts.forEach((doc) => {
            if (doc.mimeType == "application/pdf") {
              let daterec = null;
              attachmentres.data.payload.headers.forEach((doc) => {
                if (doc.name === "Date") {
                  daterec = doc.value;
                }
              });
              let message = {
                attachment_id: null,
                message_id: null,
                filename: null,
                date: null,
              };
              message.attachment_id = doc.body.attachmentId;
              message.filename = doc.filename;
              message.message_id = message_id;
              message.date = daterec;

              messages.push(message);
            }
          });
        });

        res.redirect(`/${id}/${searchemail}/pdf`);
      });
    } else {
      res.redirect(`/${id}/${searchemail}/pdf`);
    }
  })
);

router.get(
  "/:id/:search/pdf",
  isLoggedIn,
  asyncError(async (req, res, next) => {
    const { id, search: searchemail } = req.params;
    let folderName = null;
    const userFind = await user.findById(id);
    userFind.input.forEach((obj) => {
      if (obj.searchEmail === searchemail) {
        folderName = obj.name;
      }
    });
    res.render("pdf", {
      // data : data,
      messages,
      userFind,
      folderName,
    });
  })
);

var database64;

const fileNameCreated = [];
router.post(
  "/finddata",
  isLoggedIn,
  asyncError(async (req, res, next) => {
    const doc = await user.find({ email: req.user.email });
    const access_token = doc[0].access_token;
    const { attachmentid, messageid, filename } = req.body;
    const datares = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageid}/attachments/${attachmentid}?access_token=${access_token}`
    );

    database64 = decode(datares.data.data);
    if (!fs.existsSync(`public/pdfs/${req.user.email}`)) {
      fs.mkdirSync(`public/pdfs/${req.user.email}`);
    }
    base64.base64Decode(database64, filename, req.user.email);
    //using session
    if (!req.session.filenames) {
      req.session.filenames = [];
      req.session.filenames.push(filename);
    } else {
      if (!req.session.filenames.find((file) => file == filename)) {
        req.session.filenames.push(filename);
      }
    }
    req.session.save();
    res.send(req.user.email);
  })
);

//email and subject and name

//edit and delete routes
router.get(
  "/:userid/:inputid/edit",
  isLoggedIn,
  asyncError(async (req, res, next) => {
    const { userid, inputid } = req.params;
    const requser = await user.findById(userid);
    const searchInput = requser.input.id(inputid);
    res.render("edit.ejs", {
      userFind: requser,
      searchInput,
    });
  })
);

//delete request
router.delete(
  "/:id/:inputid/delete",
  asyncError(async (req, res, next) => {
    const { id, inputid } = req.params;
    const userFind = await user.findById(id);
    userFind.input.id(inputid).remove();
    await userFind.save();
    req.flash("success", "Successfully deleted the folder");
    res.redirect(`/${id}/fill`);
  })
);
//put request for form edit
router.put(
  "/:inputid/edit",
  asyncError(async (req, res, next) => {
    //joi validate
    joiValidate(req);
    const { inputid } = req.params;
    let { newSearchEmail, newName } = req.body.input;
    newSearchEmail = newSearchEmail.trim();
    newName = newName.trim();
    const userFind = await user.findById(req.user.id);
    const searchInput = userFind.input.id(inputid);
    //searching in database
    userFind.input.forEach((obj) => {
      if (searchInput.searchEmail != obj.searchEmail) {
        if (obj.searchEmail == newSearchEmail) {
          req.flash("error", `Folder of this email is already been created`);
          return res.redirect(`/${req.user.id}/${inputid}/edit`);
        }
      }
    });
    userFind.input.forEach((obj) => {
      if (searchInput.name != obj.name) {
        if (obj.name == newName) {
          req.flash("error", `Folder of this name is already been created`);
          return res.redirect(`/${req.user.id}/${inputid}/edit`);
        }
      }
    });

    searchInput.searchEmail = newSearchEmail;
    searchInput.name = newName;
    await userFind.save();
    req.flash("success", "Updated the folder");
    res.redirect(`/${req.user.id}/fill`);
  })
);

router.get(
  "/:id/signout",
  asyncError(async (req, res, next) => {
    const { id } = req.params;
    const userdata = await user.findOne({ email: req.user.email });

    fs.readdir(`public/pdfs/${req.user.email}`, async (err, files) => {
      if (err) {
        req.logout();
        res.send("logout");
      } else {
        for (const file of files) {
          await fs.unlink(`public/pdfs/${req.user.email}/` + file);
        }
        fs.rmdir(`public/pdfs/${req.user.email}`);
        const token = req.cookies.token;
        req.logout();
        req.session.destroy();
        res.send("logout");
      }
    });
  })
);
//verfication route
router.get("/google81d34312975a22ba.html", (req, res) => {
  res.sendFile("google81d34312975a22ba.html", {
    root: path.join(__dirname, "../public"),
  });
});
//if any other route
router.get("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});
//adding error handler
router.use((err, req, res, next) => {
  let { message = "Something went wrong", statusCode = 500 } = err;
  console.dir(err.response || err);
  if (err.response) {
    if (err.response.status === 403 || 401) {
      req.flash("error", "Please give permission to read emails by relogin.");
      return res.send("error");
    } else if (statusCode === 500) {
      err.message = "Something went wrong";
      return res.status(statusCode).render("error", { err });
    }
  }
  res.status(statusCode).render("error", { err });
});

module.exports = router;
