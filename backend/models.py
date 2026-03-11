from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship, declarative_base
import enum

Base = declarative_base()

class UserRole(enum.Enum):
    ADMIN = "admin"
    RESEARCHER = "researcher"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    
    admin_profile = relationship("Admin", back_populates="user", uselist=False)
    researcher_profile = relationship("Researcher", back_populates="user", uselist=False)

class Admin(Base):
    __tablename__ = "admin"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    department = Column(String(100))
    
    user = relationship("User", back_populates="admin_profile")

class Researcher(Base):
    __tablename__ = "researcher"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    institution = Column(String(100))
    specialty = Column(String(100))
    
    user = relationship("User", back_populates="researcher_profile")

class Molecule(Base):
    __tablename__ = "molecule"
    id = Column(Integer, primary_key=True, index=True)
    smiles = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), index=True)
    mw = Column(Float)
    logp = Column(Float)
    tpsa = Column(Float)
    lipinski_violations = Column(Integer)
    
    interactions = relationship("MoleculeInteraction", foreign_keys="[MoleculeInteraction.molecule_id_1]", back_populates="molecule_1")
    step_mappings = relationship("StepMoleculeMap", back_populates="molecule")
    pricing = relationship("IndicationPricing", back_populates="molecule")

class MoleculeInteraction(Base):
    __tablename__ = "molecule_interaction"
    id = Column(Integer, primary_key=True, index=True)
    molecule_id_1 = Column(Integer, ForeignKey("molecule.id"), nullable=False)
    molecule_id_2 = Column(Integer, ForeignKey("molecule.id"), nullable=False)
    hazard_warning = Column(Text, nullable=False)
    
    molecule_1 = relationship("Molecule", foreign_keys=[molecule_id_1], back_populates="interactions")
    molecule_2 = relationship("Molecule", foreign_keys=[molecule_id_2])

class Pathway(Base):
    __tablename__ = "pathway"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    target_molecule_id = Column(Integer, ForeignKey("molecule.id"), nullable=False)
    total_yield = Column(Float)
    
    steps = relationship("ReactionStep", back_populates="pathway")
    logs = relationship("RetrosynthesisLog", back_populates="pathway")

class ReactionStep(Base):
    __tablename__ = "reaction_step"
    id = Column(Integer, primary_key=True, index=True)
    pathway_id = Column(Integer, ForeignKey("pathway.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    description = Column(Text)
    temperature_celsius = Column(Float)
    pressure_atm = Column(Float)
    e_factor = Column(Float)
    
    pathway = relationship("Pathway", back_populates="steps")
    molecule_maps = relationship("StepMoleculeMap", back_populates="step")

class StepRole(enum.Enum):
    REACTANT = "reactant"
    PRODUCT = "product"
    CATALYST = "catalyst"
    SOLVENT = "solvent"

class StepMoleculeMap(Base):
    __tablename__ = "step_molecule_map"
    id = Column(Integer, primary_key=True, index=True)
    step_id = Column(Integer, ForeignKey("reaction_step.id"), nullable=False)
    molecule_id = Column(Integer, ForeignKey("molecule.id"), nullable=False)
    role = Column(Enum(StepRole), nullable=False)
    stoichiometry = Column(Float, default=1.0)
    
    step = relationship("ReactionStep", back_populates="molecule_maps")
    molecule = relationship("Molecule", back_populates="step_mappings")

class RetrosynthesisLog(Base):
    __tablename__ = "retrosynthesis_log"
    id = Column(Integer, primary_key=True, index=True)
    pathway_id = Column(Integer, ForeignKey("pathway.id"), nullable=False)
    ai_model_version = Column(String(50))
    hallucination_risk_score = Column(Float)
    human_validated = Column(Boolean, default=False)
    validated_by_id = Column(Integer, ForeignKey("researcher.id"))
    
    pathway = relationship("Pathway", back_populates="logs")
    validator = relationship("Researcher")

class IndicationPricing(Base):
    __tablename__ = "indication_pricing"
    id = Column(Integer, primary_key=True, index=True)
    molecule_id = Column(Integer, ForeignKey("molecule.id"), nullable=False)
    indication = Column(String(255), nullable=False)
    estimated_cost_per_kg = Column(Float)
    techno_economic_viability_score = Column(Float)
    
    molecule = relationship("Molecule", back_populates="pricing")
