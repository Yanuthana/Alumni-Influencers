import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import PanelCard from '../components/dashboard/PanelCard';
import StatCard from '../components/dashboard/StatCard';
import { getPersonalDashboardInsights } from '../services/dashboard-service';
import { UpdateImage } from '../components/manage-profile/update-image';
import { UpdateLinkedIn } from '../components/manage-profile/update-linkedIn';
import { ProfileSectionForm } from '../components/manage-profile/profile-section-form';
import { DeleteConfirmation } from '../components/manage-profile/delete-confirmation';
import { 
    updateProfileImage as updateProfileImageService,
    updateLinkedin as updateLinkedinService,
    updateDegrees as updateDegreesService,
    updateCertifications as updateCertificationsService,
    updateLicenses as updateLicensesService,
    updateCourses as updateCoursesService,
    updateEmployment as updateEmploymentService,
    addDegree as addDegreeService,
    addCertification as addCertificationService,
    addLicense as addLicenseService,
    addCourse as addCourseService,
    addEmployment as addEmploymentService,
    deleteEducation,
    deleteCertification,
    deleteLicense,
    deleteCourse,
    deleteEmployment
} from '../services/manage-profile-service';
function SectionHeader({ eyebrow, title, description }) {
    return (
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <p className="mb-2 text-[11px] font-label uppercase tracking-[0.28em] text-primary/75">{eyebrow}</p>
                <h2 className="font-headline text-3xl text-on-surface md:text-4xl">{title}</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-secondary">{description}</p>
        </div>
    );
}

function SkeletonCard({ className = '' }) {
    return <div className={`animate-pulse rounded-[24px] border border-outline-variant/30 bg-surface-container-low ${className}`} />;
}

function EmptyState({ title, description }) {
    return (
        <PanelCard title={title}>
            <p className="text-secondary">{description}</p>
        </PanelCard>
    );
}

function ErrorState({ title, message }) {
    return (
        <PanelCard title={title}>
            <div className="rounded-2xl border border-error/30 bg-error/8 p-4 text-sm text-on-surface">
                {message}
            </div>
        </PanelCard>
    );
}

function ProgressRing({ value }) {
    const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
    const circumference = 2 * Math.PI * 52;
    const strokeDashoffset = circumference - (safeValue / 100) * circumference;

    return (
        <div className="relative flex h-40 w-40 items-center justify-center">
            <svg className="h-40 w-40 -rotate-90" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="52" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
                <circle
                    cx="70"
                    cy="70"
                    r="52"
                    fill="transparent"
                    stroke="url(#progressGradient)"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    strokeWidth="12"
                />
                <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffb0c9" />
                        <stop offset="100%" stopColor="#8b004b" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute text-center">
                <p className="font-headline text-4xl text-on-surface">{safeValue}%</p>
                <p className="text-xs uppercase tracking-[0.24em] text-secondary">Ready</p>
            </div>
        </div>
    );
}

