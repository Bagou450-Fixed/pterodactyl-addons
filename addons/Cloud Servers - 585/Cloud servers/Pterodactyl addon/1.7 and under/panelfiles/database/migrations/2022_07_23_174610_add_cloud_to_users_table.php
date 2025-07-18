<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCloudToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('cloud')->default(false);
            $table->Biginteger('cloud_database')->default(0);
            $table->Biginteger('cloud_allocation')->default(0);
            $table->Biginteger('cloud_backup')->default(0);
            $table->Biginteger('cloud_cpu')->default(0);
            $table->Biginteger('cloud_ram')->default(0);
            $table->Biginteger('cloud_disk')->default(0);
            $table->Biginteger('cloud_users')->default(0);
            $table->Biginteger('cloud_servers')->default(0);
            $table->boolean('subcloud')->default(false);
            $table->integer('subcloud_owner')->default(0);

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('cloud');
            $table->dropColumn('cloud_database');
            $table->dropColumn('cloud_allocation');
            $table->dropColumn('cloud_backup');
            $table->dropColumn('cloud_cpu');
            $table->dropColumn('cloud_ram');
            $table->dropColumn('cloud_disk');
            $table->dropColumn('cloud_users');
            $table->dropColumn('cloud_servers');
            $table->dropColumn('subcloud');
            $table->dropColumn('subcloud_owner');
        });
    }
}
