<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;
use Pterodactyl\Models\Bagou\Subdomain\Record;

class RecordFactory extends Factory
{
    protected $model = Record::class;

    public function definition(): array
    {
        return [
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
            'name' => $this->faker->word(),
            'service' => $this->faker->word(),
            'ttl' => $this->faker->word(),
            'type' => $this->faker->word(),
            'domain_id' => $this->faker->randomNumber(),
            'protocol' => $this->faker->word(),
            'priority' => $this->faker->word(),
            'weight' => $this->faker->word(),
        ];
    }
}
