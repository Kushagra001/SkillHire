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
        
        // Satori-Safe colors
        const colors = isOrganic 
            ? { primary: "rgb(167, 139, 250)", dark: "rgb(139, 92, 246)", bg: "rgba(139, 92, 246, 0.1)", border: "rgba(139, 92, 246, 0.3)" }
            : { primary: "rgb(52, 211, 153)", dark: "rgb(16, 185, 129)", bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.3)" };

        // Premium subtle grid background (Satori safe layout)
        const gridSvg = encodeURIComponent(
            `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M0 0v40M0 0h40" stroke="rgba(255,255,255,0.04)" stroke-width="1" fill="none"/></svg>`
        );

        return new ImageResponse(
            (
                <div 
                    style={{ 
                        display: "flex", 
                        width: "100%", 
                        height: "100%", 
                        backgroundColor: "#050505", 
                        backgroundImage: `url("data:image/svg+xml,${gridSvg}")`,
                        alignItems: "center", 
                        justifyContent: "center", 
                        padding: "50px" 
                    }}
                >
                    <div 
                        style={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            backgroundColor: "#111111", 
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderTop: `4px solid ${colors.dark}`,
                            borderRadius: "24px", 
                            padding: "60px", 
                            width: "100%", 
                            height: "100%"
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
                            <div style={{ display: "flex", width: "48px", height: "48px", borderRadius: "12px", backgroundColor: colors.dark, alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "24px", color: "white", marginRight: "16px" }}>
                                S
                            </div>
                            <div style={{ fontSize: "32px", fontWeight: "bold", color: "white" }}>SkillHire</div>
                        </div>

                        {/* Badge */}
                        <div style={{ display: "flex", backgroundColor: colors.bg, border: `1px solid ${colors.border}`, padding: "8px 20px", borderRadius: "100px", alignSelf: "flex-start", marginBottom: "30px" }}>
                            <span style={{ color: colors.primary, fontSize: "14px", fontWeight: "800", letterSpacing: "2px" }}>
                                {isOrganic ? "CAREER INSIGHTS" : "OPEN OPPORTUNITY"}
                            </span>
                        </div>

                        {/* Typgraphy */}
                        <div style={{ display: "flex", fontSize: "76px", fontWeight: "900", lineHeight: 1.05, marginBottom: "20px", color: "white" }}>
                            {title}
                        </div>
                        
                        <div style={{ display: "flex", fontSize: "36px", color: "#a1a1aa", fontWeight: "500", marginBottom: "auto", lineHeight: 1.3 }}>
                            {subtitle}
                        </div>

                        {/* Footer */}
                        <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "40px" }}>
                             <div style={{ fontSize: "20px", color: "#71717a", fontWeight: "700", letterSpacing: "1.5px" }}>
                                NEXT-GEN TALENT PLATFORM
                            </div>
                             <div style={{ fontSize: "24px", color: "#a1a1aa", display: "flex", alignItems: "center" }}>
                                {isOrganic ? "explore at" : "apply now at"} 
                                <strong style={{ color: colors.primary, marginLeft: "8px" }}>skillhire.in</strong>
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
