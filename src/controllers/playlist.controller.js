import { asynHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";




const addPlaylist  = asynHandler(async (req, res) => {
    const {name, description} =req.body

    if(!name ||!description){
        throw new ApiError(400,"name and description are required")
    }
    const newPlaylist = await Playlist({
        name,
        description,
        owner:req.user._id
    })
    return res.status(201).
    json(new ApiResponse(201,newPlaylist,`playlist created with name ${name}`))
})


const deletePlaylist = asynHandler(async (req, res) => {
    const {playlistId} =req.params
    const playlist = await Playlist.findOne({ _id: playlistId, owner: req.user._id });
    if (!playlist) { 
        throw new ApiError(404, "Playlist not found or you do not have permission to delete this playlist");
    }
    await Playlist.findByIdAndDelete(playlistId);
    return res.status(200).json(new ApiResponse(200, {}, `Playlist deleted`));
})

const updatePlaylist = asynHandler(async (req, res) => {
    const {playlistId} = req.params;
    const {name, description} = req.body;
    if(!name || !description){
        throw new ApiError(400, "name and description are required");
    }
    const updatedplaylist= await Playlist.findByIdAndUpdate(playlistId,{
        $set:{
            name,
            description
        }
    },
    {
        new:true,
    }
    )
    if(!updatedplaylist){
        throw new ApiError(404, "Playlist not found");
    }
    return res.status(200).
    json(new ApiResponse(200,updatePlaylist,"playlist updated"))

})

const getAllPlaylists = asynHandler(async (req, res) => {
    const playlists = await Playlist.find({ owner: req.user._id });
    if(!playlists){
        throw new ApiError(404, "there is no playlist so create a playlist")
    }
    return res.status(200).json(new ApiResponse(200, playlists, "All playlists"));
})

const getPlaylistById = asynHandler(async (req, res) => {
    const { playlistId }=req.params;
    const playlist = await Playlist.findById(playlistId).populate('videos',"videoFile tilte description ,duration,views")
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }
 })



const addVideoToPlaylist = asynHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;
    // const { videoId } = req.body;
    const playlist = await Playlist.findByIdAndUpdate(playlistId,
         { 
            $push: 
            { 
                videos: videoId
             }
        }, 
        { new: true }
    );
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    return res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist"));
})


const removeVideoFromPlaylist = asynHandler(async (req, res) => {
    const { playlistId, videoId } =  req.params
    const playlist=await Playlist.findByIdAndUpdate(playlistId,{
        $pull:{
            videos:videoId
        },      
    },
    { 
        new : true
    }
    )

    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }
    return res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist"));


})


export {
    addPlaylist,
    deletePlaylist,
    getAllPlaylists,
    getPlaylistById,
    updatePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
}