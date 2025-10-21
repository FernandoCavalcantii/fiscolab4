"""
RAG Pipeline Loader - Manages a single instance of the RAGPipeline
"""

import sys
import os
import logging
import shutil
import threading
import time
from typing import Optional

# Add the chatbot module to the Python path
chatbot_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'chatbot', 'app')
sys.path.append(chatbot_path)

# Set the working directory to the project root for RAGPipeline
project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
os.chdir(project_root)

logger = logging.getLogger(__name__)

# Global variable to store the unique instance
_rag_pipeline_instance = None
_initialization_attempted = False
_initialization_thread = None
_initialization_in_progress = False

def _initialize_pipeline_async():
    """Initialize pipeline in background thread"""
    global _rag_pipeline_instance, _initialization_attempted, _initialization_in_progress
    
    try:
        logger.info("Starting async RAG pipeline initialization...")
        _initialization_in_progress = True
        
        # Import RAGPipeline
        from rag_pipeline.pipeline import RAGPipeline
        
        # Default settings
        documents_path = "/app/chatbot/app/data/sefaz_documents"
        
        # Check if the path exists
        if not os.path.exists(documents_path):
            documents_path = "chatbot/app/data/sefaz_documents/"
            if not os.path.exists(documents_path):
                logger.error(f"Documents path not found: {documents_path}")
                return
        
        # Check if vector store already exists
        persist_directory = os.path.join(project_root, "data", "chroma_db")
        force_rebuild = not os.path.exists(persist_directory)
        
        # Create the instance with optimized parameters
        _rag_pipeline_instance = RAGPipeline(
            documents_path=documents_path,
            persist_directory=persist_directory,
            chunk_size=300,  # Even smaller chunks
            chunk_overlap=50   # Smaller overlap
        )
        
        # Try to load existing knowledge base first
        if not force_rebuild:
            logger.info("Attempting to load existing knowledge base...")
            success = _rag_pipeline_instance.load_knowledge_base()
            if success:
                logger.info("✅ RAGPipeline loaded existing knowledge base successfully")
                return
        
        # If loading failed, build new knowledge base
        logger.info("Building new knowledge base...")
        success = _rag_pipeline_instance.build_knowledge_base(force_rebuild=force_rebuild)
        
        if success:
            logger.info("✅ RAGPipeline initialized successfully")
        else:
            logger.warning("⚠️ RAGPipeline could not be initialized completely")
            _rag_pipeline_instance = None
            
    except Exception as e:
        logger.error(f"❌ Error in async RAG pipeline initialization: {e}")
        _rag_pipeline_instance = None
        _initialization_attempted = True
    finally:
        _initialization_in_progress = False

def get_rag_pipeline():
    """
    Returns the unique instance of the RAGPipeline.
    If it doesn't exist, starts async initialization.
    """
    global _rag_pipeline_instance, _initialization_attempted, _initialization_thread, _initialization_in_progress
    
    # If initialization already failed, return None to avoid repeated attempts
    if _initialization_attempted and _rag_pipeline_instance is None:
        logger.warning("RAG pipeline initialization previously failed, skipping retry")
        return None
    
    # If pipeline is ready, return it
    if _rag_pipeline_instance is not None:
        return _rag_pipeline_instance
    
    # If initialization is in progress, return None (will use fallback)
    if _initialization_in_progress:
        logger.info("RAG pipeline initialization in progress, using fallback")
        return None
    
    # Start async initialization if not already started
    if _initialization_thread is None or not _initialization_thread.is_alive():
        logger.info("Starting RAG pipeline initialization in background...")
        _initialization_thread = threading.Thread(target=_initialize_pipeline_async, daemon=True)
        _initialization_thread.start()
    
    # Return None for now, will be available later
    return None

def is_initialized():
    """Check if the RAGPipeline is initialized"""
    return _rag_pipeline_instance is not None

def reset_pipeline():
    """Reset the instance (useful for tests)"""
    global _rag_pipeline_instance, _initialization_attempted, _initialization_thread, _initialization_in_progress
    _rag_pipeline_instance = None
    _initialization_attempted = False
    _initialization_thread = None
    _initialization_in_progress = False