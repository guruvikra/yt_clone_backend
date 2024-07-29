import { asynHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import mongoose ,{isValidObjectId} from "mongoose"


const toogleSubscription =asynHandler (async(req, res) => {

    const {channelid} = req.params

    const channel = await Subscription.findOne({channel:channelid,subscriber:req.user._id})

    if(!channel){
        await Subscription.create({
            channel: channelid,
            subscriber: req.user._id
        })
        return res.status(200).
        json(new ApiResponse(200,true,"subscription added"))
    }
    else{
        await Subscription.findByIdAndDelete(channel._id)
        return res.status(200).json(new ApiResponse(200,false,"subscription removed"))
    }

})


// const  getUserChannelSubscribers =asynHandler(async(req, res) => {
//     const {channelid} = req.params
//     if(!channelid?.trim()){
//         throw new ApiError(400,"channelid is required")
//     }

//     // const subscribers = await Subscription.find({channel:channelid}).select("subscriber")
//     // .populate("subscriber","username")
//     const subscribers = await Subscription.aggregate([
//         {
//             $match:{channel:new mongoose.Types.ObjectId(channelid)}
//         },
//         // {
//         //     $lookup:{
//         //         from:"users",
//         //         localField:"subscriber",
//         //         foreignField:"_id",
//         //         as:"subscriber",
//         //         pipeline:[
//         //             {
//         //                 $project:{
//         //                     username:1,
//         //                     email:1,
//         //                     avatar:1,
//         //                 }
//         //             }
//         //         ]
//         //     }
//         // },
//         // {
//         //   $project:{
//         //     subscriber:1,
//         //     createdAt:1
//         //   }  
//         // }
//     ])
    
//     console.log(subscribers);
//     return res.status(200).json(new ApiResponse(200,subscribers,"subscribers fetched"))

// })


// const getSubscribedChannels=asynHandler (async(req ,res) => {
//     console.log(req.user._id);
//     // const {userid} =req.params
//     const subscribedTo =await Subscription.aggregate([
//         {
//             $match:{subscriber:req.user._id}
//         },
//         {
//             $lookup:{
//                 from : "users",
//                 localField:"channel",
//                 foreignField:"_id",
//                 as:"channel",
//                 pipeline:[
//                     {
//                         $project:{
//                             username:1,
//                             email:1,
//                             avatar:1,
                            
//                         }
//                     }
//                 ]
//             }
//         },
//         {
//             $project:{
//                 channel:1
//             }
//         }
//     ])
//     return res.status(200).json(new ApiResponse(200,subscribedTo,"subscribers fetched"))

// })


const getUserChannelSubscribers=asynHandler(async(req,res) => {
    const {channelid} = req.params
    // const subscribers = await Subscription.find({channel: channelid}).populate("subscriber", "fullName email username avatar coverImage");
    // console.log(ch);
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelid)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            email: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $facet: {
                subscriberList: [
                    {
                        $project: {
                            _id: 1,
                            subscribers: 1
                        }
                    }
                ],
                count: [
                    {
                        $count: "totalSubscribers"
                    }
                ]
            }
        },
        {
            $project: {
                subscriberList: 1,
                totalSubscribers: {
                    $arrayElemAt: ["$count.totalSubscribers", 0]
                }
            }
        }
    ]);
    // const totalsub=await User.aggregate([
    //     {}
    // ])

    res.status(200).
    json(new ApiResponse(200,subscribers,"all subscribers"))
})



const getSubscribedChannels=asynHandler(async(req, res) => {
    // const {id}=req.params
    // const  subscriberTo= await Subscription
    // .find({subscriber: req.user._id})
    // .populate("channel", "fullName email username avatar coverImage");

    const subscriberTo= await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(req.user._id),
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channel",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            email:1,
                            avatar:1,
                            coverImage:1
                        }
                    }
                ]
            }
        },
        
        {
            $facet:{
                channellist:[
                    {
                        $project:{
                            channel:1,
                        }
                    }
                ],
                count:[
                    {
                        $count:"totalSubscribedChannels"
                    }
                ]
            }
        },
        {
            $project:{
                channellist:1,
                totalSub:{
                    $first:"$count.totalSubscribedChannels"
                }
                
            }
        }
    ])



    res.status(200).
    json(new ApiResponse(200,subscriberTo,"all subscribed channels"))   
})




export  {
    toogleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}