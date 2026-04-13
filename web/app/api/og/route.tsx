import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        
        // Use very simple hardcoded strings if params fail
        const title = searchParams.get("title") || "New Job Opportunity";
        const subtitle = searchParams.get("subtitle") || "skillhire.in";

        // NUCLEAR DEBUG VERSION: No gradients, no complex CSS, debug: true
        return new ImageResponse(
            (
                <div 
                    style={{ 
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#09090b',
                        color: 'white',
                        padding: '40px',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ display: 'flex', marginBottom: '30px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '15px', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: 'bold' }}>
                            S
                        </div>
                    </div>
                    
                    <div style={{ fontSize: '70px', fontWeight: 'bold', marginBottom: '20px', lineHeight: 1.1 }}>
                        {title}
                    </div>
                    
                    <div style={{ fontSize: '32px', color: '#94a3b8' }}>
                        {subtitle}
                    </div>

                    <div style={{ marginTop: '50px', fontSize: '20px', color: '#10b981', fontWeight: 'bold' }}>
                        APPLY AT SKILLHIRE.IN
                    </div>
                </div>
            ),
            { 
                width: 1200, 
                height: 630,
                debug: true // Enable Vercel OG debug mode
            }
        );
    } catch (e: any) {
        // Fallback to plain text if even ImageResponse fails to initialize
        return new Response(`OG Fail: ${e.message}`, { status: 500 });
    }
}
