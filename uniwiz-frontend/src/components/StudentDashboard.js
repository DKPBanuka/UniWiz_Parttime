// FILE: src/components/StudentDashboard.js (Fixed)
// ===================================================

import React from 'react';

function StudentDashboard({ jobs, currentUser, handleApply, appliedJobs, applyingStatus }) {
    return (
        <main className="container mx-auto px-6 py-8">
            <h2 className="text-4xl font-bold text-[#2D336B] mb-8 text-center">Find Your Next Opportunity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {jobs.length > 0 ? jobs.map((job) => {
                    const hasApplied = appliedJobs.has(job.id);
                    const isApplying = applyingStatus[job.id] === 'applying';
                    return (
                        <div key={job.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                            <div className="p-6 flex flex-col h-full">
                                <div className="flex-grow">
                                    <span className="inline-block bg-[#A9B5DF] text-[#2D336B] text-sm font-semibold px-3 py-1 rounded-full mb-3">{job.category}</span>
                                    <h3 className="text-2xl font-bold text-[#2D336B] mb-2">{job.title}</h3>
                                    <p className="text-gray-600 mb-4">Posted by: <span className="font-semibold">{job.publisher}</span></p>
                                    <div className="space-y-2 text-gray-700">
                                        <p><strong>Type:</strong> {job.job_type}</p>
                                        <p><strong>Payment:</strong> {job.payment_range}</p>
                                    </div>
                                </div>
                                <div className="mt-6 text-right">
                                    {currentUser && currentUser.role === 'student' ? (
                                        // **FIX IS HERE**: We now pass the whole 'job' object instead of just 'job.id'
                                        <button onClick={() => handleApply(job)} disabled={hasApplied || isApplying} className={`font-bold py-2 px-5 rounded-lg transition duration-300 ${hasApplied ? 'bg-green-500 text-white cursor-not-allowed' : isApplying ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#7886C7] text-white hover:bg-[#2D336B]'}`}>
                                            {hasApplied ? 'Applied' : isApplying ? 'Applying...' : 'Apply Now'}
                                        </button>
                                    ) : (
                                        <button className="bg-gray-400 text-white font-bold py-2 px-5 rounded-lg cursor-not-allowed">View Details</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }) : <p className="col-span-3 text-center text-gray-500 py-16">No jobs available at the moment. Please check back later.</p>}
            </div>
        </main>
    );
}

export default StudentDashboard;
