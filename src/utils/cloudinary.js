import {v2 as cloudinary} from "cloudinary"
import { log } from "console"
import fs from "fs"




cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY
})


const uploadOnCloudinary=async (localFilePath) => {
    try{
        if(!localFilePath) return null
        const response=await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"})
        // console.log(response.url)
        // console.log(response);
        fs.unlinkSync(localFilePath)
        // console.log(response.url);
        return response
    }
    catch(error){
        fs.unlinkSync(localFilePath)
        console.error("Error uploading to cloudinary", error)
    }
}

export {uploadOnCloudinary}