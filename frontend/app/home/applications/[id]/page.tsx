"use client";

import { useParams } from "next/navigation";

export default function ApplicationPage() {
    const params = useParams();
    const id = params.id;

    return (
        <div>
            <h1>Application {id}</h1>
        </div>
    );
}