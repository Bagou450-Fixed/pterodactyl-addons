<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Pterodactyl\Exceptions\Http\Connection\DaemonConnectionException;
use Pterodactyl\Models\Server;
use Illuminate\Support\Facades\DB;
use Pterodactyl\Exceptions\DisplayException;
use Illuminate\Http\Request;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Services\Servers\ServerCreationService;
use Pterodactyl\Services\Servers\ServerDeletionService;
use Pterodactyl\Transformers\Api\Client\SubuserTransformer;
use Pterodactyl\Services\Subusers\SubuserCreationService;

class SplittedController extends ClientApiController
{
    /**
     * @var ServerCreationService
     */
    protected $serverCreationService;
    /**
     * @var ServerDeletionService
     */
    protected $serverDeletionService;
    /**
     * FreeServersController constructor.
     * @param ServerCreationService $serverCreationService
     */
    public function __construct(
        ServerCreationService $serverCreationService, 
        ServerDeletionService $serverDeletionService,
        SubuserCreationService $creationService
    ){
        parent::__construct();

        $this->serverCreationService = $serverCreationService;
        $this->serverDeletionService = $serverDeletionService;
        $this->creationService = $creationService;


    }


    public function index(Request $request, Server $server): array
    {
        if(!$server->split_masteruuid) {
            $splittedserver = DB::table('servers')->where('uuid', '=', $server->uuid)->get();
            $splittedserver[0]->master = true;
            return [
                'success' => true,
                'data' => [
                    'splitted' => false,
                    'split_limit' => $server->split_limit,
                    'servers' => $splittedserver,
                    'master' => "",
                    'total' => [
                        'memory' => $server->memory,
                        'disk' => $server->disk,
                        'cpu' => $server->cpu,
                        'swap' => $server->swap,
                    ],
                    'totalall' => [
                        'memory' => $server->memory,
                        'disk' => $server->disk,
                        'cpu' => $server->cpu,
                        'swap' => $server->swap,
                    ],
                ],
            ];
        }
        $splittedserver = DB::table('servers')->where('split_masteruuid', '=', $server->split_masteruuid)->get();
        $masterserver = DB::table('servers')->where('uuid', '=', $server->split_masteruuid)->first();

        $totalmemory = 0;
        $totaldisk = 0;
        $totalcpu = 0;
        $totalswap = 0;
        foreach($splittedserver as $serversplitted) {
            $serversplitted->master = false;
            $totalmemory += $serversplitted->memory;
            $totaldisk += $serversplitted->disk;
            $totalcpu += $serversplitted->cpu;
            $totalswap += $serversplitted->swap;

            if($serversplitted->uuid == $serversplitted->split_masteruuid) {
                $serversplitted->master = true;
            }
        }
        return [
            'success' => true,
            'data' => [
                'splitted' => true,
                'split_limit' => $masterserver->split_limit,
                'servers' => $splittedserver,
                'master' => $server->split_masteruuid,
                'total' => [
                    'memory' => $server->memory,
                    'disk' => $server->disk,
                    'cpu' => $server->cpu,
                    'swap' => $server->swap,
                ],
                'totalall' => [
                    'memory' => $totalmemory,
                    'disk' => $totaldisk,
                    'cpu' => $totalcpu,
                    'swap' => $totalswap,
                ],
            ],
        ];
    }
    public function split(Request $request, Server $server)
    { 
        if($server->cpu - 1 < $request->cpu) {
            throw new DisplayException('You need more CPU.');
        }
        if($server->memory - 512 < $request->ram) {
            throw new DisplayException('You need more RAM.');
        }
        if($server->disk - 512 < $request->disk) {
            throw new DisplayException('You need more DISK.');
        }
        if($server->disk - 512 < $request->swap) {
            throw new DisplayException('You need more SWAP.');
        }
        $allocationId = DB::table('allocations')->where('node_id', '=', $server->node_id)->whereNull('server_id')->inRandomOrder()->first()->id;
        $environement = [];
        $env = DB::table('egg_variables')->where('egg_id', '=', $server->egg_id)->get();

        foreach ($env as $item) {
            $environement[$item->env_variable] = $item->default_value;
        }
        try {
            $splittedserver = $this->serverCreationService->handle([
                'name' => $request->name,
                'description' => '',
                'owner_id' => $server->owner_id,
                'node_id' => $server->node_id,
                'allocation_id' => $allocationId,
                'allocation_additional' => [],
                'database_limit' => 2,
                'allocation_limit' => 2,
                'backup_limit' => 2,
                'memory' => (int) $request->ram,
                'disk' => (int) $request->disk,
                'swap' => (int) $request->swap,
                'io' => 500,
                'cpu' => (int) $request->cpu,
                'threads' => '',
                'nest_id' => $server->nest_id,
                'egg_id' => $server->egg_id,
                'pack_id' => 0,
                'startup' => $server->startup,
                'image' => $server->image,
                'environment' => $environement,
                'start_on_completion' => true,
            ]);

        } catch (Throwable $e) {
            throw new DisplayException('Failed to create the new server. Please try again later...');
        }
        if($server->split_masteruuid) {
            DB::table('servers')->where('uuid', '=', $splittedserver->uuid)->update([
                'split_masteruuid' => $server->split_masteruuid,
                'split_limit' => $server->split_limit,
            ]);
            DB::table('servers')->where('uuid', '=', $server->uuid)->update([
                'cpu' => $server->cpu - $request->cpu,
                'memory' => $server->memory - $request->ram,
                'disk' => $server->disk - $request->disk,
                'swap' => $server->swap - $request->swap,
            ]);
        } else {
            DB::table('servers')->where('uuid', '=', $splittedserver->uuid)->update([
                'split_masteruuid' => $server->uuid,
                'split_limit' => $server->split_limit,
            ]);
            DB::table('servers')->where('uuid', '=', $server->uuid)->update([
                'cpu' => $server->cpu - $request->cpu,
                'memory' => $server->memory - $request->ram,
                'disk' => $server->disk - $request->disk,
                'swap' => $server->swap - $request->swap,
                'split_masteruuid' => $server->uuid,
            ]);
        }
        if($request->subuser) {
            $subusers = $this->fractal->collection($server->subusers)
            ->transformWith($this->getTransformer(SubuserTransformer::class))
            ->toArray();
            foreach($subusers['data'] as $user) {
                $response = $this->creationService->handle(
                    $splittedserver,
                    $user['attributes']['email'],
                    $user['attributes']['permissions']
                );
            }
        }

    }
    public function delete(Request $request)
    {
        $masterserver = DB::table('servers')->where('uuid', '=', $request->split_masteruuid)->first();

        $servertoremove = DB::table('servers')->where('uuid', '=', $request->serveruuid)->first();
        if($masterserver == []) {
            throw new DisplayException('This server does not exist/is not splitted');
        }  
        try {
                        
            $this->serverDeletionService->handlesplitted(Server::find($servertoremove->id));
            DB::table('servers')->where('uuid', '=', $request->split_masteruuid)->update([
                'cpu' => $masterserver->cpu + $servertoremove->cpu,
                'memory' => $masterserver->memory + $servertoremove->memory,
                'disk' => $masterserver->disk + $servertoremove->disk,
                'swap' => $masterserver->swap + $servertoremove->swap,
            ]);

        } catch (Throwable $e) {
            throw new DisplayException('Failed to delete the server. Please try again...');
        }


        
    }
}

