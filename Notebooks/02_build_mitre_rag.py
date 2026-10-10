import os
import json
import requests
import chromadb
from chromadb.utils import embedding_functions

def build_mitre_vector_db():
    print("--- STEP 1: DOWNLOADING MITRE ATT&CK STIX JSON ---")
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Data', 'MITRE_ATTACK'))
    json_path = os.path.join(data_dir, 'enterprise-attack.json')
    
    # Download if it doesn't exist
    if not os.path.exists(json_path):
        print("Downloading official MITRE framework...")
        url = "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json"
        response = requests.get(url)
        with open(json_path, 'wb') as f:
            f.write(response.content)
        print("Download complete!")
    else:
        print("MITRE framework already downloaded.")

    print("\n--- STEP 2: PARSING THREAT INTELLIGENCE ---")
    with open(json_path, 'r') as f:
        mitre_data = json.load(f)

    # Extract all Attack Patterns (Techniques)
    techniques = []
    for obj in mitre_data.get("objects", []):
        if obj.get("type") == "attack-pattern":
            # Extract name, description, and ID
            name = obj.get("name", "Unknown")
            desc = obj.get("description", "No description available.")
            
            # Find the external ID (e.g., T1548)
            mitre_id = "Unknown"
            for ext_ref in obj.get("external_references", []):
                if ext_ref.get("source_name") == "mitre-attack":
                    mitre_id = ext_ref.get("external_id")
                    break
            
            techniques.append({
                "id": mitre_id,
                "name": name,
                "description": desc
            })
    
    print(f"Successfully extracted {len(techniques)} MITRE ATT&CK Techniques.")

    print("\n--- STEP 3: INITIALIZING ChromaDB VECTOR STORE ---")
    db_path = os.path.join(data_dir, 'chroma_db')
    
    # Create persistent local database
    chroma_client = chromadb.PersistentClient(path=db_path)
    
    # Use standard sentence-transformers for fast edge embedding
    sentence_transformer_ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
    
    # Create or get the collection
    collection = chroma_client.get_or_create_collection(
        name="mitre_enterprise",
        embedding_function=sentence_transformer_ef
    )
    
    print("\n--- STEP 4: EMBEDDING INTO DATABASE ---")
    print("Embedding techniques... (This will take a minute or two on your Mac)")
    
    # Prepare batch data for Chroma
    ids = [t['id'] for t in techniques if t['id'] != "Unknown"]
    documents = [f"{t['name']}: {t['description']}" for t in techniques if t['id'] != "Unknown"]
    metadatas = [{"name": t['name'], "id": t['id']} for t in techniques if t['id'] != "Unknown"]
    
    # Insert in batches to prevent memory spikes
    batch_size = 100
    for i in range(0, len(ids), batch_size):
        collection.upsert(
            documents=documents[i:i+batch_size],
            metadatas=metadatas[i:i+batch_size],
            ids=ids[i:i+batch_size]
        )
        print(f"Processed {min(i+batch_size, len(ids))}/{len(ids)} techniques...")

    print("\nSUCCESS: MITRE ATT&CK RAG Database built successfully!")
    print(f"Database saved to: {db_path}")

if __name__ == "__main__":
    build_mitre_vector_db()
