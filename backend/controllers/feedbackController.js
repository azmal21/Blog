import Feedback from "../models/Feedback.js";

export const createFeedback = async (req, res) => {
    try{
        const { name, message, rating } = req.body;

        if(!name || !message || !rating)
            return res.status(400).json({ message: "All fields are required" });

        const feedback = new Feedback({ name, message, rating });
        await feedback.save();

        res.status(201).json({ message: "Feedback submitted successfully" });
    }catch(err){
        res.status(500).json({ message: "Server.error", err});
    }
}