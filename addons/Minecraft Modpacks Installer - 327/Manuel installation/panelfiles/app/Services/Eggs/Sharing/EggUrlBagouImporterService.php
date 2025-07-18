<?php

namespace Pterodactyl\Services\Eggs\Sharing;

use Ramsey\Uuid\Uuid;
use Illuminate\Support\Arr;
use Pterodactyl\Models\Egg;
use Pterodactyl\Models\Nest;
use Illuminate\Http\UploadedFile;
use Pterodactyl\Models\EggVariable;
use Illuminate\Database\ConnectionInterface;
use Pterodactyl\Services\Eggs\EggParserService;
use Pterodactyl\Models\Bagoulicense;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Collection;

class EggUrlBagouImporterService
{
    protected ConnectionInterface $connection;

    protected EggParserService $parser;

    public function __construct(ConnectionInterface $connection, EggParserService $parser)
    {
        $this->connection = $connection;
        $this->parser = $parser;
    }

    /**
     * Take an uploaded JSON file and parse it into a new egg.
     *
     * @throws \Pterodactyl\Exceptions\Service\InvalidFileUploadException|\Throwable
     */
    public function handle(string $type, string $nest ): Egg
    {
        $license = Bagoulicense::where('addon', '327')->first();
        if(!$license) {
            return new BadRequestHttpException('No license for this addons please setup the license trough admin tab.');
        }
        $license = $license['license'];
        $parsed = Http::get("http://api.bagou450.com/api/client/pterodactyl/modpacks/getEgg?id=$license&type=$type")->json();
        $egg = Egg::where('name', '=', $parsed['name'])->first();
        if(!$egg || $egg === null) {
            $nest = Nest::query()->with('eggs', 'eggs.variables')->findOrFail($nest);

        return $this->connection->transaction(function () use ($nest, $parsed) {
            $egg = (new Egg())->forceFill([
                'uuid' => Uuid::uuid4()->toString(),
                'nest_id' => $nest->id,
                'author' => Arr::get($parsed, 'author'),
                'copy_script_from' => null,
            ]);

            $egg = $this->parser->fillFromParsed($egg, $parsed);
            $egg->save();

            foreach ($parsed['variables'] ?? [] as $variable) {
                EggVariable::query()->forceCreate(array_merge($variable, ['egg_id' => $egg->id]));
            }

            return $egg;
        });
        } else {
            return $this->connection->transaction(function () use ($egg, $parsed) {
                $egg = $this->parser->fillFromParsed($egg, $parsed);
                $egg->save();
    
                // Update existing variables or create new ones.
                foreach ($parsed['variables'] ?? [] as $variable) {
                    EggVariable::unguarded(function () use ($egg, $variable) {
                        $egg->variables()->updateOrCreate([
                            'env_variable' => $variable['env_variable'],
                        ], Collection::make($variable)->except('egg_id', 'env_variable')->toArray());
                    });
                }
    
                $imported = array_map(fn ($value) => $value['env_variable'], $parsed['variables'] ?? []);
    
                $egg->variables()->whereNotIn('env_variable', $imported)->delete();
    
                return $egg->refresh();
            });
        }
        /** @var \Pterodactyl\Models\Nest $nest */
        
    }
}

