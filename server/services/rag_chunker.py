"""
Functions for the full process for creating chunks for RAG:

1. Extracts text from source (PDF, web page, etc.) to create a text file
2. For context retrieval, we create documents of size ~8k tokens and chunk it into 800 token chunks
3. Then for each chunk, we prepend ~100 tokens of contextualization (prompting LLM with the chunk and document it belongs to)
4. We save the chunks
"""
import os
import pdfplumber
import json
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()

def extract_text_from_pdf(pdf_path):
    """
    Extracts text from a PDF file and returns it as a string
    """
    text = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text.append(page.extract_text())
    return "\n".join(text)

def create_documents(text, document_size=8000):
    """
    Creates documents of roughly size "document_size" tokens
    """
    anthropic_client = Anthropic(
        api_key=os.getenv("ANTHROPIC_API_KEY")
    )
    
    # Get token count for the text
    response = anthropic_client.messages.count_tokens(
        model="claude-3-5-sonnet-20241022",
        messages=[{
            "role": "user",
            "content": text
        }]
    )
    tokens = response.input_tokens
    print(f"Token count for text: {tokens}")
    
    # Create documents based on token counts
    documents = []
    # TODO: Need to implement proper token-based splitting since Anthropic's SDK currently only provides token counting
    # For now, we can approximate using character count and adjust based on token ratio
    chars_per_token = len(text) / tokens
    print(f"Chars per token: {chars_per_token}")
    estimated_chars_per_document = int(document_size * chars_per_token)
    print(f"Estimated characters per document: {estimated_chars_per_document}")
    
    for i in range(0, len(text), estimated_chars_per_document):
        document = text[i:i + estimated_chars_per_document]
        documents.append(document)
    
    return documents

def contextualize_chunk_in_document(chunk, document):
    """
    Prepends ~100 tokens of contextualization to the chunk
    """
    anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    DOCUMENT_CONTEXT_PROMPT = """
    <document>
    {doc_content}
    </document>
    """

    CHUNK_CONTEXT_PROMPT = """
    Here is the chunk we want to situate within the whole document
    <chunk>
    {chunk_content}
    </chunk>

    Please give a short succinct context to situate this chunk within the overall document for the purposes of improving search retrieval of the chunk.
    Answer only with the succinct context and nothing else.
    """

    response = anthropic_client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        temperature=0.0,
        messages=[
            {
                "role": "user", 
                "content": [
                    {
                        "type": "text",
                        "text": DOCUMENT_CONTEXT_PROMPT.format(doc_content=document),
                    },
                    {
                        "type": "text",
                        "text": CHUNK_CONTEXT_PROMPT.format(chunk_content=chunk),
                    },
                ]
            },
        ]
    )
    
    context = response.content[0].text
    return f"Context: {context}\n\nChunk: {chunk}"

def create_contextualized_chunks(documents, chunk_size=800, estimated_chars_per_token=4.0525):
    """
    Creates contextualized chunks of roughly size "chunk_size" tokens
    """
    estimated_chars_per_chunk = int(chunk_size * estimated_chars_per_token)
    chunks = []
    for document in documents:
        print(f"Processing DOCUMENT {documents.index(document) + 1} of {len(documents)}")
        chunk_count = 0
        for i in range(0, len(document), estimated_chars_per_chunk):
            print(f"Processing chunk {chunk_count + 1} of {len(document) // estimated_chars_per_chunk + 1}")
            chunk = document[i:i + estimated_chars_per_chunk]
            contextualized_chunk = contextualize_chunk_in_document(chunk, document)
            chunks.append(contextualized_chunk)
            chunk_count += 1
    return chunks

if __name__ == "__main__":
#     pdf_text = extract_text_from_pdf("born.pdf")
# 
#     # Basic information
#     print(f"Text length: {len(pdf_text)} characters")
#     print(f"Number of words: {len(pdf_text.split())}")
#     print(f"Number of lines: {len(pdf_text.splitlines())}")
# 
#     # Preview content
#     print("\nFirst 200 characters:")
#     print(pdf_text[:200])
# 
#     # Save to text file
#     with open("born.txt", "w") as file:
#         file.write(pdf_text)
# 
#     print("\nText has been saved to born.txt")

#     # Load the text file and create documents
#     with open("born.txt", "r") as file:
#         text = file.read()
# 
#     documents = create_documents(text)
#     print(f"Created {len(documents)} documents")
# 
#     # Create documents directory if it doesn't exist
#     os.makedirs("documents", exist_ok=True)
# 
#     # Save each document to documents folder
#     for i, document in enumerate(documents):
#         with open(f"documents/document_{i}.txt", "w") as file:
#             file.write(document)
# 
#     print("Documents have been saved to documents folder")
# 
#     # Token count for text: 149315
#     # Chars per token: 4.052472959849982
#     # Estimated characters per document: 32419
#     # Created 19 documents
#     # Documents have been saved to documents folder

    # Load all documents from the documents folder
    documents = []
    document_files = sorted([f for f in os.listdir("documents") if f.startswith("document_")])
    
    for doc_file in document_files:
        with open(os.path.join("documents", doc_file), "r") as file:
            documents.append(file.read())
    
    print(f"Loaded {len(documents)} documents")
    
    # Create contextualized chunks
    contextualized_chunks = create_contextualized_chunks(documents)
    
    # Save all chunks to a single JSON file
    os.makedirs("chunks", exist_ok=True)
    with open("chunks/all_chunks.json", "w") as file:
        json.dump(contextualized_chunks, file, indent=2)
    
    print(f"Saved {len(contextualized_chunks)} contextualized chunks to all_chunks.json")

