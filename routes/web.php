<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Zone: Company Profile & B2B E-Catalog Showcase
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return Inertia::render('Public/Home');
})->name('home');

Route::get('/tentang-kami', function () {
    return Inertia::render('Public/About');
})->name('about');

Route::get('/katalog', function () {
    return Inertia::render('Public/Catalog/Index');
})->name('catalog.index');

Route::get('/katalog/{id}', function ($id) {
    return Inertia::render('Public/Catalog/Show', ['id' => $id]);
})->name('catalog.show');

Route::get('/portofolio', function () {
    return Inertia::render('Public/Portfolio');
})->name('portfolio');

Route::get('/testimoni', function () {
    return Inertia::render('Public/Testimonials');
})->name('testimonials');

Route::get('/kontak', function () {
    return Inertia::render('Public/Contact');
})->name('contact');

Route::get('/kebijakan-privasi', function () {
    return Inertia::render('Public/PrivacyPolicy');
})->name('privacy');

/*
|--------------------------------------------------------------------------
| Buyer Zone (Dashboard, RFQ Nego, Orders, Invoices)
|--------------------------------------------------------------------------
*/
Route::prefix('buyer')->name('buyer.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Buyer/Dashboard');
    })->name('dashboard');

    Route::get('/quotations', function () {
        return Inertia::render('Buyer/Quotations/Index');
    })->name('quotations.index');

    Route::get('/orders', function () {
        return Inertia::render('Buyer/Orders/Index');
    })->name('orders.index');

    Route::get('/invoices', function () {
        return Inertia::render('Buyer/Invoices/Index');
    })->name('invoices.index');
});

/*
|--------------------------------------------------------------------------
| Seller Zone (Dashboard, Catalog Management, Price Negotiation, Orders, Legality)
|--------------------------------------------------------------------------
*/
Route::prefix('seller')->name('seller.')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Seller/Dashboard');
    })->name('dashboard');

    Route::get('/catalog', function () {
        return Inertia::render('Seller/Catalog/Index');
    })->name('catalog.index');

    Route::get('/negotiations', function () {
        return Inertia::render('Seller/Negotiations/Index');
    })->name('negotiations.index');

    Route::get('/orders', function () {
        return Inertia::render('Seller/Orders/Index');
    })->name('orders.index');

    Route::get('/legality', function () {
        return Inertia::render('Seller/Legality/Index');
    })->name('legality.index');
});

/*
|--------------------------------------------------------------------------
| Default Authenticated Redirect
|--------------------------------------------------------------------------
*/
Route::get('/dashboard', function () {
    return redirect()->route('buyer.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
