import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {dynamicFont} from "../../common/responsive/fontScale";

const OtherSignInUpButton = ({ iconName, signInText }) => {
    return (
        <View>
            <TouchableOpacity style={styles.otherSIgnInButton}>
                <Icon name={iconName} size={20} color="#630A10" style={styles.icon} />
                <Text style={styles.otherSignInText}>{signInText}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default OtherSignInUpButton;

const styles = StyleSheet.create({
    otherSIgnInButton: {
        borderColor: '#630A10',
        marginTop: '3%',
        borderWidth: 2,
        flexDirection: 'row',
        borderRadius: 25,
        paddingVertical: '3%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginRight: '5%',
    },
    otherSignInText: {
        fontSize: dynamicFont(11),
        color: '#630A10',
    },
});
