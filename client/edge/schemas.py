from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

"""
FedThreat: Multi-Sensor Enterprise Telemetry Schemas
Standardized schemas for all 5 enterprise sensor modalities:
1. Network Flow (NetFlow / PCAP)
2. Authentication & IAM (Kerberos / SSH / LDAP)
3. Endpoint & Host Activity (Sysmon / OSQuery)
4. Web Application (WAF / HTTP Logs)
5. Cloud Audit & Threat Intelligence (CloudTrail / OTX)
"""

# --- SENSOR 1: NETWORK FLOW ---
class NetworkTelemetryPayload(BaseModel):
    modality: Literal["network"] = "network"
    Dst_Port: int = Field(default=443, description="Destination port (e.g. 443, 80, 22)")
    Protocol: str = Field(default="TCP", description="Transport protocol")
    Flow_Duration: int = Field(default=12000, description="Flow duration in microseconds")
    Tot_Fwd_Pkts: int = Field(default=4500, description="Total forward packets")
    Tot_Bwd_Pkts: int = Field(default=10, description="Total backward packets")
    Pkt_Size_Avg: Optional[float] = Field(default=850.0, description="Average packet size")
    Init_Fwd_Win_Byts: Optional[int] = Field(default=29200)
    Init_Bwd_Win_Byts: Optional[int] = Field(default=28960)
    FIN_Flag_Cnt: Optional[int] = Field(default=0)
    URG_Flag_Cnt: Optional[int] = Field(default=0)
    simulate_zero_day: bool = Field(default=True, description="Toggle for federated learning demo")

# --- SENSOR 2: AUTHENTICATION & IAM ---
class AuthTelemetryPayload(BaseModel):
    modality: Literal["auth"] = "auth"
    user_id: str = Field(default="admin_jdoe", description="Username or service identity")
    source_ip: str = Field(default="192.168.1.105", description="Source client IP")
    auth_service: str = Field(default="SSH", description="Service: SSH, Kerberos, Okta, RDP")
    failed_attempts_5m: int = Field(default=18, description="Count of failed attempts in rolling 5 minutes")
    login_velocity_per_min: float = Field(default=12.5, description="Login attempts per minute")
    is_privileged_account: int = Field(default=1, description="1 if admin/root account, 0 otherwise")
    is_off_hours: int = Field(default=1, description="1 if login occurred outside 08:00-18:00")
    subnet_changes_count: int = Field(default=3, description="Count of distinct IP subnets attempted")
    mfa_prompted: int = Field(default=1, description="1 if MFA challenge was triggered")
    mfa_failed: int = Field(default=1, description="1 if MFA was rejected / timed out")
    simulate_zero_day: bool = Field(default=True)

# --- SENSOR 3: ENDPOINT & HOST ACTIVITY ---
class EndpointTelemetryPayload(BaseModel):
    modality: Literal["endpoint"] = "endpoint"
    host_name: str = Field(default="MAC-EDGE-01")
    process_name: str = Field(default="powershell.exe")
    parent_process: str = Field(default="word.exe")
    pid: int = Field(default=4120)
    command_line: str = Field(default="powershell.exe -enc SQBFAFgA...")
    is_unsigned_binary: int = Field(default=1)
    sensitive_dir_write: int = Field(default=1)
    syscall_rate_per_sec: float = Field(default=350.0)
    simulate_zero_day: bool = Field(default=True)

# --- SENSOR 4: WEB APPLICATION & API ---
class WebTelemetryPayload(BaseModel):
    modality: Literal["web"] = "web"
    http_method: str = Field(default="POST")
    uri_endpoint: str = Field(default="/api/v1/user/login")
    status_code: int = Field(default=500)
    uri_length: int = Field(default=180)
    special_char_count: int = Field(default=14, description="SQL/XSS characters like ', --, <script>")
    payload_size_bytes: int = Field(default=4500)
    simulate_zero_day: bool = Field(default=True)

# --- SENSOR 5: CLOUD AUDIT & THREAT INTEL ---
class CloudTelemetryPayload(BaseModel):
    modality: Literal["cloud"] = "cloud"
    event_source: str = Field(default="iam.amazonaws.com")
    event_name: str = Field(default="CreateAccessKey")
    source_ip: str = Field(default="185.220.101.5")
    is_abnormal_region: int = Field(default=1)
    is_known_bad_ioc: int = Field(default=1)
    simulate_zero_day: bool = Field(default=True)
