import { Like } from "../models/like.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynHandler } from "../utils/AsyncHandler.js";



const toggleVideoLike = asynHandler(async (req, res) => {
    const { videoId } = req.params
    const  video=await Video.findById({_id:videoId})
    if(!video){
        throw new ApiError(404,"video not found")
    }

    const existingLike=await Like.findOne({video:videoId,owner:req.user._id})
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
    }
    else{
        await Like.create({video:videoId,owner:req.user._id})
    }

    const hasLiked =existingLike ? false : true
    const likeCount=await Like.countDocuments({video:videoId})
    return res.status(200).json(new ApiResponse(200,{hasLiked,likeCount},"like toggle successfully"))
 })


 const toggleCommentLike = asynHandler(async (req, res) => {
    const { commentId } = req.params
    const  comment=await Comment.findById({_id:commentId})
    if(!comment){
        throw new ApiError(404,"comment not found")
    }

    const existingLike=await Like.findOne({comment:commentId,owner:req.user._id})
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
    }
    else{
        await Like.create({comment:commentId,owner:req.user._id})
    }

    const hasLiked =existingLike ? false : true
    const likeCount=await Like.countDocuments({video:videoId})
    return res.status(200).json(new ApiResponse(200,{hasLiked,likeCount},"like toggle successfully"))
 })

 const toggleTweetLike = asynHandler(async (req, res) => {
    const { tweetId } = req.params
    const  tweet = await Tweet.findById({_id:tweetId})
    if(!tweet){
        throw new ApiError(404,"tweet not found")
    }

    const existingLike=await Like.findOne({tweet:tweetId,owner:req.user._id})
    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
    }
    else{
        await Like.create({tweet:tweetId,owner:req.user._id})
    }

    const hasLiked =existingLike ? false : true
    const likeCount=await Like.countDocuments({tweet:tweetId})
    return res.status(200).json(new ApiResponse(200,{hasLiked,likeCount},"like toggle successfully"))
 })

 export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike
 }