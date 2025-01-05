import os
import json
import voyageai
import json
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

def create_embeddings(chunks):
    """
    Creates embeddings for the given chunks using VoyageAI's API.
    NOTE: As of 1/5/25: "The maximum length of the list [chunks] is 128. The total number of tokens in the list is at most... 120K for voyage-3-large"
    """
    client = voyageai.Client(api_key=os.getenv("VOYAGE_API_KEY"))
    embeddings = client.embed(chunks, model="voyage-3-large", input_type="query")

    return embeddings # An EmbeddingsObject

def create_pinecone_index():
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

    # Create a serverless index
    index_name = "perplexity-take-home-index"

    if not pc.has_index(index_name):
        pc.create_index(
            name=index_name,
            dimension=1024, # VoyageAI 3 large model output dimension
            metric="cosine",
            spec=ServerlessSpec(
                cloud='aws', 
                region='us-east-1'
            ) 
        )

def upsert_embeddings_to_pinecone(chunks, embeddings):
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index = pc.Index(host=os.getenv("PINECONE_INDEX_HOST"))

    # Prepare the records for upsert
    records = []
    for i, embedding in enumerate(embeddings):
        records.append({
            "id": str(i),
            "values": embedding,
            "metadata": {'text': chunks[i]}
        })

    # Upsert in batches to avoid rate limits
    index.upsert(
        vectors=records,
        namespace="born-of-this-land"
    )


if __name__ == "__main__":
    with open("chunks/all_chunks.json", "r") as file:
        chunks = json.load(file)

    print(f"Loaded {len(chunks)} chunks")
# 
#     # Be aware of VoyageAI's limit on chunks length and total token count
#     # Process in batches of 50 chunks at a time
#     all_embeddings = []
#     for i in range(0, len(chunks), 50):
#         batch = chunks[i:i+50]
#         embeddings = create_embeddings(batch)
#         print(f"Created embeddings for batch {i//50 + 1} of {len(chunks)//50}")
#         all_embeddings.extend(embeddings.embeddings)
# 
#     # Save all embeddings to a file
#     os.makedirs("embeddings", exist_ok=True)
#     with open("embeddings/all_embeddings.json", "w") as file:
#         json.dump(all_embeddings, file)
# 
#     print(f"Saved {len(all_embeddings)} embeddings to all_embeddings.json")

    # create_pinecone_index()

    with open("embeddings/all_embeddings.json", "r") as file:
        embeddings = json.load(file)
    
    print(f"Loaded {len(embeddings)} embeddings")

    upsert_embeddings_to_pinecone(chunks, embeddings)