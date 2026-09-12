<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeedbackRequest;
use App\Models\CertificateRequest;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function storeFeedback(StoreFeedbackRequest $feedbackRequest, $id)
    {
        $certificateRequest = CertificateRequest::findOrFail($id);

        abort_if(
            $certificateRequest->feedback()->exists(),
            403,
            "This request already has recorded feedback."
        );

        $data = $feedbackRequest->validated();

        Feedback::create([
            'request_id' => $certificateRequest->id,
            'user_id' => auth()->id(),
            'rating' => $data['rating'],
            'comments' => $data['comments'] ?? null,
        ]);

        return back()->with('success', 'Feedback recorded successfully.');
    }
}