const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');    // to generate token
const bcrypt = require('bcryptjs');     // encrypt password

// check validation for requests
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');   // get user image by email

//  Models
const User = require('../models/User');

router.post('/register', [
    // validation
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({
        min: 6
    })
], async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }
    // get name, email and password from request
    const { name, email, password } = req.body;
    try {
        // check if user already exist
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                errors: [
                    {
                        msg: 'User already exists'
                    }
                ]
            });
        }
        // if not exist
        // get image from gravatar
        const avatar = gravatar.url(email, {
            s: '200',   // size
            r: 'pg',    // rate
            d: 'mm'
        });
        // create user object
        user = new User({
            name, email, avatar, password
        })
        // encrypt password
        const salt = await bcrypt.genSalt(10);  // generate salt contains 10
        // save password
        user.password = await bcrypt.hash(password, salt);   // use user password and salt to hash password
        // save user in database
        await user.save();
        // payload to generate token
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: 360000   // for development, it will 3600 for production
        }, (err, token) => {
            if (err) throw err;
            res.json({token});
        })
    } catch(error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router