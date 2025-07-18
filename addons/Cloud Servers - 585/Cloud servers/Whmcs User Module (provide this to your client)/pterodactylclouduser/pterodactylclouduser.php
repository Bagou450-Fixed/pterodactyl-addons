<?php

/**
MIT License

Copyright (c) 2018-2019 Stepan Fedotov <stepan@crident.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
**/

if(!defined("WHMCS")) {
    die("This file cannot be accessed directly");
}

use Illuminate\Database\Capsule\Manager as Capsule;

function pterodactylclouduser_GetHostname(array $params) {
    $hostname = $params['serverhostname'];
    if ($hostname === '') throw new Exception('Could not find the panel\'s hostname - did you configure server group for the product?');

    // For whatever reason, WHMCS converts some characters of the hostname to their literal meanings (- => dash, etc) in some cases
    foreach([
        'DOT' => '.',
        'DASH' => '-',
    ] as $from => $to) {
        $hostname = str_replace($from, $to, $hostname);
    }

    if(ip2long($hostname) !== false) $hostname = 'http://' . $hostname;
    else $hostname = ($params['serversecure'] ? 'https://' : 'http://') . $hostname;

    return rtrim($hostname, '/');
}

function pterodactylclouduser_API(array $params, $endpoint, array $data = [], $method = "GET", $dontLog = false) {
    $url = pterodactylclouduser_GetHostname($params) . '/api/client/cloud/' . $endpoint;

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($curl, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
    curl_setopt($curl, CURLOPT_USERAGENT, "PterodactylCloud-User-WHMCS");
    curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($curl, CURLOPT_POSTREDIR, CURL_REDIR_POST_301);
    curl_setopt($curl, CURLOPT_TIMEOUT, 5);

    $headers = [
        "Authorization: Bearer " . $params['serverpassword'],
        "Accept: Application/vnd.pterodactyl.v1+json",
    ];

    if($method === 'POST' || $method === 'PATCH') {
        $jsonData = json_encode($data);
        curl_setopt($curl, CURLOPT_POSTFIELDS, $jsonData);
        array_push($headers, "Content-Type: application/json");
        array_push($headers, "Content-Length: " . strlen($jsonData));
    }

    curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($curl);
    $responseData = json_decode($response, true);
    $responseData['status_code'] = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    
    if($responseData['status_code'] === 0 && !$dontLog) logModuleCall("PterodactylCloud-User-WHMCS", "CURL ERROR", curl_error($curl), "");

    curl_close($curl);

    if(!$dontLog) logModuleCall("PterodactylCloud-User-WHMCS", $method . " - " . $url,
        isset($data) ? json_encode($data) : "",
        print_r($responseData, true));

    return $responseData;
}

function pterodactylclouduser_Error($func, $params, Exception $err) {
    logModuleCall("PterodactylCloud-User-WHMCS", $func, $params, $err->getMessage(), $err->getTraceAsString());
}

function pterodactylclouduser_MetaData() {
    return [
        "DisplayName" => "Pterodactyl Cloud User",
        "APIVersion" => "1.1",
        "RequiresServer" => true,
    ];
}

function pterodactylclouduser_ConfigOptions() {

    $servers = Capsule::table('tblservers')->where('type','pterodactylclouduser')->get();
    $params = [];
    $params['serverpassword'] = localAPI('DecryptPassword', array( 'password2' => $servers[0]->password))['password'];
    $params['serverhostname'] = $servers[0]->hostname;
    $params['serversecure'] = $servers[0]->secure;

    $response = pterodactylclouduser_API($params, 'infos');
    if($response['status_code'] !== 200) throw new Exception('Can\'t get eggs list');
    $eggs = [];
    foreach($response['eggs'] as $egg) {
        $eggs[$egg['id']] = $egg['name'];
    }
    return [
        "cpu" => [
            "FriendlyName" => "CPU Limit (%)",
            "Description" => "Amount of CPU to assign to the created server.",
            "Type" => "text",
            "Size" => 10,
        ],
        "memory" => [
            "FriendlyName" => "Memory (MB)",
            "Description" => "Amount of Memory to assign to the created server.",
            "Type" => "text",
            "Size" => 10,
        ],
        "disk" => [
            "FriendlyName" => "Disk Space (MB)",
            "Description" => "Amount of Disk Space to assign to the created server.",
            "Type" => "text",
            "Size" => 10,
        ],
        "egg_id" => [
            "FriendlyName" => "Egg",
            "Description" => "Egg to use.",
            "Type" => "dropdown",
            "Options" => $eggs,
        ],
        "databases" => [
            "FriendlyName" => "Databases",
            "Description" => "Client will be able to create this amount of databases for their server (optional)",
            "Type" => "text",
            "Size" => 10,
        ],
        "backups" => [
            "FriendlyName" => "Backups",
            "Description" => "Client will be able to create this amount of backups for their server (optional)",
            "Type" => "text",
            "Size" => 10,
        ],
        "allocations" => [
            "FriendlyName" => "Allocations",
            "Description" => "Client will be able to create this amount of allocations for their server (optional)",
            "Type" => "text",
            "Size" => 10,
        ],
    	"server_name" => [
            "FriendlyName" => "Server Name",
            "Description" => "The name of the server as shown on the panel (optional)",
            "Type" => "text",
            "Size" => 25,
        ],
        
    ];
}

function pterodactylclouduser_TestConnection(array $params) {
    $solutions = [
        400 => "You are not a cloud user!",
        404 => "This panel don`t have any cloud addon!",
    ];

    $err = "";
    try {
        $response = pterodactylclouduser_API($params, 'infos');
        if($response['status_code'] !== 200 || !$response['available']) {
            $status_code = $response['status_code'];
            $err = "Invalid status_code received: " . $status_code . ". Possible solutions: "
                . (isset($solutions[$status_code]) ? $solutions[$status_code] : "None.");
        } else {
            if($response['eggs'] == []) {
                $err = "Authentication successful, but no eggs are available.";
            }
        }
    } catch(Exception $e) {
        pterodactylclouduser_Error(__FUNCTION__, $params, $e);
        $err = $e->getMessage();
    }

    return [
        "success" => $err === "",
        "error" => $err,
    ];
}

function randomclouduser($length) {
    if (class_exists("\Illuminate\Support\Str")) {
        return \Illuminate\Support\Str::random($length);
    } else if (function_exists("str_random")) {
        return str_random($length);
    } else {
        throw new \Exception("Unable to find a valid function for generating random strings");
    }
}

function pterodactylclouduser_GetOption(array $params, $id, $default = NULL) {


    $options = pterodactylclouduser_ConfigOptions();

    $friendlyName = $options[$id]['FriendlyName'];

    if(isset($params['configoptions'][$friendlyName]) && $params['configoptions'][$friendlyName] !== '') {
        return $params['configoptions'][$friendlyName];
    } else if(isset($params['configoptions'][$id]) && $params['configoptions'][$id] !== '') {
        return $params['configoptions'][$id];
    } else if(isset($params['customfields'][$friendlyName]) && $params['customfields'][$friendlyName] !== '') {
        return $params['customfields'][$friendlyName];
    } else if(isset($params['customfields'][$id]) && $params['customfields'][$id] !== '') {
        return $params['customfields'][$id];
    }

    $found = false;
    $i = 0;

    foreach(pterodactylclouduser_ConfigOptions() as $key => $value) {
        $i++;
        if($key === $id) {
            $found = true;
            break;
        }
    }

    if($found && isset($params['configoption' . $i]) && $params['configoption' . $i] !== '') {
        return $params['configoption' . $i];
    }

    return $default;
}
function pterodactylclouduser_CreateAccount(array $params) {
    try {
        $serverId = pterodactylclouduser_GetServerID($params);
        if(isset($serverId)) throw new Exception('Failed to create server because it is already created.');
        $email = $params['clientsdetails']['email'];
        $userResult = pterodactylclouduser_API($params, "users/search?email=$email");

        if($userResult['status_code'] !== 200) {

            $userResult = pterodactylclouduser_API($params, 'users/create', [
                'username' => pterodactylclouduser_GenerateUsername(),
                'email' => $email,
                'first' => $params['clientsdetails']['firstname'],
                'last' => $params['clientsdetails']['lastname'],
                'whmcs' => true
            ], 'POST');

        } else {
            if(!$userResult['first']) {

                $changeowner = pterodactylclouduser_API($params, "users/setowner/?email=$email");
                if($changeowner['status_code'] === 400) {
                    throw new Exception('This user is not owned by you!');
                }
                if($changeowner['status_code'] !== 204) {
                    throw new Exception('Failed to change the cloudowner of the user!');
                }
            } 

            $userResult = $userResult['user'];
        }

        if(!$userResult['id']) {
            throw new Exception('Failed to create/find user, received error code: ' . $userResult['status_code'] . '. Enable module debug log for more info.');
        }

        $eggId = pterodactylclouduser_GetOption($params, 'egg_id');

        $name = pterodactylclouduser_GetOption($params, 'server_name', pterodactylclouduser_GenerateUsername() . '_' . $params['serviceid']);

        $ram = pterodactylclouduser_GetOption($params, 'memory');
        $cpu = pterodactylclouduser_GetOption($params, 'cpu');

        $disk = pterodactylclouduser_GetOption($params, 'disk');
        $databases = pterodactylclouduser_GetOption($params, 'databases');
        $allocations = pterodactylclouduser_GetOption($params, 'allocations');
        $backups = pterodactylclouduser_GetOption($params, 'backups');
        $serverData = [
            'name' => $name,
            'userid' => (int) $userResult['id'],
            'egg' => (int) $eggId,
            'cpu' => (int) $cpu,
            'ram' => (int) $ram,
            'disk' => (int) $disk,
            'external' => 'cloud_' . $email .  $params['serviceid'],
            'databases' => (int) $databases,
            'allocations' => (int) $allocations,
            'backups' => (int) $backups,
        ];
        $server = pterodactylclouduser_API($params, 'servers/create', $serverData, 'POST');
        if($server['status_code'] === 400) throw new Exception('Error during server creation please check if you have enough ram/storage/cpu/disk. See modules logs for more informations. IF you find nothing try to create a server manualy trough the panel if still not work contact an administrator');
        if($server['status_code'] !== 204) throw new Exception('Failed to create the server, received the error code: ' . $server['status_code'] . '. Enable module debug log for more info.');


        // Get IP & Port and set on WHMCS "Dedicated IP" field
        $_IP = $server['attributes']['relationships']['allocations']['data'][0]['attributes']['ip'];
        $_Port = $server['attributes']['relationships']['allocations']['data'][0]['attributes']['port'];
        
        // Check if IP & Port field have value. Prevents ":" being added if API error
        if (isset($_IP) && isset($_Port)) {
        try {
			$query = Capsule::table('tblhosting')->where('id', $params['serviceid'])->where('userid', $params['userid'])->update(array('dedicatedip' => $_IP . ":" . $_Port));
		} catch (Exception $e) { return $e->getMessage() . "<br />" . $e->getTraceAsString(); }
    }

        Capsule::table('tblhosting')->where('id', $params['serviceid'])->update([
            'username' => '',
            'password' => '',
        ]);
    } catch(Exception $err) {
        return $err->getMessage();
    }

    return 'success';
}
function pterodactylclouduser_GenerateUsername($length = 8) {

    $returnable = false;
    while (!$returnable) {
        $generated = randomclouduser($length);

        if (preg_match('/[A-Z]+[a-z]+[0-9]+/', $generated)) {
            $returnable = true;
        }
    }

    return $generated;
}



function pterodactylclouduser_SuspendAccount(array $params) {
    try {
        $serverId = pterodactylclouduser_GetServerID($params);
        if(!isset($serverId)) throw new Exception('Failed to suspend server because it doesn\'t exist.');

        $suspendResult = pterodactylclouduser_API($params, 'servers/suspend', ['serveruuid' => $serverId ], 'POST');
        if($suspendResult['status_code'] !== 204) throw new Exception('Failed to suspend the server, received error code: ' . $suspendResult['status_code'] . '. Enable module debug log for more info.');
    } catch(Exception $err) {
        return $err->getMessage();
    }

    return 'success';
}

function pterodactylclouduser_UnsuspendAccount(array $params) {
    try {
        $serverId = pterodactylclouduser_GetServerID($params);
        if(!isset($serverId)) throw new Exception('Failed to unsuspend server because it doesn\'t exist.');

        $suspendResult = pterodactylclouduser_API($params, 'servers/suspend', ['serveruuid' => $serverId ], 'POST');
        if($suspendResult['status_code'] !== 204) throw new Exception('Failed to unsuspend the server, received error code: ' . $suspendResult['status_code'] . '. Enable module debug log for more info.');
    } catch(Exception $err) {
        return $err->getMessage();
    }

    return 'success';
}

function pterodactylclouduser_TerminateAccount(array $params) {
    try {
        $serverId = pterodactylclouduser_GetServerID($params);
        if(!isset($serverId)) throw new Exception('Failed to terminate server because it doesn\'t exist.');

        $deleteResult = pterodactylclouduser_API($params, 'servers/delete?serveruuid=' . $serverId, [], 'DELETE');
        if($deleteResult['status_code'] !== 204) throw new Exception('Failed to terminate the server, received error code: ' . $deleteResult['status_code'] . '. Enable module debug log for more info.');
    } catch(Exception $err) {
        return $err->getMessage();
    }

    // Remove the "Dedicated IP" Field on Termination
    try {
        $query = Capsule::table('tblhosting')->where('id', $params['serviceid'])->where('userid', $params['userid'])->update(array('dedicatedip' => ""));
    } catch (Exception $e) { return $e->getMessage() . "<br />" . $e->getTraceAsString(); }

    return 'success';
}



// Function to allow backwards compatibility with death-droid's module
function pterodactylclouduser_GetServerID(array $params, $raw = false) {
    $serverResult = pterodactylclouduser_API($params, 'servers/search?serverid=cloud_' . $params['clientsdetails']['email'] .  $params['serviceid'], [], 'GET', true);
    
    if($serverResult['status_code'] === 200) {
        if($raw) return $serverResult;
        else return $serverResult['uuid'];
    } else if($serverResult['status_code'] === 500) {
        throw new Exception('Failed to get server, panel errored. Check panel logs for more info.');
    }
}

function pterodactylclouduser_LoginLink(array $params) {
    if($params['moduletype'] !== 'pterodactylclouduser') return;

    try {
        $serverId = pterodactylclouduser_GetServerID($params);
        if(!isset($serverId)) return;
        $hostname = pterodactylclouduser_GetHostname($params);
        echo '<a style="padding-right:3px" href="'. $hostname . '/server/' . strtok($serverId, '-') . '" target="_blank">[Go to Service]</a>';
        echo '<p style="float:right; padding-right:1.3%">[<a href="https://discord.bagou450.com" target="_blank">Report A Bug</a>]</p>';
        # echo '<p style="float: right">[<a href="https://github.com/pterodactyl/whmcs/issues" target="_blank">Report A Bug</a>]</p>';
    } catch(Exception $err) {
        // Ignore
    }
}

function pterodactylclouduser_ClientArea(array $params) {

    if($params['moduletype'] !== 'pterodactylclouduser') return;
    
    try {
        $hostname = pterodactylclouduser_GetHostname($params);
        $serverData = pterodactylclouduser_GetServerID($params, true);
        if($serverData['status_code'] === 404 || !isset($serverData['id'])) return [
            'templatefile' => 'clientarea',
            'vars' => [
                'serviceurl' => $hostname,
            ],
        ];
        return [
            'templatefile' => 'clientarea',
            'vars' => [
                'serviceurl' => $hostname . '/server/' . strtok($serverData['uuid'], '-'),
            ],
        ];
    } catch (Exception $err) {
        // Ignore
    }
}