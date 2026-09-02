import React, { useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import ReactSelectComponent from '../../CustomComponent/Select/ReactSelectComponent';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Icon from '../../icon/Icon';
import {
	USER_PASSWORD_POLICY_INLINE_ERROR,
	getUserPasswordRequirements,
	meetsUserPasswordCharacterMix,
	meetsUserPasswordLength,
} from '../../../helpers/userPasswordPolicy';

/** React-select option: label = role name, value = role id */
export type UserRoleSelectOption = {
	label: string;
	value: number;
};

export type ApiUserRole = {
	id: number;
	name?: string;
	description?: string;
};

/**
 * Map a GET user `role` object (or id) to a select option.
 * Optionally pass the fetched `options` list for an exact match;
 * falls back to constructing from the role object's own name field.
 */
export function resolveRoleOption(
	role: unknown,
	options?: UserRoleSelectOption[],
): UserRoleSelectOption | null {
	if (role == null) return null;

	if (typeof role === 'number') {
		return options?.find((o) => o.value === role) ?? null;
	}

	if (typeof role === 'object') {
		const r = role as ApiUserRole & { value?: number };
		const id = r.id ?? r.value;
		if (id == null) return null;
		const fromOptions = options?.find((o) => o.value === id);
		if (fromOptions) return fromOptions;
		const label = r.name ?? '';
		if (!label) return null;
		return { label, value: id };
	}

	return null;
}

interface FieldsProps {
	register: any;
	control: any;
	getValues: any;
	errors: any;
	trigger: any;
	edit?: boolean;
	roleOptions: UserRoleSelectOption[];
	roleOptionsLoading?: boolean;
	disabled?: boolean;
}

const fieldLabelClass = 'form-label text-muted small text-uppercase fw-semibold mb-2';

const passwordInputStyle: React.CSSProperties = {
	paddingRight: '2.75rem',
	backgroundImage: 'none',
};

type PasswordRequirement = {
	id: string;
	label: string;
	met: boolean;
};

const PasswordRequirementsList: React.FC<{
	requirements: PasswordRequirement[];
	highlightUnmet?: boolean;
}> = ({ requirements, highlightUnmet = false }) => (
	<div className='mt-2 rounded-3 border border-secondary border-opacity-25 bg-body p-2 p-md-3'>
		<div className='text-muted small fw-semibold mb-2'>Password requirements</div>
		<ul className='list-unstyled mb-0 d-flex flex-column gap-2'>
			{requirements.map((requirement) => (
				<li
					key={requirement.id}
					className={`d-flex align-items-start gap-2 small w-100 ${
						requirement.met
							? 'text-success'
							: highlightUnmet
								? 'text-danger'
								: 'text-muted'
					}`}>
					<span
						className={[
							'd-inline-flex align-items-center justify-content-center rounded-1 flex-shrink-0 border mt-1',
							requirement.met
								? 'bg-success border-success text-white'
								: highlightUnmet
									? 'border-danger'
									: 'bg-body border-secondary border-opacity-50',
						].join(' ')}
						style={{ width: 16, height: 16 }}>
						{requirement.met ? <Icon icon='Check' size='sm' color='light' /> : null}
					</span>
					<span className='lh-sm flex-grow-1'>{requirement.label}</span>
				</li>
			))}
		</ul>
	</div>
);

interface PasswordFieldProps {
	id: string;
	label: string;
	showPassword: boolean;
	onToggle: () => void;
	error?: { message?: string };
	disabled?: boolean;
	registerProps: Record<string, unknown>;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
	id,
	label,
	showPassword,
	onToggle,
	error,
	disabled,
	registerProps,
}) => (
	<div className='col-md-6'>
		<label className={fieldLabelClass} htmlFor={id}>
			{label}
		</label>
		<div className='position-relative'>
			<input
				id={id}
				type={showPassword ? 'text' : 'password'}
				autoComplete='new-password'
				disabled={disabled}
				className={`form-control rounded-3${error ? ' is-invalid' : ''}`}
				style={passwordInputStyle}
				{...registerProps}
			/>
			<button
				type='button'
				onClick={onToggle}
				className='btn btn-link position-absolute top-50 translate-middle-y text-muted p-2 border-0'
				style={{ right: '0.35rem' }}
				aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
				{showPassword ? (
					<VisibilityIcon fontSize='small' />
				) : (
					<VisibilityOffIcon fontSize='small' />
				)}
			</button>
		</div>
		{error?.message ? <div className='invalid-feedback d-block'>{error.message}</div> : null}
	</div>
);

