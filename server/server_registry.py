import os
import sqlite3
import logging
import threading
from datetime import datetime
from typing import Dict, Any, List, Optional

try:
    from server.config import DB_PATH, DATA_DIR
except ImportError:
    from config import DB_PATH, DATA_DIR

logging.basicConfig(level=logging.INFO, format="%(asctime)s [SERVER REGISTRY] %(message)s")


class ServerRegistry:
    """
    Central Server Database & State Tracker for FedThreat.
    Thread-safe SQLite store using re-entrant locking.
    """
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._lock = threading.RLock()
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False, timeout=10.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Initializes database schema with WAL mode for fast concurrent operations."""
        with self._lock:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("PRAGMA journal_mode=WAL;")

                # 1. Clients Table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS clients (
                        client_id TEXT PRIMARY KEY,
                        org_name TEXT NOT NULL,
                        ip_address TEXT,
                        first_seen TEXT NOT NULL,
                        last_active TEXT NOT NULL,
                        total_rounds_participated INTEGER DEFAULT 0,
                        status TEXT DEFAULT 'active'
                    );
                """)

                # 2. Federated Rounds Table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS rounds (
                        round_num INTEGER PRIMARY KEY,
                        timestamp TEXT NOT NULL,
                        num_clients_participated INTEGER DEFAULT 0,
                        aggregation_duration_ms REAL DEFAULT 0.0,
                        global_loss REAL DEFAULT 0.0,
                        status TEXT DEFAULT 'pending'
                    );
                """)

                # 3. Client Contributions Table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS contributions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        round_num INTEGER NOT NULL,
                        client_id TEXT NOT NULL,
                        num_samples INTEGER DEFAULT 0,
                        weight_norm_delta REAL DEFAULT 0.0,
                        timestamp TEXT NOT NULL,
                        FOREIGN KEY (client_id) REFERENCES clients(client_id)
                    );
                """)

                # 4. Server Audit Logs Table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS server_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT NOT NULL,
                        log_level TEXT DEFAULT 'INFO',
                        event_type TEXT NOT NULL,
                        message TEXT NOT NULL
                    );
                """)
                conn.commit()
                logging.info(f"✅ Server Registry initialized at {self.db_path}")

    def register_or_update_client(self, client_id: str, org_name: str = "Unknown Org", ip_address: str = "127.0.0.1") -> Dict[str, Any]:
        """Registers a newly discovered client or updates last active timestamp."""
        now = datetime.utcnow().isoformat()
        is_new = False
        with self._lock:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT client_id FROM clients WHERE client_id = ?", (client_id,))
                row = cursor.fetchone()

                if row is None:
                    is_new = True
                    cursor.execute("""
                        INSERT INTO clients (client_id, org_name, ip_address, first_seen, last_active, total_rounds_participated, status)
                        VALUES (?, ?, ?, ?, ?, 0, 'active')
                    """, (client_id, org_name, ip_address, now, now))
                else:
                    cursor.execute("""
                        UPDATE clients SET last_active = ?, status = 'active', ip_address = ?
                        WHERE client_id = ?
                    """, (now, ip_address, client_id))
                conn.commit()

        # Log event after releasing the client table lock
        if is_new:
            self.log_event("CLIENT_REGISTERED", f"New client '{org_name}' ({client_id}) connected from {ip_address}")
        return {"client_id": client_id, "status": "active", "updated_at": now}

    def record_contribution(self, round_num: int, client_id: str, num_samples: int, weight_norm_delta: float = 0.0):
        """Records telemetry sample count and parameter update magnitude from a client."""
        now = datetime.utcnow().isoformat()
        with self._lock:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO contributions (round_num, client_id, num_samples, weight_norm_delta, timestamp)
                    VALUES (?, ?, ?, ?, ?)
                """, (round_num, client_id, num_samples, weight_norm_delta, now))

                cursor.execute("""
                    UPDATE clients
                    SET total_rounds_participated = total_rounds_participated + 1,
                        last_active = ?
                    WHERE client_id = ?
                """, (now, client_id))
                conn.commit()

        self.log_event("CONTRIBUTION_RECORDED", f"Client {client_id} contributed {num_samples} samples in Round {round_num}")

    def record_round_completion(self, round_num: int, num_clients: int, duration_ms: float, global_loss: float = 0.0):
        """Records completed federated aggregation round."""
        now = datetime.utcnow().isoformat()
        with self._lock:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO rounds (round_num, timestamp, num_clients_participated, aggregation_duration_ms, global_loss, status)
                    VALUES (?, ?, ?, ?, ?, 'completed')
                """, (round_num, now, num_clients, duration_ms, global_loss))
                conn.commit()

        self.log_event("ROUND_COMPLETED", f"Round {round_num} completed with {num_clients} clients in {duration_ms:.2f}ms (Loss: {global_loss:.4f})")

    def log_event(self, event_type: str, message: str, level: str = "INFO"):
        """Appends a timestamped audit log to the database."""
        now = datetime.utcnow().isoformat()
        with self._lock:
            try:
                with self._get_connection() as conn:
                    cursor = conn.cursor()
                    cursor.execute("""
                        INSERT INTO server_logs (timestamp, log_level, event_type, message)
                        VALUES (?, ?, ?, ?)
                    """, (now, level, event_type, message))
                    conn.commit()
            except Exception as e:
                logging.error(f"Failed to record server log event: {e}")

    def get_all_clients(self) -> List[Dict[str, Any]]:
        """Returns all registered clients."""
        with self._lock:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM clients ORDER BY last_active DESC")
                return [dict(row) for row in cursor.fetchall()]

    def get_round_history(self) -> List[Dict[str, Any]]:
        """Returns chronological list of all federated rounds."""
        with self._lock:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM rounds ORDER BY round_num ASC")
                return [dict(row) for row in cursor.fetchall()]

    def get_recent_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Returns most recent server activity logs."""
        with self._lock:
            with self._get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM server_logs ORDER BY id DESC LIMIT ?", (limit,))
                return [dict(row) for row in cursor.fetchall()]
