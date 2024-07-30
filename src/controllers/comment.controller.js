import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynHandler } from "../utils/AsyncHandler.js";



const addComment = asynHandler(async(req, res) => {
    const { videoId } =req.params
    const { content } = req.body
    if(!content){
        throw new ApiError(400, "content is required")
    }
    const newComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    }) 
    if(!newComment){
        throw new ApiError(500, "Failed to add comment")
    }

    return res.status(201).json(new ApiResponse(201, newComment, "Comment added successfully"))
})

const updateComment =asynHandler(async(req, res) => {
    const { commentId } = req.params
    const { content } = req.body
    if(!content){
        throw new ApiError(400, "content is required to update comment")
    }
    const updatedComment = await Comment.findByIdAndUpdate(commentId,{
        $set:{
           content
        }
    },
    {
        new:true
    }
    )
    if(!updatedComment){
        throw new ApiError(404,"comment not found")
    }

    return res.status(200).json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
})

const deleteComment =asynHandler(async(req, res) => {
    const { commentId } = req.params
    const deletedComment = await Comment.findByIdAndDelete(commentId)
    if(!deletedComment){
        throw new ApiError(404,"comment not found")
    }
    return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"))
})
export {
    addComment,
    updateComment,
    deleteComment
}