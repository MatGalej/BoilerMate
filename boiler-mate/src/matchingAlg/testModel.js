import { pipeline } from "@xenova/transformers";

async function testModel() {
    try {
        console.log("🚀 Loading AI Model...");
        const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
        console.log("✅ Model Loaded!");
    } catch (error) {
        console.error("❌ Model Loading Error:", error);
    }
}

testModel();
