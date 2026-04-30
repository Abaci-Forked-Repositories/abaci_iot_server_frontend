import React, { useRef, useState } from 'react';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../layout/SubHeader/SubHeader';
import Page from '../../layout/Page/Page';
import { CardTitle } from 'reactstrap';
import Card, { CardBody } from '../../components/bootstrap/Card';
import UserManagementTableComponent from '../../components/MasterComponents/Usermanagement/UserManagementMainTable';
import AddUser from '../../components/MasterComponents/Usermanagement/AddUserOffCanvas';
import ButtonWithPopover from '../../components/CustomComponent/Buttons/ButtonWithPopover';
import BulkUpload from '../../components/MasterComponents/Usermanagement/BulkUpload';
const index = () => {
	const [addModalShow, setAddModalShow] = useState(false);
	const tableRef = useRef();
	const urlBackup = useRef();
	const [addUploadModalShow, setAddUploadModalShow] = useState(false);

	return (
		<>
			{addModalShow && (
				<AddUser
					isOpen={addModalShow}
					setIsOpen={setAddModalShow}
					tableRef={tableRef}
					title='Add User'
				/>
			)}
			{addUploadModalShow && (
				<BulkUpload
					isOpen={addUploadModalShow}
					setIsOpen={setAddUploadModalShow}
					tableRef={tableRef}
					title='Bulk Upload'
				/>
			)}
			<PageWrapper title='User Mangement'>
				<SubHeader>
					<SubHeaderLeft>
						<CardTitle tag='div' className='h5'>
							User Management
						</CardTitle>
					</SubHeaderLeft>
					<SubHeaderRight>
						<ButtonWithPopover
							addBulkModalShow={setAddUploadModalShow}
							addModalShow={setAddModalShow}
							buttonName='Add User'
						/>
					</SubHeaderRight>
				</SubHeader>
				<Page container='fluid'>
					<Card>
						<CardBody className='table-responsive'>
							<UserManagementTableComponent
								urlBackup={urlBackup}
								tableRef={tableRef}
							/>
						</CardBody>
					</Card>
				</Page>
			</PageWrapper>
		</>
	);
};

export default index;
