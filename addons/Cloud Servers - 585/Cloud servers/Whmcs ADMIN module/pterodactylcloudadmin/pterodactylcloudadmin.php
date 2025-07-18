<?php

if(!defined("WHMCS")) {
    die("This file cannot be accessed directly");
}

use Illuminate\Database\Capsule\Manager as Capsule;

function pterodactylcloudadmin_GetHostname(array $params) {
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

function pterodactylcloudadmin_API(array $params, $endpoint, array $data = [], $method = "GET", $dontLog = false) {
    $url = pterodactylcloudadmin_GetHostname($params) . '/api/application/' . $endpoint;

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($curl, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1_2);
    curl_setopt($curl, CURLOPT_USERAGENT, "PterodactylCloud-WHMCS");
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
    
    if($responseData['status_code'] === 0 && !$dontLog) logModuleCall("PterodactylCloud-WHMCS", "CURL ERROR", curl_error($curl), "");

    curl_close($curl);

    if(!$dontLog) logModuleCall("PterodactylCloud-WHMCS", $method . " - " . $url,
        isset($data) ? json_encode($data) : "",
        print_r($responseData, true));

    return $responseData;
}

function pterodactylcloudadmin_Error($func, $params, Exception $err) {
    logModuleCall("PterodactylCloud-WHMCS", $func, $params, $err->getMessage(), $err->getTraceAsString());
}

function pterodactylcloudadmin_MetaData() {
    return [
        "DisplayName" => "Pterodactyl Cloud",
        "APIVersion" => "1.1",
        "RequiresServer" => true,
    ];
}

function pterodactylcloudadmin_ConfigOptions() {
    return [
        "databases" => [
            "FriendlyName" => "Databases",
            "Description" => "Amount of Databases to assign to the user.",
            "Type" => "text",
            "Size" => 10,
        ],
        "allocations" => [
            "FriendlyName" => "Allocations",
            "Description" => "Amount of Allocations to assign to the user.",
            "Type" => "text",
            "Size" => 10,
        ],
        "backups" => [
            "FriendlyName" => "Backups",
            "Description" => "Amount of Backups to assign to the user.",
            "Type" => "text",
            "Size" => 10,
        ],
        "cpu" => [
            "FriendlyName" => "CPU Limit (%)",
            "Description" => "Amount of CPU to assign to the user.",
            "Type" => "text",
            "Size" => 10,
        ],
        "memory" => [
            "FriendlyName" => "Memory (MB)",
            "Description" => "Amount of Memory to assign to the user.",
            "Type" => "text",
            "Size" => 10,
        ],
        "disk" => [
            "FriendlyName" => "Disk Space (MB)",
            "Description" => "Amount of Disk Space to assign to the user.",
            "Type" => "text",
            "Size" => 10,
        ],
        "users" => [
            "FriendlyName" => "Users",
            "Description" => "Amount of Users to assign to the user.",
            "Type" => "text",
            "Size" => 10,
        ],
        "servers" => [
            "FriendlyName" => "Servers",
            "Description" => "Amount of Servers to assign to the user.",
            "Type" => "text",
            "Size" => 10,
        ],
    ];
}

function pterodactylcloudadmin_TestConnection(array $params) {
    $solutions = [
        0 => "Check module debug log for more detailed error.",
        401 => "Authorization header either missing or not provided.",
        403 => "Double check the password (which should be the Application Key).",
        404 => "Result not found.",
        422 => "Validation error.",
        500 => "Panel errored, check panel logs.",
    ];

    $err = "";
    try {
        $response = pterodactylcloudadmin_API($params, 'nodes');

        if($response['status_code'] !== 200) {
            $status_code = $response['status_code'];
            $err = "Invalid status_code received: " . $status_code . ". Possible solutions: "
                . (isset($solutions[$status_code]) ? $solutions[$status_code] : "None.");
        } else {
            if($response['meta']['pagination']['count'] === 0) {
                $err = "Authentication successful, but no nodes are available.";
            }
        }
    } catch(Exception $e) {
        pterodactylcloudadmin_Error(__FUNCTION__, $params, $e);
        $err = $e->getMessage();
    }

    return [
        "success" => $err === "",
        "error" => $err,
    ];
}

function randomcloudadmin($length) {
    if (class_exists("\Illuminate\Support\Str")) {
        return \Illuminate\Support\Str::random($length);
    } else if (function_exists("str_random")) {
        return str_random($length);
    } else {
        throw new \Exception("Unable to find a valid function for generating random strings");
    }
}

function pterodactylcloudadmin_GenerateUsername($length = 8) {
    $returnable = false;
    while (!$returnable) {
        $generated = randomcloudadmin($length);
        if (preg_match('/[A-Z]+[a-z]+[0-9]+/', $generated)) {
            $returnable = true;
        }
    }
    return $generated;
}

function pterodactylcloudadmin_GetOption(array $params, $id, $default = NULL) {

    $options = pterodactylcloudadmin_ConfigOptions();
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
    foreach(pterodactylcloudadmin_ConfigOptions() as $key => $value) {
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

function pterodactylcloudadmin_CreateAccount(array $params) {
    try {
        $userResult = pterodactylcloudadmin_API($params, 'users/external/' . $params['clientsdetails']['id']);
        $alreadyexist = $userResult['status_code'] === 200 || $userResult['status_code'] === 201;
        $user = $userResult;
        if($userResult['status_code'] === 404) {
            $userResult = pterodactylcloudadmin_API($params, 'users?filter[email]=' . urlencode($params['clientsdetails']['email']));
            if($userResult['meta']['pagination']['total'] === 0) {
                $alreadyexist = false;
                $userResult = pterodactylcloudadmin_API($params, 'users', [
                    'username' => pterodactylcloudadmin_GetOption($params, 'username', pterodactylcloudadmin_GenerateUsername()),
                    'email' => $params['clientsdetails']['email'],
                    'first_name' => $params['clientsdetails']['firstname'],
                    'last_name' => $params['clientsdetails']['lastname'],
                    'external_id' => (string) $params['clientsdetails']['id'],
                    'cloud' => (bool) 1,
                    'cloud_database' => (int) pterodactylcloudadmin_GetOption($params, 'databases'),
                    'cloud_allocation' => (int) pterodactylcloudadmin_GetOption($params, 'allocations'),
                    'cloud_backup' => (int) pterodactylcloudadmin_GetOption($params, 'backups'),
                    'cloud_cpu' => (int) pterodactylcloudadmin_GetOption($params, 'cpu'),
                    'cloud_ram' => (int) pterodactylcloudadmin_GetOption($params, 'memory'),
                    'cloud_disk' => (int) pterodactylcloudadmin_GetOption($params, 'disk'),
                    'cloud_users' => (int) pterodactylcloudadmin_GetOption($params, 'users'),
                    'cloud_servers' => (int) pterodactylcloudadmin_GetOption($params, 'servers'),

                ], 'POST');
            } else {
                foreach($userResult['data'] as $key => $value) {
                    if($value['attributes']['email'] === $params['clientsdetails']['email']) {
                        $user = $value;
                        break;
                    }
                }
                $alreadyexist = true;
            }
        }

        if($alreadyexist) {
            $userID = $user['attributes']['id'];
            $userResult = pterodactylcloudadmin_API($params, "users/$userID", [
                'uuid' => (string) $user['attributes']['uuid'],
                'email' => (string) $user['attributes']['email'],
                'username' => (string) $user['attributes']['username'],
                'first_name' => (string) $user['attributes']['first_name'],
                'last_name' => (string) $user['attributes']['last_name'],
                'external_id' => (string) $params['clientsdetails']['id'],
                'cloud' => (bool) 1,
                'cloud_database' => (int) pterodactylcloudadmin_GetOption($params, 'databases'),
                'cloud_allocation' => (int) pterodactylcloudadmin_GetOption($params, 'allocations'),
                'cloud_backup' => (int) pterodactylcloudadmin_GetOption($params, 'backups'),
                'cloud_cpu' => (int) pterodactylcloudadmin_GetOption($params, 'cpu'),
                'cloud_ram' => (int) pterodactylcloudadmin_GetOption($params, 'memory'),
                'cloud_disk' => (int) pterodactylcloudadmin_GetOption($params, 'disk'),
                'cloud_users' => (int) pterodactylcloudadmin_GetOption($params, 'users'),
                'cloud_servers' => (int) pterodactylcloudadmin_GetOption($params, 'servers'),

            ], 'PATCH');

        }

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





function pterodactylcloudadmin_ChangePassword(array $params) {
    try {
        if($params['password'] === '') throw new Exception('The password cannot be empty.');

        $user = pterodactylcloudadmin_API($params, 'users/external/' . $params['clientsdetails']['id']);
        if(!isset($user)) throw new Exception('Failed to change password because linked user doesn\'t exist.');

        $userId = $user['attributes']['id'];
        $updateResult = pterodactylcloudadmin_API($params, 'users/' . $userId, [
            'username' => $userResult['attributes']['username'],
            'email' => $userResult['attributes']['email'],
            'first_name' => $userResult['attributes']['first_name'],
            'last_name' => $userResult['attributes']['last_name'],

            'password' => $params['password'],
        ], 'PATCH');
        if($updateResult['status_code'] !== 200) throw new Exception('Failed to change password, received error code: ' . $updateResult['status_code'] . '.');

        unset($params['password']);
        Capsule::table('tblhosting')->where('id', $params['serviceid'])->update([
            'username' => '',
            'password' => '',
        ]);
    } catch(Exception $err) {
        return $err->getMessage();
    }

    return 'success';
}



function pterodactylcloudadmin_LoginLink(array $params) {
    if($params['moduletype'] !== 'pterodactylcloudadmin') return;
    $user = pterodactylcloudadmin_API($params, 'users/external/' . $params['clientsdetails']['id']);
    if(!isset($user)) throw new Exception('Can\'t find the user');
    try {
        $hostname = pterodactylcloudadmin_GetHostname($params);
        echo '<a style="padding-right:3px" href="'.$hostname.'/admin/users/view/' . $user['attributes']['id'] . '" target="_blank">[View the user]</a>';
        echo '<p style="float:right; padding-right:1.3%">[<a href="https://discord.bagou450.com" target="_blank">Report A Bug</a>]</p>';
        # echo '<p style="float: right">[<a href="https://github.com/pterodactyl/whmcs/issues" target="_blank">Report A Bug</a>]</p>';
    } catch(Exception $err) {
        // Ignore
    }
}

function pterodactylcloudadmin_ClientArea(array $params) {
    if($params['moduletype'] !== 'pterodactylcloudadmin') return;

    try {
        $hostname = pterodactylcloudadmin_GetHostname($params);

        return [
            'templatefile' => 'clientarea',
            'vars' => [
                'serviceurl' => $hostname,
            ],
        ];
    } catch (Exception $err) {
        // Ignore
    }
}








function pterodactylcloudadmin_SuspendAccount(array $params) {
    $user = pterodactylcloudadmin_API($params, 'users/external/' . $params['clientsdetails']['id']);
    if(!isset($user)) throw new Exception('Can\'t find the user');
    try {

        $suspendResult = pterodactylcloudadmin_API($params, 'users/' . $user['attributes']['id'] . '/suspend', [], 'POST');
        if($suspendResult['status_code'] !== 204) throw new Exception('Failed to suspend the user, received error code: ' . $suspendResult['status_code'] . '. Enable module debug log for more info.');
    } catch(Exception $err) {
        return $err->getMessage();
    }

    return 'success';
}

function pterodactylcloudadmin_UnsuspendAccount(array $params) {
    $user = pterodactylcloudadmin_API($params, 'users/external/' . $params['clientsdetails']['id']);
    if(!isset($user)) throw new Exception('Can\'t find the user');
    try {
        $suspendResult = pterodactylcloudadmin_API($params, 'users/' . $user['attributes']['id'] . '/suspend', [], 'POST');
        if($suspendResult['status_code'] !== 204) throw new Exception('Failed to suspend the user, received error code: ' . $suspendResult['status_code'] . '. Enable module debug log for more info.');
    } catch(Exception $err) {
        return $err->getMessage();
    }

    return 'success';
}
function pterodactylcloudadmin_TerminateAccount(array $params) {
    $user = pterodactylcloudadmin_API($params, 'users/external/' . $params['clientsdetails']['id']);
    if(!isset($user)) throw new Exception('Can\'t find the user');
    try {
        $suspendResult = pterodactylcloudadmin_API($params, 'users/' . $user['attributes']['id'] . '/removecloud', [], 'POST');
        if($suspendResult['status_code'] !== 204) throw new Exception('Failed to suspend the user, received error code: ' . $suspendResult['status_code'] . '. Enable module debug log for more info.');
    } catch(Exception $err) {
        return $err->getMessage();
    }

    return 'success';
}
