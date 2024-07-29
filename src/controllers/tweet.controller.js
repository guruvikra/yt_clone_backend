import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynHandler } from "../utils/AsyncHandler.js";


const createTweet=asynHandler(async (req, res) => {
    const { content } =req.body;

    if(!content){
        throw new ApiError(400,"content is required to tweet")
    }
    const newTweet=await Tweet.create({
        content,
        owner:req.user._id
    })
    if(!newTweet){
        throw new ApiError(500,"Failed to create tweet")
    }
    return res.status(201).
    json(new ApiResponse(201,newTweet,"tweet created successfully"))

})


const getTweetofUser=asynHandler(async (req, res) => {
    const userTweet = await Tweet.find({owner:req.user._id})
    if(!userTweet){
        return res.status(404).
        json(new ApiResponse(404,"no tweet posted by this user"))
    
    }
    return res.status(200).
    json(new ApiResponse(200,userTweet,"tweets fetched successfully"))

})

const deleteTweet = asynHandler (async (req, res) => {
    const { tweetId }= req.params
    const tweet=await Tweet.findByIdAndDelete(tweetId)
    if(!tweet){
        throw new ApiError(404,"tweet not found")
    }
    return res.status(200).
    json(new ApiResponse(200,{},"tweet deleted successfully"))
})

const updateTweet=asynHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    if(!content){
        throw new ApiError(400,"content is required to update tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,{$set:{content}},{new:true})
    if(!updatedTweet){
        throw new ApiError(404,"tweet not found")
    }
    return res.status(200).
    json(new ApiResponse(200,updateTweet,"updated"))
})


const getUserTweets = asynHandler(async (req, res) => {

    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id")
    }
    const tweets = await Tweet.find({owner:userId})
    res
    .status(200)
    .json(new ApiResponse(200,{tweets},"Tweets are fetched successfully"))
})


export {
    createTweet,
    getTweetofUser,
    deleteTweet,
    updateTweet,
    getUserTweets

}