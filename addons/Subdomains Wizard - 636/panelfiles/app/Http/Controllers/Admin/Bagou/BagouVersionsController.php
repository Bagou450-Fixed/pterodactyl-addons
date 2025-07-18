<?php

namespace Pterodactyl\Http\Controllers\Admin\Bagou;

use Illuminate\View\View;
use Pterodactyl\Models\Bagoulicense;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;

class BagouVersionsController extends Controller
{
    protected AlertsMessageBag $alert;

    public function __construct(
        AlertsMessageBag $alert
    ) {
        $this->alert = $alert;
    }
    /**
     * Display licensing system
     */
    public function index(): View
    {
        $addonslist = Http::get('https://api.bagou450.com/api/client/pterodactyl/addonsList')->json();
        $licenses = Bagoulicense::all();
        return view('admin.bagoucenter.versions.index', ['addonslist' => $addonslist, 'licenses' => $licenses]);
    }
    /**
     * Refresh Versions
     */
    public function refresh(): View
    {
        $licenses = Bagoulicense::all();
        foreach($licenses as $license) {
            $id = $license['license'];
            $version = Http::get("https://api.bagou450.com/api/client/pterodactyl/getVersion?id=$id");
            if($version->failed()) {
                $addonslist = Http::get('https://api.bagou450.com/api/client/pterodactyl/addonsList')->json();
                $this->alert->danger('Error!')->flash();
                return view('admin.bagoucenter.versions.index', ['addonslist' => $addonslist, 'licenses' => $licenses]);
            } else {
                Bagoulicense::where('license', '=', $id)->update(['version' => $version->json()['version']]);
            }
        }
        $addonslist = Http::get('https://api.bagou450.com/api/client/pterodactyl/addonsList')->json();
        $licenses = Bagoulicense::all();

        $this->alert->success('Versions updated sucessfully!')->flash();
        return view('admin.bagoucenter.versions.index', ['addonslist' => $addonslist, 'licenses' => $licenses]);
    }
}

