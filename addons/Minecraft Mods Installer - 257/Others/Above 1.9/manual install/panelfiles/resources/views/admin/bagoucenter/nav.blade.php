@php
    $router = app('router');
@endphp
<div class="row">
    <div class="col-xs-12">
        <div class="nav-tabs-custom nav-tabs-floating" style="margin-bottom: 1px;">
            <ul class="nav nav-tabs">
                <li class="{{ $router->currentRouteNamed('admin.bagoucenter') ? 'active' : '' }}">
                    <a href="{{ route('admin.bagoucenter') }}">Overview</a>
                </li>
                <li class="{{ $router->currentRouteNamed('admin.bagoucenter.license') || $router->currentRouteNamed('admin.bagoucenter.license.addon')? 'active' : '' }}">
                    <a href="{{ route('admin.bagoucenter.license') }}">License</a>
                </li>
                <li class="{{ $router->currentRouteNamed('admin.bagoucenter.versions') || str_starts_with($router->current()->uri, 'admin/bagoucenter/versions') ? 'active' : '' }}">
                    <a href="{{ route('admin.bagoucenter.versions') }}">Version checker</a>
                </li>
                <li class="{{ $router->currentRouteNamed('admin.bagoucenter.settings') || str_starts_with($router->current()->uri, 'admin/bagoucenter/settings') ? 'active' : '' }}">
                    <a href="{{ route('admin.bagoucenter.settings') }}">Settings</a>
                </li>
                <li class="{{ $router->currentRouteNamed('admin.bagoucenter.support') || str_starts_with($router->current()->uri, 'admin/bagoucenter/support') ? 'active' : '' }}">
                    <a href="{{ route('admin.bagoucenter.support') }}">Support</a>
                </li>
            </ul>
        </div>
    </div>
</div>