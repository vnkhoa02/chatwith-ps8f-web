import { NextRequest } from 'next/server';

// Edge runtime for low-latency streaming
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const last: string | undefined = body?.messages?.filter((m: any) => m.role === 'user').slice(-1)[0]?.content;
  const encoder = new TextEncoder();
  const text = `Echo: ${last ?? 'No input'}`;
  let i = 0;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const interval = setInterval(() => {
        if (i < text.length) {
          controller.enqueue(encoder.encode(text[i]));
          i++;
        } else {
          clearInterval(interval);
          controller.close();
        }
      }, 35);
    }
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache'
    }
  });
}
