import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHdd, faMemory, faMicrochip, faPause, faPlay, faServer, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useHistory } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';
import Spinner from '@/components/elements/Spinner';
import styled from 'styled-components/macro';
import isEqual from 'react-fast-compare';
import Button from '@/components/elements/button/Button';
import { useStoreActions, useStoreState } from '@/state/hooks';
import { ApplicationStore } from '@/state';
import { Actions } from 'easy-peasy';
import deleteCloudServer from '@/api/cloud/servers/deleteCloudServer';
import EditServerButton from './EditServerButton';
import { PaginatedResult } from '@/api/http';
import useSWR from 'swr';
import getServers from '@/api/getServers';
import { Dialog } from '@/components/elements/dialog';
import suspendCloudServer from '@/api/cloud/servers/suspendCloudServer';

const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

const Icon = memo(
  styled(FontAwesomeIcon)<{ $alarm: boolean }>`
    ${(props) => (props.$alarm ? tw`text-red-400` : tw`text-neutral-500`)};
  `,
  isEqual
);

const IconDescription = styled.p<{ $alarm: boolean }>`
  ${tw`text-sm ml-2`};
  ${(props) => (props.$alarm ? tw`text-white` : tw`text-neutral-400`)};
`;

type Timer = ReturnType<typeof setInterval>;

