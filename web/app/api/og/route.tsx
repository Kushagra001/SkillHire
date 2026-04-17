import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        
        const title = searchParams.get("title") || searchParams.get("role") || "New Job Opportunity";
        const subtitle = searchParams.get("subtitle") || 
                         (searchParams.get("company") ? `Hiring at ${searchParams.get("company")}` : "SkillHire.in");
        const type = searchParams.get("type") || "job";
        
        const isOrganic = type === "organic" || subtitle.includes("Career Advice");
        
        // Premium Hex Colors
        const colors = isOrganic 
            ? { primary: "#a78bfa", dark: "#7c3aed", bg: "rgba(124, 58, 237, 0.15)", border: "rgba(124, 58, 237, 0.3)" }
            : { primary: "#34d399", dark: "#059669", bg: "rgba(5, 150, 105, 0.15)", border: "rgba(5, 150, 105, 0.3)" };

        // Base64 encoding the SVG to ensure 100% cross-environment safety in data URIs compared to raw strings
        const svgGrid = `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M0 0v40M0 0h40" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" fill="none"/></svg>`;
        const encodedGrid = btoa(svgGrid);
        const bgUrl = `url('data:image/svg+xml;base64,${encodedGrid}')`;

        return new ImageResponse(
            (
                <div 
                    style={{ 
                        display: "flex", width: "100%", height: "100%", 
                        backgroundColor: "#030303", 
                        backgroundImage: bgUrl,
                        padding: "50px", fontFamily: "sans-serif"
                    }}
                >
                    {/* Inner Card Container */}
                    <div 
                        style={{ 
                            display: "flex", flexDirection: "column", width: "100%", height: "100%",
                            backgroundColor: "#0a0a0b", border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "24px", padding: "50px", position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        {/* Premium Decorative Glows -> Using standard SVG circles instead of CSS radial-gradients.
                            This provides the exact same neon-mesh effect but is 100% immune to CSS parsing crashes in Satori! */}
                        <svg width="600" height="600" style={{ position: "absolute", top: "-200px", right: "-200px", opacity: 0.15 }}>
                            <circle cx="300" cy="300" r="300" fill={colors.primary} />
                        </svg>
                        <svg width="800" height="800" style={{ position: "absolute", bottom: "-300px", left: "-250px", opacity: 0.1 }}>
                            <circle cx="400" cy="400" r="400" fill={colors.dark} />
                        </svg>

                        {/* Foreground Content - Set above the SVG backgrounds */}
                        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
                            
                            {/* Header Row */}
                            <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <div style={{ display: "flex", width: "56px", height: "56px", borderRadius: "16px", backgroundColor: colors.dark, alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "30px", color: "white", marginRight: "16px" }}>
                                        S
                                    </div>
                                    <div style={{ fontSize: "34px", fontWeight: "bold", color: "white", letterSpacing: "-1px" }}>SkillHire</div>
                                </div>
                                
                                <div style={{ display: "flex", backgroundColor: colors.bg, border: `1px solid ${colors.border}`, padding: "8px 20px", borderRadius: "100px" }}>
                                    <span style={{ color: colors.primary, fontSize: "15px", fontWeight: "800", letterSpacing: "2.5px" }}>
                                        {isOrganic ? "CAREER INSIGHTS" : "OPEN OPPORTUNITY"}
                                    </span>
                                </div>
                            </div>

                            {/* Middle Content Wrapper 
                                FIX FOR OVERLAPPING TEXT: Using flexGrow: 1 with justifyContent: center vertically centers the text block securely within the dynamic remaining space.
                                This is much safer than manipulating auto-margins which broke the layout calculation. */}
                            <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center", paddingTop: "20px", paddingBottom: "20px" }}>
                                <div style={{ display: "flex", fontSize: "78px", fontWeight: "900", lineHeight: 1.1, color: "white", letterSpacing: "-2px", marginBottom: "20px" }}>
                                    {title}
                                </div>
                                <div style={{ display: "flex", fontSize: "38px", color: "#a1a1aa", fontWeight: "500", lineHeight: 1.3 }}>
                                    {subtitle}
                                </div>
                            </div>

                            {/* Footer Row */}
                            <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "35px" }}>
                                <div style={{ fontSize: "20px", color: "#71717a", fontWeight: "700", letterSpacing: "2px" }}>
                                    NEXT-GEN TALENT PLATFORM
                                </div>
                                <div style={{ fontSize: "24px", color: "#a1a1aa", display: "flex", alignItems: "center", fontWeight: "500" }}>
                                    {isOrganic ? "explore at" : "apply now at"} 
                                    <strong style={{ color: colors.primary, marginLeft: "8px", fontWeight: "800" }}>skillhire.in</strong>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            ),
            { 
                width: 1200, 
                height: 630,
                headers: {
                    "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=600",
                }
            }
        );
    } catch (e: any) {
        return new Response(`Error: ${e.message}`, { status: 500 });
    }
}
