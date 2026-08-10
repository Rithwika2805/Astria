import React, { useState } from 'react';
import type { UserSettings, ThemeOption } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Volume2, VolumeX, Download, Upload, RotateCcw, User, Palette, AlertTriangle, Target } from 'lucide-react';

export interface SettingsPageProps {
  user: UserSettings;
  onUpdateSettings: (user: Partial<UserSettings>) => void;
  onExportBackup: () => string;
  onImportBackup: (jsonStr: string) => boolean;
  onResetData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onUpdateSettings,
  onExportBackup,
  onImportBackup,
  onResetData,
}) => {
  const [nameInput, setNameInput] = useState(user.name);
  const [dailyTarget, setDailyTarget] = useState(user.dailyTargetMinutes || 120);
  const [weeklyTarget, setWeeklyTarget] = useState(user.weeklyTargetMinutes || 720);
  const [showResetModal, setShowResetModal] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      name: nameInput.trim() || user.name,
      dailyTargetMinutes: dailyTarget,
      weeklyTargetMinutes: weeklyTarget,
    });
  };

  const handleExport = () => {
    const json = onExportBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astria_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = onImportBackup(content);
      if (ok) {
        setImportStatus('Backup restored successfully!');
      } else {
        setImportStatus('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 text-slate-100 animate-fadeIn space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-wide">
          Universe Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure profile identity, targets, themes, soundscapes, and data portability.
        </p>
      </div>

      <div className="space-y-6">
        {/* SECTION 1: PROFILE & TARGETS */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold font-heading text-white">Stargazer Profile & Targets</h3>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Stargazer Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-[#141424] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  Daily Target (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="720"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(parseInt(e.target.value, 10) || 120)}
                  className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  Weekly Target (minutes)
                </label>
                <input
                  type="number"
                  min="60"
                  max="4320"
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(parseInt(e.target.value, 10) || 720)}
                  className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="sm" icon={<Target className="w-4 h-4" />}>
              Save Profile & Targets
            </Button>
          </form>
        </Card>

        {/* SECTION 2: EXPERIENCE */}
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold font-heading text-white">Visual & Audio Experience</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
                Color Palette Theme
              </label>
              <div className="space-y-2">
                {[
                  { id: 'cosmic-dark', label: 'Cosmic Dark (Default)', color: '#050509' },
                  { id: 'midnight-blue', label: 'Midnight Blue', color: '#090d16' },
                  { id: 'nebula-purple', label: 'Nebula Purple', color: '#0d0916' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onUpdateSettings({ theme: t.id as ThemeOption })}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      user.theme === t.id
                        ? 'border-purple-500 bg-purple-950/40 text-white'
                        : 'border-white/10 bg-[#10101a] text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: t.color }} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
                Audio & Animations
              </label>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#10101a] border border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  {user.soundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                  <span>Synthesized Space Soundscapes</span>
                </div>
                <input
                  type="checkbox"
                  checked={user.soundEnabled}
                  onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                  className="rounded accent-purple-500 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#10101a] border border-white/10 text-xs">
                <span>Enable Motion Animations</span>
                <input
                  type="checkbox"
                  checked={user.animationsEnabled}
                  onChange={(e) => onUpdateSettings({ animationsEnabled: e.target.checked })}
                  className="rounded accent-purple-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* SECTION 3: DATA */}
        <Card className="p-6">
          <h3 className="text-lg font-bold font-heading text-white mb-2">Data Backup & Portability</h3>
          <p className="text-xs text-slate-400 mb-4">
            Export your entire galaxy state to a JSON backup file, or restore from a previous save.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={handleExport} icon={<Download className="w-4 h-4" />}>
              Export Backup JSON
            </Button>

            <label className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium bg-[#14141d] hover:bg-[#1c1c28] text-slate-200 border border-white/10 hover:border-purple-500/30 rounded-xl cursor-pointer transition-all">
              <Upload className="w-4 h-4 mr-2" />
              <span>Import Backup</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>

          {importStatus && <p className="mt-3 text-xs font-mono text-teal-400">{importStatus}</p>}
        </Card>

        {/* SECTION 4: DANGER ZONE */}
        <Card className="p-6 border-red-500/30 bg-red-950/10">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-lg font-bold font-heading">Danger Zone</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Resetting progress restores Astria to the default sample galaxy data. All current study history will be replaced.
          </p>
          <Button variant="danger" onClick={() => setShowResetModal(true)} icon={<RotateCcw className="w-4 h-4" />}>
            Reset Universe to Demo State
          </Button>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Universe Progress?"
        subtitle="This action cannot be undone."
        maxWidth="sm"
      >
        <p className="text-xs text-slate-300 mb-6">
          Are you sure you want to reset all planets, goals, study blocks, sessions, and achievements back to the default sample dataset?
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowResetModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onResetData();
              setShowResetModal(false);
            }}
          >
            Confirm Reset
          </Button>
        </div>
      </Modal>
    </div>
  );
};
