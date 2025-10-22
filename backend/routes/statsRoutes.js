import express from "express";
import Post from "../models/Post.js";

const router = express.Router();
router.get("/totals", async (req, res) => {
    try {
        const result = await Post.aggregate([
            {
                $project: {
                    likesCount: { $size: "$likes" }, // count number of likes in the array
                    views: 1
                }
            },
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: "$likesCount" }, // sum all likesCount
                    totalViews: { $sum: "$views" }       // sum all views
                }
            }
        ]);

        if (result.length > 0) {
            const { totalLikes, totalViews } = result[0];
            res.json({ totalLikes, totalViews });
        } else {
            res.json({ totalLikes: 0, totalViews: 0 });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching totals", error });
    }
});


export default router;