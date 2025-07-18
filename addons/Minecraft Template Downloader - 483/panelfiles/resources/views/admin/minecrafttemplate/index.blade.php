@extends('layouts.admin')

@section('title')
    Minecraft Template
@endsection

@section('content-header')
    <h1>Minecraft Template Manager<small>You can create, edit, delete minecraft template.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Minecraft Template</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        <div class=" col-xs-12">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">Minecraft Template</h3>
                    <div class="box-tools">
                        <div class="box-tools">
                        <a href="{{ route('admin.minecrafttemplate.new') }}"><button type="button" class="btn btn-sm btn-primary" style="border-radius: 0 3px 3px 0;margin-left:-1px;">Create New</button></a>
                    </div>
                    </div>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <tbody>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Template URL</th>
                            <th>LOGO URL</th>
                            <th>Remove all files</th>
                            <th>Compressed</th>
                            <th>Action</th>
                        </tr>
                        @foreach ($minecrafttemplate as $code)
                            <tr>
                                <td>{{$code['id']}}</td>
                                <td>{{$code['name']}}</td>
                                <td>{{$code['baseurl']}}</td>
                                <td>{{$code['logourl']}}</td>
                                <td style="color:{{ ($code['removeall']) ? '#50af51' : '#d9534f' }}"><i class="fa fa-{{ ($code['removeall']) ? 'check' : 'close' }}"></i></td>
                                <td style="color:{{ ($code['zip']) ? '#50af51' : '#d9534f' }}"><i class="fa fa-{{ ($code['zip']) ? 'check' : 'close' }}"></i></td>
                                <td><a title="Delete" class="btn btn-xs btn-danger" data-action="delete" data-id="{{ $code['id'] }}"><i class="fa fa-trash"></i></a></td>

                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </div>
        </div>
    </div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        $('[data-action="delete"]').click(function (event) {
            event.preventDefault();
            let self = $(this);
            swal({
                title: '',
                type: 'warning',
                text: 'Are you sure you want to delete this template?',
                showCancelButton: true,
                confirmButtonText: 'Delete',
                confirmButtonColor: '#d9534f',
                closeOnConfirm: false,
                showLoaderOnConfirm: true,
                cancelButtonText: 'Cancel',
            }, function () {
                $.ajax({
                    method: 'DELETE',
                    url: '/admin/minecrafttemplate/delete',
                    headers: {'X-CSRF-TOKEN': $('meta[name="_token"]').attr('content')},
                    data: {
                        id: self.data('id')
                    }
                }).done((data) => {
                    if (data.success === true) {
                        swal({
                            type: 'success',
                            title: 'Success!',
                            text: 'You have successfully deleted this template.'
                        });
                        self.parent().parent().slideUp();
                    } else {
                        swal({
                            type: 'error',
                            title: 'Ooops!',
                            text: (typeof data.error !== 'undefined') ? data.error : 'Failed to delete this template! Please try again later...'
                        });
                    }
                }).fail(() => {
                    swal({
                        type: 'error',
                        title: 'Ooops!',
                        text: 'A system error has occurred! Please try again later...'
                    });
                });
            });
        });
    </script>
@endsection 
