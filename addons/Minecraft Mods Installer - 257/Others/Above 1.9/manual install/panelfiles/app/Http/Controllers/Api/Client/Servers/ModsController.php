<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Models\Server;
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

class ModsController extends ClientApiController
{
        /**
     * @var \Pterodactyl\Repositories\Wings\DaemonFileRepository
     */
    private $fileRepository;


    /**
     * FileController constructor.
     */
    public function __construct(
        DaemonFileRepository $fileRepository
    ) {
        parent::__construct();

        $this->fileRepository = $fileRepository;
    }
    /**
         * @throws DisplayException
         */
        public function curse(Request $request)
        {
            $license = Bagoulicense::where('addon', '257')->first();
            if(!$license) {
                return new BadRequestHttpException('No license for this addons please setup the license trough admin tab.');
            }
            $license = $license['license'];

            return Http::accept('application/json')->get('https://api.bagou450.com/api/client/pterodactyl/mods', ['page' => $request->page, 'search' => $request->search, 'id' => $license, 'type' => $request->type, 'game_versions' => $request->version, 'loaders' => $request->loader]);

        }

        public function versions(Request $request)
        {
            $license = Bagoulicense::where('addon', '257')->first();
            if(!$license) {
                return new BadRequestHttpException('No license for this addons please setup the license trough admin tab.');
            }
            $license = $license['license'];
            
            return Http::accept('application/json')->get('https://api.bagou450.com/api/client/pterodactyl/mods/versions', ['modId' => $request->modId, 'page' => $request->page, 'id' => $license, 'type' => $request->type]);
        }

        public function description(Request $request)
        {
            $license = Bagoulicense::where('addon', '257')->first();
            if(!$license) {
                return new BadRequestHttpException('No license for this addons please setup the license trough admin tab.');
            }
            $license = $license['license'];

            return Http::accept('application/json')->get('https://api.bagou450.com/api/client/pterodactyl/mods/description', ['modId' => $request->modId, 'id' => $license, 'type' => $request->type]);
        }

        public function mcversions(Request $request)
        {
            $license = Bagoulicense::where('addon', '257')->first();
            if(!$license) {
                return new BadRequestHttpException('No license for this addons please setup the license trough admin tab.');
            }
            $license = $license['license'];

            return Http::accept('application/json')->get('https://api.bagou450.com/api/client/pterodactyl/mods/getMcVersions', ['id' => $license]);
        }
        public function install(Request $request, Server $server)
        {
            $url = str_replace("edge", "mediafilez", $request->url);
            $polymart = str_contains($request->url, 'cdn.modrinth.com');
            if(!$polymart) {
                $file = basename(parse_url($url, PHP_URL_PATH));
                $this->fileRepository->setServer($server)->putContent("mods/$file", file_get_contents(dirname($url) . "/" . rawurlencode($file)));
            } else {
                $url = str_replace("cdn", "cdn-raw", $url);

                $file = basename(parse_url($url, PHP_URL_PATH));
                $this->fileRepository->setServer($server)->putContent("mods/$file", file_get_contents($url));
            }

    
            Activity::event('server:file.pull')
                ->property('directory', $request->input('directory'))
                ->property('url', $request->input('url'))
                ->log();
    
            return new JsonResponse([], Response::HTTP_NO_CONTENT);
        }
}

