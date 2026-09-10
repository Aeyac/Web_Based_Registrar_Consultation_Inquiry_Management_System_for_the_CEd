<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificateRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'document_type' => $this->service?->label ?? 'Document',
            'format' => $this->delivery_mode === 'hard_copy' ? 'Hard Copy' : 'Soft Copy',
            'status' => $this->status?->label ?? 'Pending',
            'created_at' => $this->created_at->timezone('Asia/Manila')->format('M d, Y h:i A'),
            'student_name' => $this->whenLoaded(
                'user',
                fn() =>
                $this->user->first_name . ' ' . $this->user->last_name
            ),
            // Map the history timeline including the notes and PH timezone
            'status_history' => $this->whenLoaded('statusHistory', fn() => $this->statusHistory->map(fn($h) => [
                'status' => $h->toStatus?->label,
                'note' => $h->note,
                'date' => $h->created_at->timezone('Asia/Manila')->format('M d, Y h:i A')
            ])),
        ];
    }
}