<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Pterodactyl\Models\Egg;
use Pterodactyl\Models\MinecraftModpacks;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\ServerVariable;
use Pterodactyl\Repositories\Eloquent\ServerRepository;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Models\Bagoulicense;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Pterodactyl\Models\EggVariable;
class VersionsController extends ClientApiController
{
    /**
     * @var \Pterodactyl\Repositories\Eloquent\ServerRepository
     */
    private $repository;

    /**
     * ClientController constructor.
     */
    public function __construct(
        ServerRepository $repository,
        DaemonFileRepository $fileRepository
    ) {
        parent::__construct();

        $this->repository = $repository;
        $this->fileRepository = $fileRepository;
    }
    public function listversion(Request $request)
    {
        $license = Bagoulicense::where("addon", "296")->first();
        if (!$license) {
            return new BadRequestHttpException(
                "No license for this addons please setup the license trough admin tab."
            );
        }
        $license = $license["license"];
        $versionsType = $request->versionsType;
        $versions = [];
        $url = $_SERVER["SERVER_NAME"];
        if($versionsType === 'modpacks' && $request->modpacktype === 'others') {
            $modpacks = MinecraftModpacks::get();
            $versions = array('message' => 'Good', 'data' => $modpacks);
        } else {
            $versions = Http::accept("application/json")
                ->get(
                    "https://api.bagou450.com/api/client/pterodactyl/mcversions?id=$license&stype=$versionsType&url=$url&page=$request->page&modpacktype=$request->modpacktype"
                )
                ->json();
        }

        if ($versions['message'] !== "Good") {
            return ["status" => "error", "response" => []];
        }
        return $versions;
    }
    public function installversion(Server $server, Request $request)
    {
        $license = Bagoulicense::where("addon", "296")->first();
        if (!$license) {
            return new BadRequestHttpException(
                "No license for this addons please setup the license trough admin tab."
            );
        }

        $license = $license["license"];
        $version = $request->minecraftVersions["version"];
        ini_set("memory_limit", "512M");
        $urlsize = "";

        if ($request->type == "3") {
            $url = $request->minecraftVersions["Url"];
            $url = Http::get(
                "https://api.bagou450.com/api/client/pterodactyl/mcversions/download?id=$license&type=$request->type&version=$version&stype=$request->stype&url=$url&zip=no"
            )->json();
        } else {
            if (
                $request->stype == "fabric" ||
                $request->stype == "forge" ||
                $request->stype == "mohist" ||
                $request->stype == "modpacks"
            ) {
                if(isset($request->minecraftVersions["url"])) {
                    $url = array('message' => 'Good', 'data' => $request->minecraftVersions["url"], 'size' => get_headers($request->minecraftVersions["url"], true)['Content-Length']);
                } else {
                    $url = Http::get(
                        "https://api.bagou450.com/api/client/pterodactyl/mcversions/download?id=$license&type=$request->type&version=" .
                        rawurlencode($version) .
                        "&stype=" .
                        rawurlencode($request->stype) .
                        "&url=a&zip=yes"
                    )->json();
                    Server::where("id", $server->id)->update([
                        "startup" =>
                            'java -Xms128M -Xmx{{SERVER_MEMORY}}M -Dterminal.jline=false -Dterminal.ansi=true $( [ ! -f unix_args.txt ] && printf %s "-jar {{SERVER_JARFILE}}" || printf %s "@unix_args.txt" )',
                    ]);
                }
            } else {
                $url = Http::get(
                    "https://api.bagou450.com/api/client/pterodactyl/mcversions/download?id=$license&type=$request->type&version=$version&stype=$request->stype&url=a&zip=no"
                )->json();
            }
        }
        if ($url['message'] !== "Good") {
            return ["status" => "error", "response" => []];
        }
        $this->fileRepository->setServer($server)->pull($url['data'], "/");

        $this->repository->update($server->id, [
            "mcversion" => "$request->stype $version",
        ]);
        Activity::event("server:versions.install")
            ->property("name", $request->name)
            ->log();
        if($request->stype === 'bungeecord' || $request->stype === 'velocity') {

            $eggId = Egg::where('name', 'Bungeecord')->firstOrFail()->id;
            Server::where('id', '=', $server->id)->update(['egg_id' => $eggId]);
            $eggVariableId = EggVariable::where('name', '=', 'Bungeecord Jar File')->where('egg_id', '=', $eggId)->firstOrFail()->id;
            ServerVariable::where('server_id', '=', $server->id)->where('id', '=', $eggVariableId)->update(['variable_value' => 'server.jar']);
        } else {
            $eggId = Egg::where('name', 'Paper')->firstOrFail()->id;
            Server::where('id', '=', $server->id)->update(['egg_id' => $eggId]);
        }
        return $url['size'];
    }
    public function getversionsize(Server $server, Request $request)
    {
        $contents = $this->fileRepository
            ->setServer($server)
            ->getDirectory($request->get("directory") ?? "/");
        $results = array_filter($contents, function ($content) {
            global $request;
            return $content["name"] == "$request->filename";
        });

        $size = array_shift($results)["size"];

        return $size;
    }
}

