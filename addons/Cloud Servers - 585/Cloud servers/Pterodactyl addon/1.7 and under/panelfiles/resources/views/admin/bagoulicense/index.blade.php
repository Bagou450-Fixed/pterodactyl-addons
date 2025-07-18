@extends('layouts.admin')
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
@include('admin.bagoulicense.nav', ['addon' => null])

    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Bagou License</h3>
                </div>
                <p class="box-body">The Bagou450 license system is here for protect against leak/resell.<br/>My addons can`t be used without license! </br>By default a license can be used on only one panel <span style="font-weight: 900;">if you need a license for more panel contact me on discord (there are no fees)</span>.</p>
            </div>
        </div>
    </div>
@endsection
