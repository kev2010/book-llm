import os
import json
import voyageai
import json
from dotenv import load_dotenv

load_dotenv()

def create_embeddings(chunks):
    """
    Creates embeddings for the given chunks using VoyageAI's API.
    NOTE: As of 1/5/25: "The maximum length of the list [chunks] is 128. The total number of tokens in the list is at most... 120K for voyage-3-large"
    """
    client = voyageai.Client(api_key=os.getenv("VOYAGE_API_KEY"))
    embeddings = client.embed(chunks, model="voyage-3-large", input_type="query")

    return embeddings # A EmbeddingsObject

if __name__ == "__main__":
    with open("chunks/all_chunks.json", "r") as file:
        chunks = json.load(file)

    print(f"Loaded {len(chunks)} chunks")

    # Be aware of VoyageAI's limit on chunks length and total token count
    # Process in batches of 50 chunks at a time
    all_embeddings = []
    for i in range(0, len(chunks), 50):
        batch = chunks[i:i+50]
        embeddings = create_embeddings(batch)
        print(f"Created embeddings for batch {i//50 + 1} of {len(chunks)//50}")
        all_embeddings.extend(embeddings.embeddings)

    # Save all embeddings to a file
    os.makedirs("embeddings", exist_ok=True)
    with open("embeddings/all_embeddings.json", "w") as file:
        json.dump(all_embeddings, file)

    print(f"Saved {len(all_embeddings)} embeddings to all_embeddings.json")
