import React, { useEffect } from "react";
import { pipeline, env } from "@xenova/transformers";

// Disable local model loading
env.allowLocalModels = false;

const TestingWeb = () => {
    useEffect(() => {
        async function runTest() {
            console.log("🔍 Running AI Web Console Test...");
            try {
                console.log("🚀 Loading AI Model...");
                const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
                console.log("✅ AI Model Loaded!");

                // Test similarity between two words
                const output = await extractor(["Computer Science", "Mechanical Engineering"], { normalize: true, pooling: "cls" });
                const [vec1, vec2] = output.tolist();
                const similarity = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);

                console.log(`🔢 Similarity between "Computer Science" and "Mechanical Engineering": ${similarity.toFixed(4)}`);
            } catch (error) {
                console.error("❌ AI Matching Error:", error);
            }
        }

        runTest();
    }, []);

    return (
        <div>
            <h2>AI Web Console Test</h2>
            <p>Check the browser console (F12) for similarity scores.</p>
        </div>
    );
};

export default TestingWeb;
