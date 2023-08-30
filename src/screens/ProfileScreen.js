import React, {useEffect, useState} from 'react';
import {ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import TextInputField from '../components/inputField/TextInputField';
import BottomButton from '../components/buttons/BottomButton';
import {getUserFullDetailsService} from '../services/userProfileService';
import {log} from '../helpers/logs/log';
import {logoutService} from '../services/authService';
import DynamicTopBar from '../components/topBar/DynamicTopBar';
import {SelectedTab} from '../helpers/enums/enums';
import TopHeader from "../components/topHeader/TopHeader";

const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
});

export default function ProfileScreen() {
    const navigation = useNavigation();
    const [userData, setUserData] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const initialValues = {
        email: '',
    };

    const handleSubmit = async (values, actions, {resetForm}) => {
        navigation.navigate('Checkout');
        resetForm();
    };

    const handleLogout = async () => {
        await logoutService();
        navigation.navigate('Initial');
    };

    const fetchUserData = async () => {
        try {
            const result = await getUserFullDetailsService();
            console.log(result);
            setUserData(result);
            setIsLoading(false);
            log('info', 'screen', 'ProfileScreen | result', result, 'ProfileScreen.js');
        } catch (error) {
            setIsLoading(false);
            log('error', 'screen', 'ProfileScreen', error.message, 'ProfileScreen.js');
        }
    };

    useEffect(() => {
        fetchUserData().catch((error) => {
            log('error', 'screen', 'ProfileScreen', error.message, 'ProfileScreen.js');
        });
    }, []);

    const fields = [
        {name: 'code', label: 'Code', placeholder: userData?.code},
        {name: 'contact_no', label: 'Contact', placeholder: userData.contact_no},
    ];

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeAreaContainer}>
                <DynamicTopBar selectedTab={SelectedTab.PROFILE}/>
                <TopHeader headerText="Profile" backButtonPath="Menu"/>
                <View style={styles.bodyContainer}>
                    <View style={styles.fieldHeaderContainer}>
                        <Text style={styles.fieldHeaderContainerText}>Personal Details</Text>
                    </View>
                    <ActivityIndicator size="large" color="#ce6d74" style={styles.activityIndicator}/>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeAreaContainer}>
            <DynamicTopBar selectedTab={SelectedTab.PROFILE}/>
            <TopHeader headerText="Profile" backButtonPath="Menu"/>
            <View style={styles.bodyContainer}>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({values, handleChange, errors, setFieldTouched, touched, handleSubmit}) => (
                        <View style={styles.formikContainer}>
                            <ScrollView style={styles.scrollViewContainer}>
                                <View style={styles.fieldHeaderContainer}>
                                    <Text style={styles.fieldHeaderContainerText}>{userData?.email}</Text>
                                </View>
                                {fields &&
                                    fields.map((field) => (
                                        <TextInputField
                                            key={field.name}
                                            label={field.label}
                                            placeholder={field.placeholder}
                                            placeholderTextColor="#ce6d74"
                                            value={values[field.name]}
                                            onChangeText={handleChange(field.name)}
                                            onBlur={() => setFieldTouched(field.name)}
                                            touched={touched[field.name]}
                                            error={errors[field.name]}
                                            editable={false}
                                        />
                                    ))}
                                <View style={styles.fieldHeaderDetailsContainer}>
                                    <View>
                                        <Text style={styles.profileText}>Total Packets</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.profileText}>{userData?.total_packets}</Text>
                                    </View>
                                </View>
                                <View style={styles.fieldHeaderDetailsContainer}>
                                    <View>
                                        <Text style={styles.profileText}>Balance Packets</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.profileText}>{userData?.balance_packets}</Text>
                                    </View>
                                </View>
                                <View style={styles.fieldHeaderDetailsContainer}>
                                    <View>
                                        <Text style={styles.profileText}>Profile Status</Text>
                                    </View>
                                    <View>
                                        {
                                            userData?.threat_state === false ? (
                                                <View style={styles.roundedIcon}></View>
                                            ) : (
                                                <View style={styles.roundedIconThreat}></View>
                                            )
                                        }
                                    </View>
                                </View>
                                <View style={styles.pointsContainer}>
                                    <View>
                                        <Text style={styles.profileText}>Points you Earned</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.pointsText}>{userData?.points?.toFixed(2)}</Text>
                                    </View>
                                </View>
                            </ScrollView>
                            <BottomButton onPress={handleLogout} buttonText="Logout"/>
                        </View>
                    )}
                </Formik>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeAreaContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    bodyContainer: {
        flex: 10,
    },
    formikContainer: {
        flex: 1,
    },
    scrollViewContainer: {
        marginBottom: 20,
    },
    fieldHeaderContainer: {
        marginHorizontal: "8%",
        marginVertical: 20,
    },
    fieldHeaderContainerText: {
        fontSize: 20,
        color: '#630A10',
        fontWeight: 'bold',
    },
    loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fieldHeaderDetailsContainer: {
        marginHorizontal: "8%",
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileText: {
        fontSize: 18,
        color: '#630A10',
    },
    pointsContainer: {
        backgroundColor: 'rgba(255, 230, 98, 0.58)',
        flexDirection: 'column',
        justifyContent: 'center',
        marginVertical: "10%",
        paddingVertical: "3%",
        marginHorizontal: "8%",
        borderRadius: 10,
        alignItems: 'center',
    },
    pointsText: {
        color: '#630A10',
        fontWeight: 'bold',
        marginTop: 10,
        fontSize: 20,
    },
    roundedIcon: {
        width: 10,
        height: 10,
        borderRadius: 15,
        backgroundColor: '#419d02',
    },
    roundedIconThreat: {
        width: 10,
        height: 10,
        borderRadius: 15,
        backgroundColor: '#9d0221',
    }
});
