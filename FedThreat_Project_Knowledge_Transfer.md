# FedThreat --- Comprehensive Project Knowledge Transfer Brief

## Purpose

This document is a detailed handover of the current FedThreat project
understanding for another LLM. It distinguishes selected-paper findings,
proposed project design, and unresolved decisions. Do not describe a
proposed component as implemented or experimentally validated unless the
team confirms it.

## 1. Project identity

-   **Title:** FedThreat: Federated Learning for Privacy-Preserving
    Cyber Threat Intelligence.
-   **Team:** Adithyan Manoj, Adithya Suresh, Nandana V.
-   **Guide:** Dr. Soja Salim.
-   **Type:** Research-oriented privacy-preserving collaborative
    cybersecurity learning framework.
-   **Core idea:** Multiple organizations collaboratively train/improve
    a shared cybersecurity model while raw security data remains local.

## 2. Motivation and problem

Organizations collect network traffic/flows, authentication logs,
endpoint/system logs, web/application telemetry, alerts, incident
reports, and threat intelligence. These records can be sensitive and
cannot necessarily be centralized. One organization may see common
attacks while another sees rare or emerging ones.

Federated Learning (FL) permits local training and sharing of model
updates rather than raw records, but FL alone does not guarantee privacy
or solve: - **Non-IID data:** organizations have different attack
distributions, data volumes, labels, environments, and logging
practices. - **Client selection:** random or purely statistical
selection can underrepresent valuable rare-threat clients. - **Update
privacy:** gradients/updates may leak information. - **Large-model
cost:** full fine-tuning is expensive in compute, memory, and
communication. - **Threat context:** alerts may need correlation,
explanation, threat intelligence, and response recommendations. -
**Unknown threats:** unseen/OOD patterns may not fit known classes. -
**Data quality and imbalance:** records may be noisy, incomplete,
imbalanced, or inconsistently labelled. - **Drift:** threats and
distributions change over time.

## 3. Main proposed direction

FedThreat proposes to investigate the integration of: 1. FL across
heterogeneous cybersecurity clients. 2. **Threat-aware client
selection**, valuing cybersecurity information rather than selecting
only by Non-IID degree. 3. **Federated LoRA/PEFT** for efficient
adaptation without full-model fine-tuning. 4. Privacy protection using
**Differential Privacy (DP)** and/or **Secure Aggregation**, subject to
feasibility. 5. A possible contextual intelligence layer using
local/private RAG and MITRE ATT&CK, if scope allows.

**Central research gap:** Existing works separately address LLM-assisted
cybersecurity analysis, Non-IID-aware client selection,
privacy-preserving federated anomaly detection, and federated LoRA.
FedThreat proposes to investigate their integration, especially
threat-value-aware participation. This is a proposed contribution, not a
proven novelty claim until implemented and evaluated.

## 4. Selected literature --- current four-paper set

### Paper 1 --- Saura et al.

**Title:** "Enhancing Federated Intrusion Detection through LLM-Driven
Alert Enrichment and Collaborative Threat Information Sharing."\
**Authors:** Pablo Fernández Saura, Jorge Bernal Bernabé, Antonio F.
Skarmeta.\
**Venue:** Future Generation Computer Systems; cited in project
materials as 2025, article 108319 (later indexed as Volume 178, May
2026).

**Problem** - Federated IDS struggles with Non-IID data. - An
organization may lack examples of an attack class. - Base IDS may
produce uncertain/low-confidence alerts with limited context.

**Method** - Uses a local federated IDS, described as MLP-based in the
studied framework, for primary detection. - High-confidence results are
handled by the IDS; low-confidence alerts are selectively passed to an
LLM. - The LLM enriches/re-evaluates alerts using threat-intelligence
context and Federated RAG. - Verified incidents can be stored as
collaborative knowledge and fed into later federated retraining. -
Two-tier TI: external TI (e.g., AbuseIPDB, VirusTotal) and Federated RAG
containing verified incident knowledge/semantic threat information, not
raw logs. - Evaluates FedAvg, FedProx, FedAdam, and SCAFFOLD.

