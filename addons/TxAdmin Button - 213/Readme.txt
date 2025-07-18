Hey, thank you for your purchase

1° - Change PowerControls file : 

cd /var/www/pterodactyl
If panel under 1.8
nano resources/scripts/components/server/PowerControls.tsx
If panel above 1.9
nano resources/scripts/components/server/console/PowerButtons.tsx

bellow "import { ServerContext } from '@/state/server';" line (press f8 to search) add this : 
import isEqual from 'react-fast-compare';
import getServerStartup from '@/api/swr/getServerStartup';

In the same file bellow "const instance = ServerContext.useStoreState(state => state.socket.instance);" add this : 

    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const variables = ServerContext.useStoreState(({ server }) => ({
        variables: server.data!.variables,
        invocation: server.data!.invocation,
        dockerImage: server.data!.dockerImage,
    }), isEqual);
    const { data, error, isValidating, mutate } = getServerStartup(uuid, {
        ...variables,
        dockerImages: { [variables.dockerImage]: variables.dockerImage },
    });
    const primaryAllocation = ServerContext.useStoreState(state => state.server.data!.allocations.filter(alloc => alloc.isDefault).map(
        allocation => (allocation.alias || allocation.ip)
    )).toString();
    const txAdminVariable = data?.variables.find((v) => v.envVariable === 'TXADMIN_ENABLE');
    const txAdminPort = data?.variables.find((v) => v.envVariable === 'TXADMIN_PORT');
    let url = '';
    let txadmin = true;
    if(txAdminVariable && txAdminPort) {
        if(txAdminVariable.serverValue === "1") {
            url = "http://" + primaryAllocation + ":" + txAdminPort.serverValue;
    
        } else {
            txadmin = false;
        }
    } else {
        txadmin = false;
    }

After add this above "</div>" line :
                            {txadmin &&
                    <Can action={'control.txadmin'}>
                        <Button
                            className={'flex-1'}
                            disabled={!status}
                            onClick={e => {
                                e.preventDefault();
                                window.open(url, '_blank');
                            }}
                        >
                            TxAdmin
                        </Button>
                    </Can>
                }

2° - Run these commands:

apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
apt -y install nodejs
cd /var/www/pterodactyl
npm i -g yarn
yarn install
yarn build:production
chown -R www-data:www-data *

If you need help contact me on discord : http://discord.bagou450.com/ (or https://discord.com/invite/98MdvaS3Qj)
You don't have discord ? Send me a sms to +33 7 56 89 00 36 (Unsurcharged number)
