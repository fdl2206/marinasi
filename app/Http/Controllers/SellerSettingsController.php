<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SellerSettingsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $company = CompanySetting::current();

        return Inertia::render('Seller/Settings/Index', [
            'admin' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
            ],
            'company' => [
                'company_name' => $company->company_name,
                'tagline' => $company->tagline,
                'npwp' => $company->npwp ?? '',
                'is_pkp' => (bool) $company->is_pkp,
                'whatsapp_number' => $company->whatsapp_number,
                'display_phone' => $company->display_phone,
                'email' => $company->email ?? '',
                'address' => $company->address ?? '',
                'bank_accounts' => is_array($company->bank_accounts) ? $company->bank_accounts : [],
                'default_payment_terms' => $company->default_payment_terms,
                'tax_note' => $company->tax_note,
            ],
        ]);
    }

    public function updateAccount(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);

        $user->fill([
            'name' => trim($validated['name']),
            'email' => trim($validated['email']),
            'phone' => ! empty($validated['phone']) ? trim((string) $validated['phone']) : null,
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return redirect()
            ->route('seller.settings.index')
            ->with('success', 'Profil akun pengelola berhasil diperbarui.');
    }

    public function updateCompany(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'npwp' => ['nullable', 'string', 'max:60'],
            'is_pkp' => ['required', 'boolean'],
            'whatsapp_number' => ['required', 'string', 'regex:/^[0-9]{8,20}$/'],
            'display_phone' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:120'],
            'address' => ['nullable', 'string', 'max:1000'],
            'default_payment_terms' => ['nullable', 'string', 'max:255'],
            'tax_note' => ['nullable', 'string', 'max:255'],
            'bank_accounts' => ['nullable', 'array', 'max:5'],
            'bank_accounts.*.bank_name' => ['required', 'string', 'max:120'],
            'bank_accounts.*.account_number' => ['required', 'string', 'max:80'],
            'bank_accounts.*.account_holder' => ['required', 'string', 'max:160'],
        ], [
            'whatsapp_number.regex' => 'Nomor WhatsApp harus berupa angka kode negara tanpa spasi/tanda plus (contoh: 6281320777874).',
        ]);

        $setting = CompanySetting::query()->first() ?? new CompanySetting();
        $setting->fill([
            'company_name' => trim($validated['company_name']),
            'tagline' => trim((string) ($validated['tagline'] ?? 'Perdagangan Barang dan Jasa')),
            'npwp' => ! empty($validated['npwp']) ? trim((string) $validated['npwp']) : null,
            'is_pkp' => (bool) $validated['is_pkp'],
            'whatsapp_number' => trim($validated['whatsapp_number']),
            'display_phone' => trim($validated['display_phone']),
            'email' => ! empty($validated['email']) ? trim((string) $validated['email']) : null,
            'address' => ! empty($validated['address']) ? trim((string) $validated['address']) : null,
            'default_payment_terms' => trim((string) ($validated['default_payment_terms'] ?? 'DP / Pelunasan sesuai kesepakatan')),
            'tax_note' => trim((string) ($validated['tax_note'] ?? 'PPN 11% (Faktur Pajak Resmi)')),
            'bank_accounts' => array_values($validated['bank_accounts'] ?? []),
        ]);
        $setting->save();

        return redirect()
            ->route('seller.settings.index')
            ->with('success', 'Identitas perusahaan & rekening resmi CV. Putra Nugraha berhasil disimpan.');
    }
}
