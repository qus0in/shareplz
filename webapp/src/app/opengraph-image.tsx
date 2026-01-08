import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'SHAREPLZ Preview';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #09090b, #18181b)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'monospace',
                    color: 'white',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #27272a',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(24, 24, 27, 0.5)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        padding: '60px',
                        width: '800px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                        <svg width="64" height="64" viewBox="0 0 100 100" fill="none">
                            <path d="M25 25 L55 50 L25 75" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="50" y1="80" x2="85" y2="80" stroke="#71717a" strokeWidth="12" strokeLinecap="round" />
                        </svg>
                        <h1 style={{ fontSize: '64px', fontWeight: 'bold', marginLeft: '20px', letterSpacing: '-2px' }}>
                            SHAREPLZ
                        </h1>
                    </div>

                    <div style={{ color: '#a1a1aa', fontSize: '32px', textAlign: 'center', marginTop: '20px' }}>
                        Instant, Secure, Real-time Code Sharing
                    </div>

                    <div style={{
                        marginTop: '60px',
                        display: 'flex',
                        gap: '20px',
                        color: '#3b82f6',
                        fontSize: '24px'
                    }}>
                        <div style={{ display: 'flex', border: '1px solid #3f3f46', borderRadius: '8px', padding: '10px 20px', background: '#09090b' }}>
                            $ 6-digit PIN Protected
                        </div>
                        <div style={{ display: 'flex', border: '1px solid #3f3f46', borderRadius: '8px', padding: '10px 20px', background: '#09090b' }}>
                            $ Real-time Sync
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
