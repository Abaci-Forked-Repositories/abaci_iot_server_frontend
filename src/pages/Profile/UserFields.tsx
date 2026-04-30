import React, { useEffect, useState } from 'react';
// import FormGroup from '../../../bootstrap/forms/FormGroup';
import Card, { CardBody, CardFooter, CardFooterRight, CardHeader, CardLabel, CardTitle } from '../../components/bootstrap/Card';
import Input from '../../components/bootstrap/forms/Input';
import Button from '../../components/bootstrap/Button';
import { Spinner } from 'reactstrap';
import Select from '../../components/bootstrap/forms/Select';
import { authAxios } from '../../axiosInstance';
import useToasterNotification from '../../hooks/useToasterNotification';
import Option from '../../components/bootstrap/Option';
import FormGroup from '../../components/bootstrap/forms/FormGroup';

const UserFields = ({ formik, waitingForAxios, isAdd, isProfile = false }) => {
    const { showErrorNotification } = useToasterNotification();
    const [userTypes, setUserTypes] = useState([])
    const [designationList, setDesignation] = useState([])
    // useEffect(() => {
    //     if (!isProfile) {
    //         const url = 'api/users/roles/'
    //         authAxios.get(url)
    //             .then((res) => {
    //                 setUserTypes(res.data)
    //             })
    //             .catch((err) => {
    //                 showErrorNotification(err)

    //             })
    //         const urlDes = 'api/users/designations/'
    //         authAxios.get(urlDes)
    //             .then((res) => {
    //                 setDesignation(res.data)

    //             })
    //             .catch((err) => {
    //                 showErrorNotification(err)

    //             })
    //     }

    // }, [isProfile])
    return (
        <Card borderSize={2}>
            <CardHeader>
                <CardLabel icon='Edit' iconColor='warning'>
                    <CardTitle tag='div' className='h5'>
                        Personal Information
                    </CardTitle>
                </CardLabel>
            </CardHeader>
            <CardBody>
                <div className='row g-4'>
                    <div className='col-12 col-md-6'>
                        <FormGroup
                            id='first_name'
                            label='First Name'
                            isFloating>
                            <Input
                                placeholder='First Name'
                                autoComplete='family-name'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.first_name}
                                isValid={formik.isValid}
                                isTouched={formik.touched.first_name}
                                invalidFeedback={formik.errors.first_name}
                            />

                        </FormGroup>
                    </div>
                    <div className='col-12 col-md-6'>
                        <FormGroup
                            id='last_name'
                            label='Last Name'
                            isFloating>
                            <Input
                                placeholder='Last Name'
                                autoComplete='family-name'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.last_name}
                                isValid={formik.isValid}
                                isTouched={formik.touched.last_name}
                                invalidFeedback={formik.errors.last_name}
                            />
                        </FormGroup>
                    </div>
                    <div className='col-lg-6'>
                        <FormGroup
                            id='email'
                            label='Email Address'
                            isFloating>
                            <Input
                                type='email'
                                placeholder='Email Address'
                                autoComplete='email'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                isValid={formik.isValid}
                                isTouched={formik.touched.email}
                                invalidFeedback={
                                    formik.errors.email
                                }
                                disabled={!isAdd}
                            />
                        </FormGroup>
                    </div>


                    {/* <div className='col-12 col-md-6'>
                        <FormGroup
                            id='alternate_email'
                            label='Alternate Email Address'
                            isFloating>
                            <Input
                                type='email'
                                placeholder='Alternate Email Address'
                                autoComplete='alternate_email'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.alternate_email}
                                isValid={formik.isValid}
                                isTouched={formik.touched.alternate_email}
                                invalidFeedback={
                                    formik.errors.alternate_email
                                }

                            />
                        </FormGroup>
                    </div> */}

                    <div className='col-12 col-md-6'>
                        <FormGroup
                            id='personal_contact_number'
                            label='Contact Number'
                            isFloating>
                            <Input
                                placeholder='Personal Contact Number'
                                autoComplete='peronalconatctnumber'
                                type='tel'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.personal_contact_number}
                                isValid={formik.isValid}
                                isTouched={formik.touched.personal_contact_number}
                                invalidFeedback={
                                    formik.errors.personal_contact_number
                                }
                                component="NumberFormat"
                            />
                        </FormGroup>
                    </div>
                    {/* <div className='col-12 col-md-6'>
                        <FormGroup
                            id='office_contact_number'
                            label='Office Contact Number'
                            isFloating>
                            <Input
                                placeholder='Office Contact Number'
                                autoComplete='contactnuber'
                                type='text'
                                component="NumberFormat"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.office_contact_number}
                                isValid={formik.isValid}
                                isTouched={formik.touched.office_contact_number}
                                invalidFeedback={
                                    formik.errors.office_contact_number
                                }
                            />
                        </FormGroup>
                    </div> */}
                    {/* {!isProfile &&

                        <div className='col-lg-6'>
                            <FormGroup
                                id='staff_id'
                                label='Employee ID'
                                isFloating>
                                <Input
                                    placeholder='Employee ID'
                                    autoComplete='staff_id'
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.staff_id}
                                    isValid={!formik.errors.staff_id && formik.touched.staff_id}
                                    isTouched={formik.touched.staff_id}
                                    invalidFeedback={formik.errors.staff_id}
                                // validFeedback='Looks good!'
                                />

                            </FormGroup>
                        </div>
                    } */}
                    {/* <div className='col-lg-6'>
                        <FormGroup
                            id='extension_no'
                            label='Extension No'
                            isFloating>
                            <Input
                                placeholder='Extension No'
                                autoComplete='extension_no'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.extension_no}
                             isValid={!formik.errors.extension_no && formik.touched.extension_no}
                                isTouched={formik.touched.extension_no}
                                invalidFeedback={formik.errors.extension_no}
                            // validFeedback='Looks good!'
                            />

                        </FormGroup>
                    </div> */}
                    {/* <div className='col-lg-6'>
                        <FormGroup
                            id='employee_id'
                            label='Employee ID'
                            isFloating>
                            <Input
                                placeholder='Employee ID'
                                autoComplete='employee_id'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.employee_id}
                                isValid={!formik.errors.employee_id && formik.touched.employee_id}
                                isTouched={formik.touched.employee_id}
                                invalidFeedback={formik.errors.employee_id}
                            // validFeedback='Looks good!'
                            />

                        </FormGroup>
                    </div> */}


                    {/* <div className='col-lg-6'>
                       <FormGroup
                            id="personal_contact_number"
                            label="Personal Contact Number"
                            isFloating
                            >
                            <PhoneInput
                                international
                                defaultCountry="US"
                                placeholder="Personal Contact Number"
                                value={formik.values.personal_contact_number}
                                onChange={(value) => formik.setFieldValue('personal_contact_number', value)}
                                onBlur={() => formik.setFieldTouched('personal_contact_number', true)}
                                // className={`form-control ${
                                // formik.touched.personal_contact_number && formik.errors.personal_contact_number 
                                //     ? 'is-invalid' : ''
                                // } ${
                                // formik.touched.personal_contact_number && !formik.errors.personal_contact_number 
                                //     ? 'is-valid' : ''
                                // }`}
                            />
                            {formik.touched.personal_contact_number && formik.errors.personal_contact_number && (
                                <div className="invalid-feedback">
                                {formik.errors.personal_contact_number}
                                </div>
                            )}
                            </FormGroup>
                    </div> */}






                    {/* {!isProfile &&
                        <>
                            <div className='col-lg-6'>
                                <FormGroup
                                    id='designation'
                                    label='Designation'
                                    isFloating>
                                    <Select
                                        name='designation'
                                        id='designation'  // Add id to match htmlFor
                                        placeholder='Select designation'
                                        ariaLabel='designation'
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.designation}
                                        isTouched={formik.touched.designation}
                                        invalidFeedback={formik.errors.designation}
                                        isValid={!formik.errors.designation && formik.touched.designation}
                                    >

                                        {Array.isArray(designationList) && designationList.map((des) => (
                                            <Option key={des.id} value={des.id}>{des.title}</Option>
                                        ))}

                                    </Select>
                                </FormGroup>
                            </div>
                            <div className='col-lg-6'>
                                <FormGroup
                                    id='role'
                                    label='Role'
                                    isFloating>
                                    <Select
                                        name='role'
                                        id='role'  // Add id to match htmlFor
                                        placeholder='Select Role'
                                        ariaLabel='Role'
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.role}
                                        isTouched={formik.touched.role}
                                        invalidFeedback={formik.errors.role}
                                        isValid={!formik.errors.role && formik.touched.role}
                                    >

                                        {Array.isArray(userTypes) && userTypes.map((user) => (
                                            <Option key={user.id} value={user.id}>{user.name}</Option>
                                        ))}

                                    </Select>
                                </FormGroup>
                            </div>
                        </>} */}


                    {/* <div className='col-lg-6 mb-3'>
                        <FormGroup
                            id='user_type'
                            label='User Type'
                            isFloating>
                            <Select
                                name='user_type'
                                id='user_type'  // Add id to match htmlFor
                                placeholder='Select User Type'
                                ariaLabel='User Type'

                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.user_type}
                                isTouched={formik.touched.user_type}
                                invalidFeedback={formik.errors.user_type}
                                isValid={!formik.errors.user_type && formik.touched.user_type}
                                required
                            >
                             
                            <Option value=''>select</Option>
                              {Array.isArray(userTypes) && userTypes.map((user) => (
                            <Option key={user.id} value={user.id}>{user.name}</Option>
                        ))}
                            </Select>
                        </FormGroup>
                    </div> */}
                    {/* <div className='col-lg-6'>
                       
                        <Textarea
                            id='address'
                            style={{ height: '100px' }}
                            placeholder='Address'
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.address}
                            isValid={!formik.errors.address && formik.touched.address}
                            isTouched={formik.touched.address}
                            invalidFeedback={formik.errors.address}

                        />
                    </div> */}
                </div>
            </CardBody>
            {(!isAdd && !isProfile) &&
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
            }

        </Card>

    );
};

export default UserFields;
