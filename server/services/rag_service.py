"""
Service for returning relevant chunks from the RAG database. See "rag_chunker.py" and "rag_embeddings.py" for how we generated and stored embeddings
"""
import os
import json
from typing import List, Dict, Any, AsyncGenerator
from openai import OpenAI, AsyncOpenAI, OpenAIError
from dotenv import load_dotenv
import voyageai
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

class RAGService:
    def __init__(self):
        self.embeddings_model = "voyage-3-large"
        self.embeddings_client = voyageai.Client(api_key=os.getenv("VOYAGE_API_KEY"))
        self.pinecone_client = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.pinecone_index = self.pinecone_client.Index(host=os.getenv("PINECONE_INDEX_HOST"))
    
    def get_relevant_chunks(self, query: str, top_embedding_k: int = 10) -> List[str]:
        relevant_embedding_chunks = self.get_relevant_embedding_chunks(query, top_embedding_k)
        # print(f"Relevant embedding chunks: {relevant_embedding_chunks[:5]}")

        # Get the text from the metadata
        relevant_embedding_chunks_text = [chunk.metadata["text"] for chunk in relevant_embedding_chunks]
        
        return relevant_embedding_chunks_text

    def get_relevant_embedding_chunks(self, query: str, top_embedding_k: int = 15) -> List[str]:
        """
        Get the top_embedding_k most relevant chunks from the RAG database for a given query.

        Returns:
        {'matches': [{'id': 'vec2',
              'metadata': {'text': 'The tech company Apple is known for its '
                                   'innovative products like the iPhone.'},
              'score': 0.8727808,
              'sparse_values': {'indices': [], 'values': []},
              'values': []},
             {'id': 'vec4',
              'metadata': {'text': 'Apple Inc. has revolutionized the tech '
                                   'industry with its sleek designs and '
                                   'user-friendly interfaces.'},
              'score': 0.8526099,
              'sparse_values': {'indices': [], 'values': []},
              'values': []},
             {'id': 'vec6',
              'metadata': {'text': 'Apple Computer Company was founded on '
                                   'April 1, 1976, by Steve Jobs, Steve '
                                   'Wozniak, and Ronald Wayne as a '
                                   'partnership.'},
              'score': 0.8499719,
              'sparse_values': {'indices': [], 'values': []},
              'values': []}],
        'namespace': 'example-namespace',
        'usage': {'read_units': 6}}
        
        """
        # Create embedding for the query
        query_embedding = self.embeddings_client.embed(
            [query],  # Wrap single query in list
            model=self.embeddings_model,
            input_type="query"
        ).embeddings[0]  # Get first (and only) embedding

        # Search the index for the three most similar vectors
        results = self.pinecone_index.query(
            namespace="born-of-this-land",
            vector=query_embedding,
            top_k=top_embedding_k,
            include_values=False,
            include_metadata=True
        )

        return results.matches
    
    def get_relevant_bm25_chunks(self, query: str, top_bm25_k: int = 10) -> List[str]:
        """
        Get the top_bm25_k most relevant chunks from the RAG database for a given query.
        """
        pass