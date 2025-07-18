<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers\Bagou\Minecraft;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Permission;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Pterodactyl\Models\Filters\MultiFieldServerFilter;
use Pterodactyl\Repositories\Eloquent\ServerRepository;
use Pterodactyl\Transformers\Api\Client\ServerTransformer;
use Pterodactyl\Http\Requests\Api\Client\GetServersRequest;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Models\Bagoulicense;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Pterodactyl\Facades\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Pterodactyl\Services\Eggs\Sharing\EggUrlBagouImporterService;
use Pterodactyl\Repositories\Eloquent\ServerVariableRepository;
use Pterodactyl\Services\Servers\ReinstallServerService;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ModPacksController extends ClientApiController
{
        /**
     * @var \Pterodactyl\Repositories\Wings\DaemonFileRepository
     */
    private $fileRepository;
        /**
     * @var \Pterodactyl\Repositories\Eloquent\ServerVariableRepository
     */
    private $variablesRepository;
  /**
     * @var \Pterodactyl\Repositories\Wings\EggUrlImporterService
     */
    private $eggImporter;
    /**
     * @var \Pterodactyl\Repositories\Eloquent\ServerRepository
     */
    private $repository;
    /**
     * @var \Pterodactyl\Services\Servers\ReinstallServerService
     */
    private $reinstallServerService;
    /**
     * FileController constructor.
     */
    public function __construct(
        DaemonFileRepository $fileRepository,
        ServerRepository $repository,
        EggUrlBagouImporterService $eggImporter,
        ServerVariableRepository $variablesRepository,
        ReinstallServerService $reinstallServerService
    ) {
        parent::__construct();

        $this->repository = $repository;
        $this->fileRepository = $fileRepository;
        $this->eggImporter = $eggImporter;
        $this->variablesRepository = $variablesRepository;
        $this->reinstallServerService = $reinstallServerService;
    }
    /**
         * @throws DisplayException
         */
        public function getModPacks(Request $request)
        {
            $license = Bagoulicense::where('addon', '327')->first();
            if(!$license) {
                return new BadRequestHttpException('No license for this addons please setup the license trough admin tab.');
            }
            $license = $license['license'];

            return Http::accept('application/json')->get('https://api.bagou450.com/api/client/pterodactyl/modpacks/', ['page' => $request->page, 'search' => $request->search, 'id' => $license, 'type' => $request->type, 'game_versions' => $request->version, 'loaders' => $request->loader]);

        }
        public function getMcVersions(Request $request)
        {
            $license = Bagoulicense::where('addon', '327')->first();
            if(!$license) {
                return new BadRequestHttpException('No license for this addons please setup the license trough admin tab.');
            }
            $license = $license['license'];
            return Http::accept('application/json')->get('https://api.bagou450.com/api/client/pterodactyl/modpacks/getMcVersions', ['id' => $license]);
        }


        public function versions(Request $request)
        {

            $license = Bagoulicense::where('addon', '327')->first();
            if(!$license) {
                return new BadRequestHttpException('No license for this addons please setup the license trough admin tab.');
            }
            $license = $license['license'];

            return Http::accept('application/json')->get('https://api.bagou450.com/api/client/pterodactyl/mods/versions', ['modId' => $request->modId, 'page' => $request->page, 'id' => $license, 'type' => $request->type]);
        }

        public function getModpacksDescription(Request $request)
        {
            $license = Bagoulicense::where('addon', '327')->first();
            if(!$license) {
                return new BadRequestHttpException('No license for this addons please setup the license trough admin tab.');
            }
            $license = $license['license'];

            return Http::accept('application/json')->get('https://api.bagou450.com/api/client/pterodactyl/modpacks/getMcModpacksDescription', ['modpackId' => $request->modpackId, 'id' => $license, 'type' => $request->type]);
        }


        public function install(Request $request, Server $server)
        {
            $license = Bagoulicense::where("addon", "327")->first();
            if (!$license) {
                return new BadRequestHttpException(
                    "No license for this addons please setup the license trough admin tab."
                );
            }

            $license = $license["license"];
            if($request->type === 'voidswrath') {
                if($request->step === 0) {
                    $version = $request->modpack["versions"];
                    ini_set("memory_limit", "512M");
                    $urlsize = "";

                    $url = $request->modpack["downloadlink"];

                    $url = Http::get(
                        "https://api.bagou450.com/api/client/pterodactyl/modpacks/download?id=$license&data=$url&type=voidswrath"
                    )->json();
                    if ($url['message'] !== "Good") {
                        return ["status" => "error", "response" => []];
                    }
                    $this->fileRepository->setServer($server)->pull($url['data'], "/");

                    $this->repository->update($server->id, [
                        "mcversion" => $request->modpack['name'],
                        "oldegg" => $server->egg_id
                    ]);
                    Activity::event("server:versions.install")
                        ->property("name", $request->modpack['name'])
                        ->log();
                    Server::where("id", $server->id)->update([
                        "startup" =>
                            'java -Xms128M -Xmx{{SERVER_MEMORY}}M -Dterminal.jline=false -Dterminal.ansi=true $( [ ! -f unix_args.txt ] && printf %s "-jar server.jar" || printf %s "@unix_args.txt" )',
                    ]);
                    return $url['size'];
                } else if ($request->step === 1) {
                    $contents = $this->fileRepository
                    ->setServer($server)
                    ->getDirectory($request->get('directory') ?? '/');
                    foreach($contents as $file) {
                        if(str_starts_with($file['name'], 'forge') || str_starts_with($file['name'], 'fabric')) {
                            $this->fileRepository
                            ->setServer($server)
                            ->renameFiles('/', array(array('from' => $file['name'], 'to' => 'server.jar')));
                        }
                        if(str_ends_with($file['name'], 'bat') || str_ends_with($file['name'], 'sh')) {
                            $this->fileRepository->setServer($server)->deleteFiles(
                                '/',
                                [$file['name']]
                            );
                        }
                    }
                    return new JsonResponse([], Response::HTTP_NO_CONTENT);
                }

            } else if ($request->type === 'ftb') {
                $nestid = $server->nest_id;
                $egg = $this->eggImporter->handle('ftb', $nestid);
                
                $this->repository->update($server->id, [
                    "mcversion" => $request->modpack['name'],
                    "oldegg" => $server->egg_id,
                    "egg_id" => $egg->id
                ]);
                $server = Server::where('id', '=', $server->id)->firstOrFail();
                $variable = $server->variables()->where('env_variable', 'MODPACK_ID')->first();
                $id = $request->modpack['id'];
                $this->variablesRepository->updateOrCreate([
                    'server_id' => $server->id,
                    'variable_id' => $variable->id,
                ], [
                    'variable_value' => "$id",
                ]);
                $variable = $server->variables()->where('env_variable', 'MODPACK_VERSION')->first();
                $id = $request->modpack['versionid'];
                $this->variablesRepository->updateOrCreate([
                    'server_id' => $server->id,
                    'variable_id' => $variable->id,
                ], [
                    'variable_value' => "$id",
                ]);
                $this->reinstallServerService->handle($server);

                Activity::event("server:versions.install")
                ->property("name", $request->modpack['name'])
                ->log();


            } else if ($request->type === 'technicpack') {
                $nestid = $server->nest_id;
                $egg = $this->eggImporter->handle('technicpack', $nestid);
                $this->repository->update($server->id, [
                    "mcversion" => $request->modpack['name'],
                    "oldegg" => $server->egg_id,
                    "egg_id" => $egg->id
                ]);
                $server = Server::where('id', '=', $server->id)->firstOrFail();
                $variable = $server->variables()->where('env_variable', 'DOWNLOAD_URL')->first();
                $id = $request->modpack['downloadlink'];
                $this->variablesRepository->updateOrCreate([
                    'server_id' => $server->id,
                    'variable_id' => $variable->id,
                ], [
                    'variable_value' => "$id",
                ]);

                $this->reinstallServerService->handle($server);

                Activity::event("server:versions.install")
                ->property("name", $request->modpack['name'])
                ->log();


            } else if ($request->type === 'curseforge') {
                $nestid = $server->nest_id;
                $egg = $this->eggImporter->handle('curseforge', $nestid);
                $this->repository->update($server->id, [
                    "mcversion" => $request->modpack['name'],
                    "oldegg" => $server->egg_id,
                    "egg_id" => $egg->id
                ]);
                $server = Server::where('id', '=', $server->id)->firstOrFail();
                $variable = $server->variables()->where('env_variable', 'DOWNLOAD_URL')->first();
                $variableversion = $server->variables()->where('env_variable', 'MCVERSION')->first();
                $variableloader = $server->variables()->where('env_variable', 'LOADER')->first();

                $modpackid = $request->modpack['id'];
                $downloaddata = Http::get(
                    "https://api.bagou450.com/api/client/pterodactyl/modpacks/download?id=$license&type=curseforge&modpackid=$modpackid"
                )->object();
                if($downloaddata->message == 'Error') {
                    throw new NotFoundHttpException();
                }
                $this->variablesRepository->updateOrCreate([
                    'server_id' => $server->id,
                    'variable_id' => $variable->id,
                ], [
                    'variable_value' => "$downloaddata->data",
                ]);
                $this->variablesRepository->updateOrCreate([
                    'server_id' => $server->id,
                    'variable_id' => $variableversion->id,
                ], [
                    'variable_value' => "$downloaddata->mcversion",
                ]);
                $this->variablesRepository->updateOrCreate([
                    'server_id' => $server->id,
                    'variable_id' => $variableloader->id,
                ], [
                    'variable_value' => "$downloaddata->loader",
                ]);
                $this->reinstallServerService->handle($server);

                Activity::event("server:versions.install")
                ->property("name", $request->modpack['name'])
                ->log();


            } else if ($request->type === 'modrinth') {
                $nestid = $server->nest_id;
                $egg = $this->eggImporter->handle('CurseForge', $nestid);
                $this->repository->update($server->id, [
                    "mcversion" => $request->modpack['name'],
                    "oldegg" => $server->egg_id,
                    "egg_id" => $egg->id
                ]);
                $server = Server::where('id', '=', $server->id)->firstOrFail();
                $variable = $server->variables()->where('env_variable', 'DOWNLOAD_URL')->first();
                $variableversion = $server->variables()->where('env_variable', 'MCVERSION')->first();
                $variableloader = $server->variables()->where('env_variable', 'LOADER')->first();

                $modpackid = $request->modpack['id'];
                $downloaddata = Http::get(
                    "https://api.bagou450.com/api/client/pterodactyl/modpacks/download?id=$license&type=modrinth&modpackid=$modpackid"
                )->object();
                if($downloaddata->message == 'Error') {
                    dd($downloaddata);
                    throw new NotFoundHttpException();
                }
                $this->variablesRepository->updateOrCreate([
                    'server_id' => $server->id,
                    'variable_id' => $variable->id,
                ], [
                    'variable_value' => "$downloaddata->data",
                ]);
                $this->variablesRepository->updateOrCreate([
                    'server_id' => $server->id,
                    'variable_id' => $variableversion->id,
                ], [
                    'variable_value' => "$downloaddata->mcversion",
                ]);
                $this->variablesRepository->updateOrCreate([
                    'server_id' => $server->id,
                    'variable_id' => $variableloader->id,
                ], [
                    'variable_value' => "$downloaddata->loader",
                ]);
                $this->reinstallServerService->handle($server);

                Activity::event("server:versions.install")
                ->property("name", $request->modpack['name'])
                ->log();


            }

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

