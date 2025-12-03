'use client';

import { Copy, Download, AlertCircle, Lightbulb, CheckCircle, Calendar, Globe } from 'lucide-react';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscribeUrl: string;
}

export default function SubscribeModal({ isOpen, onClose, subscribeUrl }: SubscribeModalProps) {
  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(subscribeUrl).then(() => {
      const button = document.getElementById('copy-btn');
      if (button) {
        button.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Gekopieerd!';
        setTimeout(() => {
          button.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>Kopieer link';
        }, 2000);
      }
    });
  };

  const handleDownloadICS = () => {
    const link = document.createElement('a');
    link.href = subscribeUrl;
    link.download = 'dacapo-kalender.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLocalhost = subscribeUrl.includes('localhost');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Internetagenda toevoegen aan Outlook</h2>
              <p className="text-blue-100 mt-1">Synchroniseert automatisch met updates</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Localhost Warning */}
          {subscribeUrl.includes('localhost') && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Let op:</strong> Je test momenteel op localhost. Outlook kan geen localhost URLs importeren.
                    <br />
                    <strong>Oplossing:</strong> Deploy de app naar productie (bijv. Vercel) of download het .ics bestand hieronder.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Kopieer de agenda-URL</h3>
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-600 break-all font-mono">{subscribeUrl}</p>
              </div>
              <button
                id="copy-btn"
                onClick={handleCopyUrl}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                disabled={isLocalhost}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {isLocalhost ? 'Niet beschikbaar (localhost)' : 'Kopieer link'}
              </button>
              {isLocalhost && (
                <button
                  onClick={handleDownloadICS}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ml-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download .ics bestand
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Open Outlook</h3>
              <p className="text-gray-700">Start Microsoft Outlook op je computer</p>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Ga naar Kalender</h3>
              <p className="text-gray-700 mb-2">Klik op het kalender icoon onderaan Outlook</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm flex items-start gap-2">
                <Lightbulb size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800"><strong>Tip:</strong> Of gebruik de sneltoets <kbd className="bg-white px-2 py-1 rounded border">Ctrl + 2</kbd></p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Kalender toevoegen</h3>
              <p className="text-gray-700 mb-2">Klik in het menu op:</p>
              <div className="space-y-2">
                <div className="bg-gray-50 border-l-4 border-blue-600 p-3 flex items-start gap-2">
                  <Calendar size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Start → Kalender toevoegen</p>
                    <p className="text-sm text-gray-600 mt-1">of klik met rechtermuisknop op "Mijn agenda's"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Step 5 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                5
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Kies "Abonneren vanaf web"</h3>
              <p className="text-gray-700 mb-2">Selecteer in het popup menu:</p>
              <div className="bg-gray-50 border-l-4 border-green-600 p-3 flex items-start gap-2">
                <Globe size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Abonneren vanaf web</p>
                  <p className="text-sm text-gray-600 mt-1">Ook wel "Subscribe from web" of "Van internet" genoemd</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200"></div>

          {/* Step 6 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                6
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Plak de URL</h3>
              <p className="text-gray-700 mb-2">Plak de gekopieerde link in het veld en klik op <strong>"Importeren"</strong></p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-semibold">Klaar!</p>
                  <p className="text-green-700 text-sm mt-1">De kalender verschijnt nu in Outlook en wordt automatisch gesynchroniseerd met nieuwe activiteiten.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <Lightbulb size={16} className="text-gray-500" />
              <p>De kalender synchroniseert automatisch</p>
            </div>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
