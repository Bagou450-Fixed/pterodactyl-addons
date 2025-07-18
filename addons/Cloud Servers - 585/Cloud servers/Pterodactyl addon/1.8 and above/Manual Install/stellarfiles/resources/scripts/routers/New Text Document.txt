import * as React from 'react';
import * as Icon from 'react-feather';
import { Link, NavLink } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import tw, { theme } from 'twin.macro';
import styled from 'styled-components/macro';
import Can from '@/components/elements/Can';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import DarkModeToggler from '@/components/elements/custom/DarkModeToggler';
import SocialButtons from '@/components/elements/custom/SocialButtons';
import NavigationBar from '@/components/elements/custom/NavigationBar';
import CollapseBtn from '@/components/elements/custom/CollapseBtn';
import { ServerContext } from '@/state/server';
import { useState, useEffect } from 'react';
import getTheme from '@/api/getThemeData';
import { Account, Apicredentials, SSHkey, Activity, Servers } from '@/lang';
import useSWR from 'swr';
import cloudName, { CloudName } from '@/api/cloud/cloudName';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloud } from '@fortawesome/free-solid-svg-icons';

export default () => {
  const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
  const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onTriggerLogout = () => {
    setIsLoggingOut(true);
    http.post('/auth/logout').finally(() => {
      // @ts-ignore
      window.location = '/';
    });
  };

  const [themeData, setThemeData] = useState();

  useEffect(() => {
    async function getThemeData() {
      const data = await getTheme();
      setThemeData(data.logo);
    }
    getThemeData();
  }, []);
  const cloud = useStoreState((state: ApplicationStore) => state.user.data!.cloud);
  const uuid = useStoreState((state: ApplicationStore) => state.user.data!.uuid);
  const subcloud = useStoreState((state: ApplicationStore) => state.user.data!.subcloud);
  const subcloud_owner = useStoreState((state: ApplicationStore) => state.user.data?.subcloud_owner);
  const { data, error } = useSWR<CloudName>(
    ['/cloud/cloudname'],
    () => cloudName(subcloud_owner ? subcloud_owner : cloud ? uuid : '', cloud ? true : false),
    {
      revalidateOnFocus: false,
    }
  );
  React.useEffect(() => {
    if (error) {
      console.log(error);
    }
  }, [error]);

  return (
    <NavigationBar>
      {(subcloud || cloud) && !data ? (
        <div css={tw`w-full`}>
          <SpinnerOverlay visible={true} />
        </div>
      ) : (
        <>
          <div className={'w-full bg-neutral-900 shadow-md overflow-x-auto'}></div>
          <SpinnerOverlay visible={isLoggingOut} />
          <div css={tw`w-full`}>
            <div id={'logo'}>
              <Link
                to={'/'}
                className={
                  'text-2xl font-header px-4 no-underline text-neutral-200 hover:text-neutral-100 transition-colors duration-150 flex'
                }
              >
                {((subcloud || cloud) && data?.name !== '' && data?.name) || (data?.img && data?.img !== '') ? (
                  <>
                    <img src={data?.img} className='h-12 mr-2 my-auto' />
                    <span className='my-auto flex'> {data?.name}</span>
                  </>
                ) : (
                  name
                )}
              </Link>
              <div className='collapseBtn'>
                <CollapseBtn />
              </div>
            </div>
            <NavLink to={'/account'} exact>
              <div className='icon'>
                <Icon.User size={20} />
              </div>
              <span>{Account}</span>
            </NavLink>
            <NavLink to={'/'} exact className='last'>
              <div className='icon'>
                <Icon.Layers size={20} />
              </div>
              <span>{Servers}</span>
            </NavLink>
            {location.pathname.startsWith('/account') && (
              <>
                <span className='subTitle'>ACCOUNT SETTINGS</span>
                <NavLink to={'/account/api'} exact>
                  <div className='icon'>
                    <Icon.Code size={20} />
                  </div>
                  <span>{Apicredentials}</span>
                </NavLink>
                <NavLink to={'/account/ssh'} exact>
                  <div className='icon'>
                    <Icon.Key size={20} />
                  </div>
                  <span>{SSHkey}</span>
                </NavLink>
                <NavLink to={'/account/activity'} className='last' exact>
                  <div className='icon'>
                    <Icon.Eye size={20} />
                  </div>
                  <span>{Activity}</span>
                </NavLink>
              </>
            )}
            {location.pathname.startsWith('/cloud') && (
              <>
                <span className='subTitle'>Cloud servers</span>
                <NavLink to={`/cloud/servers`}>
                  <div className='icon'>
                    <Icon.Server size={20} />
                  </div>
                  <span>Servers</span>
                </NavLink>
                <NavLink to={`/cloud/users`}>
                  <div className='icon'>
                    <Icon.User size={20} />
                  </div>
                  <span>Users</span>
                </NavLink>
                <NavLink to={`/cloud/settings`}>
                  <div className='icon'>
                    <Icon.Settings size={20} />
                  </div>
                  <span>Settings</span>
                </NavLink>
              </>
            )}
            <div className='media'>
              <SocialButtons />
            </div>
            <div className='logOut'>
              <DarkModeToggler />
              {cloud === 1 && (
                <Tooltip placement={'bottom'} content={'Cloud'}>
                  <NavLink to={'/cloud/'}>
                    <FontAwesomeIcon icon={faCloud} />
                  </NavLink>
                </Tooltip>
              )}
              {rootAdmin && (
                <a href={'/admin'} rel={'noreferrer'}>
                  <div className='icon'>
                    <Icon.Settings size={20} />
                  </div>
                </a>
              )}
              <button onClick={onTriggerLogout}>
                <div className='icon'>
                  <Icon.LogOut size={20} />
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </NavigationBar>
  );
};
