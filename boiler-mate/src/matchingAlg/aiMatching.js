import { pipeline, env } from "@xenova/transformers";

// Load the model once and reuse it
async function loadModel() {
    console.log("🚀 Loading AI Model...");
    return await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
}

export async function getSimilarity(word1, word2) {
  env.useBrowserCache = true; // Allows the model to be stored in cache
  env.allowLocalModels = true; // Allows local model loading
    try {
        const extractor = await loadModel();

        // Generate embeddings
        const output = await extractor([word1, word2], { normalize: true, pooling: "cls" });
        const [vec1, vec2] = output.tolist();

        // Compute cosine similarity
        const similarity = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
       
        console.log(`🔢 Similarity between "${word1}" and "${word2}":`, similarity.toFixed(4));
        return similarity;
    } catch (error) {
        console.error("❌ AI Matching Error:", error);
        return 0;
    }
}