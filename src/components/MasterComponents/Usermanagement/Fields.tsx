import React, { useEffect, useContext } from 'react';
import { Controller } from 'react-hook-form';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ThemeContext from '../../../contexts/themeContext';
const Fields = ({ register, control, getValues, errors, trigger, edit = false }: any) => {
	const { darkModeStatus } = useContext(ThemeContext);

	return (
		<>
			<div className='col-12 mb-3'>
				<FormGroup label='First Name *'>
					<input
						type='text'
						className={errors?.first_name ? 'form-control is-invalid' : 'form-control'}
						{...register('first_name', {
							required: 'First Name is required',
							onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
								// Trigger validation for the other field
								trigger('first_name');
								return e.target.value;
							},
						})}
					/>
					{errors?.first_name && (
						<span style={{ color: 'red' }}>{errors.first_name.message}</span>
					)}
				</FormGroup>
			</div>
			<div className='col-12 mb-3'>
				<FormGroup label='Last Name *'>
					<input
						type='text'
						className={errors?.last_name ? 'form-control is-invalid' : 'form-control'}
						{...register('last_name', {
							required: 'Last Name is required',
							onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
								// Trigger validation for the other field
								trigger('last_name');
								return e.target.value;
							},
						})}
					/>
					{errors?.last_name && (
						<span style={{ color: 'red' }}>{errors.last_name.message}</span>
					)}
				</FormGroup>
			</div>
			<div className='col-12 mb-3'>
				<FormGroup label='Mobile Number *'>
					<Controller
						control={control}
						name='mobile_number'
						rules={{
							required: 'Mobile No. is required',
							validate: (value) => {
								if (!value) return 'Mobile number is required';
								// Remove country code and spaces for validation
								const cleanNumber = value.replace(/\s+/g, '').replace(/^\+/, '');
								if (cleanNumber.length < 8)
									return 'Please enter a valid phone number';
								if (cleanNumber.length > 15)
									return 'Please enter a valid phone number';
								return true;
							},
						}}
						render={({ field: { ref, ...field } }) => (
							<div className={`phone-input ${errors?.mobile_number ? 'error' : ''}`}>
								<PhoneInput
									{...field}
									inputProps={{
										ref,
										required: true,
									}}
									inputStyle={{
										color: darkModeStatus ? '#f8f9fa' : '#0b0b13',
										width: '100%',
										height: '42px',
										borderRadius: '0 1rem 1rem 0',
										backgroundColor: darkModeStatus ? '#212529' : '#f8f9fa',
										border: errors?.mobile_number
											? '1px solid #dc3545'
											: darkModeStatus
												? '1px solid #333'
												: '1px solid #ccc',
										borderLeft: 'none',
									}}
									buttonStyle={{
										backgroundColor: darkModeStatus ? '#212529' : '#f8f9fa',
										borderRadius: '0rem 0 0 0rem',
										border: errors?.mobile_number
											? '1px solid #dc3545'
											: darkModeStatus
												? '1px solid #333'
												: '1px solid #ccc',
										transition: 'all 0.3s ease',
										cursor: 'pointer',
									}}
									buttonClass='phone-input-button'
									country={'ae'}
									preferredCountries={['ae', 'us', 'gb', 'ca', 'au']}
									enableSearch={true}
									searchPlaceholder='Search countries'
									placeholder='Enter phone number'
								/>
							</div>
						)}
					/>
					{errors?.mobile_number && (
						<span style={{ color: 'red' }}>{errors.mobile_number.message}</span>
					)}
				</FormGroup>
			</div>
			<div className='col-12 mb-3'>
				<FormGroup label='Email *'>
					<input
						disabled={edit}
						type='text'
						className={errors?.email ? 'form-control is-invalid' : 'form-control'}
						{...register('email', {
							required: 'Email ID is required',
							onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
								// Trigger validation for the other field
								trigger('email');
								return e.target.value;
							},
						})}
					/>
					{errors?.email && <span style={{ color: 'red' }}>{errors.email.message}</span>}
				</FormGroup>
			</div>
			<div className='col-12 mb-3'>
				<FormGroup label='Staff ID *'>
					<input
						type='text'
						className={errors?.staff_id ? 'form-control is-invalid' : 'form-control'}
						{...register('staff_id', {
							required: 'Staff ID is required',
							onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
								// Trigger validation for the other field
								trigger('staff_id');
								return e.target.value;
							},
						})}
					/>
					{errors?.staff_id && (
						<span style={{ color: 'red' }}>{errors.staff_id.message}</span>
					)}
				</FormGroup>
			</div>
		</>
	);
};

export default Fields;