**Evaluation/results noted** - CIC-IDS-2017, including a Non-IID setup
where one organization completely lacks an attack class. - Two of four
tested LLMs achieved perfect recall for the missing class when
reclassifying low-confidence alerts with full TI context. - Feedback
loop improved missing-class recall from 75.85% to 91.47%, F1 from 86.27%
to 95.54%; overall FPR decreased by about 1%. - **91.47% is recall, not
overall accuracy.**

**Limitations** - Non-IID remains challenging; results depend on LLM
quality and TI quality. - LLM inference has cost/compute overhead. -
Network-flow feature focus may not represent every complex attack
behavior.

**FedThreat relevance:** Motivates FL + LLM + threat
intelligence/contextual alert enrichment. FedThreat's proposed focus is
additionally threat-aware client selection and efficient Federated LoRA
adaptation.

**Memory line:** Paper 1 = What can LLM + FL + threat intelligence
contribute to cybersecurity?

### Paper 2 --- Zhang et al.

**Title:** "Client Selection for Federated Learning With Non-IID Data in
Mobile Edge Computing."\
**Authors:** Zhang, Wenyu, et al.\
**Venue:** IEEE Access, vol. 9 (2021), pp. 24462--24474.

**Problem** - Non-IID data degrades FL performance. - Random selection
may include highly heterogeneous clients. - Heterogeneous updates can
cause model divergence and reduce global performance.

**Method: CSFedAvg** - Proposes **Client-Selected Federated Averaging
(CSFedAvg)**. - Clients train local deep-learning models on local
datasets. - A small server-side IID auxiliary dataset trains a reference
model. - Weight divergence between client models and the reference model
estimates the client's Non-IID degree. - Clients with lower estimated
Non-IID degree are selected more frequently. - Selected client models
are aggregated with FedAvg-style aggregation.

**Evaluation noted** - General FL, not cybersecurity-specific. -
Datasets: CIFAR-10 and Fashion-MNIST; 500 simulated clients. - Reported
results are setup-dependent; do not generalize one numerical improvement
to all cases.

**Advantages:** More data-aware than random selection; uses
client-specific information; improves performance in reported
heterogeneous settings.

**Limitations/gap** - Selection targets Non-IID degree, not
cybersecurity threat value. - Highly Non-IID clients with rare/emerging
attacks may participate less. - Requires server-side IID auxiliary
data. - No threat-aware or organization-specific prioritization.

**FedThreat relevance:** Borrow the principle of informed/data-aware
selection, but extend the objective toward cybersecurity information
value. Non-IID may remain context, not an automatic reason to exclude a
client.

**Memory line:** Paper 2 = Who should participate? CSFedAvg uses weight
divergence to estimate Non-IID degree.

### Paper 3 --- GuardianAI

**Title:** "GuardianAI: Privacy-preserving federated anomaly detection
with differential privacy."\
**Venue:** Array, vol. 26 (2025), article 100381.\
**DOI:** 10.1016/j.array.2025.100381.\
**Link noted:**
https://www.sciencedirect.com/science/article/pii/S2590005625000086

**Problem** - FL keeps raw data local, but updates can still expose
information. - Risks discussed include inference attacks, model
inversion, and gradient leakage. - Privacy controls may reduce model
utility/accuracy.

**Method as summarized in project discussions** - Clients train
anomaly-detection models locally. - Gaussian noise is used for
Differential Privacy. - Secure Aggregation protects individual client
contributions during aggregation. - Adaptive noise is described as
helping manage the privacy--utility trade-off.

**Result noted:** Prior project notes mention 99.8% test accuracy.
Verify exact dataset, configuration, and metric in the paper before
using formally; it is not a general guarantee.

**Advantages:** Demonstrates DP and Secure Aggregation in federated
cybersecurity anomaly detection without pooling raw records.

**Limitations** - Focuses on anomaly detection, not LLM-based threat
reasoning. - Does not provide threat-aware selection or Federated
LoRA. - Privacy mechanisms require tuning and may add overhead. - Do not
claim a formal DP guarantee without checking clipping, accounting,
privacy budget, and assumptions in the source.

**FedThreat relevance:** Motivates a privacy layer. DP and Secure
Aggregation are complementary but distinct; implementation is still
subject to scope and feasibility.

**Memory line:** Paper 3 = How can federated updates be protected? DP +
Secure Aggregation.

### Paper 4 --- FLoRA

