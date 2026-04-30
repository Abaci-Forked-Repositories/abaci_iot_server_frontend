import React, { FC, useState } from 'react';
import { Form } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { authAxios } from '../../../axiosInstance';
import OffCanvasComponent from '../../OffCanvasComponent';
import Card, { CardBody } from '../../bootstrap/Card';
import SaveButton from '../../CustomComponent/Buttons/SaveButton';
import useToasterNotification from '../../../hooks/useToasterNotification';
import Fields from './Fields';

interface AddSensorProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	tableRef: any;
	title: string;
}
const AddUser: FC<AddSensorProps> = ({ isOpen, setIsOpen, tableRef, title }) => {
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const {
		register,
		handleSubmit,
		getValues,
		control,
		formState: { errors },
		watch,
		trigger,
	} = useForm({
		defaultValues: {
			name: '',
			location: '',
			description: '',
		},
	});

	const [waitingForAxios, setwaitingForAxios] = useState(false);
	const [generatedPassword, setGeneratedPassword] = useState('');
	const [emailId, setEmailId] = useState('');
	const [username, setUsername] = useState('');
	const [showPassword, setShowPassword] = useState(false);

	const onSubmit = (data: any) => {
		const payload = {
			first_name: data.first_name,
			last_name: data.last_name,
			mobile_number: data.mobile_number,
			email: data.email,
			staff_id: data.staff_id,
		};
		setwaitingForAxios(true);
		const url = '/api/users/create-user/';
		authAxios
			.post(url, payload)
			.then((res) => {
				setwaitingForAxios(false);
				if (tableRef) {
					tableRef.current.onQueryChange();
				}
				const { user, generated_password } = res.data?.data || {};

				setUsername(user?.username ?? '');
				setEmailId(user?.email ?? payload.email);
				setGeneratedPassword(generated_password ?? '');

				showSuccessNotification(
					res.data?.message ||
					'Success! User created successfully. Credentials have also been emailed to the registered email.',
				);
			})
			.catch((err) => {
				setwaitingForAxios(false);
				showErrorNotification(err);
			});
	};

	return (
		<OffCanvasComponent isOpen={isOpen} placement='end' title={title} setOpen={setIsOpen}>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<Card>
					<CardBody>
						<Fields
							register={register}
							errors={errors}
							getValues={getValues}
							control={control}
							watch={watch}
							trigger={trigger}
						/>
						{generatedPassword && emailId && username ? (
							<div className='col-12 mb-2'>
								<div
									style={{
										backgroundColor: '#d4edda',
										padding: '15px',
										borderRadius: '8px',
										border: '1px solid #c3e6cb',
									}}>

									<div className='mb-2'>
										<label
											style={{
												fontSize: '14px',
												fontWeight: 500,
												color: '#155724',
												marginBottom: '5px',
											}}>
											Username:
										</label>
										<div className='d-flex gap-2'>
											<input
												type='text'
												disabled
												className='form-control'
												style={{ height: '40px' }}
												value={username}
											/>
											<CopyToClipboard
												text={username}
												onCopy={() =>
													showSuccessNotification('Username copied to clipboard')
												}>
												<button type='button' className='btn btn-outline-success btn-sm'>
													Copy
												</button>
											</CopyToClipboard>
										</div>
									</div>
									<div>
										<label
											style={{
												fontSize: '14px',
												fontWeight: 500,
												color: '#155724',
												marginBottom: '5px',
											}}>
											Generated Password:
										</label>
										<div className='d-flex gap-2 align-items-center'>
											<div style={{ position: 'relative', flex: 1 }}>
												<input
													type={showPassword ? 'text' : 'password'}
													disabled
													className='form-control'
													style={{ height: '40px', paddingRight: '40px' }}
													value={generatedPassword}
												/>
												<button
													type='button'
													onClick={() => setShowPassword(!showPassword)}
													style={{
														position: 'absolute',
														right: '10px',
														top: '50%',
														transform: 'translateY(-50%)',
														background: 'none',
														border: 'none',
														cursor: 'pointer',
														color: '#6c757d',
													}}>
													{showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
												</button>
											</div>
											<CopyToClipboard
												text={generatedPassword}
												onCopy={() =>
													showSuccessNotification('Password copied to clipboard')
												}>
												<button type='button' className='btn btn-outline-success btn-sm'>
													Copy
												</button>
											</CopyToClipboard>
										</div>
									</div>
								</div>
							</div>
						) : (
							<div className='row m-0'>
								<div className='col-12 p-3'>
									<SaveButton state={waitingForAxios} />
								</div>
							</div>
						)}
					</CardBody>
				</Card>
			</Form>
		</OffCanvasComponent>
	);
};

export default AddUser;
