"""
Extraction Module - Responsável por carregar documentos de diferentes fontes
"""

from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
import os
from typing import List, Dict, Any
import logging

# OCR imports
from pdf2image import convert_from_path
import pytesseract

logger = logging.getLogger(__name__)

class DocumentExtractor:
    """Class to extract documents"""
    
    def __init__(self, base_directory: str):
        """
        Initialize document extractor
        
        Args:
            base_directory (str): Directory where the documents are located
        """
        self.base_directory = base_directory
    
    def _ocr_pdf(self, file_path: str) -> List[Document]:
        """
        Perform OCR on a PDF file and return a list of page Documents.
        Uses Tesseract with Portuguese language if available.
        Optimized for memory usage.
        """
        try:
            logger.info(f"Running OCR fallback for: {file_path}")
            # Reduced DPI to save memory
            images = convert_from_path(file_path, dpi=150, first_page=1, last_page=10)  # Limit to first 10 pages
            ocr_docs: List[Document] = []
            for page_index, image in enumerate(images):
                # Process image in smaller chunks to save memory
                text = pytesseract.image_to_string(image, lang="por")
                page_doc = Document(
                    page_content=text or "",
                    metadata={
                        'source': file_path,
                        'file_name': os.path.basename(file_path),
                        'directory': os.path.dirname(file_path),
                        'document_type': 'pdf',
                        'extraction': 'ocr',
                        'page_index': page_index
                    }
                )
                ocr_docs.append(page_doc)
                # Clear image from memory
                del image
            logger.info(f"OCR produced {len(ocr_docs)} pages for {file_path}")
            return ocr_docs
        except Exception as e:
            logger.error(f"OCR fallback failed for {file_path}: {e}")
            return []
        
    def extract_pdfs(self) -> List[Document]:
        """
        Extract PDFs from base_directory and subdirectories with memory optimization
        
        Returns:
            List[Document]: List of extracted documents
        """
        documents = []
        max_files = 5  # Limit number of files to process for memory optimization
        processed_files = 0
        
        if not os.path.isdir(self.base_directory):
            logger.error(f"Diretório base não encontrado: {self.base_directory}")
            return documents
            
        logger.info(f"Iniciando extração de PDFs em: {self.base_directory} (limitado a {max_files} arquivos)")
        
        # Recursively traverse the base directory
        for root, dirs, files in os.walk(self.base_directory):
            if processed_files >= max_files:
                break
                
            for file_name in files:
                if processed_files >= max_files:
                    break
                    
                if file_name.lower().endswith('.pdf'):
                    file_path = os.path.join(root, file_name)
                    try:
                        logger.info(f"Processando PDF ({processed_files + 1}/{max_files}): {file_path}")
                        
                        # Load the PDF document
                        loader = PyPDFLoader(file_path)
                        pdf_documents = loader.load()
                        
                        # Limit pages per document to save memory
                        if len(pdf_documents) > 20:
                            pdf_documents = pdf_documents[:20]  # Limit to first 20 pages
                            logger.info(f"Limited to first 20 pages of {file_name}")
                        
                        # Add additional metadata
                        for doc in pdf_documents:
                            doc.metadata.update({
                                'source': file_path,
                                'file_name': file_name,
                                'directory': root,
                                'document_type': 'pdf',
                                'extraction': 'text'
                            })
                        
                        # If text extraction produced too little content, try OCR fallback
                        total_chars = sum(len(d.page_content.strip()) for d in pdf_documents)
                        if total_chars < 50:  # heuristic threshold
                            logger.warning(f"Low text content detected ({total_chars} chars). Attempting OCR for: {file_name}")
                            ocr_docs = self._ocr_pdf(file_path)
                            if ocr_docs:
                                pdf_documents = ocr_docs
                        
                        documents.extend(pdf_documents)
                        processed_files += 1
                        logger.info(f"  - {len(pdf_documents)} pages extracted from {file_name}")
                        
                    except Exception as e:
                        logger.error(f"Error while processing file: {file_path}: {e}")
                        continue
        
        logger.info(f"Total of {len(documents)} documents extracted from {processed_files} files")
        return documents
    
    def extract_documents(self) -> List[Document]:
        """
        Main method to extract all supported documents
        
        Returns:
            List[Document]: List of all extracted documents
        """
        documents = []
        
        # Extract PDFs
        pdf_documents = self.extract_pdfs()
        documents.extend(pdf_documents)
        
        # Add other types of documents here, like .txt, .docx, etc.
        
        return documents

# Example usage
if __name__ == "__main__":
    import logging
    logging.basicConfig(level=logging.INFO)
    
    test_dir = "chatbot/app/data/sefaz_documents"
    extractor = DocumentExtractor(test_dir)
    documents = extractor.extract_documents()
    
    print(f"Documents extracted: {len(documents)}")
    if documents:
        print(f"First document: {documents[0].page_content[:200]}...")
        print(f"Metadata: {documents[0].metadata}") 