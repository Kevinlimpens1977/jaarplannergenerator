'use client';

import { useState } from 'react';
import { Download, Calendar, CheckCircle, Mail, Upload, X } from 'lucide-react';
import { useOSDetection } from '@/lib/hooks/useOSDetection';

interface ImportCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadUrl: string;
  schoolYear: string;
}

export default function ImportCalendarModal({
  isOpen,
  onClose,
  downloadUrl,
  schoolYear,
}: ImportCalendarModalProps) {
  const os = useOSDetection();
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jaarplanner_${schoolYear.replace('/', '-')}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const windowsSteps = [
    {
      title: 'Download het agenda-bestand',
      description: ['Klik op de downloadknop om het ICS-bestand te downloaden.'],
      icon: <Download size={18} strokeWidth={2} className="text-emerald-700" />,
    },
    {
      title: 'Open Microsoft Outlook',
      description: ['Start Outlook op je computer.'],
      icon: <Mail size={18} strokeWidth={2} className="text-emerald-700" />,
    },
    {
      title: 'Ga naar de Kalender',
      description: [
        'Gebruik de sneltoets: Ctrl + 2',
        'Of klik op het kalendericoon linksonder.',
      ],
      icon: <Calendar size={18} strokeWidth={2} className="text-emerald-700" />,
    },
    {
      title: 'Importeer het ICS-bestand',
      description: [
        'Ga naar: Bestand → Openen & exporteren → Agenda importeren',
        'Kies het gedownloade ICS-bestand.',
      ],
      icon: <Upload size={18} strokeWidth={2} className="text-emerald-700" />,
    },
    {
      title: 'Kies een agenda',
      description: [
        'Selecteer de persoonlijke agenda of teamagenda waarin je de activiteiten wilt plaatsen.',
      ],
      icon: <CheckCircle size={18} strokeWidth={2} className="text-emerald-700" />,
    },
  ];

  const macosSteps = [
    {
      title: 'Download het agenda-bestand',
      description: ['Klik op de downloadknop om het ICS-bestand te downloaden.'],
      icon: <Download size={18} strokeWidth={2} className="text-emerald-700" />,
    },
    {
      title: 'Open Outlook of Apple Agenda',
      description: ['Kies zelf welke toepassing je gebruikt.'],
      icon: <Mail size={18} strokeWidth={2} className="text-emerald-700" />,
    },
    {
      title: 'Importeer het ICS-bestand',
      description: [
        'Dubbelklik op het ICS-bestand OF kies:',
        'Archief → Importeer → Agenda-bestand',
      ],
      icon: <Upload size={18} strokeWidth={2} className="text-emerald-700" />,
    },
    {
      title: 'Kies de agenda',
      description: ['Selecteer de agenda waarin activiteiten geplaatst moeten worden.'],
      icon: <Calendar size={18} strokeWidth={2} className="text-emerald-700" />,
    },
    {
      title: 'Klaar',
      description: ['De activiteiten staan nu in jouw agenda.'],
      icon: <CheckCircle size={18} strokeWidth={2} className="text-emerald-700" />,
    },
  ];

  const steps = os === 'mac' ? macosSteps : windowsSteps;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/80 backdrop-blur-md border border-white/60 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="font-display font-semibold text-2xl text-white">
              Agenda importeren
            </h2>
            <p className="text-emerald-100 text-sm mt-2">
              Importeer je jaarplanner in Outlook of Apple Agenda
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          {/* OS Detection Info */}
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-sm text-gray-700">
              Instructies voor: <span className="font-semibold text-emerald-700">
                {os === 'windows' ? 'Windows' : os === 'mac' ? 'macOS' : 'Jouw systeem'}
              </span>
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                {/* Step Number */}
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-300">
                    <span className="text-sm font-semibold text-emerald-700">
                      {index + 1}
                    </span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <div className="space-y-1">
                    {step.description.map((line, i) => (
                      <p key={i} className="text-sm text-gray-700 leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Step Icon */}
                <div className="flex-shrink-0">
                  <div className="bg-emerald-100 p-2 rounded-xl">
                    {step.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Download Button */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-emerald-200 rounded-full font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 disabled:opacity-50"
            >
              <Download size={18} strokeWidth={2} />
              {isDownloading ? 'Downloaden...' : 'Download agenda-bestand'}
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-3 px-6 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
