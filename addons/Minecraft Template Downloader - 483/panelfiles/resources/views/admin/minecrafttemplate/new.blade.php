@extends('layouts.admin')

@section('title')
    Create Minecraft Template
@endsection

@section('content-header')
    <h1>Create Minecraft Template
        <small>You can add minecraft template.</small>
    </h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.minecrafttemplate') }}">Minecraft Template Manager</a></li>
        <li class="active">Create Minecraft Template</li>
    </ol>
@endsection

@section('content')
    <div class="row">
        <div class="col-xs-12">
            <div class="box box-primary">
                <div class="box-header with-border">
                    <h3 class="box-title">Minecraft Template</h3>
                    <div class="box-tools">
                        <a href="{{ route('admin.minecrafttemplate') }}">
                            <button type="button" class="btn btn-sm btn-primary"
                                    style="border-radius: 0 3px 3px 0;margin-left:-1px;">Go Back
                            </button>
                        </a>
                    </div>
                </div>
                <form method="post" action="{{ route('admin.minecrafttemplate.create')  }}">
                    <div class="box-body">
                        <div class="form-group">
                            <label for="name" class="form-label">Name</label>
                            <input type="text" name="name" id="name" class="form-control"
                                   placeholder="My minecraft template" />
                        </div>
                        <div class="form-group">
                            <label for="smalldescription" class="form-label">Small description</label>
                            <input type="text" name="smalldescription" id="smalldescription" class="form-control"
                                   placeholder="This is a template with many minigame servers like bedward and spleef!" />
                        </div>
                        <div class="form-group">
                            <label for="baseurl" class="form-label">Template URL</label>
                            <input type="text" name="baseurl" id="baseurl" class="form-control"
                                   placeholder="https://google.fr" />
                        </div>
                        <div class="form-group">
                            <label for="logourl" class="form-label">Logo URL (64x64 recommended)</label>
                            <input type="text" name="logourl" id="logourl" class="form-control"
                                   placeholder="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png" />
                        </div>

                        <div class="form-group">
                        <label for="removeall" class="control-label">Remove all files?</label>
                        <div>
                            <select name="removeall" class="form-control">
                                <option value="0">@lang('strings.no')</option>
                                <option value="1">@lang('strings.yes')</option>
                            </select>
                            <p class="text-muted"><small>If you set it to yes all files are going to be removed before template instalation.</small></p>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="zip" class="control-label">Its a zip?</label>
                        <div>
                            <select name="zip" class="form-control">
                                <option value="0">@lang('strings.no')</option>
                                <option value="1">@lang('strings.yes')</option>
                            </select>
                            <p class="text-muted"><small>If you set it to yes all files are going to be decompressed.</small></p>
                        </div>
                    </div>
                        <div class="box-footer">
                        {!! csrf_field() !!}
                        <button class="btn btn-success pull-right" type="submit">Create</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection 
