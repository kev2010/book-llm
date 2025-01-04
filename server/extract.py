"""
Extracts text from a PDF file and saves it to a text file (For RAG)
"""
import pdfplumber

def extract_text_from_pdf(pdf_path):
    text = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text.append(page.extract_text())
    return "\n".join(text)

pdf_text = extract_text_from_pdf("born.pdf")

# Basic information
print(f"Text length: {len(pdf_text)} characters")
print(f"Number of words: {len(pdf_text.split())}")
print(f"Number of lines: {len(pdf_text.splitlines())}")

# Preview content
print("\nFirst 200 characters:")
print(pdf_text[:200])

# Save to text file
with open("born.txt", "w") as file:
    file.write(pdf_text)

print("\nText has been saved to born.txt")

