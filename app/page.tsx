'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import BookingForm from '../components/BookingForm';
import ServiceCard from '../components/ServiceCard';
import TestimonialCard from '../components/TestimonialCard';
import LiveChat from '../components/LiveChat';

const Home = () => {
  const [selectedService, setSelectedService] = useState('');
  const [estimate, setEstimate] = useState<string | null>(null);

  return (
    <div>
      <div className='relative flex flex-col items-center justify-center pt-20 text-center'>
        <div
          id="home"
          className="relative flex flex-col items-center justify-center px-4 pt-12 sm:pt-16 pb-12 sm:pb-16 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            Car Cleaning Without the Premium Price
          </h1>
          
          <p className="mt-4 sm:mt-2 text-lg md:text-xl theme-text-muted">
            No scratches, trusted service, Wellington-based.
          </p>

          <Link href="#booking">
          <button className="mt-5 sm:mt-4 theme-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 text-[var(--text)] py-3 px-6 rounded-2xl text-lg transition">Book Now</button>
          </Link>

          <div className="mt-6 sm:mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm theme-text-muted">
            <span>✔ Fully insured</span>
            <span>✔ Mobile service</span>
            <span>✔ 5-star local reviews</span>
          </div>

          {/* Placeholder for hero image */}
          <div className="theme-hero mt-6 w-full max-w-5xl h-56 sm:h-64 lg:h-72 shadow-xl rounded-2xl flex items-center justify-center border border-white/10">
            <span className="text-gray-400">
              Hero Image Placeholder
            </span>
          </div>
        </div>
      </div>

      <div id="services" className="services-section pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight tracking-tight text-center mb-8 sm:mb-10">
            Our Services
          </h2>

          <div className="pt-4 sm:pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto items-stretch">
              <ServiceCard 
                title="Basic" 
                price="$40 - $60" 
                description="A clean reset. Exterior hand wash, wheel rinse, and interior vacuum to restore a fresh, tidy finish."
                isSelected={selectedService === 'basic'}
                onClick={() => setSelectedService('basic')}
              />

              <ServiceCard 
                highlight 
                title="Standard" 
                price="$70 - $90" 
                description="Our signature detail. Deep exterior clean and wheel shine, streak-free glass inside and out, and a full interior refresh with vacuum and wipe-down."
                isSelected={selectedService === 'standard'}
                onClick={() => setSelectedService('standard')}
              />
              
              <ServiceCard 
                title="Deluxe" 
                price="$120 - $350" 
                description="Full rejuvenation. Includes everything in Standard, plus steam interior treatment, deep grime removal, and enhanced finish on plastics and trims."
                isSelected={selectedService === 'deluxe'}
                onClick={() => setSelectedService('deluxe')}
              />

              <ServiceCard 
                title="Premium+" 
                price="By Request" 
                description="Showroom-level detailing. Paint enhancement, interior restoration, and meticulous finishing for a like-new, high-end result."
                isSelected={selectedService === 'premium'}
                onClick={() => setSelectedService('premium')}
              />
            </div>
          </div>
        </div>
      </div>

      <div id="booking" className="booking-section py-16 sm:py-20 lg:py-24 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight tracking-tight text-center mb-8 sm:mb-10">
            Book Your Service
          </h2>

          <div className="pt-4 sm:pt-6">
            <BookingForm
              selectedService={selectedService}
              setSelectedService={setSelectedService}
              setEstimate={setEstimate}
            />
          </div>
        </div>
      </div>

      <div id="gallery" className="gallery-section py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-8 sm:mb-10">
          Gallery
        </h2>

        <div className="pt-4 sm:pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          <div className="theme-hero h-64 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center hover:opacity-75 transition">
            <span className="text-gray-400">Before/After 1</span>
          </div>
          <div className="theme-hero theme-hero h-64 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center hover:opacity-75 transition">
            <span className="text-gray-400">Before/After 2</span>
          </div>
          <div className="theme-hero h-64 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center hover:opacity-75 transition">
            <span className="text-gray-400">Before/After 3</span>
          </div>
          </div>
        </div>
      </div>

      <div id="testimonials" className="testimonials-section py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-8 sm:mb-10">
          What Our Customers Say
        </h2>

        <div className="pt-4 sm:pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          <TestimonialCard name="John D." review="Sam did an amazing job on my car. It looks brand new! Highly recommend." />
          <TestimonialCard name="Sarah L." review="Affordable and professional service. My car has never been cleaner. Will definitely book again." />
          <TestimonialCard name="Mike R." review="Great attention to detail. They were careful and friendly. Five stars!" />
          </div>
        </div>
      </div>

      <div id="about" className="about-section py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-8 sm:mb-10">
          About Us
        </h2>
        <p className="text-center text-lg max-w-4xl mx-auto">
          Wellington-based, focusing on quality, affordability, and trust. Not claiming to be the best, but consistent and reliable.
        </p>
      </div>

      <div id="contact" className="contact-section py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-8 sm:mb-10">Contact Us</h2>
        <div className="text-center">
          <p className="text-lg mb-2">Phone: (+64) 022 493 2495</p>
          <p className="text-lg mb-2">Email: buffd@gmail.com</p>
          <p className="text-lg">Service area: Wellington CBD and surrounding peninsula (no service past Ngauranga Gorge)</p>
        </div>
      </div>

      {/* Floating Book Now Button for Mobile */}


      {/* Live Chat Placeholder */}
      <LiveChat
        estimate={typeof estimate === 'string' ? estimate : null}
        onBookNow={() => {
          document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
};

export default Home;