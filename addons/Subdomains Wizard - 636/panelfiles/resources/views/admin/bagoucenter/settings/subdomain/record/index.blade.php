@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'basic'])

@section('title')
    Bagou Center - List of Records
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
                    <h3 class="box-title">Bagou450 Record Manager</h3>
                    <div class="input-group-btn">
                        <a href="{{ route('admin.bagoucenter.settings.subdomain.record.new') }}"><button type="button" class="btn btn-sm btn-primary" style="border-radius: 0 3px 3px 0;margin-left:-1px;">Create New</button></a>
                    </div>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <tbody>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Domain</th>
                            <th class="text-center">Action</th>
                        </tr>
                        @foreach ($records->items() as $record)
                            <tr>
                                <td><code>{{ $record->id }}</code></td>
                                <td>{{ $record->name }}</td>
                                <td>{{ $record->type }}</td>
                                <td>{{ $record->domain_id }}</td> <!-- Replace this with domain name if you have the domain object -->
                                <td class="text-center">
                                    <a href="{{route('admin.bagoucenter.settings.subdomain.record.edit', ['record' => $record->id])}}" >
                                        <i class="fa fa-edit text-primary" style="margin-right: 15px;"></i>
                                    </a>
                                    <a href="#" data-action="remove-record" data-attr="{{ $record->id }}">
                                        <i class="fa fa-trash-o text-danger"></i>
                                    </a>
                                </td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                    <div class="text-center">
                        {!! $records->links() !!}
                    </div>

                </div>
            </div>
        </div>
    </div>

@endsection

@section('footer-scripts')
    @parent
    <script>
        $(document).ready(function() {
            $('[data-action="remove-record"]').click(function (event) {
                var self = $(this);
                event.preventDefault();
                swal({
                    type: 'error',
                    title: 'Remove this record?',
                    text: 'This action can\'t be cancelled!',
                    showCancelButton: true,
                    allowOutsideClick: true,
                    closeOnConfirm: false,
                    confirmButtonText: 'Remove',
                    confirmButtonColor: '#d9534f',
                    showLoaderOnConfirm: true
                }, function () {
                    $.ajax({
                        method: 'DELETE',
                        url: `/admin/bagoucenter/settings/subdomain/record/${self.data('attr')}`,
                        headers: {
                            'X-CSRF-TOKEN': '{{ csrf_token() }}'
                        }
                    }).done(function () {
                        swal({
                            type: 'success',
                            title: '',
                            text: 'Record has been removed.'
                        });
                        self.parent().parent().slideUp();
                    }).fail(function (jqXHR) {
                        console.error(jqXHR);
                        swal({
                            type: 'error',
                            title: 'Whoops!',
                            text: 'An error occurred while attempting to remove this record.'
                        });
                    });
                });
            });
        });
    </script>
@endsection
