import { NextRequest, NextResponse } from 'next';

export async function GET(request: NextRequest) {
  // You can access request headers, query parameters, etc.
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name') || 'World';

  return NextResponse.json({ message: `Hello, ${name}!` }, { status: 200 });
}



export async function POST(request: NextRequest) {
  try {
    const body = await request.json(); // Parse the request body as JSON

    return NextResponse.json(
      { message: `Item '${body}' received successfully!`, data: body },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error parsing POST request body:', error);
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 },
    );
  }
}