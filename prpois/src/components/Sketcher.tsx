import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface SketcherProps {
    onSmilesChange: (smiles: string) => void;
    initialSmiles?: string;
}

declare global {
    interface Window {
        JSApplet?: any;
        jsmeApplet?: any;
        jsmeOnLoad?: () => void;
    }
}

export const Sketcher: React.FC<SketcherProps> = ({ onSmilesChange, initialSmiles = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const jsmeAppletRef = useRef<any>(null);
    const [uniqueId] = useState(`jsme_${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        // Load JSME script dynamically
        if (!window.JSApplet && !document.getElementById('jsme-script')) {
            const script = document.createElement('script');
            script.id = 'jsme-script';
            script.src = 'https://jsme-editor.github.io/dist/jsme/jsme.nocache.js';
            script.async = true;
            document.body.appendChild(script);

            window.jsmeOnLoad = () => {
                initApplet();
            };
        } else if (window.JSApplet) {
            initApplet();
        }

        return () => {
            // Clean up might be needed if component unmounts frequently, but JSME is heavy
            // window.jsmeOnLoad = undefined; 
            // jsmeAppletRef.current = null;
        };
    }, []);

    const initApplet = () => {
        if (containerRef.current && window.JSApplet && !jsmeAppletRef.current) {
            try {
                jsmeAppletRef.current = new window.JSApplet.JSME(uniqueId, "100%", "400px", {
                    "options": "oldlook,star,nogui,noquery" // Customization options
                });
                jsmeAppletRef.current.setCallBack("AfterStructureModified", (jsmeEvent: any) => {
                    const smiles = jsmeEvent.src.smiles();
                    onSmilesChange(smiles);
                });

                if (initialSmiles) {
                    jsmeAppletRef.current.readSMILES(initialSmiles);
                }
            } catch (e) {
                console.error("JSME Initialization Error:", e);
            }
        }
    };

    return (
        <Card className="bg-[#161b22] border-gray-800 shadow-[0_0_15px_rgba(46,160,67,0.1)]">
            <CardHeader>
                <CardTitle className="text-gray-100 flex items-center gap-2">
                    🧬 Molecular Sketcher
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    id={uniqueId}
                    ref={containerRef}
                    className="w-full h-[400px] bg-white rounded-md overflow-hidden relative z-0"
                >
                    {/* JSME will inject its UI here */}
                </div>
                <p className="text-sm text-gray-400 mt-2">
                    Draw a molecule to automatically generate SMILES and fetch RDKit properties.
                </p>
            </CardContent>
        </Card>
    );
};
