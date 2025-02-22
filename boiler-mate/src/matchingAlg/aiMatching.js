import { pipeline } from "@xenova/transformers";

// Load the model once and reuse it
let embedder = null;

/**
 * Loads the Sentence-BERT model for text embedding.
 */
const loadModel = async () => {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
};

/**
 * Computes cosine similarity between two short-answer texts.
 * @param {string} text1 - First user's response.
 * @param {string} text2 - Second user's response.
 * @returns {number} Similarity score (1-10).
 */
export const aiTextSimilarity = async (text1, text2) => {
  await loadModel(); // Ensure model is loaded

  if (!text1 || !text2) return 0; // No similarity if one is empty

  try {
    const [embedding1, embedding2] = await Promise.all([
      embedder(text1),
      embedder(text2),
    ]);

    // Compute Cosine Similarity
    const dotProduct = embedding1.reduce(
      (sum, val, i) => sum + val * embedding2[i],
      0
    );
    const magnitude1 = Math.sqrt(
      embedding1.reduce((sum, val) => sum + val ** 2, 0)
    );
    const magnitude2 = Math.sqrt(
      embedding2.reduce((sum, val) => sum + val ** 2, 0)
    );
    const similarity = dotProduct / (magnitude1 * magnitude2);

    // Convert similarity (0-1) to 1-10 scale
    return Math.round(similarity * 10);
  } catch (error) {
    console.error("❌ AI Similarity Error:", error);
    return 0; // Default to lowest similarity on failure
  }
};
