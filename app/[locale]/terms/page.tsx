import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  const t = useTranslations('metadata');

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-8">Terms of Service</h1>
            
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p className="text-lg"><strong>Last updated:</strong> April 2026</p>

              <h2 className="text-2xl font-heading font-semibold text-primary mt-8">1. About Okinte</h2>
              <p>Okinte is a professional placement and connection service affiliated with IBLT (Authorization N° 11-2015N-MESR/DES). We connect individuals with international opportunities in education, internships, scholarships, employment, and sabbatical programs.</p>

              <h2 className="text-2xl font-heading font-semibold text-primary mt-8">2. Services</h2>
              <p>Okinte provides the following placement services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Study Connection:</strong> University admissions and academic transfers</li>
                <li><strong>Internship Connection:</strong> Professional internship placements</li>
                <li><strong>Scholarship Connection:</strong> Scholarship search and application assistance</li>
                <li><strong>Sabbatical Vacation:</strong> Professional experiences during vacations</li>
                <li><strong>Employment Connection:</strong> Job placement services</li>
              </ul>

              <h2 className="text-2xl font-heading font-semibold text-primary mt-8">3. Registration & Application</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete personal information</li>
                <li>All submitted documents must be authentic and valid</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>Okinte reserves the right to reject applications that do not meet requirements</li>
              </ul>

              <h2 className="text-2xl font-heading font-semibold text-primary mt-8">4. Fees & Payment</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>A pre-registration fee is required to process your application</li>
                <li>Fees are non-refundable once application processing has begun</li>
                <li>All payments are processed securely through our certified payment provider</li>
                <li>Additional institutional fees may apply depending on the program</li>
              </ul>

              <h2 className="text-2xl font-heading font-semibold text-primary mt-8">5. Obligations</h2>
              <p><strong>Okinte commits to:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process all applications professionally and within reasonable timeframes</li>
                <li>Provide accurate information about available opportunities</li>
                <li>Protect your personal data in accordance with our Privacy Policy</li>
                <li>Communicate clearly about application status and next steps</li>
              </ul>
              <p className="mt-4"><strong>The applicant commits to:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide truthful and accurate information</li>
                <li>Submit only authentic documents</li>
                <li>Respond to communications in a timely manner</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>

              <h2 className="text-2xl font-heading font-semibold text-primary mt-8">6. Limitation of Liability</h2>
              <p>Okinte acts as a placement intermediary. We do not guarantee admission, employment, or scholarship awards. Final decisions rest with the respective institutions and organizations. Okinte is not liable for decisions made by third-party institutions.</p>

              <h2 className="text-2xl font-heading font-semibold text-primary mt-8">7. Modifications</h2>
              <p>Okinte reserves the right to modify these terms at any time. Users will be notified of significant changes via email or platform notification.</p>

              <h2 className="text-2xl font-heading font-semibold text-primary mt-8">8. Contact</h2>
              <p>For any questions regarding these terms, contact us at:</p>
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
