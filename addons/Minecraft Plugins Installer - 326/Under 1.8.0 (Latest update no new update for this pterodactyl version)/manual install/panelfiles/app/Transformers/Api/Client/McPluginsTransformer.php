<?php

namespace Pterodactyl\Transformers\Api\Client;

use Carbon\Carbon;
use Illuminate\Support\Arr;
use Pterodactyl\Models\Mcplugins;

class McPluginsTransformer extends BaseClientTransformer
{
    /**
     * Transform a file object response from the daemon into a standardized response.
     *
     * @return array
     */
    public function transform(Mcplugins $modal)
    {
        return [
            'server_id' => $modal->server_id,
            'plugin' => $modal->plugin,
        ];
    }

    public function getResourceName(): string
    {
        return 'Mcplugins';
    }
}

