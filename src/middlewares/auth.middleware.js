import { asynHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";


const jwtVerify = asynHandler( async (req, res, next) => {
    // get the token from the request header
    try {
        const token = req.cookies?.accessToken || headers.authorization?.split(" ")[1];
        if(!token) {
            throw new ApiError(400,"no token found")
        }
        const decode=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decode?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(404,"invalid token")
        }

        req.user=user;
        next()
    } catch (error) {
        throw new ApiError(error)
        
    }
})

export { jwtVerify }