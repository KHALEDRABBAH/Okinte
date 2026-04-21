import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';

import Services from '@/components/Services';
import Process from '@/components/Process';
import Partners from '@/components/Partners';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';

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
