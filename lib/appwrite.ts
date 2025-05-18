import {Account, Avatars, Client, Databases, OAuthProvider, Query} from "react-native-appwrite";
import * as Linking from "expo-linking";
import {openAuthSessionAsync} from "expo-web-browser";

export const  config = {
    platform: 'com.hai.gymnest',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    galleriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_COLLECTION_ID,
    reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
    companiesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_COMPANIES_COLLECTION_ID,
    gymsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_GYMS_COLLECTION_ID,
}

export const client = new Client();

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);

export async function login(){
    try{
        const redirectUri = Linking.createURL("/");
        console.log('Redirect URI:', redirectUri);
        const response = await account.createOAuth2Token(
            OAuthProvider.Google,
            redirectUri
        );
        if(!response) throw new Error("Create OAuth2 token failed");

        const browserResult = await openAuthSessionAsync(
            response.toString(),
            redirectUri,
        )
        if (browserResult.type != 'success')
            throw new Error('Authentication failed');

        const url = new URL(browserResult.url);
        const secret = url.searchParams.get('secret')?.toString();
        const userId = url.searchParams.get('userId')?.toString();

        if(!secret || !userId) throw new Error('Authentication failed');

        const session = await account.createSession(userId, secret);

        if(!session) throw new Error('Authentication failed creating session');
        return true;
    }catch(error){
        console.error(error);
        return false;
    }
}

export async function logout(){
    try {
        await account.deleteSession('current');
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function getCurrentUser() {
    try{
        const response = await account.get();
        if(response.$id){
            const userAvatar = avatar.getInitials(response.name);
            return {
                ...response,
                avatar: userAvatar.toString()
            }
        }
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getLatestGyms(){
    try {
        const result = await databases.listDocuments(
            config.databaseId!,
            config.gymsCollectionId!,
            [Query.orderAsc('$createdAt'), Query.limit(15)])
        return result.documents;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function getGyms({filter, query, limit}: {filter: string, query: string, limit?: number})
{
    try {
    const buildQuery = [Query.orderDesc('$createdAt')];
    if(filter && filter != 'All') {
        buildQuery.push(Query.equal('facilities', filter))

        if(query){
            buildQuery.push(
                Query.or(
                    [
                        Query.search('name', query),
                        Query.search('description', query),
                        Query.search('address', query),
                        Query.search('facilities', query),

                    ]
                )
            )
        }

        if(limit){
            buildQuery.push(Query.limit(limit))
        }

        const result = await databases.listDocuments(
            config.databaseId!,
            config.gymsCollectionId!,
            buildQuery)
        return result.documents;
    }
    } catch (error) {
        console.error(error);
        return [];
    }

}
