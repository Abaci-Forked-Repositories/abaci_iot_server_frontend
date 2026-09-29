/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Spinner } from 'reactstrap';
import classNames from 'classnames';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody } from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import FormGroup from '../../components/bootstrap/forms/FormGroup';
import Input from '../../components/bootstrap/forms/Input';
import useDarkMode from '../../hooks/useDarkMode';
import AuthContext from '../../contexts/authContext';
import { publicAxios } from '../../axiosInstance';
import validateEmail from '../../helpers/emailValidator';
import { clearAuthSession, getApiErrorMessage, persistAuthSession } from '../../helpers/authSession';
import AbaciLoader from '../../components/AbaciLoader/AbaciLoader';
import useToasterNotification from '../../hooks/useToasterNotification';
import EnterOtpComponent from '../../components/CustomComponent/Fields/EnterOtpComponent';
import showNotification from '../../components/extras/showNotification';
import AnimatedInputs from '../../components/CustomComponent/Fields/AnimatedInputs';
import AnimatedPasswordConfirmation from '../../components/CustomComponent/Fields/AnimatedPasswordConfirmation';
import QueIconLogo from '../../assets/que-icon-logo.svg';
import { login, resetPasswordOnLogin, selfRegister } from '../../api/auth/auth';

const PASSWORD_RE =
	/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/;

const PASSWORD_HINT =
	'Password must be 8–15 characters with uppercase, lowercase, a number, and a special character.';

const AnimatedText = ({ text, className, delay = 0 }) => {
	const words = text.split(' ');
	const container = {
		hidden: { opacity: 0 },
		visible: (i = 1) => ({
			opacity: 1,
			transition: {
				staggerChildren: 0.12,
				delayChildren: 0.04 * i,
				delay: delay,
			},
		}),
	};
	const child = {
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				type: 'spring',
				damping: 12,
				stiffness: 100,
			},
		},
		hidden: {
			opacity: 0,
			y: 20,
			transition: {
				type: 'spring',
				damping: 12,
				stiffness: 100,
			},
		},
	};

	return (
		<motion.div
			key={text}
			className={className}
			variants={container}
			initial='hidden'
			animate='visible'>
			{words.map((word, index) => (
				<motion.span key={index} variants={child} style={{ marginRight: '5px' }}>
					{word}
				</motion.span>
			))}
		</motion.div>
	);
};

AnimatedText.propTypes = {
	text: PropTypes.string.isRequired,
	className: PropTypes.string,
	delay: PropTypes.number,
};

