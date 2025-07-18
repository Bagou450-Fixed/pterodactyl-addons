<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Cloud;

use Pterodactyl\Models\User;
use Pterodactyl\Models\Server;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\PanelName;
use Pterodactyl\Models\Permission;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;
use Pterodactyl\Models\Filters\MultiFieldServerFilter;
use Pterodactyl\Repositories\Eloquent\ServerRepository;
use Pterodactyl\Transformers\Api\Client\UserTransformer;
use Pterodactyl\Http\Requests\Api\Client\GetServersRequest;
use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Services\Servers\ServerDeletionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Pterodactyl\Models\Bagoulicense;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class CloudSettingsController extends ClientApiController
{
    /**
     * @var \Pterodactyl\Repositories\Eloquent\ServerRepository
     */
    private $repository;

    /**
     * ClientController constructor.
     */
    public function __construct(ServerRepository $repository)
    {
        parent::__construct();

        $this->repository = $repository;
    }
    /**
     * Set panel name
     */
    public function setcloudname(Request $request)
    {
        $transaction = Bagoulicense::where('addon', '585')->firstOrFail()->license;
        $license = Http::get("https://api.bagou450.com/api/client/pterodactyl/checklicense?id=$transaction&name=585");
        $code = $license->status();
        $license =  $license->object();

        if ($code !== 200) {
            throw new BadRequestHttpException('License error please contact a administrator.');
        } else {
        $id = User::where('uuid', $request->owneruuid)->firstOrFail()->id;
        if(PanelName::where('ownerid', $id)->exists()) {
            PanelName::where('ownerid', $id)->update([
                'name' => $request->name,
                'img' => $request->img,
                'footer' => $request->footer,
                'footerlink' => $request->footerlink,
            ]);
            return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);;
        }
        $panelname = new PanelName;
        $panelname->ownerid = $id;
        $panelname->name = $request->name;
        $panelname->img = $request->img;
        $panelname->footer = $request->footer;
        $panelname->footerlink = $request->footerlink;
        $panelname->save();


        return new JsonResponse([], JsonResponse::HTTP_NO_CONTENT);
    }

    }
}
