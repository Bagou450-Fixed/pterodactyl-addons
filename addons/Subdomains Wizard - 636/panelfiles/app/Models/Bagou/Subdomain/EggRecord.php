<?php

namespace Pterodactyl\Models\Bagou\Subdomain;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Pterodactyl\Models\Egg;

class EggRecord extends Model
{
    use HasFactory;

    public function record(): BelongsTo
    {
        return $this->belongsTo(Record::class);
    }

    public function egg(): BelongsTo
    {
        return $this->belongsTo(Egg::class);
    }
}
