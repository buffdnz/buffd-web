import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import ical, { ICalCalendarMethod, ICalEventStatus } from 'ical-generator';

const resend = new Resend(process.env.RESEND_API_KEY);

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET() {
  return NextResponse.json(
    { ok: true, message: 'Use POST /api/bookings to submit a booking.' },
    { headers: CORS_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      service,
      vehicleType,
      doors,
      suburb,
      timeLabel,
      timeStart,
      timeEnd,
      name,
      phone,
      email,
      bookingTotal,
    } = body;

    if (!service || !name || !phone || !timeStart || !timeEnd) {
      return NextResponse.json(
        { error: 'Missing required booking fields.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const calendar = ical({
      name: 'Buffd Bookings',
      method: ICalCalendarMethod.PUBLISH,
      prodId: { company: 'Buffd', product: 'Booking System' },
      timezone: 'Pacific/Auckland',
    });

    const eventId = `buffd-${Date.now()}-${Math.random().toString(36).slice(2)}@buffd`;

    calendar.createEvent({
      id: eventId,
      start: new Date(timeStart),
      end: new Date(timeEnd),
      timezone: 'Pacific/Auckland',
      summary: `Buff’d booking - ${service}`,
      description: [
        `Customer: ${name}`,
        `Phone: +64 ${phone}`,
        `Service: ${service}`,
        `Vehicle: ${vehicleType || '—'}`,
        `Doors: ${doors || '—'}`,
        `Suburb: ${suburb || '—'}`,
        `Preferred time: ${timeLabel || '—'}`,
        `Estimated total: $${bookingTotal ?? '—'}`,
      ].join('\n'),
      status: ICalEventStatus.CONFIRMED,
      created: new Date(),
      lastModified: new Date(),
      sequence: 0,
    });

    const icsContent = calendar.toString();

    const { data, error } = await resend.emails.send({
      from: 'Buffd <onboarding@resend.dev>',
      to: ['buffd.nz@gmail.com'],
      subject: `New booking request - ${name} - ${service}`,
      text: [
        `New booking request`,
        ``,
        `Name: ${name}`,
        `Phone: +64 ${phone}`,
        `Email: ${email}`,
        `Service: ${service}`,
        `Vehicle: ${vehicleType || '—'}`,
        `Doors: ${doors || '—'}`,
        `Suburb: ${suburb || '—'}`,
        `Preferred time: ${timeLabel || '—'}`,
        `Estimated total: $${bookingTotal ?? '—'}`,
      ].join('\n'),
      attachments: [
        {
          filename: 'buffd-booking.ics',
          content: Buffer.from(icsContent).toString('base64'),
        },
      ],
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to send email' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json({ ok: true, emailId: data?.id }, { headers: CORS_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown server error' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}