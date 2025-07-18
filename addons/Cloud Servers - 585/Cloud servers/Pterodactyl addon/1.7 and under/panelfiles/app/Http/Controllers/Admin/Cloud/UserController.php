<?php

namespace Pterodactyl\Http\Controllers\Admin\Cloud;

use Illuminate\Http\Request;
use Pterodactyl\Models\User;
use Pterodactyl\Models\Server;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Servers\SuspensionService;
use Pterodactyl\Models\Bagoulicense;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Services\Servers\ServerDeletionService;

class UserController extends Controller
{

        /**
     * @var \Pterodactyl\Services\Servers\SuspensionService
     */
    protected $suspensionservice;
        /**
     * @var \Pterodactyl\Services\Servers\ServerDeletionService
     */
    protected $deletionService;

    /**
     * UserController constructor.
     */
    public function __construct(
        AlertsMessageBag $alert,
        SuspensionService $suspensionservice,
        ServerDeletionService $deletionService,

    ) {
        $this->alert = $alert;
        $this->suspensionservice = $suspensionservice;
        $this->deletionService = $deletionService;

    }

    /**
     * Suspend/Unsuspend Cloud user servers
     *
     * @return \Illuminate\View\View
     */
    public function suspend(User $user)
    {
        $transaction = Bagoulicense::where('addon', 'cloudservers')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license =  $license->object();
        if ($code !== 200) {
            $this->alert->danger('Error with the license key')->flash();
            return redirect()->route('admin.bagoulicense.license', 'cloudservers');
        }  else {
        $action = 'suspend';
        if($user->suspended) {
            $action = 'unsuspend';
        }
        $clousservers = Server::where('cloud', 1)->where('cloud_owner', $user->uuid)->get();
        foreach($clousservers as $server) {
            $this->suspensionservice->toggle(Server::where('id', $server->id)->firstOrFail(), $action);
        }
        User::where('uuid', $user->uuid)->update(['suspended' => !$user->suspended]);
        $this->alert->success('User suspended sucessfully')->flash();

        return redirect()->route('admin.users.view', $user->id);
    }
}

 /**
     * Remove Cloud user
     *
     * @return \Illuminate\View\View
     */
    public function removecloud(User $user)
    {
        $transaction = Bagoulicense::where('addon', 'cloudservers')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license =  $license->object();
        if ($code !== 200) {
            $this->alert->danger('Error with the license key')->flash();
            return redirect()->route('admin.bagoulicense.license', 'cloudservers');
        }  else {

        $clousservers = Server::where('cloud', 1)->where('cloud_owner', $user->uuid)->get();
        foreach($clousservers as $server) {
            $this->deletionService->withForce(true)->handle(Server::where('id', $server->id)->firstOrFail());
        }
        User::where('uuid', $user->uuid)->update(['cloud' => !$user->cloud]);
        $this->alert->success('Cloud removed sucessfully')->flash();

        return redirect()->route('admin.users.view', $user->id);
    }
}
}

