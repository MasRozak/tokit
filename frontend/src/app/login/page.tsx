'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function LoginLayout() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            try {
                const token = sessionStorage.getItem('jwtToken');
                if (token) {
                    setIsAuthenticated(true);

                    toast.success('You are already logged in!');
                    router.push('/');
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {

        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Already Logged In</h2>
                    <p className="text-gray-600 mb-6">You are already logged in. Redirecting to home...</p>

                    <Link
                        href="/"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const payload = {
            username: formData.get('email'),
            password: formData.get('password'),
        };
        try {

             const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                toast.success('Login successful');
                const data = await res.json();
                if (data.token) {
                    sessionStorage.setItem('jwtToken', data.token);

                    const userRole = data.role || data.user?.role;
                    if (userRole === 'admin') {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = '/';
                    }
                }
            } else {
                const dataa = await res.json();
                toast.error(dataa.message || 'Login failed');
            }
        } catch (err) {
            toast.error('Error logging in');
            console.error('Error:', err);
        }
    }    return (
        <>
            <div className="min-h-screen flex flex-col lg:flex-row">
                {}
                <div className="hidden lg:block lg:w-1/2 relative bg-slate-300 overflow-hidden">
                    <img
                        className="w-full h-full object-cover"
                        src="https://d3q27bh1u24u2o.cloudfront.net/news/Levilling_Up.png"
                        alt="Chair"
                    />
                </div>

                {}
                <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                    <div className="w-full max-w-md space-y-6 sm:space-y-8">
                        {}
                        <div className="text-center lg:text-left space-y-2 sm:space-y-4">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-black leading-tight">
                                Log in to Exclusive
                            </h1>
                            <p className="text-sm sm:text-base text-black">
                                Enter your details below
                            </p>
                        </div>

                        {}
                        <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
                            {}
                            <div className="space-y-2">
                                <input
                                    name="email"
                                    type="text"
                                    className="w-full border-b border-black/50 focus:border-black outline-none text-black text-sm sm:text-base font-normal bg-transparent placeholder-black/50 pb-2 px-0 transition-colors touch-manipulation"
                                    placeholder="Enter your Username"
                                    required
                                />
                            </div>

                            {}
                            <div className="space-y-2">
                                <input
                                    name="password"
                                    type="password"
                                    className="w-full border-b border-black/50 focus:border-black outline-none text-black text-sm sm:text-base font-normal bg-transparent placeholder-black/50 pb-2 px-0 transition-colors touch-manipulation"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            {}
                            <div className="space-y-4">
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-600 rounded text-white text-sm sm:text-base font-medium transition-colors touch-manipulation"
                                >
                                    Login
                                </button>

                                {}
                                <div className="text-center lg:text-left">
                                    <Link
                                        href="/login"
                                        className="text-blue-500 text-sm sm:text-base hover:text-blue-600 active:text-blue-600 underline transition-colors"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>

                                {}                                <div className="text-center lg:text-left text-sm sm:text-base text-black/70">
                                    Don&apos;t have an account?{' '}
                                    <Link
                                        href="/register"
                                        className="text-blue-500 hover:text-blue-600 active:text-blue-600 underline transition-colors"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
