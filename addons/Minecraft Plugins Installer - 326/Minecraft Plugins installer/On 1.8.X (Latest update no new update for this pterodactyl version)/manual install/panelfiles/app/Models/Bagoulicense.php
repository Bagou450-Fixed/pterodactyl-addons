<?php

namespace Pterodactyl\Models;

/**
 * @property int $id
 * @property string $uuid
 * @property int $nest_id
 * @property string $author
 * @property string $name
 * @property string|null $description
 * @property array|null $features
 * @property string $docker_image -- deprecated, use $docker_images
 * @property string $update_url
 * @property array<string, string> $docker_images
 * @property array|null $file_denylist
 * @property string|null $config_files
 * @property string|null $config_startup
 * @property string|null $config_logs
 * @property string|null $config_stop
 * @property int|null $config_from
 * @property string|null $startup
 * @property bool $script_is_privileged
 * @property string|null $script_install
 * @property string $script_entry
 * @property string $script_container
 * @property int|null $copy_script_from
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property string|null $copy_script_install
 * @property string $copy_script_entry
 * @property string $copy_script_container
 * @property string|null $inherit_config_files
 * @property string|null $inherit_config_startup
 * @property string|null $inherit_config_logs
 * @property string|null $inherit_config_stop
 * @property string $inherit_file_denylist
 * @property array|null $inherit_features
 */
class BagouLicense extends Model
{
    /**
     * The resource name for this model when it is transformed into an
     * API representation using fractal.
     */
    public const RESOURCE_NAME = 'BagouLicense';

    /**
     * Defines the current egg export version.
     */
    public const EXPORT_VERSION = 'PTDL_v2';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'bagoulicense';

    /**
     * Fields that are not mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'addon',
        'license',
        'usage',
        'maxusage',
        'enabled'
    ];

    /**
     * Cast values to correct type.
     *
     * @var array
     */
    protected $casts = [
        'addon' => 'string',
        'license' => 'string',
        'usage' => 'integer',
        'maxusage' => 'integer',
        'enabled' => 'boolean'
    ];

    /**
     * @var array
     */
    public static $validationRules = [
        'addon' => 'required|string',
        'license' => 'required|string',
    ];

}

