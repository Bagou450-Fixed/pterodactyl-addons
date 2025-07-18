<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Cloud;

use Pterodactyl\Models\User;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Setting;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\Permission;
use Pterodactyl\Models\EggVariable;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Pterodactyl\Models\Filters\MultiFieldServerFilter;
use Pterodactyl\Repositories\Eloquent\ServerRepository;
use Pterodactyl\Repositories\Eloquent\NodeRepository;
use Pterodactyl\Transformers\Api\Client\UserTransformer;
use Pterodactyl\Http\Requests\Api\Client\GetServersRequest;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Services\Servers\ServerCreationService;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Pterodactyl\Models\Objects\DeploymentObject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Pterodactyl\Services\Servers\ServerDeletionService;
use Pterodactyl\Services\Subusers\SubuserCreationService;
use Pterodactyl\Services\Servers\SuspensionService;
use Pterodactyl\Models\Bagoulicense;
use Illuminate\Support\Facades\Http;
class CloudServersController extends ClientApiController
{
    /**
     * @var \Pterodactyl\Repositories\Eloquent\ServerRepository
     */
    private $repository;
    /**
     * @var \Pterodactyl\Services\Servers\ServerCreationService
     */
    private $creationService;
        /**
     * @var \Pterodactyl\Services\Servers\ServerDeletionService
     */
    protected $deletionService;

    /**
     * @var \Pterodactyl\Services\Subusers\SubuserCreationService
     */
    protected $subuserCreationService;
        /**
     * @var \Pterodactyl\Services\Servers\SuspensionService
     */
    protected $suspensionService;

    /**
     * ClientController constructor.
     */
    public function __construct(ServerRepository $repository, NodeRepository $noderepository, ServerCreationService $creationService, ServerDeletionService $deletionService,  SubuserCreationService $subuserCreationService, SuspensionService $suspensionService)
    {
        parent::__construct();

        $this->repository = $repository;
        $this->creationService = $creationService;
        $this->noderepository = $noderepository;
        $this->deletionService = $deletionService;
        $this->subuserCreationService = $subuserCreationService;
        $this->suspensionService = $suspensionService;
    }

    public function search(Request $request) {
        $transaction = Bagoulicense::where('addon', '585')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license =  $license->object();
    if ($code !== 200) {
            throw new BadRequestHttpException('License error please contact a administrator.');
        } else {
        $serverid = $request->serverid;
        $user = $request->user();
        if(!$serverid) {
            throw new BadRequestHttpException('You need to enter a server external id!');
        }
        $found = Server::where('cloud_owner', $user->uuid)->where('cloud', 1)->where('external_id', $serverid)->firstOrFail();
        return $found;
    }
    }

