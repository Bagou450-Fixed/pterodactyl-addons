<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->longText('key')->change();
            $table->longText('secret')->change();
            $table->longText('consumer')->change();
            $table->longText('cloudflare_id')->change();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('domains', function (Blueprint $table) {
            $table->text('key')->change();
            $table->text('secret')->change();
            $table->text('consumer')->change();
            $table->text('cloudflare_id')->change();

        });
    }
};
