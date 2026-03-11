import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { Molecule } from '../data/mockDatabase';

interface RadarChartPanelProps {
    molecule: Molecule;
}

export const RadarChartPanel: React.FC<RadarChartPanelProps> = ({ molecule }) => {
    const data = [
        { subject: 'LIPO', A: molecule.swissAdme.lipo * 100, fullMark: 100 },
        { subject: 'SIZE', A: molecule.swissAdme.size * 100, fullMark: 100 },
        { subject: 'POLAR', A: molecule.swissAdme.polar * 100, fullMark: 100 },
        { subject: 'INSOLU', A: molecule.swissAdme.insolu * 100, fullMark: 100 },
        { subject: 'INSATU', A: molecule.swissAdme.insatu * 100, fullMark: 100 },
        { subject: 'FLEX', A: molecule.swissAdme.flex * 100, fullMark: 100 },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="glass-card p-6 h-full flex flex-col"
        >
            <div className="mb-4">
                <h2 className="text-lg font-light text-white flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>SwissADME Bioavailability Radar</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">Physicochemical space for oral bioavailability</p>
            </div>

            <div className="flex-1 w-full min-h-[250px] relative">
                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-neon-blue rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace' }}
                        />
                        <PolarRadiusAxis
                            angle={30}
                            domain={[0, 100]}
                            tick={false}
                            axisLine={false}
                        />
                        <Radar
                            name="Molecule"
                            dataKey="A"
                            stroke="#58a6ff"
                            strokeWidth={2}
                            fill="#58a6ff"
                            fillOpacity={0.3}
                            isAnimationActive={true}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-2 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-mono">Profile Density</span>
                    <span className="text-cyan-400">{Math.round((data.reduce((acc, curr) => acc + curr.A, 0) / 600) * 100)}%</span>
                </div>
            </div>
        </motion.div>
    );
};
