import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '@/Layouts/UserLayout';
import Swal from 'sweetalert2';

export default function MyRequests({ requests, services = [], userRole, auth, isAlumniVerified }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [trackingRequest, setTrackingRequest] = useState(null);

    const form = useForm({
        service_id: '',
        delivery_mode: '',
        purpose: '',
        preferred_claiming_date: '',
        internship_school_or_agency: '',
        grade_level_handled: '',
        semester: '',
        school_year: '',
        requirement_file: null
    });

    const showAlert = (title, text, iconHtml) => Swal.mixin({
        customClass: { popup: 'rounded-[2rem] shadow-2xl border border-slate-100 bg-white pb-4', title: 'text-slate-900 font-extrabold text-2xl pt-4', htmlContainer: 'text-slate-500 text-sm font-medium', icon: 'border-0 scale-125 mt-6' },
        buttonsStyling: false
    }).fire({ title, text, iconHtml, timer: 2500, showConfirmButton: false });

    const requestList = requests?.data ?? [];
    const paginationLinks = requests?.meta?.links ?? requests?.links ?? [];

    const isInternship = services.find(s => String(s.id) === String(form.data.service_id))?.code === 'internship_certificate';

    const closeModal = () => { setIsModalOpen(false); form.reset(); form.clearErrors(); };

    const handleServiceChange = (e) => {
        form.setData({
            ...form.data,
            service_id: e.target.value,
            internship_school_or_agency: '',
            grade_level_handled: '',
            semester: '',
            school_year: ''
        });
    };

    const handleDeliveryModeChange = (e) => {
        form.setData('delivery_mode', e.target.value);
    };

    const submitRequest = (e) => {
        e.preventDefault();
        form.post('/user/requests', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                showAlert('Request Submitted!', 'Your document request has been successfully sent.', '<svg class="w-12 h-12 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" strokeLinejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>');
            },
            onError: () => showAlert('Could Not Submit', 'Please check the form for errors and try again.', '<svg class="w-12 h-12 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" strokeLinejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>')
        });
    };

    const getStatusStyle = (s = '') => s.toLowerCase().includes('processing') ? 'bg-blue-100 text-blue-700' : s.toLowerCase().match(/ready|released/) ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700';
    const inputClass = "w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:ring-yellow-500 focus:border-yellow-500 outline-none";
    const labelClass = "block text-xs font-bold text-slate-500 uppercase mb-2";

    return (
        <UserLayout userRole={userRole}>
            <Head title="My Requests" />
            <div className="p-6 sm:p-8 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-md rounded-t-3xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div><h2 className="text-xl font-extrabold text-slate-900 tracking-tight">My Requests</h2><p className="text-xs text-slate-500 mt-1">Track and manage your official document requests.</p></div>
                <button onClick={() => setIsModalOpen(true)} disabled={auth?.user?.user_type === 'alumni' && !isAlumniVerified} className="w-full sm:w-auto px-6 py-2.5 bg-yellow-400 text-slate-900 font-bold rounded-xl shadow-md hover:bg-yellow-500 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">+ Submit New Request</button>
            </div>

            <div className="p-6 sm:p-8">
                <div className="space-y-4">
                    {requestList.length ? requestList.map((req) => (
                        <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 shrink-0">
                                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-base text-slate-900">{req.document_type}</h4>
                                    <div className="flex gap-3 text-xs text-slate-400 font-medium mt-1">
                                        <span>Tracking ID: #{req.id}</span> <span>{req.created_at}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                                <span className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(req.status)}`}>{req.status}</span>
                                <button onClick={() => setTrackingRequest(req)} className="text-yellow-700 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors shadow-sm">
                                    Track
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-sm text-slate-500 font-medium">You haven't made any requests yet.</p>
                            <button onClick={() => setIsModalOpen(true)} className="mt-3 text-sm font-bold text-yellow-600 hover:text-yellow-700">Submit your first request</button>
                        </div>
                    )}
                </div>
                {paginationLinks.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-8">
                        {paginationLinks.map((l, i) => (
                            <Link key={i} href={l.url || '#'} preserveScroll dangerouslySetInnerHTML={{ __html: l.label }} className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${l.active ? 'bg-yellow-400 text-slate-900' : l.url ? 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-white border border-slate-100 text-slate-300 cursor-not-allowed'}`} />
                        ))}
                    </div>
                )}
            </div>

            {/* Tracking / Audit Trail Modal */}
            {trackingRequest && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                            <h3 className="font-bold text-slate-900 text-lg">Track Request</h3>
                            <button onClick={() => setTrackingRequest(null)} className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="bg-slate-50 p-4 rounded-xl text-sm border border-slate-200 shadow-inner mb-6">
                                <p className="mb-1"><strong className="text-slate-700">Document:</strong> <span className="font-semibold text-slate-900">{trackingRequest.document_type}</span></p>
                                <p><strong className="text-slate-700">Tracking ID:</strong> <span className="font-semibold text-slate-900">#{trackingRequest.id}</span></p>
                            </div>

                            <h4 className="text-sm font-bold text-slate-900 mb-4">Status History & Remarks</h4>
                            <div className="relative pl-4 border-l-2 border-slate-200 space-y-5 mt-4">
                                {trackingRequest.status_history?.length > 0 ? trackingRequest.status_history.map((log, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[23px] top-1 w-3 h-3 bg-yellow-400 rounded-full ring-4 ring-white"></div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                                            <div className="flex justify-between items-start mb-1 gap-2">
                                                <span className="font-bold text-slate-800">{log.status}</span>
                                                <span className="text-slate-400 font-medium text-[10px] shrink-0">{log.date}</span>
                                            </div>
                                            {log.note ? (
                                                <p className="text-slate-600 mt-1 italic leading-relaxed">"{log.note}"</p>
                                            ) : (
                                                <p className="text-slate-400 mt-1 italic">No remarks provided.</p>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-slate-500 text-center">No tracking history available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Submission Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50 shrink-0">
                            <h3 className="font-bold text-slate-900 text-lg">Request Document</h3>
                            <button onClick={closeModal} className="p-2 bg-white rounded-full text-slate-500 hover:text-slate-800 shadow-sm"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <form onSubmit={submitRequest} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-3 mb-2">
                                <div>
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Full Name</span>
                                    <span className="text-sm font-semibold text-slate-800">{auth?.user?.first_name} {auth?.user?.last_name}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Student Number</span>
                                    <span className="text-sm font-semibold text-slate-800">{auth?.user?.student_number || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Program / Major</span>
                                    <span className="text-sm font-semibold text-slate-800">{auth?.user?.course?.label || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Year / Batch</span>
                                    <span className="text-sm font-semibold text-slate-800">{auth?.user?.year_level || auth?.user?.batch_year || 'N/A'}</span>
                                </div>
                                <div className="col-span-2 mt-1 border-t border-slate-200/60 pt-2">
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Contact Email & Number</span>
                                    <span className="text-sm font-semibold text-slate-800">{auth?.user?.email} | {auth?.user?.contact_number}</span>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Document Type</label>
                                <select value={form.data.service_id} onChange={handleServiceChange} className={inputClass} required>
                                    <option value="" disabled>Select Document...</option>
                                    {services.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                </select>
                                {form.errors.service_id && <p className="text-xs text-red-600 mt-1.5">{form.errors.service_id}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Delivery Mode</label>
                                <select value={form.data.delivery_mode} onChange={handleDeliveryModeChange} className={inputClass} required>
                                    <option value="" disabled>Select Delivery Mode...</option>
                                    <option value="soft_copy">Soft Copy</option>
                                    <option value="hard_copy">Hard Copy</option>
                                </select>
                                {form.errors.service_id && <p className="text-xs text-red-600 mt-1.5">{form.errors.service_id}</p>}
                            </div>

                            {isInternship && (
                                <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 mb-2">Internship Details</p>
                                    <div>
                                        <label className={labelClass}>School / Agency</label>
                                        <input type="text" value={form.data.internship_school_or_agency} onChange={e => form.setData('internship_school_or_agency', e.target.value)} className={inputClass} required />
                                        {form.errors.internship_school_or_agency && <p className="text-xs text-red-600 mt-1.5">{form.errors.internship_school_or_agency}</p>}
                                    </div>
                                    <div>
                                        <label className={labelClass}>Grade Level Handled (if applicable)</label>
                                        <input type="text" value={form.data.grade_level_handled} onChange={e => form.setData('grade_level_handled', e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Semester</label>
                                            <input type="text" placeholder="e.g. 1st Sem" value={form.data.semester} onChange={e => form.setData('semester', e.target.value)} className={inputClass} required />
                                            {form.errors.semester && <p className="text-xs text-red-600 mt-1.5">{form.errors.semester}</p>}
                                        </div>
                                        <div>
                                            <label className={labelClass}>School Year</label>
                                            <input type="text" placeholder="e.g. 2025-2026" value={form.data.school_year} onChange={e => form.setData('school_year', e.target.value)} className={inputClass} required />
                                            {form.errors.school_year && <p className="text-xs text-red-600 mt-1.5">{form.errors.school_year}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className={labelClass}>Purpose of Request</label>
                                <textarea rows="2" value={form.data.purpose} onChange={e => form.setData('purpose', e.target.value)} placeholder="Please state your reason..." className={`${inputClass} resize-none`} required />
                                {form.errors.purpose && <p className="text-xs text-red-600 mt-1.5">{form.errors.purpose}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Required Supporting Document/s (if any)</label>
                                <input type="file" onChange={e => form.setData('requirement_file', e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-200 cursor-pointer" />
                                {form.errors.requirement_file && <p className="text-xs text-red-600 mt-1.5">{form.errors.requirement_file}</p>}
                            </div>

                            <div>
                                <label className={labelClass}>Preferred Claiming Date (Optional)</label>
                                <input type="date" value={form.data.preferred_claiming_date} min={new Date().toISOString().split('T')[0]} onChange={e => form.setData('preferred_claiming_date', e.target.value)} className={inputClass} />
                            </div>

                            <button type="submit" disabled={form.processing} className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm disabled:opacity-60">
                                {form.processing ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </UserLayout>
    );
}