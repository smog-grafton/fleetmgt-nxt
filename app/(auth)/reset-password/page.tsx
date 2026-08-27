import { Metadata } from 'next';
import { PasswordForm } from '@/features/auth/password-form';
export const metadata: Metadata = { title: 'Reset password' };
export default function ResetPasswordPage() { return <PasswordForm mode="reset" />; }
