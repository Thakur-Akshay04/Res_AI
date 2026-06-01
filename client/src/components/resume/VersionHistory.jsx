import { useState } from 'react';
import { X, Clock, FileCheck, Trash2, AlertTriangle } from 'lucide-react';

const VersionHistory = ({ versions = [], onSelect, onDelete, onClose }) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleDeleteClick = (e, versionNumber) => {
    e.stopPropagation();
    setConfirmDeleteId(versionNumber);
  };

  const handleConfirmDelete = (versionNumber) => {
    onDelete(versionNumber);
    setConfirmDeleteId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/15 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-neu-bg shadow-neu-xl h-full overflow-y-auto animate-slide-in-right scrollbar-custom">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg">Version History</h3>
            <button
              onClick={onClose}
              className="neu-btn p-2.5 rounded-xl"
              id="version-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {versions.length === 0 ? (
            <div className="text-center py-12">
              <div className="neu-circle w-16 h-16 mx-auto mb-4">
                <Clock className="w-6 h-6 text-neu-text-muted" />
              </div>
              <p className="text-sm text-neu-text-muted">No versions saved yet.</p>
              <p className="text-xs text-neu-text-muted mt-1">Generate and save to create your first version.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...versions].reverse().map((version, idx) => (
                <div
                  key={version._id || idx}
                  className={`neu-card overflow-hidden transition-all duration-200 ${idx === 0 ? 'ring-2 ring-neu-primary/20' : ''}`}
                  id={`version-${version.versionNumber}-card`}
                >
                  {confirmDeleteId === version.versionNumber ? (
                    <div className="p-4 bg-red-50 border-b border-red-100">
                      <div className="flex items-start gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-red-700">Delete Version {version.versionNumber}?</p>
                          <p className="text-xs text-red-500 mt-0.5">This action is permanent and cannot be undone.</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmDelete(version.versionNumber)}
                          className="flex-1 py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
                          id={`version-${version.versionNumber}-confirm-delete`}
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="flex-1 py-1.5 px-3 neu-btn text-xs font-medium rounded-lg"
                          id={`version-${version.versionNumber}-cancel-delete`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => onSelect(version)}
                        className="flex items-center gap-2 flex-1 text-left"
                      >
                        <FileCheck className="w-4 h-4 text-neu-primary flex-shrink-0" />
                        <span className="font-bold text-sm">Version {version.versionNumber}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {idx === 0 && (
                          <span className="text-[10px] font-bold text-neu-primary bg-neu-primary/10 px-2 py-0.5 rounded-full">
                            Latest
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDeleteClick(e, version.versionNumber)}
                          className="p-1.5 text-neu-danger hover:bg-red-50 rounded-lg transition-colors"
                          title={`Delete Version ${version.versionNumber}`}
                          id={`version-${version.versionNumber}-delete-btn`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <button onClick={() => onSelect(version)} className="w-full text-left">
                      <div className="flex items-center gap-4 text-xs text-neu-text-muted">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(version.generatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        {version.atsScore > 0 && (
                          <div className={`font-bold ${
                            version.atsScore >= 80 ? 'text-neu-success' :
                            version.atsScore >= 50 ? 'text-neu-warning' :
                            'text-neu-danger'
                          }`}>
                            ATS: {version.atsScore}%
                          </div>
                        )}
                      </div>

                      {version.content?.summary && (
                        <p className="text-xs text-neu-text-muted mt-2 line-clamp-2">
                          {version.content.summary}
                        </p>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;
