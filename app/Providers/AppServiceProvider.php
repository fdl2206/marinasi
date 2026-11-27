<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

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
        Gate::define('access-seller', fn (User $user): bool => $user->is_seller === true && $user->is_active === true);
        Gate::define('access-buyer', fn (User $user): bool => $user->is_seller === false && $user->is_active === true);
        Gate::define('verified-buyer', fn (User $user): bool => $user->isVerifiedBuyer());

        Vite::prefetch(concurrency: 3);
    }
}
