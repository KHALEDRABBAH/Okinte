'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    { name: 'Ahmed Hassan', role: 'Study Abroad - UK', image: 'A', quote: 'Bolila made my dream of studying at Oxford a reality. Their guidance throughout the application process was invaluable.', rating: 5 },
    { name: 'Sarah Johnson', role: 'Internship Program - Germany', image: 'S', quote: 'The internship placement exceeded my expectations. Professional, supportive, and truly care about your success.', rating: 5 },
    { name: 'Mohamed Ali', role: 'Scholarship Recipient', image: 'M', quote: 'I received a full scholarship through Bolila. Their team helped me find the perfect opportunity that matched my profile.', rating: 5 },
  ];

  return (
    <section className="py-24 bg-cream">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">Success Stories</span>
          <h2 className="section-title mt-2">Success Stories</h2>
          <p className="section-subtitle mx-auto">Hear from Those Who Transformed Their Lives</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }}>
              <div className="card h-full relative">
                <Quote className="absolute top-6 start-6 w-10 h-10 text-gold/20" />
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (<Star key={i} className="w-5 h-5 text-gold fill-gold" />))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                    <span className="text-2xl font-heading font-bold text-gold">{testimonial.image}</span>
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-primary">{testimonial.name}</p>
                    <p className="text-sm text-gold">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
