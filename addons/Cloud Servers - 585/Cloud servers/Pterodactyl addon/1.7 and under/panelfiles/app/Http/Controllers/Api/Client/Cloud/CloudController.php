<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Cloud;

use Pterodactyl\Models\User;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\PanelName;
use Pterodactyl\Models\Permission;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Pterodactyl\Models\Filters\MultiFieldServerFilter;
use Pterodactyl\Repositories\Eloquent\ServerRepository;
use Pterodactyl\Transformers\Api\Client\UserTransformer;
use Pterodactyl\Http\Requests\Api\Client\GetServersRequest;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Services\Servers\ServerDeletionService;
use Illuminate\Http\Request;
use Pterodactyl\Models\Setting;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Pterodactyl\Models\Bagoulicense;
use Illuminate\Support\Facades\Http;
class CloudController extends ClientApiController
{
    /**
     * @var \Pterodactyl\Repositories\Eloquent\ServerRepository
     */
    private $repository;

    /**
     * ClientController constructor.
     */
    public function __construct(ServerRepository $repository)
    {
        parent::__construct();

        $this->repository = $repository;
    }

    public function infos(Request $request) {
        $transaction = Bagoulicense::where('addon', 'cloudservers')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license =  $license->object();
        if ($code !== 200) {
            throw new BadRequestHttpException('License error please contact a administrator.');
        } else {
        $user = $request->user();
        if(!$user->cloud) {

            throw new BadRequestHttpException('You are not a cloud user');
        }
        $eggs = Egg::where('cloud', true)->get();
        $users = User::where('uuid', $user->uuid)->get()->merge(User::where('subcloud', true)->where('subcloud_owner', $user->id)->get());
        $cloudservers = Server::where('cloud' ,true)->where('cloud_owner', $user->uuid)->get();
        $available = Array('ram' => $user->cloud_ram, 'disk' => $user->cloud_disk, 'cpu' => $user->cloud_cpu, 'backups' => $user->cloud_backup, 'databases' => $user->cloud_database, 'allocations' => $user->cloud_allocation);
        foreach($cloudservers as $cloudserver) {
            if($user->cloud_ram !== -1) {
                $available['ram'] -= $cloudserver->memory;
            }
            if($user->cloud_disk !== -1) {
                $available['disk'] -= $cloudserver->disk;
            }
            if($user->cloud_cpu !== -1) {
                $available['cpu'] -= $cloudserver->cpu;
            }
            if($user->cloud_backup !== -1) {
                $available['backups'] -= $cloudserver->backup_limit;
            }
            if($user->cloud_allocation !== -1) {
                $available['allocations'] -= $cloudserver->allocation_limit;
            }
            if($user->cloud_database !== -1) {
                $available['databases'] -= $cloudserver->database_limit;
            }
        }

        $nodeselection = Setting::where('key', 'cloud_nodeselect')->first();
        if(!$nodeselection) {
            $nodeselection = 'false';
        } else {
            $nodeselection = $nodeselection['value'];
        }
        $cloudnodes = Node::where('cloud', true)->get();
        return Array('eggs' => $eggs, 'users' => $users, 'available' => $available, 'nodeselection' => $nodeselection, 'nodes' => $cloudnodes);
    }
    }
    /**
     * Get panel name
     */
    public function cloudname(Request $request): Array
    {
        $owner = $request->user();
        $transaction = Bagoulicense::where('addon', 'cloudservers')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");

        $code = $license->status();
        $license =  $license->object();
        if ($code !== 200) {
             return ['name' => 'Pterodactyl', 'img' => '', 'footer' => '', 'footerlink' => ''];
        } else {
        if($request->owner == "true") {

            $name = PanelName::where('ownerid', $owner->subcloud_owner)->first();
            if(!$name) {
                return ['name' => '', 'img' => '', 'footer' => '', 'footerlink' => ''];
            }
            return ['name' => $name->name, 'img' => $name->img, 'footer' => $name->footer, 'footerlink' => $name->footerlink];
        }
        $name = PanelName::where('ownerid', $owner->id)->first();
        if(!$name) {
            return ['name' => '', 'img' => '', 'footer' => '', 'footerlink' => ''];
        }
        return ['name' => $name->name, 'img' => $name->img, 'footer' => $name->footer, 'footerlink' => $name->footerlink];
    }
    }
}