const Login = ({ isSignUp }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { setUser, setUserData, userData } = useContext(AuthContext);
	const { showErrorNotification } = useToasterNotification();
	const { darkModeStatus } = useDarkMode();

	const isRegisterMode =
		isSignUp || location.pathname.endsWith('/register') || location.pathname === '/register';

	// Legacy bookmark: /login?mode=register → /register
	useEffect(() => {
		const params = new URLSearchParams(location.search);
		if (location.pathname.includes('login') && params.get('mode') === 'register') {
			navigate('/register', { replace: true });
		}
	}, [location.pathname, location.search, navigate]);

	const [waitingForAxios, setWaitingForAxios] = useState(false);
	const [isForgotPassword, setIsForgotPassword] = useState(false);
	const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [reset, setReset] = useState(false);
	const [otp, setOtp] = useState([]);
	const [isStacked, setIsStacked] = useState(true);

	useEffect(() => {
		setTimeout(() => {
			setIsStacked(false);
		}, 1000);
	}, []);

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	useEffect(() => {
		if (userData !== null) {
			if (Object.keys(userData).length === 0) {
				setTimeout(() => setIsLoading(false), 1000);
			} else {
				navigate('/');
			}
		} else {
			setTimeout(() => setIsLoading(false), 1000);
			clearAuthSession();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData]);

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			loginUsername: '',
			loginPassword: '',
			newPassword: '',
			confirmPassword: '',
			username: '',
			email: '',
			password: '',
			device_serial: '',
		},
		validate: (values) => {
			const errors = {};

			if (isRegisterMode && !isForgotPassword) {
				if (!values.username?.trim()) {
					errors.username = 'Required';
				} else if (values.username.trim().length < 3) {
					errors.username = 'Username must be at least 3 characters';
				}

				if (!values.email?.trim()) {
					errors.email = 'Required';
				} else {
					const emailError = validateEmail(values.email.trim());
					if (emailError) errors.email = emailError;
				}

				if (!values.password) {
					errors.password = 'Required';
				} else if (!PASSWORD_RE.test(values.password)) {
					errors.password = PASSWORD_HINT;
				}

				if (!values.confirmPassword) {
					errors.confirmPassword = 'Required';
				} else if (values.confirmPassword !== values.password) {
					errors.confirmPassword = 'Passwords do not match';
				}

				if (!values.device_serial?.trim()) {
					errors.device_serial = 'Required';
				}

				return errors;
			}

			const emailError = validateEmail(values.loginUsername);

			if (!values.loginUsername) {
				errors.loginUsername = 'Required';
			}

			if (!isForgotPassword && !values.loginPassword) {
				errors.loginPassword = 'Required';
			}
			if (!isForgotPassword && emailError) {
				errors.loginUsername = emailError;
			}
			if (isForgotPassword && forgotPasswordStep === 1 && emailError) {
				errors.loginUsername = emailError;
			}
			if (isForgotPassword && forgotPasswordStep === 2) {
				const code = (otp || []).join('');
				if (code.length < 6 || (otp || []).some((d) => d === '' || d == null)) {
					errors.otp = 'OTP is required';
				}
			}
			if (forgotPasswordStep === 3) {
				if (!values.newPassword) {
					errors.newPassword = 'Required';
				} else {
					const isOk = PASSWORD_RE.test(values.newPassword);
					if (!isOk) {
						errors.newPassword =
							'The password should contain minimum 8 and maximum 15 characters  with a mix of alphanumeric, at least 1 uppercase letter, and special characters.';
					}
				}

				if (!values.confirmPassword) {
					errors.confirmPassword = 'Required';
				} else if (values.confirmPassword !== values.newPassword) {
					errors.confirmPassword = 'Passwords do not match';
				}
			}
			return errors;
		},
		onSubmit: (values) => {
			if (isForgotPassword) {
				if (forgotPasswordStep === 1) {
					handleForgotPasswordEmail(values);
				} else if (forgotPasswordStep === 2) {
					handleVerifyOTP(values);
				} else if (forgotPasswordStep === 3) {
					handleResetPassword(values);
				} else if (forgotPasswordStep === 4) {
					handleChangePassword(values);
				}
			} else if (isRegisterMode) {
				handleRegister(values);
			} else {
				handleSignin(values);
			}
		},
	});

	const switchAuthMode = (mode) => {
		setIsForgotPassword(false);
		setForgotPasswordStep(1);
		setShowPassword(false);
		setShowConfirmPassword(false);
		formik.resetForm();
		navigate(mode === 'register' ? '/register' : '/login', { replace: true });
	};

	const applyRegisterFieldErrors = (error) => {
		const data = error?.response?.data;
		if (!data || typeof data !== 'object' || Array.isArray(data)) return;

		const fieldMap = {
			username: 'username',
			email: 'email',
			password: 'password',
			device_serial: 'device_serial',
			device_id: 'device_serial',
			deviceId: 'device_serial',
		};

		Object.entries(fieldMap).forEach(([apiKey, formKey]) => {
			const messages = data[apiKey];
			if (Array.isArray(messages) && messages[0]) {
				formik.setFieldError(formKey, String(messages[0]));
				formik.setFieldTouched(formKey, true, false);
			} else if (typeof messages === 'string' && messages) {
				formik.setFieldError(formKey, messages);
				formik.setFieldTouched(formKey, true, false);
			}
		});
	};

	const handleRegister = (values) => {
		setWaitingForAxios(true);

		selfRegister({
			username: values.username.trim(),
			email: values.email.trim(),
			password: values.password,
			device_serial: values.device_serial.trim(),
		})
			.then(() => {
				showNotification(
					'Success',
					'Registration successful. Please log in.',
					'success',
				);
				switchAuthMode('login');
			})
			.catch((error) => {
				applyRegisterFieldErrors(error);
				showErrorNotification(error);
			})
			.finally(() => {
				setWaitingForAxios(false);
			});
	};

	const handleSignin = (values) => {
		setWaitingForAxios(true);

		const request = reset
			? resetPasswordOnLogin({
					current_password: values.loginPassword,
					username: values.loginUsername,
					new_password: values.confirmPassword,
				})
			: login({
					password: values.loginPassword,
					username: values.loginUsername,
				});

		request
			.then((response) => {
				const { access, refresh, user } = response ?? {};

				if (user?.user_status === 'INVITED') {
					setReset(true);
					setForgotPasswordStep(4);
					setIsForgotPassword(true);
					return;
				}

				const username =
					user?.email ?? user?.username ?? values.loginUsername ?? '';

				persistAuthSession({ access, refresh, username });
				setUser(username);
				setUserData(user ?? { username, email: username });
				navigate('/');
			})
			.catch((error) => {
				const status = error.response?.status;
				const serverMessage = getApiErrorMessage(error);

				if (status === 401 || status === 403) {
					if (serverMessage === 'Current password is incorrect') {
						formik.setFieldError('confirmPassword', 'Passwords do not match');
						return;
					}
				}

				formik.setFieldError('loginPassword', serverMessage);
				formik.setFieldError('loginUsername', ' ');
				showErrorNotification(error);
			})
			.finally(() => {
				setWaitingForAxios(false);
			});
	};

	const handleForgotPasswordEmail = (values) => {
		setWaitingForAxios(true);
		publicAxios
			.post('api/users/forgot-password/', {
				username: values.loginUsername,
				action: 'request_otp',
			})
			.then(() => {
				showNotification('Success', 'OTP has been sent to your email address.', 'success');
				setOtp(['', '', '', '', '', '']);
				setForgotPasswordStep(2);
			})
			.catch((error) => {
				showErrorNotification(error);
			})
			.finally(() => {
				setWaitingForAxios(false);
			});
	};

	const handleVerifyOTP = (values) => {
		setWaitingForAxios(true);
		publicAxios
			.get(
				`api/users/forgot-password/?otp_code=${Number(otp.join(''))}&username=${values.loginUsername}`,
			)
			.then((response) => {
				showNotification('Success', response.data.message, 'success');
				setForgotPasswordStep(3);
			})
			.catch((error) => {
				showErrorNotification(error);
			})
			.finally(() => {
				setWaitingForAxios(false);
			});
	};

	const handleResetPassword = (values) => {
		setWaitingForAxios(true);
		publicAxios
			.patch('api/users/forgot-password/', {
				username: values.loginUsername,
				new_password: values.confirmPassword,
				otp_code: Number(otp.join('')),
			})
			.then(() => {
				showNotification('Success', 'Password has been reset successfully', 'success');
				setIsForgotPassword(false);
				setForgotPasswordStep(1);
				formik.resetForm();
				setOtp([]);
			})
			.catch((error) => {
				showErrorNotification(error);
			})
			.finally(() => {
				setWaitingForAxios(false);
			});
	};

	const handleChangePassword = (values) => {
		setWaitingForAxios(true);
		publicAxios
			.post('api/users/forgot-password/', {
				username: values.loginUsername,
			})
			.then(() => {
				showNotification('Success', 'Password has been reset successfully', 'success');
				setIsForgotPassword(false);
				setForgotPasswordStep(1);
				setReset(false);
				formik.resetForm();
			})
			.catch((error) => {
				showErrorNotification(error);
			})
			.finally(() => {
				setWaitingForAxios(false);
			});
	};

	const getForgotPasswordTitle = () => {
		switch (forgotPasswordStep) {
			case 1:
				return 'Enter your email';
			case 2:
				return 'Enter OTP';
			case 3:
				return 'Reset Password';
			case 4:
				return 'Change Password';
			default:
				return 'Forgot Password';
		}
	};

	const getForgotPasswordSubtitle = () => {
		switch (forgotPasswordStep) {
			case 1:
				return 'We will send you an OTP to reset your password';
			case 2:
				return 'Enter the OTP sent to your email';
			case 3:
				return 'Enter your new password and confirm it';
			case 4:
				return 'Enter your new password and confirm it';
			default:
				return '';
		}
	};

	const getInputFields = () => {
		if (isForgotPassword) {
			if (forgotPasswordStep === 1) {
				return [{ label: 'Email', name: 'loginUsername' }];
			} else if (forgotPasswordStep === 3 || forgotPasswordStep === 4) {
				return [
					{ label: 'New Password', name: 'newPassword' },
					{ label: 'Confirm Password', name: 'confirmPassword' },
				];
			}
			return [];
		}
		return [
			{ label: 'Email', name: 'loginUsername' },
			{ label: 'Password', name: 'loginPassword' },
		];
	};

	const getHeaderTitle = () => {
		if (isForgotPassword) return getForgotPasswordTitle();
		if (isRegisterMode) return 'Create Account';
		return 'Welcome to Abaci IOT';
	};

	const getHeaderSubtitle = () => {
		if (isForgotPassword) return getForgotPasswordSubtitle();
		if (isRegisterMode) return 'Register with your device';
		return 'Login to your account!';
	};

	const renderPasswordToggle = (visible, onToggle) => (
		<span
			onClick={onToggle}
			onKeyDown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') onToggle();
			}}
			role='button'
			tabIndex={0}
			style={{
				position: 'absolute',
				top: 14,
				// Match login AnimatedInputs eye position (left of valid/invalid icon)
				right: 34,
				cursor: 'pointer',
				zIndex: 2,
			}}>
			{visible ? <VisibilityOffIcon fontSize='small' /> : <VisibilityIcon fontSize='small' />}
		</span>
	);

	const renderRegisterFields = () => (
		<div className='row g-3'>
			<div className='col-12'>
				<FormGroup id='username' isFloating label='Username'>
					<Input
						autoComplete='username'
						id='username'
						name='username'
						value={formik.values.username}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						isTouched={formik.touched.username}
						invalidFeedback={formik.errors.username}
						disabled={waitingForAxios}
					/>
				</FormGroup>
			</div>
			<div className='col-12'>
				<FormGroup id='email' isFloating label='Email'>
					<Input
						type='email'
						autoComplete='email'
						id='email'
						name='email'
						value={formik.values.email}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						isTouched={formik.touched.email}
						invalidFeedback={formik.errors.email}
						disabled={waitingForAxios}
					/>
				</FormGroup>
			</div>
			<div className='col-12' style={{ position: 'relative' }}>
				<FormGroup id='password' isFloating label='Password'>
					<Input
						type={showPassword ? 'text' : 'password'}
						autoComplete='new-password'
						id='password'
						name='password'
						value={formik.values.password}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						isTouched={formik.touched.password}
						invalidFeedback={formik.errors.password}
						disabled={waitingForAxios}
					/>
				</FormGroup>
				{renderPasswordToggle(showPassword, () => setShowPassword((v) => !v))}
			</div>
			<div className='col-12' style={{ position: 'relative' }}>
				<FormGroup id='confirmPassword' isFloating label='Confirm Password'>
					<Input
						type={showConfirmPassword ? 'text' : 'password'}
						autoComplete='new-password'
						id='confirmPassword'
						name='confirmPassword'
						value={formik.values.confirmPassword}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						isTouched={formik.touched.confirmPassword}
						invalidFeedback={formik.errors.confirmPassword}
						disabled={waitingForAxios}
					/>
				</FormGroup>
				{renderPasswordToggle(showConfirmPassword, () =>
					setShowConfirmPassword((v) => !v),
				)}
			</div>
			<div className='col-12'>
				<FormGroup id='device_serial' isFloating label='Device Serial'>
					<Input
						autoComplete='off'
						id='device_serial'
						name='device_serial'
						value={formik.values.device_serial}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						isTouched={formik.touched.device_serial}
						invalidFeedback={formik.errors.device_serial}
						disabled={waitingForAxios}
					/>
				</FormGroup>
			</div>
		</div>
	);

	if (isLoading) {
		return <AbaciLoader />;
	}

	return (
		<PageWrapper
			isProtected={false}
			style={{
				background:
					'radial-gradient(circle at 15% 20%, rgba(34, 73, 158, 0.28) 0%, transparent 40%), radial-gradient(circle at 85% 20%, rgba(34, 73, 158, 0.28) 0%, transparent 40%), linear-gradient(135deg, #0B1120 0%, #151E33 100%)',
			}}
			title={isRegisterMode ? 'Register' : 'Login'}>
			<Page className='p-0'>
				<div
					className='row h-100 align-items-center justify-content-center'
					style={{
						transition: 'all 0.3s ease-in-out',
						transform: 'translateZ(0)',
						willChange: 'height, transform',
					}}>
					<div
						className='col-xl-4 col-lg-6 col-md-8 shadow-3d-container'
						style={{
							transition: 'all 0.3s ease-in-out',
							transform: 'translateZ(0)',
							willChange: 'height, transform',
						}}>
						<Card
							className='shadow-3d-dark'
							data-tour='login-page'
							style={{ height: 'auto', transition: 'all 0.3s ease-in-out' }}>
							<CardBody className='pt-5 pb-5'>
								<div className='text-center mb-3 '>
									<Link
										to='#'
										className={classNames(
											'text-decoration-none  fw-bold display-2',
											{
												'text-dark': !darkModeStatus,
												'text-light': darkModeStatus,
											},
										)}
										aria-label='ABACI'>
										<img
											src={QueIconLogo}
											alt='Abaci IOT'
											width={160}
											height={130}
											decoding='async'
											style={{
												display: 'inline-block',
												verticalAlign: 'middle',
											}}
										/>
									</Link>
								</div>
								<div
									className={classNames('rounded-3', {
										'bg-l10-dark': !darkModeStatus,
										'bg-dark': darkModeStatus,
									})}
								/>

								<div className='text-center h5 fw-bold mt-3 mb-3'>
									<AnimatedText text={getHeaderTitle()} className='h5 fw-bold' />
								</div>
								<div className='text-center h5 text-muted mb-5 mt-0'>
									<AnimatedText
										text={getHeaderSubtitle()}
										className='h6 text-muted'
										delay={0.5}
									/>
								</div>

								<form
									className='row g-4'
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											formik.handleSubmit();
										}
									}}>
									<div className='col-12'>
										{isForgotPassword ? (
											<>
												{forgotPasswordStep === 1 && (
													<AnimatedInputs
														formik={formik}
														fields={getInputFields()}
														showPassword={showPassword}
														togglePasswordVisibility={
															togglePasswordVisibility
														}
														disbled={waitingForAxios}
														isStacked={false}
													/>
												)}
												{forgotPasswordStep === 2 && (
													<EnterOtpComponent
														waitingForAxios={waitingForAxios}
														otp={otp}
														setOtp={setOtp}
													/>
												)}
												{(forgotPasswordStep === 3 ||
													forgotPasswordStep === 4) && (
													<AnimatedPasswordConfirmation
														formik={formik}
														fields={getInputFields()}
													/>
												)}
											</>
										) : isRegisterMode ? (
											renderRegisterFields()
										) : (
											<AnimatedInputs
												formik={formik}
												fields={getInputFields()}
												showPassword={showPassword}
												togglePasswordVisibility={togglePasswordVisibility}
												disbled={waitingForAxios}
												isStacked={isStacked}
											/>
										)}
									</div>

									<div className='col-12 mt-4'>
										<Button
											color='primary'
											isDisable={waitingForAxios}
											id='login_button'
											className='w-100 py-3 '
											onClick={formik.handleSubmit}>
											{waitingForAxios ? (
												<Spinner size='sm' />
											) : isForgotPassword ? (
												forgotPasswordStep === 1 ? (
													'Continue'
												) : forgotPasswordStep === 2 ? (
													'Verify OTP'
												) : forgotPasswordStep === 3 ? (
													'Reset Password'
												) : (
													'Change Password'
												)
											) : isRegisterMode ? (
												'Register'
											) : (
												'Login'
											)}
										</Button>
									</div>

									{!isForgotPassword && (
										<div className='col-12 mt-3 text-center'>
											{isRegisterMode ? (
												<>
													<span className='text-muted'>
														Already have an account?{' '}
													</span>
													<span
														role='button'
														tabIndex={0}
														className='text-primary'
														style={{
															cursor: 'pointer',
															textDecoration: 'underline',
														}}
														onClick={() => switchAuthMode('login')}
														onKeyDown={(e) => {
															if (e.key === 'Enter' || e.key === ' ') {
																switchAuthMode('login');
															}
														}}>
														Login
													</span>
												</>
											) : (
												<>
													<span className='text-muted'>
														Don&apos;t have an account?{' '}
													</span>
													<span
														role='button'
														tabIndex={0}
														className='text-primary'
														style={{
															cursor: 'pointer',
															textDecoration: 'underline',
														}}
														onClick={() => switchAuthMode('register')}
														onKeyDown={(e) => {
															if (e.key === 'Enter' || e.key === ' ') {
																switchAuthMode('register');
															}
														}}>
														Register
													</span>
												</>
											)}
										</div>
									)}
								</form>
							</CardBody>
						</Card>
					</div>
				</div>
			</Page>
		</PageWrapper>
	);
};
Login.propTypes = {
	isSignUp: PropTypes.bool,
};
Login.defaultProps = {
	isSignUp: false,
};

export default Login;
/* eslint-enable @typescript-eslint/no-use-before-define */
