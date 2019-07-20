const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth'); //bring in middle ware
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check'); //need to make sure user puts in the right information

const User = require('../../models/User');

//@route    GET  api/auth
//@descrip  Test Route
//@access   Public
router.get('/', auth, async (req, res) => {
  //puting in the auth parameter makes the get request protected
  try {
    const user = await User.findById(req.user.id).select('-password'); //-password leaves out the password
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route    Post (request type) api/auth (end point)
//@descrip  Authenticate user and get token
//@access   Public (we will be making our own auth middle route for authentication)
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req); //get the error
    if (!errors.isEmpty()) {
      //handing the response WIll return 400 if errors
      return res.status(400).json({ errors: errors.array() }); //returns array of errors.. the "response."
    }

    const { email, password } = req.body;

    try {
      //See if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      //make sure password matches
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      //return json webtoken to get user logged in right away
      const payload = {
        user: {
          id: user.id
        }
      };
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
