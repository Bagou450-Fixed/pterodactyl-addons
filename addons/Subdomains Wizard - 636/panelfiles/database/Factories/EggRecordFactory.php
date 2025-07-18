<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;
use Pterodactyl\Models\Bagou\Subdomain\EggRecord;

class EggRecordFactory extends Factory
{
    protected $model = EggRecord::class;

    public function definition(): array
    {
        return [
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ];
    }
}
