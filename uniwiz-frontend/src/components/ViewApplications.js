import React, { useState, useEffect } from 'react';

function ViewApplications({ jobId, onBackClick }) {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            if (!jobId) return;
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://uniwiz.test/get_applications.php?job_id=${jobId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch applications.');
                }
                const data = await response.json();
                setApplications(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchApplications();
    }, [jobId]);

    return (
        <main className="container mx-auto px-6 py-8">
            <div className="flex items-center mb-8">
                <button onClick={onBackClick} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>
            </div>

            <h2 className="text-4xl font-bold text-[#2D336B] mb-6">Job Applications</h2>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                    {isLoading ? (
                        <p className="text-center text-gray-500 py-8">Loading applications...</p>
                    ) : error ? (
                        <p className="text-center text-red-500 py-8">{error}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {applications.length > 0 ? (
                                        applications.map(app => (
                                            <tr key={app.student_id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{app.first_name} {app.last_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{app.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.applied_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                                                        {app.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No applications received for this job yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default ViewApplications;
