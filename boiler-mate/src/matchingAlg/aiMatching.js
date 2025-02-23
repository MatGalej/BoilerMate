// npm i @xenova/transformers
import { pipeline, dot, env} from '@xenova/transformers';

export async function aiMatching(text1, text2) {
  env.allowLocalModels = false;
  env.useBrowserCache = false;

  // Create feature extraction pipeline
  const extractor = await pipeline('feature-extraction', 'Alibaba-NLP/gte-base-en-v1.5', {
      quantized: false, // Comment out this line to use the quantized version
  });

  // Generate sentence embeddings
  const sentences = [
    text1,
    text2
  ]
  const output = await extractor(sentences, { normalize: true, pooling: 'cls' });

  // Compute similarity scores
  const [source_embeddings, ...document_embeddings ] = output.tolist();
  const similarities = document_embeddings.map(x => 100 * dot(source_embeddings, x));
  console.log(similarities); // [34.504930869007296, 64.03973265120138, 19.520042686034362]
}