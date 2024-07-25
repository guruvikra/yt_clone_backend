import { asynHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"



const registerUser = asynHandler(async (req,res) => {
    //get the user detail from the rquest.body || front end

    const { username,email,fullname,password } = req.body
    console.log("_________req.body__________________________");
    console.log(req.body);
    console.log("___________________________________");

    //validate the user detail
    if(
        [username,email,fullname,password].some((field)=> field?.trim() ==="")
    ){
        throw new ApiError(400,"all fields are required")
    }

    // check if the user is already exist  or not

    const existingUser = await User.findOne({email:email})
    console.log(existingUser);
    // User.findOne({$or:[{username,email}]})

    if(existingUser){
        throw new ApiError(400,"User already exist")
    }

    console.log("running till  here");
    // upload the file
    const avatarLocalPath=req.files?.avatar[0]?.path
    console.log(avatarLocalPath);
    const coverImageLocalPath=req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }
    
    //upload on cloud
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    console.log("avatar ffrom clodanary " ,avatar);
    if(coverImageLocalPath) await uploadOnCloudinary(coverImageLocalPath);
    

    if(!avatar){
        throw new ApiError(500,"Error uploading to cloudinary")
    }

    const user= await User.create({
        username:username.toLowerCase(),
        email,
        fullname,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || null
    })

    // this is to remove the password from the response and refresh token
    const created_user=await User.findById(user._id).select("-password -refreshToken")

    if(!created_user){
        throw new ApiError(500,"something went wrong while registering user")
    }

    return res.status(200).json(
        new ApiResponse(200,created_user ,"user created successfully")
    )



})



export { registerUser };