<?php

namespace Pterodactyl\Services\Servers;

use Pterodactyl\Models\Server;
use Illuminate\Database\ConnectionInterface;
use Pterodactyl\Repositories\Wings\DaemonServerRepository;

class ImportServerService
{
    /**
     * @var \Pterodactyl\Repositories\Wings\DaemonServerRepository
     */
    private $daemonServerRepository;

    /**
     * @var \Illuminate\Database\ConnectionInterface
     */
    private $connection;

    /**
     * ReinstallService constructor.
     */
    public function __construct(
        ConnectionInterface $connection,
        DaemonServerRepository $daemonServerRepository
    ) {
        $this->daemonServerRepository = $daemonServerRepository;
        $this->connection = $connection;
    }

    /**
     * Reinstall a server on the remote daemon.
     *
     * @return \Pterodactyl\Models\Server
     *
     * @throws \Throwable
     */
    public function handle(Server $server,$user,$password, $hote, $port, $srclocation, $dstlocation, $wipe, $type)
    {
        return $this->connection->transaction(function () use ($server, $user,$password, $hote, $port, $srclocation, $dstlocation, $wipe, $type) {
            $server->fill(['status' => Server::STATUS_IMPORT])->save();            
            $this->daemonServerRepository->setServer($server)->importer($user, $password, $hote, $port, $srclocation, $dstlocation, $wipe, $type);

            return $server->refresh();
        });
    }
}
