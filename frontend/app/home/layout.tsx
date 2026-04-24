'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import axios from 'axios';
import Breadcrumbs from './BreadCrums';

export default function Layout({ children }) {
    const router = useRouter();

    useEffect(() => {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    const handleLogout = async () => {
        try {
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
                {},
                { withCredentials: true }
            );
        } catch (err) {
            console.error('Logout failed', err);
        } finally {
            sessionStorage.removeItem('accessToken');
            router.push('/login');
        }
    };

    return (
        <div className="h-screen bg-orange-50 flex">
            {/* Sidebar */}
            <div className="w-1/7 bg-neutral-800">
                <button
                    className="w-full h-20 p-5 bg-amber-500 text-white hover:bg-amber-600"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>

            {/* Main */}
            <div className="flex-1 flex flex-col">
                {/* Topbar */}
                <div className="h-20 p-5 bg-neutral-50 shadow-md">
                    <Breadcrumbs />
                </div>

                {/* Page content */}
                <div className="flex-1 p-8 overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}