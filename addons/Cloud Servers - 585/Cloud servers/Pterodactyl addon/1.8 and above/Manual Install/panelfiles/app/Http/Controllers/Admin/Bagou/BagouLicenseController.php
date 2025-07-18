<?php

namespace Pterodactyl\Http\Controllers\Admin\Bagou;

use Illuminate\View\View;
use Pterodactyl\Models\Bagoulicense;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class BagouLicenseController extends Controller
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
        return view('admin.bagoucenter.license.index', ['addonslist' => $addonslist, 'licenses' => $licenses]);
    }

    /**
     * Display license of the addon
     *
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function license(string $addon): View
    {
        $dbaddon = Bagoulicense::where('addon', $addon)->first();
        $addonslist = Http::get('https://api.bagou450.com/api/client/pterodactyl/addonsList')->json();
        $licenses = Bagoulicense::all();
        return view('admin.bagoucenter.license.license', [
            'addon' => $addon,
            'enabled' => ($dbaddon)? $dbaddon['enabled'] : 0,
            'usage' => ($dbaddon) ? $dbaddon['usage'] : null ,
            'maxusage' => ($dbaddon) ? $dbaddon['maxusage'] : null,
            'license' => ($dbaddon) ? $dbaddon['license']: 'Your license',
            'addonslist' => $addonslist,
            'licenses' => $licenses
        ]);
    }

    /**
     * Set a license
     *
     * @throws \Throwable
     */
    public function setlicense(Request $request, $addon): RedirectResponse
    {   
        $license = Http::accept('application/json')->post("https://api.bagou450.com/api/client/pterodactyl/license", [
            'id' => $request->license,
            'selectaddon' => $addon
        ])->object();
        if($license->message == 'Transaction is not valid.') {
            $this->alert->danger('License not found please contact me on discord')->flash();
            return redirect()->route('admin.bagoucenter.license.addon', $addon);
        } else if($license->message == 'Too many license usage please contact me on discord') {
            $this->alert->danger('License are already used on too many panel please contact me on discord')->flash();
            return redirect()->route('admin.bagoucenter.license.addon', $addon);
        } else if ($license->message == 'User blacklisted') {
            if(Bagoulicense::where('addon', $addon)->exists()) {

                Bagoulicense::where('addon', $addon)->update(['license' => $request->license, 'usage' => 1, 'maxusage' => 1, 'enabled' => false]);
               } else {
                Bagoulicense::create(['addon' => $addon, 'license' => $request->license, 'usage' => 1, 'maxusage' => 1, 'enabled' => false]);
               }
            $this->alert->danger('You are BLACKLISTED (probably because of a paypal dispute)')->flash();
            return redirect()->route('admin.bagoucenter.license.addon', $addon);
         } else if($license->message == 'Not the good addon') {
            $this->alert->danger('This license is not for this addon!')->flash();
            return redirect()->route('admin.bagoucenter.license.addon', $addon, );
        } else if($license->message == 'done' && $license->name == $addon && !$license->blacklisted) {
            if(Bagoulicense::where('addon', $addon)->exists()) {

                Bagoulicense::where('addon', $addon)->update(['license' => $request->license, 'usage' => $license->usage, 'maxusage' => $license->maxusage, 'enabled' => true]);
               } else {
                Bagoulicense::create(['addon' => $addon, 'license' => $request->license, 'usage' => $license->usage, 'maxusage' => $license->maxusage, 'enabled' => true]);
               }
        
               $this->alert->success('License updated sucessfully!')->flash();
               return redirect()->route('admin.bagoucenter.license.addon', $addon);
        }
        $this->alert->danger('Error!')->flash();
        return redirect()->route('admin.bagoucenter.license.addon', $addon);
    }

 /**
     * Rmove a license
     *
     * @throws \Throwable
     */
    public function removelicense($addon): RedirectResponse
    {   
            if(Bagoulicense::where('addon', $addon)->exists()) {
                $transaction = Bagoulicense::where('addon', $addon)->first();
                if(!$transaction) {
                    $this->alert->danger('No license found.')->flash();
                    return redirect()->route('admin.bagoucenter.license.addon', $addon);
                }
                $transaction = $transaction['license'];
                $license = Http::delete("https://api.bagou450.com/api/client/pterodactyl/license?id=$transaction")->object();
                Bagoulicense::where('addon', $addon)->delete();
                $this->alert->success('License removed sucessfully')->flash();
                return redirect()->route('admin.bagoucenter.license.addon', $addon);        
               } else {
                $this->alert->danger('No license found.')->flash();
                return redirect()->route('admin.bagoucenter.license.addon', $addon);     
            }

    }
}

