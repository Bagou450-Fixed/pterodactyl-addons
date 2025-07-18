<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCreatedatAndUpdatedatFieldToMcplugins extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('mcplugins', function (Blueprint $table) {
            if (Schema::hasColumn('mcplugins', 'installdate'))
            {
                $table->dropColumn('installdate');
            }
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

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
            $table->dropColumn('updated_at');
            $table->dropColumn('created_at');

        });
    }
}

