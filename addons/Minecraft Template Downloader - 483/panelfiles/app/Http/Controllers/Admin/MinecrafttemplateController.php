<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class MinecrafttemplateController extends Controller
{
    /**
     * @var \Prologue\Alerts\AlertsMessageBag
     */
    protected $alert;

    /**
     * @var \Pterodactyl\Contracts\Repository\SettingsRepositoryInterface
     */
    private $settings;

    /**
     * SubDomainController constructor.
     * @param AlertsMessageBag $alert
     * @param SettingsRepositoryInterface $settings
     */
    public function __construct(AlertsMessageBag $alert, SettingsRepositoryInterface $settings)
    {
        $this->alert = $alert;
        $this->settings = $settings;
    }

    /**
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function index()
    {
        $minecrafttemplate = DB::table('minecrafttemplate')->get();

        $minecrafttemplate = json_decode(json_encode($minecrafttemplate), true);

        return view('admin.minecrafttemplate.index', [
            'minecrafttemplate' => $minecrafttemplate,
        ]);
    }

    /**
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function new()
    {

        $eggs = DB::table('eggs')->get();
        $nests = DB::table('nests')->get();

        return view('admin.minecrafttemplate.new', ['eggs' => $eggs, 'nests' => $nests]);
    }

    /**
     * @param Request $request
     * @return RedirectResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function create(Request $request)
    {
        $this->validate($request, [
            'name' => 'required|min:1|max:100',
            'baseurl' => 'required',
            'logourl' => 'nullable',
            'removeall' => 'required|boolean'
        ]);
        $name = $request->input('name');
        $baseurl = $request->input('baseurl');
        $logourl = $request->input('logourl');
        $removeall = $request->input('removeall');
        $zip = $request->input('zip');
        $smalldescription = $request->input('smalldescription');
        if (!$logourl) {
            $logourl = '';
        };
        DB::table('minecrafttemplate')->insert([
            'name' => $name,
            'baseurl' => $baseurl,
            'logourl' => $logourl,
            'removeall' => $removeall,
            'zip' => $zip,
            'smalldescription' => $smalldescription
        ]);

        $this->alert->success('Template created succesfully')->flash();
        return redirect()->route('admin.minecrafttemplate');
    }
    public function delete(Request $request)
    {
        $id = (int) $request->input('id', '');

        $minecrafttemplate = DB::table('minecrafttemplate')->where('id', '=', $id)->get();
        if (count($minecrafttemplate) < 1) {
            return response()->json(['success' => false, 'error' =>  'Template not found']);
        }

        DB::table('minecrafttemplate')->where('id', '=', $id)->delete();


        return response()->json(['success' => true]);
    }
} 
