import {View, Text} from 'react-native'
import React from 'react'
import {useLocalSearchParams} from "expo-router";

const Gym = () => {
    const { id } = useLocalSearchParams();
    return (
        <View>
            <Text> GYM {id}</Text>
        </View>
    )
}
    export default Gym
