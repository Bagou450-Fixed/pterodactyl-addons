<?php

namespace Pterodactyl\Models\Bagou\Subdomain;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Pterodactyl\Models\Server;

class Subdomain extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'server_id',
        'api_id',
        'domain_id',
        'record_id'
    ];

    public function domain()
    {
        return $this->belongsTo(Domain::class);
    }
    public function server()
    {
        return $this->belongsTo(Server::class);
    }
    public function record(): BelongsTo
    {
        return $this->belongsTo(Record::class);
    }
}
