# PRPOIS: Pharmaceutical Reaction Pathway Optimization & Analysis System 🧪💻

![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-009688?style=flat-square&logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite%20%7C%20SQLAlchemy-003B57?style=flat-square&logo=sqlite&logoColor=white)
![RDKit](https://img.shields.io/badge/Chemistry_Engine-RDKit-blue?style=flat-square)

## 📌 Executive Summary
**PRPOIS** is an enterprise-grade Master Data Management (MDM) hub designed to bridge the gap between static chemical databases and dynamic manufacturing orchestration. It evaluates, ranks, and secures multi-step synthesis pathways based on a dynamic Multi-Criteria Decision Analysis (MCDA) model, weighing **Total Yield, Thermodynamic Safety, Economic Feasibility, and Green Chemistry (E-Factor)**.

This system was developed as a comprehensive **Three-Tier Database Management System (DBMS)** project, heavily emphasizing relational data integrity, normalization (3NF), and Role-Based Access Control (RBAC).

---

## 🏗️ System Architecture & Database Design
The application is built on a strict **Three-Tier Architecture**:
1. **Presentation Layer (React/TypeScript):** Features an "Anti-Gravity" UI with Framer Motion, interactive JSME/Ketcher molecular sketching, and dynamic Chart.js visualizations.
2. **Application Layer (FastAPI/Python):** The business logic hub. It executes RDKit thermodynamic calculations, scales manufacturing costs dynamically, and bridges external big-data via the NIH PubChem REST API.
3. **Data Layer (SQLite/SQLAlchemy):** A highly normalized relational database guaranteeing ACID compliance.

### The 10-Entity Relational Schema (3NF)
The database strictly adheres to the Third Normal Form (3NF) to eliminate insertion/deletion anomalies and transitive dependencies. 


**Core Entities:**
* `USERS`, `ADMIN`, `RESEARCHER`: Implements FDA 21 CFR Part 11 role-based access control.
* `MOLECULE` & `MOLECULE_INTERACTION`: Stores SMILES, MW, LogP, TPSA, and hazard warnings.
* `PATHWAY` & `REACTION_STEP`: Tracks total yield, specific thermodynamics (Temp, Pressure), and E-Factor.
* `STEP_MOLECULE_MAP`: Resolves the Many-to-Many (M:N) relationship between molecules and specific reaction steps.
* `RETROSYNTHESIS_LOG`: The AI audit trail tracking Hallucination Risk Scores and human validation.
* `INDICATION_PRICING`: Isolates transient market economics from intrinsic physical chemistry.

---

## ✨ Key Features
* **"Fail-Fast" *In Silico* Filter:** Instantly calculates SwissADME metrics (Lipinski Violations). If a molecule is biologically unviable, the system visually rejects it, saving physical lab resources.
* **Techno-Economic Scaling Engine:** Dynamically recalculates hardware costs and environmental waste (Process Mass Intensity/E-Factor) when shifting from Laboratory (grams) to Bulk Industrial (Tonnes) scales.
* **Live Big-Data Integration:** If an unknown molecule is sketched, the backend seamlessly falls back to the **PubChem API**, retrieves the correct SMILES and properties, runs RDKit analytics, and permanently ingests it into the local PRPOIS database.
* **FDA 21 CFR Part 11 Compliance:** Mandates a strict 1:1 relationship between an AI-generated pathway and a human-validated electronic signature to prevent "AI Hallucinations" from reaching the physical lab.

---

## 🚀 Installation & Local Deployment

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/PRPOIS-Digital-Chemistry-Platform.git](https://github.com/yourusername/PRPOIS-Digital-Chemistry-Platform.git)
cd PRPOIS-Digital-Chemistry-Platform
