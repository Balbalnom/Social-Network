const mongoose = require('mongoose');


const PostSchema = new mongoose.Schema({
    
    user:{
        type: PostSchema.Types.ObjectId,
        ref: 'users'
    },
    text:{
        type:String,
        required: true
    },
    name:{
        type: String
    },
    avatar:{
        type: String
    },
    likes:[
        {
            user:{
                type: PostSchema.Types.ObjectId,
                ref: 'users'
            },
            text:{
                type: String,
                required: true
            },
            avatar:{
                type: String
            },
            date:{
                type: Date,
                default: Date.now
            }
        }
    ],

    date:{
        type: Date,
        default: Date.Now
    }


});

let Post = mongoose.model('post', PostSchema);
module.exports = Post;