<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Pterodactyl\Models\Server;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Facades\Activity;
use Pterodactyl\Repositories\Eloquent\ServerRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Pterodactyl\Models\Mcplugins;
use Pterodactyl\Models\Bagoulicense;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
class McPluginsController extends ClientApiController
{
    /**
     * @var \Pterodactyl\Repositories\Eloquent\ServerRepository
     */
    private $repository;
    
    /**
     * @var \Pterodactyl\Repositories\Wings\DaemonFileRepository
     */
    private $fileRepository;
    /**
     * @var \Pterodactyl\Services\Servers\ServerCreationService
     */
    public function __construct(
        ServerRepository $repository,
        DaemonFileRepository $fileRepository

        )
    {
        parent::__construct();

        $this->repository = $repository;
        $this->fileRepository = $fileRepository;

    }

   public function plugins(Server $server, Request $request)
    {           
        $license = Bagoulicense::where('addon', 326)->first();
        if(!$license) {
            return new BadRequestHttpException('No license for this addons please setup the license trough admin tab.');
        }
        $license = $license['license'];
        //dd(Mcplugins::where('plugin', "Lib's Disguises [Free]")->where('server_id', $server->id)->value('installdate')->toIso8601String());
        if ($request->type == '1') {
        if ($request->searchFilter) {
            return $this->addinstalled($server, Http::accept('application/json')->get("https://api.bagou450.com/api/client/pterodactyl/plugins/spigot?id=$license&page=$request->page&size=20&search=$request->searchFilter&category=4&sort=downloads&field=name")->json());
        } else {
        $plugins = Http::accept('application/json')->get("https://api.bagou450.com/api/client/pterodactyl/plugins/spigot?id=$license&category=$request->category&size=20&page=$request->page&sort=-downloads&fields=id,name,tag,file,testedVersions,links,external,version,author,category,rating,icon,releaseDate,updateDate,downloads,premium&version=$request->version")->json();
        return $this->addinstalled($server, $plugins);
           }
        } else if($request->type == '2') {
            if ($request->searchFilter) {
                $url = "https://api.bagou450.com/api/client/pterodactyl/plugins/bukkit?id=$license&page=$request->page?&searchFilter=$request->searchFilter&search=$request->searchFilter&version=$request->version";
            } else {
                $url = "https://api.bagou450.com/api/client/pterodactyl/plugins/bukkit?id=$license&page=$request->page&search=$request->searchFilter&version=$request->version";
            }
            return $this->addinstalled($server, Http::accept('application/json')->get($url)->json()); 
        } else if($request->type == '3') {
            $url = $_SERVER['SERVER_NAME'];
            $page = $request->page*10;
            $plugins = Http::accept('application/json')->get("https://api.bagou450.com/api/client/pterodactyl/plugins/polymart?id=$license&page=$request->page&search=$request->searchFilter&version=$request->version")->object(); 
            foreach ($plugins as $key => $plugin) {
                $plugins[$key]->installed = 0;
                $plugins[$key]->installedate = date('Y-m-d H:i');
                if (Mcplugins::where('plugin', $plugins[$key]->title)->where('server_id', $server['id'])->exists())
                {
                    $date = Mcplugins::where('plugin', $plugins[$key]->title)->where('server_id', $server['id'])->value('created_at')->toIso8601String();
                    $plugins[$key]->installedate = $date;
                    $plugins[$key]->installed = 1;
                        
                }    
        
            }

            return json_encode($plugins);
            
        } else if($request->type == '4') {
            $url = $_SERVER['SERVER_NAME'];
            $plugins = file_get_contents("/var/www/pterodactyl/public/pluginslist.json"); 
            return json_decode($plugins);
        } else if($request->type == '5') {
            $files = $this->fileRepository
            ->setServer($server)
            ->getDirectory('/plugins');
            $tmparray = [];
            foreach($files as $key => $file) {
                if(!$files[$key]['directory']) {
                    $files[$key]['name'] = substr($files[$key]['name'], 0, strrpos($files[$key]['name'], "."));;
                    array_push($tmparray, $files[$key]);
                }
            }
            return $tmparray;

        } else {
            throw new BadRequestHttpException('This url is invalid');
            return;
        }
    }
    public function install(Server $server, Request $request) 
    {
        $license = Bagoulicense::where('addon', 326)->first();
        if(!$license) {
            return new BadRequestHttpException('No license for this addons please setup the license trough admin tab.');
        }
        $license = $license['license'];
        if(!Mcplugins::where('plugin', $request->plugin)->where('server_id', $server->id)->exists()) {
                if(str_starts_with($request->url, 'polymart')) {
                    $link = Http::get("https://api.bagou450.com/api/client/pterodactyl/plugins/download?id=$license&url=$request->url")->json()['url'];

                } else {
                    $link = $request->url;
                }
                $this->fileRepository->setServer($server)->putContent("plugins/$request->plugin.jar", file_get_contents($link));
                $plugin = Mcplugins::create([
                    'server_id' => $server->id,
                    'plugin' => $request->plugin,
                ]);    
            

            Activity::event('server:plugin.install')
                ->property('name', $plugin->plugin)
                ->log();
    
            return;
        } else {
            return new BadRequestHttpException('This plugin is already installed');
        }

    }
    public function uninstall(Server $server, Request $request) 
    {
        Activity::event('server:plugin.uninstall')
        ->property('name', $request->plugin)
        ->log();
        Mcplugins::where('server_id', $server->id)->where('plugin', $request->plugin)->delete();
        return;

    }
    private function addinstalled(Server $server, array $plugins) {
        foreach ($plugins as $key => $plugin) {
            $plugins[$key]['installed'] = 0;
            $plugins[$key]['installedate'] = date('Y-m-d H:i');
            if (Mcplugins::where('plugin', $plugins[$key]['name'])->where('server_id', $server->id)->exists())
            {
                $date = Mcplugins::where('plugin', $plugins[$key]['name'])->where('server_id', $server->id)->value('created_at')->toIso8601String();
                $plugins[$key]['installedate'] = $date;
                $plugins[$key]['installed'] = 1;
                
            }
           

        }
        return $plugins;
    }
    public function getVersions(Request $request)
    {
        $license = Bagoulicense::where('addon', 326)->first();
        if(!$license) {
            return new BadRequestHttpException('No license for this addons please setup the license trough admin tab.');
        }
        $license = $license['license'];
        return Http::get("https://api.bagou450.com/api/client/pterodactyl/plugins/getVersions?id=$license&type=$request->type&pluginId=$request->pluginId&page=$request->page");
    }
    public function getMcVersions(Request $request)
    {
        $license = Bagoulicense::where('addon', 326)->first();
        if(!$license) {
            return new BadRequestHttpException('No license for this addons please setup the license trough admin tab.');
        }
        $license = $license['license'];

        return Http::accept('application/json')->get('https://api.bagou450.com/api/client/pterodactyl/plugins/getMcVersions', ['id' => $license, 'type' => $request->type]);
    }
}


