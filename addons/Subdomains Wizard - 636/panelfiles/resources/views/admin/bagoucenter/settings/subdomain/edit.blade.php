@extends('layouts.admin')
@include('partials/admin.settings.nav', ['activeTab' => 'basic'])

@section('title')
Bagou Center - edit domain
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


<form action="{{ route('admin.bagoucenter.settings.subdomain.editconfirm', ['domain' => $domain->id]) }}" method="POST">
    <div class="row">
        <div class="col-md-12">
            <div class="box">
                <div class="box-header with-border">
                    <h3 class="box-title">Edit Domain</h3>
                </div>
                <div class="box-body">
                    <div class="form-group">
                        <label class="control-label">Domain name</label>
                        <div>
                            <input value="{{ old('name', $domain->name) }}" type="text" name="name" class="form-control" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="control-label">Provider</label>
                        <div>
                            <select name="type" class="form-control" >
                                @foreach ($providers as $key => $provider)
                                    <option value="{{$key}}"  {{ old('type', $domain->type) == $key ? 'selected' : '' }}>{{$provider['title']}}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="control-label">Key</label>
                        <div>
                            <input type="text" name="key" class="form-control" value="{{ old('key') }}" />
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="control-label">Secret</label>
                        <div>
                            <input id="secret" type="text" name="secret" class="form-control" value="{{ old('secret') }}" />
                        </div>
                    </div>
                    <div  class="form-group">
                        <label class="control-label">Consumer</label>
                        <div>
                            <input id="consumer" type="text" name="consumer" class="form-control" value="{{ old('consumer') }}" />
                        </div>
                    </div>
                    <div  class="form-group">
                        <label class="control-label">Cloudflare ID</label>
                        <div>
                            <input required id="cloudflare_id" type="text" name="cloudflare_id" class="form-control" value="{{ old('cloudflare_id', $domain->cloudflare_id) }}" />
                            <p class="text-muted"><small>The domain id that can be found on your Cloudflare dashboard.</small></p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="control-label">OVH Api</label>
                        <div>
                            <select id="ovh_api" name="ovh_api" class="form-control">
                                <option value="eu" {{ old('type', $domain->ovh_api) == 'eu' ? 'selected' : '' }}>EU</option>
                                <option value="us" {{ old('type', $domain->ovh_api) == 'us' ? 'selected' : '' }}>US</option>
                                <option value="ca" {{ old('type', $domain->ovh_api) == 'ca' ? 'selected' : '' }}>CA</option>
                            </select>
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
        var initialProviderKey = $('select[name="type"]').val();
        toggleFields(initialProviderKey);
        function toggleFields(providerKey) {
            const providers = @json($providers);
            const selectedProvider = providers[providerKey];
            $('#secret').parent().parent().toggle(selectedProvider.secret !== false);
            $('#consumer').parent().parent().toggle(selectedProvider.consumer !== false);
            $('#cloudflare_id').parent().parent().toggle(selectedProvider.title.toLowerCase()  === "cloudflare");
            $('#ovh_api').parent().parent().toggle(selectedProvider.title.toLowerCase()  === "ovh");

            if (selectedProvider.secret !== false) {
                $('#secret').attr('required', true);
            } else {
                $('#secret').removeAttr('required');
            }

            if (selectedProvider.consumer !== false) {
                $('#consumer').attr('required', true);
            } else {
                $('#consumer').removeAttr('required');
            }
            if (selectedProvider.title.toLowerCase()  === "cloudflare") {
                $('#cloudflare_id').attr('required', true);
            } else {
                $('#cloudflare_id').removeAttr('required');
            }
            if (selectedProvider.title.toLowerCase()  === "ovh") {
                $('#ovh_api').attr('required', true);
            } else {
                $('#ovh_api').removeAttr('required');
            }
        }
        $('select[name="type"]').change(function() {
            toggleFields($(this).val());
        });
    });
</script>
@endsection
