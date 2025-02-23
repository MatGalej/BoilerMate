import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers";

// Load AI Model only once
let extractorPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

export async function getSimilarity(word1, word2) {
    try {
        const extractor = await extractorPromise;
        const output = await extractor([word1, word2], { normalize: true, pooling: "cls" });
        const [vec1, vec2] = output.tolist();
        const similarity = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
        return similarity;
    } catch (error) {
        console.error("❌ AI Matching Error:", error);
        return 0;
    }
}


// Test similarity
getSimilarity("ajsldfajs;ldf", "asdf;askldfjasl;dfj");
getSimilarity("apple", "juice");