export default ({ server, className, page }: { server: Server; page: number; className?: string }) => {
  const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
  const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [modal, setModal] = useState('');
  const uuid = useStoreState((state) => state.user.data!.uuid);

  const history = useHistory();
  const getStats = () =>
    getServerResourceUsage(server.uuid)
      .then((data) => setStats(data))
      .catch((error) => console.error(error));

  useEffect(() => {
    setIsSuspended(stats?.isSuspended || server.status === 'suspended');
  }, [stats?.isSuspended, server.status]);

  useEffect(() => {
    // Don't waste a HTTP request if there is nothing important to show to the user because
    // the server is suspended.
    if (isSuspended) return;

    getStats().then(() => {
      interval.current = setInterval(() => getStats(), 30000);
    });

    return () => {
      interval.current && clearInterval(interval.current);
    };
  }, [isSuspended]);

  const alarms = { cpu: false, memory: false, disk: false };
  if (stats) {
    alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9;
    alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory);
    alarms.disk = server.limits.disk === 0 ? false : isAlarmState(stats.diskUsageInBytes, server.limits.disk);
  }

  const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : 'Unlimited';
  const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : 'Unlimited';
  const cpuLimit = server.limits.cpu !== 0 ? server.limits.cpu + ' %' : 'Unlimited';
  const { clearFlashes, addFlash, clearAndAddHttpError } = useStoreActions(
    (actions: Actions<ApplicationStore>) => actions.flashes
  );

  const { mutate } = useSWR<PaginatedResult<Server>>(['/api/client/servers', page], () =>
    getServers({ page, type: 'cloud' })
  );
  const deleteserver = () => {
    clearFlashes('cloud:servers');
    deleteCloudServer(server.uuid, uuid)
      .then(() => {
        addFlash({ type: 'success', title: 'Success', message: 'Server deleted!', key: 'cloud:servers' });
        mutate();
        setModal('');
      })
      .catch((error) => {
        clearAndAddHttpError({ key: 'cloud:servers', error });
      });
  };
  const suspendserver = () => {
    clearFlashes('cloud:servers');
    suspendCloudServer(server.uuid, uuid)
      .then(() => {
        addFlash({
          type: 'success',
          title: 'Success',
          message: server.status === 'suspended' ? 'Server unsuspended!' : 'Server suspended!',
          key: 'cloud:servers',
        });
        mutate();
        setModal('');
      })
      .catch((error) => {
        clearAndAddHttpError({ key: 'cloud:servers', error });
      });
  };
  if (server.status === 'installing') {
    setTimeout(() => {
      mutate();
    }, 1000);
  }
  return (
    <>
      <Dialog.Confirm
        open={modal === 'delete'}
        onClose={() => setModal('')}
        title={`Delete "${server.name}"`}
        onConfirmed={() => deleteserver()}
      >
        This action is unreversible. You can&apos;t restore the server after that.
      </Dialog.Confirm>
      <Dialog.Confirm
        open={modal === 'suspend'}
        onClose={() => setModal('')}
        title={server.status === 'suspended' ? `Unsuspend "${server.name}"` : `Suspend "${server.name}"`}
        onConfirmed={() => suspendserver()}
      >
        {server.status === 'suspended'
          ? 'You realy want to unsuspend this server?'
          : 'You realy want to suspend this server?'}
      </Dialog.Confirm>
      <GreyRowBox className={className} css={tw`flex-wrap md:flex-nowrap items-center mb-2`}>
        <div css={tw`flex items-center truncate w-full md:flex-1`} onClick={() => history.push(`/server/${server.id}`)}>
          <div css={tw`flex flex-col truncate`}>
            <div css={tw`flex items-center text-sm mb-1`}>
              <div
                css={tw`w-10 h-10 rounded-lg bg-white border-2 border-neutral-800 overflow-hidden hidden md:block`}
                title={server.name}
                className={'icon'}
              >
                <FontAwesomeIcon icon={faServer} />
              </div>
              <p css={tw`ml-4 break-words truncate`}>
                {server.name}
                <br />
                <span css={tw`text-neutral-500`}>{server.owner}</span>
              </p>
            </div>
          </div>
        </div>
        <div
          onClick={() => history.push(`/server/${server.id}`)}
          css={tw`flex-none md:flex-none hidden md:block md:w-48 mt-4 md:mt-0 md:ml-1 md:text-center`}
        >
          <p css={tw`text-2xs text-neutral-500 uppercase mt-1`}>Server ip</p>
          <p title={server.allocations.join(', ')}>
            {server.allocations
              .filter((alloc) => alloc.isDefault)
              .map((allocation) => (
                <React.Fragment key={allocation.ip + allocation.port.toString()}>
                  {allocation.alias || ip(allocation.ip)}:{allocation.port}
                </React.Fragment>
              ))}
          </p>
        </div>
        {!stats || isSuspended ? (
          isSuspended ? (
            <div css={tw`flex-1 md:flex-none hidden md:block md:w-48 mt-4 md:mt-0 md:ml-5 md:text-center`}>
              <span css={tw`bg-red-500 rounded px-2 py-1 text-red-100 text-xs`}>
                {server.status === 'suspended' ? 'Suspended' : 'Connection Error'}
              </span>
            </div>
          ) : server.isTransferring || server.status ? (
            <div css={tw`flex-1 md:flex-none hidden md:block md:w-48 mt-4 md:mt-0 md:ml-5 md:text-center`}>
              <span css={tw`bg-neutral-500 rounded px-2 py-1 text-neutral-100 text-xs`}>
                {server.isTransferring
                  ? 'Transferring'
                  : server.status === 'installing'
                  ? 'Installing'
                  : server.status === 'restoring_backup'
                  ? 'Restoring Backup'
                  : 'Unavailable'}
              </span>
            </div>
          ) : (
            <Spinner size={'small'} />
          )
        ) : (
          <div css={tw`grid grid-cols-3 gap-6`}>
            <div onClick={() => history.push(`/server/${server.id}`)}>
              <div css={tw`flex justify-center`}>
                <Icon icon={faMicrochip} $alarm={alarms.cpu} />
                <IconDescription $alarm={alarms.cpu}>{stats.cpuUsagePercent.toFixed(2)} %</IconDescription>
              </div>
              <p css={tw`text-xs text-neutral-600 text-center mt-1`}>of {cpuLimit}</p>
            </div>
            <div onClick={() => history.push(`/server/${server.id}`)}>
              <div css={tw`flex justify-center`}>
                <Icon icon={faMemory} $alarm={alarms.memory} />
                <IconDescription $alarm={alarms.memory}>{bytesToString(stats.memoryUsageInBytes)}</IconDescription>
              </div>
              <p css={tw`text-xs text-neutral-600 text-center mt-1`}>of {memoryLimit}</p>
            </div>
            <div onClick={() => history.push(`/server/${server.id}`)}>
              <div css={tw`flex justify-center`}>
                <Icon icon={faHdd} $alarm={alarms.disk} />
                <IconDescription $alarm={alarms.disk}>{bytesToString(stats.diskUsageInBytes)}</IconDescription>
              </div>
              <p css={tw`text-xs text-neutral-600 text-center mt-1`}>of {diskLimit}</p>
            </div>
          </div>
        )}
        <div
          css={tw`grid grid-cols-3 w-full md:w-auto mt-4 md:mt-0 md:ml-12 space-x-2`}
          style={{ marginRight: '-0.5rem' }}
        >
          <EditServerButton server={server} page={page} />
          <Button
            onClick={() => setModal('suspend')}
            css={
              server.status === 'suspended'
                ? tw`bg-green-600 hover:bg-green-500`
                : tw`bg-yellow-600 hover:bg-yellow-500`
            }
          >
            <FontAwesomeIcon icon={server.status === 'suspended' ? faPlay : faPause} />
          </Button>
          <Button.Danger onClick={() => setModal('delete')}>
            <FontAwesomeIcon icon={faTrash} />
          </Button.Danger>
        </div>
      </GreyRowBox>
    </>
  );
};

