import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        
        // Handle both parameter sets for compatibility
        const title = searchParams.get("title") || searchParams.get("role") || "Tech Insights by SkillHire";
        const subtitle = searchParams.get("subtitle") || 
                         (searchParams.get("company") ? `Hiring at ${searchParams.get("company")}` : "Career advice for modern developers");
        const type = searchParams.get("type") || "job";
        
        const isOrganic = type === "organic" || subtitle.includes("Career Advice");
        
        // Satori-Safe RGBA colors
        const colors = isOrganic 
            ? { primary: "rgb(139, 92, 246)", accent: "rgba(139, 92, 246, 0.2)", deep: "rgba(139, 92, 246, 0.1)" } 
            : { primary: "rgb(16, 185, 129)", accent: "rgba(16, 185, 129, 0.2)", deep: "rgba(16, 185, 129, 0.1)" };

        return new ImageResponse(
            (
                <div style={{ display: "flex", width: "100%", height: "100%", backgroundColor: "#060606", color: "white", position: "relative", overflow: "hidden" }}>
                    
                    {/* PREMIUM BACKGROUND GRAPHICS (Sanitized for Satori) */}
                    {/* Background Mesh Glow 1 (No Inset) */}
                    <div style={{ position: "absolute", top: "-150px", right: "-150px", width: "600px", height: "600px", borderRadius: "300px", background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)` }} />
                    
                    {/* Background Mesh Glow 2 (No Inset) */}
                    <div style={{ position: "absolute", bottom: "-100px", left: "-100px", width: "500px", height: "500px", borderRadius: "250px", background: `radial-gradient(circle, ${colors.deep} 0%, transparent 70%)` }} />
                    
                    {/* Subtle Technical Grid (Explicit positioning + No comma-separated gradients) */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: "linear-gradient(#333 1px, transparent 1px)", backgroundSize: "100% 40px" }} />

                    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "60px", position: "relative" }}>
                        
                        {/* HEADER */}
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "auto" }}>
                            <div style={{ display: "flex", width: "45px", height: "45px", borderRadius: "10px", backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", fontWeight: "bold", marginRight: "12px" }}>S</div>
                            <span style={{ fontSize: "28px", fontWeight: "bold", letterSpacing: "-0.5px" }}>SkillHire</span>
                        </div>

                        {/* CONTENT AREA */}
                        <div style={{ display: "flex", flexDirection: "column", maxWidth: "90%" }}>
                            <div style={{ display: "flex", backgroundColor: colors.deep, border: `1px solid ${colors.accent}`, padding: "6px 16px", borderRadius: "8px", alignSelf: "flex-start", marginBottom: "24px" }}>
                                <span style={{ color: colors.primary, fontSize: "14px", fontWeight: "900", letterSpacing: "2px" }}>
                                    {isOrganic ? "INSIGHTS" : "OPPORTUNITY"}
                                </span>
                            </div>
                            
                            <h1 style={{ fontSize: "74px", fontWeight: "900", lineHeight: 1, marginBottom: "24px", color: "#ffffff", letterSpacing: "-2px" }}>
                                {title}
                            </h1>
                            
                            <p style={{ color: "#94a3b8", fontSize: "32px", fontWeight: "500", lineHeight: 1.4, marginBottom: "40px" }}>
                                {subtitle}
                            </p>
                        </div>

                        {/* FOOTER BAR */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "40px", marginTop: "auto" }}>
                            <div style={{ display: "flex", alignItems: "center", color: "#64748b", fontSize: "18px", fontWeight: "bold" }}>
                                HIRED ON SKILLHIRE.IN
                            </div>
                            <div style={{ fontSize: "22px", color: "#94a3b8" }}>
                                join 5,000+ devs at <strong style={{ color: "white", marginLeft: "6px" }}>skillhire.in</strong>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    } catch (e: any) {
        return new Response(`Error: ${e.message}`, { status: 500 });
    }
}
