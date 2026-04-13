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
                    <div style={{ display: "flex", width: "100%", height: "100%", background: "#050505", position: "relative", overflow: "hidden", color: "white" }}>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "60px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ display: "flex", width: "45px", height: "45px", borderRadius: "10px", background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>S</div>
                                <span style={{ fontSize: "28px", fontWeight: "bold" }}>SkillHire</span>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <span style={{ color: "#a78bfa", fontSize: "18px", fontWeight: "bold", letterSpacing: "2px" }}>💡 CAREER ADVICE</span>
                                <span style={{ fontSize: "64px", fontWeight: "bold", lineHeight: 1.1 }}>{title}</span>
                                <span style={{ color: "#94a3b8", fontSize: "28px" }}>{subtitle}</span>
                            </div>

                            <div style={{ color: "#94a3b8", fontSize: "18px" }}>skillhire.in • daily tech insights</div>
                        </div>
                    </div>
                ),
                { width: 1200, height: 630 }
            );
        }

        return new ImageResponse(
            (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", background: "#09090b", padding: "60px", color: "white" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                        <div style={{ display: "flex", padding: "10px 20px", borderRadius: "50px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", fontSize: "16px", fontWeight: "bold" }}>🚀 ACTIVELY HIRING</div>
                        <div style={{ fontSize: "80px", fontWeight: "bold", lineHeight: 1 }}>{title}</div>
                        <div style={{ fontSize: "36px", color: "#94a3b8" }}>{subtitle}</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "40px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                            <div style={{ display: "flex", width: "50px", height: "50px", borderRadius: "12px", background: "linear-gradient(135deg, #10b981, #3b82f6)", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>S</div>
                            <span style={{ fontSize: "30px", fontWeight: "bold" }}>SkillHire</span>
                        </div>
                        <div style={{ fontSize: "24px" }}>apply at <strong>skillhire.in</strong></div>
                    </div>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    } catch (e: any) {
        return new Response(`Error: ${e.message}`, { status: 500 });
    }
}
