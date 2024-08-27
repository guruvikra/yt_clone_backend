import { asynHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Video } from "../models/video.model.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"






const publishVideo=asynHandler(async (req, res) => {
    const { title,description } =req.body;

    if(!title || !description){
        throw new ApiError(400,"title and discription are required")
    }
    

   const videoLocalPath = req.files?.video[0]?.path
   const thumbnailLocalPath=req.files?.thumbnail[0]?.path
//    console.log(videoLocalPath);
   if(!videoLocalPath||!thumbnailLocalPath){
       throw new ApiError(400,"Video and thumbnail are required")
   }

   const videofile=await uploadOnCloudinary(videoLocalPath);
   console.log(videofile);
   const thumbnail=await uploadOnCloudinary(thumbnailLocalPath);

   if(!videofile||!thumbnail){
    throw new ApiError(500,"Failed to upload video to cloudinary")
   }
   console.log("done");
   const video=await Video.create({
    title,
    description,
    videoFile:videofile.url,
    thumbnail:thumbnail.url,
    Owner:req.user._id,
    duration:videofile.duration
   })
   console.log("done");


   if(!video){
    throw new ApiError(500,"Failed to create video")
   }
   return res.status(200).
   json(new ApiResponse(200,{video},"video uploaded successfully"))
})


const togglePublishStatus= asynHandler(async (req, res ) => {
    const userId=req.user._id;
    const { id }=req.params;
    const videoOwner=await Video.find({_id:id,Owner:userId})
    // console.log(videoOwner[0].isPublished);
    videoOwner[0].isPublished=!videoOwner[0].isPublished;
    await videoOwner[0].save({validateBeforeSave: false});
    if(videoOwner[0].isPublished){
        return res.status(200).
    json(new ApiResponse(200,videoOwner,"the video is publshed"))
    }
    else{
        return res.status(200).
    json(new ApiResponse(200,videoOwner,"the video is unpublishedd"))
    }
    // console.log(owner);
    // res.status(200)
})


const getVideoById=asynHandler(async (req, res) => {
    const {id} =req.params
    const video=await Video.findById(id);
    // console.log(video.Owner===req.user._id);
    // console.log(video.Owner)
    // console.log(req.user._id);
    if(!video.Owner.equals(req.user._id)){
        video.views++;
        await video.save({validateBeforeSave: false});
    }
    // console.log(video);
    if(!video){
        throw new ApiError(404,"video not found")
    }
    return  res.status(200).
    json(new ApiResponse(200,video,"video founded successfully"))
})

//the main thing is that the owner can only has the access t0  delete the video
const deleteVideoById=asynHandler(async(req, res) => {
    const {id} = req.params;
    const video=await Video.findOne({_id:id,Owner:req.user._id})
    if(!video){
        throw new ApiError(404,"you do not have the access to delete this video only owner has access to delete the video")
    }
    console.log(video.videoFile);
    console.log(video.thunbnail);
    await deleteFromCloudinary(video.videoFile)
    await deleteFromCloudinary(video.thumbnail)
   const v=await Video.findByIdAndDelete(id);
   console.log(v);
    return res.status(200).json(new ApiResponse(200,{v},"deleted"))

})


const updateVideoById=asynHandler(async (req, res) => {
    const {id} = req.params;
    const videoLocalPath=req.file?.path
    const video=await Video.findOne({_id:id,Owner:req.user._id})
    if(!video){
        throw new ApiError(404,"you do not have the access to update this video only owner has access to update the video")
    }
    await deleteFromCloudinary(video.videoFile)
    const updatedVideo=await uploadOnCloudinary(videoLocalPath)
    video.videoFile=updatedVideo.url
    const updated=await video.save({validateBeforeSave: false});
    return res.status(200).json(new ApiResponse(200,updated,"updated"))
 
})


const updateThumbNail = asynHandler(async(req, res) => {
    const {id} = req.params;
    const thumbnailLocalPath=req.file?.path
    const video=await Video.findOne({_id:id,owner:req.user._id})
    if(!video){
        throw new ApiError(404,"you do not have the access to update this video only owner has access to update the video")
    }
    await deleteFromCloudinary(video.thumbnail)
    const updatedVideo=await uploadOnCloudinary(thumbnailLocalPath)
    video.thumbnail=updatedVideo.url
    const updated=await video.save({validateBeforeSave: false});
    return res.status(200).json(new ApiResponse(200,updated,"updated thumbnail"))
 
})

export {
    publishVideo,
    togglePublishStatus,
    getVideoById,
    deleteVideoById,
    updateVideoById,
    updateThumbNail
}