// FILE: src/components/StudentProfilePage.js (NEW FILE)
// =====================================================================
// This component displays a student's public profile page.

import React, { useState, useEffect, useCallback } from 'react';

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-main"></div>
    </div>
);

const ProfileSection = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h3 className="text-xl font-bold text-primary-dark mb-4 pb-2 border-b">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value || 'Not specified'}</p>
    </div>
);

const SkillBadge = ({ skill }) => (
    <span className="bg-primary-lighter text-primary-dark font-medium px-3 py-1 rounded-full text-sm">
        {skill}
    </span>
);

function StudentProfilePage({ studentId, onBackClick }) {
    const [student, setStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStudentProfile = useCallback(async () => {
        if (!studentId) {
            setError("No student selected.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`http://uniwiz.test/get_student_profile.php?student_id=${studentId}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch student profile.");
            }
            setStudent(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        fetchStudentProfile();
    }, [fetchStudentProfile]);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    if (!student) return <div className="p-8 text-center text-gray-500">Student profile not found.</div>;

    const skills = student.skills ? student.skills.split(',').map(s => s.trim()) : [];

    return (
        <div className="p-8 bg-bg-publisher-dashboard min-h-screen">
            <div className="max-w-4xl mx-auto">
                <button onClick={onBackClick} className="flex items-center text-primary-main font-semibold mb-6 hover:text-primary-dark">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Applicants
                </button>

                {/* --- Profile Header --- */}
                <div className="bg-white p-8 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                    <img
                        src={student.profile_image_url ? `http://uniwiz.test/${student.profile_image_url}` : `https://placehold.co/128x128/E8EAF6/211C84?text=${student.first_name.charAt(0)}`}
                        alt="Profile"
                        className="h-32 w-32 rounded-full object-cover border-4 border-primary-lighter shadow-md"
                    />
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-bold text-primary-dark">{student.first_name} {student.last_name}</h1>
                        <p className="text-lg text-gray-600 mt-1">{student.field_of_study || 'Student'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- Left Column --- */}
                    <div className="lg:col-span-2 space-y-8">
                        <ProfileSection title="Educational Background">
                            <InfoItem label="University / Institution" value={student.university_name} />
                            <InfoItem label="Field of Study" value={student.field_of_study} />
                            <InfoItem label="Year of Study" value={student.year_of_study} />
                        </ProfileSection>

                        <ProfileSection title="Skills">
                            {skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill, index) => <SkillBadge key={index} skill={skill} />)}
                                </div>
                            ) : (
                                <p className="text-gray-500">No skills specified.</p>
                            )}
                        </ProfileSection>
                    </div>

                    {/* --- Right Column --- */}
                    <div className="space-y-8">
                        <ProfileSection title="Additional Information">
                             <InfoItem label="Languages Spoken" value={student.languages_spoken} />
                        </ProfileSection>

                        <ProfileSection title="Resume / CV">
                            {student.cv_url ? (
                                <a href={`http://uniwiz.test/${student.cv_url}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-primary-main text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors">
                                    Download CV
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            ) : (
                                <p className="text-gray-500">CV has not been uploaded.</p>
                            )}
                        </ProfileSection>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentProfilePage;

