<?php

namespace Pterodactyl\Services\Servers\Bagou;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Pterodactyl\Models\Bagou\Subdomain\Record;
use Pterodactyl\Models\Bagou\Subdomain\Subdomain;
use Pterodactyl\Models\Bagoulicense;
use Pterodactyl\Models\Server;
use Symfony\Component\HttpFoundation\Response as ResponseAlias;

class SubdomainsService
{
    public function create(Request $request, Server $server) {
        $license = Bagoulicense::where('addon', '=', 326)->firstOrFail()->license;
        $record = Record::with('domain')->where('id', $request->record)->first();
        if(!$record) {
            return response()->json([
                'status' => 'error',
                'message' => 'Record not found.'
            ], ResponseAlias::HTTP_NOT_FOUND);
        }
        $domain = $record->domain;

        $data = [
            'id' => $license,
            'type' => $domain->type,
            'key' => decrypt($domain->key),
            'recordType' => strtoupper($record->type),
            'record' => $request->data,
            'value' =>  $server->node->fqdn,
            'domain' => $domain->name,
            'ttl' => $record->ttl,
            'protocol' => $record->protocol,
            'priority' => $record->priority,
            'service' => $record->service,
            'weight' => $record->weight
        ];
        $data['port'] = $server->allocation->port;
        if($domain->type === 'ovh') {
            $data['consumer'] = decrypt($domain->consumer);
            $data['api'] = $domain->ovh_api;
        }
        if ($domain->type === 'cloudflare') {
            $data['domain'] = $domain->cloudflare_id;
        } else {
            $data['secret'] = decrypt($domain->secret);
        }

        $apirequest = Http::post( "https://api.bagou450.com/api/client/pterodactyl/subdomains", $data);
        if(!$apirequest->successful()) {
            return [
                'status' => 'error',
                'message' => 'Error during api communication',
                'logs' => 'No logs'
            ];
        }
        $apirequest = $apirequest->object();
        if($apirequest->status !== 'success') {
            return [
                'status' => 'error',
                'message' => $apirequest->message,
                'logs' => isset($apirequest->data) && !empty($apirequest->data) ? $apirequest->data : 'No more data'
            ];
        }
        $server->subdomains()->create([
            'domain_id' => $domain->id,
            'record_id' => $record->id,
            'server_id' => $server->id,
            'type' => $record->type,
            'name' => $request->data,
            'api_id' => $apirequest->id ?? null
        ]);
        return [
            'status' => 'success',
            'message' => 'Subdomain created successfully.'
        ];
    }
    public function delete(Subdomain $subdomain, Server $server) {
        $domain = $subdomain->domain;
        $license = Bagoulicense::where('addon', '=', 326)->firstOrFail()->license;

        $data = [
            'id' => $license,
            'key' => decrypt($domain->key),
            'type' => $domain->type,
            'domain' => $domain->name,
            'record' => $subdomain->name
        ];
        if($domain->type === 'namecheap') {
            $data['port'] = $server->allocation->port;
            $data['protocol'] = $subdomain->record->protocol;
            $data['priority'] = $subdomain->record->priority;
            $data['service'] = $subdomain->record->service;
            $data['weight'] = $subdomain->record->weight;
        }
        if($domain->type === 'name') {
            $data['record'] = $subdomain->api_id;
        }
        if($domain->type === 'daddy' || $domain->type === 'namecheap') {
            $data['recordType'] = $subdomain->record->type;
        }
        if($domain->type === 'ovh') {
            $data['consumer'] = decrypt($domain->consumer);
            $data['api'] = $domain->ovh_api;
        }
        if ($domain->type === 'cloudflare') {
            $data['domain'] = $domain->cloudflare_id;
            $data['record'] = $subdomain->api_id;

        } else {
            $data['secret'] = decrypt($domain->secret);
        }


        $apirequest = Http::delete("https://api.bagou450.com/api/client/pterodactyl/subdomains", $data)->object();
        if ($apirequest->status !== 'success') {
            return [
                'status' => 'error',
                'message' => $apirequest->message,
                'logs' => $apirequest->data
            ];
        }
        $subdomain->delete();
        return [
            'status' => 'success',
            'message' => 'Subdomain deleted successfully.'
        ];
    }
    public function deleteAll(Server $server): array
    {
        $subdomains = Subdomain::where('server_id', $server->id)->get();
        foreach ($subdomains as $subdomain) {
            $result = $this->delete($subdomain, $server);
            if ($result['status'] === 'error') {
               return $result;
            }


        }
        return [
            'status' => 'success',
            ];
    }
}

