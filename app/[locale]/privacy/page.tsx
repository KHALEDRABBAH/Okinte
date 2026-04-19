import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  const t = useTranslations('metadata');

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-8">Privacy Policy</h1>
            
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p className="text-lg"><strong>Last updated:</strong> April 2026</p>

              <h2 className="text-2xl font-heading font-semibold text-primary mt-8">1. Information We Collect</h2>
              <p>When you use Okinte's placement services, we collect the following personal information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Identity information:</strong> First name, last name, date of birth</li>
                <li><strong>Contact information:</strong> Email address, phone number, postal address</li>
                <li><strong>Documents:</strong> Passport copies, CVs, diplomas, certificates</li>
                <li><strong>Academic information:</strong> Educational background, institutions attended</li>
                <li><strong>Payment information:</strong> Processed securely via our payment provider (Stripe)</li>
              </ul>

              <h2 className="text-2xl font-heading font-semibold text-primary mt-8">2. How We Use Your Information</h2>
              <p>Your personal data is used exclusively for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Processing your placement application</li>
                <li>Matching you with appropriate international opportunities</li>
                <li>Communicating about your application status</li>
                <li>Legal compliance and record keeping</li>
              </ul>

              <h2 className="text-2xl font-heading font-semibold text-primary mt-8">3. Data Protection</h2>
              <p>We implement industry-standard security measures including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>SSL/TLS encryption for all data transfers</li>
                <li>Secure, encrypted storage of all personal documents</li>
                <li>Access controls limiting data access to authorized personnel only</li>
                <li>Regular security audits of our systems</li>
              </ul>

              <h2 className="text-2xl font-heading font-semibold text-primary mt-8">4. Data Sharing</h2>
              <p>We share your information only with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Partner universities and institutions (with your consent) for placement purposes</li>
                <li>Payment processors for transaction processing</li>
                <li>Legal authorities when required by law</li>
              </ul>
              <p>We <strong>never</strong> sell your personal data to third parties.</p>

              <h2 className="text-2xl font-heading font-semibold text-primary mt-8">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h2 className="text-2xl font-heading font-semibold text-primary mt-8">6. Data Retention</h2>
              <p>We retain your personal data for the duration of your application process and for a period of 5 years thereafter for legal compliance purposes. You may request earlier deletion by contacting us.</p>

              <h2 className="text-2xl font-heading font-semibold text-primary mt-8">7. Contact</h2>
              <p>For any privacy-related questions or requests, contact us at:</p>
              <p><strong>Email:</strong> contact@okinte.com</p>
              <p className="text-gold font-medium mt-4">Okinte — Placement Services affiliated with IBLT<br/>Authorization N° 11-2015N-MESR/DES</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
