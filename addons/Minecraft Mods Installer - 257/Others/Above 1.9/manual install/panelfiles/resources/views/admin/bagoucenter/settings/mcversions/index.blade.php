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

<div class="row" style="margin-top: 15px;">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Bagou Modpacks list</h3>
                    <div class="box-tools">
                    <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#newModPackModal">Create New</button>
                </div>
                </div>
                <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <tbody>
                        <tr>
                            <th>Icon</th>
                            <th>Name</th>
                            <th>Version</th>
                            <th>McVersion</th>
                            <th>URL</th>
                            <th></th>
                        </tr>
                        @foreach ($modpacks as $modpack)
                            <tr>

                                <td><img src="{{ $modpack->icon }}" alt="modpack icon" height="64px" width="64px"/> </td>
                                <td>{{ $modpack->name }}</td>
                                <td>{{ $modpack->version }}</td>
                                <td>{{ $modpack->mcversion }}</td>
                                <td>{{ $modpack->url }}</td>
                                <td>
                                    <a href="#" data-action="remove-modpack" data-attr="{{ $modpack->id }}">
                                        <i class="fa fa-trash-can text-danger"></i>
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
<div class="modal fade" id="newModPackModal" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <form action="{{ route('admin.bagoucenter.settings.addon.mcversions') }}" method="POST">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title">Create New Modpack</h4>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="pName" class="form-label">Name</label>
                        <input type="text" name="name" id="pName" class="form-control" />
                        <p class="text-muted small">The name of the modpack</p>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <label for="pHost" class="form-label">Version</label>
                            <input type="text" name="version" id="pVersion" class="form-control" />
                            <p class="text-muted small">The version of the modpack</p>
                        </div>
                        <div class="col-md-6">
                            <label for="pPort" class="form-label">Minecraft Version</label>
                            <input type="text" name="mcversion" id="pMcversion" class="form-control"/>
                            <p class="text-muted small">The Minecraft version of the modpack.</p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="pUrl" class="form-label">Url</label>
                        <input type="text" name="url" id="pUrl" class="form-control" />
                        <p class="text-muted small">The download url of the modpack (This MUST be a direct download link)</p>
                    </div>
                    <div class="form-group">
                        <label for="pIcon" class="form-label">Icon</label>
                        <input type="text" name="icon" id="pIcon" class="form-control" />
                        <p class="text-muted small">The icon of the modpack (must be a direct link).</p>
                    </div>
                </div>
                <div class="modal-footer">
                    {!! csrf_field() !!}
                    <button type="button" class="btn btn-secondary btn-sm pull-left" data-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-success btn-sm">Create</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
        $(document).ready(function() {
            $('[data-action="remove-modpack"]').click(function (event) {
                var self = $(this);
                event.preventDefault();
                swal({
                    type: 'warning',
                    title: 'Remove the modpack?',
                    showCancelButton: true,
                    allowOutsideClick: true,
                    closeOnConfirm: false,
                    confirmButtonText: 'Remove',
                    confirmButtonColor: '#d9534f',
                    showLoaderOnConfirm: true
                }, function () {
                    $.ajax({
                        method: 'DELETE',
                        url: '/admin/bagoucenter/settings/addon/mcversions/' + self.data('attr'),
                        headers: {
                            'X-CSRF-TOKEN': '{{ csrf_token() }}'
                        }
                    }).done(function () {
                        swal({
                            type: 'success',
                            title: 'Removed!',
                            text: 'Modpack removed sucessfully.'
                        });
                        self.parent().parent().slideUp();
                    }).fail(function (jqXHR) {
                        console.error(jqXHR);
                        swal({
                            type: 'error',
                            title: 'Whoops!',
                            text: 'An error occurred while attempting to remove this modpack.'
                        });
                    });
                });
            });
        });
    </script>
@endsection
