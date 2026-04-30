import React, { useContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import Card, { CardBody, CardFooter, CardFooterRight, CardHeader, CardLabel, CardTitle } from '../../components/bootstrap/Card';
import validateEmail from '../../helpers/emailValidator';
import ProfilePicUpload from '../../components/CustomComponent/ProfilePicUpload';
import UserFields from './UserFields';
// import UserFields from '../../components/PageComponents/UserManagement/Details/UserFields';
import AuthContext from '../../contexts/authContext';
import { authAxios } from '../../axiosInstance';
import useToasterNotification from '../../hooks/useToasterNotification';
import SaveIconButton from '../../components/CustomComponent/Buttons/SaveIconButton';

const MyProfile = ({ isAdd = false }) => {
    const [image, setImage] = useState();
    const [waitingForAxios, setWaitingForAxios] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userData, setUserData } = useContext(AuthContext)
    const { showErrorNotification, showSuccessNotification } = useToasterNotification();
    const formik = useFormik({
        initialValues: {
            first_name: '',
            last_name: '',
            personal_contact_number: '',
            office_contact_number: '',
            email: '',
            alternate_email: '',
            staff_id: '',
            designation: '',
            role: '',
            address: ''

        },
        validate: (values) => {
            const errors: any = {};
            const emailError = validateEmail(values.email);
            if (emailError) {
                errors.email = emailError;
            }
            const AlternativeemailError = validateEmail(values.alternate_email);
            if (emailError) {
                errors.alternate_email = AlternativeemailError;
            }
            if (!values.first_name) errors.first_name = '*Required';
            if (!values.email) errors.email = '*Required';
            if (!values.last_name) errors.last_name = '*Required';
            // if (!values.personal_contact_number) errors.personal_contact_number = '*Required';
            // if (!values.office_contact_number) errors.office_contact_number = '*Required';
            // if (!values.staff_id) errors.staff_id = '*Required';
            // if (!values.designation) errors.designation = '*Required';
            // if (!values.role) errors.role = '*Required';
            // if (!values.extension_no) errors.extension_no = '*Required';
            // if (!values.address) errors.address = '*Required';
            return errors;
        },
        onSubmit: (values) => {
            setWaitingForAxios(true)
            const payload = {
                first_name: values?.first_name || '',
                last_name: values?.last_name || '',
                personal_contact_number: values?.personal_contact_number || '',
                office_contact_number: values?.office_contact_number || '',
                email: values?.email || '',
                alternate_email: values?.alternate_email || '',
                party_type: userData?.party_type || '',
            }
            const url = '/api/users/profile/'
            authAxios.patch(url, payload)
                .then((res) => {
                    setWaitingForAxios(false)
                    showSuccessNotification('Profile updated successfully')
                })
                .catch((err) => {
                    setWaitingForAxios(false)

                    showErrorNotification(err)
                })
        },
    });



    useEffect(() => {
        const url = `/api/users/profile/`

        authAxios.get(url)
            .then((res) => {
                formik.resetForm({
                    values: {
                        ...res.data,
                        first_name: res?.data?.user?.first_name || '',
                        last_name: res?.data?.user?.last_name || '',
                        personal_contact_number: res?.data?.user?.mobile_number || '',
                        // office_contact_number: res?.data?.user?.office_contact_number || '',
                        email: res?.data?.user?.email || '',
                        // alternate: res?.data?.user?.alternate || '',
                        // designation: res?.data?.designation?.id|| '',
                        // address: res?.data?.address || '',
                        // role: res?.data?.role?.id || '',
                        // staff_id: res?.data?.staff_id || '',
                    }
                })
                setImage(res?.data?.avatar || null)
            })
            .catch((err) => {
                showErrorNotification(err)

            })
    }, [])

    return (
        <Card stretch borderSize={2}>
            <CardHeader>
                <CardLabel icon='Contacts' iconColor='primary'>
                    <CardTitle tag='div' className='h5'>
                        My Profile
                    </CardTitle>
                </CardLabel>
            </CardHeader>
            <CardBody isScrollable>
                {/* <Card borderSize={2}>
                    <CardBody>
                        <div className='row g-4 align-items-center'>
                            <div className='col-xl-auto'>
                                <ProfilePicUpload setImage={setImage} image={image} isProfile />
                            </div>
                            <div className='col-xl'>
                                <div className='row g-4'>
                                    <div className='col-12'>
                                        <p className='lead text-muted'>
                                            Upload your picture, allows for better visualization, fostering improved communication
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card> */}
                <UserFields
                    formik={formik}
                    waitingForAxios={waitingForAxios}
                    isAdd={false}
                    isProfile
                />
            </CardBody>
            <CardFooter>
                <CardFooterRight>
                    <SaveIconButton waitingForAxios={waitingForAxios} onClickfunc={formik.handleSubmit} isOnline />
                </CardFooterRight>
            </CardFooter>
        </Card>
    )
}

export default MyProfile
