import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_CLIENT_ID,
  scopes: ["profile", "email"],
});

export default function App() {
  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.signOut();
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const googleSignInResult = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(
      googleSignInResult.data?.idToken,
    );

    // Sign-in the user with the credential
    return await auth().signInWithCredential(googleCredential);
  }
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient colors={["#d3e3eb", "#eadad2"]} style={{ flex: 1 }}>
        <View className=" flex-1 items-center justify-center">
          <Button
            onPress={() => {
              router.push("/(protected)/catalogue/");
            }}
            size="lg"
          >
            <Text>Sign in With Google</Text>
          </Button>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
