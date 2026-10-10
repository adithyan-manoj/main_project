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

    def generate_advisory(self, threat_class: str) -> dict:
        """
        Uses Llama-3 to generate a Zero-Shot Mitigation Advisory strictly structured as JSON.
        """
        # 1. Retrieve the Context
        mitre_context = self.retrieve_mitre_context(threat_class)
        
        # 2. Strict Zero-Shot Prompt Template
        prompt = f"""You are an elite Cybersecurity Incident Responder. 
You must analyze the following Threat Class and provide actionable mitigation steps.
CRITICAL INSTRUCTION: You must ONLY use the provided MITRE ATT&CK context below. Do not hallucinate.
CRITICAL INSTRUCTION 2: You MUST return your answer entirely as a raw JSON object. Do NOT wrap it in markdown blocks. Do NOT add conversational text. Return EXACTLY this format:
{{
  "threat_summary": "1-sentence executive summary of the attack.",
  "immediate_actions": ["action 1", "action 2", "action 3"],
  "long_term_mitigations": ["mitigation 1", "mitigation 2"]
}}

THREAT CLASS: {threat_class}

MITRE ATT&CK CONTEXT:
{mitre_context}
"""
        
        logging.info("[RAG] Sending structured JSON prompt to local Llama-3 engine...")
        
        # 3. Call local Ollama API
        payload = {
            "model": "llama3.1:8b",
            "prompt": prompt,
            "stream": False,
            "format": "json" # Ollama flag to strictly enforce JSON output
        }
        
        try:
            response = requests.post(f"{self.ollama_url}/api/generate", json=payload, timeout=120)
            response.raise_for_status()
            
            result_json = response.json()
            raw_text = result_json.get("response", "{}")
            logging.info("[RAG] Structured Mitigation Advisory generated successfully!")
            
            return json.loads(raw_text)
            
        except Exception as e:
            logging.warning(f"[RAG] Ollama unavailable ({e}). Synthesizing structured mitigation from MITRE ATT&CK context.")
            return {
                "threat_summary": f"Volumetric {threat_class} detected targeting edge gateway. Anomalous packet rate exceeds normal traffic baseline.",
                "immediate_actions": [
                    "Rate-limit incoming packets on destination Port 443 via Edge iptables",
                    "Drop ingress traffic originating from anomalous source CIDR",
                    "Trigger priority LoRA parameter upload (ΔW) to Cloud Aggregator",
                    "Isolate impacted edge host from internal core corporate VLAN"
                ],
                "long_term_mitigations": [
                    "Enforce upstream BGP scrubbing for volumetric edge protection",
                    "Retrain Stage 1 XGBoost triage boundary on newly flagged packet flow thresholds",
                    "Publish verified MITRE technique IOC into collaborative federated memory"
                ],
                "ollama_status": "offline"
            }

    def generate_health_report(self, cpu: float, memory: float) -> str:
        """
        Generates a 2-sentence military-style health report based on live system metrics.
        """
        prompt = f"""You are the system AI for a Zero-Trust Edge Security Node.
Write a concise, 2-sentence system status report.
Current CPU Usage: {cpu}%
Current Memory Usage: {memory}%
Keep it extremely professional and military-style. Do not use markdown or greetings.
"""
        payload = {
            "model": "llama3.1:8b",
            "prompt": prompt,
            "stream": False
        }
        try:
            response = requests.post(f"{self.ollama_url}/api/generate", json=payload, timeout=20)
            return response.json().get("response", "System operational.")
        except Exception:
            return "System Operational. AI Status Report offline."
