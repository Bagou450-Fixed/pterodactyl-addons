import React, { useEffect, useState } from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import NavigationBar from '@/components/NavigationBar';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import TransitionRouter from '@/TransitionRouter';
import SubNavigation from '@/components/elements/SubNavigation';
import { Redirect, useLocation } from 'react-router';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import Alert from '@/components/elements/custom/Alert';
import styled from 'styled-components/macro';
import Spinner from '@/components/elements/Spinner';
import routes from '@/routers/routes';
import ContentContainer from '@/components/elements/ContentContainer';
import CollapseBtn from '@/components/elements/custom/CollapseBtn';
import { useStoreState } from 'easy-peasy';
import CloudServersContainer from '@/components/cloud/servers/CloudServersContainer';
import CloudUsersContainer from '@/components/cloud/users/CloudUsersContainer';
import NewServerContainer from '@/components/cloud/servers/NewServerContainer';
import NewUserContainer from '@/components/cloud/users/NewUserContainer';
import CloudSettingsContainer from '@/components/cloud/settings/CloudSettingsContainer';
const ContainerBlock = styled.div`
  display: flex;
  width: 100%;

  & > .contentBlock {
    width: 100%;
  }
  @media only screen and (max-width: 979px) {
    & {
      display: block;
    }
    & .collapseBtn {
      display: none;
    }
  }
`;

export default () => {
  const location = useLocation();

  return (
    <ContainerBlock>
      <>
        <NavigationBar />
        <div className='contentBlock'>
          <ContentContainer>
            <SubNavigation>
              <div>
                <div className='collapseBtn'>
                  <CollapseBtn />
                </div>
                <SearchContainer />
              </div>
              {location.pathname.startsWith('/cloud') && (
                <>
                  <div css='display:var(--subnavigation) !important;'>
                    <NavLink to={`/cloud/servers`}>Servers</NavLink>
                    <NavLink to={`/cloud/users`}>Users</NavLink>
                    <NavLink to={`/cloud/settings`}>Settings</NavLink>
                  </div>
                </>
              )}
            </SubNavigation>
            <Alert />
          </ContentContainer>
          <TransitionRouter>
            <React.Suspense fallback={<Spinner centered />}>
              <Switch location={location}>
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
                <Route path={'*'}>
                  <NotFound />
                </Route>
              </Switch>
            </React.Suspense>
          </TransitionRouter>
        </div>
      </>
    </ContainerBlock>
  );
};
