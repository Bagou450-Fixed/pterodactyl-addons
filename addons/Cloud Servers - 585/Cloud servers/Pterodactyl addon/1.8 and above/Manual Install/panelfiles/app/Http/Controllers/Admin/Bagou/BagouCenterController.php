<?php

namespace Pterodactyl\Http\Controllers\Admin\Bagou;

use Illuminate\View\View;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Illuminate\Support\Facades\Http;

class BagouCenterController extends Controller
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
        $apistatus = Http::get('https://api.bagou450.com/api/client/pterodactyl/checkOnline')->object();
        $cdnstatus = Http::get('https://cdn.bagou450.com/status')->object();

        return view('admin.bagoucenter.index', ['apistatus' => $apistatus, 'cdnstatus' => $cdnstatus]);
    }
    public function settings(): View
    {
        return view('admin.bagoucenter.support.index');
    }
}

