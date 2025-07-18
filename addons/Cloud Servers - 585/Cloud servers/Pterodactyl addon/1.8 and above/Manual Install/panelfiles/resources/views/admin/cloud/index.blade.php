@extends('layouts.admin')

@section('title')
    Cloud Servers
@endsection

@section('content-header')
    <h1>Cloud Servers<small>Manage Cloud servers here.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Cloud Servers</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        
        <div class="col-md-12 col-xs-12">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">Settings</h3>
                </div>
                <form method="post" action="{{ route('admin.cloud.savesettings')  }}">
                    <div class="box-body">
                        <div class="form-group">
                            <label for="eggsList">Available Eggs</label>
                        <div>
                            <select name="add_eggs[]" class="form-control" multiple id="eggsList">
                                @foreach($eggs as $egg)
                                <option value="{{ $egg->id }}"
                                    @if($egg->cloud)
                                        selected="selected"
                                    @endif
                                >{{ $egg->name }}</option>
                                @endforeach
                            </select>
                            
                        </div>
                        </div>
                        <div class="form-group">
                        <label class="form-label"><span class="label label-success"><i class="fa fa-sitemap"></i></span>  Node selection</label>
                        <select name="nodeselection" class="form-control" id="nodeselection">
                                <option value=true
                                    @if($nodeselection == 'true')
                                        selected="selected"
                                    @endif
                                >Enable</option>
                                <option value=false
                                    @if($nodeselection == 'false')
                                        selected="selected"
                                    @endif
                                >Disable</option>
                            </select>
                        <p class="text-muted small">If enabled user can choose a node during the server creation.</p>
                        <label class="form-label"><span class="label label-success"><i class="fa fa-map"></i></span>  Location selection</label>

                        <select name="locationselection" class="form-control" id="locationselection">
                                <option value=true
                                    @if($locationselection == 'true')
                                        selected="selected"
                                    @endif
                                >Enable</option>
                                <option value=false
                                    @if($locationselection == 'false')
                                        selected="selected"
                                    @endif
                                >Disable</option>
                            </select>
                        <p class="text-muted small">If enabled user can choose a location during the server creation.</p>
                    </div>
                    </div>
                    <div class="box-footer">
                        {!! csrf_field() !!}
                        <button type="submit" class="btn btn-success pull-right">Save</button>
                    </div>
                </form>
            </div>
        </div>
        <div class="col-md-12 col-xs-12">
        <div class="box box-warning">

        <div class="box-header with-border">
                    <h3 class="box-title">Cloud nodes List</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <tbody>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Memory</th>
                            <th>Disk</th>
                            <th class="text-center">Servers</th>
                            <th class="text-center">SSL</th>
                            <th class="text-center">Public</th>
                        </tr>
                        @foreach ($cloudnodes as $node)
                            <tr>
                                <td class="text-center text-muted left-icon" data-action="ping" data-secret="{{ $node->getDecryptedKey() }}" data-location="{{ $node->scheme }}://{{ $node->fqdn }}:{{ $node->daemonListen }}/api/system"><i class="fa fa-fw fa-refresh fa-spin"></i></td>
                                <td>{!! $node->maintenance_mode ? '<span class="label label-warning"><i class="fa fa-wrench"></i></span> ' : '' !!} <a href="{{ route('admin.nodes.view', $node->id) }}">{{ $node->name }}</a> {!! $node->cloud ? '<i class="fa fa-cloud"></i> ' : '' !!} </td>
                                <td>{{ $node->location->short }}</td>
                                <td>{{ $node->memory }} MB</td>
                                <td>{{ $node->disk }} MB</td>
                                <td class="text-center">{{ $node->servers_count }}</td>
                                <td class="text-center" style="color:{{ ($node->scheme === 'https') ? '#50af51' : '#d9534f' }}"><i class="fa fa-{{ ($node->scheme === 'https') ? 'lock' : 'unlock' }}"></i></td>
                                <td class="text-center"><i class="fa fa-{{ ($node->public) ? 'eye' : 'eye-slash' }}"></i></td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </div>
</div>
</div>
<div class="col-md-12 col-xs-12">
        <div class="box box-primary">

        <div class="box-header with-border">
                    <h3 class="box-title">Cloud Location List</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <tbody>
                        <tr>
                            <th class="text-center">ID</th>
                            <th>Short Code</th>
                            <th >Description</th>
                        </tr>
                        @foreach ($cloudlocations as $location)
                            <tr>
                                <td class="text-center">{{ $location->id }}</td>
                                <td><a href="{{ route('admin.locations.view', $location->id) }}">{{ $location->short }}</a> {!! $location->cloud ? '<i class="fa fa-cloud"></i> ' : '' !!} </td>
                                <td>{{ $location->long }}</td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </div>
</div>
</div>
        <div class="col-md-12 col-xs-12">
            <div class="box box-success">
                <div class="box-header with-border">
                    <h3 class="box-title">Cloud servers List</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <tbody>
                        <tr>
                            <th>Server Name</th>
                            <th>UUID</th>
                            <th>Owner</th>
                            <th>Node</th>
                            <th>Connection</th>
                            <th></th>
                            <th></th>
                        </tr>
                        @foreach ($cloudservers as $server)
                            <tr data-server="{{ $server->uuidShort }}">
                                <td><a href="{{ route('admin.servers.view', $server->id) }}">{{ $server->name }}</a></td>
                                <td><code title="{{ $server->uuid }}">{{ $server->uuid }}</code></td>
                                <td><a href="{{ route('admin.users.view', $server->user->id) }}">{{ $server->user->username }}</a></td>
                                <td><a href="{{ route('admin.nodes.view', $server->node->id) }}">{{ $server->node->name }}</a></td>
                                <td>
                                    <code>{{ $server->allocation->alias }}:{{ $server->allocation->port }}</code>
                                </td>
                                <td class="text-center">
                                    @if($server->isSuspended())
                                        <span class="label bg-maroon">Suspended</span>
                                    @elseif(! $server->isInstalled())
                                        <span class="label label-warning">Installing</span>
                                    @else
                                        <span class="label label-success">Active</span>
                                    @endif
                                </td>
                                <td class="text-center">
                                    <a class="btn btn-xs btn-default" href="/server/{{ $server->uuidShort }}"><i class="fa fa-wrench"></i></a>
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
    $('#eggsList').select2();
    </script>

<script>
    (function pingNodes() {
        $('td[data-action="ping"]').each(function(i, element) {
            $.ajax({
                type: 'GET',
                url: $(element).data('location'),
                headers: {
                    'Authorization': 'Bearer ' + $(element).data('secret'),
                },
                timeout: 5000
            }).done(function (data) {
                $(element).find('i').tooltip({
                    title: 'v' + data.version,
                });
                $(element).removeClass('text-muted').find('i').removeClass().addClass('fa fa-fw fa-heartbeat faa-pulse animated').css('color', '#50af51');
            }).fail(function (error) {
                var errorText = 'Error connecting to node! Check browser console for details.';
                try {
                    errorText = error.responseJSON.errors[0].detail || errorText;
                } catch (ex) {}

                $(element).removeClass('text-muted').find('i').removeClass().addClass('fa fa-fw fa-heart-o').css('color', '#d9534f');
                $(element).find('i').tooltip({ title: errorText });
            });
        }).promise().done(function () {
            setTimeout(pingNodes, 10000);
        });
    })();
    </script>
@endsection




