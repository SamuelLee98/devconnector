const express = require('express'); //bring in express
const router = express.Router(); // to use express router
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check'); //need to make sure user puts in the right information

//Bring in user model
const User = require('../../models/User');

//@route    GET (request type) api/users (end point)
//@descrip  Register User
//@access   Public (we will be making our own auth middle route for authenticationn)
router.post(
  '/',
  [
    check('name', 'Name is required') //name of parameter to check, error message
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req); //get the error
    if (!errors.isEmpty()) {
      //handing the response WIll return 400 if errors
      return res.status(400).json({ errors: errors.array() }); //returns array of errors.. the "response."
    }

    const { name, email, password } = req.body;

    try {
      //See if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists.' }] });
      }
      //Get user's gravatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });
      user = new User({
        name,
        email,
        avatar,
        password
      });

      //Encrypt the password using bycrypt
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

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
