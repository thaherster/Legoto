const express = require("express");
const router = express.Router();
const db = require("arangojs")();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

const userCollection = db.collection("User");

//Load Input Validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//@route GET api/users/test
//@desc TEST users
//@access Public
router.get("/test", (req, res) => {
  res.json({ text: "TEST is working" });
});

//@route GET api/users
//@desc Get all users
//@access Public
router.get("/", (req, res) => {
  userCollection
    .all()
    .then(function(response) {
      console.log(`Retrieved documents.`, response._result);

      return res.status(200).json(response._result);
    })
    .catch(function(error) {
      console.error("Error getting document", error);
      return res.status(500).json(error);
    });
});

//@route POST api/users/register
//@desc Register new user
//@access Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  //Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  userCollection
    .firstExample({ email: req.body.email })
    .then(user => {
      if (user) {
        errors.email = "Email already exist";
        return res.status(400).json(errors);
      }
    })
    .catch(err => {
      //Create a new user
      const newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      };

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            throw err;
          }
          newUser.password = hash;
          userCollection
            .save(newUser)
            .then(user => {
              res.json(user);
            })
            .catch(err => console.log(err));
        });
      });
    });
});

//@route POST api/users/login
//@desc Login  user / return JWT token
//@access Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);
  //Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  //Find user by email
  userCollection
    .firstExample({ email: email })
    .then(user => {
      console.log("Logged in");

      console.log(user);
      //Check user
      if (!user) {
        errors.email = "User not found";
        return res.status(400).json(errors);
      }

      //Check password & hashed password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          //User Matched
          const payload = {
            name: user.name,
            _key: user._key,
            email: user.email
          }; // Create JWT payload
          //Sign Token
          jwt.sign(payload, keys.secretOrKey, {}, (err, token) => {
            res.json({ success: true, token: "Bearer " + token });
          });
        } else {
          errors.password = "Password Incorrect!";
          return res.status(400).json(errors);
        }
      });
    })
    .catch(err => {
      errors.email = "User not found";
      return res.status(400).json(errors);
    });
});

//@route GET api/users/current
//@desc Return current user
//@access Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      _key: req.user._key,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
