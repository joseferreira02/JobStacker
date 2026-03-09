'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                email,
                password,
            });

            localStorage.setItem('token', data.token);
            router.push('/');
        } catch (err) {
            const message = axios.isAxiosError(err)
                ? err.response?.data?.error ?? 'Something went wrong'
                : 'Something went wrong';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-between pr-60 p-20">
            {/* Full background image */}
            <Image
                src="/porto.jpg"
                alt="Working at a desk"
                fill
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-black/50" />


            <div className="z-10 ml-[15%]">
                <Image
                    src="/logo.svg"
                    alt="JobStacker"
                    width={429}
                    height={73}
                    className="w-auto h-20 select-none"
                />
            </div>

            <div className="relative z-10 w-full max-w-lg">
                            
            <div className="w-full bg-white p-12 shadow-xl border border-zinc-200 ">

                <div className="flex justify-start">                
                <Image 
                    src="J.svg"
                    width={40}
                    height={40}
                    alt="Jobstacker logo"
                    className='mr-[5%]'
                />
                <h1 className="mb-1 text-3xl font-semibold text-zinc-900">Welcome back</h1>
                </div>
                <p className="mb-8 text-base text-zinc-500">Sign in to your JobStacker account</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="border-b-4 text-black border-zinc-300 px-4 py-3 text-base outline-none focus:border-zinc-500 focus:ring-zinc-500 transition-colors duration-250"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-zinc-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="border-b-4 text-black border-zinc-300 px-4 py-3 text-base outline-none focus:border-zinc-500 focus:ring-zinc-500 transition-colors duration-250"
                        />
                    </div>

                    {error && (
                        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-1 rounded-xl bg-green-600 py-3 text-base font-medium text-white transition hover:bg-green-900 disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="font-medium text-zinc-900 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
            </div>
        </div>
    );
}
