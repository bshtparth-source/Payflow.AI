import { redirect } from 'next/navigation';

export default function RootPage() {
  // Auth and landing page are intentionally out of scope.
  // The app opens directly at /dashboard.
  redirect('/dashboard');
}
