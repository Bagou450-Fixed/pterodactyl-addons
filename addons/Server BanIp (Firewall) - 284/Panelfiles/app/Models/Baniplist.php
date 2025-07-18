<?php

namespace Pterodactyl\Models;

/**
 * @property int $id
 * @property string $name
 * @property string $host
 * @property int $port
 * @property string $username
 * @property string $password
 * @property int|null $max_databases
 * @property int|null $node_id
 * @property \Carbon\CarbonImmutable $created_at
 * @property \Carbon\CarbonImmutable $updated_at
 */
class Baniplist extends Model
{
    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'ban_ip';

    /**
     * @var bool
     */
    protected bool $immutableDates = true;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'BanIp';

    /**
     * Fields that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'server_id', 'ip', 'country', 'region', 'city', 'countryname', 'port'
    ];

    
    /**
     * Cast values to correct type.
     *
     * @var array
     */
    protected $casts = [
        'ip' => 'string',
    ];

    /**
     * Validation rules to assign to this model.
     *
     * @var array
     */
    public static array $validationRules = [
        'ip' => 'required|string|max:15',
    ];

    /**
     * Gets the databases associated with this host.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function banip()
    {
        return $this->hasMany(Baniplist::class);
    }
}
