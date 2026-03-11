export type Role = 'ADMIN' | 'RESEARCHER';

// 1. USERS
export interface User {
    id: string;
    name: string;
    role: Role;
    email: string;
}

// 2. MOLECULE
export interface Molecule {
    id: string;
    smiles: string;
    name: string;
    molecularWeight: number;
    logP: number;
    tpsa?: number;
    lipinskiViolations: number;
    swissAdme: {
        lipo: number;
        size: number;
        polar: number;
        insolu: number;
        insatu: number;
        flex: number;
    };
}

// 3. MOLECULE_INTERACTION
export interface MoleculeInteraction {
    id: string;
    molecule1Id: string;
    molecule2Id: string;
    hazardWarning: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// 4. PATHWAY
export interface Pathway {
    id: string;
    targetMoleculeId: string;
    totalYield: number; // Percentage
    finalScore: number; // 0-100
    baseEstimatedCost: number; // USD at Lab Scale
}

// 5. REACTION_STEP
export interface ReactionStep {
    id: string;
    pathwayId: string;
    stepOrder: number;
    stepName: string;
    temperatureC: number;
    pressureAtm: number;
    baseEFactor: number; // At Lab Scale
    yieldPercentage: number;
}

// 6. STEP_MOLECULE_MAP
export interface StepMoleculeMap {
    id: string;
    stepId: string;
    moleculeName: string;
    role: 'REACTANT' | 'PRODUCT' | 'CATALYST' | 'SOLVENT' | 'BYPRODUCT';
    hazardWarning?: string;
    isToxic?: boolean;
}

// 7. RETROSYNTHESIS_LOG
export interface RetrosynthesisLog {
    id: string;
    pathwayId: string;
    aiModelUsed: string;
    hallucinationRiskScore: number; // 0-100
    humanValidated: boolean;
    validatedByUserId?: string;
    validationTimestamp?: string;
}

// 8. INDICATION_PRICING
export interface IndicationPricing {
    id: string;
    targetMoleculeId: string;
    targetIndication: string;
    estimatedMarketValue: number; // USD
    netProfitMargin: number; // Percentage
}

// Global Mock Database
export const mockDatabase = {
    users: [
        { id: 'u1', name: 'Dr. Sarah Connor', role: 'ADMIN', email: 'sarah.c@prpois.inc' },
        { id: 'u2', name: 'John Doe', role: 'RESEARCHER', email: 'john.d@prpois.inc' }
    ] as User[],

    activePathwayId: 'p1',

    molecules: [
        {
            id: 'm1',
            name: 'Imatinib',
            smiles: 'Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc4nccc(n4)c5cccnc5',
            molecularWeight: 493.6,
            logP: 3.4,
            tpsa: 86.3,
            lipinskiViolations: 0,
            swissAdme: { lipo: 0.8, size: 0.6, polar: 0.9, insolu: 0.4, insatu: 0.7, flex: 0.5 }
        },
        {
            id: 'm2',
            name: 'Unviable Compound X',
            smiles: 'C1=CC=C(C=C1)C2=CC=C(C=C2)C3=CC=C(C=C3)C4=CC=C(C=C4)C5=CC=C(C=C5)',
            molecularWeight: 650.2, // > 500
            logP: 6.5, // > 5
            tpsa: 120.5,
            lipinskiViolations: 2,
            swissAdme: { lipo: 0.1, size: 0.1, polar: 0.2, insolu: 1.0, insatu: 0.1, flex: 0.2 }
        }
    ] as Molecule[],

    pathways: [
        {
            id: 'p1',
            targetMoleculeId: 'm1',
            totalYield: 68.5,
            finalScore: 92,
            baseEstimatedCost: 1500 // Lab Scale cost
        }
    ] as Pathway[],

    retrosynthesisLogs: [
        {
            id: 'rlog1',
            pathwayId: 'p1',
            aiModelUsed: 'RXN-Transformer-V4',
            hallucinationRiskScore: 12, // low
            humanValidated: false,
        }
    ] as RetrosynthesisLog[],

    indicationPricing: [
        {
            id: 'ip1',
            targetMoleculeId: 'm1',
            targetIndication: 'Chronic Myeloid Leukemia',
            estimatedMarketValue: 8500000000,
            netProfitMargin: 42.5
        }
    ] as IndicationPricing[],

    reactionSteps: [
        {
            id: 's1',
            pathwayId: 'p1',
            stepOrder: 1,
            stepName: 'Amidation',
            temperatureC: 65,
            pressureAtm: 1.5,
            baseEFactor: 25, // Waste ratio
            yieldPercentage: 85
        },
        {
            id: 's2',
            pathwayId: 'p1',
            stepOrder: 2,
            stepName: 'Crystallization',
            temperatureC: 4,
            pressureAtm: 1.0,
            baseEFactor: 5,
            yieldPercentage: 92
        }
    ] as ReactionStep[],

    stepMolecules: [
        { id: 'sm1', stepId: 's1', moleculeName: '4-methyl-3-nitroaniline', role: 'REACTANT' },
        { id: 'sm2', stepId: 's1', moleculeName: 'Benzoyl Chloride Derivative', role: 'REACTANT' },
        { id: 'sm3', stepId: 's1', moleculeName: 'Pyridine', role: 'CATALYST', hazardWarning: 'Flammable' },
        { id: 'sm4', stepId: 's1', moleculeName: 'HCl', role: 'BYPRODUCT', hazardWarning: 'Requires Scrubber', isToxic: true },
        { id: 'sm5', stepId: 's2', moleculeName: 'Ethanol', role: 'SOLVENT' }
    ] as StepMoleculeMap[]
};

// Application State Models
export type ManufacturingScale = 'Lab' | 'Pilot' | 'Bulk';

export const scaleMultipliers = {
    Lab: { cost: 1, eFactor: 1 },
    Pilot: { cost: 50, eFactor: 0.8 }, // Economies of scale slightly reduce waste ratio
    Bulk: { cost: 5000, eFactor: 0.6 } // High optimization in bulk
};
