'use client';

import React, { useMemo, useState } from 'react';
import ServiceCard from '../components/ServiceCard';
import TestimonialCard from '../components/TestimonialCard';
import LiveChat from '../components/LiveChat';

type Step = 'service' | 'vehicle' | 'doors' | 'suburb' | 'time' | 'contact' | 'confirm';

type TimeSlot = {
  id: string;
  label: string;
  start: string; // ISO string from backend
  end: string;   // ISO string from backend
};

const STEP_ORDER: Step[] = ['service', 'vehicle', 'doors', 'suburb', 'time', 'contact', 'confirm'];

const Home = () => {
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<'idle' | 'success' | 'error'>('idle');

  const [bookingData, setBookingData] = useState({
    service: '',
    vehicleType: '',
    doors: '',
    suburb: '',
    timeSlotId: '',
    timeLabel: '',
    timeStart: '',
    timeEnd: '',
    name: '',
    phone: '',
  });

  // Placeholder until backend is live
  const availableTimeSlots = useMemo<TimeSlot[]>(
    () => [
      {
        id: '2026-04-13T17:00',
        label: 'Today, 5:00 pm',
        start: '2026-04-13T17:00:00+12:00',
        end: '2026-04-13T18:00:00+12:00',
      },
      {
        id: '2026-04-14T10:00',
        label: 'Tomorrow, 10:00 am',
        start: '2026-04-14T10:00:00+12:00',
        end: '2026-04-14T11:00:00+12:00',
      },
      {
        id: '2026-04-14T13:00',
        label: 'Tomorrow, 1:00 pm',
        start: '2026-04-14T13:00:00+12:00',
        end: '2026-04-14T14:00:00+12:00',
      },
      {
        id: '2026-04-18T11:00',
        label: 'Saturday, 11:00 am',
        start: '2026-04-18T11:00:00+12:00',
        end: '2026-04-18T12:00:00+12:00',
      },
    ],
    []
  );

  const serviceOptions = useMemo(
    () => [
      {
        key: 'basic',
        title: 'Basic Wash',
        price: '$45',
        summary: 'A quick exterior wash and interior tidy-up.',
        features: ['Exterior hand wash', 'Interior vacuum', 'Window clean'],
        duration: '20–30 mins',
        bestFor: 'regular maintenance',
      },
      {
        key: 'standard',
        title: 'Standard',
        price: '$70 - $90',
        summary: 'A quick exterior wash and interior tidy-up.',
        features: [
          'Exterior wash + wheel clean',
          'Full interior vacuum',
          'Interior wipe-down (dash, trims, panels)',
          'Streak-free windows (in & out)',
          'Tyre shine',
        ],
        duration: '~45–60 mins',
        bestFor: 'regular maintenance',
        highlight: true,
      },
      {
        key: 'deluxe',
        title: 'Deluxe',
        price: '$120 - $350',
        summary: 'Our signature detail',
        features: [
          'Everything in Standard',
          'Deep interior scrub (brushes + detail work)',
          'Stain & grime removal',
          'Detailed exterior finish',
        ],
        duration: '~1.5–2 hours',
        bestFor: 'deep clean, pre-sale prep, or special occasions',
      },
      {
        key: 'premium',
        title: 'Premium+',
        price: 'By Request',
        summary:
          'By request only, showroom-level detailing for high-end vehicles or those needing extra care.',
        features: [
          'Paint enhancement',
          'Interior restoration',
          'Meticulous finishing',
          'High-end result',
        ],
        duration: '~1.5–2 hours',
        bestFor: 'deep clean, pre-sale prep, or special occasions',
      },
    ],
    []
  );

  const canContinue = useMemo(() => {
    switch (step) {
      case 'vehicle':
        return bookingData.vehicleType !== '';
      case 'doors':
        return bookingData.doors !== '';
      case 'suburb':
        return bookingData.suburb !== '';
      case 'time':
        return bookingData.timeSlotId !== '';
      case 'contact':
        return (
          bookingData.name.trim() !== '' &&
          isValidNzPhone(bookingData.phone)
        );
      case 'confirm':
        return !submitting;
      default:
        return false;
    }
  }, [step, bookingData, submitting]);

  const estimate = useMemo(() => {
    if (!selectedService) return null;

    const serviceBasePrices: Record<string, number> = {
      basic: 45,
      standard: 70,
      deluxe: 120,
      premium: 0,
    };

    const vehicleModifiers: Record<string, number> = {
      sedan: 0,
      hatch: 0,
      suv: 15,
      ute: 20,
      van: 25,
    };

    const doorModifiers: Record<string, number> = {
      '2': 0,
      '4': 5,
      '5+': 10,
    };

    const suburbModifiers: Record<string, number> = {
      cbd: 0,
      newtown: 5,
      kilbirnie: 5,
      miramar: 10,
      karori: 10,
      lowerhutt: 20,
    };

    if (selectedService === 'premium') return 'Quote on inspection';

    const base = serviceBasePrices[selectedService] ?? 0;
    const vehicle = vehicleModifiers[bookingData.vehicleType] ?? 0;
    const doors = doorModifiers[bookingData.doors] ?? 0;
    const suburb = suburbModifiers[bookingData.suburb] ?? 0;

    return `$${base + vehicle + doors + suburb}`;
  }, [selectedService, bookingData]);

  function sanitiseNzPhone(input: string) {
    const digitsOnly = input.replace(/[^\d]/g, '');

    if (digitsOnly.startsWith('64')) {
      return digitsOnly.slice(2).replace(/^0+/, '');
    }

    return digitsOnly.replace(/^0+/, '');
  }

  function isValidNzPhone(phone: string) {
    // stored without +64 prefix
    return /^2\d{7,9}$/.test(phone);
  }

  const handleSelectService = (serviceKey: string) => {
    setSelectedService(serviceKey);
    setBookingData({
      service: serviceKey,
      vehicleType: '',
      doors: '',
      suburb: '',
      timeSlotId: '',
      timeLabel: '',
      timeStart: '',
      timeEnd: '',
      name: '',
      phone: '',
    });
    setSubmitState('idle');
    setStep('vehicle');
  };

  const goBack = () => {
    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex <= 1) {
      setStep('service');
      setSelectedService('');
      return;
    }

    setStep(STEP_ORDER[currentIndex - 1]);
  };
  
  const [submitError, setSubmitError] = useState('');

  const handleContinue = async () => {
    if (!canContinue) return;

    if (step === 'vehicle') return setStep('doors');
    if (step === 'doors') return setStep('suburb');
    if (step === 'suburb') return setStep('time');
    if (step === 'time') return setStep('contact');
    if (step === 'contact') return setStep('confirm');

    if (step === 'confirm') {
      try {
        setSubmitting(true);
        setSubmitState('idle');
        setSubmitError('');

        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...bookingData,
            estimate,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || `Request failed with status ${res.status}`);
        }

        setSubmitState('success');
      } catch (error) {
        console.error(error);
        setSubmitError(error instanceof Error ? error.message : 'Unknown error');
        setSubmitState('error');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const optionButtonClass = (isActive: boolean) =>
    `rounded-xl border px-4 py-3 text-sm font-medium transition ${
      isActive
        ? 'border-[var(--accent-to)] bg-white/10 text-[var(--text)] ring-2 ring-[var(--accent-to)]'
        : 'border-white/10 bg-white/5 text-[var(--text-muted)] hover:bg-white/10'
    }`;

  const renderStepContent = () => {
    if (!selectedService) return null;

    if (step === 'vehicle') {
      return (
        <div className="space-y-4">
          <p className="text-sm font-medium text-[var(--text)]">Select your vehicle type</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={optionButtonClass(bookingData.vehicleType === 'sedan')} onClick={() => setBookingData((prev) => ({ ...prev, vehicleType: 'sedan' }))}>Sedan</button>
            <button type="button" className={optionButtonClass(bookingData.vehicleType === 'hatch')} onClick={() => setBookingData((prev) => ({ ...prev, vehicleType: 'hatch' }))}>Hatchback</button>
            <button type="button" className={optionButtonClass(bookingData.vehicleType === 'suv')} onClick={() => setBookingData((prev) => ({ ...prev, vehicleType: 'suv' }))}>SUV</button>
            <button type="button" className={optionButtonClass(bookingData.vehicleType === 'ute' || bookingData.vehicleType === 'van')} onClick={() => setBookingData((prev) => ({ ...prev, vehicleType: 'van' }))}>Ute / Van</button>
          </div>
        </div>
      );
    }

    if (step === 'doors') {
      return (
        <div className="space-y-4">
          <p className="text-sm font-medium text-[var(--text)]">How many doors?</p>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" className={optionButtonClass(bookingData.doors === '2')} onClick={() => setBookingData((prev) => ({ ...prev, doors: '2' }))}>2 doors</button>
            <button type="button" className={optionButtonClass(bookingData.doors === '4')} onClick={() => setBookingData((prev) => ({ ...prev, doors: '4' }))}>4 doors</button>
            <button type="button" className={optionButtonClass(bookingData.doors === '5+')} onClick={() => setBookingData((prev) => ({ ...prev, doors: '5+' }))}>5+ doors</button>
          </div>
        </div>
      );
    }

    if (step === 'suburb') {
      return (
        <div className="space-y-4">
          <p className="text-sm font-medium text-[var(--text)]">Choose your suburb</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={optionButtonClass(bookingData.suburb === 'cbd')} onClick={() => setBookingData((prev) => ({ ...prev, suburb: 'cbd' }))}>Wellington CBD</button>
            <button type="button" className={optionButtonClass(bookingData.suburb === 'newtown')} onClick={() => setBookingData((prev) => ({ ...prev, suburb: 'newtown' }))}>Newtown</button>
            <button type="button" className={optionButtonClass(bookingData.suburb === 'kilbirnie')} onClick={() => setBookingData((prev) => ({ ...prev, suburb: 'kilbirnie' }))}>Kilbirnie</button>
            <button type="button" className={optionButtonClass(bookingData.suburb === 'miramar')} onClick={() => setBookingData((prev) => ({ ...prev, suburb: 'miramar' }))}>Miramar</button>
            <button type="button" className={optionButtonClass(bookingData.suburb === 'karori')} onClick={() => setBookingData((prev) => ({ ...prev, suburb: 'karori' }))}>Karori</button>
            <button type="button" className={optionButtonClass(bookingData.suburb === 'lowerhutt')} onClick={() => setBookingData((prev) => ({ ...prev, suburb: 'lowerhutt' }))}>Lower Hutt</button>
          </div>
        </div>
      );
    }

    if (step === 'time') {
      return (
        <div className="space-y-4">
          <p className="text-sm font-medium text-[var(--text)]">Choose a preferred time</p>
          <div className="grid grid-cols-1 gap-2">
            {availableTimeSlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                className={optionButtonClass(bookingData.timeSlotId === slot.id)}
                onClick={() =>
                  setBookingData((prev) => ({
                    ...prev,
                    timeSlotId: slot.id,
                    timeLabel: slot.label,
                    timeStart: slot.start,
                    timeEnd: slot.end,
                  }))
                }
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (step === 'contact') {
      return (
        <div className="space-y-4">
          <p className="text-sm font-medium text-[var(--text)]">Your contact details</p>

          <input
            type="text"
            value={bookingData.name}
            onChange={(e) => setBookingData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Name"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] outline-none transition focus:ring-2 focus:ring-[var(--accent-from)]"
          />

          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">
              (+64)
            </span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={bookingData.phone}
              onChange={(e) =>
                setBookingData((prev) => ({
                  ...prev,
                  phone: sanitiseNzPhone(e.target.value),
                }))
              }
              placeholder="22 123 4567"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-16 pr-4 py-3 text-[var(--text)] outline-none transition focus:ring-2 focus:ring-[var(--accent-from)]"
            />
          </div>

          {bookingData.phone.length > 0 && !isValidNzPhone(bookingData.phone) && (
            <p className="text-sm text-red-400">Enter a valid NZ mobile number.</p>
          )}
        </div>
      );
    }

    if (step === 'confirm') {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-sm text-[var(--text-muted)]">Estimated price</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--text)]">{estimate ?? '—'}</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Final quote confirmed after booking review. Travel and vehicle size are included in this estimate.
            </p>
          </div>

          <div className="space-y-2 text-sm text-[var(--text-muted)]">
            <p><span className="font-medium text-[var(--text)]">Vehicle:</span> {bookingData.vehicleType || '—'}</p>
            <p><span className="font-medium text-[var(--text)]">Doors:</span> {bookingData.doors || '—'}</p>
            <p><span className="font-medium text-[var(--text)]">Suburb:</span> {bookingData.suburb || '—'}</p>
            <p><span className="font-medium text-[var(--text)]">Time:</span> {bookingData.timeLabel || '—'}</p>
            <p><span className="font-medium text-[var(--text)]">Name:</span> {bookingData.name || '—'}</p>
            <p><span className="font-medium text-[var(--text)]">Phone:</span> {bookingData.phone ? `(+64) ${bookingData.phone}` : '—'}</p>
          </div>

          <p className="text-sm text-[var(--text-muted)]">
            $20 deposit required. Non-refundable within 24 hours.
          </p>

          {submitState === 'success' && (
            <p className="text-sm text-green-400">Booking request sent successfully.</p>
          )}
          {submitState === 'error' && (
            <p className="text-sm text-red-400">
              {submitError || 'Could not send booking. Please try again.'}
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  const continueLabel =
    step === 'confirm' ? (submitting ? 'Sending...' : 'Request Booking') : 'Continue';

  const carsCleaned = 187; // This would be dynamic in a real app
  const targetCars = 1000;
  const progressPercentage = Math.min((carsCleaned / targetCars) * 100, 100);

  return (
    <div>
      <div id="home"
        className="relative flex flex-col items-center justify-center px-4 pt-28 pb-16 text-center sm:px-6 sm:pt-32"
      >
        <img
          src="/brand/buffd/buffd-logo-primary.png"
          alt="Buff’d"
          className="buffd-logo buffd-logo--hero"
        />
        {/* Main headline */}
        <h1 className="mt-6 max-w-4xl text-3xl font-bold leading-tight tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
          Premium mobile car cleaning in Wellington
        </h1>

        {/* Supporting copy */}
        <p className="mt-3 max-w-2xl text-base leading-relaxed theme-text-muted sm:text-lg">
          Long-lasting interior and exterior cleaning, delivered at your location with careful attention
          to detail.
        </p>
        
        {/* Hero image */}
        <div className="theme-hero mt-8 relative h-56 w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 shadow-xl sm:h-64 lg:h-72">
          <img
            src="/brand/audi-hero.jpeg"
            alt="Freshly cleaned black Audi parked in a Wellington driveway"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Donation + Progress */}
        <div className="mt-8 flex w-full max-w-lg flex-col items-center gap-4">
          <div className="w-full">
            <p className="mx-auto mb-4 max-w-md text-sm leading-relaxed theme-text-muted sm:text-base">
              When we reach  1,000 cars cleaned, we’ll donate $1,000 to{" "}
              <span className="font-medium text-blue-400">MS NZ</span>
            </p>

            <div className="mb-2 text-center">
              <span className="text-4xl font-bold text-[var(--text)]">
                {carsCleaned}
              </span>
              <span className="ml-2 text-sm text-[var(--text)]">
                / {targetCars}
              </span>
            </div>

            <div className="h-4 w-full overflow-hidden rounded-full border border-white/10 bg-white/10">
              <div
                className="theme-accent h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="mt-2 text-center text-sm text-white/60">
              {progressPercentage.toFixed(1)}% of goal reached
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          className="mt-6 rounded-2xl px-6 py-3 text-lg text-[var(--text)] shadow-lg transition hover:opacity-90 hover:shadow-xl theme-accent"
          onClick={() => {
            document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          View Services
        </button>

        {/* Trust indicators */}
        <div className="mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs theme-text-muted sm:text-sm">
          <span>✔ Fully insured</span>
          <span>✔ Mobile service</span>
          <span>✔ 5-star local reviews</span>
        </div>
      </div>

      <div id="services" 
        className="services-section border-t border-white/5 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight md:text-4xl sm:mb-10">
            Select a Service
          </h2>

          <div className="pt-4 sm:pt-6">
            <div className="service-cards mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
              {serviceOptions.map((service) => {
                const isSelected = selectedService === service.key;
                const hasSelection = selectedService !== '';
                const isDimmed = hasSelection && !isSelected;

                return (
                  <div
                    key={service.key}
                    className={[
                      'transition-all duration-500 ease-out',
                      'min-h-[100%]',
                      isSelected ? 'sm:col-span-2 xl:col-span-4' : '',
                      isDimmed
                        ? 'pointer-events-none scale-[0.98] opacity-0 sm:max-h-0 sm:overflow-hidden'
                        : 'opacity-100'
                    ].join(' ')}
                  >
                    <ServiceCard
                      title={service.title}
                      price={service.price}
                      summary={service.summary}
                      features={service.features}
                      duration={service.duration}
                      bestFor={service.bestFor}
                      highlight={service.highlight}
                      isSelected={isSelected}
                      step={step}
                      onSelect={() => handleSelectService(service.key)}
                      onContinue={isSelected ? handleContinue : undefined}
                      continueLabel={continueLabel}
                      canContinue={canContinue}
                      onBack={isSelected && step !== 'service' ? goBack : undefined}
                    >
                      {isSelected ? renderStepContent() : null}
                    </ServiceCard>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="gallery-section px-4 py-16 sm:px-6 sm:py-20 lg:py-24" id="gallery">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:mb-10 sm:text-4xl">
          Gallery
        </h2>

        <div className="pt-4 sm:pt-6">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            <div className="theme-hero flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 transition hover:opacity-75">
              <span className="text-gray-400">Before/After 1</span>
            </div>
            <div className="theme-hero flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 transition hover:opacity-75">
              <span className="text-gray-400">Before/After 2</span>
            </div>
            <div className="theme-hero flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 transition hover:opacity-75">
              <span className="text-gray-400">Before/After 3</span>
            </div>
          </div>
        </div>
      </div>

      <div className="testimonials-section px-4 py-16 sm:px-6 sm:py-20 lg:py-24" id="testimonials">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:mb-10 sm:text-4xl">
          What Our Customers Say
        </h2>

        <div className="pt-4 sm:pt-6">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            <TestimonialCard
              name="John D."
              review="Sam did an amazing job on my car. It looks brand new! Highly recommend."
            />
            <TestimonialCard
              name="Sarah L."
              review="Affordable and professional service. My car has never been cleaner. Will definitely book again."
            />
            <TestimonialCard
              name="Mike R."
              review="Great attention to detail. They were careful and friendly. Five stars!"
            />
          </div>
        </div>
      </div>

      <div className="about-section px-4 py-16 sm:px-6 sm:py-20 lg:py-24" id="about">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:mb-10 sm:text-4xl">
          About Us
        </h2>
        <p className="mx-auto max-w-4xl text-center text-lg">
          Wellington car washing services, focusing on quality, affordability, and trust.
        </p>
      </div>

      <div className="contact-section px-4 py-16 sm:px-6 sm:py-20 lg:py-24" id="contact">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:mb-10 sm:text-4xl">
          Contact Us
        </h2>
        <div className="text-center">
          <p className="mb-2 text-lg">Phone: (+64) 022 493 2495</p>
          <p className="mb-2 text-lg">Email: buffd.nz@gmail.com</p>
          <p className="text-lg">Service area: Wellington CBD and surrounding peninsula</p>
        </div>
      </div>

      <LiveChat
        estimate={typeof estimate === 'string' ? estimate : null}
        onBookNow={() => {
          document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
};

export default Home;