<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicCatalogController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Zone: Company Profile & B2B E-Catalog Showcase
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    if (Auth::check()) {
        return Inertia::render('Buyer/Home');
    }

    return Inertia::render('Public/Home');
})->name('home');

Route::get('/portal', function () {
    return Inertia::render('Buyer/Home');
})->name('buyer.home');

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

    Route::get('/rfq/create', function () {
        return Inertia::render('Buyer/Quotations/Index');
    })->name('rfq.create');

    Route::get('/orders', function () {
        return Inertia::render('Buyer/Orders/Index');
    })->name('orders.index');

    Route::get('/cart', function () {
        return Inertia::render('Buyer/Cart/Index');
    })->name('cart.index');

    Route::get('/checkout', function () {
        return Inertia::render('Buyer/Checkout/Index');
    })->name('checkout.index');

    Route::get('/invoices', function () {
        return Inertia::render('Buyer/Invoices/Index');
    })->name('invoices.index');

    Route::get('/services', function () {
        return Inertia::render('Buyer/Services/Index');
    })->name('services.index');

    Route::get('/profile', function () {
        return Inertia::render('Buyer/Profile/Index');
    })->name('profile.index');

    Route::get('/products/{id}', function ($id) {
        return Inertia::render('Buyer/Products/Show', [
            'id' => $id,
        ]);
    })->name('products.show');
});

/*
|--------------------------------------------------------------------------
| Admin & Seller Zone (Dashboard Operasional, RFQ, Orders, e-Faktur, dsb.)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/', function () {
        return redirect()->route('seller.dashboard');
    });
    Route::get('/dashboard', function () {
        return Inertia::render('Seller/Dashboard');
    })->name('dashboard');
    Route::get('/orders', function () {
        return Inertia::render('Seller/Orders/Index');
    })->name('orders.index');
});

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

    Route::get('/services', function () {
        return Inertia::render('Seller/Services/Index');
    })->name('services.index');

    Route::get('/clients', function () {
        return Inertia::render('Seller/Clients/Index');
    })->name('clients.index');

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
    return redirect()->route('buyer.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
