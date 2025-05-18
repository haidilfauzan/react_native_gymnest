import { ID } from "react-native-appwrite";
import { databases, config } from "./appwrite";
import {
    companyImages,
    galleryImages,
    gymsImages,
    reviewImages,
} from "./data";

const COLLECTIONS = {
    COMPANY: config.companiesCollectionId,
    REVIEWS: config.reviewsCollectionId,
    GALLERY: config.galleriesCollectionId,
    GYM: config.gymsCollectionId,
};


const facilities = [
    "AC",
    "WIFI",
    "souna",
    "shower",
    "restroom",
    "locker"

];

function getRandomSubset<T>(
    array: T[],
    minItems: number,
    maxItems: number
): T[] {
    if (minItems > maxItems) {
        throw new Error("minItems cannot be greater than maxItems");
    }
    if (minItems < 0 || maxItems > array.length) {
        throw new Error(
            "minItems or maxItems are out of valid range for the array"
        );
    }

    // Generate a random size for the subset within the range [minItems, maxItems]
    const subsetSize =
        Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;

    // Create a copy of the array to avoid modifying the original
    const arrayCopy = [...array];

    // Shuffle the array copy using Fisher-Yates algorithm
    for (let i = arrayCopy.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [arrayCopy[i], arrayCopy[randomIndex]] = [
            arrayCopy[randomIndex],
            arrayCopy[i],
        ];
    }

    // Return the first `subsetSize` elements of the shuffled array
    return arrayCopy.slice(0, subsetSize);
}

async function seed() {
    try {
        // Clear existing data from all collections
        for (const key in COLLECTIONS) {
            const collectionId = COLLECTIONS[key as keyof typeof COLLECTIONS];
            const documents = await databases.listDocuments(
                config.databaseId!,
                collectionId!
            );
            for (const doc of documents.documents) {
                await databases.deleteDocument(
                    config.databaseId!,
                    collectionId!,
                    doc.$id
                );
            }
        }

        console.log("Cleared all existing data.");

        // Seed companies
        const companies = [];
        for (let i = 1; i <= 5; i++) {
            console.log("Cleared all existing data.1");
            const company = await databases.createDocument(
                config.databaseId!,
                COLLECTIONS.COMPANY!,
                ID.unique(),
                {
                    name: `Company ${i}`,
                    email: `Company${i}@example.com`,
                    logo: companyImages[Math.floor(Math.random() * companyImages.length)],
                }
            );
            companies.push(company);
        }
        console.log(`Seeded ${companies.length} companies.`);

        // Seed Reviews
        const reviews = [];
        for (let i = 1; i <= 20; i++) {
            const review = await databases.createDocument(
                config.databaseId!,
                COLLECTIONS.REVIEWS!,
                ID.unique(),
                {
                    name: `Reviewer ${i}`,
                    avatar: reviewImages[Math.floor(Math.random() * reviewImages.length)],
                    review: `This is a review by Reviewer ${i}.`,
                    rating: Math.floor(Math.random() * 5) + 1, // Rating between 1 and 5
                }
            );
            reviews.push(review);
        }
        console.log(`Seeded ${reviews.length} reviews.`);

        // Seed Galleries
        const galleries = [];
        for (const image of galleryImages) {
            const gallery = await databases.createDocument(
                config.databaseId!,
                COLLECTIONS.GALLERY!,
                ID.unique(),
                { image }
            );
            galleries.push(gallery);
        }

        console.log(`Seeded ${galleries.length} galleries.`);

        // Seed gyms
        for (let i = 1; i <= 20; i++) {
            const assignedCompanies = companies[Math.floor(Math.random() * companies.length)];

            const assignedReviews = getRandomSubset(reviews, 5, 7); // 5 to 7 reviews
            const assignedGalleries = getRandomSubset(galleries, 3, 8); // 3 to 8 galleries

            const selectedFacilities = facilities
                .sort(() => 0.5 - Math.random())
                .slice(0, Math.floor(Math.random() * facilities.length) + 1);

            const image =
                gymsImages.length - 1 >= i
                    ? gymsImages[i]
                    : gymsImages[
                        Math.floor(Math.random() * gymsImages.length)
                        ];

            const gym = await databases.createDocument(
                config.databaseId!,
                COLLECTIONS.GYM!,
                ID.unique(),
                {
                    name: `GYM ${i}`,
                    description: `This is the description for GYM ${i}.`,
                    address: `123 Gym Address ${i}`, // ADDED THIS LINE
                    geolocation: `192.168.1.${i}, 192.168.1.${i}`,
                    rating: Math.floor(Math.random() * 5) + 1,
                    facilities: selectedFacilities,
                    image: image,
                    company: assignedCompanies.$id,
                    reviews: assignedReviews.map((review) => review.$id),
                    gallery: assignedGalleries.map((gallery) => gallery.$id),
                }
            );

            console.log(`Seeded property: ${gym.name}`);
        }

        console.log("Data seeding completed.");
    } catch (error) {
        console.error("Error seeding data:", error);
    }
}

export default seed;