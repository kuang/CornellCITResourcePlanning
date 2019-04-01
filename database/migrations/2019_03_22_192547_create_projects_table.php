<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProjectsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {

        Schema::dropIfExists('projects');

        Schema::create('projects', function (Blueprint $table) {
            $table->bigIncrements('ProjectID');
            $table->string("ProjectName")->unique();
            $table->string("Technology");
            $table->integer("EstMaxHours");
            $table->string("Status");
            $table->date("StartDate");
            $table->date("DueDate");
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('projects');
    }
}
