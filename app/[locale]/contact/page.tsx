import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';
import { Mail, MapPin, Phone, Facebook, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const WHATSAPP_NUMBER = '+201280109982';
const EMAIL = 'Okinte.placement@gmail.com';
const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61567424603648&mibextid=rS40aB7S9Ucbxw6v';

const locations = [
  {
    name: 'Mongo, Chad',
    description: 'Main Office',
    href: 'https://share.google/8BYwcYBxCgfUxgcjG',
    isMain: true,
  },
  {
    name: 'Togo',
    description: 'Regional Office',
    href: 'https://maps.app.goo.gl/MifFEUFhE11qHS4E8?g_st=aw',
    isMain: false,
  },
  {
    name: 'Giza, Egypt',
    description: 'Regional Office',
    href: 'https://www.google.com/maps/place/pyramids+land+hotel/data=!4m2!3m1!1s0x1458417e9f78f3ff:0x8b7966cc1ddc37a8?sa=X&ved=1t:242&ictx=111',
    isMain: false,
  },
];

export default function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('contact');

  const contactMethods = [
    {
      icon: Phone,
      title: 'WhatsApp / Phone',
      value: '+20 12 80109982',
      href: `https://wa.me/${WHATSAPP_NUMBER}`,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      icon: Mail,
      title: 'Email',
      value: EMAIL,
      href: `mailto:${EMAIL}`,
      color: 'text-[#2563EB]',
      bg: 'bg-[#2563EB]/10'
    },
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

          <div className="max-w-5xl mx-auto">
            {/* Contact Methods */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
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

            {/* Locations Section */}
            <div className="mb-12">
              <div className="flex items-center justify-center gap-4 mb-8 opacity-50">
                <div className="h-px bg-gray-300 w-16" />
                <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">Our Locations</span>
                <div className="h-px bg-gray-300 w-16" />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {locations.map((location, index) => (
                  <a
                    key={index}
                    href={location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-white rounded-2xl p-6 text-center border shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all duration-300 group ${
                      location.isMain ? 'border-[#2563EB]/30 ring-1 ring-[#2563EB]/10' : 'border-gray-100'
                    }`}
                  >
                    <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                      location.isMain ? 'bg-[#2563EB]/10' : 'bg-red-500/10'
                    }`}>
                      <MapPin className={`w-6 h-6 ${location.isMain ? 'text-[#2563EB]' : 'text-red-500'}`} />
                    </div>
                    {location.isMain && (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#2563EB]/10 text-[#2563EB] rounded-full mb-2">
                        Main
                      </span>
                    )}
                    <h3 className="font-heading font-bold text-[#1a1a2e] mb-1">{location.name}</h3>
                    <p className="text-xs text-gray-500 mb-3">{location.description}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-[#2563EB] font-medium group-hover:underline">
                      View on Map <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-4 mb-8 opacity-50">
              <div className="h-px bg-gray-300 w-16" />
              <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">{t('social')}</span>
              <div className="h-px bg-gray-300 w-16" />
            </div>

            <div className="max-w-sm mx-auto">
              <a 
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-2xl p-6 flex items-center gap-5 border border-gray-100 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 bg-blue-600/10">
                  <Facebook className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[#1a1a2e]">Facebook</h3>
                  <p className="text-sm text-gray-500 group-hover:text-[#2563EB] transition-colors">Follow us on Facebook</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
