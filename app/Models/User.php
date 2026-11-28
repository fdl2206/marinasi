<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'phone', 'company_name', 'company_address'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    public const VERIFICATION_UNVERIFIED = 'unverified';

    public const VERIFICATION_PENDING = 'pending';

    public const VERIFICATION_VERIFIED = 'verified';

    public const VERIFICATION_REJECTED = 'rejected';

    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /** @var array<string, mixed> */
    protected $attributes = [
        'is_seller' => false,
        'is_active' => true,
        'verification_status' => self::VERIFICATION_UNVERIFIED,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_seller' => 'boolean',
            'is_active' => 'boolean',
            'verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isVerifiedBuyer(): bool
    {
        return ! $this->is_seller
            && $this->is_active
            && $this->verification_status === self::VERIFICATION_VERIFIED;
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function rfqs(): HasMany
    {
        return $this->hasMany(Rfq::class);
    }

    public function verifications(): HasMany
    {
        return $this->hasMany(BuyerVerification::class)->orderByDesc('attempt_number');
    }

    public function latestVerification(): HasOne
    {
        return $this->hasOne(BuyerVerification::class)->latestOfMany('attempt_number');
    }
}
