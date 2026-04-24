import Header from '@/components/Header';
import Hero from '@/components/Hero';
import JsonLd from '@/components/JsonLd';
import dynamic from 'next/dynamic';

// Dynamically import below-the-fold components to reduce initial JS payload
const About = dynamic(() => import('@/components/About'));
const Services = dynamic(() => import('@/components/Services'));
const Process = dynamic(() => import('@/components/Process'));
const Partners = dynamic(() => import('@/components/Partners'));
const Testimonials = dynamic(() => import('@/components/Testimonials'));
const FAQ = dynamic(() => import('@/components/FAQ'));
const CTA = dynamic(() => import('@/components/CTA'));
const Footer = dynamic(() => import('@/components/Footer'));

export default function Home() {
  return (
    <main>
      <JsonLd />
      <Header />
      <Hero />

      <About />
      <Services />
      <Process />
      <Partners />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