**Title:** "FLoRA: Federated Fine-Tuning Large Language Models with
Heterogeneous Low-Rank Adaptations."\
**Authors:** Wang et al.\
**Venue:** NeurIPS 37 (2024), pp. 22513--22533.

**Problem** - Full LLM fine-tuning is expensive. - Clients have
different compute resources/data, so they may use different LoRA
ranks. - Naively averaging heterogeneous LoRA A and B matrices
separately can create unwanted cross terms.

**LoRA** - Freeze pretrained weights W and train low-rank adapters A and
B: `W' = W + BA` - This reduces trainable parameters versus full
fine-tuning.

**FLoRA method** - Supports heterogeneous ranks, e.g. rank 4, 8, and 16
across clients. - Since `(sum p_k B_k)(sum p_k A_k) != sum p_k B_k A_k`,
separate averaging can create cross-client terms. - FLoRA stacks A
matrices vertically and B matrices horizontally so the resulting product
represents the sum of local updates without those unwanted cross
terms. - Global adapter is redistributed for future local training.

**Workflow** Pretrained LLM → freeze base → local heterogeneous LoRA
training → send adapter updates → stack/aggregate at server → broadcast
global adapter.

**Models/datasets noted:** TinyLlama 1.1B, Llama 7B, Llama 2 7B;
Dolly-15k, Alpaca, Wizard, ShareGPT; evaluated with MMLU and MT-Bench.

**Advantages:** Parameter-efficient fine-tuning; supports heterogeneous
ranks; aggregation designed for heterogeneous adapters.

**Limitations:** Global stacked rank can grow with sum of local ranks;
communication can be higher than simpler approaches such as FedIT; LoRA
updates are not automatically private; not cybersecurity-specific or
threat-aware.

**FedThreat relevance:** Basis for investigating Federated LoRA/PEFT
adaptation of a cybersecurity model. Exact FLoRA stacking is not yet
finalized for implementation.

**Memory line:** Paper 4 = How can LLM adaptation be federated
efficiently?

## 5. Four-paper synthesis

  -----------------------------------------------------------------------
  Paper             Question          Main concept      FedThreat
                                                        rationale
  ----------------- ----------------- ----------------- -----------------
  Saura et al.      What can LLM + FL LLM alert         Contextual
                    do for cyber?     enrichment, TI,   cybersecurity
                                      Federated RAG     intelligence

  Zhang et al.      Who participates? CSFedAvg, weight  Data-aware
                                      divergence        selection
                                                        baseline

  GuardianAI        How protect       DP + Secure       Privacy layer
                    updates?          Aggregation       motivation

  FLoRA             How federate LLM  LoRA/PEFT,        Efficient model
                    adaptation?       heterogeneous     adaptation
                                      aggregation       
  -----------------------------------------------------------------------

Short memory aid: **Saura = LLM + FL + TI; Zhang = Non-IID + selection;
GuardianAI = DP + Secure Aggregation; FLoRA = Federated LoRA.**

## 6. Proposed threat-aware client selection

### Why extend Paper 2?

CSFedAvg favors clients with lower estimated Non-IID degree. In
cybersecurity, high heterogeneity may mean a client has rare or emerging
threat knowledge. A client with common phishing data may be less
informative for a missing attack class than a client with fewer but
reliable ransomware examples. Quantity is not equal to information
value.

### Conceptual score

For client k, a proposed Threat Value Score is:

`T_k = w_n N_k + w_r R_k + w_q Q_k + w_u U_k`

-   `N_k`: novelty --- how unlike current known threat patterns the
    client's events are.
-   `R_k`: rarity --- how infrequent relevant threat patterns are across
    the environment.
-   `Q_k`: quality --- completeness, label consistency, evidence
    confidence, reliability.
-   `U_k`: utility --- estimated contribution to global detection,
    coverage, or underrepresented classes.
-   `w_n, w_r, w_q, w_u`: weights.

Scores may be normalized to 0--1. This is a **conceptual framework**
only. Exact factors, formula, weights, normalization, and estimator are
not finalized.

### Potential estimation

-   **Novelty:** extract features/embeddings and compare with known
    threat representations; low similarity/high OOD score may suggest
    novelty.
-   **Rarity:** estimate class/cluster frequency across clients using
    privacy-compatible summaries where possible.
-   **Quality:** assess missingness, completeness, label consistency,
    confidence, duplicates, and usable volume.
