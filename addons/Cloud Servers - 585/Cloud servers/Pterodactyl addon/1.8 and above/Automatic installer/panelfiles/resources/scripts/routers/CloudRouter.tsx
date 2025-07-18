import React from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import TransitionRouter from '@/TransitionRouter';
import { Redirect, useLocation } from 'react-router';
import Spinner from '@/components/elements/Spinner';
import { NotFound } from '@/components/elements/ScreenBlock';
import { useStoreState } from 'easy-peasy';
import SubNavigation from '@/components/elements/SubNavigation';
import CloudServersContainer from '@/components/cloud/servers/CloudServersContainer';
import CloudUsersContainer from '@/components/cloud/users/CloudUsersContainer';
import NewServerContainer from '@/components/cloud/servers/NewServerContainer';
import NewUserContainer from '@/components/cloud/users/NewUserContainer';
import CloudSettingsContainer from '@/components/cloud/settings/CloudSettingsContainer';

export default () => {
  const location = useLocation();
  const cloud = useStoreState((state) => state.user.data!.cloud);

  console.log(cloud);
  return (
    <>
      <NavigationBar />
      {location.pathname.startsWith('/cloud') && (
        <SubNavigation>
          <div>
            <NavLink to={`/cloud/servers`}>Servers</NavLink>
            <NavLink to={`/cloud/users`}>Users</NavLink>
            <NavLink to={`/cloud/settings`}>Settings</NavLink>
          </div>
        </SubNavigation>
      )}
      <TransitionRouter>
        <React.Suspense fallback={<Spinner centered />}>
          <Switch location={location}>
            {cloud && (
              <>
                <Route path={'/cloud'} exact>
                  <Redirect to='/cloud/servers' />
                </Route>
                <Route path={'/cloud/servers'} exact>
                  <CloudServersContainer />
                </Route>
                <Route path={'/cloud/servers/new'} exact>
                  <NewServerContainer />
                </Route>
                <Route path={'/cloud/users'} exact>
                  <CloudUsersContainer />
                </Route>
                <Route path={`/cloud/users/new`} exact>
                  <NewUserContainer />
                </Route>
                <Route path={`/cloud/settings/`} exact>
                  <CloudSettingsContainer />
                </Route>
              </>
            )}

            <Route path={'*'}>
              <NotFound />
            </Route>
          </Switch>
        </React.Suspense>
      </TransitionRouter>
    </>
  );
};

