import * as SecureStore from "expo-secure-store";
import { styled } from "nativewind";
import { useEffect } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { useRouter } from "expo-router";

import Stripes from "../src/assets/stripes.svg";
import NLWLogo from "../src/assets/nlw-spacetime-logo.svg";
import { api } from "../src/lib/api";

const StyledStripes = styled(Stripes);

// Endpoint
const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint:
    "https://github.com/settings/connections/applications/3e633bc4f78133538660",
};

export default function App() {
  const router = useRouter();

  const [, response, signInWithGithub] = useAuthRequest(
    {
      clientId: "3e633bc4f78133538660",
      scopes: ["identity"],
      redirectUri: makeRedirectUri({
        scheme: "nlwspacetime",
      }),
    },
    discovery
  );

  const handleGithubOAuthCode = async (code) => {
    const response = await api.post("/register", {
      code,
    });
    const { token } = response.data;

    await SecureStore.setItemAsync("token", token);

    router.push("/memories");
  };

  useEffect(() => {
    // USE THIS IF YOU NEED TO GET YOUR IP_ADDRESS
    // console.log(
    //   "makeRedirectUri",
    //   makeRedirectUri({
    //     scheme: "nlwspacetime",
    //   })
    // );

    if (response?.type === "success") {
      const { code } = response.params;
      handleGithubOAuthCode(code);
    }
  }, [response]);

  return (
    <View className="flex-1 items-center  px-8 py-10">
      <View className="flex-1 items-center justify-center gap-6">
        <NLWLogo />
        <View className="space-y-2">
          <Text className="text-center font-title text-2xl leading-tight text-gray-50">
            Your time capsule
          </Text>
          <Text className="text-center font-body text-base leading-relaxed text-gray-100">
            Collect memorable moments from your journey and share (if you like)
            with the world!
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          className="rounded-full bg-green-500 px-5 py-3"
          onPress={() => signInWithGithub()}
        >
          <Text className="font-alt text-sm uppercase text-black">
            Register Memory
          </Text>
        </TouchableOpacity>
      </View>
      <Text className="text-center font-body text-sm leading-relaxed text-gray-200">
        Made with 💜 in Rocketseat's NLW
      </Text>
    </View>
  );
}
