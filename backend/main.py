from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import Optional
import requests
from rdkit import Chem
from rdkit.Chem import Descriptors
from rdkit.Chem import rdMolDescriptors

from models import Base, Molecule

app = FastAPI(title="PRPOIS Enterprise Backend API")

# --- CORS Settings ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for local dev #TODO restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./prpois.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Pydantic Models ---
class MoleculeResponse(BaseModel):
    id: int
    smiles: str
    name: Optional[str]
    mw: Optional[float]
    logp: Optional[float]
    tpsa: Optional[float]
    lipinski_violations: Optional[int]
    projected_cost_scaled: Optional[float]
    e_factor_scaled: Optional[float]
    scale_factor: str

    class Config:
        from_attributes = True

# --- API Endpoints ---
@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Connected to PRPOIS Database Server"}

@app.get("/api/molecule/{query}", response_model=MoleculeResponse)
def get_molecule(
    query: str, 
    target_scale: Optional[str] = Query("Laboratory", description="Laboratory, Pilot, Bulk"),
    db: Session = Depends(get_db)
):
    # 1. Check local database
    # Query could be a SMILES string or a name. Using SMILES for now as it's the primary identifier from the sketcher
    db_molecule = db.query(Molecule).filter(Molecule.smiles == query).first()
    
    if not db_molecule:
        # Fallback to PubChem API
        pubchem_url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/{query}/JSON"
        response = requests.get(pubchem_url)
        
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Molecule not found in DB or PubChem")
        
        data = response.json()
        try:
            cid = data['PC_Compounds'][0]['id']['id']['cid']
            name = f"PubChem_{cid}" # Simplified name extraction
        except (KeyError, IndexError):
            name = "Unknown"

        # Calculate RDKit properties
        mol = Chem.MolFromSmiles(query)
        if not mol:
             raise HTTPException(status_code=400, detail="Invalid SMILES for RDKit calculation")

        mw = Descriptors.MolWt(mol)
        logp = Descriptors.MolLogP(mol)
        tpsa = Descriptors.TPSA(mol)
        
        # Calculate Lipinski violations
        violations = 0
        if mw > 500: violations += 1
        if logp > 5: violations += 1
        if rdMolDescriptors.CalcNumHBD(mol) > 5: violations += 1
        if rdMolDescriptors.CalcNumHBA(mol) > 10: violations += 1

        # Save to Local DB
        db_molecule = Molecule(
            smiles=query,
            name=name,
            mw=mw,
            logp=logp,
            tpsa=tpsa,
            lipinski_violations=violations
        )
        db.add(db_molecule)
        db.commit()
        db.refresh(db_molecule)

    # Calculate Scaled Properties (Dynamic Scaling Engine)
    # Base Laboratory values
    base_cost = 500.0 # arbitrary default for demo
    base_e_factor = 25.0
    
    # Scale multipliers
    scale_multipliers = {
        "Laboratory": {"cost_multiplier": 1.0, "e_factor_multiplier": 1.0},
        "Pilot": {"cost_multiplier": 0.5, "e_factor_multiplier": 0.8},
        "Bulk": {"cost_multiplier": 0.1, "e_factor_multiplier": 0.4}
    }
    
    scale_params = scale_multipliers.get(target_scale, scale_multipliers["Laboratory"])
    
    projected_cost = base_cost * scale_params["cost_multiplier"]
    e_factor = base_e_factor * scale_params["e_factor_multiplier"]

    # Construct response
    return MoleculeResponse(
        id=db_molecule.id,
        smiles=db_molecule.smiles,
        name=db_molecule.name,
        mw=db_molecule.mw,
        logp=db_molecule.logp,
        tpsa=db_molecule.tpsa,
        lipinski_violations=db_molecule.lipinski_violations,
        projected_cost_scaled=projected_cost,
        e_factor_scaled=e_factor,
        scale_factor=target_scale
    )