-   **Utility:** estimate expected contribution to detection or
    coverage, possibly using a valid held-out evaluation if available.

Novelty does not mean maliciousness; rare does not automatically mean
useful. Quality/context checks are needed.

### Selection policy

-   Estimate local indicators.
-   Share only minimum necessary/protected metadata, not raw logs.
-   Compute or aggregate threat values under a defined protocol.
-   Prioritize higher-value clients while retaining exploration/fairness
    so lower-score clients are not permanently excluded.
-   Select participants, train locally, protect updates, aggregate, and
    repeat.

Exact policy and privacy-safe metadata protocol remain open decisions.

### Relation to Non-IID

Paper 2: lower Non-IID degree → more frequent selection.\
FedThreat: higher cybersecurity information value → higher selection
priority.\
Non-IID may be contextual, but should not alone exclude a client.

### Viva response

"Paper 2 selects clients mainly by estimated Non-IID degree. We propose
extending data-aware selection to cybersecurity threat-aware selection.
We estimate the value of each client's information using potential
novelty, rarity, quality, and expected utility. A highly Non-IID client
containing reliable rare-threat information should not be automatically
excluded. Raw data stays local; only necessary, minimized or protected
selection metadata is shared."

## 7. Proposed architecture

``` text
ORGANIZATION A       ORGANIZATION B       ORGANIZATION C
      |                    |                    |
Local security data   Local security data   Local security data
      |                    |                    |
Preprocessing / normalization / feature extraction at each site
      |                    |                    |
Known threat detection + anomaly/OOD/novelty signals
      |                    |                    |
Novelty / rarity / quality / utility indicators
      |                    |                    |
Privacy-compatible selection metadata
       \                   |                   /
        +--------- Coordinator / Server ------+
                          |
               Threat-aware client selection
                          |
                 Selected FL participants
                          |
             Local LoRA / PEFT adaptation
                          |
                  Adapter updates A/B
                          |
             Optional DP + Secure Aggregation
                          |
                  Federated aggregation
                          |
                 Updated global adapter
                          |
                  Broadcast to clients
                          |
             Local inference and analysis
                          |
           Optional private/local RAG + ATT&CK
                          |
        Context / risk / explanation / recommendation
                          |
             Local dashboard / analyst review
                          |
                   Feedback / next round
```

### Architecture components

1.  **Local telemetry:** network, authentication, endpoint, web/app,
    alerts, incidents, TI.
2.  **Preprocessing:** normalize formats, clean invalid records, extract
    features/embeddings, prepare local samples.
3.  **Detection/novelty:** known-threat detection plus optional
    anomaly/OOD signals. OOD means unusual, not automatically malicious.
4.  **Threat-aware coordinator:** selects clients, manages rounds and
    versions, handles participation constraints.
5.  **Federated LoRA/PEFT:** clients adapt small adapters locally; base
    model remains frozen where LoRA is used.
6.  **Privacy layer:** DP and/or Secure Aggregation, if implemented.
    Formal guarantees require explicit design/accounting.
7.  **Threat-intelligence layer:** optional private RAG and MITRE ATT&CK
    mapping for grounded context and explanations.
8.  **Output/dashboard:** threat/anomaly, confidence/novelty, evidence,
    ATT&CK mapping where supported, risk and recommendations.

Raw security data is intended to remain local. Selection metadata and
updates can still be sensitive and must be protected.

## 8. Planned methodology / FL round

1.  Initialize base model and global adapter.
2.  Each client preprocesses its local data.
3.  Generate local threat indicators.
4.  Estimate novelty, rarity, quality, and utility.
5.  Select clients using threat value and participation/fairness
    constraints.
6.  Broadcast current model/adapter to selected clients.
7.  Train local LoRA/PEFT adapters.
8.  Apply chosen update protection (DP and/or Secure Aggregation).
9.  Aggregate selected updates using the finalized compatible algorithm.
10. Update and version the global adapter/model.
11. Broadcast the updated version.
12. Perform local inference; feed validated feedback into future
    training where feasible.
13. Monitor performance, privacy cost, communication, class coverage,
    participation, and drift.

This is planned, not a claim of completed implementation.

## 9. Scope: core, optional, deferred

### Core focus

