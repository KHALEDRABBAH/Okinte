import { redirect } from 'next/navigation';

export default function RegisterPage({ params: { locale } }: { params: { locale: string } }) {
  redirect(`/${locale}/apply`);
}
