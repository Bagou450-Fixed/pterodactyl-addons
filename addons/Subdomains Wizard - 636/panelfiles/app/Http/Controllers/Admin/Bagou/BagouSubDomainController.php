<?php

namespace Pterodactyl\Http\Controllers\Admin\Bagou;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Models\Bagou\Subdomain\Domain;
use Pterodactyl\Models\Bagou\Subdomain\EggRecord;
use Pterodactyl\Models\Bagou\Subdomain\Record;
use Pterodactyl\Models\Bagoulicense;
use Pterodactyl\Models\Egg;

class BagouSubDomainController
{
    protected $alert;

    protected $apiUrl = 'https://api.bagou450.com/';
    public function __construct(
        AlertsMessageBag $alert,
    ) {
        $this->alert = $alert;
    }
    public function getDomains() {
        $addonslist = Http::get('https://api.bagou450.com/api/client/pterodactyl/addonsList')->json();

        $licenses = Bagoulicense::all();

        return view('admin.bagoucenter.settings.subdomain.index', ['addonslist' => $addonslist,
            'licenses' => $licenses, 'domains' => Domain::all()]);
    }
    public function getDomainEditForm(Domain $domain) {
        $addonslist = Http::get('https://api.bagou450.com/api/client/pterodactyl/addonsList')->json();
        $licenses = Bagoulicense::all();
        $license = Bagoulicense::where('addon', '=', 636)->firstOrFail()->license;
        $listType = Http::get($this->apiUrl . "api/client/pterodactyl/subdomains?id=$license")->json();
        if($listType['status'] === 'success') {
            return view('admin.bagoucenter.settings.subdomain.edit', ['domain' => $domain, 'addonslist' => $addonslist,
                'licenses' => $licenses, 'providers' => $listType['data']]);
        }
        $this->alert->error("Can't contact Bagou450 Api. Please contact our team at contact@bagou450.com")->flash();
        return $this->getDomains();

    }
    public function getDomainAddForm() {
        $license = Bagoulicense::where('addon', '=', 636)->firstOrFail()->license;
        $listType = Http::get($this->apiUrl . "api/client/pterodactyl/subdomains?id=$license")->json();
        $addonslist = Http::get('https://api.bagou450.com/api/client/pterodactyl/addonsList')->json();
        $licenses = Bagoulicense::all();

        if($listType['status'] === 'success') {

            return view('admin.bagoucenter.settings.subdomain.new', ['addonslist' => $addonslist,
                'licenses' => $licenses, 'providers' => $listType['data']]);
        }
        $this->alert->error("Can't contact Bagou450 Api. Please contact our team at contact@bagou450.com")->flash();
        return $this->getDomains();

    }
    public function removeDomain(Domain $domain) {
        try {
            foreach($domain->subdomains() as $subdomain) {
                $subdomain->delete();
            }
            $domain->delete();
            $this->alert->success('Domain removed successfully!')->flash();
            return response('', 204);
        } catch (\Exception $e) {
            return back()->withErrors('Error removing domain: ' . $e->getMessage());
        }
    }

    public function addDomain(Request $request) {
        try {
            $license = Bagoulicense::where('addon', '=', 636)->firstOrFail()->license;
            $listType = Http::get($this->apiUrl . "api/client/pterodactyl/subdomains?id=$license")->json();
            $domain = new Domain;
            $data = $request->all();
            $data['key'] = encrypt($data['key']);
            $data['secret'] = $data['secret'] ? encrypt($data['secret']) : '';
            $data['consumer'] = $data['consumer'] ? encrypt($data['consumer']) : '';
            $data['displayType'] = $listType['data'][$data['type']]['title'];
            $domain->fill($data);
            $domain->save();
            $this->alert->success('Domain added successfully!')->flash();
            return $this->getDomains();

        } catch (\Exception $e) {
            return back()->withErrors('Error adding domain: ' . $e->getMessage());
        }
    }