const Fields = ({
	register,
	control,
	getValues,
	errors,
	trigger,
	edit = false,
	roleOptions,
	roleOptionsLoading = false,
	disabled = false,
}: FieldsProps) => {
	const [showPassword, setShowPassword] = useState(false);
	const [showPassword2, setShowPassword2] = useState(false);
	const showPasswordFields = !edit;
	const passwordValue = useWatch({ control, name: 'password', defaultValue: '' }) ?? '';
	const passwordRequirements = useMemo(
		() => getUserPasswordRequirements(String(passwordValue)),
		[passwordValue],
	);
	const passwordPolicyError =
		errors?.password &&
		errors.password.type !== 'required' &&
		String(passwordValue).length > 0;

	return (
		<div className='row g-3'>
			<div className='col-md-6'>
				<label className={fieldLabelClass} htmlFor='user-first-name'>
					First Name *
				</label>
				<input
					id='user-first-name'
					type='text'
					disabled={disabled}
					className={`form-control rounded-3${errors?.first_name ? ' is-invalid' : ''}`}
					{...register('first_name', {
						required: 'First name is required',
						onChange: () => trigger('first_name'),
					})}
				/>
				{errors?.first_name ? (
					<div className='invalid-feedback d-block'>{errors.first_name.message}</div>
				) : null}
			</div>

			<div className='col-md-6'>
				<label className={fieldLabelClass} htmlFor='user-last-name'>
					Last Name *
				</label>
				<input
					id='user-last-name'
					type='text'
					disabled={disabled}
					className={`form-control rounded-3${errors?.last_name ? ' is-invalid' : ''}`}
					{...register('last_name', {
						required: 'Last name is required',
						onChange: () => trigger('last_name'),
					})}
				/>
				{errors?.last_name ? (
					<div className='invalid-feedback d-block'>{errors.last_name.message}</div>
				) : null}
			</div>

			<div className='col-12'>
				<label className={fieldLabelClass} htmlFor='user-email'>
					Email *
				</label>
				<input
					id='user-email'
					disabled={edit || disabled}
					type='email'
					autoComplete='email'
					className={`form-control rounded-3${errors?.email ? ' is-invalid' : ''}`}
					{...register('email', {
						required: 'Email is required',
						pattern: {
							value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
							message: 'Invalid email address',
						},
						onChange: () => trigger('email'),
					})}
				/>
				{errors?.email ? (
					<div className='invalid-feedback d-block'>{errors.email.message}</div>
				) : null}
			</div>

			<div className='col-12'>
				<ReactSelectComponent
					control={control}
					name='Role *'
					field_name='role'
					getValues={getValues}
					errors={errors}
					options={roleOptions}
					isRequired={true}
					isClearable={false}
					isDisable={disabled}
					placeholder={roleOptionsLoading ? 'Loading roles…' : 'Select role'}
				/>
			</div>

			{showPasswordFields && (
				<>
					<div className='col-md-6'>
						<label className={fieldLabelClass} htmlFor='user-password'>
							Password *
						</label>
						<div className='position-relative'>
							<input
								id='user-password'
								type={showPassword ? 'text' : 'password'}
								autoComplete='new-password'
								disabled={disabled}
								className={`form-control rounded-3${errors?.password ? ' is-invalid' : ''}`}
								style={passwordInputStyle}
								{...register('password', {
									required: 'Password is required',
									validate: {
										length: (value: string) =>
											meetsUserPasswordLength(value) ||
											USER_PASSWORD_POLICY_INLINE_ERROR,
										characterMix: (value: string) =>
											meetsUserPasswordCharacterMix(value) ||
											USER_PASSWORD_POLICY_INLINE_ERROR,
									},
									onChange: () => trigger(['password', 'password2']),
								})}
							/>
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								className='btn btn-link position-absolute top-50 translate-middle-y text-muted p-2 border-0'
								style={{ right: '0.35rem' }}
								aria-label={showPassword ? 'Hide password' : 'Show password'}>
								{showPassword ? (
									<VisibilityIcon fontSize='small' />
								) : (
									<VisibilityOffIcon fontSize='small' />
								)}
							</button>
						</div>
						{errors?.password?.type === 'required' ? (
							<div className='invalid-feedback d-block'>{errors.password.message}</div>
						) : null}
					</div>
					<PasswordField
						id='user-password2'
						label='Confirm password *'
						showPassword={showPassword2}
						onToggle={() => setShowPassword2(!showPassword2)}
						error={errors?.password2}
						disabled={disabled}
						registerProps={register('password2', {
							required: 'Please confirm the password',
							validate: (value: string) =>
								value === getValues('password') || 'Passwords do not match',
							onChange: () => trigger('password2'),
						})}
					/>
					<div className='col-12'>
						<PasswordRequirementsList
							requirements={passwordRequirements}
							highlightUnmet={Boolean(passwordPolicyError)}
						/>
					</div>
				</>
			)}
		</div>
	);
};

export default Fields;