    public function create(Request $request) {
        $transaction = Bagoulicense::where('addon', '585')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license =  $license->object();
    if ($code !== 200) {
            throw new BadRequestHttpException('License error please contact a administrator.');
        } else {
        $owner = $request->user();
        $name = $request->name;
        $cpu = $request->cpu;
        $ram = $request->ram;
        $disk = $request->disk;
        $backups = $request->backups;
        $databases = $request->databases;
        $allocations = $request->allocations;
        $nodeid = $request->node;
        $eggid = $request->egg;
        $locationid = $request->location;
        $serverscount = Server::where('cloud' ,true)->where('cloud_owner', $owner->uuid)->count();

        $nestid = Egg::where('id', $eggid)->firstOrFail()->nest_id;
        $startup = Egg::where('id', $eggid)->firstOrFail()->startup;
        $docker = Egg::where('id', $eggid)->firstOrFail()->docker_images;
        $docker = $docker[array_key_first($docker)];
        $env = EggVariable::where('egg_id', '=', $eggid)->get();
        $nodeselection = Setting::where('key', 'cloud_nodeselect')->first();
        $locationselection = Setting::where('key', 'cloud_locationselect')->first();

        if(!$nodeselection) {
            $nodeselection = 'false';
        } else {
            $nodeselection = $nodeselection['value'];
        }
        if(!$locationselection) {
            $locationselection = 'false';
        } else {
            $locationselection = $locationselection['value'];
        }
        $environement = [];
        $cloudservers = Server::where('cloud' ,true)->where('cloud_owner', $owner->uuid)->get();
        $available = Array('ram' => $owner->cloud_ram, 'disk' => $owner->cloud_disk, 'cpu' => $owner->cloud_cpu, 'backups' => $owner->cloud_backup, 'databases' => $owner->cloud_database, 'allocations' => $owner->cloud_allocation);
        foreach($cloudservers as $cloudserver) {
            if($owner->cloud_ram !== -1) {
                $available['ram'] -= $cloudserver->memory;
            }
            if($owner->cloud_disk !== -1) {
                $available['disk'] -= $cloudserver->disk;
            }
            if($owner->cloud_cpu !== -1) {
                $available['cpu'] -= $cloudserver->cpu;
            }
            if($owner->cloud_backup !== -1) {
                $available['backups'] -= $cloudserver->backup_limit;
            }
            if($owner->cloud_allocation !== -1) {
                $available['allocations'] -= $cloudserver->allocation_limit;
            }
            if($owner->cloud_database !== -1) {
                $available['databases'] -= $cloudserver->database_limit;
            }
        }

        if(Node::where('cloud', true)->count() == 0) {
            throw new BadRequestHttpException('No node found please contact an administrator');
        }
        if(!$owner->cloud) {
            throw new BadRequestHttpException('You are not a cloud user');
        }

        if($ram > $available['ram']) {
            throw new BadRequestHttpException('You need more ram');
        }
        if($disk > $available['disk']) {
            throw new BadRequestHttpException('You need more disk');
        }
        if($cpu > $available['cpu']) {
            throw new BadRequestHttpException('You need more cpu');
        }
        if($backups > $available['backups']) {
            throw new BadRequestHttpException('You need more backups');
        }
        if($allocations > $available['allocations']) {
            throw new BadRequestHttpException('You need more allocations');
        }
        if($databases > $available['databases']) {
            throw new BadRequestHttpException('You need more databases');
        }
        if($serverscount >= $owner->cloud_servers ) {
            throw new BadRequestHttpException('You can\'t create more servers');
        }
        
        if($nodeid && $nodeselection !== 'true') {
            throw new BadRequestHttpException('You can\'t create a server on this node');
        }

        foreach ($env as $item) {
            $environement[$item->env_variable] = $item->default_value;
        }
        if($request->external) {
            $userid = $request->userid;
        } else {
            $userid = User::where('uuid', $request->userid)->firstOrFail()->id;
        }
        $data = Array(
            'name' => $name,
            'description' => '',
            'status' => Server::STATUS_INSTALLING,
            'owner_id' => $userid,
            'memory' => $ram,
            'swap' => 0,
            'disk' => $disk,
            'io' => 500,
            'cpu' => $cpu,
            'oom_disabled' => true,
            'nest_id' => $nestid,
            'egg_id' => $eggid,
            'startup' => $startup,
            'image' => $docker,
            'database_limit' => $databases,
            'allocation_limit' => $allocations,
            'backup_limit' => $backups,
            'environment' => $environement,
            'start_on_completion' => true,
        );
        if($request->external) {
            $data['external_id'] = $request->external;
        }
        $object = new DeploymentObject();
        $object->setDedicated(false);
        $object->setPorts([]);
        $object->setCloud(true);
        $object->setNode(-1);
        if($nodeid) {
            $object->setNode($nodeid);
        } else if ($locationid) {
            $object->setLocations([$locationid]);
        }

        $server = $this->creationService->handle($data, $object);
        Server::where('id', $server->id)->update(['cloud' => true, 'cloud_owner' => $owner->uuid]);
        try {
            User::where('uuid', $request->owner)->update(['cloud_database' => $owner->cloud_database - $databases, 'cloud_allocation' => $owner->cloud_allocation - $allocations,'cloud_ram' => $owner->cloud_ram - $ram, 'cloud_disk' => $owner->cloud_disk - $disk, 'cloud_cpu' => $owner->cloud_cpu - $cpu, 'cloud_backup' => $owner->cloud_backup - $backups]);
        } catch(err) {
            $this->deletionService->withForce(true)->handle($server);
            throw new BadRequestHttpException('Error can\'t remove ram');

        }
        if($userid !== $owner->id) {
            $permissions = [];
            foreach (Permission::permissions()->all() as $key => $perm) {
                foreach ($perm['keys'] as $subKey => $sub) {
                    array_push($permissions, $key . '.' . $subKey);
                }
            }
            $this->subuserCreationService->handle($server, $owner->email, $permissions);
        }

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }
    }
    /**
     * Remove a cloud server
     */
    public function delete(Request $request) {
        $transaction = Bagoulicense::where('addon', '585')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license =  $license->object();
    if ($code !== 200) {
            throw new BadRequestHttpException('License error please contact a administrator.');
        } else {
        $server = Server::where('uuid', $request->serveruuid)->firstOrFail();
        $user = $request->user();

        if($user->uuid != $server->cloud_owner) {
            throw new BadRequestHttpException('You are not the owner');
        }

        $this->deletionService->withForce(true)->handle($server);

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }
    
    }

