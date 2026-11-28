<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBuyerIsVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isVerifiedBuyer()) {
            $message = 'Akun Anda harus terverifikasi terlebih dahulu sebelum mengajukan RFQ atau melakukan checkout.';

            if ($request->expectsJson()) {
                return response()->json(['message' => $message], 403);
            }

            return redirect()->route('buyer.profile.index')->withErrors([
                'verification' => $message,
            ]);
        }

        return $next($request);
    }
}
