<?php

namespace Pterodactyl\Http\Controllers\Admin\Bagou;

use Illuminate\View\View;
use Pterodactyl\Models\Bagoulicense;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;

class BagouSettingsController extends Controller
{
    protected $alert;

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
        return view('admin.bagoucenter.settings.index', [            'addonslist' => $addonslist,
        'licenses' => $licenses]);
    }

      /**
     * Display licensing system
     */
    public function addon(string $addon): View
    {
        $addonslist = Http::get('https://api.bagou450.com/api/client/pterodactyl/addonsList')->json();
        $licenses = Bagoulicense::all();
        return view($addon['tabroute'], ['addonslist' => $addonslist,
        'licenses' => $licenses]);
    }
}

