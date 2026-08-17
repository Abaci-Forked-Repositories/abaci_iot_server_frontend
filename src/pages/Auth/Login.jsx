/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import { Spinner } from 'reactstrap';
import classNames from 'classnames';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import Page from '../../layout/Page/Page';
import Card, { CardBody } from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
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

const LoginHeader = ({ isNewUser }) => {
	if (isNewUser) {
		return (
			<>
				<div className='text-center h1 fw-bold mt-5'>Create Account</div>
				<div className='text-center h4 text-muted mb-5'>Sign up to get started!</div>
			</>
		);
	}
	return (
		<>
			<div className='text-center h5 fw-bold mt-3'>
				Welcome to {import.meta.env.VITE_SITE_NAME}
			</div>
			<div className='text-center h6 text-muted mb-5 mt-0'>Sign in to your account!</div>
		</>
	);
};
LoginHeader.propTypes = {
	isNewUser: PropTypes.bool,
};
LoginHeader.defaultProps = {
	isNewUser: false,
};

const Login = ({ isSignUp }) => {
	const navigate = useNavigate();
	const { setUser, setUserData, refreshProfile } = useContext(AuthContext);
	const { showErrorNotification } = useToasterNotification();
	const { darkModeStatus } = useDarkMode();
	const [singUpStatus] = useState(!!isSignUp);
	const [waitingForAxios, setWaitingForAxios] = useState(false);
	const [isForgotPassword, setIsForgotPassword] = useState(false);
	const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const { userData } = useContext(AuthContext);
	const [showPassword, setShowPassword] = useState(false);
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
		},
		validate: (values) => {
			const errors = {};
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
					const re = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/;
					const isOk = re.test(values.newPassword);
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
			} else {
				handleSignin(values);
			}
		},
	});

	const handleSignin = (values) => {
		setWaitingForAxios(true);
		const url = reset ? 'api/users/password-reset/' : 'api/auth/login/';
		const payload = reset
			? {
				current_password: values.loginPassword,
				username: values.loginUsername,
				new_password: values.confirmPassword,
			}
			: {
				password: values.loginPassword,
				username: values.loginUsername,
			};
		publicAxios
			.post(url, payload)
			.then((response) => {
				const { access, refresh, user } = response.data ?? {};

				if (user?.user_status === 'INVITED') {
					setReset(true);
					setForgotPasswordStep(4);
					setIsForgotPassword(true);
					return;
				}

				persistAuthSession({ access, refresh });
				// Fetch the full profile so page_permission is loaded into context
				// before navigating. Login response does not include page_permission.
				// Returning the promise chains it into .finally() so the spinner
				// stays until the profile (and permissions) are fully loaded.
				return refreshProfile()
					.then(() => navigate('/'))
					.catch(() => navigate('/'));
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
				// formik.setFieldError('loginUsername', errorMessage);
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
				// new_password: values.confirmPassword,
				// current_password: values.loginPassword,
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
				// formik.setFieldError('loginUsername', errorMessage);
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

	const handleForgotPasswordClick = () => {
		setIsForgotPassword(true);
		setForgotPasswordStep(1);
		formik.resetForm();
	};

	const handleBackToLogin = () => {
		setIsForgotPassword(false);
		setForgotPasswordStep(1);
		formik.resetForm();
	};
	const handleUserLoggedInClick = () => {
		navigate('/customer-login');
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
			title={singUpStatus ? 'Sign Up' : 'Login'}
		// className={classNames({
		// 	'bg-dark': !singUpStatus,
		// 	'bg-light': singUpStatus,
		// })}
		>
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
											alt='Queue Management'
											width={160}
											height={130}
											decoding='async'
											style={{ display: 'inline-block', verticalAlign: 'middle' }}
										/>

										{/* <Player
                                            src={Lottie}
                                            autoplay
                                            keepLastFrame
                                            style={{ width: 400, height: 140 }}
                                        /> */}
									</Link>
								</div>
								<div
									className={classNames('rounded-3', {
										'bg-l10-dark': !darkModeStatus,
										'bg-dark': darkModeStatus,
									})}
								/>

								<div className='text-center h5 fw-bold mt-3 mb-3'>
									<AnimatedText
										text={
											isForgotPassword
												? getForgotPasswordTitle()
												: `Welcome to ${import.meta.env.VITE_SITE_NAME}`
										}
										className='h5 fw-bold'
									/>
								</div>
								<div className='text-center h5 text-muted mb-5 mt-0'>
									<AnimatedText
										text={
											isForgotPassword
												? getForgotPasswordSubtitle()
												: 'Login to your account!'
										}
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
									{/* <AnimatedHeightWrapper> */}
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
												{forgotPasswordStep === 3 && (
													<AnimatedPasswordConfirmation
														formik={formik}
														fields={getInputFields()}
													/>
												)}
												{forgotPasswordStep === 4 && (
													<AnimatedPasswordConfirmation
														formik={formik}
														fields={getInputFields()}
													/>
												)}
											</>
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
									{/* {!isForgotPassword && (
										<>
											<div className='col-12 mt-3'>
												<div className='form-check'>
													<input
														type='checkbox'
														id='termsAccepted'
														className={classNames('form-check-input', {
															'is-invalid':
																formik.errors.termsAccepted &&
																formik.touched.termsAccepted,
														})}
														name='termsAccepted'
														checked={formik.values.termsAccepted}
														onChange={formik.handleChange}
														style={{
															border: '1px solid #333',
														}}
													/>
													<label
														htmlFor='termsAccepted'
														className='form-check-label'>

													</label>
													{formik.errors.termsAccepted &&
														formik.touched.termsAccepted && (
															<div className='invalid-feedback'>
																{formik.errors.termsAccepted}
															</div>
														)}
												</div>
											</div>
										</>
									)} */}

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
											) : (
												'Login'
											)}
										</Button>
									</div>

									<div className='col-12 mt-3 text-center'>
										{isForgotPassword ? (
											<u
												className='cursor-pointer text-primary'
												onClick={handleBackToLogin}>
												Back to login
											</u>
										) : (
											<u
												className='cursor-pointer text-primary'
												onClick={handleForgotPasswordClick}>
												Forgot password?
											</u>
										)}
									</div>
									{/* </AnimatedHeightWrapper> */}
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
