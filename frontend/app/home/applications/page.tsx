'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ApplicationCard from './ApplicationCard';

interface Application {
    id: number;
    status: string;
    applied_at: string;
    Job: {
        title: string;
        work_mode: string;
        Company: {
            title: string;
            location: string;
        };
    };
}

interface ApplicationsPage {
    applications: Application[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function Applications() {
    const router = useRouter();
    const [data, setData] = useState<ApplicationsPage | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchApplications = useCallback(async (pageNum: number) => {
        setLoading(true);
        setError('');
        try {
            const token = sessionStorage.getItem('accessToken');
            if (!token) {
                router.push('/login');
                return;
            }

            const res = await axios.get<ApplicationsPage>(
                `${process.env.NEXT_PUBLIC_API_URL}/applications?page=${pageNum}&limit=10`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );
            setData(res.data);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                sessionStorage.removeItem('accessToken');
                router.push('/login');
            } else {
                setError('Failed to load applications.');
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchApplications(page);
    }, [page, fetchApplications]);

    return (
        <div className="flex-1 p-8 overflow-auto">
            {loading && <p className="text-zinc-400">Loading…</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {data && !loading && (
                <>
                    <p className="text-sm text-zinc-500 mb-4">{data.total} applications</p>

                    <div className="flex flex-col gap-3">
                        {data.applications.map((app) => (
                            <ApplicationCard key={app.id} app={app} />
                        ))}
                    </div>

                    {data.totalPages > 1 && (
                        <div className="flex items-center gap-4 mt-6">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="text-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-30"
                            >
                                ← Prev
                            </button>
                            <span className="text-sm text-zinc-500">{page} / {data.totalPages}</span>
                            <button
                                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                                disabled={page === data.totalPages}
                                className="text-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-30"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
