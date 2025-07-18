<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('subdomains', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type');
            $table->foreignId('domain_id');
            $table->foreignId('server_id');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('subdomains');
    }
};
