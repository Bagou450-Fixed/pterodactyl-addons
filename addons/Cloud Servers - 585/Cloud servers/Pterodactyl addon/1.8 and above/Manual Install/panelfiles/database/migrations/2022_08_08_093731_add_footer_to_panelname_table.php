<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFooterToPanelnameTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('panelname', function (Blueprint $table) {
            $table->string('footer')->nullable();
            $table->string('footerlink')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('panelname', function (Blueprint $table) {
            $table->dropColumn('footer');
            $table->dropColumn('footerlink');
        });
    }
}
