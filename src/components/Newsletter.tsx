"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("You're subscribed! No noise, just good stories.");
      setEmail('');
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 px-8 py-12 text-center">
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Get new perspectives, moments, and experiences from across Africa.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Email address"
            className="w-full flex-1 px-5 py-3 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-60"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4">No noise. Just good stories.</p>
      </div>
    </div>
  );
};

export default Newsletter;
