import { asynHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"





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


const changeUserPassword = asynHandler (async (req, res) => {
    const {oldpassword, newpassword, confirmpassword} =req.body//
    if(!oldpassword ||!newpassword || !confirmpassword){
        throw new ApiError(400,"old password and new password are required")
    }
    if(newpassword !== confirmpassword){
        throw new ApiError(400,"new password and confirm password should be same")
    }

    const user=await User.findById(req.user._id);
    if(!user){
        throw new ApiError(404,"user not found")
    }
    const isMatch = await user.isPasswordCorrect(oldpassword)  
    if(!isMatch){
        throw new ApiError(401,"incorrect password")
    } 

    user.password=newpassword;
    await user.save({validateBeforeSave: false})
    res.status(200).
    json(new ApiResponse(200,{},"User password changed successfully"))
})

const currentUser = asynHandler(async (req, res) => {
    res.status(200).
    json(new ApiResponse(200,{
        user:req.user,
    },
    "User profile"))
})


const changeProfielInfo = asynHandler( async (req ,res ) => {
    const {username,fullname,email} = req.body;
    const updateFields={}
    if(username) updateFields.username = username
    if(fullname) updateFields.fullname = fullname
    if(email) updateFields.email = email

    const user=User.findByIdAndUpdate(req.user._id,{
        $set:{updateFields}
    },{new:true}).select("-password -refreshToken")
    console.log(user)

    if(!user){
        throw new ApiError(404,"user not found")
    }
    res.status(200).
    json(new ApiResponse(200,{
        user
    },
    "User profile updated successfully"))
})


const changeUserAvatar = asynHandler(async (req, res) => {
    const localPath = req.file?.path;
    console.log(localPath);
    if(!localPath){
        throw new ApiError(400,"avatar is required")
    }
    const user = await User.findById(req.user._id);
    if(!user){
        throw new ApiError(404,"user not found")
    }
    const avatarUrl=user.avatar
    console.log(avatarUrl);
    if(avatarUrl){
        await deleteFromCloudinary(avatarUrl)
    }
    const updatedAvatar =await uploadOnCloudinary(localPath)
    if(!updatedAvatar){
        throw new ApiError(500,"Error uploading to cloudinary")
    }
    const updatedUser = await User.findByIdAndUpdate(req.user._id,{
        $set: {
            avatar: updatedAvatar.url,
        }
    },{new :true}).select("-password -refreshToken")
    // const avatar=await uploadOnCloudinary(localPath);
    // if(!avatar){
    //     throw new ApiError(500,"Error uploading to cloudinary")
    // }
    // const user=User.findByIdAndUpdate(req.user._id,{
    //     $set:{avatar:avatar.url}
    // },{new:true}).select("-password -refreshToken")

    res.status(200).
    json(new ApiResponse(200,{
        updatedUser
    },
    "User avatar updated successfully"))

})


const changeUserCoverImage = asynHandler(async (req, res) => {
    const coverImagelocalPath = req.file?.path
    if(!coverImagelocalPath){
        throw new ApiError(400,"coverimage is required")
    }
    const coverImage=await uploadOnCloudinary(coverImagelocalPath);
    if(!avatar){
        throw new ApiError(500,"Error uploading to cloudinary")
    }
    const user=User.findByIdAndUpdate(req.user._id,{
        $set:{coverImage:coverImage.url}
    },{new:true}).select("-password -refreshToken")

    res.status(200).
    json(new ApiResponse(200,{
        user
    },
    "User coverImage updated successfully"))

})



const getChannelProfile= asynHandler(async (req ,res ) =>{
    const {username}=req.params
    console.log(username);
    if(!username?.trim()){
        throw new ApiError(400,"username is required")
    }

    const channelProfile=await User.aggregate([
        {
            $match:{username:username?.toLowerCase()}
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscriptionCount:{
                    $size:"$subscribers"
                },
                subscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond: {
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                email:1,
                avatar:1,
                coverImage:1,
                subscriptionCount:1,
                subscribedToCount:1,
                isSubscribed:1
            }
        }

    ])
    console.log(channelProfile);
    res.status(200).
    json(new ApiError(200,channelProfile[0],"channelProfile"))
})


const getUserWatchHistory = asynHandler(async(req ,res) => {
    const watchHistory =  await User.aggregate([
        {
            $match: {
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"Owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        email:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    //this addfield is to give owner not in array so that is becomes easy for frontend
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        },
        
    ])
    console.log(watchHistory);
    res.status(200).
    json(new ApiError(200,watchHistory[0].watchHistory,"watchHistory"))
})



export { 
    registerUser,
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeUserPassword, 
    currentUser, 
    changeProfielInfo, 
    changeUserAvatar, 
    changeUserCoverImage,
    getChannelProfile,
    getUserWatchHistory

};


