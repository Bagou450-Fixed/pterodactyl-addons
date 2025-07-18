@php
    $router = app('router');
@endphp
<div class="row">
    <div class="col-xs-12">
        <div class="nav-tabs-custom nav-tabs-floating">
            <ul class="nav nav-tabs">
                <li class="{{ $router->currentRouteNamed('admin.bagoucenter.settings.subdomain.index') ? 'active' : '' }}">
                    <a href="{{ route('admin.bagoucenter.settings.subdomain.index') }}">Domains</a>
                </li>
                <li class="{{ $router->currentRouteNamed('admin.bagoucenter.settings.subdomain.record.index') || $router->currentRouteNamed('admin.bagoucenter.settings.subdomain.record.new') || $router->currentRouteNamed('admin.bagoucenter.settings.subdomain.record.edit') ? 'active' : '' }}">
                    <a href="{{ route('admin.bagoucenter.settings.subdomain.record.index') }}">Record</a>
                </li>
            </ul>
        </div>
    </div>
</div>
