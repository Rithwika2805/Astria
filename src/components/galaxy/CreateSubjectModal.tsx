import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Globe } from 'lucide-react';

export interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, color: string) => void;
}

const COLOR_PRESETS = [
  { label: 'Violet Nebula', hex: '#a855f7' },
  { label: 'Cosmic Blue', hex: '#3b82f6' },
  { label: 'Emerald Aurora', hex: '#14b8a6' },
  { label: 'Solar Gold', hex: '#f59e0b' },
  { label: 'Crimson Supernova', hex: '#ef4444' },
  { label: 'Cyan Pulsar', hex: '#06b6d4' },
];

export const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState('#a855f7');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim(), selectedColor);
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Planet World"
      subtitle="Expand your universe with a new academic subject."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
            Subject Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Quantum Computing, Macroeconomics"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#141424] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Brief overview of what this subject covers..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#141424] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors resize-none"
          />
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

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={<Globe className="w-4 h-4" />}>
            Create Planet
          </Button>
        </div>
      </form>
    </Modal>
  );
};
