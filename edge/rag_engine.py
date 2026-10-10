import os
import requests
import json
import logging
import chromadb
from chromadb.utils import embedding_functions

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class RAGEngine:
    """
    Stage 4: The Reasoning Engine.
    Retrieves context from the MITRE ChromaDB and generates constrained Llama-3 advisories.
    """
    def __init__(self, ollama_url="http://localhost:11434"):
        self.ollama_url = ollama_url
        
        # Dynamically locate the local ChromaDB
        data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Data', 'MITRE_ATTACK'))
        db_path = os.path.join(data_dir, 'chroma_db')
        
        if not os.path.exists(db_path):
            logging.error(f"[RAG] ChromaDB not found at {db_path}! Run Notebook 02 first.")
            
        self.chroma_client = chromadb.PersistentClient(path=db_path)
        self.ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
        
        try:
            self.collection = self.chroma_client.get_collection(
                name="mitre_enterprise",
                embedding_function=self.ef
            )
        except Exception as e:
            logging.error(f"[RAG] Failed to load collection: {e}")

    def retrieve_mitre_context(self, threat_class: str) -> str:
        """
        Queries ChromaDB for the closest MITRE ATT&CK mitigation context.
        """
        logging.info(f"[RAG] Querying MITRE vector database for: {threat_class}")
        results = self.collection.query(
            query_texts=[threat_class],
            n_results=3 # Get top 3 relevant techniques
        )
        
        # Combine the retrieved descriptions into a single context block
        context_chunks = results['documents'][0]
        full_context = "\n\n".join(context_chunks)
        logging.info(f"[RAG] Successfully retrieved {len(context_chunks)} historical context chunks.")
        return full_context

    def generate_advisory(self, threat_class: str) -> str:
        """
        Uses Llama-3 to generate a Zero-Shot Mitigation Advisory strictly based on MITRE data.
        """
        # 1. Retrieve the Context
        mitre_context = self.retrieve_mitre_context(threat_class)
        
        # 2. Strict Zero-Shot Prompt Template
        prompt = f"""You are an elite Cybersecurity Incident Responder. 
You must analyze the following Threat Class and provide actionable mitigation steps.
CRITICAL INSTRUCTION: You must ONLY use the provided MITRE ATT&CK context below. Do not hallucinate outside information.

THREAT CLASS: {threat_class}

MITRE ATT&CK CONTEXT:
{mitre_context}

Provide a short, extremely concise Incident Response Advisory. Format the output with clear bullet points.
"""
        
        logging.info("[RAG] Sending constrained prompt to local Llama-3 engine...")
        
        # 3. Call local Ollama API
        payload = {
            "model": "llama3.1:8b", # The exact model the user downloaded
            "prompt": prompt,
            "stream": False
        }
        
        try:
            # We add a longer timeout since LLM generation takes a few seconds
            response = requests.post(f"{self.ollama_url}/api/generate", json=payload, timeout=120)
            response.raise_for_status()
            
            result_json = response.json()
            advisory = result_json.get("response", "Error: No response generated.")
            logging.info("[RAG] Mitigation Advisory generated successfully!")
            return advisory
            
        except requests.exceptions.RequestException as e:
            logging.error(f"[RAG] Failed to connect to Ollama. Is the server running? Error: {e}")
            return f"Error: Unable to reach Local Llama-3 Engine. Make sure 'ollama run llama3.1:8b' is running. Details: {str(e)}"
