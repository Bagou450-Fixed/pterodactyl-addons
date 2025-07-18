<?php
/**
 * Pterodactyl - Panel
 * Copyright (c) 2015 - 2017 Dane Everitt <dane@daneeveritt.com>.
 *
 * This software is licensed under the terms of the MIT license.
 * https://opensource.org/licenses/MIT
 */

namespace Pterodactyl\Http\Controllers\Admin\Cloud;

use Javascript;
use Illuminate\View\View;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Node;
use Pterodactyl\Models\Bagoulicense;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Models\Location;

use Pterodactyl\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Services\Eggs\EggUpdateService;
use Pterodactyl\Services\Eggs\EggCreationService;
use Pterodactyl\Services\Eggs\EggDeletionService;
use Pterodactyl\Http\Requests\Admin\Egg\EggFormRequest;
use Pterodactyl\Contracts\Repository\EggRepositoryInterface;
use Pterodactyl\Contracts\Repository\NestRepositoryInterface;
use Illuminate\Http\Request;

class CloudController extends Controller
{
    protected $alert;

    protected $creationService;

    protected $deletionService;

    protected $nestRepository;

    protected $repository;

    protected $updateService;

    public function __construct(
        AlertsMessageBag $alert,
        EggCreationService $creationService,
        EggDeletionService $deletionService,
        EggRepositoryInterface $repository,
        EggUpdateService $updateService,
        NestRepositoryInterface $nestRepository
    ) {
        $this->alert = $alert;
        $this->creationService = $creationService;
        $this->deletionService = $deletionService;
        $this->nestRepository = $nestRepository;
        $this->repository = $repository;
        $this->updateService = $updateService;
    }

    /**
     * Handle a request to display the Cloud servers page.
     *
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function index()
    {
        $eggs = Egg::get();
        $cloudservers = Server::where('cloud', true)->get();
        $cloudnodes = Node::where('cloud', true)->get();
        $nodeselection = Setting::where('key', 'cloud_nodeselect')->first();
        $locationselection = Setting::where('key', 'cloud_locationselect')->first();
        $transaction = Bagoulicense::where('addon', 'cloudservers')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license = $license->object();
        if ($code !== 200) {
            $this->alert->danger('Error with the license key')->flash();
            return redirect()->route('admin.bagoulicense.license', 'cloudservers');
        } else {
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
            $cloudlocations = Location::where('cloud', true)->get();

            return view('admin.cloud.index', ['eggs' => $eggs, 'cloudservers' => $cloudservers, 'cloudnodes' => $cloudnodes,'cloudlocations' => $cloudlocations, 'nodeselection' => $nodeselection, 'locationselection' => $locationselection]);
        }
        
    }

      /**
     * Handle a request to display the Egg creation page.
     *
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function savesettings(Request $request, Server $server)
    {
        $transaction = Bagoulicense::where('addon', 'cloudservers')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");;
        $code = $license->status();
        $license =  $license->object();
        if ($code !== 200) {
            $this->alert->danger('Error with the license key')->flash();
            return redirect()->route('admin.bagoulicense.license', 'cloudservers');
        } else {
        $eggs = Egg::get();
        $cloudservers = Server::where('cloud', true)->get();
        if(!$request->add_eggs) {
            $this->alert->danger(
                'You need to have a least of one egg'
            )->flash();
            return view('admin.cloud.index', ['eggs' => $eggs, 'cloudservers' => $cloudservers,]);
        }
        Egg::where('cloud', true)->update(['cloud' => false]);
        foreach($request->add_eggs as $egg) {
            Egg::where('id', $egg)->update(['cloud' => true]);
        }
        $eggs = Egg::get();
        $locationselection = $request->locationselection;
        $nodeselection = $request->nodeselection;
        if($request->locationselection !== 'true' || $request->nodeselection === 'false') {
            if(Setting::where('key', 'cloud_nodeselect')->exists()) {
                Setting::where('key', 'cloud_nodeselect')->update(['value' => $request->nodeselection]);
            } else {
                $setting = new Setting;
                $setting->key = 'cloud_nodeselect';
                $setting->value = $request->nodeselection;
                $setting->save();
            }
        } else {
            $nodeselection = 'false';
            if(Setting::where('key', 'cloud_nodeselect')->exists()) {
                Setting::where('key', 'cloud_nodeselect')->update(['value' => 'false']);
            } else {
                $setting = new Setting;
                $setting->key = 'cloud_nodeselect';
                $setting->value = 'false';
                $setting->save();
            }
        }
        if($request->nodeselection !== 'true' || $request->locationselection === 'false') {

        if(Setting::where('key', 'cloud_locationselect')->exists()) {
            Setting::where('key', 'cloud_locationselect')->update(['value' => $request->locationselection]);
        } else {
            $setting = new Setting;
            $setting->key = 'cloud_locationselect';
            $setting->value = $request->locationselection;
            $setting->save();
        }
    } else {
        $locationselection = 'false';
        if(Setting::where('key', 'cloud_locationselect')->exists()) {
            Setting::where('key', 'cloud_locationselect')->update(['value' => 'false']);
        } else {
            $setting = new Setting;
            $setting->key = 'cloud_locationselect';
            $setting->value = 'false';
            $setting->save();
        }
    }
        $cloudnodes = Node::where('cloud', true)->get();
        $cloudlocations = Location::where('cloud', true)->get();

        $this->alert->success(trans('Settings updated sucessfully'))->flash();
        return view('admin.cloud.index', ['eggs' => $eggs, 'cloudservers' => $cloudservers, 'cloudnodes' => $cloudnodes, 'cloudlocations' => $cloudlocations, 'nodeselection' => $nodeselection, 'locationselection' => $locationselection]);
    }
    }
}

