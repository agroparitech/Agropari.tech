import { AgronomicRiskAssessment, AgronomicRiskRule, WeatherCondition } from '../types';

/**
 * Maps WMO weather code to readable conditions
 */
function decodeWmoCode(code: number): string {
  switch (code) {
    case 0:
      return 'Clear sky';
    case 1:
    case 2:
    case 3:
      return 'Mainly clear, partly cloudy';
    case 45:
    case 48:
      return 'Fog / rime fog';
    case 51:
    case 53:
    case 55:
      return 'Drizzle';
    case 61:
    case 63:
    case 65:
      return 'Rain showers';
    case 80:
    case 81:
    case 82:
      return 'Heavy rain showers';
    case 95:
    case 96:
    case 99:
      return 'Thunderstorm with possible hail';
    default:
      return 'Cloudy / overcast';
  }
}

/**
 * Fetches real-time weather and 5-day forecast from Open-Meteo
 */
export async function fetchLiveWeather(
  latitude: number,
  longitude: number
): Promise<WeatherCondition> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo response status: ${res.status}`);
    }

    const data = await res.json();
    const current = data.current || {};
    const daily = data.daily || {};

    const forecast5Day = (daily.time || []).slice(0, 5).map((dateStr: string, idx: number) => {
      const tempMax = daily.temperature_2m_max?.[idx] ?? 30;
      const tempMin = daily.temperature_2m_min?.[idx] ?? 22;
      const rainfall = daily.precipitation_sum?.[idx] ?? 0;
      const humidityEst = rainfall > 5 ? 85 : 65;
      const riskScore: 'low' | 'medium' | 'high' =
        humidityEst > 80 && rainfall > 10 ? 'high' : rainfall > 2 ? 'medium' : 'low';

      return {
        date: dateStr,
        tempMax,
        tempMin,
        rainfall,
        humidity: humidityEst,
        riskScore
      };
    });

    const temperature = current.temperature_2m ?? 28.5;
    const humidity = current.relative_humidity_2m ?? 75;
    const rainfall = current.precipitation ?? 0;
    const windSpeed = current.wind_speed_10m ?? 12;
    const weatherCode = current.weather_code ?? 1;

    return {
      temperature,
      humidity,
      rainfall,
      windSpeed,
      weatherCode,
      conditionText: decodeWmoCode(weatherCode),
      forecast5Day
    };
  } catch (error) {
    // Fallback simulation if offline or network failure
    return {
      temperature: 28.5,
      humidity: 78,
      rainfall: 4.2,
      windSpeed: 10,
      weatherCode: 2,
      conditionText: 'Partly cloudy with high humidity',
      forecast5Day: [
        { date: 'Day 1', tempMax: 31, tempMin: 23, rainfall: 8.5, humidity: 84, riskScore: 'high' },
        { date: 'Day 2', tempMax: 30, tempMin: 22, rainfall: 4.0, humidity: 80, riskScore: 'medium' },
        { date: 'Day 3', tempMax: 32, tempMin: 24, rainfall: 0.0, humidity: 68, riskScore: 'low' },
        { date: 'Day 4', tempMax: 33, tempMin: 25, rainfall: 0.0, humidity: 62, riskScore: 'low' },
        { date: 'Day 5', tempMax: 31, tempMin: 23, rainfall: 2.5, humidity: 72, riskScore: 'medium' }
      ]
    };
  }
}

/**
 * Assesses agronomic disease risk based on live weather vs active rules
 */
export function evaluateAgronomicRisk(
  weather: WeatherCondition,
  rules: AgronomicRiskRule[]
): AgronomicRiskAssessment {
  const activeTriggers: string[] = [];
  let fungalRisk: 'low' | 'medium' | 'high' = 'low';
  let bacterialRisk: 'low' | 'medium' | 'high' = 'low';
  let pestOutbreakRisk: 'low' | 'medium' | 'high' = 'low';

  const enabledRules = rules.filter((r) => r.enabled);

  for (const rule of enabledRules) {
    if (rule.category === 'fungal') {
      const humidityMatch = weather.humidity >= rule.minHumidity;
      const tempMatch = weather.temperature >= rule.minTemp && weather.temperature <= rule.maxTemp;
      if (humidityMatch && tempMatch) {
        fungalRisk = rule.riskLevel;
        activeTriggers.push(`Fungal: High humidity (${weather.humidity}%) & optimal temp (${weather.temperature}°C)`);
      }
    } else if (rule.category === 'bacterial') {
      const rainMatch = weather.rainfall >= rule.minRainfall48h;
      const tempWarm = weather.temperature >= rule.minTemp;
      if ((rainMatch || weather.humidity > 80) && tempWarm) {
        bacterialRisk = rule.riskLevel;
        activeTriggers.push(`Bacterial: Rain wash (${weather.rainfall}mm) & warm temp (${weather.temperature}°C)`);
      }
    } else if (rule.category === 'pest') {
      const dryMatch = weather.rainfall === 0 && weather.humidity <= 60;
      const warmMatch = weather.temperature >= rule.minTemp;
      if (dryMatch && warmMatch) {
        pestOutbreakRisk = rule.riskLevel;
        activeTriggers.push(`Pest: Dry sunny spell (${weather.temperature}°C) promotes sucking pest proliferation`);
      }
    }
  }

  let overallRisk: 'low' | 'medium' | 'high' = 'low';
  if (fungalRisk === 'high' || bacterialRisk === 'high' || pestOutbreakRisk === 'high') {
    overallRisk = 'high';
  } else if (fungalRisk === 'medium' || bacterialRisk === 'medium' || pestOutbreakRisk === 'medium') {
    overallRisk = 'medium';
  }

  let explanation = '';
  if (overallRisk === 'high') {
    explanation = 'Weather conditions present high agronomic risk. Immediate field scouting and preventative cultural bio-measures recommended.';
  } else if (overallRisk === 'medium') {
    explanation = 'Moderate risk detected. Monitor vulnerable crop stages and avoid overhead irrigation.';
  } else {
    explanation = 'Weather parameters are favorable with low disease development pressure at present.';
  }

  return {
    overallRisk,
    fungalBlightRisk: fungalRisk,
    bacterialRisk,
    pestOutbreakRisk,
    explanation,
    activeTriggers
  };
}
