import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Mail, MapPin, Phone, Instagram, Facebook } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('contact');

  const contactMethods = [
    {
      icon: Phone,
      title: 'WhatsApp / Phone',
      value: '+20 12 80109982',
      href: 'https://wa.me/201280109982',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'Okinte.placement@gmail.com',
      href: 'mailto:Okinte.placement@gmail.com',
      color: 'text-[#2563EB]',
      bg: 'bg-[#2563EB]/10'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Egypt',
      href: '#',
      color: 'text-red-500',
      bg: 'bg-red-500/10'
    }
  ];

  const socialLinks = [
    {
      icon: Facebook,
      title: 'Facebook',
      href: 'https://www.facebook.com/profile.php?id=61570781992726',
      color: 'text-blue-600',
      bg: 'bg-blue-600/10'
    },
    {
      icon: Instagram,
      title: 'Instagram',
      href: 'https://www.instagram.com/okintenous',
      color: 'text-pink-500',
      bg: 'bg-pink-500/10'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Header />
      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="section-label text-[#2563EB]">{t('label')}</span>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-[#1a1a2e] mt-3 mb-4 tracking-tight">
              {t('title')}
            </h1>
            <p className="text-lg text-gray-500">{t('subtitle')}</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Main Contact Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {contactMethods.map((method, index) => (
                <a 
                  key={index} 
                  href={method.href}
                  target={method.href.startsWith('http') ? '_blank' : undefined}
                  rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${method.bg}`}>
                    <method.icon className={`w-7 h-7 ${method.color}`} />
                  </div>
                  <h3 className="font-heading font-bold text-[#1a1a2e] mb-2">{method.title}</h3>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-[#2563EB] transition-colors">{method.value}</p>
                </a>
              ))}
            </div>

            {/* Separator */}
            <div className="flex items-center justify-center gap-4 mb-12 opacity-50">
              <div className="h-px bg-gray-300 w-16" />
              <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">{t('social')}</span>
              <div className="h-px bg-gray-300 w-16" />
            </div>

            {/* Social Links Grid */}
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl p-6 flex items-center gap-5 border border-gray-100 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${social.bg}`}>
                    <social.icon className={`w-6 h-6 ${social.color}`} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-[#1a1a2e]">{social.title}</h3>
                    <p className="text-sm text-gray-500 group-hover:text-[#2563EB] transition-colors">Follow us on {social.title}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