function InsightList({ items, onUpdate, onDelete }) {
    if (!items?.length) {
        return <p className="text-secondary">No items available yet.</p>;
    }

    const maxCount = Math.max(...items.map((item) => item.count || 0), 1);

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={item.label} className="group">
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-on-surface">{item.label}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => onDelete?.('Skill', item, index)}
                                    className="p-1 rounded-lg hover:bg-error/10 text-error transition-colors" 
                                    title="Delete Skill"
                                >
                                    <span className="material-symbols-outlined text-xs">delete</span>
                                </button>
                            </div>
                        </div>
                        <span className="text-secondary">
                            {item.provider ? `${item.provider} • ` : ''}
                            {item.count}
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-black/35">
                        <div
                            className="h-2 rounded-full murrey-gradient transition-all duration-700"
                            style={{ width: `${Math.max(((item.count || 0) / maxCount) * 100, 12)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function ManageProfile({ user, setUser }) {
    const navigate = useNavigate();
    const [showUpdateImage, setShowUpdateImage] = React.useState(false);
    const [showUpdateLinkedIn, setShowUpdateLinkedIn] = React.useState(false);
    const [activeSection, setActiveSection] = React.useState(null);
    const [deleteModal, setDeleteModal] = React.useState({
        isOpen: false,
        item: null,
        type: '',
        index: -1
    });

    const handleUpdate = (type, item) => {
        toast.success(`Opening update form for ${type}: ${item?.title || item?.name || item?.position || 'item'}`);
    };

    const handleDelete = (type, item, index) => {
        setDeleteModal({
            isOpen: true,
            item,
            type,
            index
        });
    };

    const handleConfirmDelete = async () => {
        const { type, index } = deleteModal;
        const userId = user?.user_id;

        if (index === -1) {
            toast.error(`Cannot delete ${type}: Missing record index.`);
            setDeleteModal({ ...deleteModal, isOpen: false });
            return;
        }

        try {
            let deleteFn;
            switch (type) {
                case 'Education': deleteFn = deleteEducation; break;
                case 'Certification': deleteFn = deleteCertification; break;
                case 'License': deleteFn = deleteLicense; break;
                case 'Course': deleteFn = deleteCourse; break;
                case 'Employment': deleteFn = deleteEmployment; break;
                default: throw new Error('Unknown record type');
            }

            await deleteFn(userId, index);
            toast.success(`${type} record deleted successfully.`);
            fetchProfileData(); // Refresh data without full reload
        } catch (error) {
            toast.error(error?.message || `Failed to delete ${type} record.`);
        } finally {
            setDeleteModal({ isOpen: false, item: null, type: '' });
        }
    };
    const [state, setState] = React.useState({
        data: null,
        error: '',
        loading: true,
    });

    const handleOpenUpdateImage = () => {
        setShowUpdateImage(true);
    };

    const handleConfirmUpdateImage = async (imageUrl) => {
        try {
            await updateProfileImageService(user?.user_id, imageUrl);
            
            // Update localStorage
            const updatedUser = { ...user, profile_image: imageUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            if (setUser) setUser(updatedUser);
            
            toast.success('Profile image updated successfully.');
            fetchProfileData(); // Refresh data without full reload
        } catch (error) {
            toast.error(error?.message || 'Failed to update profile image.');
        } finally {
            setShowUpdateImage(false);
        }
    };

    const handleOpenUpdateLinkedIn = () => {
        setShowUpdateLinkedIn(true);
    };

    const handleCopyLinkedIn = () => {
        const url = data?.linkedin_url || user?.linkedin_url;
        if (url) {
            navigator.clipboard.writeText(url);
            toast.success('LinkedIn URL copied to clipboard!');
        } else {
            toast.error('No LinkedIn URL to copy.');
        }
    };

    const handleOpenUpdate = (section) => {
        setActiveSection(section);
    };

    const handleConfirmUpdate = async (data) => {
        const { type, service, key, storageKey } = activeSection;
        try {
            await service(user?.user_id, data);
            
            // Update localStorage
            const updatedUser = { 
                ...user, 
                detailedProfile: { 
                    ...(user.detailedProfile || {}), 
                    [storageKey]: data 
                } 
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            toast.success(`${type} updated successfully.`);
            fetchProfileData();
        } catch (error) {
            toast.error(error?.message || `Failed to update ${type}.`);
        } finally {
            setActiveSection(null);
        }
    };

    const handleConfirmUpdateLinkedIn = async (linkedinUrl) => {
        try {
            await updateLinkedinService(user?.user_id, linkedinUrl);
            
            // Update localStorage
            const updatedUser = { ...user, linkedin_url: linkedinUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            if (setUser) setUser(updatedUser);
            
            toast.success('LinkedIn profile updated successfully.');
            fetchProfileData(); // Refresh data without full reload
        } catch (error) {
            toast.error(error?.message || 'Failed to update LinkedIn profile.');
        } finally {
            setShowUpdateLinkedIn(false);
        }
    };

    const fetchProfileData = React.useCallback(() => {
        getPersonalDashboardInsights()
            .then((data) => {
                setState({ data, error: '', loading: false });
                
                // Sync back to global user state if needed
                if (data && (data.profile_image !== user?.profile_image || data.linkedin_url !== user?.linkedin_url)) {
                    const updatedUser = { 
                        ...user, 
                        profile_image: data.profile_image || user?.profile_image,
                        linkedin_url: data.linkedin_url || user?.linkedin_url
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    if (setUser) setUser(updatedUser);
                }
            })
            .catch((error) => {
                setState({
                    data: null,
                    error: error.message || 'Failed to load profile data.',
                    loading: false,
                });
            });
    }, []);

    React.useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const data = state.data;
    const isProfileIncomplete = data?.profileCompletion < 100;

    return (
        <main className="min-h-screen bg-surface pb-14 pt-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <section className="mb-10 rounded-[32px] border border-outline-variant/35 bg-[radial-gradient(circle_at_top_left,_rgba(255,176,201,0.2),_transparent_28%),linear-gradient(135deg,_rgba(42,42,42,0.95),_rgba(19,19,19,1))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)] md:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative group">
                                <div className="h-32 w-32 rounded-3xl border-2 border-primary/30 overflow-hidden bg-surface-container-high transition-transform group-hover:scale-105 duration-500">
                                    <img 
                                        src={data?.profile_image || user?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
                                        alt="Profile" 
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <button
                                    onClick={handleOpenUpdateImage}
                                    className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl murrey-gradient text-on-primary shadow-lg transition-transform hover:scale-110"
                                >
                                    <span className="material-symbols-outlined text-xl">upload</span>
                                </button>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="mb-2 text-[11px] font-label uppercase tracking-[0.28em] text-primary/80">
                                    Personal Space
                                </p>
                                <h1 className="font-headline text-4xl text-on-surface md:text-6xl">
                                    Manage Profile
                                </h1>
                                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30">
                                        <span className="material-symbols-outlined text-primary text-sm">link</span>
                                        <span className="text-sm text-on-surface/80">LinkedIn:</span>
                                        <a href={data?.linkedin_url || user?.linkedin_url || '#'} className="text-sm text-primary hover:underline font-medium">
                                            {(data?.linkedin_url || user?.linkedin_url) ? 'View Profile' : 'Not Connected'}
                                        </a>
                                        <button 
                                            onClick={handleCopyLinkedIn}
                                            className="ml-1 p-1 hover:bg-black/20 rounded"
                                            title="Copy LinkedIn URL"
                                        >
                                            <span className="material-symbols-outlined text-xs">content_copy</span>
                                        </button>
                                        <button 
                                            onClick={handleOpenUpdateLinkedIn}
                                            className="ml-2 p-1 hover:bg-black/20 rounded"
                                        >
                                            <span className="material-symbols-outlined text-xs">edit</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {state.loading ? (
                    <div className="space-y-6">
                        <div className="grid gap-6 xl:grid-cols-[1fr_1.7fr]">
                            <SkeletonCard className="h-96" />
                            <SkeletonCard className="h-96" />
                        </div>
                    </div>
                ) : state.error ? (
                    <ErrorState title="Profile data unavailable" message={state.error} />
                ) : !data ? (
                    <EmptyState
                        title="No profile data available"
                        description="Complete your initial profile setup to see insights here."
                    />
                ) : (
                    <div className="space-y-8">
                        {isProfileIncomplete && (
                            <div className="rounded-[24px] border border-primary/20 bg-primary/5 p-6 flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="p-3 rounded-2xl bg-primary/10">
                                    <span className="material-symbols-outlined text-3xl text-primary">warning</span>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="font-headline text-xl text-on-surface">Your profile is incomplete</h3>
                                    <p className="text-secondary text-sm">A complete profile increases your chances of winning bids by 60%. Please fill in the missing sections below.</p>
                                </div>
                                <button className="px-6 py-2.5 rounded-xl murrey-gradient text-on-primary font-headline whitespace-nowrap">
                                    Fill Missing Info
                                </button>
                            </div>
                        )}

                        <div className="grid gap-6 xl:grid-cols-[1fr_1.7fr]">
                            <PanelCard eyebrow="Completion" title="Profile Strength">
                                <div className="flex flex-col items-center gap-6">
                                    <ProgressRing value={data.profileCompletion} />
                                    <div className="w-full space-y-3">
                                        {[
                                            ['Education', data.profileBreakdown?.education],
                                            ['Certifications', data.profileBreakdown?.certifications],
                                            ['Licenses', data.profileBreakdown?.licenses],
                                            ['Experience', data.profileBreakdown?.experience],
                                            ['Professional Courses', data.profileBreakdown?.professionalCourses],
                                        ].map(([label, complete]) => (
                                            <div key={label} className="flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3">
                                                <span className="text-sm text-on-surface">{label}</span>
                                                <span className={`material-symbols-outlined text-lg ${complete ? 'text-tertiary' : 'text-secondary/60'}`}>
                                                    {complete ? 'check_circle' : 'radio_button_unchecked'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </PanelCard>

                            <PanelCard
                                eyebrow="Skills Pulse"
                                title="Personal Skills Panel"
                                action={
                                    <button 
                                        onClick={() => handleUpdate('Skill')}
                                        className="text-xs font-label uppercase tracking-[0.24em] text-primary hover:text-primary-light transition-colors"
                                    >
                                        Update Skills
                                    </button>
                                }
                            >
                                {data.skills?.length ? (
                                    <InsightList 
                                        items={data.skills} 
                                        onUpdate={handleUpdate}
                                        onDelete={handleDelete}
                                    />
                                ) : (
                                    <p className="text-secondary">No personal skill data available yet.</p>
                                )}
                            </PanelCard>
                        </div>

                        <section>
                            <SectionHeader
                                eyebrow="Verification"
                                title="Detailed Profile Records"
                            />
                            <div className="grid gap-6 md:grid-cols-2">
                                <PanelCard 
                                    eyebrow="Education" 
                                    title="Degrees & Qualifications"
                                    action={
                                        <button 
                                            onClick={() => handleOpenUpdate({
                                                type: 'Education',
                                                title: 'Update Degrees',
                                                description: 'Manage your academic qualifications.',
                                                service: updateDegreesService,
                                                addService: addDegreeService,
                                                storageKey: 'degrees',
                                                fields: [
                                                    { key: 'title', label: 'Degree Title', placeholder: 'Degree Title (e.g. BSc Computer Science)' },
                                                    { key: 'institution', label: 'Institution', placeholder: 'Institution (e.g. IIT)' },
                                                    { key: 'year', label: 'Year', placeholder: 'Year (e.g. 2022)', type: 'year' }
                                                ]
                                            })}
                                            className="text-xs font-label uppercase tracking-[0.24em] text-primary hover:text-primary-light transition-colors"
                                        >
                                            {data.detailedProfile?.degrees?.length > 0 ? 'Update Education' : 'Add Education'}
                                        </button>
                                    }
                                >
                                    {data.detailedProfile?.degrees?.length > 0 ? (
                                        <div className="space-y-4">
                                            {data.detailedProfile.degrees.map((deg, index) => (
                                                <div key={index} className="group relative border-l-2 border-primary/30 pl-4 py-1 hover:border-primary transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-headline text-lg text-on-surface">{deg.title}</p>
                                                            <p className="text-sm text-secondary">{deg.institution} • {deg.year}</p>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => handleDelete('Education', deg, index)}
                                                                className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors" title="Delete"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-secondary italic">No degree records found.</p>}
                                </PanelCard>

                                <PanelCard 
                                    eyebrow="Credentials" 
                                    title="Certifications"
                                    action={
                                        <button 
                                            onClick={() => handleOpenUpdate({
                                                type: 'Certification',
                                                title: 'Update Certifications',
                                                description: 'Manage your professional certifications.',
                                                service: updateCertificationsService,
                                                addService: addCertificationService,
                                                storageKey: 'certifications',
                                                fields: [
                                                    { key: 'name', label: 'Certification Name', placeholder: 'Certification Name (e.g. AWS Certified Developer)' },
                                                    { key: 'issuer', label: 'Issuer', placeholder: 'Issuer (e.g. Amazon)' },
                                                    { key: 'year', label: 'Year', placeholder: 'Year (e.g. 2023)', type: 'year' }
                                                ]
                                            })}
                                            className="text-xs font-label uppercase tracking-[0.24em] text-primary hover:text-primary-light transition-colors"
                                        >
                                            {data.detailedProfile?.certifications?.length > 0 ? 'Update Certifications' : 'Add Certifications'}
                                        </button>
                                    }
                                >
                                    {data.detailedProfile?.certifications?.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {data.detailedProfile.certifications.map((cert, index) => (
                                                <div key={index} className="group relative rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 w-full hover:border-primary transition-colors">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <span className="material-symbols-outlined text-primary">verified</span>
                                                            <div>
                                                                <p className="font-headline text-on-surface">{cert.name}</p>
                                                                <p className="text-xs text-secondary">{cert.issuer} • {cert.year}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => handleDelete('Certification', cert, index)}
                                                                className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors" title="Delete"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-secondary italic">No certifications recorded.</p>}
                                </PanelCard>

                                <PanelCard 
                                    eyebrow="Compliance" 
                                    title="Licenses"
                                    action={
                                        <button 
                                            onClick={() => handleOpenUpdate({
                                                type: 'License',
                                                title: 'Update Licenses',
                                                description: 'Manage your professional licenses.',
                                                service: updateLicensesService,
                                                addService: addLicenseService,
                                                storageKey: 'licenses',
                                                fields: [
                                                    { key: 'name', label: 'License Name', placeholder: 'License Name (e.g. Driving License)' },
                                                    { key: 'authority', label: 'Authority', placeholder: 'Authority (e.g. Department of Motor Traffic)' },
                                                    { key: 'year', label: 'Year', placeholder: 'Year (e.g. 2020)', type: 'year' }
                                                ]
                                            })}
                                            className="text-xs font-label uppercase tracking-[0.24em] text-primary hover:text-primary-light transition-colors"
                                        >
                                            {data.detailedProfile?.licenses?.length > 0 ? 'Update Licenses' : 'Add Licenses'}
                                        </button>
                                    }
                                >
                                    {data.detailedProfile?.licenses?.length > 0 ? (
                                        <div className="space-y-4">
                                            {data.detailedProfile.licenses.map((lic, index) => (
                                                <div key={index} className="group relative border-l-2 border-primary/30 pl-4 py-1 hover:border-primary transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-headline text-lg text-on-surface">{lic.name}</p>
                                                            <p className="text-sm text-secondary">{lic.authority} • {lic.year}</p>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => handleDelete('License', lic, index)}
                                                                className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors" title="Delete"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-secondary italic">No license records found.</p>}
                                </PanelCard>

                                <PanelCard 
                                    eyebrow="Learning" 
                                    title="Professional Courses"
                                    action={
                                        <button 
                                            onClick={() => handleOpenUpdate({
                                                type: 'Course',
                                                title: 'Update Professional Courses',
                                                description: 'Manage your professional courses.',
                                                service: updateCoursesService,
                                                addService: addCourseService,
                                                storageKey: 'professionalCourses',
                                                fields: [
                                                    { key: 'name', label: 'Course Name', placeholder: 'Course Name (e.g. Full Stack Development)' },
                                                    { key: 'provider', label: 'Provider', placeholder: 'Provider (e.g. Udemy)' },
                                                    { key: 'year', label: 'Year', placeholder: 'Year (e.g. 2024)', type: 'year' }
                                                ]
                                            })}
                                            className="text-xs font-label uppercase tracking-[0.24em] text-primary hover:text-primary-light transition-colors"
                                        >
                                            {data.detailedProfile?.professionalCourses?.length > 0 ? 'Update Courses' : 'Add Courses'}
                                        </button>
                                    }
                                >
                                    {data.detailedProfile?.professionalCourses?.length > 0 ? (
                                        <div className="space-y-3">
                                            {data.detailedProfile.professionalCourses.map((course, index) => (
                                                <div key={index} className="group relative flex justify-between items-center rounded-2xl bg-black/20 p-4 hover:bg-black/30 transition-colors">
                                                    <div>
                                                        <p className="text-on-surface font-medium">{course.name}</p>
                                                        <p className="text-xs text-secondary">{course.provider}</p>
                                                        <p className="text-[10px] text-primary mt-1">{course.year}</p>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => handleDelete('Course', course, index)}
                                                            className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors" title="Delete"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-secondary italic">No professional courses found.</p>}
                                </PanelCard>

                                <PanelCard 
                                    eyebrow="Career" 
                                    title="Employment History"
                                    action={
                                        <button 
                                            onClick={() => handleOpenUpdate({
                                                type: 'Employment',
                                                title: 'Update Employment History',
                                                description: 'Manage your professional experience.',
                                                service: updateEmploymentService,
                                                addService: addEmploymentService,
                                                storageKey: 'employmentHistory',
                                                fields: [
                                                    { key: 'company', label: 'Company', placeholder: 'Company Name (e.g. WSO2)', altKey: 'employer' },
                                                    { key: 'position', label: 'Position', placeholder: 'Position (e.g. Software Engineer)' },
                                                    { key: 'years', label: 'Years', placeholder: 'Years (e.g. 2022-2024)', altKey: 'period', type: 'employmentYears' }
                                                ]
                                            })}
                                            className="text-xs font-label uppercase tracking-[0.24em] text-primary hover:text-primary-light transition-colors"
                                        >
                                            {data.detailedProfile?.employmentHistory?.length > 0 ? 'Update History' : 'Add History'}
                                        </button>
                                    }
                                >
                                    {data.detailedProfile?.employmentHistory?.length > 0 ? (
                                        <div className="space-y-4">
                                            {data.detailedProfile.employmentHistory.map((job, index) => (
                                                <div key={index} className="group relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-outline-variant/30 hover:before:bg-primary transition-colors pb-4">
                                                    <div className="absolute left-[-4px] top-2 h-2 w-2 rounded-full bg-primary" />
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-headline text-on-surface">{job.position}</p>
                                                            <p className="text-sm text-secondary">{job.company || job.employer}</p>
                                                            <p className="text-xs text-secondary/60 mt-1">{job.years || job.period}</p>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => handleDelete('Employment', job, index)}
                                                                className="p-1.5 rounded-lg hover:bg-error/10 text-error transition-colors" title="Delete"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-secondary italic">No employment history found.</p>}
                                </PanelCard>
                            </div>
                        </section>

                        <PanelCard eyebrow="Performance" title="Personal Bidding Performance">
                            <div className="grid gap-4 md:grid-cols-3">
                                <StatCard
                                    icon="emoji_events"
                                    label="Wins"
                                    value={data.biddingStats?.wins || 0}
                                    helper="All recorded winning bids"
                                />
                                <StatCard
                                    icon="gavel"
                                    label="Total Bids"
                                    value={data.biddingStats?.totalBids || 0}
                                    helper="Participations across slots"
                                    accent="from-secondary-container/60 to-surface-bright"
                                />
                                <StatCard
                                    icon="monitoring"
                                    label="Win Rate"
                                    value={data.biddingStats?.winRate || 0}
                                    suffix="%"
                                    helper={
                                        data.biddingStats?.activeWinner
                                            ? 'You are currently marked as an active winner'
                                            : 'Keep bidding to improve your conversion'
                                    }
                                    progress={data.biddingStats?.winRate || 0}
                                    accent="from-primary/35 to-[#5f163d]"
                                />
                            </div>
                        </PanelCard>
                    </div>
                )}
            </div>
            <UpdateImage
                isOpen={showUpdateImage}
                onClose={() => setShowUpdateImage(false)}
                onConfirm={handleConfirmUpdateImage}
            />
            <UpdateLinkedIn
                isOpen={showUpdateLinkedIn}
                initialValue={data?.linkedin_url || user?.linkedin_url || ''}
                onClose={() => setShowUpdateLinkedIn(false)}
                onConfirm={handleConfirmUpdateLinkedIn}
            />
            <ProfileSectionForm
                isOpen={!!activeSection}
                title={activeSection?.title}
                description={activeSection?.description}
                fields={activeSection?.fields || []}
                initialData={data?.detailedProfile?.[activeSection?.storageKey] || []}
                addService={activeSection?.addService}
                updateService={activeSection?.service}
                userId={user?.user_id}
                onClose={() => {
                    setActiveSection(null);
                    fetchProfileData();
                }}
            />
            <DeleteConfirmation
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={handleConfirmDelete}
                itemName={deleteModal.item?.title || deleteModal.item?.name || deleteModal.item?.position || 'this record'}
                itemType={deleteModal.type}
            />
        </main>
    );
}

export default ManageProfile;
