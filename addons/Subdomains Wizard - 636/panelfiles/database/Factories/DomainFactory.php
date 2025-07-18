<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;
use Pterodactyl\Models\Bagou\Subdomain\Domain;

class DomainFactory extends Factory
{
    protected $model = Domain::class;

    public function definition()
    {
        return [
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
            'name' => $this->faker->name(),
            'displayType' =>  $this->faker->word(),
            'type' => $this->faker->word(),
            'key' => $this->faker->word(),
            'secret' => $this->faker->word(),
            'consumer' => $this->faker->word(),
            'cloudflare_id' => $this->faker->word(),
            'ovh_api' => $this->faker->word(),

        ];
    }
}
