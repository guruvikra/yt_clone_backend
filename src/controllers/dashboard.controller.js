import { asynHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model";



const getChannelVideos = asynHandler(async(req, res) => {
    const channelVideos=await Video.find({Owner:req.user._id})
    if(channelVideos.length<0){
        res.status(200).
        json(new ApiResponse(200,{},"no video uploaded by this user"))
    }

})