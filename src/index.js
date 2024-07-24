import dotenv from "dotenv"
import connectToDb  from './db/db.js'


dotenv.config({
    path:'./env'
})
connectToDb()