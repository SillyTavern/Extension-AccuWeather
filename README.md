# AccuWeather Slash Command

Adds a slash command that returns the current weather for a given location.

Uses the AccuWeather API. Requires a free API key.

## Getting API Key

1. Register on the [AccuWeather developer portal](https://developer.accuweather.com/).
2. Then create an app and get the API key.

It's free for 50 calls per day.

## Installation

Install using SillyTavern's extension installer from the URL:

```txt
https://github.com/SillyTavern/Extension-AccuWeather
```

## Usage

### Via the function tool

The function tool needs to be enabled in the extension settings first and used with a compatible backend.

If all requirements are met, just ask the model about the current weather or a forecast for your location.

Docs: [Function Calling](https://docs.sillytavern.app/for-contributors/function-calling/)

### Get current weather

`/weather <location>`

Available arguments:

- `units` - `metric` or `imperial`
- `condition` - the result should include the weather condition, e.g. "Clear". The default is `true`.
- `temperature` - the result should include the temperature. The default is `true`.
- `feelslike` - the result should include the "feels like" temperature. The default is `false`. Only works if `temperature` is `true`.
- `humidity` - the result should include the humidity. The default is `false`.
- `wind` - the result should include the wind speed and direction. The default is `false`.
- `pressure` - the result should include the pressure. The default is `false`.
- `visibility` - the result should include the visibility. The default is `false`.
- `uvindex` - the result should include the UV index. The default is `false`.
- `precipitation` - the result should include the precipitation. The default is `false`.

### Get weather forecast

`/forecast <location>`

Available arguments:

- `units` - `metric` or `imperial`

## Examples

```stscript
/weather units=metric condition=true temperature=true feelslike=true humidity=true wind=true pressure=true visibility=true uvindex=true precipitation=true London, UK
```

```stscript
/forecast units=imperial Tampa, FL
```

## License

AGPL-3.0
