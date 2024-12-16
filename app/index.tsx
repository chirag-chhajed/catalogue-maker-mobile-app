import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import { View } from "react-native";
import { useMMKVNumber } from "react-native-mmkv";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useLoginMutation } from "~/store/features/api";
import { changeAccessToken } from "~/store/features/hello";
import {
  useAppDispatch,
  useAppSelector,
  useOrganizationIdSelector,
} from "~/store/hooks";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_CLIENT_ID,
  scopes: ["profile", "email"],
});

export default function App() {
  const dispatch = useAppDispatch();
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
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const { accessToken } = useAppSelector((state) => state.hello);
  const organizationId = useOrganizationIdSelector();

  if (accessToken && organizationId) {
    return <Redirect href="/(protected)/(routes)/catalogue" />;
  }
  if (accessToken && !organizationId) {
    return <Redirect href="/(protected)/(routes)/organization" />;
  }

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient colors={["#d3e3eb", "#eadad2"]} style={{ flex: 1 }}>
        <View className=" flex-1 items-center justify-center">
          <Button
            disabled={isLoading}
            onPress={() => {
              onGoogleButtonPress().then(({ user }) => {
                login({
                  email: user.email,
                  name: user.displayName ?? "aefiowneo",
                })
                  .unwrap()
                  .then((data) => {
                    console.log(data);
                    dispatch(
                      changeAccessToken({ accessToken: data.accessToken }),
                    );
                    router.push("/(protected)/(routes)/organization");
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              });
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
