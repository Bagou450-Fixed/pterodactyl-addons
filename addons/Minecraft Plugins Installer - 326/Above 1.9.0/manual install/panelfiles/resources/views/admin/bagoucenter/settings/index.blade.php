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
@include('admin.bagoucenter.settings.nav', ['addon' => null, 'addonslist' => $addonslist, 'licenses' => $licenses])

    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Bagou Settings</h3>
                </div>
                <p class="box-body">
                    Choose a tab above for manage addon settings
                </p>
            </div>
        </div>
    </div>
@endsection
