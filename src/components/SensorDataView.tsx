import React, { useState } from 'react';
import { Radio, Plus, Activity, Battery, MapPin, Send, Code, CheckCircle2 } from 'lucide-react';
import { SensorDataReading } from '../types';

interface SensorDataViewProps {
  readings: SensorDataReading[];
  onIngestReading: (payload: any) => Promise<void>;
}

export const SensorDataView: React.FC<SensorDataViewProps> = ({
  readings,
  onIngestReading
}) => {
  const [deviceId, setDeviceId] = useState<string>('TRAP-PHERO-09');
  const [readingType, setReadingType] = useState<string>('pest_trap');
  const [value, setValue] = useState<number>(14);
  const [notes, setNotes] = useState<string>('Adult moth count exceeded ETL threshold.');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendSuccess(false);
    try {
      await onIngestReading({
        device_id: deviceId,
        reading_type: readingType,
        value: Number(value),
        gps: { latitude: 20.5937, longitude: 78.9629 },
        timestamp: new Date().toISOString(),
        battery_percent: 94,
        notes
      });
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
    } catch (e: any) {
      alert(`Sensor ingestion error: ${e.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-100 text-teal-900 rounded-xl">
            <Radio className="w-6 h-6 text-teal-700 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-stone-900">
                IoT Pest Trap & Micro-Weather Telemetry (Module 5)
              </h2>
              <span className="text-xs bg-teal-100 text-teal-900 font-bold px-2 py-0.5 rounded-full">
                POST /api/sensor-data
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Future-ready hardware ingestion schema for smart pheromone traps, canopy wetness probes, and spore counters
            </p>
          </div>
        </div>
      </div>

      {/* Simulator & API Schema */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Simulator Form */}
        <form
          onSubmit={handleSubmit}
          className="md:col-span-6 bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4 text-xs"
        >
          <div className="font-extrabold text-stone-900 text-sm flex items-center justify-between">
            <span>Hardware Telemetry Ingestion Simulator</span>
            {sendSuccess && (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 201 Created
              </span>
            )}
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Hardware Device ID</label>
            <input
              type="text"
              id="device-id-input"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-mono text-stone-900 font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-bold mb-1">Reading Type</label>
              <select
                id="reading-type-select"
                value={readingType}
                onChange={(e) => setReadingType(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-medium"
              >
                <option value="pest_trap">pest_trap (moths/night)</option>
                <option value="leaf_wetness">leaf_wetness (hours/day)</option>
                <option value="spore_counter">spore_counter (spores/m³)</option>
                <option value="soil_moisture">soil_moisture (%)</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">Sensor Value</label>
              <input
                type="number"
                id="reading-value-input"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-bold mb-1">Field Observation Note</label>
            <input
              type="text"
              id="sensor-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-medium"
            />
          </div>

          <button
            type="submit"
            id="send-sensor-packet-btn"
            disabled={isSending}
            className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-xl shadow transition flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? 'Transmitting...' : 'Emit Sensor Data Packet'}</span>
          </button>
        </form>

        {/* Ingestion Documentation */}
        <div className="md:col-span-6 bg-stone-900 text-stone-200 p-6 rounded-2xl shadow-sm border border-stone-800 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-teal-400 font-mono font-bold">
            <Code className="w-4 h-4" />
            <span>cURL Integration Endpoint Specification</span>
          </div>

          <p className="text-stone-400 leading-relaxed text-[11px]">
            Field solar IoT stations (LoRaWAN / GSM) can post reading telemetry directly via HTTP POST:
          </p>

          <pre className="p-3 bg-stone-950 rounded-xl font-mono text-[11px] text-teal-300 overflow-x-auto border border-stone-800">
{`curl -X POST https://agropari.app/api/sensor-data \\
  -H "Content-Type: application/json" \\
  -d '{
    "device_id": "TRAP-PHERO-09",
    "reading_type": "pest_trap",
    "value": 18,
    "gps": { "latitude": 19.54, "longitude": 74.00 },
    "timestamp": "${new Date().toISOString()}",
    "battery_percent": 95
  }'`}
          </pre>

          <div className="text-[11px] text-stone-400">
            <strong>Supported sensors:</strong> Automatic optical smart traps, capacitive leaf wetness grids, and laser spore detectors.
          </div>
        </div>
      </div>

      {/* Sensor Stream Feed */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
        <h3 className="font-extrabold text-stone-900 text-base">Live Sensor Telemetry Stream</h3>
        <div className="space-y-3 text-xs">
          {readings.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-stone-900">{r.deviceId}</span>
                  <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-bold uppercase text-[10px]">
                    {r.readingType}
                  </span>
                </div>
                <div className="text-stone-600">{r.notes}</div>
                <div className="text-stone-400 text-[10px] font-mono">
                  GPS: {r.gps.latitude.toFixed(4)}, {r.gps.longitude.toFixed(4)} | {new Date(r.timestamp).toLocaleTimeString()}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-teal-800 font-mono">
                  {r.value} <span className="text-xs font-semibold text-stone-500">{r.unit}</span>
                </div>
                {r.batteryPercent && (
                  <div className="text-stone-500 text-[11px] flex items-center justify-end gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{r.batteryPercent}% Battery</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
