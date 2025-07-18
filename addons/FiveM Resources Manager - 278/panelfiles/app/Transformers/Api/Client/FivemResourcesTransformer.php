<?php

namespace Pterodactyl\Transformers\Api\Client;

use Carbon\Carbon;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class FivemResourcesTransformer extends BaseClientTransformer
{
    /**
     * An array of files we allow editing in the Panel.
     *
     * @var array
     */
    private $editable = [];

    /**
     * Transform a file object response from the daemon into a standardized response.
     *
     * @return array
     */
    public function transform(array $item)
    {
        return [
            'Name' => Arr::get($item, 'Name'),
            'Path' => Arr::get($item, 'Path'),
            'Size' => Arr::get($item, 'Size'),
            'LastUpdateDay' => Arr::get($item, 'LastUpdateDay'),
            'LastUpdateMonth' => Arr::get($item, 'LastUpdateMonth'),
            'LastUpdateMinute' => Arr::get($item, 'LastUpdateMinute'),
            'LastUpdateSecond' => Arr::get($item, 'LastUpdateSecond'),
            'LastUpdateYears' => Arr::get($item, 'LastUpdateYears'),

        ];
    }
    public function getResourceName(): string
    {
        return 'resources_object';
    }
}

