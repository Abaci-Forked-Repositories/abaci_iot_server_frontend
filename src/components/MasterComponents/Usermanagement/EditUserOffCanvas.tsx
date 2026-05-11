import React, { useState, useEffect, FC } from 'react';
import { Form } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { authAxios } from '../../../axiosInstance';
import OffCanvasComponent from '../../../components/OffCanvasComponent';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import SaveButton from '../../../components/CustomComponent/Buttons/SaveButton';
import useToasterNotification from '../../../hooks/useToasterNotification';
import CustomSpinner from '../../../components/CustomSpinner/CustomSpinner';
import Fields from './Fields';

interface EditSensorProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	tableRef: any;
	title: string;
	id: any;
}

const EditUser: FC<EditSensorProps> = ({ isOpen, setIsOpen, tableRef, id, title }) => {
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const {
		register,
		handleSubmit,
		reset,
		getValues,
		setValue,
		control,
		formState: { errors },
		watch,
		trigger,
	} = useForm();
	const [waitingForAxios, setwaitingForAxios] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [regeneratePassword, setRegeneratePassword] = useState(false);
	const [generatedPassword, setGeneratedPassword] = useState('');
	const [emailId, setEmailId] = useState('');
	const [username, setUsername] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	useEffect(() => {
		if (id) {
			const url = `api/users/${id}/`;
			authAxios
				.get(url)
				.then((res) => {
					setIsLoading(false);
					reset({
						...res.data,
					});
				})
				.catch((err) => {
					setIsLoading(false);
					showErrorNotification(err);
				});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	const onSubmit = (data: any) => {
		setwaitingForAxios(true);
		const url = `api/users/${id}/`;
		const payload = {
			first_name: data.first_name,
			last_name: data.last_name,
			mobile_number: data.mobile_number,
			email: data.email,
			username: data.username,
			staff_id: data.staff_id,
			regenerate_password: regeneratePassword,
		};
		authAxios
			.put(url, payload)
			.then((res) => {
				setwaitingForAxios(false);
				if (tableRef) {
					tableRef.current.onQueryChange();
				}

				const { username, generated_password } = res.data || {};

				if (regeneratePassword && generated_password) {
					setUsername(username ?? data.email);
					setGeneratedPassword(generated_password ?? '');
					showSuccessNotification(
						res.data?.message ||
						'User updated successfully and a new password has been generated.',
					);
				} else {
					setIsOpen(false);
				}
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
						{isLoading ? (
							<CustomSpinner />
						) : (
							<>
								<Fields
									register={register}
									errors={errors}
									getValues={getValues}
									setValue={setValue}
									control={control}
									watch={watch}
									trigger={trigger}
									edit={true}
								/>
								<div className='mb-2'>
									<div className='form-check form-switch'>
										<input
											className='form-check-input'
											type='checkbox'
											id='regeneratePasswordSwitch'
											checked={regeneratePassword}
											onChange={(e) => setRegeneratePassword(e.target.checked)}
											disabled={waitingForAxios}
										/>
										<label
											className='form-check-label'
											htmlFor='regeneratePasswordSwitch'>
											Regenerate password on save
										</label>
									</div>
								</div>
								{generatedPassword && username ? (
									<div className='col-12 mb-2'>
										<div
											style={{
												backgroundColor: '#d4edda',
												padding: '15px',
												borderRadius: '8px',
												border: '1px solid #c3e6cb',
											}}>
											{(username || emailId) && (
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
															value={username || emailId}
														/>
														<CopyToClipboard
															text={username || emailId}
															onCopy={() =>
																showSuccessNotification('Username copied to clipboard')
															}>
															<button
																type='button'
																className='btn btn-outline-success btn-sm'>
																Copy
															</button>
														</CopyToClipboard>
													</div>
												</div>
											)}
											<div>
												<label
													style={{
														fontSize: '14px',
														fontWeight: 500,
														color: '#155724',
														marginBottom: '5px',
													}}>
													New Password:
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
														<button
															type='button'
															className='btn btn-outline-success btn-sm'>
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
							</>
						)}
					</CardBody>
				</Card>
			</Form>
		</OffCanvasComponent>
	);
};

export default EditUser;
