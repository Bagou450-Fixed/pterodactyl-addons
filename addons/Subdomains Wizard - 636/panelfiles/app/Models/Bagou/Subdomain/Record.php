<?php

namespace Pterodactyl\Models\Bagou\Subdomain;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Record extends Model
{
    use HasFactory;

    protected $fillable = [
        'ttl',
        'type',
        'protocol',
        'priority',
        'name',
        'domain_id',
        'service',
        'weight',
    ];

    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }
    public function eggRecord(): HasMany
    {
        return $this->hasMany(EggRecord::class);
    }
}
