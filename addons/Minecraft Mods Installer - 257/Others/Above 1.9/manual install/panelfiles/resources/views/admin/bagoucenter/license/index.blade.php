@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'basic'])

@section('title')
    Bagou License
@endsection

@section('content-header')
    <h1>Bagou Center<small>Manage all bagou450 addons.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Bagou Center</li>
    </ol>
@endsection
@section('content')
@include('admin.bagoucenter.nav')
@include('admin.bagoucenter.license.nav', ['addon' => null, 'addonslist' => $addonslist, 'licenses' => $licenses])

    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Bagou License</h3>
                </div>
                <p class="box-body">
                    You can manage your license here.
                    <br>Actual license status:
                    <ul>
                        @foreach ($addonslist as $addon)
                            @php
                                $found = false;
                            @endphp
                            @foreach($licenses as $license) 
                                @if($license->addon == $addon['id'])
                                    @php
                                        $found = true;
                                    @endphp
                                    <li>{{$addon['name']}}: <span style="color: green;">Activated</span></li>
                                @endif
                            @endforeach
                            @if (!$found)
                                <li>{{$addon['name']}}: <span style="color: red;">Disabled</span></li>
                            @endif
                        @endforeach
                    </ul>
                </p>
            </div>
        </div>
    </div>
@endsection
