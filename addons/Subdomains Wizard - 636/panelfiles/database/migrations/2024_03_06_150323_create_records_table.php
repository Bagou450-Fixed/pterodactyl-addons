<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('records', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('ttl')->nullable();
            $table->string('type');
            $table->string('protocol')->nullable();
            $table->string('priority')->nullable();
            $table->string('weight')->nullable();
            $table->string('service')->nullable();

            $table->foreignId('domain_id');
            $table->timestamps();
        });
        Schema::table('subdomains', function (Blueprint $table) {
            $table->foreignId('record_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('records');
        Schema::table('subdomains', function (Blueprint $table) {
            $table->dropColumn('record_id');
        });
    }
};
