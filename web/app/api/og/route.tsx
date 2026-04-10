import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// SVG Dot Pattern for Tech Aesthetic
const DotPattern = () => (
    <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, opacity: 0.15 }}>
        <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle fill="#ffffff" cx="2" cy="2" r="1.5"></circle>
            </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#dots)"></rect>
    </svg>
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Tech Insights by SkillHire";
    const subtitle = searchParams.get("subtitle") || "Career advice for modern developers";
    const type = searchParams.get("type") || "job";
    
    // Auto-detect organic posts if passed explicitly or matched by subtitle
    const isOrganic = type === "organic" || subtitle.includes("Career Advice");

    if (isOrganic) {
        return new ImageResponse(
            (
                <div style={{ display: "flex", width: "100%", height: "100%", background: "#050505", fontFamily: "sans-serif", position: "relative", overflow: "hidden" }}>
                    {/* Abstract Lighting */}
                    <div style={{ position: "absolute", width: "800px", height: "800px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", top: "-400px", right: "-200px" }} />
                    <div style={{ position: "absolute", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", bottom: "-200px", left: "-200px" }} />
                    
                    <DotPattern />

                    {/* Split Layout */}
                    <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "100%", padding: "40px" }}>
                        
                        {/* Left Column: Typography */}
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "55%", height: "100%", padding: "20px" }}>
                            
                            {/* Brand Header */}
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ display: "flex", width: "44px", height: "44px", borderRadius: "10px", background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", color: "white", fontSize: "20px", fontWeight: 800, alignItems: "center", justifyContent: "center" }}>S</div>
                                <span style={{ color: "white", fontSize: "26px", fontWeight: 700, letterSpacing: "-0.5px" }}>SkillHire</span>
                            </div>

                            {/* Core Text */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <span style={{ color: "#a78bfa", fontSize: "16px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase" }}>💡 Career Advice</span>
                                <span style={{ color: "white", fontSize: "60px", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px" }}>{title}</span>
                                <span style={{ color: "#94a3b8", fontSize: "24px", fontWeight: 400, marginTop: "10px", lineHeight: 1.4 }}>{subtitle}</span>
                            </div>

                            {/* Footer Tag */}
                            <div style={{ display: "flex" }}>
                                <div style={{ display: "flex", padding: "10px 24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "100px", color: "#cbd5e1", fontSize: "16px", fontWeight: 500 }}>
                                    Follow @SkillHire for daily tech insights
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Code Editor Graphic */}
                        <div style={{ display: "flex", width: "45%", height: "100%", padding: "20px", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "85%", background: "#111111", border: "1px solid #333333", borderRadius: "16px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", overflow: "hidden" }}>
                                
                                {/* Editor Top Bar */}
                                <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", background: "#1a1a1a", borderBottom: "1px solid #333333", gap: "8px" }}>
                                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5f56" }} />
                                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffbd2e" }} />
                                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#27c93f" }} />
                                    <div style={{ marginLeft: "16px", color: "#666666", fontSize: "14px", fontFamily: "monospace" }}>insight.ts</div>
                                </div>
                                
                                {/* Editor Code Lines */}
                                <div style={{ display: "flex", flexDirection: "column", padding: "24px", gap: "16px", fontFamily: "monospace", fontSize: "16px" }}>
                                    <div style={{ display: "flex", color: "#c678dd" }}>function <span style={{ color: "#61afef", marginLeft: "8px" }}>levelUp</span><span style={{ color: "#abb2bf" }}>() {"{"}</span></div>
                                    <div style={{ display: "flex", color: "#98c379", marginLeft: "24px" }}>const skills = await learn();</div>
                                    <div style={{ display: "flex", color: "#98c379", marginLeft: "24px" }}>const network = build();</div>
                                    <div style={{ display: "flex", color: "#e5c07b", marginLeft: "24px", marginTop: "8px" }}>if (skills && network) {"{"}</div>
                                    <div style={{ display: "flex", color: "#61afef", marginLeft: "48px" }}>return <span style={{ color: "#98c379", marginLeft: "8px" }}>"Hired!"</span><span style={{ color: "#abb2bf" }}>;</span></div>
                                    <div style={{ display: "flex", color: "#e5c07b", marginLeft: "24px" }}>{"}"}</div>
                                    <div style={{ display: "flex", color: "#abb2bf" }}>{"}"}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    }

    // Default Job Application OG Image
    return new ImageResponse(
        (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", background: "linear-gradient(135deg, #09090b 0%, #161622 100%)", padding: "60px", fontFamily: "sans-serif", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)" }} />
                <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)" }} />
                
                <DotPattern />

                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", flex: 1 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
                        <div style={{ display: "flex", padding: "6px 16px", borderRadius: "99px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", color: "#10b981", fontSize: "14px", fontWeight: 700, width: "fit-content", textTransform: "uppercase", letterSpacing: "2px" }}>🚀 Actively Hiring</div>
                        <div style={{ display: "flex", fontSize: "64px", fontWeight: 800, color: "white", lineHeight: 1.1, letterSpacing: "-1.5px" }}>{title}</div>
                        <div style={{ display: "flex", fontSize: "28px", color: "#94a3b8", fontWeight: 400 }}>{subtitle}</div>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "40px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div style={{ display: "flex", width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #10b981, #3b82f6)", color: "white", fontSize: "22px", fontWeight: 800, alignItems: "center", justifyContent: "center" }}>S</div>
                        <span style={{ fontSize: "26px", fontWeight: 700, color: "white", letterSpacing: "-0.5px" }}>SkillHire</span>
                    </div>
                    <div style={{ display: "flex", fontSize: "20px", color: "#cbd5e1" }}>apply at <strong style={{ color: "white", marginLeft: "6px", fontWeight: 700 }}>skillhire.in</strong></div>
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}
