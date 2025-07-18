<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers\Bagou;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Pterodactyl\Models\Bagou\Subdomain\Domain;
use Pterodactyl\Models\Bagou\Subdomain\EggRecord;
use Pterodactyl\Models\Bagou\Subdomain\Record;
use Pterodactyl\Models\Bagou\Subdomain\Subdomain;
use Pterodactyl\Models\Bagoulicense;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\Server;
use Pterodactyl\Services\Servers\Bagou\SubdomainsService;
use Symfony\Component\HttpFoundation\Response as ResponseAlias;

class SubdomainsController
{

    /**
     * ServerDeletionService constructor.
     */
    public function __construct(
        private SubdomainsService $subdomainsService,
    )
    {
    }

    public function index(Server $server)
    {
        $eggId = $server->egg_id;
        $listRecord = EggRecord::where('egg_id', $eggId)
            ->with(['record' => function ($query) {
                $query->select('id', 'name', 'domain_id');
            }, 'record.domain' => function ($query) {
                $query->select('id', 'name');
            }])
            ->get()
            ->pluck('record')
            ->map(function ($record) {
                return [
                    'id' => $record->id,
                    'name' => $record->name,
                    'domain' => $record->domain->name,
                ];
            })
            ->toArray();
        $domains = $server->subdomains()
            ->with(['domain' => function ($query) {
                $query->select('id', 'name');
            }])
            ->select('created_at', 'id', 'type', 'name', 'domain_id')
            ->paginate(10);

        $domains->getCollection()->transform(function ($item) {
            $item['domain'] = $item['domain']['name'];
            return $item;
        });
        return ['domains' => $domains, 'template' => $listRecord];
    }

    public function create(Request $request, Server $server)
    {
        try {
            $request->validate([
                'record' => 'required',
                'data' => 'required|string',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Missing query parameters.'
            ], ResponseAlias::HTTP_NOT_FOUND);
        }
        $result = $this->subdomainsService->create($request, $server);

        if ($result['status'] === 'error') {
            return response()->json([
                'status' => 'error',
                'message' => $result['message'],
                'logs' => $result['logs'] ?? 'No additional data',
            ], ResponseAlias::HTTP_INTERNAL_SERVER_ERROR);
        }

        return response()->json([
            'status' => 'success',
            'message' => $result['message']
        ]);
    }

    public function delete(Request $request, Server $server)
    {

        try {
            $request->validate([
                'subdomain' => 'required',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Missing query parameters.'
            ], ResponseAlias::HTTP_NOT_FOUND);
        }

        $subdomain = $server->subdomains()->where('id', $request->subdomain)->with('domain')->first();

        if (!$subdomain) {
            return response()->json([
                'status' => 'error',
                'message' => 'Record not found.'
            ], ResponseAlias::HTTP_NOT_FOUND);
        }
        $result = $this->subdomainsService->delete($subdomain, $server);
        if ($result['status'] === 'error') {
            return response()->json([
                'status' => 'error',
                'message' => $result['message'],
                'logs' => $result['logs'] ?? 'No additional data',
            ], ResponseAlias::HTTP_INTERNAL_SERVER_ERROR);
        }

        return response()->json([
            'status' => 'success',
            'message' => $result['message']
        ]);

    }
}
