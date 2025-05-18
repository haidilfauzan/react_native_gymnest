import {Text, View, Image, TouchableOpacity, FlatList, Button} from "react-native";
import {Link, router, useLocalSearchParams} from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import images from "@/constants/images";
import icons from "@/constants/icons";
import Search from "@/components/Search";
import {Card, FeaturedCard} from "@/components/Cards";
import Filters from "@/components/Filters";
import {useGlobalContext} from "@/lib/global-provider";
import {useAppwrite} from "@/lib/useAppwrite";
import {getGyms, getLatestGyms} from "@/lib/appwrite";
import {useEffect} from "react";
import {it} from "node:test";

export default function Index() {
    const {user} = useGlobalContext();
    const params = useLocalSearchParams<{query?:string; filter?:string;}>();
    const { data: latestGyms, loading: latestGymsLoading} = useAppwrite({
        fn: getLatestGyms,
    });

    const {data: gyms, loading, refetch} = useAppwrite({
        fn: getGyms,
        params:{
            filter: params.filter!,
            query: params.query!,
            limit: 6,
        },
        skip: true
    })

    const handleCardPress = (id:string) => router.push(`/gym/${id}`);

    useEffect(()=>{
        refetch(
            {
                filter: params.filter!,
                query: params.query!,
                limit: 6,
            }
        )
    })
  return (
   <SafeAreaView className="bg-white h-full">
       <FlatList data={gyms}
                 renderItem={({item})=> <Card item={item} onPress={()=> handleCardPress(item.$id)}/>}
                 keyExtractor={(item)=> item.toString()}
                 numColumns={2}
                 contentContainerClassName="pb-32"
                 columnWrapperClassName="flex px-5 gap-5"
                 showsVerticalScrollIndicator={false}
                 ListHeaderComponent={
                     <View className="px-5">
                         <View className="flex flex-row items-center justify-between mt-5">
                             <View className="flex flex-row items-center">
                                 <Image source={{uri:user?.avatar}} className="size-12 rounded-full" />
                                 <View className="flex flex-col items-start mt-2 justify-centee">
                                     <Text className="text-xs font-rubik text-black-100">Good Mornings</Text>
                                     <Text className="text-base fonr-rubik-medium text-black-300">{user?.name}</Text>
                                 </View>
                             </View>
                             <Image source={icons.bell} className="size-6"  />
                         </View>
                         <Search />
                         <View className="my-5">
                             <View className="flex flex-row items-center justify-between">
                                 <Text className="text-xl font-rubik-bold text-black-300">Featured</Text>
                                 <TouchableOpacity>
                                     <Text className="text-base font-rubik-bold text-primary-300">See All</Text>
                                 </TouchableOpacity>

                             </View>
                             <FlatList data={latestGyms}
                                       renderItem={({item}) => <FeaturedCard item={item} onPress={()=> handleCardPress(item.$id)}/>}
                                       keyExtractor={(item)=>item.toString()}
                                       horizontal bounces={false} showsHorizontalScrollIndicator={false} contentContainerClassName="flex gap-5 mt-5"/>
                         </View>
                         <View className="flex flex-row items-center justify-between">
                             <Text className="text-xl font-rubik-bold text-black-300">Recommendation</Text>
                             <TouchableOpacity>
                                 <Text className="text-base font-rubik-bold text-primary-300">View All</Text>
                             </TouchableOpacity>
                         </View>

                         <Filters />



                     </View>

                 }
       />


   </SafeAreaView>
  );
}
