enum StatusColor {
    applied      = 'bg-blue-100 text-blue-700',
    interviewing = 'bg-yellow-100 text-yellow-700',
    offered      = 'bg-green-100 text-green-700',
    rejected     = 'bg-red-100 text-red-700',
    ghosted      = 'bg-zinc-100 text-zinc-500',
}

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

export default function ApplicationCard({ app }: { app: Application }) {
    // DEBUG: Let's log the exact object React receives to see its shape

    return (
        <div className="border border-zinc-200 rounded-xl px-5 py-3">
            <p className="font-semibold text-zinc-900">{app.Job?.title ?? '—'}</p>
            <p className="text-sm text-zinc-500">
                {app.Job?.title ?? '—'}
                {app.Job?.Company?.location ? ` · ${app.Job.Company.location}` : ''}
                {app.Job?.work_mode ? ` · ${app.Job.work_mode}` : ''}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
                {new Date(app.applied_at).toLocaleDateString()}
                <span className={`ml-2 px-2 py-0.5 rounded-full capitalize font-medium ${StatusColor[app.status as keyof typeof StatusColor] ?? 'bg-zinc-100 text-zinc-500'}`}>
                    {app.status}
                </span>
            </p>
        </div>
    );
}
