import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { path, secret } = await request.json();
    
    // Simple security check (optional)
    if (secret !== process.env.REVALIDATE_SECRET && process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    // Revalidate the specified path
    if (path) {
      revalidatePath(path);
      return NextResponse.json({ 
        message: `Path ${path} revalidated successfully`,
        timestamp: new Date().toISOString()
      });
    }

    // Revalidate homepage by default
    revalidatePath('/');
    
    return NextResponse.json({ 
      message: 'Homepage revalidated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// For testing via GET request
export async function GET() {
  try {
    revalidatePath('/');
    return NextResponse.json({ 
      message: 'Homepage cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error clearing cache' },
      { status: 500 }
    );
  }
}
