@php
    $router = app('router');
@endphp
<div class="row">
    <div class="col-xs-12">
        <div class="nav-tabs-custom nav-tabs-floating">
            <ul class="nav nav-tabs">
                <li class="{{ $router->currentRouteNamed('admin.bagoulicense') ? 'active' : '' }}">
                    <a href="{{ route('admin.bagoulicense') }}">Overview</a>
                </li>
                <li class="{{ $addon == 'mcversions' ? 'active' : '' }}">
                    <a href="{{ route('admin.bagoulicense.license', 'mcversions') }}">Minecraft Versions Changer</a>
                </li>
                <li class="{{ $addon == 'spigot' ? 'active' : '' }}">
                    <a href="{{ route('admin.bagoulicense.license', 'spigot') }}">Spigot Plugins installer </a>
                </li>
                <li class="{{ $addon == 'cloudservers' ? 'active' : '' }}">
                    <a href="{{ route('admin.bagoulicense.license', 'cloudservers') }}">Cloud servers </a>
                </li>
            </ul>
        </div>
    </div>
</div>