import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Okinte Platform';
    const description = searchParams.get('description') || 'The Complete Service Request Platform';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            padding: '80px',
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'white',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              }}
            >
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>Ok</span>
            </div>
            <span style={{ fontSize: '48px', fontWeight: 'bold', color: 'white' }}>Okinte</span>
          </div>

          <div
            style={{
              fontSize: '72px',
              fontWeight: '900',
              color: 'white',
              lineHeight: 1.2,
              marginBottom: '24px',
              maxWidth: '900px',
              letterSpacing: '-2px',
            }}
          >
            {title}
          </div>
          
          <div
            style={{
              fontSize: '32px',
              color: '#94a3b8',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            {description}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(`OG image generation failed: ${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
