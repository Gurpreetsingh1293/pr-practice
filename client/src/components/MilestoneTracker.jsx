'use client';

import { CheckCircle2, Circle, Clock, XCircle, Loader2 } from 'lucide-react';

const STAGES = [
  { key: 'PLACED', label: 'Order Placed', shortLabel: 'Placed' },
  { key: 'RAW_MATERIAL', label: 'Raw Material Acquired', shortLabel: 'Raw Material' },
  { key: 'IN_PRODUCTION', label: 'In Production', shortLabel: 'Production' },
  { key: 'PACKED', label: 'Packed & QC', shortLabel: 'Packed' },
  { key: 'DISPATCHED', label: 'Dispatched', shortLabel: 'Dispatched' },
  { key: 'DELIVERED', label: 'Delivered', shortLabel: 'Delivered' },
  { key: 'FUNDS_RELEASED', label: 'Funds Released', shortLabel: 'Settled' },
];

const STAGE_ORDER = STAGES.reduce((acc, s, i) => ({ ...acc, [s.key]: i }), {});

function StageIcon({ status }) {
  if (status === 'completed') return <CheckCircle2 className="w-5 h-5 text-brand-green-400" />;
  if (status === 'current') return <Loader2 className="w-5 h-5 text-brand-amber-400 animate-spin" />;
  return <Circle className="w-5 h-5 text-gray-600" />;
}

function CancelledBanner({ cancelledAt, note }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-900/20 border border-red-800/30">
      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-red-300">Order Cancelled</p>
        {note && <p className="text-xs text-gray-400 mt-0.5">{note}</p>}
        {cancelledAt && (
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(cancelledAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * MilestoneTracker
 * Renders a vertical stepper showing all 6 active stages with their status.
 *
 * @param {string} currentMilestone - Current stage key
 * @param {Array} milestoneHistory - Array of { stage, updatedBy, note, createdAt }
 * @param {boolean} cancelled - Whether the order is cancelled
 * @param {string} cancellationReason - Reason for cancellation
 * @param {Date} cancelledAt - Cancellation timestamp
 */
export default function MilestoneTracker({
  currentMilestone,
  milestoneHistory = [],
  cancelled = false,
  cancellationReason,
  cancelledAt,
}) {
  if (cancelled || currentMilestone === 'CANCELLED') {
    const cancelEntry = milestoneHistory.find((h) => h.stage === 'CANCELLED');
    return (
      <CancelledBanner
        cancelledAt={cancelledAt || cancelEntry?.createdAt}
        note={cancellationReason || cancelEntry?.note}
      />
    );
  }

  const currentIndex = STAGE_ORDER[currentMilestone] ?? 0;

  // Build a lookup from stage key → history entry
  const historyMap = milestoneHistory.reduce((acc, entry) => {
    acc[entry.stage] = entry;
    return acc;
  }, {});

  return (
    <div className="relative">
      {STAGES.map((stage, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isPending = i > currentIndex;
        const status = isCompleted ? 'completed' : isCurrent ? 'current' : 'pending';
        const historyEntry = historyMap[stage.key];

        return (
          <div key={stage.key} className="flex gap-4">
            {/* ─── Left: Icon + Line ─────────────────────────── */}
            <div className="flex flex-col items-center">
              <div
                className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0
                  ${isCompleted ? 'bg-brand-green-900/60 border border-brand-green-600/40' : ''}
                  ${isCurrent ? 'bg-brand-amber-900/60 border border-brand-amber-500/60 shadow-glow-amber' : ''}
                  ${isPending ? 'bg-surface-700 border border-gray-700' : ''}
                `}
              >
                <StageIcon status={status} />
              </div>
              {i < STAGES.length - 1 && (
                <div
                  className={`w-0.5 h-10 mt-1 rounded-full ${
                    isCompleted ? 'bg-brand-green-700/50' : 'bg-surface-600'
                  }`}
                />
              )}
            </div>

            {/* ─── Right: Content ────────────────────────────── */}
            <div className="pb-8 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      isCompleted ? 'text-brand-green-300' :
                      isCurrent ? 'text-brand-amber-300' : 'text-gray-500'
                    }`}
                  >
                    {stage.label}
                  </p>
                  {historyEntry?.note && (
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      {historyEntry.note}
                    </p>
                  )}
                  {historyEntry?.updatedBy?.name && (
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      by {historyEntry.updatedBy.name}
                    </p>
                  )}
                </div>
                {historyEntry?.createdAt && (
                  <span className="text-[11px] text-gray-500 shrink-0 mt-0.5">
                    {new Date(historyEntry.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short',
                    })}
                  </span>
                )}
              </div>
              {historyEntry?.inspectionPassed !== undefined && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full mt-1
                    ${historyEntry.inspectionPassed ? 'bg-brand-green-900/40 text-brand-green-400' : 'bg-red-900/40 text-red-400'}`}
                >
                  {historyEntry.inspectionPassed ? '✓ QC Passed' : '✗ QC Failed'}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
