<?php

namespace Pterodactyl\Models\Bagou\Subdomain;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Domain extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'key',
        'secret',
        'displayType',
        'consumer',
        'cloudflare_id',
        'ovh_api'
    ];
    /**
     * Get the subdomains for the domain.
     */
    public function subdomains()
    {
        return $this->hasMany(Subdomain::class);
    }
}
