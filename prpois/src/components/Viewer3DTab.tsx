import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Molecule } from '../data/mockDatabase';
import { Layers, RefreshCw, ZoomIn, Info, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Viewer3DTabProps {
    targetMolecule: Molecule | null;
}

declare global {
    interface Window {
        molstar?: any;
    }
}

export const Viewer3DTab: React.FC<Viewer3DTabProps> = ({ targetMolecule }) => {
    const viewerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [viewerError, setViewerError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        const initMolstar = async () => {
            if (targetMolecule?.smiles && viewerRef.current) {
                setIsLoading(true);
                setViewerError(null);
                try {
                    // We need to inject the Molstar CSS and JS if not present
                    if (!document.getElementById('molstar-css')) {
                        const link = document.createElement('link');
                        link.id = 'molstar-css';
                        link.rel = 'stylesheet';
                        link.href = 'https://cdn.jsdelivr.net/npm/molstar@3.39.0/build/viewer/molstar.css';
                        document.head.appendChild(link);
                    }

                    if (!window.molstar && !document.getElementById('molstar-js')) {
                        const script = document.createElement('script');
                        script.id = 'molstar-js';
                        script.src = 'https://cdn.jsdelivr.net/npm/molstar@3.39.0/build/viewer/molstar.js';
                        script.async = true;

                        await new Promise((resolve, reject) => {
                            script.onload = resolve;
                            script.onerror = () => reject(new Error('Failed to load Molstar script'));
                            document.body.appendChild(script);
                        });
                    } else if (!window.molstar) {
                        // Wait for script to finish loading if it exists but window property isn't set yet
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }

                    if (!isMounted) return;

                    // Clear previous viewer
                    viewerRef.current.innerHTML = '';

                    // 1. Fetch the PubChem CID 
                    let cid = null;

                    // Try Name first for more reliable hit
                    if (targetMolecule.name && targetMolecule.name !== targetMolecule.smiles) {
                        try {
                            const nameRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(targetMolecule.name)}/cids/JSON`);
                            if (nameRes.ok) {
                                const nameData = await nameRes.json();
                                if (nameData.IdentifierList?.CID?.[0]) cid = nameData.IdentifierList.CID[0];
                            }
                        } catch (e) {
                            console.warn("Name CID fetch failed, falling back to SMILES");
                        }
                    }

                    // Fallback to SMILES
                    if (!cid && targetMolecule.smiles) {
                        try {
                            const smilesRes = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(targetMolecule.smiles)}/cids/JSON`);
                            if (smilesRes.ok) {
                                const smilesData = await smilesRes.json();
                                if (smilesData.IdentifierList?.CID?.[0]) cid = smilesData.IdentifierList.CID[0];
                            }
                        } catch (e) {
                            console.warn("SMILES CID fetch failed");
                        }
                    }

                    if (isMounted && cid) {
                        // Initialize Molstar Viewer
                        if (window.molstar) {
                            const viewer = await window.molstar.Viewer.create(viewerRef.current, {
                                layoutIsExpanded: false,
                                layoutShowControls: false,
                                layoutShowRemoteState: false,
                                layoutShowSequence: false,
                                layoutShowLog: false,
                                layoutShowLeftPanel: false,
                                viewportShowExpand: true,
                                viewportShowSelectionMode: false,
                                viewportShowAnimation: false,
                            });

                            // Fetch the explicit 3D structure SDF from PubChem
                            const sdfUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/record/SDF/?record_type=3d`;
                            await viewer.loadStructureFromUrl(sdfUrl, 'sdf');
                        }
                    } else {
                        if (isMounted) setViewerError('Could not find 3D coordinates for this molecule.');
                    }
                } catch (error) {
                    console.error("Failed to initialize 3D rendering", error);
                    if (isMounted) setViewerError('Failed to initialize 3D viewer. Network or structural error.');
                } finally {
                    if (isMounted) setIsLoading(false);
                }
            }
        };

        // Small delay to ensure DOM is ready on initial mount
        const timeoutId = setTimeout(initMolstar, 100);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [targetMolecule]);

    if (!targetMolecule) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto flex flex-col items-center justify-center p-20 text-center space-y-6"
            >
                <div className="w-24 h-24 rounded-full bg-black/40 border border-white/5 flex items-center justify-center shadow-2xl relative">
                    <Layers size={40} className="text-gray-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-light text-white tracking-widest">3D ENGINE INACTIVE</h2>
                    <p className="text-gray-400 font-medium">No target molecule selected for visualization.</p>
                </div>
                <div className="bg-neon-blue/10 border border-neon-blue/20 text-neon-blue px-6 py-3 rounded-lg text-sm max-w-md">
                    Please search in the Repurposing engine or input a SMILES string to populate the 3D topology array.
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto py-8"
        >
            <div className="mb-8 border-b border-white/10 pb-6 flex justify-between items-end">
                <div>
                    <div className="text-neon-blue text-xs font-mono uppercase tracking-widest mb-2 flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_8px_#58a6ff] animate-pulse"></span>
                        <span>Topology Engine &gt; {targetMolecule.name}</span>
                    </div>
                    <h1 className="text-3xl font-light text-white tracking-widest">3D MOLECULAR STRUCTURE</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="col-span-1 lg:col-span-3 bg-[#161b22] border-gray-800 shadow-[0_0_30px_rgba(88,166,255,0.05)] h-[600px] flex flex-col relative overflow-hidden group">
                    <CardHeader className="border-b border-white/5 bg-black/40 z-10 flex flex-row items-center justify-between py-3">
                        <div className="flex items-center space-x-3">
                            <Layers size={18} className="text-neon-blue" />
                            <CardTitle className="text-sm font-medium tracking-wide text-gray-200">Interactive Canvas</CardTitle>
                        </div>
                        <div className="flex space-x-2">
                            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Zoom In">
                                <ZoomIn size={16} />
                            </button>
                            <button
                                onClick={() => setIsLoading(true)}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                title="Reset View"
                            >
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative bg-black">
                        {isLoading && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                <div className="w-12 h-12 border-4 border-white/10 border-t-neon-blue rounded-full animate-spin mb-4"></div>
                                <div className="text-neon-blue font-mono text-xs uppercase tracking-widest animate-pulse">Computing Spatial Coordinates...</div>
                            </div>
                        )}
                        {viewerError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 bg-black z-20 space-y-4">
                                <AlertTriangle size={32} />
                                <p>{viewerError}</p>
                            </div>
                        )}
                        <div
                            ref={viewerRef}
                            className={`w-full h-full transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                        />

                        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none flex justify-between items-end">
                            <div className="bg-black/60 backdrop-blur border border-white/10 px-3 py-1.5 rounded text-xs text-gray-400 font-mono">
                                Model: {targetMolecule.smiles}
                            </div>
                            <div className="bg-black/60 backdrop-blur border border-white/10 px-3 py-1.5 rounded text-xs text-gray-400 flex items-center">
                                <Info size={14} className="mr-2 text-neon-blue" />
                                Click and drag to rotate. Scroll to zoom.
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="col-span-1 space-y-6">
                    <Card className="bg-[#161b22] border-gray-800">
                        <CardHeader className="border-b border-white/5 pb-4">
                            <CardTitle className="text-sm text-gray-400 font-mono uppercase tracking-widest">Spatial Properties</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div>
                                <div className="text-xs text-gray-500 font-mono mb-1 uppercase">Topological Polar Surface Area (TPSA)</div>
                                <div className="text-2xl font-light text-white flex items-baseline space-x-1">
                                    <span>{targetMolecule.tpsa ? targetMolecule.tpsa.toFixed(2) : '--'}</span>
                                    <span className="text-xs text-gray-500">Å²</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-neon-blue to-purple-500"
                                        style={{ width: `${Math.min(((targetMolecule.tpsa || 0) / 150) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs text-gray-500 font-mono mb-1 uppercase">Molecular Flexibility</div>
                                <div className="text-xl font-light text-white">
                                    {targetMolecule.swissAdme?.flex ? targetMolecule.swissAdme.flex.toFixed(2) : 'Moderate'}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <div className="text-xs text-gray-500 leading-relaxed">
                                    3D conformation generated via rapid energy minimization. Conformations shown represent the lowest energy state in vacuum.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};
