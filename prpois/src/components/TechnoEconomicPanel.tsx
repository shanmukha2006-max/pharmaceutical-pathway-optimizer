import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { Pathway, IndicationPricing, ManufacturingScale, scaleMultipliers } from '../data/mockDatabase';
import { TrendingUp, DollarSign, Leaf } from 'lucide-react';

interface TechnoEconomicPanelProps {
    pathway: Pathway;
    pricing: IndicationPricing;
    scale: ManufacturingScale;
}

// Animated counter component
const AnimatedNumber = ({ value, format = (v: number) => v.toString() }: { value: number, format?: (v: number) => string }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const motionValue = useMotionValue(value);

    useEffect(() => {
        const controls = animate(motionValue, value, {
            duration: 0.8,
            ease: "easeOut",
            onUpdate: (latest) => {
                setDisplayValue(latest);
            }
        });
        return controls.stop;
    }, [value, motionValue]);

    return <span>{format(displayValue)}</span>;
};

export const TechnoEconomicPanel: React.FC<TechnoEconomicPanelProps> = ({ pathway, pricing, scale }) => {
    const multiplier = scaleMultipliers[scale];

    const projectedCost = pathway.baseEstimatedCost * multiplier.cost;
    // Aggregated E-Factor from steps (mock calculation, assuming 25 is base from step)
    const eFactor = 25 * multiplier.eFactor;

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="glass-card p-6 h-full flex flex-col relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <TrendingUp size={120} />
            </div>

            <div className="mb-6 z-10">
                <h2 className="text-lg font-light text-white flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"></span>
                    <span>Techno-Economic Viability</span>
                </h2>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    Scale: {scale.toUpperCase()}
                </div>
            </div>

            <div className="space-y-6 flex-1 z-10">
                <div>
                    <div className="text-xs text-gray-400 flex items-center space-x-1 mb-1">
                        <DollarSign size={12} />
                        <span className="font-mono uppercase">Projected Cost (per batch)</span>
                    </div>
                    <div className="text-4xl font-light text-white tracking-tight">
                        <AnimatedNumber value={projectedCost} format={formatter.format} />
                    </div>
                </div>

                <div>
                    <div className="text-xs text-gray-400 flex items-center space-x-1 mb-1">
                        <Leaf size={12} />
                        <span className="font-mono uppercase">Total E-Factor (Waste/Product)</span>
                    </div>
                    <div className="text-3xl font-light text-white tracking-tight flex items-baseline space-x-2">
                        <AnimatedNumber value={eFactor} format={(v) => v.toFixed(1)} />
                        <span className="text-sm text-gray-500 font-mono">kg/kg</span>
                    </div>
                    {scale === 'Bulk' && eFactor < 20 && (
                        <div className="text-[10px] text-emerald-400 mt-1">Highly sustainable at bulk production</div>
                    )}
                </div>

                <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-semibold">Target Indication</div>
                    <div className="text-sm text-white mb-2">{pricing.targetIndication}</div>

                    <div className="flex justify-between items-end mt-4">
                        <div>
                            <div className="text-[10px] text-gray-500 font-mono uppercase">Market Value</div>
                            <div className="text-lg font-medium text-emerald-400">
                                {formatter.format(pricing.estimatedMarketValue / 1000000)}M
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-gray-500 font-mono uppercase">Net Margin</div>
                            <div className="text-lg font-medium text-neon-blue">
                                {pricing.netProfitMargin}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 z-10">
                <div className="text-[10px] text-gray-500 font-mono flex items-center space-x-2">
                    <span>Entities:</span>
                    <span className="text-purple-400">PATHWAY</span>
                    <span>&#x2022;</span>
                    <span className="text-purple-400">REACTION_STEP</span>
                    <span>&#x2022;</span>
                    <span className="text-purple-400">INDICATION_PRICING</span>
                </div>
            </div>
        </motion.div>
    );
};
