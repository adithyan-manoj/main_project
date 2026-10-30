import logging
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

try:
    from edge.correlator import EventCorrelator
    from edge.rag_engine import RAGEngine
except ImportError:
    from correlator import EventCorrelator
    from rag_engine import RAGEngine

# Disable noisy logs for the test script
logging.getLogger("chromadb").setLevel(logging.ERROR)

def run_tests():
    print("\n=======================================================")
    print("🧪 STAGE 2: TESTING THE CORRELATOR TRANSLATION 🧪")
    print("=======================================================\n")
    
    # 1. Mock the array/dict that XGBoost outputs
    mock_xgboost_packet = {
        "Dst Port": 443,
        "Protocol": "TCP",
        "Tot Fwd Pkts": 4500,
        "Tot Bwd Pkts": 2,
        "Flow Duration": 12000
    }
    
    # 2. Run the translation logic
    correlator = EventCorrelator()
    translated_text = correlator.translate_to_text(mock_xgboost_packet)
    print(f"XGBoost Raw Input: {mock_xgboost_packet}")
    print(f"SecureBERT NLP Translation: \n'{translated_text}'\n")

    print("\n=======================================================")
    print("🧪 STAGE 4: TESTING LLAMA-3 RAG ADVISORY 🧪")
    print("=======================================================\n")
    
    # 3. Mock the output that SecureBERT generates
    mock_threat_class = "T1498: Network Denial of Service"
    print(f"Simulating SecureBERT Output: '{mock_threat_class}'")
    print("\n[RAG] Retrieving MITRE Context & Querying local Llama-3...")
    print("[RAG] (This will take a few seconds depending on your Mac's M-chip speed)...\n")
    
    try:
        # 4. Run the RAG generation
        rag = RAGEngine()
        advisory = rag.generate_advisory(mock_threat_class)
        print("✅ FINAL LLAMA-3 MITIGATION ADVISORY:\n")
        print(advisory)
        print("\n=======================================================\n")
    except Exception as e:
        print(f"\n❌ Error during RAG execution: {e}")
        print("Did you make sure Ollama is running in another terminal window? (`ollama run llama3.1:8b`)")

if __name__ == "__main__":
    run_tests()
