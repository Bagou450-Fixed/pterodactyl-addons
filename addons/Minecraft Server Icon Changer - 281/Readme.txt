Hey, thanks for your purchase.

After you need to upload the content of panelfiles folder to your pterodactyl folder

Now go to change the panel files


1 - In /app/Transformers/Api/Client/ServerTransformer.php bellow "'node' => $server->node->name," add :

    'nest_id' => $server->nest_id, 

2 - In resources/scripts/api/server/getServer.ts under  "node: string;" add : 

    nestId: number;

and under "node: data.node," add :

    nestId: data.nest_id,

4 - In app/Http/Controllers/Api/Client/Servers/FileController.php above the last } add :

   /**
     * Server icon file (mc)
     *
     * @param $request
     *
     * @throws \Throwable
     */
    public function pullIcon(PullFileRequest $request, Server $server): JsonResponse
    {

            $rooturl = $request->input('rooturl');
            $url = $request->input('url');
            $uuid = $request->input('uuid');
            $filename = $request->input('filename');
            $filetype = $request->input('filetype');
            if(file_exists("/var/www/pterotest/public/servericon/minecraft/$uuid")) {

            foreach(scandir("/var/www/pterodactyl/public/servericon/minecraft/$uuid") as $file) {
                if ($file == '.' || $file == '..') {
                    continue;
                }
                unlink("/var/www/pterodactyl/public/servericon/minecraft/$uuid/$file");
            }
            rmdir("/var/www/pterodactyl/public/servericon/minecraft/$uuid");
            }
            exec("cd /var/www/pterodactyl/public/servericon/minecraft && mkdir $uuid && cd $uuid && wget $url --no-check-certificate", $outputt, $retvall);
            if ($filetype !== 'png') {
                imagepng(imagecreatefromstring(file_get_contents("/var/www/pterodactyl/public/servericon/minecraft/$uuid/$filename.$filetype")), "/var/www/pterodactyl/public/servericon/minecraft/$uuid/$filename.png");
    
            }
            $imageno64 = "/var/www/pterodactyl/public/servericon/minecraft/$uuid/$filename.png";
            $imageno64openned = imagecreatefrompng($imageno64);
            list($width, $height) = getimagesize($imageno64);
            $resized = imagecreatetruecolor(64, 64);
            imagecopyresampled($resized, $imageno64openned, 0, 0, 0, 0, 64, 64, $width, $height);
            imagepng($resized, "/var/www/pterodactyl/public/servericon/minecraft/$uuid/server-icon.png");
            $this->fileRepository->setServer($server)->pull("$rooturl/servericon/minecraft/$uuid/server-icon.png", "/");
            sleep(2);
            exec("cd /var/www/pterodactyl/public/servericon/minecraft/ && rm -rf $uuid");

        return new JsonResponse([], Response::HTTP_NO_CONTENT);

    }

5 - For 1.8 and above panel version 
In routes/api-client.php under "Route::post('/pull', [Client\Servers\FileController::class, 'pull'])->middleware();" add : 

        Route::post('/pullIcon', [Client\Servers\FileController::class, 'pullIcon'])->middleware();

Else:
In routes/api-client.php under "Route::post('/pull', 'Servers\FileController@pull')->middleware();" add : 

        Route::post('/pullIcon', 'Servers\FileController@pullIcon')->middleware();


6 - In resources/scripts/components/server/settings/SettingsContainer.tsx under all import line add :

import ServerIconMCBox from './ServerIconMCBox';

Replace 

"<Can action={'settings.reinstall'}>
    <ReinstallServerBox/>
</Can>"

by : 
                    <div css={tw`mb-6 md:mb-10`}>
                        <Can action={'settings.reinstall'}>
                            <ReinstallServerBox/>
                        </Can>
                    </div>
                    {nestId === 1 &&
                                    <ServerIconMCBox/>
                    }

under "const node = ServerContext.useStoreState(state => state.server.data!.node);" add : 

    const nestId = ServerContext.useStoreState(state => state.server.data?.nestId);


If you don't have yarn install it :

apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
apt -y install nodejs
cd /var/www/pterodactyl
npm i -g yarn
yarn install

And build the panel assets :

yarn build:production
mkdir /var/www/pterodactyl/public/servericon/minecraft
mkdir /var/www/pterodactyl/public/servericon/minecraft
chown -R www-data:www-data *


If you need help contact me on discord : http://discord.bagou450.com/ (or https://discord.com/invite/98MdvaS3Qj)
You don't have discord ? Send me a sms to +33 7 56 89 00 36 (Unsurcharged number)
