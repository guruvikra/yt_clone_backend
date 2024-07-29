import express from 'express';
import cors from 'cors'
import cookieParser  from 'cookie-parser';

const app = express();

app.use(cors());
app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("public"))
app.use(cookieParser())


import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import tweetRouter from "./routes/tweet.routes.js"



app.use("/api/user",userRouter)
app.use("/api/video",videoRouter)
app.use("/api/video/subscription",subscriptionRouter)
app.use("/api/tweet/",tweetRouter)
export { app }