const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');


//@route GET api/auth
//@desc TEST route
//@access Public

router.get('/', auth, async(req, res) => {
    //After token being auth, send User data from MongoDB
    try{
        const user = await User.findById(req.user.id).select(' -password');
        res.json(user);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


router.post('/', [
    //area for express-validator/check

    check('email', 'Please include a valid email')
    .isEmail(),
    check('password', 'Password is required').exists()
], 
async(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        //check for validation is do not match return 400
        return res.status(400).json({errors: errors.array()});
    }
    const {email, password} = req.body;

    try{
    
        let user = await User.findOne({email});
    //see if email exists
        if(!user){
            return res
            .status(400)
            .json({errors: [{msg: 'email is invalid'}] });
        }
    //password check
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res
            .status(400)
            .json({errors: [{ msg: 'Wrong password, Invalid access'}] });
        }


        //Return jsonwebToken
        const payload ={
            user:{
                id: user.id
            }
       
        }
        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            (err, token) =>{
                if(err) throw err;
                res.json({ token });
                }
            );
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error...');
    }
    
});

module.exports = router;