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
        
        // Satori-Safe Solid colors
        const colors = isOrganic 
            ? { primary: "rgb(139, 92, 246)", accent: "rgba(139, 92, 246, 0.2)" } 
            : { primary: "rgb(16, 185, 129)", accent: "rgba(16, 185, 129, 0.2)" };

        return new ImageResponse(
            (
                <div style={{ display: "flex", width: "100%", height: "100%", backgroundColor: "#060606", color: "white", position: "relative" }}>
                    
                    {/* NO GRADIENTS OR MESH GLOWS FOR FINAL ISOLATION TEST */}

                    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "80px", position: "relative" }}>
                        
                        {/* HEADER - Solid Branding */}
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "auto" }}>
                            <div style={{ display: "flex", width: "60px", height: "60px", borderRadius: "14px", backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", fontWeight: "bold", marginRight: "16px", fontSize: "28px" }}>S</div>
                            <span style={{ fontSize: "36px", fontWeight: "bold", letterSpacing: "-1px" }}>SkillHire.in</span>
                        </div>

                        {/* CONTENT AREA */}
                        <div style={{ display: "flex", flexDirection: "column", maxWidth: "90%" }}>
                            <div style={{ display: "flex", backgroundColor: colors.accent, border: `1px solid ${colors.primary}`, padding: "8px 20px", borderRadius: "10px", alignSelf: "flex-start", marginBottom: "30px" }}>
                                <span style={{ color: colors.primary, fontSize: "16px", fontWeight: "900", letterSpacing: "3px" }}>
                                    {isOrganic ? "INSIGHTS" : "OPPORTUNITY"}
                                </span>
                            </div>
                            
                            <h1 style={{ fontSize: "80px", fontWeight: "900", lineHeight: 1, marginBottom: "28px", color: "#ffffff", letterSpacing: "-3px" }}>
                                {title}
                            </h1>
                            
                            <p style={{ color: "#94a3b8", fontSize: "36px", fontWeight: "500", lineHeight: 1.4, marginBottom: "40px" }}>
                                {subtitle}
                            </p>
                        </div>

                        {/* FOOTER - Professional Bar */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid rgba(255,255,255,0.05)", paddingTop: "50px", marginTop: "auto" }}>
                            <div style={{ display: "flex", alignItems: "center", color: "#4b5563", fontSize: "22px", fontWeight: "bold", letterSpacing: "1px" }}>
                                NEXT-GEN JOB DISTRIBUTION
                            </div>
                            <div style={{ fontSize: "24px", color: "#94a3b8" }}>
                                apply now at <strong style={{ color: colors.primary, marginLeft: "8px" }}>skillhire.in</strong>
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
