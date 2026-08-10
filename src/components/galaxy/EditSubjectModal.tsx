import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Subject, SubjectCategory, PlanPriority } from '../../types';
import { Settings, Archive, Trash2 } from 'lucide-react';

export interface EditSubjectModalProps {
  isOpen: boolean;
  subject: Subject;
  onClose: () => void;
  onUpdateSubject: (subjectId: string, data: Partial<Subject>) => void;
  onArchiveSubject: (subjectId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
}

const COLOR_PRESETS = [
  { label: 'Violet Nebula', hex: '#a855f7' },
  { label: 'Cosmic Blue', hex: '#3b82f6' },
  { label: 'Emerald Aurora', hex: '#14b8a6' },
  { label: 'Solar Gold', hex: '#f59e0b' },
  { label: 'Crimson Supernova', hex: '#ef4444' },
  { label: 'Cyan Pulsar', hex: '#06b6d4' },
];

export const EditSubjectModal: React.FC<EditSubjectModalProps> = ({
  isOpen,
  subject,
  onClose,
  onUpdateSubject,
  onArchiveSubject,
  onDeleteSubject,
}) => {
  const [name, setName] = useState(subject.name);
  const [description, setDescription] = useState(subject.description);
  const [category, setCategory] = useState<SubjectCategory>(subject.category || 'Academic');
  const [priority, setPriority] = useState<PlanPriority>(subject.priority || 'High');
  const [deadline, setDeadline] = useState(subject.deadline || '');
  const [selectedColor, setSelectedColor] = useState(subject.color);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onUpdateSubject(subject.id, {
      name: name.trim(),
      description: description.trim(),
      category,
      priority,
      deadline: deadline || undefined,
      color: selectedColor,
      secondaryColor: selectedColor,
      glowColor: `${selectedColor}66`,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Planet: ${subject.name}`}
      subtitle="Update planet settings, style, deadlines, or archive world."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
            Planet Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#141424] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#141424] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SubjectCategory)}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="Academic">Academic</option>
              <option value="Competitive Exam">Competitive Exam</option>
              <option value="Programming">Programming</option>
              <option value="Project">Project</option>
              <option value="Personal Learning">Personal Learning</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Priority & Deadline
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PlanPriority)}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 mb-2"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
            Planet Color Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                onClick={() => setSelectedColor(preset.hex)}
                className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                  selectedColor === preset.hex
                    ? 'border-white bg-white/10 text-white shadow-lg'
                    : 'border-white/10 bg-[#10101a] text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: preset.hex }} />
                <span className="truncate">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onArchiveSubject(subject.id);
                onClose();
              }}
              icon={<Archive className="w-3.5 h-3.5" />}
            >
              Archive Planet
            </Button>

            {!confirmDelete ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
            ) : (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  onDeleteSubject(subject.id);
                  onClose();
                }}
              >
                Confirm Delete
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" icon={<Settings className="w-3.5 h-3.5" />}>
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
