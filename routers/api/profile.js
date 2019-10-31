const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const{ check, validationResult} = require('express-validator');

const User = require('../../models/User');
const Profile = require('../../models/Profile');


//@route GET api/profile/me
//@desc Get current users profile
//@access Private

router.get('/me', auth, async (req, res) =>{
    try{
        const profile = await Profile.findOne({ user: req.user.id }).populate('user',
        ['name','avatar']
        );

        if(!profile){
            return res.status(400).json({ msg: 'There is no profile for this user'});
        }

        res.json(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server (Profile) Error');
    }

});

//@route POST api/profile
//@desc update/create current users profile
//@access Private

router.post('/', 
[
    auth,
    [
        check('status', 'Status is required')
        .not()
        .isEmpty(),
        check('skills', 'Skills is requried')
        .not()
        .isEmpty(),

    ]

],
async(req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const{
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills){
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }
    //build social object 
    profileFields.social = {}
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;

    try{
        let profile = await Profile.findOne( { user: req.user.id });

        if(profile){
            //update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields},
                { new: true}
                );

                return res.json(profile);
        }

        profile = new Profile(profileFields);
        
        await profile.save();
        res.json(profile);

    }catch(err){
        console.error(err.message);
        res.status(500).send(' post api/profile/ Server Error');
    }
});


//@route GET api/profile
//@desc Get all profile
//@access Public

router.get('/', async(req, res) => {
    try{
        const profiles = await Profile.find().populate('user',['name','avatar']);
        res.json(profiles);

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route GET api/profile/user/:user_id
//@desc Get profile by user id
//@access Public

router.get('/user/:user_id', async(req, res) => {
    try{
        const profile = await Profile.findOne( { user: req.params.user_id }).populate('user',
        ['name','avatar']);
        if(!profile) return res.status(400).send('Profile Not Found');
        res.json(profile);

    }catch(err){
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            if(!profile) return res.status(400).send('Profile Not Found');

        }
        res.status(500).send('Server Error');
    }
});

//@route DELETE api/profile/
//@desc Delete profile, user & posts
//@access Private

router.delete('/', auth, async(req, res) => {
    try{

        //TODO remove posts

        //remove profile
        await Profile.findOneAndRemove( { user: req.user.id});
        await User.findOneAndRemove( { _id: req.user.id});
        res.json({ msg: 'User Deleted'});
        

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@route PUT api/profile/experience
//@desc add profile experience
//@access Private

router.put(
    '/experience',
    [
        auth,
        [
            check('title', 'Title is required')
            .not()
            .isEmpty(),
            check('company', 'Company is required')
            .not()
            .isEmpty(),
            check('from', 'From date is required')
            .not()
            .isEmpty()
        ]
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        const{
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        try{
            const profile = await Profile.findOne( {user: req.user.id });

            profile.experience.unshift(newExp);
            await profile.save();

            res.json(profile);
        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

//@route DELETE api/profile/experience/:exp_id
//@desc delete profile experience
//@access Private

router.delete('/experience/:exp_id', auth, async(req, res) =>{

    try{
        const profile = await Profile.findOne( {user: req.user.id });

        //get remove index
        const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);
        
        res.send('_exp:id is being deleted')
        await profile.save();
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route PUT api/profile/education
//@desc add profile education
//@access Private

router.put(
    '/education',
    [
        auth,
        [
            check('school', 'school is required')
            .not()
            .isEmpty(),
            check('degree', 'degree is required')
            .not()
            .isEmpty(),
            check('major', 'major is required')
            .not()
            .isEmpty(),
            check('from', 'From date is required')
            .not()
            .isEmpty()
        ]
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        const{
            school,
            degree,
            major,
            from,
            to,
            current,
            description
        } = req.body;

        const newEdu = {
            school,
            degree,
            major,
            from,
            to,
            current,
            description
        }

        try{
            const profile = await Profile.findOne( {user: req.user.id });

            profile.education.unshift(newEdu);
            await profile.save();

            res.json(profile);
        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

//@route DELETE api/profile/education/:edu_id
//@desc delete profile education
//@access Private

router.delete('/education/:edu_id', auth, async(req, res) =>{

    try{
        const profile = await Profile.findOne( {user: req.user.id });

        //get remove index
        const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);
        
        await profile.save();
        res.send('_exp:id is being deleted')
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


//@route PUT api/profile/github/:username
//@desc get user repos from Github
//@access Public 


router.get('/github/:username', (req, res) =>{
    try{
        const options ={
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js'}
        }

        request(options, (error, response, body) =>{
            if(error) console.error(error);
            
            if(response.statusCode !== 200){
                return res.status(404).json({ msg: 'No Github Profile found'});
            }

            res.json(JSON.parse(body));
        });
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})



module.exports = router;