import { useState, useEffect } from "react";
import type { SystemMetricsData } from "../types";

interface UseSystemInfoOptions {
  enabled?: boolean;
  refreshInterval?: number;
}

interface UseSystemInfoResult {
  data: SystemMetricsData | null;
  error: string | null;
  loading: boolean;
  lastUpdated: Date | null;
  isStale: boolean;
  refetch: () => Promise<void>;
  history: SystemMetricsData[];
}

export const useSystemInfo = (
  options: UseSystemInfoOptions = {}
): UseSystemInfoResult => {
  const [data, setData] = useState<SystemMetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [history, setHistory] = useState<SystemMetricsData[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/system/metrics");
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setHistory((prev) => [...prev, result.data].slice(-24)); // Keep last 24 data points
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(result.message || "Failed to fetch system metrics");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch system metrics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();

      const interval = setInterval(() => {
        fetchData();
      }, options.refreshInterval || 5000);

      return () => clearInterval(interval);
    }
  }, [options.enabled, options.refreshInterval]);

  const isStale = lastUpdated
    ? new Date().getTime() - lastUpdated.getTime() > 30000
    : false;

  return {
    data,
    error,
    loading,
    lastUpdated,
    isStale,
    refetch: fetchData,
    history,
  };
};
