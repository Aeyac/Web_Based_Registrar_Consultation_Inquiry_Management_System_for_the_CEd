<?php

use App\Http\Controllers\Admin\AlumniController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FacultyController;
use App\Http\Controllers\Admin\FilteredWordController;
use App\Http\Controllers\Admin\InquiryController;
use App\Http\Controllers\Admin\RequestController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\User\AlumniVerificationController;
use App\Http\Controllers\User\StaticPageController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\Auth\ProfileCompletionController;
use App\Http\Controllers\Auth\OtpVerificationController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

// === PUBLIC ROUTES ===
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::post('/chat/ask', [\App\Http\Controllers\ChatbotController::class, 'ask'])->name('chat.ask');

// === GOOGLE AUTH ROUTES ===
Route::get('/auth/google/redirect', [GoogleController::class, 'redirect'])->name('google.redirect');
Route::get('/auth/google/callback', [GoogleController::class, 'callback'])->name('google.callback');

// Profile Completion (Only for logged-in users missing user_type)
Route::middleware('auth')->group(function () {
    Route::get('/complete-profile', [ProfileCompletionController::class, 'create'])->name('profile.complete');
    Route::post('/complete-profile', [ProfileCompletionController::class, 'store'])->name('profile.complete.store');
});

// === USER ROUTES ===
Route::middleware(['auth', 'verified', 'profile.complete'])->group(function () {
    Route::prefix('user')->name('user.')->middleware('role:student|alumni')->group(function () {

        // Reachable even while pending
        Route::get('/pending-verification', [AlumniVerificationController::class, 'pending'])->name('pending-verification');
        Route::post('/verify-alumni', [AlumniVerificationController::class, 'store'])->name('verify-alumni');

        // Everything else requires verified alumni
        Route::middleware('verified.alumni')->group(function () {
            Route::get('/dashboard', [App\Http\Controllers\User\DashboardController::class, 'index'])->name('dashboard');
            Route::get('/requests', [App\Http\Controllers\User\DashboardController::class, 'requests'])->name('requests');
            Route::post('/requests', [App\Http\Controllers\User\DashboardController::class, 'store'])->name('requests.store');
            Route::get('/faculty', [App\Http\Controllers\User\FacultyController::class, 'index'])->name('faculty');
            Route::get('/announcements', [App\Http\Controllers\User\AnnouncementController::class, 'index'])->name('announcements');
            Route::get('/faq', [StaticPageController::class, 'faq'])->name('faq');
            Route::get('/about', [StaticPageController::class, 'about'])->name('about');
            Route::get('/privacy-policy', [StaticPageController::class, 'privacy'])->name('privacy');
            Route::get('/terms-of-service', [StaticPageController::class, 'terms'])->name('terms');
            Route::post('/notifications/mark-as-read', [NotificationController::class, 'markNotificationsAsRead'])->name('notifications.read');

            Route::get('/inquiries', [App\Http\Controllers\User\InquiryController::class, 'index'])->name('inquiries');
            Route::get('/inquiries/attachment/{id}', [InquiryController::class, 'viewAttachment'])->name('inquiries.attachment');
            Route::post('/inquiries', [App\Http\Controllers\User\InquiryController::class, 'store'])->name('inquiries.store');
            Route::post('/inquiries/{id}/reply', [InquiryController::class, 'reply'])->name('inquiries.reply');
            Route::put('/inquiries/messages/{id}', [InquiryController::class, 'updateMessage'])->name('inquiries.messages.edit');
            Route::delete('/inquiries/messages/{id}', [InquiryController::class, 'destroyMessage'])->name('inquiries.messages.destroy');
            Route::put('/inquiries/{id}/read', [InquiryController::class, 'markRead'])->name('inquiries.read');
            Route::put('/inquiries/{id}/unread', [InquiryController::class, 'markUnread'])->name('inquiries.unread');
            Route::delete('/inquiries/{id}', [InquiryController::class, 'destroy'])->name('inquiries.destroy');
        });
    });

    // === ADMIN ROUTES ===
    Route::prefix('admin')->name('admin.')->middleware('role:admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'loadDashboard'])->name('dashboard');
        Route::get('/requests', [RequestController::class, 'loadRequest'])->name('requests');
        Route::put('/requests/{id}', [RequestController::class, 'updateRequest'])->name('requests.update');
        Route::get('/alumni', [AlumniController::class, 'loadAlumni'])->name('alumni');
        Route::put('/alumni/{id}', [AlumniController::class, 'updateAlumni'])->name('alumni.update');
        Route::get('/alumni/{id}/proof', [AlumniController::class, 'viewProof'])->name('alumni.proof');
        Route::get('/faculty', [FacultyController::class, 'loadFaculty'])->name('faculty');
        Route::post('/faculty', [FacultyController::class, 'storeFaculty'])->name('faculty.store');
        Route::put('/faculty/{id}', [FacultyController::class, 'updateFaculty'])->name('faculty.update');
        Route::delete('/faculty/{id}', [FacultyController::class, 'destroyFaculty'])->name('faculty.destroy');
        Route::get('/announcements', [AnnouncementController::class, 'loadAnnouncements'])->name('announcements');
        Route::post('/announcements', [AnnouncementController::class, 'storeAnnouncement'])->name('announcements.store');
        Route::put('/announcements/{id}', [AnnouncementController::class, 'updateAnnouncement'])->name('announcements.update');
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroyAnnouncement'])->name('announcements.destroy');
        Route::get('/users', [UserController::class, 'loadUsers'])->name('users');
        Route::post('/users', [UserController::class, 'storeUser'])->name('users.store');
        Route::put('/users/{id}', [UserController::class, 'updateUser'])->name('users.update');
        Route::delete('/users/{id}', [UserController::class, 'destroyUser'])->name('users.destroy');
        
        Route::post('/notifications/mark-as-read', [NotificationController::class, 'markNotificationsAsRead'])->name('notifications.read');
        
        Route::get('/export/excel', [ExportController::class, 'exportExcel'])->name('export.excel');
        Route::get('/export/pdf', [ExportController::class, 'exportPdf'])->name('export.pdf');
        
        Route::get('/inquiries', [InquiryController::class, 'inquiries'])->name('inquiries');
        Route::get('/inquiries/attachment/{id}', [InquiryController::class, 'viewAttachment'])->name('inquiries.attachment');
        Route::post('/inquiries/{id}/reply', [InquiryController::class, 'replyInquiry'])->name('inquiries.reply');
        Route::put('/inquiries/{id}/status', [InquiryController::class, 'updateInquiryStatus'])->name('inquiries.status');
        Route::put('/inquiries/messages/{id}', [InquiryController::class, 'editMessage'])->name('inquiries.messages.edit');
        Route::delete('/inquiries/messages/{id}', [InquiryController::class, 'deleteMessage'])->name('inquiries.messages.destroy');
        Route::put('/inquiries/{id}/read', [InquiryController::class, 'markInquiryRead'])->name('inquiries.read');
        Route::put('/inquiries/{id}/unread', [InquiryController::class, 'markInquiryUnread'])->name('inquiries.unread');
        Route::delete('/inquiries/{id}', [InquiryController::class, 'deleteInquiry'])->name('inquiries.destroy');
        
        Route::get('/filtered-words', [FilteredWordController::class, 'index'])->name('filtered-words');
        Route::post('/filtered-words', [FilteredWordController::class, 'store'])->name('filtered-words.store');
        Route::delete('/filtered-words/{id}', [FilteredWordController::class, 'destroy'])->name('filtered-words.destroy');
        Route::patch('/requests/{id}/archive', [RequestController::class, 'archiveRequest'])->name('requests.archive');
        Route::patch('/requests/{id}/unarchive', [RequestController::class, 'unarchiveRequest'])->name('requests.unarchive');
    });
});

// === PROFILE SETTINGS ROUTES ===
Route::middleware(['auth', 'verified', 'profile.complete'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// === OTP VERIFICATION ROUTES ===
Route::middleware('auth')->group(function () {
    Route::get('verify-email', [OtpVerificationController::class, 'notice'])->name('verification.notice');
    Route::post('verify-email', [OtpVerificationController::class, 'verify'])->name('verification.verify.otp');
    Route::post('email/verification-notification', [OtpVerificationController::class, 'resend'])->middleware('throttle:6,1')->name('verification.send.otp');
});

Route::get('/auto-seed', function () {
    Artisan::call('db:seed', [
        '--class' => 'CourseAndMajorSeeder'
    ]);
    return 'Course and Major Seeder executed successfully!';
});

require __DIR__ . '/auth.php';