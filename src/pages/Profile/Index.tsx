import React, { useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubheaderSeparator } from '../../layout/SubHeader/SubHeader';
import Card, { CardBody, CardFooter, CardFooterLeft, CardHeader, CardLabel, CardSubTitle, CardTitle } from '../../components/bootstrap/Card';
import Page from '../../layout/Page/Page';
import Button from '../../components/bootstrap/Button';
import BackButton from '../../components/CustomComponent/Buttons/BackButton';
import Avatar from '../../components/Avatar';
//@ts-ignore
import ProfilePic from "../../assets/img/Avatar.svg"
import AuthContext from '../../contexts/authContext';
import MyProfile from './MyProfile'
import ChangePassword from './ChangePassword'
import urlMaker from '../../helpers/UrlMaker';
import ProfilePicUpload from '../../components/CustomComponent/ProfilePicUpload';
import Profile from '../../assets/img/Avatar.svg';


const Index = () => {

    const { id } = useParams();
    const dispatch = useDispatch();
    const { userData } = useContext(AuthContext)
    const [activeTab, setActiveTab] = useState<any>("My Profile");
    const [image, setImage] = useState(null);
    const tabsData = [
        { name: 'My Profile', icon: 'Contacts' },
        { name: 'Change Password', icon: 'Lock' },
    ];
    const tabComponents: any = {
        'My Profile': <MyProfile />,
        'Change Password': <ChangePassword />,
    };

    const getAvatarSrc = () => {
        if (userData?.avatar) {
            return urlMaker(userData.avatar, 'avatars');
        }
        if (image) {
            return image;
        }
        return Profile;
    };
    const avatarSrc = getAvatarSrc();
    return (
        <PageWrapper title='Profile'>
            <SubHeader>
                <SubHeaderLeft>
                    <BackButton />
                    <SubheaderSeparator />
                    <Avatar srcSet='' src={avatarSrc} size={32} />
                    <span>
                        <strong>{`${userData?.first_name || ''} ${userData?.last_name || ''}`}</strong>
                    </span>

                </SubHeaderLeft>
            </SubHeader>
            <Page container='fluid'>
                <div className='row h-100'>
                    <div className='col-xxl-3 col-xl-4 col-lg-6'>
                        <Card stretch borderSize={2}>
                            <CardHeader>
                                <CardLabel icon='Person' iconColor='primary'>
                                    <CardTitle tag='div' className='h5'>
                                        Profile Settings
                                    </CardTitle>
                                    <CardSubTitle tag='div' className='h6'>
                                        Personal Information
                                    </CardSubTitle>
                                </CardLabel>
                            </CardHeader>
                            <CardBody className='d-flex flex-column align-items-center p-4 mt-3'>
                                <div className='mb-5'>
                                    <ProfilePicUpload setImage={setImage} image={image} isProfile />
                                </div>
                                <div className='row g-3' >
                                    {tabsData.map((tab) => (
                                        <div key={`${Date.now()}-${Math.random() * 1000}`} className='col-12'>
                                            <Button
                                                color="primary"
                                                className='w-100 p-3 '
                                                isLight={tab.name !== activeTab}
                                                icon={tab.icon}
                                                onClick={() => setActiveTab(tab.name)}>
                                                {tab.name}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>

                        </Card>
                    </div>
                    <div className='col-xxl-9 col-xl-8 col-lg-6' style={{ height: "82vh" }}>
                        {tabComponents[activeTab]}
                    </div>
                </div>
            </Page>
        </PageWrapper>
    );
};

export default Index;