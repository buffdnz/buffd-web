import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import ical, { ICalCalendarMethod, ICalEventStatus } from 'ical-generator';

const resend = new Resend(process.env.RESEND_API_KEY);

const SERVICE_TITLES: Record<string, string> = {
  basic: 'Basic Wash',
  standard: 'Standard',
  deluxe: 'Deluxe',
};

const ADDON_LABELS: Record<string, string> = {
  headlight: 'Headlight restore',
  'single-polish': 'Single-stage polish',
  'multi-polish': 'Multi-stage polish',
  'seat-shampoo': 'Seat shampoo / leather',
  'pet-hair': 'Pet hair removal',
  'tar-bug': 'Tar + bug removal',
  'iron-decon': 'Iron decon',
  'interior-protect': 'Interior protection',
  'engine-bay': 'Engine bay clean',
};

const SUBURB_LABELS: Record<string, string> = {
  cbd: 'Wellington CBD', newtown: 'Newtown', kilbirnie: 'Kilbirnie',
  miramar: 'Miramar', karori: 'Karori', lowerhutt: 'Lower Hutt',
};

const VEHICLE_LABELS: Record<string, string> = {
  sedan: 'Sedan', hatch: 'Hatch', suv: 'SUV', ute: 'Ute', van: 'Van',
};

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-NZ', {
      timeZone: 'Pacific/Auckland',
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
  } catch { return iso; }
}

function durationLabel(timeStart: string, timeEnd: string): string {
  const mins = Math.round((new Date(timeEnd).getTime() - new Date(timeStart).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

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
      selectedAddons,
    } = body;

    if (!service || !name || !phone || !timeStart || !timeEnd) {
      return NextResponse.json(
        { error: 'Missing required booking fields.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const serviceTitle = SERVICE_TITLES[service] ?? service;
    const addonLabels = Array.isArray(selectedAddons) && selectedAddons.length > 0
      ? selectedAddons.map((k: string) => ADDON_LABELS[k] ?? k).join(', ')
      : 'None';

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
      summary: `Buff'd booking — ${serviceTitle}`,
      description: [
        `Customer: ${name}`,
        `Phone: +64 ${phone}`,
        `Email: ${email || '—'}`,
        `Service: ${serviceTitle}`,
        `Vehicle: ${VEHICLE_LABELS[vehicleType] ?? (vehicleType || '—')}`,

        `Doors: ${doors || '—'}`,
        `Suburb: ${SUBURB_LABELS[suburb] ?? (suburb || '—')}`,

        `Addons: ${addonLabels}`,
        `Total: $${bookingTotal ?? '—'}`,
        `Duration: ${timeStart && timeEnd ? durationLabel(timeStart, timeEnd) : '—'}`,
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
      subject: `New booking — ${name} · ${serviceTitle} · ${timeStart ? fmtDate(timeStart) : ''}`,
      text: [
        `Service:        ${serviceTitle}`,
        `Vehicle:        ${VEHICLE_LABELS[vehicleType] ?? (vehicleType || '—')}`,
        `Doors:          ${doors || '—'}`,
        `Suburb:         ${SUBURB_LABELS[suburb] ?? (suburb || '—')}`,

        `Addons:         ${addonLabels}`,
        ``,
        `Date/time:      ${timeStart ? fmtDate(timeStart) : '—'}`,
        `Finish by:      ${timeEnd ? fmtDate(timeEnd) : '—'}`,
        `Duration:       ${timeStart && timeEnd ? durationLabel(timeStart, timeEnd) : '—'}`,
        ``,
        `Name:           ${name}`,
        `Phone:          +64 ${phone}`,
        `Email:          ${email || '—'}`,
        ``,
        `Booking total:  $${bookingTotal ?? '—'}`,
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