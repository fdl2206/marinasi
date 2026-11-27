<?php

use App\Http\Controllers\BuyerCartController;
use App\Http\Controllers\BuyerCatalogController;
use App\Http\Controllers\BuyerCheckoutController;
use App\Http\Controllers\BuyerOrderController;
use App\Http\Controllers\BuyerVerificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicCatalogController;
use App\Http\Controllers\SellerCategoryController;
use App\Http\Controllers\SellerClientController;
use App\Http\Controllers\SellerOrderController;
use App\Http\Controllers\SellerProductController;
use App\Http\Controllers\SellerProductImageController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Zone: Company Profile & B2B E-Catalog Showcase
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    if (Auth::user()?->is_seller) {
        return redirect()->route('seller.dashboard');
    }

    if (Auth::check()) {
        return redirect()->route('buyer.home');
    }

    return Inertia::render('Public/Home');
})->name('home');

Route::get('/portal', [BuyerCatalogController::class, 'index'])
    ->middleware(['auth', 'can:access-buyer'])->name('buyer.home');

Route::get('/tentang-kami', function () {
    return Inertia::render('Public/About');
})->name('about');

Route::get('/katalog', [PublicCatalogController::class, 'index'])->name('catalog.index');
Route::get('/katalog/{product}', [PublicCatalogController::class, 'show'])->name('catalog.show');

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

Route::get('/bantuan', function () {
    if (Auth::check() && Auth::user()?->is_seller) {
        return redirect()->route('seller.dashboard');
    }

    if (Auth::check()) {
        return redirect()->route('buyer.help.index');
    }

    return redirect()->route('login');
})->name('help');

/*
|--------------------------------------------------------------------------
| Buyer Zone (Dashboard, RFQ Nego, Orders, Invoices)
|--------------------------------------------------------------------------
*/
Route::prefix('buyer')->name('buyer.')->middleware(['auth', 'can:access-buyer'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Buyer/Dashboard');
    })->name('dashboard');

    Route::get('/quotations', function () {
        return Inertia::render('Buyer/Quotations/Index');
    })->name('quotations.index');

    Route::get('/rfq/create', function () {
        return Inertia::render('Buyer/Rfq/Create');
    })->name('rfq.create');

    Route::get('/orders', [BuyerOrderController::class, 'index'])->name('orders.index');
    Route::post('/orders/{order}/cancel', [BuyerOrderController::class, 'cancel'])->name('orders.cancel');

    Route::get('/cart', [BuyerCartController::class, 'index'])->name('cart.index');
    Route::post('/cart/items', [BuyerCartController::class, 'store'])->name('cart.items.store');
    Route::patch('/cart/items/{cartItem}', [BuyerCartController::class, 'update'])->name('cart.items.update');
    Route::delete('/cart/items/{cartItem}', [BuyerCartController::class, 'destroy'])->name('cart.items.destroy');

    Route::get('/checkout', [BuyerCheckoutController::class, 'index'])
        ->middleware('verified.buyer')
        ->name('checkout.index');
    Route::post('/checkout', [BuyerCheckoutController::class, 'store'])
        ->middleware('verified.buyer')
        ->name('checkout.store');

    Route::get('/invoices', function () {
        return Inertia::render('Buyer/Invoices/Index');
    })->name('invoices.index');

    Route::get('/services', function () {
        return Inertia::render('Buyer/Services/Index');
    })->name('services.index');

    Route::get('/profile', [ProfileController::class, 'buyerEdit'])->name('profile.index');
    Route::patch('/profile', [ProfileController::class, 'buyerUpdate'])->name('profile.update');
    Route::post('/verification', [BuyerVerificationController::class, 'store'])->name('verification.store');
    Route::get('/verification/documents/{document}', [BuyerVerificationController::class, 'downloadDocument'])
        ->name('verification.documents.show');

    Route::get('/products/{product}', [BuyerCatalogController::class, 'show'])->name('products.show');

    Route::get('/help', function () {
        return Inertia::render('Buyer/Help/Index');
    })->name('help.index');

    Route::get('/faq', function () {
        return redirect()->route('buyer.help.index');
    })->name('faq.index');
});

/*
|--------------------------------------------------------------------------
| Admin & Seller Zone (Dashboard Operasional, RFQ, Orders, e-Faktur, dsb.)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->name('admin.')->middleware(['auth', 'can:access-seller'])->group(function () {
    Route::get('/', function () {
        return redirect()->route('seller.dashboard');
    });
    Route::get('/dashboard', function () {
        return redirect()->route('seller.dashboard');
    })->name('dashboard');
    Route::get('/orders', function () {
        return redirect()->route('seller.orders.index');
    })->name('orders.index');
});

Route::prefix('seller')->name('seller.')->middleware(['auth', 'can:access-seller'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Seller/Dashboard');
    })->name('dashboard');

    Route::get('/catalog', [SellerProductController::class, 'index'])->name('catalog.index');
    Route::resource('products', SellerProductController::class)->only(['store', 'update', 'destroy']);
    Route::resource('categories', SellerCategoryController::class)->only(['store', 'update', 'destroy']);
    Route::delete('/products/{product}/images/{image}', [SellerProductImageController::class, 'destroy'])
        ->scopeBindings()->name('products.images.destroy');

    Route::get('/negotiations', function () {
        return Inertia::render('Seller/Negotiations/Index');
    })->name('negotiations.index');

    Route::get('/orders', [SellerOrderController::class, 'index'])->name('orders.index');
    Route::post('/orders/{order}/status', [SellerOrderController::class, 'advanceStatus'])->name('orders.status.advance');
    Route::patch('/orders/{order}/shipping', [SellerOrderController::class, 'updateShipping'])->name('orders.shipping.update');
    Route::post('/orders/{order}/cancel', [SellerOrderController::class, 'cancel'])->name('orders.cancel');

    Route::get('/legality', function () {
        return Inertia::render('Seller/Legality/Index');
    })->name('legality.index');

    Route::get('/services', function () {
        return Inertia::render('Seller/Services/Index');
    })->name('services.index');

    Route::get('/clients', [SellerClientController::class, 'index'])->name('clients.index');
    Route::post('/clients/{client}/verification/approve', [SellerClientController::class, 'approve'])
        ->name('clients.verification.approve');
    Route::post('/clients/{client}/verification/reject', [SellerClientController::class, 'reject'])
        ->name('clients.verification.reject');
    Route::patch('/clients/{client}/active', [SellerClientController::class, 'toggleActive'])
        ->name('clients.active.update');
    Route::get('/clients/verification-documents/{document}', [SellerClientController::class, 'downloadDocument'])
        ->name('clients.documents.show');

    Route::get('/settings', function () {
        return Inertia::render('Seller/Settings/Index');
    })->name('settings.index');
});

/*
|--------------------------------------------------------------------------
| Default Authenticated Redirect
|--------------------------------------------------------------------------
*/
Route::get('/dashboard', function () {
    return redirect()->route(Auth::user()->is_seller ? 'seller.dashboard' : 'buyer.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
