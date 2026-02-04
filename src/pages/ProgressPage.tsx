import { useState } from "react";
import { Button, Card, Modal, EmptyState } from "../components";
import { MarkForm, ProgressChart, SubjectStatsCard } from "../components";
import { useMarks, useSessions } from "../hooks";
import { SUBJECTS } from "../types";
import type { CreateMarkData } from "../hooks/useMarks";
import styles from "./ProgressPage.module.css";

function ProgressPage(): React.ReactElement {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { marks, addMark, overallAverage, getSubjectStats, getChartData } = useMarks();
  const { sessions } = useSessions();

  const subjectStats = getSubjectStats();
  const chartData = getChartData();

  const handleAddMark = (data: CreateMarkData) => {
    addMark(data);
    setIsFormOpen(false);
  };

  const totalStudyHours = sessions.reduce((total, session) => {
    const start = new Date(session.start).getTime();
    const end = new Date(session.end).getTime();
    return total + (end - start) / (1000 * 60 * 60);
  }, 0);

  // Transform chart data for ProgressChart
  const transformedChartData = chartData.map(item => ({
    date: item.date,
    [item.subject]: item.score,
  }));

  return (
    <div className={styles.progressPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Progress Tracking</h1>
        <p className={styles.subtitle}>Track your marks and study progress across subjects</p>
      </header>

      <section className={styles.overallStats}>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{overallAverage}%</span>
          <span className={styles.statLabel}>Overall Average</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{marks.length}</span>
          <span className={styles.statLabel}>Total Tests</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{totalStudyHours.toFixed(1)}h</span>
          <span className={styles.statLabel}>Total Study Time</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.statValue}>{SUBJECTS.length}</span>
          <span className={styles.statLabel}>Subjects</span>
        </Card>
      </section>

      <section className={styles.chartsSection}>
        <h2 className={styles.sectionTitle}>Progress Over Time</h2>
        <Card className={styles.chartCard}>
          {marks.length > 0 ? (
            <ProgressChart data={transformedChartData} />
          ) : (
            <EmptyState
              icon="chart"
              title="No marks recorded"
              description="Add your test marks to see progress charts"
            />
          )}
        </Card>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Subject Performance</h2>
        <div className={styles.subjectGrid}>
          {subjectStats.map((stat) => (
            <SubjectStatsCard key={stat.subject} stats={stat} />
          ))}
        </div>
      </section>

      <section className={styles.addMarkSection}>
        <Button onClick={() => setIsFormOpen(true)}>Add New Mark</Button>
      </section>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Add Mark">
        <MarkForm onSubmit={handleAddMark} onCancel={() => setIsFormOpen(false)} />
      </Modal>
    </div>
  );
}

export default ProgressPage;