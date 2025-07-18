@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'basic'])

@section('title')
    Bagou Center - list domains
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
@include('admin.bagoucenter.settings.subdomain.nav')

<div class="row">
    <div class="col-xs-12">
        <div class="box box-primary">
            <div class="box-header with-border text-center">
                <h3 class="box-title">Bagou450 domains manager</h3>
                <div class="input-group-btn">
                    <a href="{{ route('admin.bagoucenter.settings.subdomain.create') }}"><button type="button" class="btn btn-sm btn-primary" style="border-radius: 0 3px 3px 0;margin-left:-1px;">Create New</button></a>
                </div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <tbody>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th class="text-center">Action</th>
                    </tr>
                    @foreach ($domains as $domain)
                    <tr>
                        <td><code>{{ $domain->id }}</code></td>
                        <td>{{ $domain->name }}</td>
                        <td>{{ $domain->displayType }}</td>
                        <td class="text-center">
                            <a href="{{route('admin.bagoucenter.settings.subdomain.edit', ['domain' => $domain->id])}}" >
                                <i class="fa fa-edit text-primary" style="margin-right: 15px;"></i>
                            </a>
                            <a href="#" data-action="remove-domain" data-attr="{{ $domain->id }}">
                                <i class="fa fa-trash-o text-danger"></i>
                            </a>
                        </td>
                    </tr>
                    @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

@endsection


@section('footer-scripts')
@parent
<script>
    $(document).ready(function() {
        $('[data-action="remove-domain"]').click(function (event) {
            var self = $(this);
            event.preventDefault();
            swal({
                type: 'error',
                title: 'Remove this domain?',
                text: 'When you remove a domain all releated subdomains are also going to be deleted !',
                showCancelButton: true,
                allowOutsideClick: true,
                closeOnConfirm: false,
                confirmButtonText: 'Remove',
                confirmButtonColor: '#d9534f',
                showLoaderOnConfirm: true
            }, function () {
                $.ajax({
                    method: 'DELETE',
                    url: '/admin/bagoucenter/settings/subdomain/delete/' + self.data('attr'),
                    headers: {
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    }
                }).done(function () {
                    swal({
                        type: 'success',
                        title: '',
                        text: 'Domain has been removed.'
                    });
                    self.parent().parent().slideUp();
                }).fail(function (jqXHR) {
                    console.error(jqXHR);
                    swal({
                        type: 'error',
                        title: 'Whoops!',
                        text: 'An error occurred while attempting to remove this domain.'
                    });
                });
            });
        });
    });
</script>
@endsection