-   FL with simulated or actual clients.
-   Heterogeneous/Non-IID cybersecurity data.
-   Threat-aware client selection.
-   LoRA/PEFT-based efficient adaptation.
-   Privacy-preserving update handling, as feasible.
-   Evaluation against clear baselines.

### Optional / feasibility-dependent

-   Full LLM reasoning.
-   Local/private RAG.
-   MITRE ATT&CK enrichment.
-   Personalization.
-   Continual learning and drift handling.
-   Advanced OOD detection.
-   Complex utility estimation or bandit-based selection.
-   Real multi-organization deployment and broad telemetry support.

### Deferred

A poisoning defense based on **TDF-PAD (Two-step Defense Framework for
Poisoning Attacks Detection)** was studied, but dropped for now because
it would increase complexity. Do not treat poisoning defense as a
current core module unless reintroduced by the team.

## 10. Candidate technology stack

  Layer               Candidate
  ------------------- --------------------------
  Programming         Python
  Training            PyTorch
  Pretrained models   Hugging Face
  PEFT                Hugging Face PEFT / LoRA
  FL orchestration    Flower
  Backend/API         FastAPI
  Dashboard           Flutter
  Vector retrieval    FAISS or Chroma
  Embeddings          sentence-transformers
  Threat mapping      MITRE ATT&CK

These are discussed options, not all confirmed integrations.

## 11. Hardware / feasibility

Known resources include an M5 MacBook Air, a Windows laptop with RTX
3050 and limited VRAM, integrated graphics, and possible Colab/T4 use.
Therefore: - Avoid training large foundation models from scratch. -
Prefer compact models and LoRA/PEFT. - Begin with simulated clients on
one machine. - Use small datasets, modest batches/epochs, and cloud GPU
when necessary. - Benchmark memory, training time, communication size,
and inference latency early.

## 12. Datasets and evaluation --- unresolved

No final dataset or model is locked. Cybersecurity dataset families
discussed include CIC-IDS-2017, CIC-IDS-2018, and CIC-DDoS2019, subject
to fit, license, labels, and preprocessing. Paper 1 used CIC-IDS-2017.
Paper 2 used CIFAR-10/Fashion-MNIST and is general FL, not cyber. Verify
GuardianAI's exact experimental setup before citing its numbers.

Potential experiment: - Partition one selected cyber dataset into
simulated organizations. - Create IID and Non-IID splits, such as
label/quantity skew or realistic organization splits. - Compare random,
CSFedAvg-inspired (if reproducible), and threat-aware selection. - Use
FedAvg baseline; optionally FedProx/FedAdam/SCAFFOLD if feasible. -
Compare appropriate adapter baselines if LoRA is implemented. - Run
privacy ablations if DP/Secure Aggregation are implemented.

Potential metrics: - Accuracy, precision, recall, F1, macro-F1. -
Per-class recall, especially rare attack classes. - False-positive
rate. - OOD/unknown-threat metrics if applicable. - Global performance
and convergence. - Communication per round, training time, memory,
inference latency. - Client participation frequency and coverage. -
Epsilon/delta/accounting if formal DP is used.

Report dataset, client count, partition, participation rate, model,
local epochs, hardware, privacy settings, and number of runs. Do not
claim improvements until measured.

## 13. Baselines and research questions

Potential baselines: - Random client selection. - CSFedAvg-style
Non-IID-aware selection, if implemented fairly. - Proposed threat-aware
selection. - FedAvg; optionally FedProx/FedAdam/SCAFFOLD. - LoRA
aggregation alternatives only if heterogeneous aggregation is
implemented. - No-privacy vs selected privacy configuration, with
guarantees clearly distinguished.

Possible research question: **Does threat-aware participation improve
rare-threat coverage or per-class detection over random and
Non-IID-aware selection, without unacceptable losses in overall
performance, fairness, privacy, or communication cost?**

## 14. Key concepts

-   **FL:** local training; updates aggregated; raw data stays local,
    but updates can leak.
-   **Non-IID:** client distributions differ; can cause drift and
    convergence problems.
-   **FedAvg:** weighted model averaging,
    `w_global = sum_k (n_k/N) w_k`.
-   **FedProx:** adds proximal term `(mu/2)||w - w_t||^2` to reduce
    local drift.
