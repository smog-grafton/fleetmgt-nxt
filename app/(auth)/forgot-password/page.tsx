import { Metadata } from 'next';
import { PasswordForm } from '@/features/auth/password-form';
export const metadata: Metadata = { title: 'Forgot password' };
export default function ForgotPasswordPage() { return <PasswordForm mode="forgot" />; }
