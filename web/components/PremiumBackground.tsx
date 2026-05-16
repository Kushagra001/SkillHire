"use client";

import { motion } from "framer-motion";

export function PremiumBackground({ className = "" }: { className?: string }) {
    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            <div className="absolute inset-0 z-0 bg-background" />

            {/* Premium Noise Texture */}
            <div className="absolute inset-0 z-0 opacity-[0.4] dark:opacity-[0.3] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.5%22/%3E%3C/svg%3E")' }} />

            {/* Animated Aurora Glows */}
            <motion.div 
                animate={{ 
                    x: [0, 80, -40, 0], 
                    y: [0, -60, 80, 0],
                    scale: [1, 1.1, 0.9, 1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-sh-primary/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen" 
            />
            <motion.div 
                animate={{ 
                    x: [0, -80, 50, 0], 
                    y: [0, 80, -50, 0],
                    scale: [1, 0.9, 1.2, 1]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-400/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen" 
            />
            
            {/* Modern Dot Grid Overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.2] dark:opacity-[0.1]" 
                 style={{ 
                     backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)", 
                     backgroundSize: "32px 32px",
                     maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
                     WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)"
                 }} 
            />
        </div>
    );
}
