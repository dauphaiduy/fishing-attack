import { NextRequest, NextResponse } from 'next/server';

// In a real app, you'd store this in a database
interface CollectedData {
  [key: string]: unknown;
}
const collectedData: CollectedData[] = [];

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    // Add timestamp and IP from request headers
    const enrichedData = {
      ...userData,
      timestamp: new Date().toISOString(),
      serverIP: request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown',
      headers: {
        'user-agent': request.headers.get('user-agent'),
        'accept-language': request.headers.get('accept-language'),
        'accept-encoding': request.headers.get('accept-encoding'),
        'referer': request.headers.get('referer'),
      }
    };

    // Store the data (in production, save to database)
    collectedData.push(enrichedData);
    
    console.log('Collected user data:', enrichedData);

    return NextResponse.json({ 
      success: true, 
      message: 'Data collected successfully',
      dataId: collectedData.length 
    });
  } catch (error) {
    console.error('Error collecting data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to collect data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return all collected data (for admin purposes)
  return NextResponse.json({
    totalEntries: collectedData.length,
    data: collectedData
  });
}
