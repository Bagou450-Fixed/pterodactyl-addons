@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'basic'])

@section('title')
    Bagou Center - new record
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
    <form action="{{ route('admin.bagoucenter.settings.subdomain.record.store') }}" method="POST">
        <div class="row">
            <div class="col-md-12">
                <div class="box">
                    <div class="box-header with-border">
                        <h3 class="box-title">New Record</h3>
                    </div>
                    <div class="box-body">
                        <div class="form-group">
                            <label class="control-label">Name</label>
                            <div>
                                <input required type="text" name="name" class="form-control" value="{{ old('name') }}" />
                                <p class="text-muted"><small>This name serves as a point of reference for you and your customers. It will be visible to your customers when creating a record and allows them to choose from all record types associated with their servers (EggIds).</small></p>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Domain</label>
                            <div>
                                <select name="domain_id" class="form-control">
                                    @foreach($domains as $domain)
                                        <option value={{$domain->id}}>{{ $domain->name }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Eggs</label>
                            <div>
                                <select name="egg_ids[]" class="form-control" multiple id="eggs">
                                    @foreach($eggs as $egg)
                                        <option value="{{$egg->id}}">{{ $egg->name }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Type</label>
                            <div>
                                <select name="type" class="form-control">
                                    <option value="SRV">SRV</option>
                                    <option value="CNAME">CNAME</option>

                                </select>
                            </div>
                        </div>
                        <div id="srv">
                            <div class="form-group">
                                <label class="control-label">TTL</label>
                                <div>
                                    <input required type="text" id="ttl" name="ttl" class="form-control" value="{{ old('ttl') }}" />
                                </div>
                            </div>
                        
                            <div class="form-group">
                                <label class="control-label">Protocol</label>
                                <div>
                                    <select id="protocol" name="protocol" class="form-control">
                                        <option value="tcp">TCP</option>
                                        <option value="udp">UDP</option>

                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="control-label">Priority</label>
                                <div>
                                    <input required id="priority" type="text" name="priority" class="form-control" value="{{ old('priority') }}" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="control-label">Weight</label>
                                <div>
                                    <input required id="weight" type="text" name="weight" class="form-control" value="{{ old('weight') }}" />
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="control-label">Service</label>
                                <div>
                                    <input required id="service" type="text" name="service" class="form-control" value="{{ old('service') }}" />
                                    <p class="text-muted"><small>Get most common services on <a href="#">our documentation</a>.</small></p>

                                </div>
                            </div>
                        </div>

                    </div>
                    <div class="box-footer">
                        {!! csrf_field() !!}
                        <button type="submit" class="btn btn-primary pull-right">Save</button>
                    </div>
                </div>
            </div>
        </div>
    </form>
@endsection


@section('footer-scripts')
    @parent
    <script>
        $(document).ready(function () {
            $('#eggs').select2();

            function toggleFields(type) {
                const show = type === 'SRV';
                $('#srv').toggle(show);
                $('#ttl').attr('required', show);
                $('#protocol').attr('required', show);
                $('#priority').attr('required', show);
                $('#weight').attr('required', show);
                $('#service').attr('required', show);

            }
            $('select[name="type"]').change(function() {
                toggleFields($(this).val());
            });
        });
    </script>
@endsection
