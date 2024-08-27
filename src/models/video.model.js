import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';


const videoSchema =new mongoose.Schema(
    
    {
        videoFile: {
            type: String, 
            required: true,
        },
        thumbnail: {
            type: String, 
            required: true,
        },
        title: {
            type: String, 
            required: true,
        },
        description: {
            type: String, 
            required: true,
        },
        duration: {
            type: Number, //cloudnaryurl we will remove the suration time of the video from the video file that is uploaded on cloudnary
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        Owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }

    },
    {
        timestamps: true,
    }
)


videoSchema.plugin(mongooseAggregatePaginate);

export const Video=mongoose.model("Video",videoSchema);