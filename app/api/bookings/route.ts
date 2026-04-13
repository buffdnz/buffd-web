export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import ical from 'ical-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Booking received:', body);
    
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
      estimate,
    } = body;

    if (!service || !timeStart || !timeEnd || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const calendar = ical({ name: 'Buffd Bookings' });

    calendar.createEvent({
      start: new Date(timeStart),
      end: new Date(timeEnd),
      summary: `Buff’d Booking - ${service}`,
      description: [
        `Customer: ${name}`,
        `Phone: +64 ${phone}`,
        `Service: ${service}`,
        `Vehicle: ${vehicleType}`,
        `Doors: ${doors}`,
        `Suburb: ${suburb}`,
        `Estimate: ${estimate}`,
      ].join('\n'),
      organizer: {
        name: 'Buff’d',
        email: 'buffd.nz@gmail.com',
      },
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: 'buffd.nz@gmail.com',
      subject: `New booking request - ${service} - ${name}`,
      text: [
        `New booking request`,
        ``,
        `Customer: ${name}`,
        `Phone: +64 ${phone}`,
        `Service: ${service}`,
        `Vehicle: ${vehicleType}`,
        `Doors: ${doors}`,
        `Suburb: ${suburb}`,
        `Time: ${timeLabel}`,
        `Estimate: ${estimate}`,
      ].join('\n'),
      attachments: [
        {
          filename: 'buffd-booking.ics',
          content: calendar.toString(),
          contentType: 'text/calendar; charset=utf-8',
        },
      ],
    });

    return NextResponse.json({ ok: true, message: 'Stub booking route working' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}