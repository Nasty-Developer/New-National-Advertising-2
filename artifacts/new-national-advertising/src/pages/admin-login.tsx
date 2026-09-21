import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { getGetAdminSessionQueryKey, useGetAdminSession } from '@workspace/api-client-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth, waitForFirebaseUser } from '@/lib/firebase-client';
import { useFirebaseAuth } from '@/lib/use-firebase-auth';

const ADMIN_SESSION_TIMEOUT_MS = 10_000;

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return 'The email or password could not be verified. Check your details and try again.';
}

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const auth = useFirebaseAuth();
  const session = useGetAdminSession({
    query: {
      queryKey: getGetAdminSessionQueryKey(),
      enabled: auth.status === 'authenticated',
      retry: false,
    },
    request: { responseType: 'json', timeoutMs: ADMIN_SESSION_TIMEOUT_MS },
  });
  const [isPending, setIsPending] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (auth.status === 'authenticated' && session.data?.authenticated) {
      setLocation('/admin');
    }
  }, [auth.status, session.data?.authenticated, setLocation]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;
    setError('');
    if (!email.trim() || !password) {
      setError('Enter both your email and password to continue.');
      return;
    }
    try {
      setIsPending(true);
      if (!firebaseAuth) {
        setError('Admin sign in is not configured for this environment yet.');
        return;
      }
      const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      const user = await waitForFirebaseUser(credential.user.uid);
      if (!user) {
        throw new Error('Firebase sign-in completed, but the authenticated session was not ready. Try again.');
      }
      const authorization = await session.refetch();
      if (authorization.error) throw authorization.error;
      if (!authorization.data?.authenticated) {
        throw new Error('The account signed in, but admin authorization could not be confirmed.');
      }
      setLocation('/admin');
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="site-noise flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#f3f6f8] px-5 py-8 text-[#14213d] sm:px-8">
      <div className="pointer-events-none absolute left-[-11rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full border border-[#b8d9e4]/70 bg-[#e4f2f5]/75" />
      <div className="pointer-events-none absolute bottom-[-16rem] right-[-11rem] h-[38rem] w-[38rem] rounded-full border border-[#eddcae]/75 bg-[#fff7df]/70" />
      <section className="relative grid w-full max-w-[970px] overflow-hidden rounded-[24px] border border-[#d7e3e9] bg-[#fffefa] shadow-[0_24px_80px_rgba(30,65,90,.13)] md:grid-cols-[.93fr_1.07fr]" data-testid="page-admin-login">
        <div className="relative hidden overflow-hidden bg-[#14213d] p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="absolute right-[-5rem] top-[-5rem] h-72 w-72 rounded-full border border-[#6caabd]/30" />
          <div className="absolute bottom-[-7rem] left-[-5rem] h-60 w-60 rounded-full border border-[#d9468c]/25" />
          <div className="relative">
            <img src="/new-national-advertising-logo.png" alt="New National Advertising" className="h-14 w-[115px] object-contain brightness-0 invert" />
            <p className="eyebrow mt-16 !text-[#8ccbd7]">Private operating desk</p>
            <h1 className="display mt-4 max-w-[350px] text-[clamp(2.7rem,4vw,4.1rem)] font-extrabold leading-[.94] tracking-[-.08em]">Make the next job easier to run.</h1>
            <p className="mt-6 max-w-[330px] text-[13px] leading-6 text-[#b7c9d3]">Products, production details and publishing controls in one considered workspace for the New National team.</p>
          </div>
          <div className="relative">
            <div className="ink-strip mb-4 w-24"><span /><span /><span /><span /></div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#b7c9d3]"><ShieldCheck size={14} className="text-[#83d3af]" /> Protected studio access</div>
          </div>
        </div>
        <div className="relative px-7 py-9 sm:px-12 sm:py-12">
          <Link href="/" className="inline-flex items-center gap-2 text-[11px] font-bold text-[#557184] transition hover:text-[#1769aa]" data-testid="link-back-to-site"><ArrowLeft size={14} /> Back to site</Link>
          <div className="mt-14 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf5f7] text-[#1769aa]"><LockKeyhole size={22} strokeWidth={1.8} /></div>
          <p className="eyebrow mt-7">Admin sign in</p>
          <h2 className="display mt-3 text-[clamp(2rem,5vw,3.25rem)] font-extrabold leading-[.96] tracking-[-.075em] text-[#14213d]">Welcome back.</h2>
          <p className="mt-4 max-w-[360px] text-[13px] leading-6 text-[#6b7c87]">Sign in to manage the catalogue and keep the public site accurate.</p>
          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.16em] text-[#667d8b]">Work email</span>
              <input data-testid="input-admin-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@newnational.in" className="h-12 w-full rounded-xl border border-[#d4e1e7] bg-[#fbfcfc] px-4 text-[13px] text-[#18314b] outline-none transition placeholder:text-[#a5b2b9] focus:border-[#1769aa] focus:ring-2 focus:ring-[#1769aa]/15" />
            </label>
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.16em] text-[#667d8b]">Password</span>
              <span className="relative block">
                <input data-testid="input-admin-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="h-12 w-full rounded-xl border border-[#d4e1e7] bg-[#fbfcfc] px-4 pr-12 text-[13px] text-[#18314b] outline-none transition placeholder:text-[#a5b2b9] focus:border-[#1769aa] focus:ring-2 focus:ring-[#1769aa]/15" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#78909d] hover:bg-[#eaf3f5] hover:text-[#1769aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769aa]" data-testid="button-toggle-password">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </span>
            </label>
            {error && <div role="alert" className="rounded-xl border border-[#efc8c4] bg-[#fff3f1] px-4 py-3 text-[12px] leading-5 text-[#a4453d]" data-testid="alert-admin-login-error">{error}</div>}
            <button type="submit" disabled={isPending} className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1769aa] text-[12px] font-bold text-white shadow-[0_8px_18px_rgba(23,105,170,.17)] transition hover:-translate-y-0.5 hover:bg-[#125b94] disabled:cursor-wait disabled:opacity-65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769aa] focus-visible:ring-offset-2" data-testid="button-admin-login">
              {isPending ? 'Verifying access…' : 'Enter workspace'} <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>
          <div className="mt-8 flex items-start gap-2 border-t border-[#e7edef] pt-5 text-[10px] leading-4 text-[#8a9aa3]"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#3ba776]" /> Your session is secured with an HttpOnly cookie and is only used for this private workspace.</div>
        </div>
      </section>
    </main>
  );
}