    public function editDomain(Domain $domain, Request $request) {
        try {
            $license = Bagoulicense::where('addon', '=', 636)->firstOrFail()->license;
            $listType = Http::get($this->apiUrl . "api/client/pterodactyl/subdomains?id=$license")->json();
            $data = $request->all();
            $data['key'] = encrypt($data['key']);
            $data['secret'] = $data['secret'] ? encrypt($data['secret']) : '';
            $data['consumer'] = $data['consumer'] ? encrypt($data['consumer']) : '';
            $data['displayType'] = $listType['data'][$data['type']]['title'];

            $domain->fill($data);
            $addonslist = Http::get('https://api.bagou450.com/api/client/pterodactyl/addonsList')->json();
            $licenses = Bagoulicense::all();
            $domain->save();

            $this->alert->success('Domain edited successfully!')->flash();
            return view('admin.bagoucenter.settings.subdomain.index', ['addonslist' => $addonslist,
                'licenses' => $licenses, 'domains' => Domain::all()]);
        } catch (\Exception $e) {
            return back()->withErrors('Error editing domain: ' . $e->getMessage());
        }
    }

    public function getRecordList() {
        $records = Record::paginate(25);
        $addonslist = Http::get('https://api.bagou450.com/api/client/pterodactyl/addonsList')->json();
        $licenses = Bagoulicense::all();
        return view('admin.bagoucenter.settings.subdomain.record.index', ['addonslist' => $addonslist,'licenses' => $licenses, 'domains' => Domain::all(), 'records' => $records]);
    }

    public function getRecordForm() {
        $domains = Domain::all();
        $eggs = Egg::all();
        $addonslist = Http::get('https://api.bagou450.com/api/client/pterodactyl/addonsList')->json();
        $licenses = Bagoulicense::all();
        return view('admin.bagoucenter.settings.subdomain.record.new', ['addonslist' => $addonslist,'licenses' => $licenses,'domains' => $domains, 'eggs' => $eggs]);
    }
    public function editRecordForm(Record $record) {
        $domains = Domain::all();
        $eggs = Egg::all();
        $addonslist = Http::get('https://api.bagou450.com/api/client/pterodactyl/addonsList')->json();
        $licenses = Bagoulicense::all();
        return view('admin.bagoucenter.settings.subdomain.record.edit', ['record' => $record, 'addonslist' => $addonslist,'licenses' => $licenses,'domains' => $domains, 'eggs' => $eggs]);
    }
    public function addRecord(Request $request) {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'domain_id' => 'required|integer',
            'egg_ids' => 'required|array',
            'egg_ids.*' => 'integer',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }
        $invalidEggs = Egg::whereIn('id', $request->egg_ids)->count();
        if ($invalidEggs !== count($request->egg_ids)) {
            return back()->withErrors("Invalid eggs provided !");
        }
        $addonslist = Http::get('https://api.bagou450.com/api/client/pterodactyl/addonsList')->json();
        $licenses = Bagoulicense::all();

        try {
            $record = new Record;
            $record->fill($request->all());
            $record->save();
            $eggRecords = [];
            foreach ($request->egg_ids as $eggId) {
                $eggRecords[] = ['record_id' => $record->id, 'egg_id' => $eggId];
            }
            EggRecord::insert($eggRecords);

            $this->alert->success('Record added successfully!')->flash();
            return $this->getRecordList();
        } catch (\Exception $e) {
            return back()->withErrors('Error adding record: ' . $e->getMessage());
        }
    }
    public function editRecord(Record $record, Request $request) {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255',
            'service' => 'required|string|max:255',
            'domain_id' => 'required|integer',
            'ttl' => 'required|integer',
            'egg_ids' => 'required|array',
            'egg_ids.*' => 'integer',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }
        $invalidEggs = Egg::whereIn('id', $request->egg_ids)->count();
        if ($invalidEggs !== count($request->egg_ids)) {
            return back()->withErrors("Invalid eggs provided !");
        }
        $addonslist = Http::get('https://api.bagou450.com/api/client/pterodactyl/addonsList')->json();
        $licenses = Bagoulicense::all();

        try {
            $record->fill($request->all());
            $record->save();
            EggRecord::where('record_id',$record->id)->delete();
            $eggRecords = [];
            foreach ($request->egg_ids as $eggId) {
                $eggRecords[] = ['record_id' => $record->id, 'egg_id' => $eggId];
            }
            EggRecord::insert($eggRecords);
            $this->alert->success('Record edited successfully!')->flash();
            return $this->getRecordList();
        } catch (\Exception $e) {
            return back()->withErrors('Error editing record: ' . $e->getMessage());
        }
    }

    public function removeRecord(Record $record) {
        try {
            foreach($record->eggRecord as $egg) {
                $egg->delete();
            }
            $record->delete();
            $this->alert->success('Record removed successfully!')->flash();
            return response('', 204);
        } catch (\Exception $e) {
            return back()->withErrors('Error removing record: ' . $e->getMessage());
        }
    }


}
