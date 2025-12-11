import { NextRequest, NextResponse } from 'next/server';

interface TrackingEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
  url: string;
}

// In production, use a proper database
const events: (TrackingEvent & { sessionId: string; ip: string })[] = [];

export async function POST(request: NextRequest) {
  try {
    const eventData: TrackingEvent = await request.json();
    
    // Generate or get session ID (in production, use proper session management)
    const sessionId = request.headers.get('x-session-id') || 
                     request.ip || 
                     Math.random().toString(36).substring(7);
    
    const enrichedEvent = {
      ...eventData,
      sessionId,
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          request.ip || 
          'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    events.push(enrichedEvent);
    
    console.log(`[TRACKING] ${eventData.type}:`, eventData.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tracking error:', error);
    return NextResponse.json(
      { success: false, message: 'Tracking failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return analytics data (for admin dashboard)
  const analytics = {
    totalEvents: events.length,
    eventTypes: events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    uniqueSessions: new Set(events.map(e => e.sessionId)).size,
    recentEvents: events.slice(-20) // Last 20 events
  };

  return NextResponse.json(analytics);
}
