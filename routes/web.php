<?php

use App\Http\Controllers\BuyerCartController;
use App\Http\Controllers\BuyerCatalogController;
use App\Http\Controllers\BuyerCheckoutController;
use App\Http\Controllers\BuyerDashboardController;
use App\Http\Controllers\BuyerOrderController;
use App\Http\Controllers\BuyerPaymentDocumentController;
use App\Http\Controllers\BuyerRfqController;
use App\Http\Controllers\BuyerVerificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicCatalogController;
use App\Http\Controllers\SellerCategoryController;
use App\Http\Controllers\SellerClientController;
use App\Http\Controllers\SellerDashboardController;
use App\Http\Controllers\SellerNegotiationController;
use App\Http\Controllers\SellerOrderController;
use App\Http\Controllers\SellerPaymentDocumentController;
use App\Http\Controllers\SellerProductController;
use App\Http\Controllers\SellerProductImageController;
use App\Http\Controllers\SellerSettingsController;
use App\Http\Controllers\ServiceOrderController;
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
    Route::get('/dashboard', [BuyerDashboardController::class, 'index'])->name('dashboard');

    Route::get('/quotations', [BuyerRfqController::class, 'index'])->name('quotations.index');
    Route::get('/quotations/{rfq}/attachment', [BuyerRfqController::class, 'downloadAttachment'])
        ->name('quotations.attachment');
    Route::post('/quotations/{rfq}/agree', [BuyerRfqController::class, 'agree'])
        ->middleware('verified.buyer')
        ->name('quotations.agree');
    Route::post('/quotations/{rfq}/reject', [BuyerRfqController::class, 'reject'])
        ->name('quotations.reject');
    Route::post('/quotations/{rfq}/cancel', [BuyerRfqController::class, 'cancel'])
        ->name('quotations.cancel');

    Route::get('/rfq/create', [BuyerRfqController::class, 'create'])
        ->middleware('verified.buyer')
        ->name('rfq.create');
    Route::post('/rfq', [BuyerRfqController::class, 'store'])
        ->middleware('verified.buyer')
        ->name('rfq.store');

    Route::get('/orders', [BuyerOrderController::class, 'index'])->name('orders.index');
    Route::post('/orders/{order}/cancel', [BuyerOrderController::class, 'cancel'])->name('orders.cancel');
    Route::post('/orders/{order}/payments', [BuyerPaymentDocumentController::class, 'storePayment'])->name('orders.payments.store');
    Route::get('/payments/{payment}/proof', [BuyerPaymentDocumentController::class, 'downloadProof'])->name('payments.proof');

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

    Route::get('/invoices', [BuyerPaymentDocumentController::class, 'index'])->name('invoices.index');
    Route::get('/documents/{document}/print', [BuyerPaymentDocumentController::class, 'printDocument'])->name('documents.print');
    Route::get('/documents/{document}/download', [BuyerPaymentDocumentController::class, 'downloadDocument'])->name('documents.download');

    Route::get('/services', [ServiceOrderController::class, 'buyerIndex'])->name('services.index');

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
    Route::get('/dashboard', [SellerDashboardController::class, 'index'])->name('dashboard');

    Route::get('/catalog', [SellerProductController::class, 'index'])->name('catalog.index');
    Route::resource('products', SellerProductController::class)->only(['store', 'update', 'destroy']);
    Route::resource('categories', SellerCategoryController::class)->only(['store', 'update', 'destroy']);
    Route::delete('/products/{product}/images/{image}', [SellerProductImageController::class, 'destroy'])
        ->scopeBindings()->name('products.images.destroy');

    Route::get('/negotiations', [SellerNegotiationController::class, 'index'])->name('negotiations.index');
    Route::post('/negotiations/{rfq}/quote', [SellerNegotiationController::class, 'quote'])->name('negotiations.quote');
    Route::post('/negotiations/{rfq}/reject', [SellerNegotiationController::class, 'reject'])->name('negotiations.reject');
    Route::get('/negotiations/{rfq}/attachment', [SellerNegotiationController::class, 'downloadAttachment'])
        ->name('negotiations.attachment');

    Route::get('/orders', [SellerOrderController::class, 'index'])->name('orders.index');
    Route::post('/orders/{order}/status', [SellerOrderController::class, 'advanceStatus'])->name('orders.status.advance');
    Route::patch('/orders/{order}/shipping', [SellerOrderController::class, 'updateShipping'])->name('orders.shipping.update');
    Route::post('/orders/{order}/cancel', [SellerOrderController::class, 'cancel'])->name('orders.cancel');
    Route::post('/orders/{order}/payments', [SellerPaymentDocumentController::class, 'storePayment'])->name('orders.payments.store');
    Route::post('/orders/{order}/invoice', [SellerPaymentDocumentController::class, 'issueInvoice'])->name('orders.invoice.issue');
    Route::post('/orders/{order}/receipt', [SellerPaymentDocumentController::class, 'issueReceipt'])->name('orders.receipt.issue');
    Route::post('/orders/{order}/documents', [SellerPaymentDocumentController::class, 'uploadDocument'])->name('orders.documents.upload');

    Route::post('/payments/{payment}/verify', [SellerPaymentDocumentController::class, 'verifyPayment'])->name('payments.verify');
    Route::post('/payments/{payment}/reject', [SellerPaymentDocumentController::class, 'rejectPayment'])->name('payments.reject');
    Route::get('/payments/{payment}/proof', [SellerPaymentDocumentController::class, 'downloadProof'])->name('payments.proof');

    Route::get('/legality', [SellerPaymentDocumentController::class, 'index'])->name('legality.index');
    Route::get('/documents/{document}/print', [SellerPaymentDocumentController::class, 'printDocument'])->name('documents.print');
    Route::get('/documents/{document}/download', [SellerPaymentDocumentController::class, 'downloadDocument'])->name('documents.download');

    Route::get('/services', [ServiceOrderController::class, 'sellerIndex'])->name('services.index');

    Route::get('/clients', [SellerClientController::class, 'index'])->name('clients.index');
    Route::post('/clients/{client}/verification/approve', [SellerClientController::class, 'approve'])
        ->name('clients.verification.approve');
    Route::post('/clients/{client}/verification/reject', [SellerClientController::class, 'reject'])
        ->name('clients.verification.reject');
    Route::patch('/clients/{client}/active', [SellerClientController::class, 'toggleActive'])
        ->name('clients.active.update');
    Route::get('/clients/verification-documents/{document}', [SellerClientController::class, 'downloadDocument'])
        ->name('clients.documents.show');

    Route::get('/settings', [SellerSettingsController::class, 'index'])->name('settings.index');
    Route::patch('/settings/account', [SellerSettingsController::class, 'updateAccount'])->name('settings.account.update');
    Route::patch('/settings/company', [SellerSettingsController::class, 'updateCompany'])->name('settings.company.update');
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
