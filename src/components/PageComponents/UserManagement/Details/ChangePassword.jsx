/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useState } from 'react';
import { useFormik } from 'formik';
import { Spinner } from 'reactstrap';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

import Card, {
  CardBody,
  CardFooter,
  CardFooterRight,
  CardHeader,
  CardLabel,
  CardTitle,
} from '../../../bootstrap/Card';
import FormGroup from '../../../bootstrap/forms/FormGroup';
import Button from '../../../bootstrap/Button';
import Input from '../../../bootstrap/forms/Input';
import { authAxios } from '../../../../axiosInstance';
import showNotification from '../../../extras/showNotification';
import useToasterNotification from '../../../../hooks/useToasterNotification';

const PasswordVisibilityToggle = ({ visible, onToggle, label }) => (
  <button
    type='button'
    onClick={onToggle}
    style={{
      position: 'absolute',
      right: '12px',
      top: '14px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#6c757d',
      padding: 0,
      lineHeight: 1,
      zIndex: 2,
    }}
    aria-label={visible ? `Hide ${label}` : `Show ${label}`}>
    {visible ? <VisibilityOffIcon fontSize='small' /> : <VisibilityIcon fontSize='small' />}
  </button>
);

const ChangePassword = ({ changePasswordApi, isFormProfile = false }) => {
  const [waitingForAxios, setWaitingForAxios] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showErrorNotification } = useToasterNotification();

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: (values) => {
      const errors = {};
      if (isFormProfile) {
        if (!values.currentPassword) {
          errors.currentPassword = '*Current Password is required';
        }
      }
      if (!values.newPassword) {
        errors.newPassword = '*Password is required';
      } else {
        const re = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/;
        const isOk = re.test(values.newPassword);
        if (!isOk) {
          errors.newPassword =
            '*The password should contain minimum 8 and maximum 15 characters with a mix of alphanumeric, at least 1 uppercase letter, and special characters.';
        }
      }

      if (!values.confirmPassword) {
        errors.confirmPassword = '*Confirm password is required';
      } else if (values.confirmPassword !== values.newPassword) {
        errors.confirmPassword = '*Passwords do not match';
      }

      return errors;
    },
    onSubmit: (values) => {
      changePasswordHandler(values);
    },
  });
  const changePasswordHandler = (data) => {
    setWaitingForAxios(true);

    const payload = isFormProfile
      ? {
          old_password: data.currentPassword,
          password: data.newPassword,
          password2: data.confirmPassword,
        }
      : {
          new_password: data.newPassword,
          confirm_password: data.confirmPassword,
        };
    const request = isFormProfile
      ? authAxios.patch(changePasswordApi, payload)
      : authAxios.post(changePasswordApi, payload);
    request
      .then(() => {
        setWaitingForAxios(false);
        showNotification('Success', 'Your password has been updated !!', 'success');
        formik.resetForm();
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      })
      .catch((error) => {
        setWaitingForAxios(false);
        showErrorNotification(error);
      });
  };

  return (
    <Card borderSize={2} className='prevent-userselect shadow-3d-info'>
      <CardHeader>
        <CardLabel icon={!isFormProfile ? 'LocalPolice' : ''} iconColor='success'>
          <CardTitle tag='div' className='h3'>
            {!isFormProfile ? ' Change Password' : ""}
          </CardTitle>
        </CardLabel>
      </CardHeader>
      <CardBody>
        <form className='row g-4'>
          {isFormProfile ? (
            // Two-row layout
            <>
              <div className='row mb-4'>
                <div className='col-12   mb-2'>
                  <div style={{ position: 'relative' }}>
                    <FormGroup id='currentPassword' label='Current password *' isFloating>
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        className='form-control'
                        style={{ height: '40px', paddingRight: '40px' }}
                        value={formik.values.currentPassword}
                        isTouched={formik.touched.currentPassword}
                        invalidFeedback={formik.errors.currentPassword}
                        isValid={formik.isValid}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </FormGroup>
                    <PasswordVisibilityToggle
                      visible={showCurrentPassword}
                      onToggle={() => setShowCurrentPassword((prev) => !prev)}
                      label='current password'
                    />
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-12 col-md-6 mb-2'>
                  <div style={{ position: 'relative' }}>
                    <FormGroup id='newPassword' label='New password *' isFloating>
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        className='form-control'
                        style={{ height: '40px', paddingRight: '40px' }}
                        value={formik.values.newPassword}
                        isTouched={formik.touched.newPassword}
                        invalidFeedback={formik.errors.newPassword}
                        isValid={formik.isValid}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </FormGroup>
                    <PasswordVisibilityToggle
                      visible={showNewPassword}
                      onToggle={() => setShowNewPassword((prev) => !prev)}
                      label='new password'
                    />
                  </div>
                </div>
                <div className='col-12 col-md-6 mb-2'>
                  <div style={{ position: 'relative' }}>
                    <FormGroup id='confirmPassword' label='Confirm password *' isFloating>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className='form-control'
                        style={{ height: '40px', paddingRight: '40px' }}
                        value={formik.values.confirmPassword}
                        isTouched={formik.touched.confirmPassword}
                        invalidFeedback={formik.errors.confirmPassword}
                        isValid={formik.isValid}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                    </FormGroup>
                    <PasswordVisibilityToggle
                      visible={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword((prev) => !prev)}
                      label='confirm password'
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Single-row layout
            <div className='row'>

              <div className='col-12 col-md-6 mb-2'>
                <div style={{ position: 'relative' }}>
                  <FormGroup id='newPassword' label='New password *' isFloating>
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      className='form-control'
                      style={{ height: '40px', paddingRight: '40px' }}
                      value={formik.values.newPassword}
                      isTouched={formik.touched.newPassword}
                      invalidFeedback={formik.errors.newPassword}
                      isValid={formik.isValid}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </FormGroup>
                  <PasswordVisibilityToggle
                    visible={showNewPassword}
                    onToggle={() => setShowNewPassword((prev) => !prev)}
                    label='new password'
                  />
                </div>
              </div>
              <div className='col-12 col-md-6 mb-2'>
                <div style={{ position: 'relative' }}>
                  <FormGroup id='confirmPassword' label='Confirm password *' isFloating>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className='form-control'
                      style={{ height: '40px', paddingRight: '40px' }}
                      value={formik.values.confirmPassword}
                      isTouched={formik.touched.confirmPassword}
                      invalidFeedback={formik.errors.confirmPassword}
                      isValid={formik.isValid}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </FormGroup>
                  <PasswordVisibilityToggle
                    visible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((prev) => !prev)}
                    label='confirm password'
                  />
                </div>
              </div>
            </div>
          )}
        </form>
      </CardBody>
      <CardFooter>
        <CardFooterRight>
          <Button
            color='primary'
            icon={waitingForAxios ? '' : 'Save'}
            isDisable={waitingForAxios}
            className='mt-2'
            isOutline
            type='submit'
            onClick={formik.handleSubmit}>
            {waitingForAxios ? <Spinner size='sm' /> : 'Save'}
          </Button>
        </CardFooterRight>
      </CardFooter>
    </Card>
  );
};

export default ChangePassword;
/* eslint-enable @typescript-eslint/no-use-before-define */
