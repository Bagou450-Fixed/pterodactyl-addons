<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMinecrafttemplateTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('minecrafttemplate', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('smalldescription');
            $table->string('baseurl');
            $table->string('logourl')->nullable();
            $table->boolean('removeall');
            $table->boolean('zip');

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('minecraftbase');
    }
}
