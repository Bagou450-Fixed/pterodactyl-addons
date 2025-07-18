<?php

namespace Pterodactyl\Transformers\Api\Client;

use Pterodactyl\Models\Baniplist;

class BanIpTransformer extends BaseClientTransformer
{
    public function getResourceName(): string
    {
        return Baniplist::RESOURCE_NAME;
    }

    /**
     * @return array
     */
    public function transform(Baniplist $banip)
    {
        return [
            'server_id' => $banip->server_id,
            'ip' => $banip->ip,
            'country' => $banip->country,
            'region' => $banip->region,
            'city' =>  $banip->city,
            'countryname' => $banip->countryname,
            'port' => $banip->port,
        ];
    }
}
