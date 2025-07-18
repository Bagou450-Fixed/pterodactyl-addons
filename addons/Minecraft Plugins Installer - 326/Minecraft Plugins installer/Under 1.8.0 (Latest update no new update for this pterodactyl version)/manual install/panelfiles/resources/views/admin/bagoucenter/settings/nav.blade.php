@php
    $router = app('router');
@endphp
<div class="row">
    <div class="col-xs-12">
        <div class="nav-tabs-custom nav-tabs-floating">
            <ul class="nav nav-tabs">
                <li class="{{ $router->currentRouteNamed('admin.bagoucenter.settings') ? 'active' : '' }}">
                    <a href="{{ route('admin.bagoucenter.settings') }}">Overview</a>
                </li>
                @foreach ($addonslist as $addonn)
                            @foreach($licenses as $license) 
                                @if($license->addon == $addonn['id'] && $addonn['tab'])
                                    @php
                                        $found = true;
                                    @endphp
                                    <li class="{{ $addon == $addonn['id'] ? 'active' : '' }}">
                                        <a href="{{ route($addonn['tabroute'], $addonn['id']) }}">{{$addonn['name']}} @if($addonn['new']) <span class="label label-success"> NEW </span> @endif</a>
                                    </li>
                                @endif
                            @endforeach
                @endforeach
            </ul>
        </div>
    </div>
</div>