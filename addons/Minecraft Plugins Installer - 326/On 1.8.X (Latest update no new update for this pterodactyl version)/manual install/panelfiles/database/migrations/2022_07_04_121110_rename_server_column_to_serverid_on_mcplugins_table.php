<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RenameServerColumnToServeridOnMcpluginsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('mcplugins', function (Blueprint $table) {
            $table->renameColumn('server', 'server_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('mcplugins', function (Blueprint $table) {
            $table->renameColumn('server_id', 'server');
        });
    }
}

