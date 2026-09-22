// ─── Dummy data (replace with API when backend is ready) ───
export const DUMMY_USERS = [
	{ id: 1, name: 'John Admin', type: 'Admin', status: 'Active' },
	{ id: 2, name: 'Sarah Manager', type: 'Admin', status: 'Active' },
	{ id: 3, name: 'Mike Operator', type: 'User', status: 'Active' },
	{ id: 4, name: 'Lisa Monitor', type: 'User', status: 'Inactive' },
	{ id: 5, name: 'Tom Service', type: 'User', status: 'Active' },
	{ id: 6, name: 'Emma Viewer', type: 'User', status: 'Inactive' },
	{ id: 7, name: 'David Lead', type: 'Admin', status: 'Active' },
	{ id: 8, name: 'Anna Tech', type: 'User', status: 'Active' },
];

export type DummyUser = (typeof DUMMY_USERS)[number];
