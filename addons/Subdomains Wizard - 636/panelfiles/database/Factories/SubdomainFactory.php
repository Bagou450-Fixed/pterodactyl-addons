<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;
use Pterodactyl\Models\Bagou\Subdomain\Subdomain;

class SubdomainFactory extends Factory
{
    protected $model = Subdomain::class;

    public function definition()
    {
        return [
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
            'name' => $this->faker->word(),
            'domain_id' => $this->faker->randomNumber(),
            'server_id' => $this->faker->randomNumber(),
            'api_id' => $this->faker->randomNumber(),
            'record_id' => $this->faker->randomNumber(),
            'type' => $this->faker->word(),
        ];
    }
}
