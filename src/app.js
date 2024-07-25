import express from 'express';
import cors from 'cors'
import cookieParser  from 'cookie-parser';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("public"))
app.use(cookieParser());


import userRouter from "./routes/user.routes.js";


app.use("/api/user",userRouter);
export { app };