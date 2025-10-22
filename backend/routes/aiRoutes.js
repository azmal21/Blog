import express from "express";
import axios from "axios";

const router = express.Router();

// AI Route
router.post("/generate", async (req, res) => {
    const { title, subtitle } = req.body;

    // Simple validation
    if (!title || !subtitle) {
        return res.status(400).json({ error: "Title and subtitle are required" });
    }

    try {
        // 🧠 DeepSeek API request
        const response = await axios.post(
            "https://api.deepseek.com/chat/completions",
            {
                model: "deepseek-chat",
                messages: [
                    {
                        role: "user",
                        content: `Write a short blog post based on the title "${title}" and subtitle "${subtitle}", dont write anything in the first other than the blog.`,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                    "Content-Type": "application/json",
                },
                timeout: 30000,
            }
        );

        // ✅ Extract response text
        const content =
            response.data?.choices?.[0]?.message?.content ||
            "No response from ai";

        res.json({ success: true, content });
    } catch (error) {
        console.error("DeepSeek API failed:");



        const mockBlog = `
                # ${title}

                ## ${subtitle}

                In today's world, understanding the nuances of ${subtitle.toLowerCase()} is essential for anyone looking to gain a deeper perspective on the topic. While AI-generated content would provide a richer and more tailored article, this mock blog aims to guide you through the core ideas with clarity and structure.
                Firstly, it's important to consider the context of ${title.toLowerCase()}. By examining its key elements and implications, we can create a foundation that is both informative and engaging. Whether you're a beginner or someone looking to expand your knowledge, the insights provided here are structured to be easy to follow and highly practical.
                Furthermore, real-world examples help illustrate the concepts more vividly. In practice, understanding how ${subtitle.toLowerCase()} applies to everyday scenarios allows you to make informed decisions and appreciate the underlying principles more thoroughly.
                Finally, continuous learning and exploration are crucial. Even though this is a mock article, the intention is to inspire curiosity and encourage you to delve deeper into the subject matter. Once the network or API is available, a full AI-generated article will enrich this content with detailed explanations, engaging storytelling, and actionable advice.
                Stay tuned for the AI-enhanced version, which will expand on these points and provide a comprehensive, professional-level blog post.`;
        res.json({
            success: true,
            content: mockBlog,
            note: "⚠️ Mock content returned (DeepSeek API unreachable).",
        });
    }
});

export default router;
