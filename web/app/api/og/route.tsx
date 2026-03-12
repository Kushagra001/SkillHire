import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Tech Insights by SkillHire";
    const subtitle =
        searchParams.get("subtitle") || "Career advice for modern developers";

    return new ImageResponse(
        (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, #0f0f1a 0%, #1a1040 100%)",
                    padding: "60px",
                    fontFamily: "sans-serif",
                    position: "relative",
                }}
            >
                {/* Decorative top-right orb */}
                <div
                    style={{
                        position: "absolute",
                        top: "-80px",
                        right: "-80px",
                        width: "400px",
                        height: "400px",
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)",
                    }}
                />
                {/* Decorative bottom-left orb */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "-60px",
                        left: "-60px",
                        width: "300px",
                        height: "300px",
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)",
                    }}
                />

                {/* Logo / Brand row */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                            fontSize: "22px",
                            fontWeight: 800,
                            color: "white",
                        }}
                    >
                        S
                    </div>
                    <span
                        style={{
                            fontSize: "26px",
                            fontWeight: 700,
                            color: "white",
                            letterSpacing: "-0.5px",
                        }}
                    >
                        SkillHire
                    </span>
                    <div
                        style={{
                            display: "flex",
                            marginLeft: "12px",
                            padding: "4px 14px",
                            borderRadius: "999px",
                            background: "rgba(139, 92, 246, 0.2)",
                            border: "1px solid rgba(139, 92, 246, 0.5)",
                            fontSize: "14px",
                            color: "#a78bfa",
                            fontWeight: 500,
                        }}
                    >
                        Insights
                    </div>
                </div>

                {/* Main content */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "18px",
                        flex: 1,
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            fontSize: "16px",
                            color: "#a78bfa",
                            fontWeight: 600,
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                        }}
                    >
                        💡 Career Advice
                    </div>
                    <div
                        style={{
                            display: "flex",
                            fontSize: "58px",
                            fontWeight: 800,
                            color: "white",
                            lineHeight: 1.1,
                            letterSpacing: "-1.5px",
                            maxWidth: "820px",
                        }}
                    >
                        {title}
                    </div>
                    <div
                        style={{
                            display: "flex",
                            fontSize: "24px",
                            color: "#94a3b8",
                            fontWeight: 400,
                            maxWidth: "700px",
                            lineHeight: 1.5,
                        }}
                    >
                        {subtitle}
                    </div>
                </div>

                {/* Bottom row CTA */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span
                        style={{
                            fontSize: "18px",
                            color: "#64748b",
                        }}
                    >
                        skillhire.in
                    </span>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 24px",
                            borderRadius: "10px",
                            background: "linear-gradient(90deg, #8b5cf6, #3b82f6)",
                            color: "white",
                            fontSize: "17px",
                            fontWeight: 600,
                        }}
                    >
                        Follow for daily insights →
                    </div>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
