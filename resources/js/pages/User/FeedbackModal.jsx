import { useState } from 'react';
import { useForm } from '@inertiajs/react';

const Star = ({ filled, onClick, onMouseEnter, onMouseLeave, readOnly = false }) => {
    const Wrapper = readOnly ? 'span' : 'button';

    return (
        <Wrapper
            type={readOnly ? undefined : 'button'}
            onClick={readOnly ? undefined : onClick}
            onMouseEnter={readOnly ? undefined : onMouseEnter}
            onMouseLeave={readOnly ? undefined : onMouseLeave}
            className={`p-0.5 ${readOnly ? '' : 'transition-transform hover:scale-110 focus:outline-none cursor-pointer'}`}
            aria-label="Rate"
        >
            <svg
                className={`w-9 h-9 transition-colors ${filled ? 'text-yellow-400' : 'text-slate-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.914c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
        </Wrapper>
    );
};

const RATING_LABELS = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
};

export default function FeedbackModal({ request, onClose }) {
    const [hovered, setHovered] = useState(0);
    const { data, setData, post, processing, errors, reset } = useForm({
        request_id: request.id,
        rating: 0,
        comments: '',
    });

    // Normalize the rating to a number — if this ever came through as a
    // string ("4") or nested differently, this is where it'd silently break.
    const existingFeedback = request.feedback
        ? { ...request.feedback, rating: Number(request.feedback.rating) }
        : null;

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('user.feedback.store', { id: request.id }), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    const handleSkip = () => {
        reset();
        onClose();
    };

    const displayRating = hovered || data.rating;

    // ── READ-ONLY VIEW: request already has feedback ───────────────────
    if (existingFeedback) {
        return (
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                    <div className="text-center mb-5">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center">
                            <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg">Your Feedback</h3>
                        {request.document_type && (
                            <p className="text-xs text-slate-500 mt-1">For your {request.document_type} request</p>
                        )}
                    </div>

                    <div className="flex justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} filled={n <= existingFeedback.rating} readOnly />
                        ))}
                    </div>
                    <p className="text-center text-xs font-semibold text-slate-500 h-4 mb-4">
                        {RATING_LABELS[existingFeedback.rating] || ''}
                    </p>

                    {existingFeedback.comments ? (
                        <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3 mb-5 leading-relaxed">
                            {existingFeedback.comments}
                        </p>
                    ) : (
                        <p className="text-xs text-slate-400 text-center italic mb-5">No additional comments left.</p>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    // ── SUBMISSION FORM: no feedback yet ────────────────────────────────
    return (
        <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={(e) => e.target === e.currentTarget && handleSkip()}
        >
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
                <div className="text-center mb-5">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">Request Completed</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {request.document_type ? `Your ${request.document_type} request is done. ` : ''}
                        Mind rating your experience? It's optional and only takes a second.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="flex justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <Star
                                key={n}
                                filled={n <= displayRating}
                                onClick={() => setData('rating', n)}
                                onMouseEnter={() => setHovered(n)}
                                onMouseLeave={() => setHovered(0)}
                            />
                        ))}
                    </div>
                    <p className="text-center text-xs font-semibold text-slate-500 h-4 mb-4">
                        {displayRating ? RATING_LABELS[displayRating] : ' '}
                    </p>
                    {errors.rating && (
                        <p className="text-center text-xs text-red-500 -mt-3 mb-4">{errors.rating}</p>
                    )}

                    <textarea
                        rows="3"
                        value={data.comments}
                        onChange={(e) => setData('comments', e.target.value)}
                        placeholder="Anything you'd like to add? (optional)"
                        className="w-full border border-slate-300 text-slate-900 rounded-xl p-3 text-sm outline-none resize-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent mb-4 transition-all"
                    />

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors"
                        >
                            Maybe Later
                        </button>
                        <button
                            type="submit"
                            disabled={processing || data.rating === 0}
                            className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl shadow-md transition-colors text-sm"
                        >
                            {processing ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}