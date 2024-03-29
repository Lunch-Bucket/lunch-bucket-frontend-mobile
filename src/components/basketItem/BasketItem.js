import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {AntDesign, Fontisto} from '@expo/vector-icons';
import {addDataToLocalStorage, getDataFromLocalStorage} from '../../helpers/storage/asyncStorage';
import {log} from '../../helpers/logs/log';
import {useNavigation} from '@react-navigation/native';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import {fetchBasket} from '../../services/menuService';
import {useDispatch, useSelector} from "react-redux";
import {setIsEditMenuTrueReducer} from "../../redux/menuSlice";

export default function BasketItem({
                                       venue,
                                       mealName,
                                       mealId,
                                       items,
                                       isSpecial = false,
                                       setIsModalVisible,
                                       isModalVisible,
                                       setBasket,
                                       itemCount,
                                       potion,
                                       selectedMealId,
                                       setSelectedMealId,
                                       totalAmount,
                                       isVeg,
                                       setLoading,
                                       loading,
                                   }) {
    useSelector(state => state.menu.isEditMenu);
    const dispatch = useDispatch();

    const [count, setCount] = useState(itemCount);
    const [onClicked, setOnClicked] = useState(true);
    const navigation = useNavigation();
    const [isSwitchOn, setIsSwitchOn] = useState(potion);

    const toggleSwitch = async () => {
        setIsSwitchOn(!isSwitchOn);
        await updateBasketCount(mealId, count, !isSwitchOn);
    };

    const handleMinusPress = async () => {
        const updatedCount = count !== 0 ? count - 1 : 0;
        setCount(updatedCount);
        setSelectedMealId(mealId);

        if (updatedCount <= 0) {
            setIsModalVisible(true);
        } else {
            await updateBasketCount(mealId, updatedCount, isSwitchOn);
            await fetchBasket(mealId, setCount, setBasket);
        }
    };

    const handlePlusPress = async () => {
        const updatedCount = count + 1;
        setCount(updatedCount);
        await updateBasketCount(mealId, updatedCount, isSwitchOn);
        await fetchBasket(mealId, setCount, setBasket);
    };

    const updateBasketCount = async (mealId, count, newPotionValue) => {
        try {
            let basketItems = await getDataFromLocalStorage('basket');
            basketItems = JSON.parse(basketItems);

            if (basketItems && basketItems.meal && basketItems?.meal?.length > 0) {
                basketItems.meal = basketItems.meal.map((item) => {
                    if (item.id === mealId) {
                        return {
                            ...item,
                            count: count,
                            totalPrice: item.unitPrice * count,
                            potion: newPotionValue,
                        };
                    }
                    return item;
                });
                const jsonValue = JSON.stringify(basketItems);
                await addDataToLocalStorage('basket', jsonValue);

                const basket = await getDataFromLocalStorage('basket');
                setBasket(JSON.parse(basket));
            }
        } catch (error) {
            log('Error :: BasketItem :: updateBasketCount :: ', error.message, 'BasketItem.js');
        }
    };

    const handleEditMealPress = () => {
        dispatch(setIsEditMenuTrueReducer());
        navigation.navigate('Menu', {mealId});
    };

    return (
        <View>
            {isModalVisible && (
                <ConfirmDeleteModal
                    id={selectedMealId}
                    isModalVisible={isModalVisible}
                    setIsModalVisible={setIsModalVisible}
                    setLoading={setLoading}
                    loading={loading}
                    useBasket={true}
                />
            )}
            {onClicked && (
                <TouchableOpacity
                    style={[styles.bucketItemContainer, styles.elevation, styles.shadowProp]}
                    onPress={
                        () => {
                            setOnClicked(false);
                        }}
                >
                    <View style={styles.venueContainer}>
                        <View style={styles.labelTypeContainer}>
                            {
                                isSpecial && (
                                    <Text style={styles.foodTypeText}>Special</Text>
                                )
                            }
                            {
                                !isSpecial && isVeg && (
                                    <Text style={styles.foodTypeText}>Veg</Text>
                                )
                            }
                            {
                                !isSpecial && !isVeg && (
                                    <Text style={styles.foodTypeText}>Non-Veg</Text>
                                )
                            }
                            <Text style={styles.venueText}>{venue}</Text>
                        </View>
                        <Text>Rs. {totalAmount}</Text>
                    </View>
                    <View style={styles.bucketContainer}>
                        <View style={styles.bucketItemNameContainer}>
                            <Text style={styles.bucketItemNameText}>{isSpecial ? mealName : 'Choice Meal'}</Text>
                            <Text style={styles.subMenuBasketItemText}>{items && items[0].type}</Text>
                        </View>
                        <TouchableOpacity style={styles.minusButtonTextContainer} onPress={handleMinusPress}>
                            <Fontisto name="minus-a" size={14} color="black"/>
                        </TouchableOpacity>
                        <View style={styles.countTextContainer}>
                            <Text style={styles.countText}>{itemCount}</Text>
                        </View>
                        <TouchableOpacity style={styles.plusButtonTextContainer} onPress={handlePlusPress}>
                            <Fontisto name="plus-a" size={14} color="black"/>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            )}
            {!onClicked && (
                <View>
                    <TouchableOpacity style={styles.bucketItemExpandContainer} onPress={() => setOnClicked(true)}>
                        <View style={styles.bucketItemNameContainer}>
                            <Text style={styles.bucketItemNameText}>{isSpecial ? mealName : 'Choice Meal'}</Text>
                        </View>
                        <TouchableOpacity style={styles.plusButtonTextContainer} onPress={handleMinusPress}>
                            <Fontisto name="minus-a" size={14} color="black"/>
                        </TouchableOpacity>
                        <View style={styles.countTextContainer}>
                            <Text style={styles.countText}>{itemCount}</Text>
                        </View>
                        <TouchableOpacity style={styles.minusButtonTextContainer} onPress={handlePlusPress}>
                            <Fontisto name="plus-a" size={14} color="black"/>
                        </TouchableOpacity>
                        {!isSpecial && (
                            <View style={styles.editButtonContainer}>
                                <TouchableOpacity onPress={handleEditMealPress} style={styles.editButtonTextContainer}>
                                    <AntDesign name="edit" size={14} color="black"/>
                                </TouchableOpacity>
                            </View>
                        )}
                    </TouchableOpacity>
                    <View style={[styles.itemListContainer, styles.elevation, styles.shadowProp]}>
                        {items &&
                            items.length > 0 &&
                            items.map((item) => (
                                <View key={item.id} style={styles.listItemContainer}>
                                    <Text style={styles.listItemContainerText}>{item.type}</Text>
                                </View>
                            ))}
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    shadowProp: {
        shadowColor: '#171717',
        shadowOffset: {width: -2, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    elevation: {
        elevation: 10,
        shadowColor: '#5b595b',
    },
    bucketItemContainer: {
        backgroundColor: 'rgba(252, 240, 200, 1)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginVertical: 10,
        marginHorizontal: 20,
        borderRadius: 10,
    },
    bucketItemNameContainer: {
        flex: 5,
    },
    bucketItemNameText: {
        fontSize: 18,
    },
    plusButtonTextContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        width: 30,
        height: 30,
        flex: 1,
        borderWidth: 2,
        borderColor: '#fff',
    },
    countTextContainer: {
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        width: 30,
        height: 30,
        marginHorizontal: 10,
    },
    countText: {
        fontSize: 18,
    },
    minusButtonTextContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        width: 30,
        height: 30,
        flex: 1,
        borderWidth: 2,
        borderColor: '#fff',
    },
    editButtonContainer: {
        marginLeft: 20,
    },
    editButtonTextContainer: {
        backgroundColor: 'rgba(99, 10, 16, 0.12)',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40,
        flex: 1,
        borderWidth: 2,
        borderColor: '#fff',
    },
    bucketItemExpandContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(252, 240, 200, 0.3)',
        paddingVertical: 10,
        paddingHorizontal: 40,
        marginVertical: 10,
        alignItems: 'center',
    },
    listItemContainer: {
        marginHorizontal: 40,
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderColor: '#fff',
    },
    listItemContainerText: {
        fontSize: 18,
    },
    itemListContainer: {
        marginBottom: 20,
    },
    switchStyles: {
        paddingRight: "5%",
        flexDirection: 'column',
    },
    switchItemStyles: {
        paddingVertical: 0,
        transform: [{scaleX: .8}, {scaleY: .8}],
    },
    switchTextStyles: {
        textAlign: 'center',
        fontSize: 10,
    },
    subMenuBasketItemText: {
        fontSize: 11,
    },
    venueContainer: {
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        flexDirection: 'row',
    },
    venueText: {
        paddingVertical: "1%",
        paddingHorizontal: "2%",
        borderRadius: 10,
        backgroundColor: 'rgba(169,220,57,0.63)',
        fontSize: 10,
    },
    bucketContainer: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    labelTypeContainer: {
        flexDirection: 'row',
    },
    foodTypeText: {
        paddingVertical: "1%",
        marginRight: "4%",
        paddingHorizontal: "2%",
        borderRadius: 10,
        backgroundColor: 'rgb(250,229,121)',
        fontSize: 10,
    }
});
