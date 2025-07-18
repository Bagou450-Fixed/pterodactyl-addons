Hey, thanks for trusting us.

First go in pterodactyl folder 

cd /var/www/pterodactyl

After you need to upload the content of panelfiles folder

Now go to change the panel files


1 - In /app/Transformers/Api/Client/ServerTransformer.php bellow "'node' => $server->node->name," add :

    'egg_id' => $server->egg_id, 
For panel above 1.9 add also this under "'name' => $server->name,": 

            'nest_id' => $server->nest_id,
    
2 - In resources/scripts/api/server/getServer.ts under  "node: string;" add : 

    eggid: number;


For panel above 1.9 add also this under "node: string;": 

    nestId: number;
and under "node: data.node," add :

    eggid: data.egg_id,

    
For panel above 1.9 add also this under "status: data.status,": 

    nestId: data.nest_id,

4 - In app/Http/Controllers/Api/Client/ClientController.php under "use Pterodactyl\Http\Requests\Api\Client\GetServersRequest;" add :

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

and above the last "}" add :

     public function artifacts(Request $request)
     {
     $headers = ['User-Agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.81 Safari/537.36'];
                  
      $tablo_liens=array();
      $url = 'https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/';
      $pattern = '#(?:src|href|path|xmlns(?::xsl)?)\s*=\s*(?:"|\')\s*(.+)?\s*(?:"|\')#Ui';
      $subject = file_get_contents($url);
        preg_match_all($pattern, $subject, $matches, PREG_PATTERN_ORDER);
        $aa = 1;
      foreach($matches[1] as $match)
        {
          if (str_starts_with($match, './')) {
              $artifactslink = str_replace("./", "", $match);
              $artifactnumber = strtok($artifactslink, '-');
              if ($aa == 1) {
                $tablo_liens[] = array(
                    "url"=>$artifactslink, 
                    "number"=>$artifactnumber,
                    "version"=>$artifactnumber,
                    'type'=>'recommended'
               );
              } else if ($aa == 2) {
                $tablo_liens[] = array(
                    "url"=>$artifactslink, 
                    "number"=>$artifactnumber,
                    "version"=>$artifactnumber,
                    'type'=>'optional'
               );
              } else {
                $tablo_liens[] = array(
                    "url"=>$artifactslink, 
                    "number"=>$artifactnumber,
                    "version"=>$artifactnumber,
                    'type'=>'none'
               );
              }
              $aa =  $aa +1;

          }
      }
      return $tablo_liens;
}

5 - In routes/api-client.php at the end of file add :  
FOR 1.8 AND ABOVE PANEL VERSION:

Route::get('/artifacts', [Client\ClientController::class, 'artifacts']);

FOR PANEL UNDER 1.8:

Route::get('/artifacts', 'ClientController@artifacts');

  
FOR PANEL UNDER 1.9 VERSION:
6 - In resources/scripts/routers/ServerRouter.tsx under all import line add :

import ArtifactsContainer from '@/components/server/artifacts/ArtifactsContainer';


Under :

"<Can action={'backup.*'}>
    <NavLink to={`${match.url}/backups`}>Backups</NavLink>
</Can>"

add : 
                                {eggid === (YOUR FIVEM EGG ID) &&
                                <Can action={'artifacts.*'}>
                                    <NavLink to={`${match.url}/artifacts`}>Artifacts</NavLink>
                                </Can>
                                }

under "const clearServerState = ServerContext.useStoreActions(actions => actions.clearServerState);" add : 

    const eggid = ServerContext.useStoreState(state => state.server.data?.eggid);

and under :

"<Route path={`${match.path}/backups`} exact>
    <RequireServerPermission permissions={'backup.*'}>
        <BackupContainer/>
    </RequireServerPermission>
</Route>"

add :

                                    {eggid === (YOUR FIVEM EGG ID) &&
                                   <Route path={`${match.path}/artifacts`} exact>
                                       <RequireServerPermission permissions={'artifacts.*'}>
                                           <ArtifactsContainer/>
                                       </RequireServerPermission>
                                   </Route>
                                    }

FOR PANEL ABOVE 1.9 VERSION :


6.0 - In resources/scripts/routers/routes.ts after:

"
        {
            path: '/files',
            permission: 'file.*',
            name: 'Files',

            component: FileManagerContainer,
        },
"

Add:

        {
            path: '/artifacts',
            permission: 'file.*',
            name: 'Artifacts',
            eggId: YOUR EGG ID,
            component: ArtifactsContainer,
        },
 
6.1 - In same file after "permission: string | string[] | null;" add :

                 nestId?: number;
                 eggId?: number;
                 eggId?: number[];
                 nestId?: number[];

6.2 - In same file under all import lines add : 

import ArtifactsContainer from '@/components/server/artifacts/ArtifactsContainer';

For panel ABOVE 1.9 version:

7.0 - In resources/scripts/routers/ServerRouter.tsx add under all import lines add:

import { Navigation, ComponentLoader } from '@/routers/ServerElement';


7.1 - In samer file replace :

"
                               {routes.server
                                    .filter((route) => !!route.name)
                                    .map((route) =>
                                        route.permission ? (
                                            <Can key={route.path} action={route.permission} matchAny>
                                                <NavLink to={to(route.path, true)} exact={route.exact}>
                                                    {route.name}
                                                </NavLink>
                                            </Can>
                                        ) : (
                                            <NavLink key={route.path} to={to(route.path, true)} exact={route.exact}>
                                                {route.name}
                                            </NavLink>
                                        )
                                    )}
"


By:

                <Navigation />

7.2 - In same file replace :

"
                               {routes.server.map(({ path, permission, component: Component }) => (
                                        <PermissionRoute key={path} permission={permission} path={to(path)} exact>
                                            <Spinner.Suspense>
                                                <Component />
                                            </Spinner.Suspense>
                                        </PermissionRoute>
                                    ))}
"

By :

                <ComponentLoader />




                                   
If you don't have yarn install it :

apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
apt -y install nodejs
cd /var/www/pterodactyl
npm i -g yarn
yarn install

And build the panel assets :

yarn build:production
chown -R www-data:www-data *


If you need help contact me on discord : http://discord.bagou450.com/ (or https://discord.com/invite/98MdvaS3Qj)
You don't have discord ? Send me a sms to +33 7 56 89 00 36 (Unsurcharged number)
