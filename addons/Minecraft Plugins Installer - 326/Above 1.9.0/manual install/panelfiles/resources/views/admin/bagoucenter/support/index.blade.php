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
@include('admin.bagoucenter.nav', ['addon' => null])

    <div class="row" style="margin-top: 15px;">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Bagou Support</h3>
                </div>
                <p class="box-body">
                    You can contact me trough many way!</span>.
                    <br>
                    <span style="font-size: 20px;">Discord: <a href="http://discord.bagou450.com">here</a> (24 hour response time) </span>
                    <br>
                    <span style="font-size: 20px;">Sms (No call): +33 7 56 89 00 36 (24 hours response time) </span>
                    <br>
                    <span style="font-size: 20px;">Email: contact@bagou450.com (48 hours response time) </span>

                </p>
            </div>
        </div>
    </div>
@endsection
