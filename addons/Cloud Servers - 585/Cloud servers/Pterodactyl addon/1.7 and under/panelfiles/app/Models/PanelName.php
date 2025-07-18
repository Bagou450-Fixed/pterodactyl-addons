<?php

namespace Pterodactyl\Models;

use Illuminate\Support\Str;
use Symfony\Component\Yaml\Yaml;
use Illuminate\Container\Container;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Encryption\Encrypter;

class PanelName extends Model
{
    use Notifiable;

    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'panelname';


    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'panelname';

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = ['daemon_token_id', 'daemon_token'];

    /**
     * Cast values to correct type.
     *
     * @var array
     */
    protected $casts = [
        'ownerid' => 'integer',
        'name' => 'string',
        'img' => 'string',
        'footer' => 'string',
        'footerlink' => 'string',
    ];

    /**
     * Fields that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'ownerid', 'name', 'img', 'footer', 'footerlink'
    ];

    /**
     * @var array
     */
    public static $validationRules = [
        'ownerid' => 'required|integer|exists:users,id',
        'name' => 'nullable|string',
        'img' => 'nullable|string',
        'footer' => 'nullable|string',
        'footerlink' => 'nullable|string',
    ];

    /**
     * Default values for specific columns that are generally not changed on base installs.
     *
     * @var array
     */
    protected $attributes = [
        'ownerid' => 0,
        'name' => "Pterodactyl",
        'img' => ','
    ];


}
