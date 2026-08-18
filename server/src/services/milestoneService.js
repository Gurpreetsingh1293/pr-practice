/**
 * Milestone Service — State Machine for B2BOrder Milestone Transitions
 *
 * Valid transition path:
 * PLACED → RAW_MATERIAL → IN_PRODUCTION → PACKED → DISPATCHED → DELIVERED → FUNDS_RELEASED
 *
 * Cancellation is possible from: PLACED, RAW_MATERIAL, IN_PRODUCTION
 */

const MILESTONE_STAGES = {
  PLACED: 'PLACED',
  RAW_MATERIAL: 'RAW_MATERIAL',
  IN_PRODUCTION: 'IN_PRODUCTION',
  PACKED: 'PACKED',
  DISPATCHED: 'DISPATCHED',
  DELIVERED: 'DELIVERED',
  FUNDS_RELEASED: 'FUNDS_RELEASED',
  CANCELLED: 'CANCELLED',
};

/**
 * VALID_TRANSITIONS map:
 * Key = current stage
 * Value = { allowedNext: [...], allowedRoles: [...] }
 *
 * Role assignments:
 * - shg_leader: drives production milestones (RAW_MATERIAL → IN_PRODUCTION → PACKED → DISPATCHED)
 * - b2b_buyer: signs off DELIVERED
 * - ngo_admin: authorizes FUNDS_RELEASED, can cancel at early stages, approve inspections
 */
const VALID_TRANSITIONS = {
  [MILESTONE_STAGES.PLACED]: {
    allowedNext: [MILESTONE_STAGES.RAW_MATERIAL, MILESTONE_STAGES.CANCELLED],
    allowedRoles: {
      [MILESTONE_STAGES.RAW_MATERIAL]: ['shg_leader', 'ngo_admin'],
      [MILESTONE_STAGES.CANCELLED]: ['b2b_buyer', 'ngo_admin'],
    },
  },
  [MILESTONE_STAGES.RAW_MATERIAL]: {
    allowedNext: [MILESTONE_STAGES.IN_PRODUCTION, MILESTONE_STAGES.CANCELLED],
    allowedRoles: {
      [MILESTONE_STAGES.IN_PRODUCTION]: ['shg_leader'],
      [MILESTONE_STAGES.CANCELLED]: ['b2b_buyer', 'ngo_admin'],
    },
  },
  [MILESTONE_STAGES.IN_PRODUCTION]: {
    allowedNext: [MILESTONE_STAGES.PACKED, MILESTONE_STAGES.CANCELLED],
    allowedRoles: {
      [MILESTONE_STAGES.PACKED]: ['shg_leader'],
      [MILESTONE_STAGES.CANCELLED]: ['ngo_admin'],
    },
  },
  [MILESTONE_STAGES.PACKED]: {
    allowedNext: [MILESTONE_STAGES.DISPATCHED],
    allowedRoles: {
      [MILESTONE_STAGES.DISPATCHED]: ['shg_leader', 'ngo_admin'],
    },
  },
  [MILESTONE_STAGES.DISPATCHED]: {
    allowedNext: [MILESTONE_STAGES.DELIVERED],
    allowedRoles: {
      [MILESTONE_STAGES.DELIVERED]: ['b2b_buyer', 'ngo_admin'],
    },
  },
  [MILESTONE_STAGES.DELIVERED]: {
    allowedNext: [MILESTONE_STAGES.FUNDS_RELEASED],
    allowedRoles: {
      [MILESTONE_STAGES.FUNDS_RELEASED]: ['ngo_admin'],
    },
  },
  [MILESTONE_STAGES.FUNDS_RELEASED]: {
    allowedNext: [],
    allowedRoles: {},
  },
  [MILESTONE_STAGES.CANCELLED]: {
    allowedNext: [],
    allowedRoles: {},
  },
};

/**
 * canTransition
 * Checks if a milestone transition from `currentStage` to `nextStage` is valid for a given `role`.
 *
 * @param {string} currentStage - Current milestone stage
 * @param {string} nextStage - Target milestone stage
 * @param {string} role - User role attempting the transition
 * @returns {{ allowed: boolean, reason?: string }}
 */
const canTransition = (currentStage, nextStage, role) => {
  const transition = VALID_TRANSITIONS[currentStage];

  if (!transition) {
    return { allowed: false, reason: `Unknown stage: ${currentStage}` };
  }

  if (transition.allowedNext.length === 0) {
    return {
      allowed: false,
      reason: `Order is in terminal state '${currentStage}' and cannot be transitioned further.`,
    };
  }

  if (!transition.allowedNext.includes(nextStage)) {
    return {
      allowed: false,
      reason: `Illegal transition: '${currentStage}' → '${nextStage}'. Allowed next stages: [${transition.allowedNext.join(', ')}].`,
    };
  }

  const rolesAllowed = transition.allowedRoles[nextStage] || [];
  if (!rolesAllowed.includes(role)) {
    return {
      allowed: false,
      reason: `Role '${role}' is not authorized to transition to '${nextStage}'. Allowed roles: [${rolesAllowed.join(', ')}].`,
    };
  }

  return { allowed: true };
};

/**
 * getStageLabel — Human-readable stage labels for frontend display
 */
const getStageLabel = (stage) => {
  const labels = {
    PLACED: 'Order Placed',
    RAW_MATERIAL: 'Raw Material Acquired',
    IN_PRODUCTION: 'In Production',
    PACKED: 'Packed & Quality Checked',
    DISPATCHED: 'Dispatched',
    DELIVERED: 'Delivered',
    FUNDS_RELEASED: 'Funds Released',
    CANCELLED: 'Cancelled',
  };
  return labels[stage] || stage;
};

/**
 * getStageOrder — Returns numeric order for progress visualization
 */
const getStageOrder = (stage) => {
  const order = {
    PLACED: 0,
    RAW_MATERIAL: 1,
    IN_PRODUCTION: 2,
    PACKED: 3,
    DISPATCHED: 4,
    DELIVERED: 5,
    FUNDS_RELEASED: 6,
    CANCELLED: -1,
  };
  return order[stage] ?? -1;
};

module.exports = {
  MILESTONE_STAGES,
  VALID_TRANSITIONS,
  canTransition,
  getStageLabel,
  getStageOrder,
};
