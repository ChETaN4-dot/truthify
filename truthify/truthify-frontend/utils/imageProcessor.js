import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

export const prepareImageForOCR = async (uri) => {
    const result = await manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.85, format: SaveFormat.JPEG, base64: true }
    );
    return result.base64;
};
