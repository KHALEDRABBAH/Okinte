import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Process from '@/components/Process';
import Partners from '@/components/Partners';
import FAQ from '@/components/FAQ';
import Contact from '@/components/Contact';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <About />
      <Services />
      <Process />
      <Partners />
      <FAQ />
      <Contact />
      <CTA />
      <Footer />
    </main>
  );
}
