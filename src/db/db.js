import mongoose from "mongoose";




const connectToDb=async () => {

    try {
        // console.log(process.env.MONGODB_URI);
        const connection=await mongoose.connect(`${process.env.MONGODB_URI}`)    
        console.log(connection.connection.host);
    } catch (error) {
        console.error("Failed to connect to MongoDB", error.message);
        // throw error;
        process.exit(1);
        
    }

}

export default connectToDb