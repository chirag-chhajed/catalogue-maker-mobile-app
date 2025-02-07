import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export const downloadImagesToCache = async (
  imageUrls: string[],
): Promise<string[]> => {
  try {
    const downloadPromises = imageUrls.map(async (url) => {
      const filename = url.split("/").pop();
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(url, fileUri);

      if (downloadResult.status !== 200) {
        throw new Error(`Failed to download image: ${url}`);
      }

      return downloadResult.uri;
    });

    const localUrls = await Promise.all(downloadPromises);
    return localUrls;
  } catch (error) {
    console.error("Error downloading images:", error);
    throw error;
  }
};

export const downloadImagesToGallery = async (
  imageUrls: string[],
): Promise<void> => {
  try {
    // Request permissions once for all operations
    const { status } = await MediaLibrary.requestPermissionsAsync(true, [
      "photo",
    ]);

    if (status !== "granted") {
      throw new Error("Gallery permission denied");
    }

    // Download all images to cache first
    const cachedImages = await downloadImagesToCache(imageUrls);

    // Create album first if it doesn't exist
    const album = await MediaLibrary.getAlbumAsync("Catalogue Maker");

    // Save all images and collect their assets
    const assets = await Promise.all(
      cachedImages.map(async (imageUri) => {
        return await MediaLibrary.createAssetAsync(imageUri);
      }),
    );

    // Create or add to album
    if (album) {
      // Add all assets to existing album
      await MediaLibrary.addAssetsToAlbumAsync(assets, album, false);
    } else {
      // Create new album with all assets
      await MediaLibrary.createAlbumAsync("Catalogue Maker", assets[0], false);
      const newAlbum = await MediaLibrary.getAlbumAsync("Catalogue Maker");
      if (assets.length > 1) {
        await MediaLibrary.addAssetsToAlbumAsync(
          assets.slice(1),
          newAlbum,
          false,
        );
      }
    }
  } catch (error) {
    console.error("Error downloading images:", error);
    throw error;
  }
};

export const downloadInfoImagesToGallery = async (
  imageUrls: string[],
): Promise<void> => {
  try {
    // Request permissions once for all operations
    const { status } = await MediaLibrary.requestPermissionsAsync(true, [
      "photo",
    ]);

    if (status !== "granted") {
      throw new Error("Gallery permission denied");
    }

    // Create album first if it doesn't exist
    const album = await MediaLibrary.getAlbumAsync("Catalogue Maker");

    // Save all images and collect their assets
    const assets = await Promise.all(
      imageUrls.map(async (imageUri) => {
        return await MediaLibrary.createAssetAsync(imageUri);
      }),
    );

    // Create or add to album
    if (album) {
      // Add all assets to existing album
      await MediaLibrary.addAssetsToAlbumAsync(assets, album, false);
    } else {
      // Create new album with all assets
      await MediaLibrary.createAlbumAsync("Catalogue Maker", assets[0], false);
      const newAlbum = await MediaLibrary.getAlbumAsync("Catalogue Maker");
      if (assets.length > 1) {
        await MediaLibrary.addAssetsToAlbumAsync(
          assets.slice(1),
          newAlbum,
          false,
        );
      }
    }
  } catch (error) {
    console.error("Error downloading images:", error);
    throw error;
  }
};
