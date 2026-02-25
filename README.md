# Weather

Adds a slash command that returns the current weather for a given location.

Supports multiple weather API providers:

- **AccuWeather** (default) — Requires a free API key.
- **wttr.in** — No API key required.
- **OpenWeatherMap** — Requires a free API key.
- **Open-Meteo** — No API key required.

## Getting API Keys

### AccuWeather

1. Register on the [AccuWeather developer portal](https://developer.accuweather.com/).
2. Then create an app and get the API key.

It's free for 50 calls per day.

### wttr.in

No API key required.

### OpenWeatherMap

1. Register on the [OpenWeatherMap website](https://home.openweathermap.org/users/sign_up).
2. Get the API key from your [account page](https://home.openweathermap.org/api_keys).

The free tier includes 1,000 calls per day.

> **Note:** The API key may take up to ~2 hours to become active after registration and email confirmation.

### Open-Meteo

No API key required. Uses the [Open-Meteo API](https://open-meteo.com/en/docs) which is free for non-commercial use.

## Installation

Install using SillyTavern's extension installer from the URL:

```txt
https://github.com/SillyTavern/Extension-Weather
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

### Get or set weather provider

`/weather-provider [provider]`

If no argument is provided, returns the current provider name. If a provider name is given, switches to that provider and returns its name.

Valid providers: `accuweather`, `openweathermap`, `open-meteo`, `wttr.in`

Available arguments:

- `quiet` - suppress the success toast notification on provider update. The default is `false`.

### Get or set preferred location

`/weather-location [location]`

If no argument is provided, returns the current preferred location. If a location is given, sets the preferred location and returns it.

Available arguments:

- `quiet` - suppress the success toast notification on location update. The default is `false`.

### Get or set preferred units

`/weather-units [units]`

If no argument is provided, returns the current preferred units. If units are given, sets the preferred units and returns them.

Valid units: `metric`, `imperial`

Available arguments:

- `quiet` - suppress the success toast notification on units update. The default is `false`.

## Examples

```stscript
/weather units=metric condition=true temperature=true feelslike=true humidity=true wind=true pressure=true visibility=true uvindex=true precipitation=true London, UK
```

```stscript
/forecast units=imperial Tampa, FL
```

```stscript
/weather-provider wttr.in
```

```stscript
/weather-provider quiet=true openweathermap
```

```stscript
/weather-location London, UK
```

```stscript
/weather-units imperial
```

## License

AGPL-3.0
