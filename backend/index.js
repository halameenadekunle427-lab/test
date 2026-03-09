import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from "mongoose";

const app = express();


app.use(express.json);
app.use(cors);



app.get("/", (res, ) => {
    res.json({message: "hello!"})
})

app.listen("4500", () => {
    console.log("Server is running on port 4500")
})