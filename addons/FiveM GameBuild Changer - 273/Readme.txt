Hey, thanks for your purchase.

First you need to upload the content of panelfiles folder to /var/www/pterodactyl (or your pterodactyl folder)

Now go to change the panel files


1 - In /app/Transformers/Api/Client/ServerTransformer.php bellow "'node' => $server->node->name," add :

    'egg_id' => $server->egg_id,
For panel above 1.9 add also this under "'name' => $server->name,":

            'nest_id' => $server->nest_id,
2 - In resources/scripts/api/server/getServer.ts under  "node: string;" add :

    eggId: number;

For panel above 1.9 add also this under "node: string;":

    nestId: number;
and under "node: data.node," add :

    eggId: data.egg_id,
For panel above 1.9 add also this under "status: data.status,":

    nestId: data.nest_id,

3 - In app/Models/Permission.php under

       'file' => [
            'description' => 'Permissions that control a user\'s ability to modify the filesystem for this server.',
            'keys' => [
                'create' => 'Allows a user to create additional files and folders via the Panel or direct upload.',
                'read' => 'Allows a user to view the contents of a directory, but not view the contents of or download files.',
                'read-content' => 'Allows a user to view the contents of a given file. This will also allow the user to download files.',
                'update' => 'Allows a user to update the contents of an existing file or directory.',
                'delete' => 'Allows a user to delete files or directories.',
                'archive' => 'Allows a user to archive the contents of a directory as well as decompress existing archives on the system.',
                'sftp' => 'Allows a user to connect to SFTP and manage server files using the other assigned file permissions.',
            ],
        ],

add

        'gambuild' => [
            'description' => 'This part is about the gambuild tab (FiveM only). ',
            'keys' => [
                'gambuild' => 'Allows the user to change the server gambuild (FiveM only).',
            ],
        ],

FOR PANEL UNDER 1.9 VERSION:
7 - In resources/scripts/routers/ServerRouter.tsx under all import line add :

import GameBuildContainer from '@/components/server/gamebuild/GameBuildContainer';


Under :

"<Can action={'backup.*'}>
    <NavLink to={`${match.url}/backups`}>Backups</NavLink>
</Can>"

add :
                                {eggId === (YOUR FIVEM NEST ID) &&
                                <Can action={'gamebuild.*'}>
                                    <NavLink to={`${match.url}/gamebuild`}>GameBuild</NavLink>
                                </Can>
                                }

under "const clearServerState = ServerContext.useStoreActions(actions => actions.clearServerState);" add :

    const eggId = ServerContext.useStoreState(state => state.server.data?.eggId);

and under :

"<Route path={`${match.path}/backups`} exact>
    <RequireServerPermission permissions={'backup.*'}>
        <BackupContainer/>
    </RequireServerPermission>
</Route>"

add :

                                    {eggid === (YOUR FIVEM EGG ID) &&
                                   <Route path={`${match.path}/gamebuild`} exact>
                                       <RequireServerPermission permissions={'gamebuild.*'}>
                                           <GameBuildContainer/>
                                       </RequireServerPermission>
                                   </Route>
                                    }
FOR PANEL ABOVE 1.9 VERSION :

7 - In resources/scripts/routers/routes.ts after:

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
            path: '/gamebuild',
            permission: 'gamebuild.*',
            name: 'GameBuild',
            eggId: YOUR EGG ID,
            component: GameBuildContainer,
        },

7.1 - In same file after "permission: string | string[] | null;" add :

                 nestId?: number[];
                 eggId?: number[];
                 nestIds?: number[];
                 eggIds?: number[];

7.2 - In same file after all import lines add :

import GameBuildContainer from '@/components/server/gamebuild/GameBuildContainer';


7.3 - In resources/scripts/routers/ServerRouter.tsx add under all import lines:

import {Navigation, ComponentLoader} from '@/routers/ServerElements';


7.4 - In samer file replace :

"
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
"


By:

                                       <Navigation/>

7.5 - In same file replace :

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




After you need to go in your fivem egg (Admin->Nest->YOUR FIVEM EGG) in variable tab and add an new variable like the screenvariable.png.
If you need you can copy paste this : string|nullable
And in configuration tab you need to change your startup command by that :
$(pwd)/alpine/opt/cfx-server/ld-musl-x86_64.so.1 --library-path "$(pwd)/alpine/usr/lib/v8/:$(pwd)/alpine/lib/:$(pwd)/alpine/usr/lib/" -- $(pwd)/alpine/opt/cfx-server/FXServer +set citizen_dir $(pwd)/alpine/opt/cfx-server/citizen/ +set sv_licenseKey {{FIVEM_LICENSE}} +set steam_webApiKey {{STEAM_WEBAPIKEY}} {{GAMEBUILD}} +set sv_maxplayers {{MAX_PLAYERS}} +set serverProfile default +set txAdminPort {{TXADMIN_PORT}} $( [ "$TXADMIN_ENABLE" == "1" ] || printf %s '+exec server.cfg' )

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


FOR A URGENT HELP CONTACT ME DIRECTLY BY SMS OR EMAIL!!
If you need help contact me on discord : http://discord.bagou450.com/ (or https://discord.gg/bagou450)
You don't have discord ? Send me a SMS to +33 7 56 89 00 36 (Unsurcharged number, No call)
You prefer emails? Send a email to contact@bagou450.com
