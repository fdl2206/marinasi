<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('users:grant-seller {email : Email akun yang sudah terdaftar}')]
#[Description('Berikan akses Penjual/Admin kepada akun yang sudah terdaftar')]
class GrantSellerAccess extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $user = User::query()->where('email', $this->argument('email'))->first();

        if ($user === null) {
            $this->error('Akun tidak ditemukan. Daftarkan akun pemilik terlebih dahulu.');

            return self::FAILURE;
        }

        $user->is_seller = true;
        $user->save();

        $this->info('Akses Penjual/Admin berhasil diberikan.');

        return self::SUCCESS;
    }
}
