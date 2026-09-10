<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCertificateRequestRequest;
use App\Http\Resources\AnnouncementResource;
use App\Http\Resources\CertificateRequestResource;
use App\Models\Announcement;
use App\Models\CertificateRequest;
use App\Models\RequestService;
use App\Models\RequestStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const PENDING_STATUS_CODES = ['submitted', 'for_review', 'processing', 'for_compliance'];
    private const COMPLETED_STATUS_CODES = ['ready_for_release', 'released'];
    private const DEFAULT_REQUEST_STATUS_CODE = 'submitted';

    public function index(): Response
    {
        $query = $this->userRequests();

        $stats = [
            'pending' => (clone $query)->whereHas('status', fn($q) => $q->whereIn('code', self::PENDING_STATUS_CODES))->count(),
            'completed' => (clone $query)->whereHas('status', fn($q) => $q->whereIn('code', self::COMPLETED_STATUS_CODES))->count(),
        ];

        $recentRequests = $query->latest()->take(3)->get();

        return Inertia::render('User/Dashboard', [
            'userRole' => auth()->user()->displaySubtitle(),
            'isAlumniVerified' => auth()->user()->isVerifiedAlumni(),
            'stats' => $stats,
            'requests' => CertificateRequestResource::collection($recentRequests)->resolve(),
            'announcements' => AnnouncementResource::collection(Announcement::latest()->take(2)->get())->resolve(),
            'services' => $this->activeServices(),
        ]);
    }

    public function requests(): Response
    {
        $paginatedRequests = $this->userRequests()
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('User/Requests', [
            'userRole' => auth()->user()->displaySubtitle(),
            'isAlumniVerified' => auth()->user()->isVerifiedAlumni(),
            'requests' => CertificateRequestResource::collection($paginatedRequests),
            'services' => $this->activeServices(),
        ]);
    }

    public function store(StoreCertificateRequestRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $service = RequestService::findOrFail($data['service_id']);
        $status = $this->defaultRequestStatus();
        $certificateRequest = null;

        DB::transaction(function () use ($request, $data, $service, $status, &$certificateRequest) {
            $certificateRequest = CertificateRequest::create([
                'user_id' => $request->user()->id,
                'service_id' => $service->id,
                'status_id' => $status->id,
                'delivery_mode' => $request->delivery_mode, 
                'purpose' => $data['purpose'] ?? null,
                'preferred_claiming_date' => $data['preferred_claiming_date'] ?? null,
            ]);

            $certificateRequest->statusHistory()->create([
                'from_status_id' => null,
                'to_status_id' => $status->id,
                'changed_by' => $request->user()->id,
                'note' => 'Request submitted via portal.',
            ]);

            // FIX: Only save internship details if the service is actually an Internship Certificate
            if ($service->isInternshipCertificate()) {
                $certificateRequest->internshipDetails()->create([
                    'internship_school_or_agency' => $data['internship_school_or_agency'],
                    'grade_level_handled' => $data['grade_level_handled'] ?? null,
                    'semester' => $data['semester'],
                    'school_year' => $data['school_year'],
                ]);
            }

            if ($request->hasFile('requirement_file')) {
                $path = $request->file('requirement_file')->store('requirements', 'private');
                $certificateRequest->documents()->create([
                    'type' => 'requirement',
                    'path' => $path,
                    'uploaded_by' => $request->user()->id,
                ]);
            }

            $certificateRequest->load(['service', 'status', 'user']);
        });

        $request->user()->notify(new \App\Notifications\RequestStatusChanged($certificateRequest));
        $admins = \App\Models\User::where('user_type', 'admin')->get();
        Notification::send($admins, new \App\Notifications\RequestStatusChanged($certificateRequest));

        return back()->with('success', 'Request submitted successfully.');
    }

    private function userRequests()
    {
        return CertificateRequest::with(['service', 'status', 'statusHistory.toStatus'])
            ->where('user_id', auth()->id());
    }

    private function defaultRequestStatus(): RequestStatus
    {
        return RequestStatus::where('code', self::DEFAULT_REQUEST_STATUS_CODE)->firstOrFail();
    }

    private function activeServices()
    {
        return RequestService::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'code', 'label'])
            ->map(fn(RequestService $service) => [
                'id' => $service->id,
                'code' => $service->code,
                'label' => $service->label,
            ]);
    }
}