        /**
     * Suspend a cloud server
     */
    public function suspend(Request $request) {
        $transaction = Bagoulicense::where('addon', '585')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license =  $license->object();
    if ($code !== 200) {
            throw new BadRequestHttpException('License error please contact a administrator.');
        } else {
        $server = Server::where('uuid', $request->serveruuid)->firstOrFail();
        $user = $request->user();

        if($user->uuid != $server->cloud_owner) {
            throw new BadRequestHttpException('You are not the owner');
        }
        if($server->status === 'suspended') {
            $this->suspensionService->toggle($server, 'unsuspend');
        } else {
            $this->suspensionService->toggle($server, 'suspend');

        }

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

    }

    public function edit(Request $request, User $user) {
        $transaction = Bagoulicense::where('addon', '585')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license =  $license->object();
    if ($code !== 200) {
            throw new BadRequestHttpException('License error please contact a administrator.');
        } else {
        $server = Server::where('uuid', $request->uuid)->firstOrFail();
        $name = $request->name;
        $cpu = $request->cpu;
        $ram = $request->ram;
        $disk = $request->disk;
        $backups = $request->backups;
        $databases = $request->databases;
        $allocations = $request->allocations;
        $location = $request->location ?? 1; // NEED TO CHANGE IT
        $userid = User::where('uuid', $request->userid)->firstOrFail()->id;
        $owner = $request->user();
        $eggid = $request->egg;
        $nestid = Egg::where('id', $eggid)->firstOrFail()->nest_id;
        $startup = Egg::where('id', $eggid)->firstOrFail()->startup;
        $docker = Egg::where('id', $eggid)->firstOrFail()->docker_images;
        $docker = $docker[array_key_first($docker)];
        $env = EggVariable::where('egg_id', '=', $eggid)->get();
        
        $environement = [];
        if($server->cloud_owner != $owner->uuid) {
            return throw new BadRequestHttpException('You are not the owner');
        }
        if($owner->cloud_ram+$server['memory'] < $ram) {
            return throw new BadRequestHttpException('You need more ram');
        }
        if($owner->cloud_disk+$server['disk'] < $disk) {
            return throw new BadRequestHttpException('You need more disk');
        }
        if($owner->cloud_cpu+$server['cpu'] < $cpu) {
            return throw new BadRequestHttpException('You need more cpu');
        }
        if($owner->cloud_backup+$server['backup_limit'] < $backups) {
            return throw new BadRequestHttpException('You need more backups');
        }
        if($owner->cloud_allocation+$server['allocation_limit'] < $allocations) {
            return throw new BadRequestHttpException('You need more allocations');
        }
        if($owner->cloud_database+$server['database_limit'] < $databases) {
            return throw new BadRequestHttpException('You need more databases');
        }
        
        foreach ($env as $item) {
            $environement[$item->env_variable] = $item->default_value;
        }
        $data = Array(
            'name' => $name,
            'owner_id' => $userid,
            'memory' => $ram,
            'disk' => $disk,
            'cpu' => $cpu,
            'nest_id' => $nestid,
            'egg_id' => $eggid,
            'startup' => $startup,
            'image' => $docker,
            'database_limit' => $databases,
            'allocation_limit' => $allocations,
            'backup_limit' => $backups,
        );

        try {
            User::where('uuid', $request->owner)->update(['cloud_database' => $owner->cloud_database + $server['database_limit'] - $databases, 'cloud_allocation' => $owner->cloud_allocation+$server['allocation_limit'] - $allocations,'cloud_ram' => $owner->cloud_ram +$server['memory']- $ram, 'cloud_disk' => $owner->cloud_disk +$server['disk']- $disk, 'cloud_cpu' => $owner->cloud_cpu +$server['cpu']- $cpu, 'cloud_backup' => $owner->cloud_backup+$server['backup_limit'] - $backups]);
        } catch(err) {
            $this->deletionService->withForce(true)->handle($server);
            return throw new BadRequestHttpException('Error can\'t remove ram');

        }
        Server::where('uuid', $request->uuid)->update($data);
        Server::where('id', $server->id)->update(['cloud' => true, 'cloud_owner' => $owner->uuid]);

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }
    }
}

