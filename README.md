
Philips Hue "push" notifications over WebSocket  
--  
  
## Intro  
Looking to get "push" notifications from your Hue Bridge?
Look no further: this app will poll the Hue Bridge for changes and send notifications over WebSocket every time something has changed.  
  
Supports notifications for:  
 - Lights  
 - Groups / Rooms
 - Sensors  
  
## How to install   
```bash  
sudo npm install -g hue-notification-ws 
```
  
## How to run
```bash  
hue-notification-ws  
```

  
## How to configure  
You can configure this app by passing the following environment variables:  
  
| Variable name | Type | Default | Description |  
|---------------|------|---------|-------------|  
| **Hue Bridge configs** |
| `HUE_HOST` | String | `localhost` | The hostname / IP address of the Hue Bridge |  
| `HUE_PORT` | Number | `80` | The port of the Hue Bridge (80 by default, set to 443 if you're using SSL) |  
| `HUE_USERNAME` | String | `` | A valid Hue API username. [See Hue docs](https://developers.meethue.com/develop/get-started-2) to find out how to get one |  
| `HUE_USE_SSL` | Boolean | `false` | Whether or not use HTTPS or not. Valid values: `true` or `1` / `false` or `0` | 
| **Polling configs** | 
| `POLL_LIGHTS` | Boolean | `true` | Whether or not polling for light changes. Valid values: `true` or `1` / `false` or `0` |  
| `POLL_GROUPS` | Boolean | `true` | Whether or not polling for groups/rooms changes. Valid values: `true` or `1` / `false` or `0` |  
| `POLL_SENSORS` | Boolean | `true` | Whether or not polling for sensor changes. Valid values: `true` or `1` / `false` or `0` |  
| `POLL_INTERVAL_SECONDS` | Number | `2` | The polling interval, in seconds |  
| **WebSocket server configs** | 
| `WEBSOCKET_SERVER_HOST` | String | `localhost` | The hostname to bind the websocket server to. Use `0.0.0.0` to bind to all IP addresses |  
| `WEBSOCKET_SERVER_PORT` | Number | `7000` | The WebSocket server port |  

### Example of running with variables
```bash  
HUE_HOST=192.168.1.2 HUE_USERNAME=abcd hue-notification-ws  
```  
  
## Notification message format  
In the interest of interoperability, notifications follow the format of the [deCONZ server](https://dresden-elektronik.github.io/deconz-rest-doc/websocket/).  
  
Messages received over a WebSocket connection contain data in JSON format.  
  
### Message fields  
  
| Field | Type |Description|  
|-------|------|-----------|  
| `t` | String | The **type** of the message (only `event` is supported) |  
| `e` | String | The **event type** of the message (only `change` is supported) |
| `r` | String | The **resource type** to which the message belongs (`groups`, `lights`, `sensors`) |
| `id` | String | The **id** of the resource to which the message relates, e.g. `5` for `/sensors/5` |  
| `state` | Map | A map containing all the changed `state` attributes of a group, light, or sensor resource. |  
  
### Examples

#### Light
```json
{
    "t": "event",
    "e": "changed",
    "r": "lights",
    "id": "29",
    "state": {
        "on": false,
        "bri": 229,
        "ct": 370,
        "alert": "select",
        "colormode": "ct",
        "mode": "homeautomation",
        "reachable": true
    }
}
```

#### Group
```json
{
    "t": "event",
    "e": "changed",
    "r": "groups",
    "id": "5",
    "state": {
        "all_on": true,
        "any_on": true
    }
}
```

#### Sensor
```json
{
    "t": "event",
    "e": "changed",
    "r": "sensors",
    "id": "18",
    "state": {
        "temperature": 2277,
        "lastupdated": "2019-06-26T14:33:45"
    }
}
```


## Credits
This project is heavily inspired on:
- https://github.com/owagner/hue2mqtt
- https://github.com/hobbyquaker/hue2mqtt.js
