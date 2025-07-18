<?php

namespace Pterodactyl\Http\Controllers\Admin\Bagou;

use Illuminate\Support\Facades\Http;
use Illuminate\View\View;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Pterodactyl\Models\Bagoulicense;
use Pterodactyl\Models\MinecraftModpacks;

class BagouMcVersionsController extends Controller
{
    protected $alert;

    public function __construct(
        AlertsMessageBag $alert
    ) {
        $this->alert = $alert;
    }
    /**
     * Display version 
     */
    public function index(): View
    {
        $addonslist = Http::get('https://api.bagou450.com/api/client/pterodactyl/addonsList')->json();
        $licenses = Bagoulicense::all();
        $modpacks = MinecraftModpacks::get();
        return view('admin.bagoucenter.settings.mcversions.index', ['licenses' => $licenses, 'addonslist' => $addonslist, 'modpacks' => $modpacks]);
    }
    /**
     * Add Versions
     */
    public function add(Request $request): View
    {
        if(!ends_with($request->url, ['zip', 'tar.gz', 'tar.xz'])) {
            $this->alert->danger('The url is invalid (is not a direct link to a zip,tar.gz or tar.xz!')->flash();
            return $this->index();
        }
        MinecraftModpacks::create(['name' => $request->name, 'version' => $request->version, 'mcversion' => $request->mcversion, 'url' => $request->url , 'icon' => $request->icon]);
        $this->alert->success('Modpack added sucessfully!')->flash();
        return $this->index();

    }
     /**
     * Delete Versions
     */
    public function delete(string $id): View
    {
        MinecraftModpacks::where('id', '=', $id)->delete();
        $this->alert->success('Modpack removed sucessfully!')->flash();
        return $this->index();

    }
}

