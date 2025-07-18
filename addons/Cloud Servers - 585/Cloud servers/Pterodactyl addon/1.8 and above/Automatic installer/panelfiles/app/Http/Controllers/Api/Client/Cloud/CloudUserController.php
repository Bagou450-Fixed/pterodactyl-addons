<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Cloud;

use Pterodactyl\Models\User;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Permission;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Pterodactyl\Models\Filters\MultiFieldServerFilter;
use Pterodactyl\Repositories\Eloquent\ServerRepository;
use Pterodactyl\Transformers\Api\Client\UserTransformer;
use Pterodactyl\Http\Requests\Api\Client\GetServersRequest;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Services\Users\UserCreationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Pterodactyl\Services\Users\UserDeletionService;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Pterodactyl\Services\Users\UserUpdateService;
use Pterodactyl\Models\Bagoulicense;
use Illuminate\Support\Facades\Http;
class CloudUserController extends ClientApiController
{
    /**
     * @var \Pterodactyl\Repositories\Eloquent\ServerRepository
     */
    private $repository;
    /**
     * @var \Pterodactyl\Services\Users\UserCreationService
     */
    protected $creationService;
        /**
     * @var \Pterodactyl\Services\Users\UserUpdateService
     */
    protected $updateService;
        /**
     * @var \Pterodactyl\Services\Users\UserDeletionService
     */
    
    protected $deletionService;
    /**
     * ClientController constructor.
     */
    public function __construct(
        ServerRepository $repository,
        UserCreationService $creationService, 
        UserDeletionService $deletionService, 
        UserUpdateService $updateService
    )
    {
        parent::__construct();

        $this->repository = $repository;
        $this->creationService = $creationService;
        $this->deletionService = $deletionService;
        $this->updateService = $updateService;
    }

    /**
     * Return all users linked to clouduser
     */
    public function index(Request $request): array
    {
        $transaction = Bagoulicense::where('addon', '585')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license =  $license->object();
    if ($code !== 200) {
            throw new BadRequestHttpException('License error please contact a administrator.');
        } else {
        $user = $request->user();
        $transformer = $this->getTransformer(UserTransformer::class);

        // Start the query builder and ensure we eager load any requested relationships from the request.
        $builder = QueryBuilder::for(
            User::query()->with($this->getIncludesForTransformer($transformer))
        )->allowedFilters([
            'cloud',
        ]);

        $builder = $builder->where('users.subcloud', true)->where('users.subcloud_owner', $user->id);


        $users = $builder->paginate(min($request->query('per_page', 50), 100))->appends($request->query());
        return $this->fractal->transformWith($transformer)->collection($users)->toArray();
    }
    }

        /**
     * Return user linked to clouduser

     */
    public function search(Request $request): array
    {
        $transaction = Bagoulicense::where('addon', '585')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license =  $license->object();
    if ($code !== 200) {
            throw new BadRequestHttpException('License error please contact a administrator.');
        } else {
        $email = $request->email;
        $clouduser = $request->user();

        $user = User::where('users.subcloud', true)->where('users.subcloud_owner', $clouduser->id)->where('email', $email)->first();
        $first = true;
        if($user == null) {
            $user = User::where('email', $email)->first();
            $first = false;
        }
        if($user == null) {
            throw new BadRequestHttpException('No user');
        }
        return array('first' => $first, 'user' => $user);
    }
    }
    /**
     * Change the owner of the user
     */
    public function setowner(Request $request)
    {
        $transaction = Bagoulicense::where('addon', '585')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license =  $license->object();
    if ($code !== 200) {
            throw new BadRequestHttpException('License error please contact a administrator.');
        } else {
        $email = $request->email;
        $clouduser = $request->user();
        $user = User::where('email', $email)->firstOrFail();
        if($user->subcloud) {
            throw new BadRequestHttpException('This user already have a owner!');
        }
        User::where('email', $email)->update(['subcloud' => 1, 'subcloud_owner' => $clouduser->id]);
        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }
    }
    /**
     * Create a user
     */
    public function create(Request $request)
    {
        $transaction = Bagoulicense::where('addon', '585')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license =  $license->object();
    if ($code !== 200) {
            throw new BadRequestHttpException('License error please contact a administrator.');
        } else {
        $owner = $request->user();
        
        if(!$owner->cloud) {
            throw new BadRequestHttpException('You are not a cloud user');
        }
        
        $data = array(
            'email' => $request->email,
            'username' => $request->username,
            'name_first' => $request->first,
            'name_last' => $request->last,
            'password' => $request->password,
            'root_admin' => 0,
            'language' => 'en',
            'cloud' => 0,
            'cloud_database' => 0,
            "cloud_allocation" => 0,
            "cloud_backup" => 0,
            "cloud_cpu" => 0,
            "cloud_ram" => 0,
            "cloud_disk" => 0,
            "cloud_users" => 0,
            "cloud_servers" => 0
        );
        $userscount = User::where('subcloud_owner', $owner->id)->where('subcloud', 1)->count();

        if($userscount >= $owner->cloud_users ) {
            throw new BadRequestHttpException('You can\'t create more users');
        }
        $user = $this->creationService->handle($data);

        User::where('id', $user->id)->update(['subcloud' => true, 'subcloud_owner' => $owner->id]);
        if($request->whmcs) {
            return $user;
        }
        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }
    }

    /**
     * Remove user
     */
    public function delete(Request $request) {
        $transaction = Bagoulicense::where('addon', '585')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license =  $license->object();
    if ($code !== 200) {
            throw new BadRequestHttpException('License error please contact a administrator.');
        } else {
        $owner = $request->user();
        $user = User::where('uuid', $request->useruuid)->firstOrFail();
        if($owner->id !== $user['subcloud_owner'] && $user['subcloud']) {
            throw new BadRequestHttpException('You are not the owner');
        }
        if(Server::where('owner_id', $user['id'])->exists()) {
            throw new BadRequestHttpException('Some servers are associated to this user please remove it before.');
        }
        $this->deletionService->handle($user);
        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }
    }

     /**
     * Edit a user
     */
    public function edit(Request $request)
    {
        $transaction = Bagoulicense::where('addon', '585')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license =  $license->object();
    if ($code !== 200) {
            throw new BadRequestHttpException('License error please contact a administrator.');
        } else {
            $owner = $request->user();
        $user = User::where('uuid', $request->useruuid)->firstOrFail();
        if($owner->id !== $user['subcloud_owner'] && $user['subcloud']) {
            throw new BadRequestHttpException('You are not the owner');
        }
        $data = array(
            'email' => $request->email,
            'username' => $request->username,
            'name_first' => $request->first,
            'name_last' => $request->last,
            'password' => $request->password,
            'root_admin' => 0,
            'language' => 'en',
            'cloud' => 0,
            'cloud_database' => 0,
            "cloud_allocation" => 0,
            "cloud_backup" => 0,
            "cloud_cpu" => 0,
            "cloud_ram" => 0,
            "cloud_disk" => 0,
            "cloud_users" => 0,
            "cloud_servers" => 0
        );
        $this->updateService
            ->handle($user, $data);

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }
    }

}
