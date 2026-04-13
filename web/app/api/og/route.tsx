import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    try {
        // Switch back to explicit URL parsing (more stable in some Edge versions)
        const { searchParams } = new URL(req.url);
        
        const title = searchParams.get("title") || searchParams.get("role") || "New Job Opportunity";
        const subtitle = searchParams.get("subtitle") || 
                         (searchParams.get("company") ? `Hiring at ${searchParams.get("company")}` : "SkillHire.in");
        const type = searchParams.get("type") || "job";
        
        const isOrganic = type === "organic" || subtitle.includes("Career Advice");
        const themeColor = isOrganic ? "rgb(139, 92, 246)" : "rgb(16, 185, 129)";

        // REVERTING TO VERIFIED STRUCTURAL PATTERN (Centered Flex, No-Relative)
        return new ImageResponse(
            (
                <div 
                    style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        width: "100%", 
                        height: "100%", 
                        backgroundColor: "#09090b", 
                        color: "white",
                        padding: "80px",
                        textAlign: "center"
                    }}
                >
                    {/* Brand Banner (Top) */}
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "60px" }}>
                        <div style={{ display: "flex", width: "50px", height: "50px", borderRadius: "12px", backgroundColor: themeColor, alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "24px", color: "white" }}>
                            S
                        </div>
                        <div style={{ marginLeft: "15px", fontSize: "32px", fontWeight: "bold" }}>SkillHire.in</div>
                    </div>

                    {/* Badge */}
                    <div style={{ display: "flex", backgroundColor: "rgba(255,255,255,0.05)", border: `1px solid ${themeColor}`, padding: "6px 16px", borderRadius: "8px", marginBottom: "30px" }}>
                        <span style={{ color: themeColor, fontSize: "14px", fontWeight: "bold", letterSpacing: "2px" }}>
                            {isOrganic ? "INSIGHTS" : "OPPORTUNITY"}
                        </span>
                    </div>

                    {/* Main Content */}
                    <div style={{ display: "flex", fontSize: "75px", fontWeight: "900", lineHeight: 1.1, marginBottom: "20px" }}>
                        {title}
                    </div>
                    
                    <div style={{ display: "flex", fontSize: "36px", color: "#94a3b8", fontWeight: "500" }}>
                        {subtitle}
                    </div>

                    {/* Simple Footer */}
                    <div style={{ display: "flex", marginTop: "60px", fontSize: "20px", color: "#4b5563", fontWeight: "600", letterSpacing: "1px" }}>
                        JOBS • CAREERS • TECH INSIGHTS
                    </div>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    } catch (e: any) {
        return new Response(`Error: ${e.message}`, { status: 500 });
    }
}
