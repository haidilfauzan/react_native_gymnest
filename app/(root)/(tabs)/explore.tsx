import {Text, View, Image, TouchableOpacity, FlatList,} from "react-native";
import { router, useLocalSearchParams} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import icons from "@/constants/icons";
import Search from "@/components/Search";
import {Card} from "@/components/Cards";
import Filters from "@/components/Filters";
import {useAppwrite} from "@/lib/useAppwrite";
import {getGyms} from "@/lib/appwrite";
import {useEffect} from "react";

function ActvityIndicator() {
    return null;
}

export default function Explore() {
    const params = useLocalSearchParams<{query?:string; filter?:string;}>();
    const { data: gyms, loading, refetch } = useAppwrite({
        fn: getGyms,
        params: {
            filter: params.filter || 'All', // Default to 'All' if undefined
            query: params.query || '',     // Default to empty string if undefined
            limit: 20,
        },
        // skip: false, // Uncomment this if you want to fetch all initially
    });

    const handleCardPress = (id:string) => router.push(`/gym/${id}`);

    useEffect(()=>{
        refetch(
            {
                filter: params.filter!,
                query: params.query!,
                limit: 20,
            }
        )
    })
    return (
        <SafeAreaView className="bg-white h-full">
            <FlatList data={gyms}
                      renderItem={({item})=> <Card item={item} onPress={()=> handleCardPress(item.$id)}/>}
                      keyExtractor={(item)=> item.$id}
                      numColumns={2}
                      contentContainerClassName="pb-32"
                      columnWrapperClassName="flex px-5 gap-5"
                      showsVerticalScrollIndicator={false}
                // ListEmptyComponent={loading?(<ActvityIndicator size="large" className="text-primary-300 mt-5"  />) :  <NoResults/>}
                      ListHeaderComponent={
                          <View className="px-5">
                              <View className="flex flex-row items-center justify-between mt-5">
                                  <TouchableOpacity
                                      onPress={() => router.back()}
                                      className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
                                  >
                                      <Image source={icons.backArrow} className="size-5" />
                                  </TouchableOpacity>

                                  <Text className="text-base mr-2 text-center font-rubik-medium text-black-300">
                                      Search for Your Ideal GYM
                                  </Text>
                                  <Image source={icons.bell} className="w-6 h-6" />
                              </View>
                              <Search />
                              <View className="mt-5">
                                  <Filters />

                                  <Text className="text-xl font-rubik-bold text-black-300 mt-5">
                                      Found {gyms?.length} Properties
                                  </Text>
                              </View>
                          </View>

                      }
            />


        </SafeAreaView>
    );
}
