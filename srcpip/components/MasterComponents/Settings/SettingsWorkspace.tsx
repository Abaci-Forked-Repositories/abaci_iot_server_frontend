import React, { useState } from 'react';
import Button from '../../bootstrap/Button';
import Icon from '../../icon/Icon';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardSubTitle,
	CardTitle,
} from '../../bootstrap/Card';
import RolesTabContent from './RolesTabContent';
// import PermissionsTabContent from './PermissionsTabContent';
import RoleModal, { Role } from './RoleModal';
import usePermissions from '../../../hooks/usePermissions';

type SettingsTab = 'Roles' | 'Permissions';

const tabsData: { name: SettingsTab; icon: string }[] = [
	{ name: 'Roles', icon: 'ManageAccounts' },
	// { name: 'Permissions', icon: 'Security' },
];

const SettingsWorkspace: React.FC = () => {
	const [activeTab, setActiveTab] = useState<SettingsTab>('Roles');
	const [showRoleModal, setShowRoleModal] = useState(false);
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [rolesRefreshSignal, setRolesRefreshSignal] = useState(0);
	const { can } = usePermissions();
	const canWrite = can('settings_write');

	const handleOpenAddRole = () => {
		setSelectedRole(null);
		setShowRoleModal(true);
	};

	const handleCloseModal = () => {
		setShowRoleModal(false);
		setSelectedRole(null);
	};

	const handleModalSuccess = () => {
		setShowRoleModal(false);
		setSelectedRole(null);
		setRolesRefreshSignal((prev) => prev + 1);
	};

	const activeTabData = tabsData.find((t) => t.name === activeTab);

	return (
		<>
			<div className='row h-100'>
				<div className='col-xxl-2 col-xl-3 col-lg-3'>
					<Card stretch>
						<CardHeader>
							<CardLabel icon='Settings' iconColor='primary'>
								<CardTitle tag='div' className='h5'>
									Settings
								</CardTitle>
								<CardSubTitle tag='div' className='h6'>
									Configuration
								</CardSubTitle>
							</CardLabel>
						</CardHeader>
						<CardBody className='d-flex flex-column p-4'>
							<div className='row g-3'>
								{tabsData.map((tab) => (
									<div key={tab.name} className='col-12'>
										<Button
											color='primary'
											className='w-100 p-3'
											isLight={tab.name !== activeTab}
											icon={tab.icon}
											onClick={() => setActiveTab(tab.name)}>
											{tab.name}
										</Button>
									</div>
								))}
							</div>
						</CardBody>
					</Card>
				</div>
				<div className='col-xxl-10 col-xl-9 col-lg-9'>
					<Card stretch>
						<CardHeader>
							<div className='d-flex align-items-center gap-2'>
								<Icon
									icon={activeTabData?.icon || 'Settings'}
									color='primary'
									size='2x'
								/>
								<span>{activeTab}</span>
							</div>
							<CardActions>
								{activeTab === 'Roles' && canWrite && (
									<Button
										color='primary'
										icon='Add'
										onClick={handleOpenAddRole}>
										Add Role
									</Button>
								)}
							</CardActions>
						</CardHeader>
						<CardBody className='table-responsive'>
						{activeTab === 'Roles' && (
							<RolesTabContent
								onEditRole={(role) => {
									setSelectedRole(role);
									setShowRoleModal(true);
								}}
								refreshSignal={rolesRefreshSignal}
							/>
							)}
							{/* {activeTab === 'Permissions' && <PermissionsTabContent />} */}
						</CardBody>
					</Card>
				</div>
			</div>

			<RoleModal
				isOpen={showRoleModal}
				onClose={handleCloseModal}
				onSuccess={handleModalSuccess}
				role={selectedRole}
			/>
		</>
	);
};

export default SettingsWorkspace;