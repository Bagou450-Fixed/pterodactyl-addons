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
                    <h3 class="box-title">Bagou Center</h3>
                </div>
                <p class="box-body">
                    Select a tab above for manage all your Bagou450 addons!</span>.
                    <br>
                    <span style="font-size: 20px;">Api status: @if ($apistatus === 1) Online <i class="fa fa-check-circle" style="color: green;" aria-hidden="true"></i> @elseif ($apistatus === 2) Maintenance mode <i class="fa fa-exclamation-circle" style="color: yellow;" aria-hidden="true"></i> @else Down <i class="fa fa-minus-circle" style="color: red;" aria-hidden="true"></i> @endif</span>
                    <br>
                   <span style="font-size: 20px;">CDN status: @if ($cdnstatus === 1) Online <i class="fa fa-check-circle" style="color: green;" aria-hidden="true"></i> @elseif ($cdnstatus === 2) Maintenance mode <i class="fa fa-exclamation-circle" style="color: yellow;" aria-hidden="true"></i> @else Down <i class="fa fa-minus-circle" style="color: red;" aria-hidden="true"></i> @endif</span>

                </p>
            </div>
        </div>
    </div>
@endsection
