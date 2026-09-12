<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use App\Models\Course;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        // Force HTTPS only when deployed to the live server (production)
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
        
        if (Schema::hasTable('courses')) {
            // 2. If the table is completely empty, run the seeder automatically
            if (Course::count() === 0) {
                Artisan::call('db:seed', [
                    '--class' => 'CourseAndMajorSeeder'
                ]);
            }
        }
    }
}