-   **FedAdam:** adaptive server-side Adam-style update.
-   **SCAFFOLD:** control variates correct client drift.
-   **LoRA:** freeze base `W`; train low-rank `A`, `B`; `W' = W + BA`.
-   **FLoRA:** stacks heterogeneous LoRA matrices to avoid cross terms
    from separate A/B averaging.
-   **DP:** formal bound on information leakage under defined
    assumptions; Gaussian noise alone is not proof of DP.
-   **Secure Aggregation:** cryptographically hides individual updates
    while allowing aggregate computation.
-   **RAG:** retrieves relevant knowledge to ground model output.
-   **OOD:** indicates input differs from known distribution, not that
    it is malicious.
-   **MITRE ATT&CK:** tactics/techniques knowledge base for threat
    mapping.

## 15. Likely viva questions and concise answers

**What problem does FedThreat address?**\
Collaborative cybersecurity learning without centralizing sensitive raw
telemetry, while addressing heterogeneous data, client selection,
efficient adaptation, and privacy.

**Why FL?**\
Organizations can train locally and share updates rather than raw logs,
although updates still need protection.

**What is Paper 2's main limitation?**\
It selects based on Non-IID degree, not the cybersecurity value of
client information.

**How does FedThreat make selection threat-aware?**\
By estimating novelty, rarity, data quality, and expected utility, then
using these signals in a client-selection policy. Exact scoring remains
to be designed and evaluated.

**Why not choose only IID clients?**\
That can underrepresent rare/emerging threats held by highly Non-IID
clients.

**How identify novelty?**\
Potentially compare event embeddings/features with known threat
representations or use OOD scoring. Treat as a signal, not a
maliciousness verdict.

**How identify rarity?**\
Estimate threat class/cluster frequency across the environment using
privacy-compatible summaries where possible.

**How assess quality?**\
Possible metrics include completeness, missingness, label consistency,
confidence, duplicates, and usable volume.

**What is utility?**\
Expected contribution to global detection or underrepresented threat
coverage; exact estimator is open.

**Does server receive raw logs?**\
No, intended design keeps them local. Only necessary/protected metadata
and model updates are shared.

**How prevent high-score clients dominating?**\
Include exploration or fairness/participation constraints so other
clients are not permanently excluded.

**Why LoRA?**\
It trains small adapters instead of all foundation-model weights,
reducing resource requirements.

**Are you implementing FLoRA exactly?**\
Not decided. FLoRA motivates Federated LoRA and heterogeneous-rank
aggregation; exact implementation depends on feasibility.

**Does FL guarantee privacy?**\
No. Updates can leak; DP and Secure Aggregation may reduce risk under
defined assumptions.

**DP vs Secure Aggregation?**\
DP adds formally accounted protection against information leakage;
Secure Aggregation hides individual updates from the server. They
address different threats.

**Why Paper 1?**\
It demonstrates LLM-assisted alert enrichment with FL and threat
intelligence, motivating contextual cyber analysis.

**Why GuardianAI?**\
It motivates privacy protection in federated cybersecurity anomaly
detection, not threat-aware selection or LoRA.

**Does FedThreat detect every zero-day?**\
No such guarantee. OOD can flag unfamiliar patterns, but unknown-threat
detection needs evaluation.

**Is poisoning defense included?**\
No, TDF-PAD was deferred to control scope.

**What is the contribution?**\
A feasible prototype investigating threat-aware client selection and
efficient Federated LoRA/PEFT for privacy-preserving learning over
heterogeneous cybersecurity data, evaluated against baselines.

## 16. Risks and cautions

-   Keep scope manageable; prove the FL pipeline before adding full
    LLM/RAG/dashboard complexity.
-   Do not equate novelty with maliciousness, rarity with utility, or
    Non-IID with poor quality.
-   Avoid always selecting only the highest score.
-   Selection metadata can itself be sensitive.
-   Public datasets may not reflect real organizations; state this
    limitation.
-   Define a specific research contribution and measure it; integration
    alone does not automatically prove novelty.
-   DP needs clipping, accountant, epsilon/delta, and assumptions.
-   RAG-generated explanations can be wrong; ground them in evidence and
    include analyst review.
-   Do not imply poisoning defense is in scope.

## 17. Suggested implementation roadmap (not yet approved)

1.  **FL baseline:** choose one manageable dataset, simulate clients,
    build FedAvg, report per-class metrics.
