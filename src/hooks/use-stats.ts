"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";

interface Stats {
  totalProducts: number;
  totalUsers: number;
  averageRating: number;
}

interface UseStatsReturn {
  stats: Stats | null;
  loading: boolean;
  error: string | null;
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/stats");
        setStats(response.data.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || err.message || "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}
