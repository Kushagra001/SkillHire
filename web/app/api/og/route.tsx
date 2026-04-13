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

        if (isOrganic) {
            return new ImageResponse(
                (
                    <div style={{ display: "flex", width: "100%", height: "100%", background: "#050505", color: "white", position: "relative" }}>
                        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "60px" }}>
                            <div style={{ display: "flex", alignItems: "center", marginBottom: "auto" }}>
                                <div style={{ display: "flex", width: "45px", height: "45px", borderRadius: "10px", background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", alignItems: "center", justifyContent: "center", fontWeight: "bold", marginRight: "12px" }}>S</div>
                                <span style={{ fontSize: "28px", fontWeight: "bold" }}>SkillHire</span>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ color: "#a78bfa", fontSize: "18px", fontWeight: "bold", letterSpacing: "2px", marginBottom: "16px" }}>CAREER ADVICE</span>
                                <span style={{ fontSize: "64px", fontWeight: "bold", lineHeight: 1.1, marginBottom: "20px" }}>{title}</span>
                                <span style={{ color: "#94a3b8", fontSize: "28px", marginBottom: "40px" }}>{subtitle}</span>
                            </div>

                            <div style={{ color: "#94a3b8", fontSize: "18px", marginTop: "auto" }}>skillhire.in • daily tech insights</div>
                        </div>
                    </div>
                ),
                { width: 1200, height: 630 }
            );
        }

        return new ImageResponse(
            (
                <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#09090b", color: "white" }}>
                    <div style={{ display: "flex", flexDirection: "column", padding: "60px", flex: 1 }}>
                        <div style={{ display: "flex", padding: "10px 20px", borderRadius: "50px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontSize: "16px", fontWeight: "bold", marginBottom: "30px", alignSelf: "flex-start" }}>
                            ACTIVELY HIRING
                        </div>
                        <div style={{ fontSize: "70px", fontWeight: "bold", lineHeight: 1.1, marginBottom: "20px" }}>{title}</div>
                        <div style={{ fontSize: "32px", color: "#94a3b8" }}>{subtitle}</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", padding: "40px 60px" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ display: "flex", width: "50px", height: "50px", borderRadius: "12px", background: "linear-gradient(135deg, #10b981, #3b82f6)", alignItems: "center", justifyContent: "center", fontWeight: "bold", marginRight: "15px" }}>S</div>
                            <span style={{ fontSize: "30px", fontWeight: "bold" }}>SkillHire</span>
                        </div>
                        <div style={{ fontSize: "24px" }}>apply at <strong style={{ marginLeft: "6px" }}>skillhire.in</strong></div>
                    </div>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    } catch (e: any) {
        return new Response(`Error: ${e.message}`, { status: 500 });
    }
}
