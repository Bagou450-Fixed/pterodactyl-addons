<?php

namespace Pterodactyl\Http\Controllers\Api\Application\Cloud;

use Pterodactyl\Models\User;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Http\Controllers\Api\Application\ApplicationApiController;
use Pterodactyl\Models\Server;
use Pterodactyl\Services\Servers\SuspensionService;
use Pterodactyl\Services\Servers\ServerDeletionService;

class UserController extends ApplicationApiController
{

            /**
     * @var \Pterodactyl\Services\Servers\SuspensionService
     */
    protected $suspensionservice;
                /**
     * @var \Pterodactyl\Services\Servers\ServerDeletionService
     */
    protected $serverdeletionservice;
    /**
     * UserController constructor.
     */
    public function __construct(
        SuspensionService $suspensionservice,
        ServerDeletionService $serverdeletionservice,
    ) {
        parent::__construct();
        $this->suspensionservice = $suspensionservice;
        $this->serverdeletionservice = $serverdeletionservice;
    }
    /**
     * Suspend Cloud user servers
     *
     */
    public function suspend(User $user): JsonResponse
    {
        $action = 'suspend';
        if($user->suspended) {
            $action = 'unsuspend';
        }
        $userservers = $user->servers;
        $clousservers = Server::where('cloud', 1)->where('cloud_owner', $user->uuid)->get();
        foreach($userservers as $server) {
            $this->suspensionservice->toggle(Server::where('id', $server->id)->firstOrFail(), $action);
        }
        foreach($clousservers as $server) {
            $this->suspensionservice->toggle(Server::where('id', $server->id)->firstOrFail(), $action);
        }
        User::where('uuid', $user->uuid)->update(['suspended' => !$user->suspended]);

        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

   /**
     * Terminate/Delete Cloud user servers
     *
     */
    public function terminate(User $user): JsonResponse
    {
        $userservers = $user->servers;
        $clousservers = Server::where('cloud', 1)->where('cloud_owner', $user->uuid)->get();
        foreach($clousservers as $server) {
            $this->serverdeletionservice->withForce(true)->handle($server);
        }
        User::where('uuid', $user->uuid)->update(['cloud' => false]);
        $cloudusers = User::where('subcloud', 1)->where('subcloud_owner', $user->id)->get();
        foreach($cloudusers as $user) {
            User::where('uuid', $user->uuid)->update(['subcloud' => 0]);
        }
        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }
   
    
}
