"use client";

import React, { useRef, useState } from 'react';
import HoneypotField from '@/components/HoneypotField';
import { toast } from 'sonner';
import { submitErrorMessage, useTurnstile } from '@/components/turnstile/useTurnstile';
import { TURNSTILE_ACTIONS, TURNSTILE_FIELD } from '@/lib/turnstile';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const turnstile = useTurnstile(TURNSTILE_ACTIONS.newsletter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const turnstileToken = await turnstile.getToken();
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website: honeypotRef.current?.value ?? '', [TURNSTILE_FIELD]: turnstileToken }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(body.error ?? 'Could not subscribe. Please try again.');
        return;
      }
      toast.success("You're subscribed! No noise, just good stories.");
      setEmail('');
    } catch (error) {
      toast.error(submitErrorMessage(error, 'Network error. Please try again.'));
    } finally {
      turnstile.reset();
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="newsletter-heading" className="px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20">
      <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-sm border border-gray-100 px-6 py-14 sm:px-12 sm:py-20 text-center">
        <h2
          id="newsletter-heading"
          className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-gray-900 leading-tight text-balance"
        >
          Stay close to the stories
        </h2>
        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-md mx-auto text-pretty">
          Get new perspectives, moments, and experiences from across Africa.
        </p>

        <form onSubmit={handleSubmit} className="relative mt-10 flex flex-col gap-3 max-w-md mx-auto">
          <HoneypotField ref={honeypotRef} />
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Email address"
            className="w-full h-12 px-6 rounded-full border border-gray-300 bg-gray-50/80 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
          {turnstile.widget}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-full bg-gray-900 text-white text-[15px] font-semibold shadow-lg shadow-gray-900/15 hover:bg-gray-800 transition disabled:opacity-60"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-5">No noise. Just good stories.</p>
      </div>
    </section>
  );
};

export default Newsletter;
