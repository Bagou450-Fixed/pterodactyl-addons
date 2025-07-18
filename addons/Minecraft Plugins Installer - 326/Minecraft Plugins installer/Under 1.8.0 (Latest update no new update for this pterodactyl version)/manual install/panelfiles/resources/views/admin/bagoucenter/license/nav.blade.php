@php
    $router = app('router');
@endphp
<div class="row">
    <div class="col-xs-12">
        <div class="nav-tabs-custom nav-tabs-floating">
            <ul class="nav nav-tabs">
                <li class="{{ $router->currentRouteNamed('admin.bagoucenter.license') ? 'active' : '' }}">
                    <a href="{{ route('admin.bagoucenter.license') }}">Overview</a>
                </li>
                @foreach ($addonslist as $addonn) 
                    @if (isset($addonn['id']) && isset($addonn['name']))
                        <li class="{{ $addon == $addonn['id'] ? 'active' : '' }}">
                            <a href="{{ route('admin.bagoucenter.license.addon', $addonn['id']) }}">{{$addonn['name']}} @if($addonn['new']) <span class="label label-success"> NEW </span> @endif</a>
                        </li>
                    @endif
                @endforeach
            </ul>
        </div>
    </div>
</div>