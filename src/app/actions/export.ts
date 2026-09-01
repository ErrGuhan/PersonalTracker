"use server";

import { getHabitLogs, getHabits, getRecentWorkouts, getLatestHealthMetrics, exportAllDataJSON } from "@/lib/db";

export async function exportUserDataCSV(): Promise<{ success: boolean; filename: string; csvContent: string }> {
  try {
    const habits = getHabits();
    const habitLogs = getHabitLogs();
    const workouts = await getRecentWorkouts(50);
    const health = await getLatestHealthMetrics();

    const csvRows: string[] = [];

    // Header row
    csvRows.push("Record_Type,ID,Name_Or_Title,Category_Or_Type,Date,Status_Or_MetricValue,Streak_Or_Duration,Notes");

    // 1. Habit Logs
    habitLogs.forEach((log) => {
      const habit = habits.find((h) => h.id === log.habit_id);
      const title = habit ? `"${habit.title.replace(/"/g, '""')}"` : "Habit Routine";
      const category = habit ? habit.category : "habit";
      const streak = habit ? habit.streak : 0;
      csvRows.push(`HABIT_LOG,${log.id},${title},${category},${log.date},${log.status},${streak} days,""`);
    });

    // 2. Workouts
    workouts.forEach((w) => {
      const name = `"${w.name.replace(/"/g, '""')}"`;
      const notes = w.notes ? `"${w.notes.replace(/"/g, '""')}"` : '""';
      csvRows.push(`WORKOUT,${w.id},${name},${w.type},${w.workout_date},${w.calories} kcal,${w.duration_min} mins,${notes}`);
    });

    // 3. Health Summary Row
    if (health) {
      csvRows.push(`HEALTH_METRICS,${health.id},"Latest Health Snapshot",vitals,${health.recorded_at.split("T")[0]},${health.recovery_score}% Recovery,HR ${health.heart_rate} bpm,"Steps: ${health.steps}, Calories: ${health.calories_burned}"`);
    }

    const csvContent = csvRows.join("\n");
    const filename = `lifesync_data_export_${new Date().toISOString().split("T")[0]}.csv`;

    return {
      success: true,
      filename,
      csvContent,
    };
  } catch (err) {
    console.error("[Export CSV Error]:", err);
    return {
      success: false,
      filename: "",
      csvContent: "",
    };
  }
}

export async function exportUserDataJSON(): Promise<{ success: boolean; filename: string; jsonContent: string }> {
  try {
    const jsonContent = exportAllDataJSON();
    const filename = `lifesync_data_backup_${new Date().toISOString().split("T")[0]}.json`;

    return {
      success: true,
      filename,
      jsonContent,
    };
  } catch (err) {
    console.error("[Export JSON Error]:", err);
    return {
      success: false,
      filename: "",
      jsonContent: "{}",
    };
  }
}
