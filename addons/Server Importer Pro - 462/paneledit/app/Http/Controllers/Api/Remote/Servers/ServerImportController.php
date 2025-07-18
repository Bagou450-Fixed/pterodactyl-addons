<?php

namespace Pterodactyl\Http\Controllers\Api\Remote\Servers;

use Illuminate\Http\Request;
use Pterodactyl\Models\Server;
use Pterodactyl\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class ServerImportController extends Controller
{

    /**
     * Returns Import information for a server.
     *
     * @throws \Pterodactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function index(Request $request, string $uuid)
    {
        DB::table('servers')->where('uuid', '=', $uuid)->update([
            'status' => NULL,
        ]);
        
    }
        
}
