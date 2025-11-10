"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Loader } from "lucide-react"; // Asumiendo que usas lucide-react

// Colores para el gráfico
const COLORS = {
  committed: "#B0BEC5", // Gris (Comprometido)
  completed: "#4CAF50", // Verde (Completado)
  track: "#E6EEF3",
};

export default function VelocityChart({
  team = "",
  employee = "",
  startDate = "",
  endDate = "",
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   // No cargar datos si no hay un equipo seleccionado
  //   if (!team) {
  //     setData([]);
  //     return;
  //   }

  //   const controller = new AbortController();
  //   (async () => {
  //     try {
  //       setLoading(true);
  //       const params = new URLSearchParams();
  //       params.append("team", team);
  //       if (employee) params.append("employee", employee);
  //       if (startDate) params.append("startDate", startDate);
  //       if (endDate) params.append("endDate", endDate);

  //       // 2. Llamar a la nueva API de Velocity
  //       const res = await fetch(`/api/charts/jira-velocity?${params.toString()}`, { signal: controller.signal });

  //       if (!res.ok) throw new Error("Failed to fetch data");

  //       const json = await res.json();
  //       setData(Array.isArray(json) ? json : []);
  //     } catch (err) {
  //       if (err.name !== "AbortError") console.error("Error loading velocity data:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   })();

  //   return () => controller.abort();
  // }, [team, employee, startDate, endDate]);

  useEffect(() => {
    if (!team | (team == null)) {
      setData([]);
      return;
    }

    // DATA QUEMADA
    const fakeData = [
      { name: "Sprint 1", committed: 10, completed: 8 },
      { name: "Sprint 2", committed: 12, completed: 12 },
      { name: "Sprint 3", committed: 15, completed: 10 },
      { name: "Sprint 4", committed: 8, completed: 8 },
    ];

    // Simular carga
    setLoading(true);
    const timer = setTimeout(() => {
      setData(fakeData);
      setLoading(false);
    }, 500); // medio segundo de simulación

    return () => clearTimeout(timer);
  }, [team]);

  const { hasStoryPoints, maxPoints } = useMemo(() => {
    if (!data || data.length === 0) {
      return { hasStoryPoints: false, maxPoints: 1 };
    }

    // 3. Comprobar si se están usando Story Points (AC)
    const totalPoints = data.reduce((acc, sprint) => {
      return acc + (sprint.committed || 0) + (sprint.completed || 0);
    }, 0);

    const maxVal = Math.max(
      ...data.map((d) => Math.max(d.committed || 0, d.completed || 0)),
      1
    );

    return { hasStoryPoints: totalPoints > 0, maxPoints: maxVal };
  }, [data]);

  // Estados de carga y vacíos
  if (loading) {
    return (
      <Card className="min-h-[300px] flex justify-center items-center">
        <Loader className="animate-spin text-gray-400" />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="min-h-[300px] flex justify-center items-center">
        <div className="p-4 text-sm text-gray-500">
          No velocity data to display for the selected period.
        </div>
      </Card>
    );
  }

  // 4. Ocultar el gráfico si no hay Story Points (AC)
  if (!hasStoryPoints) {
    return (
      <Card className="min-h-[300px] flex justify-center items-center">
        <div className="p-4 text-sm text-gray-500">
          No Story Points were found for this period. Velocity chart is hidden.
        </div>
      </Card>
    );
  }

  // Renderizar el gráfico
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sprint Velocity</CardTitle>
        <div className="text-sm text-gray-500">
          Story Points Committed vs. Completed
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((sprint) => {
            const committedPct = Math.round(
              (sprint.committed / maxPoints) * 100
            );
            const completedPct = Math.round(
              (sprint.completed / maxPoints) * 100
            );

            return (
              <div key={sprint.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{sprint.name}</span>
                  <span className="text-xs text-gray-500">
                    Committed: {sprint.committed} SP • Completed:{" "}
                    {sprint.completed} SP
                  </span>
                </div>
                {/* Barra de Puntos Comprometidos */}
                <div
                  className="w-full h-3 rounded-md"
                  style={{ backgroundColor: COLORS.track }}
                >
                  <div
                    style={{
                      width: `${committedPct}%`,
                      height: "100%",
                      borderRadius: 6,
                      backgroundColor: COLORS.committed,
                    }}
                  />
                </div>
                {/* Barra de Puntos Completados */}
                <div
                  className="w-full h-3 rounded-md"
                  style={{ backgroundColor: COLORS.track }}
                >
                  <div
                    style={{
                      width: `${completedPct}%`,
                      height: "100%",
                      borderRadius: 6,
                      backgroundColor: COLORS.completed,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center space-x-4 pt-6">
          <Legend color={COLORS.committed} label="Committed" />
          <Legend color={COLORS.completed} label="Completed" />
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Leyenda (igual que el tuyo)
function Legend({ color, label }) {
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <div
        style={{
          width: 16,
          height: 10,
          backgroundColor: color,
          borderRadius: 3,
        }}
      />
      <div>{label}</div>
    </div>
  );
}
