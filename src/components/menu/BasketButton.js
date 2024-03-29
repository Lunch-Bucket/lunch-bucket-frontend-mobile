import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {setMenuBasketService, updateBasketFromId} from '../../services/menuService';
import {useToast} from '../../helpers/toast/Toast';
import {useSelector} from "react-redux";
import useFetchRemainingTimes from "../../services/timeService";
import useMenuHook from "../../services/useMenuHook";

const BasketButton = ({
                          totalCheckedItemsCount,
                          totalSpecialPrice,
                          totalAmount,
                          totalCheckedItems,
                          venue,
                          mealId,
                          isVeg,
                          totalCheckedSpecialItemsCount,
                          totalCheckedSpecialItems,
                          isLunch
                      }) => {
    const navigation = useNavigation();
    const {showToast} = useToast();
    const isEditMenu = useSelector(state => state.menu.isEditMenu);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {getUTCDateTime} = useFetchRemainingTimes();
    const {
        packetLimit,
        checkPacketLimit,
        disableDinnerCheckbox,
        disableLunchCheckbox,
        fetchDisableDinnerCheckbox,
        fetchDisableLunchCheckbox,
    } = useMenuHook();
    useEffect(() => {
        fetchDisableDinnerCheckbox().catch((error) => console.error('Error fetching disable dinner checkbox:', error));
        fetchDisableLunchCheckbox().catch((error) => console.error('Error fetching disable lunch checkbox:', error));

    }, [disableDinnerCheckbox, disableLunchCheckbox]);

    const handleBasketPress = async () => {
        setIsLoading(true);
        if (isButtonDisabled) return;

        console.log("totalCheckedItemsCount", totalCheckedItemsCount);
        console.log("totalCheckedSpecialItemsCount", totalCheckedSpecialItemsCount);

        if (totalCheckedItemsCount <= 0 && totalCheckedSpecialItemsCount <= 0) {
            setIsLoading(false);
            console.log("Basket is empty");
            navigation.navigate('Basket');
            return;
        }

        await fetchDisableLunchCheckbox();
        await fetchDisableDinnerCheckbox();

        const isSpecial = totalCheckedSpecialItemsCount > 0;
        console.log("isSpecial", isSpecial);
        console.log("totalCheckedSpecialItemsCount", totalCheckedSpecialItems);
        const ids = totalCheckedSpecialItems.map(item => item.id);

        if (totalCheckedSpecialItemsCount > 0 || totalCheckedItemsCount > 0) {
            await checkPacketLimit(isLunch, isVeg, isSpecial, ids);
        }

        if ((totalCheckedItemsCount > 0 || totalCheckedSpecialItemsCount > 0) && packetLimit) {
            setIsLoading(false);
            return;
        }

        if (venue === 'Lunch' && disableLunchCheckbox) {
            showToast('error', 'Sorry, Lunch time exceeded.');
            setIsLoading(false);
            return;
        }

        if (venue === 'Dinner' && disableDinnerCheckbox) {
            showToast('error', 'Sorry, Dinner time exceeded.');
            setIsLoading(false);
            return;
        }

        if (isEditMenu) {
            totalCheckedSpecialItemsCount = 0;
        }

        if (totalCheckedItemsCount > 5) {
            showToast('error', 'You can select only 5 dishes.');
            setIsLoading(false);
            return;
        }

        if (totalCheckedSpecialItemsCount === 0 && totalCheckedItemsCount === 0) {
            navigation.navigate('Basket');
            setIsLoading(false);
            return;
        }

        if (totalCheckedSpecialItemsCount > 0 && totalCheckedItemsCount <= 0) {
            // Handle special meals
            const basketItems = totalCheckedSpecialItems && totalCheckedSpecialItems.filter(item => item.checked === true);

            try {
                if (isEditMenu && mealId > 0) {
                    await updateBasketFromId(mealId, basketItems);
                    showToast('success', 'Basket updated successfully');
                    navigation.navigate('Basket');
                } else {
                    await setMenuBasketService(basketItems, totalAmount, venue, isVeg, true, getUTCDateTime);
                    navigation.navigate('Basket');
                }
            } catch (error) {
                console.error('Error updating basket:', error);
            }
        }

        if (totalCheckedSpecialItemsCount <= 0 && (totalCheckedItemsCount > 0 && totalCheckedItemsCount === 5)) {
            // Handle normal meals
            const basketItems = totalCheckedItems && totalCheckedItems.filter(item => item.checked === true);

            try {
                if (isEditMenu && mealId > 0) {
                    await updateBasketFromId(mealId, basketItems);
                    showToast('success', 'Basket updated successfully');
                    navigation.navigate('Basket');

                } else if (totalCheckedItemsCount > 0 && totalCheckedItemsCount === 5) {
                    await setMenuBasketService(basketItems, totalAmount, venue, isVeg, false, getUTCDateTime);
                    navigation.navigate('Basket');
                } else {
                    showToast('error', 'Please select 5 items to proceed.');
                }
            } catch (error) {
                console.error('Error updating basket:', error);
            }
        }

        if (totalCheckedSpecialItemsCount <= 0 && (totalCheckedItemsCount > 0 && totalCheckedItemsCount < 5)) {
            console.log("New");
            showToast('error', 'Please select 5 items to proceed.');
            setIsLoading(false);
        }

        setTimeout(() => {
            setIsButtonDisabled(false);
        }, 1000);

        setIsLoading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            setIsLoading(false);
        }, [])
    );

    return (
        <View style={styles.priceContainer}>
            <TouchableOpacity style={styles.priceContainerLeft} onPress={() => handleBasketPress()}
                              disabled={isLoading}>
                {isLoading ? (
                    <ActivityIndicator size={26} color="#630A10"/>
                ) : (
                    <Text style={styles.priceContainerLeftText}>
                        {!isEditMenu ? (
                            `${(totalCheckedItemsCount <= 0 && totalCheckedSpecialItemsCount <= 0) ? 'View ' : 'Add to '} Basket ${totalCheckedItemsCount > 0 || totalCheckedSpecialItemsCount > 0 ? `(${totalCheckedItemsCount + totalCheckedSpecialItemsCount})` : ''}`
                        ) : (
                            `Update Basket ${totalCheckedItemsCount > 0 || totalCheckedSpecialItemsCount > 0 ? `(${totalCheckedItemsCount + (isEditMenu ? 0 : totalCheckedSpecialItemsCount)})` : ''}`
                        )}
                    </Text>
                )}
            </TouchableOpacity>
            {(totalCheckedItemsCount > 0 || totalCheckedSpecialItemsCount > 0) && (
                <View style={styles.priceContainerRight}>
                    <Text style={styles.priceContainerRightText}>Rs {
                        (totalCheckedItemsCount > 0 ? totalAmount : 0) +
                        (totalCheckedSpecialItemsCount > 0 ? (isEditMenu ? 0 : totalSpecialPrice) : 0)}</Text>
                </View>
            )}
        </View>
    );
};

export default BasketButton;

const styles = StyleSheet.create({
    priceContainer: {
        backgroundColor: 'rgba(255, 230, 98, 1)',
        paddingVertical: 20,
        flexDirection: 'row',
    },
    priceContainerLeft: {
        alignItems: 'center',
        flex: 1,
    },
    priceContainerRight: {
        alignItems: 'center',
        flex: 1,
    },
    priceContainerLeftText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#630A10',
    },
    priceContainerRightText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#630A10',
    },
});
