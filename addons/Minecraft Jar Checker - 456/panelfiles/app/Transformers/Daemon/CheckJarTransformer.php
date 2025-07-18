<?php

namespace Pterodactyl\Transformers\Daemon;

use Carbon\Carbon;
use Illuminate\Support\Arr;

class CheckJarTransformer extends BaseDaemonTransformer
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
            'status' => $item,
        ];
    }

    public function getResourceName(): string
    {
        return 'status';
    }
}
