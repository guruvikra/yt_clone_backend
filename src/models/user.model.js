import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim:true,
            index:true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim:true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
            // validate: {
            //     validator: function(value) {
            //         return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            //     },
            //     message: "Please enter a valid email address."
            // }
        },
        fullname: {
            type: String,
            required: true,
            trim:true,
            index:true,
        },
        avatar: {
            type: String, //cloudnaryurl
            required: true,
        },
        coverImage: {
            type: String, //cloudnaryurl
        },
        watchHistory: {
            type:[
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Video"
                }
            ]
        },
        password: {
            type: String,
            required: [true,"password is required"],
            minlength: 8,
        },
        refreshToken: {
            type: String,
        }
        

    },
    {
        timestamps:true
    }
)

userSchema.pre("save", async function ( next ) {
    if(!this.isModified("password")) return next();
    try{
        this.password=await bcrypt.hash(this.password, 10);
    }
    catch(err){
        console.error(err);
        res.status(500).json({msg: "Server Error while hashing password"});
    }
    next();
})


userSchema.methods.isPasswordCorrect=async function (password){
    return await bcrypt.compare(password,this.password);

}

userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email
        
        },
         process.env.ACCESS_TOKEN_SECRET, 
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY});
}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
        
        },
         process.env.REFRESH_TOKEN_SECRET, 
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY});
}


export const User=mongoose.model("User",userSchema);



// export default User;