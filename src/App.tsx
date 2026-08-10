import React from 'react';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { SupernovaOverlay } from './components/layout/SupernovaOverlay';
import { GlobalSearchModal } from './components/galaxy/GlobalSearchModal';
import { GalaxyPage } from './pages/GalaxyPage';
import { PlannerPage } from './pages/PlannerPage';
import { FocusPage } from './pages/FocusPage';
import { ProgressPage } from './pages/ProgressPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { SettingsPage } from './pages/SettingsPage';
import { FocusTimer } from './components/timer/FocusTimer';
import { SessionCompleteModal } from './components/timer/SessionCompleteModal';
import { StorageService } from './services/storage';

export const App: React.FC = () => {
  const store = useAppStore();

  return (
    <div className="min-h-screen bg-[#050509] text-slate-100 flex flex-col font-sans pb-20 md:pb-0">
      {/* Top Navbar Header */}
      <Navbar
        activeTab={store.activeTab}
        setActiveTab={store.setActiveTab}
        userLevel={store.userLevel}
        streakCount={store.streak.current}
        soundEnabled={store.user.soundEnabled}
        onToggleSound={() => store.updateSettings({ soundEnabled: !store.user.soundEnabled })}
        onOpenSearch={store.openSearch}
      />

      {/* Main Page Area */}
      <main className="flex-1">
        {store.activeTab === 'galaxy' && (
          <GalaxyPage
            user={store.user}
            subjects={store.subjects}
            goals={store.goals}
            habits={store.habits}
            habitCompletions={store.habitCompletions}
            sessions={store.sessions}
            plans={store.plans}
            userLevel={store.userLevel}
            streakCount={store.streak.current}
            selectedSubjectId={store.selectedSubjectId}
            galaxyFilter={store.galaxyFilter}
            onFilterChange={store.setGalaxyFilter}
            onSelectSubject={store.selectSubject}
            onCreateSubject={store.createSubject}
            onUpdateSubject={store.updateSubject}
            onArchiveSubject={store.archiveSubject}
            onDeleteSubject={store.deleteSubject}
            onCreateGoal={store.createGoal}
            onToggleGoalComplete={store.toggleGoalComplete}
            onCreateHabit={store.createHabit}
            onToggleHabitCompletion={store.toggleHabitCompletion}
            onTogglePauseHabit={store.toggleHabitPause}
            onDeleteHabit={store.deleteHabit}
            onAddUnit={store.createUnit}
            onAddTopic={store.createTopic}
            onUpdateTopicStatus={store.updateTopicStatus}
            onTogglePlanComplete={store.togglePlanComplete}
            onLaunchFocus={(subjId, topId, dur, goalId, habitId) => store.launchFocusSession(subjId, topId, dur || 45, goalId, habitId)}
            onOpenAddPlan={() => store.setActiveTab('planner')}
          />
        )}

        {store.activeTab === 'planner' && (
          <PlannerPage
            plans={store.plans}
            subjects={store.subjects}
            goals={store.goals}
            habits={store.habits}
            habitCompletions={store.habitCompletions}
            sessions={store.sessions}
            onToggleComplete={store.togglePlanComplete}
            onDeletePlan={store.deletePlan}
            onCreatePlan={store.createPlan}
            onCreateHabit={store.createHabit}
            onLaunchFocus={(subjId, topId, dur, goalId, habitId) => store.launchFocusSession(subjId, topId, dur || 45, goalId, habitId)}
          />
        )}

        {store.activeTab === 'focus' && (
          <FocusPage
            subjects={store.subjects}
            goals={store.goals}
            onLaunchFocus={(subjId, topId, dur, goalId, habitId) => store.launchFocusSession(subjId, topId, dur || 45, goalId, habitId)}
          />
        )}

        {store.activeTab === 'progress' && (
          <ProgressPage
            user={store.user}
            subjects={store.subjects}
            sessions={store.sessions}
            goals={store.goals}
            streakCount={store.streak.current}
          />
        )}

        {store.activeTab === 'achievements' && (
          <AchievementsPage
            achievements={store.achievements}
            userLevel={store.userLevel}
            subjects={store.subjects}
          />
        )}

        {store.activeTab === 'settings' && (
          <SettingsPage
            user={store.user}
            onUpdateSettings={store.updateSettings}
            onExportBackup={() => StorageService.exportStateJson(store)}
            onImportBackup={store.importBackup}
            onResetData={store.resetData}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileNav activeTab={store.activeTab} setActiveTab={store.setActiveTab} />

      {/* Active Fullscreen Focus Timer Overlay */}
      {store.isFocusActive && store.focusConfig && (
        <FocusTimer
          subjects={store.subjects}
          goals={store.goals}
          initialSubjectId={store.focusConfig.subjectId}
          initialTopicId={store.focusConfig.topicId}
          initialGoalId={store.focusConfig.goalId}
          initialDuration={store.focusConfig.duration}
          onEndSession={store.endFocusSession}
          onCancel={() => store.endFocusSession(0, false)}
        />
      )}

      {/* Global Search Modal Overlay (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={store.isSearchOpen}
        subjects={store.subjects}
        goals={store.goals}
        habits={store.habits}
        plans={store.plans}
        achievements={store.achievements}
        onClose={store.closeSearch}
        onSelectSubject={store.selectSubject}
        onLaunchFocus={(subjId, topId, dur, goalId, habitId) => store.launchFocusSession(subjId || store.subjects[0]?.id || '', topId, dur || 45, goalId, habitId)}
      />

      {/* Session Complete Celebration Modal */}
      <SessionCompleteModal
        session={store.lastCompletedSession}
        streakCount={store.streak.current}
        onClose={store.closeSessionModal}
      />

      {/* Supernova Milestone Overlay */}
      <SupernovaOverlay
        milestone={store.supernovaMilestone}
        onClose={store.closeSupernovaModal}
      />
    </div>
  );
};

export default App;
