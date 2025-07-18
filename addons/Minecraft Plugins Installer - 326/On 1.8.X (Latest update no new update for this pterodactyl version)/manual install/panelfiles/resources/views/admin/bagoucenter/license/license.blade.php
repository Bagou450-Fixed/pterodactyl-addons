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
@include('admin.bagoucenter.license.nav', ['addon' => $addon, 'addonslist' => $addonslist, 'licenses' => $licenses])

    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Bagou License</h3>
                </div>
                <form action="{{ route('admin.settings') }}" method="POST">
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Company Name</label>
                                <div>
                                    <input type="text" class="form-control" name="app:name" value="{{ old('app:name', config('app.name')) }}" />
                                    <p class="text-muted"><small>This is the name that is used throughout the panel and in emails sent to clients.</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Require 2-Factor Authentication</label>
                                <div>
                                    <div class="btn-group" data-toggle="buttons">
                                        @php
                                            $level = old('pterodactyl:auth:2fa_required', config('pterodactyl.auth.2fa_required'));
                                        @endphp
                                        <label class="btn btn-primary @if ($level == 0) active @endif">
                                            <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="0" @if ($level == 0) checked @endif> Not Required
                                        </label>
                                        <label class="btn btn-primary @if ($level == 1) active @endif">
                                            <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="1" @if ($level == 1) checked @endif> Admin Only
                                        </label>
                                        <label class="btn btn-primary @if ($level == 2) active @endif">
                                            <input type="radio" name="pterodactyl:auth:2fa_required" autocomplete="off" value="2" @if ($level == 2) checked @endif> All Users
                                        </label>
                                    </div>
                                    <p class="text-muted"><small>If enabled, any account falling into the selected grouping will be required to have 2-Factor authentication enabled to use the Panel.</small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Status</label>
                                <div>
                                   <p>@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'basic'])

@section('title')
    Bagou License
@endsection

@section('content-header')
    <h1>Bagou License<small>Configure license for Bagou450 Addons.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Bagou License</li>
    </ol>
@endsection
@section('content')
@include('admin.bagoucenter.nav')
@include('admin.bagoucenter.license.nav', ['addon' => $addon, 'addonslist' => $addonslist, 'licenses' => $licenses])

    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Bagou License</h3>
                </div>
                <form method="POST">
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Addon license (Transaction id)</label>
                                <div>
                                    <input type="text" class="form-control" name="license" value="{{ $license }}" />
                                    <p class="text-muted"><small>Add here your transaction id if not work contact me on <a href="https://discord.bagou450.com">discord</a></small></p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Usage</label>
                                <div>
                                    <p>{{ $usage && $maxusage ? "$usage / $maxusage panel(s)" : 'No license' }} <br> {{ $usage && $maxusage ? 'Contact me on discord for increase panel limit.' : 'For use the addon you need to insert a license' }}</p>
                                </div>
                            </div>
                            <div class="form-group col-md-4">
                                <label class="control-label">Status</label>
                                <div>
                                   <p style="font-size: 50px">{{$enabled ? '✅' : '🚫' }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="box-footer">
                        {!! csrf_field() !!}
                        <button type="submit" name="_method" value="POST"  style="margin-left: 8px" class="btn btn-sm btn-primary pull-right ">Save</button>
                        {!! csrf_field() !!}
                        <button type="submit" name="_method" value="DELETE" class="btn btn-sm btn-danger pull-right ">Remove License</button>

                </form>
            </div>

            </div>
        </div>
    </div>
@endsection
</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="box-footer">
                        {!! csrf_field() !!}
                        <button type="submit" name="_method" value="PATCH" class="btn btn-sm btn-primary pull-right">Save</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection
