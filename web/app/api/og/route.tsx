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
                    <div style={{ display: "flex", width: "100%", height: "100%", backgroundColor: "#050505", color: "white", position: "relative" }}>
                        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "60px" }}>
                            <div style={{ display: "flex", alignItems: "center", marginBottom: "auto" }}>
                                <div style={{ display: "flex", width: "45px", height: "45px", borderRadius: "10px", backgroundColor: "#8b5cf6", alignItems: "center", justifyContent: "center", fontWeight: "bold", marginRight: "12px" }}>S</div>
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
                <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", backgroundColor: "#09090b", color: "white" }}>
                    <div style={{ display: "flex", flexDirection: "column", padding: "80px 60px", flex: 1 }}>
                        <div style={{ display: "flex", padding: "10px 20px", borderRadius: "50px", backgroundColor: "#1e1e1e", border: "1px solid #333", color: "#10b981", fontSize: "16px", fontWeight: "bold", marginBottom: "30px", alignSelf: "flex-start" }}>
                            OPEN POSITION
                        </div>
                        <div style={{ fontSize: "72px", fontWeight: "bold", lineHeight: 1.1, marginBottom: "20px", display: "flex" }}>{title}</div>
                        <div style={{ fontSize: "36px", color: "#94a3b8", display: "flex" }}>{subtitle}</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #222", padding: "40px 60px", backgroundColor: "#050505" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ display: "flex", width: "50px", height: "50px", borderRadius: "12px", backgroundColor: "#10b981", alignItems: "center", justifyContent: "center", fontWeight: "bold", marginRight: "15px" }}>S</div>
                            <span style={{ fontSize: "30px", fontWeight: "bold" }}>SkillHire</span>
                        </div>
                        <div style={{ fontSize: "24px", color: "#94a3b8", display: "flex" }}>join us at <strong style={{ color: "white", marginLeft: "8px" }}>skillhire.in</strong></div>
                    </div>
                </div>
            ),
            { 
                width: 1200, 
                height: 630,
                debug: false
            }
        );
    } catch (e: any) {
        return new Response(`Error: ${e.message}`, { status: 500 });
    }
}