2.  **Selection baseline:** implement random selection; add a simplified
    CSFedAvg-inspired baseline if feasible.
3.  **Threat-aware prototype:** define measurable signals, normalize,
    set transparent weights, add exploration, compare and ablate.
4.  **LoRA/PEFT:** choose a model fitting hardware, train adapters
    locally, validate aggregation; try heterogeneous ranks only if
    feasible.
5.  **Privacy:** integrate one mechanism at a time; define DP accounting
    or select a secure aggregation protocol; measure overhead.
6.  **Optional intelligence:** add local RAG/ATT&CK only after core
    pipeline works.
7.  **API/dashboard:** expose stable outputs through FastAPI and
    optionally Flutter; run end-to-end tests.

## 18. Presentation preferences and narrative

-   User prefers concise slide-ready points and detailed viva
    explanations separately.
-   Current deck is about 23 pages; overall guidance previously capped
    deck at 30 slides including title, contents, and thank-you.
-   Theme: white/light background with deep maroon/red accents and
    rounded literature panels.
-   Diagrams should be clean, minimal block diagrams; avoid unnecessary
    text or decoration.
-   Do not create a PPT file unless explicitly requested; usually
    provide slide content and guidance.
-   Correct spelling: **MITRE ATT&CK**.

**Literature narrative:** Saura = LLM/TI for cyber; Zhang = Non-IID
client selection; GuardianAI = privacy; FLoRA = efficient federated LLM
adaptation. FedThreat's proposed synthesis = threat-aware selection +
Federated LoRA/PEFT + privacy-preserving FL for cyber threat
intelligence.

## 19. Unresolved decisions

1.  Exact base/foundation model and whether it is an LLM or compact
    encoder/classifier.
2.  Final dataset and attack taxonomy.
3.  Client partitioning strategy and number of clients.
4.  Precise novelty, rarity, quality, and utility estimators.
5.  Final threat-score equation, normalization, and weights.
6.  Privacy-compatible method for exchanging selection metadata.
7.  Exploration/fairness policy.
8.  Whether/how Non-IID degree enters selection.
9.  FL framework and aggregation algorithm.
10. Whether exact FLoRA stacking is implemented.
11. Whether DP, Secure Aggregation, or both are in the prototype.
12. DP clipping, noise, epsilon/delta, accountant, and threat model if
    used.
13. Whether RAG, ATT&CK, OOD, personalization, or continual learning are
    core or future work.
14. Evaluation baselines, metrics, ablations, and compute budget.
15. Which features are implemented versus only proposed at each
    milestone.

## 20. Instructions to the next LLM

-   Treat this file as the current project handover.
-   Keep selected literature to the four papers above unless the user
    changes it.
-   Do not silently mix paper methods or replace papers.
-   Clearly label paper facts, FedThreat proposals, and unresolved
    ideas.
-   Do not claim exact model, score weights, privacy guarantee, or
    aggregation method is finalized.
-   Keep the project feasible and help narrow scope.
-   The current differentiator under discussion is **threat-aware client
    selection** using novelty, rarity, quality, and utility signals.
-   TDF-PAD poisoning defense was deliberately deferred.
-   Explain simply first, then add technical detail when useful.

## Executive summary

FedThreat is a proposed federated cybersecurity learning framework in
which organizations retain raw security telemetry locally and
collaboratively improve a shared model. Its four selected papers
motivate complementary directions: Saura et al. (LLM-based alert
enrichment and collaborative threat intelligence), Zhang et
al. (Non-IID-aware client selection through CSFedAvg), GuardianAI (DP
and Secure Aggregation for federated anomaly detection), and FLoRA
(efficient federated LLM fine-tuning using heterogeneous LoRA).

FedThreat proposes to investigate a shift from selecting clients only by
Non-IID degree toward selecting clients by cybersecurity information
value, potentially measured through novelty, rarity, data quality, and
utility. Selected clients would train local LoRA/PEFT adapters; updates
may be protected with DP and/or Secure Aggregation. A local/private RAG
and MITRE ATT&CK layer may provide context and explanations if feasible.
The exact model, dataset, score, privacy configuration, adapter
aggregation, and optional intelligence modules remain open. The project
should be scoped as a measurable prototype and claims should be based on
actual implementation and experiments.
