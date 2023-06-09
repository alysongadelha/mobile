import { Image, ScrollView, Text, View } from "react-native";
import { Link, useRouter } from "expo-router";
import Icon from "@expo/vector-icons/Feather";
import NLWLogo from "../src/assets/nlw-spacetime-logo.svg";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { api } from "../src/lib/api";
import dayjs from "dayjs";
import ptBr from "dayjs/locale/pt-br";

interface Memory {
  coverUrl: string;
  excerpt: string;
  id: string;
  createdAt: string;
}

dayjs.locale(ptBr);

const Memories = () => {
  const { bottom, top } = useSafeAreaInsets();
  const router = useRouter();
  const [memories, setMemories] = useState<Memory[]>([]);

  const loadMemories = async () => {
    const token = await SecureStore.getItemAsync("token");
    const response = await api.get("/memories", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setMemories(response?.data);
    console.log(response?.data);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("token");

    router.push("/");
  };

  useEffect(() => {
    loadMemories();
  }, []);

  return (
    <ScrollView
      className="flex-1 px-8"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <View className="mt-4 flex-row items-center justify-between">
        <NLWLogo />
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={signOut}
            className="h-10 w-10 items-center justify-center rounded-full bg-red-500"
          >
            <Icon name="log-out" size={16} color="#000" />
          </TouchableOpacity>
          <Link href="/new" asChild>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <Icon name="plus" size={16} color="#000" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View className="mt-6 space-y-10">
        {memories.map(({ coverUrl, excerpt, id, createdAt }) => (
          <View className="space-y-4" key={id}>
            <View className="flex-row items-center gap-2">
              <View className="h-px w-5 bg-gray-100" />
              <Text className="font-body text-xs text-gray-100">
                {dayjs(createdAt).format("D[ de ]MMMM[, ]YYYY")}
              </Text>
            </View>
            <View className="space-y-4 px-8">
              <Image
                source={{
                  uri: coverUrl,
                }}
                className="aspect-video w-full rounded-lg"
                alt=""
              />
              <Text className="font-body text-base leading-relaxed text-gray-100">
                {excerpt}
              </Text>
              <Link href={`memories/${id}`} asChild>
                <TouchableOpacity className="flex-row items-center gap-2">
                  <Text className="font-body text-sm text-gray-200">
                    Read more
                  </Text>
                  <Icon name="arrow-right" size={16} color="#9e9ea0" />
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default Memories;
