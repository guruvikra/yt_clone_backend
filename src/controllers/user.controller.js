import { asynHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"





const generateAccessTokenAndRefreshToken =async (userId) => {
    const user = await User.findById(userId);
    // console.log(user);
    const AccessToken=user.generateAccessToken()
    const RefreshToken=user.generateRefreshToken()

    user.refreshToken=RefreshToken
    await user.save({ validateBeforeSave: false })
    return {AccessToken,RefreshToken}
}


const registerUser = asynHandler(async (req,res) => {
    //get the user detail from the rquest.body || front end

    const { username,email,fullname,password } = req.body
    // console.log("_________req.body__________________________");
    // console.log(req.body);
    // console.log("___________________________________");

    //validate the user detail
    if(
        [username,email,fullname,password].some((field)=> field?.trim() ==="")
    ){
        throw new ApiError(400,"all fields are required")
    }

    // check if the user is already exist  or not

    const existingUser = await User.findOne({email:email})
    // console.log(existingUser);
    // User.findOne({$or:[{username,email}]})

    if(existingUser){
        throw new ApiError(400,"User already exist")
    }
    

 
    // upload the file
    const avatarLocalPath=req.files?.avatar[0]?.path
    // console.log(avatarLocalPath);
    // let coverImageLocalPath;
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    //     coverImageLocalPath=req.files.coverImage[0].path
    // }

    let coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;

    

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }
    
    //upload on cloud
    const avatar=await uploadOnCloudinary(avatarLocalPath);
    // console.log("avatar ffrom clodanary " ,avatar);
    const coverImage= await uploadOnCloudinary(coverImageLocalPath);
    
    if(!avatar){
        throw new ApiError(500,"Error uploading to cloudinary")
    }

    

    const user= await User.create({
        username:username.toLowerCase(),
        email,
        fullname,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
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


const loginUser = asynHandler( async (req,res) => {
    const { email,password } = req.body
    if(!email || !password){
        throw new ApiError(400,"email and password are required")
    }
    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(404,"no user found with this email please go and register")

    }
    const isMatch = await user.isPasswordCorrect(password)
    if(!isMatch){
        throw new ApiError(401,"incorrect password")
    }

    const {AccessToken,RefreshToken}=await generateAccessTokenAndRefreshToken(user._id);

    const options={
        httpOnly: true,
        secure: true
    }

    return res.
    status(200).
    cookie("accessToken ",AccessToken,options).
    cookie("refreshToken ",RefreshToken,options).
    json(new ApiResponse(
        200,{
            user:AccessToken,RefreshToken
        },
        "User logged in successfully"
    ))

})

const logoutUser = asynHandler( async (req, res) => {
   const user=req.user._id
   await User.findByIdAndUpdate(user,{
    $set:{
        refreshToken:undefined
    }
    
   },
   {
    new:true
    }
    )
    const options={
        httpOnly: true,
        secure: true
    }

    return res.
    status(200).
    clearCookie("accessToken ",options).
    clearCookie("refreshToken",options).
    json(new ApiResponse(200,{},"User logged out  successfully"))

})


const refreshAccessToken = asynHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        return new ApiError(401,"unauthorized access")
    }
    try {
        const decode=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        console.log(decode);
        if(!decode){
            return new ApiError(403,"invalid refresh token")
        }
    
        const user=await User.findById(decode?._id)
        if(!user){
            return new ApiError(404,"user not found")
        }
        if(incomingRefreshToken !== user.refreshToken){
            return new ApiError(401,"unauthorized access")
        }
        
        const {AccessToken,RefreshToken}=await generateAccessTokenAndRefreshToken(user._id);
       
       const options={
            httpOnly: true,
            secure: true}
        res.status(200).
        cookie("accessToken ",AccessToken,options).
        cookie("refreshToken ",RefreshToken,options).
        json(new ApiResponse(
            200,{
                user:AccessToken,RefreshToken
            },
            "User logged in successfully"
        ))
    } catch (error) {
        throw new ApiError(400,error)
    }
})


export { registerUser, loginUser, logoutUser ,refreshAccessToken};