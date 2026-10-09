/**
 * Shared CSS strings used by both Main Dashboard and Device Detail Dashboard.
 * Extracted to avoid duplication while keeping each dashboard's components independent.
 */

export const STAT_CARD_STYLES = `
.stat-card {
	transition: transform 0.25s ease, box-shadow 0.25s ease;
	cursor: default;
}
.stat-card:hover {
	transform: translateY(-6px);
}
.stat-card--primary { border-left: 3px solid #5B8CFF; }
.stat-card--primary:hover { box-shadow: 0 8px 24px rgba(91, 140, 255, 0.35); }
.stat-card--info { border-left: 3px solid #38BDF8; }
.stat-card--info:hover { box-shadow: 0 8px 24px rgba(56, 189, 248, 0.35); }
.stat-card--success { border-left: 3px solid #22C55E; }
.stat-card--success:hover { box-shadow: 0 8px 24px rgba(34, 197, 94, 0.35); }
.stat-card--warning { border-left: 3px solid #F59E0B; }
.stat-card--warning:hover { box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35); }
.stat-card--danger { border-left: 3px solid #EF4444; }
.stat-card--danger:hover { box-shadow: 0 8px 24px rgba(239, 68, 68, 0.35); }
`;
