const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

//@route GET api/users
//@desc Register user
//@access Public

router.post('/', [
    //area for express-validator/check

    check('name', 'Name is required')
    .not()
    .isEmpty(),
    check('email', 'Please include a valid email')
    .isEmail(),
    check('password', 'Please enter a password with 6 or more characters')
    .isLength({ min: 6})
], 
async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        //check for validation is do not match return 400
        return res.status(400).json({errors: errors.array()});
    }
    const{name, email, password} = req.body;

    try{
    
        let user = await User.findOne({ email});
    //see if user exists
    if(user){
        res.status(400).json({errors: [{msg: 'User already exists'}] });
    }

    //get users gravatar(Avatar)
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
    //Encrypt password

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt); //hash password

    await user.save(); //everything is promise put a await ?

    //Return jsonwebToken
    res.send('User Registered')
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error...');
    }
    
 
});

module.exports = router;