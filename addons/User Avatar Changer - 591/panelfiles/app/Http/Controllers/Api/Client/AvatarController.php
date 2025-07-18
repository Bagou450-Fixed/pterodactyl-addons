<?php

namespace Pterodactyl\Http\Controllers\Api\Client;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Illuminate\Http\File;

class AvatarController extends ClientApiController
{
    public function get(Request $request)
    {
        if (Storage::exists("public/avatar/$request->uuid" . "_avatar.png")) {
            return array('found' => true, 'img' => base64_encode(Storage::get("public/avatar/$request->uuid" . "_avatar.png")));
        }
        return array('found' => false, 'img' => '');

    }
    public function store(Request $request)
    {
        if(str_starts_with($request->file('image')->getMimeType(), 'image')) {
            Storage::delete("public/avatar/$request->uuid" . "_avatar.png");
            $a = Storage::put("public/avatar/$request->uuid" . "_avatar.png", $request->file('image')->get());
            if($a == true) {
                return new JsonResponse([], Response::HTTP_NO_CONTENT);
            } else {
                throw new BadRequestHttpException('Error during file uploading.');
            }
        } else {
            throw new BadRequestHttpException('File need to be a image.');
        }
        throw new BadRequestHttpException('Error during file uploading.');

    }
    public function remove(Request $request)
    {
        if (Storage::exists("public/avatar/$request->uuid" . "_avatar.png")) {
            Storage::delete("public/avatar/$request->uuid" . "_avatar.png");
            return new JsonResponse([], Response::HTTP_NO_CONTENT);
        }
        throw new BadRequestHttpException('No avatar found.');

    }
}

